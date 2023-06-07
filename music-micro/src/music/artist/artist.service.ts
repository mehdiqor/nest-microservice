import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import { AddArtistDto, UpdateArtistDto } from './dto';
import {
  MyConflictError,
  MyInternalServerError,
  MyNotFoundError,
} from 'src/utils';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class ArtistService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    private config: ConfigService,
  ) {}

  async addArtist(dto: AddArtistDto) {
    // check exist artist
    try {
      const exist = await this.findArtist(dto.artistName, null);
      if (exist) throw new ConflictException();
    } catch (e) {
      if (e.status == 409) return MyConflictError(dto.artistName);
    }

    // create artist and save in DB
    const artist = await this.artistModel.create({
      artistName: dto.artistName,
    });

    if (!artist) return MyInternalServerError('DataBase');

    // send data with event emitter to elasticsearch
    const elastic = this.sendToElastic('add.elastic.artist', artist);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async updateArtistById(dto: UpdateArtistDto) {
    // check exist artist
    const findArtist = await this.findArtist(null, dto.id);
    if (!findArtist) return MyNotFoundError(dto.id);

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update artist info
    const updatedArtist = await this.artistModel.updateOne(
      { _id: dto.id },
      {
        $set: {
          artistName: dto.artistName,
        },
      },
    );

    if (updatedArtist.modifiedCount == 0)
      return MyInternalServerError('DataBase');

    // send data with event emitter to elasticsearch
    const data = {
      id: dto.id,
      artistName: dto.artistName,
    };
    const elastic = this.sendToElastic('edit.elastic.artist', data);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async removeArtistByName(artistName: string) {
    // check exist artist
    const findArtist = await this.findArtist(artistName, null);
    if (!findArtist) return MyNotFoundError(artistName);
    const { _id } = findArtist;

    // remove artist from DB
    const deletedArtist = await this.artistModel.deleteOne({
      artistName,
    });

    if (deletedArtist.deletedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    const elastic = this.sendToElastic('remove.elastic.artist', _id);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async findArtist(artistName?: string, id?: string) {
    if (artistName) {
      const artist = await this.artistModel.findOne({
        artistName,
      });
      return artist;
    }
    if (id) {
      const artist = await this.artistModel.findById(id);
      return artist;
    }
  }

  async getAllData(message: string) {
    if (message == 'ADMIN') {
      const musicsData = await this.artistModel.find();
      return musicsData;
    }
    return null;
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
