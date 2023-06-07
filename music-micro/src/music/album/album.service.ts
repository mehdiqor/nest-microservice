import {
  ConflictException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import { AddAlbumDto, UpdateAlbumDto } from './dto';
import {
  MyConflictError,
  MyInternalServerError,
  MyNotFoundError,
} from '../../utils';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    private config: ConfigService,
  ) {}

  async addAlbum(dto: AddAlbumDto) {
    // check exist artist
    try {
      const exist = await this.findAlbum(dto.albumName, null);
      if (exist) throw new ConflictException();
    } catch (e) {
      if (e.status == HttpStatus.CONFLICT)
        return MyConflictError(dto.albumName);
    }

    // add album to artist collection
    const addAlbum = await this.artistModel.updateOne(
      {
        _id: dto.artistId,
      },
      {
        $push: {
          albums: {
            albumName: dto.albumName,
            year: dto.year,
            genre: dto.genre,
          },
        },
      },
    );

    if (addAlbum.modifiedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    const { albums } = await this.artistModel.findOne({
      _id: dto.artistId,
    });

    const data = {
      id: dto.artistId,
      albums,
    };

    const elastic = this.sendToElastic('update.elastic.artist', data);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async updateAlbumById(dto: UpdateAlbumDto) {
    // check exist album
    const findAlbum = await this.findAlbum(null, dto.id);
    if (!findAlbum) return MyNotFoundError(dto.id);
    const { _id: artistId } = findAlbum;

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update album info
    const updatedAlbum = await this.artistModel.updateOne(
      {
        'albums._id': dto.id,
      },
      {
        $set: {
          'albums.$.albumName': dto.albumName,
          'albums.$.year': dto.year,
          'albums.$.genre': dto.genre,
        },
      },
    );

    if (updatedAlbum.modifiedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    const { albums } = await this.artistModel.findById(artistId);

    const data = {
      id: artistId,
      albums,
    };

    const elastic = this.sendToElastic('update.elastic.artist', data);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async removeAlbumById(id: string) {
    // check exist album
    const findAlbum = await this.findAlbum(null, id);

    if (!findAlbum) return MyNotFoundError(id);
    const { _id: artistId } = findAlbum;

    // remove album from DB
    const removedAlbum = await this.artistModel.updateOne(
      {
        'albums._id': id,
      },
      {
        $pull: {
          albums: {
            _id: id,
          },
        },
      },
    );

    if (removedAlbum.modifiedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    const { albums } = await this.artistModel.findById(artistId);

    const data = {
      id: artistId,
      albums,
    };

    const elastic = this.sendToElastic('update.elastic.artist', data);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async findAlbum(albumName?: string, id?: string) {
    if (albumName) {
      const album = await this.artistModel.findOne(
        { 'albums.albumName': albumName },
        { 'albums.$': 1 },
      );
      return album;
    }

    if (id) {
      const album = await this.artistModel.findOne(
        { 'albums._id': id },
        { 'albums.$': 1 },
      );
      return album;
    }
  }

  sendToElastic(address: string, data) {
    const url: string = this.config.get('ELASTIC_URL');
    const queue: string = this.config.get('ELASTIC_QUEUE');

    const redisMicroservice = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue,
      },
    });

    const result = redisMicroservice.send(address, data);
    return result;
  }
}
