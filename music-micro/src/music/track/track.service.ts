import {
  ConflictException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Artist } from 'src/schemas/music.schema';
import { AddTrackDto, UpdateTrackDto } from './dto';
import {
  MyConflictError,
  MyInternalServerError,
  MyNotFoundError,
} from 'src/utils';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
    private config: ConfigService,
  ) {}

  async addTrack(dto: AddTrackDto) {
    try {
      const find = await this.findTrackByName(
        dto.trackName,
        dto.albumName,
      );
      if (find) throw new ConflictException();
    } catch (e) {
      if (e.status == HttpStatus.CONFLICT)
        return MyConflictError('This Track');
    }

    // save tags in array
    if (dto.tags) {
      let tag: any;
      if (!Array.isArray(dto.tags)) {
        tag = dto.tags.split(',');
      }
      dto.tags = tag;
    }

    // add track to DB
    const data = {
      trackName: dto.trackName,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
      fileName: dto.fileName,
      filePath: dto.filePath,
      length: dto.length,
    };

    const track = await this.artistModel.updateOne(
      {
        artistName: dto.artistName,
        'albums.albumName': dto.albumName,
      },
      {
        $push: {
          'albums.$.tracks': data,
        },
      },
    );

    if (track.modifiedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    const { _id, albums } = await this.artistModel.findOne({
      artistName: dto.artistName,
    });

    const elasticData = {
      id: _id,
      albums,
    };

    const elastic = this.sendToElastic(
      'update.elastic.artist',
      elasticData,
    );
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async updateTrack(dto: UpdateTrackDto) {
    // check exist track
    const findTrack = await this.findTrackById(dto.trackId);
    if (!findTrack) return MyNotFoundError(dto.trackId);

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // save tags in array
    if (dto.tags) {
      let tag: any;
      if (!Array.isArray(dto.tags)) {
        tag = dto.tags.split(',');
      }
      dto.tags = tag;
    }

    // update track info
    const data = {
      trackName: dto.trackName,
      tags: dto.tags,
      youtube_link: dto.youtube_link,
    };

    const updatedTrack = await this.artistModel.updateOne(
      {
        'albums.tracks._id': dto.trackId,
      },
      {
        $set: {
          'albums.$.tracks': data,
        },
      },
    );

    if (updatedTrack.modifiedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    const { _id: albumId } = findTrack[0].albums;
    const { _id, albums } = await this.artistModel.findOne(
      { 'albums._id': albumId },
      { 'albums.$': 1 },
    );

    const elasticData = {
      id: _id,
      albums,
    };

    const elastic = this.sendToElastic(
      'update.elastic.artist',
      elasticData,
    );
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async removeTrack(data) {
    // check exist track
    const findTrack = await this.findTrackByName(
      data.trackName,
      data.albumName,
    );
    if (!findTrack) return MyNotFoundError('Track');
    const { fileName } = findTrack;

    // remove track from DB
    const removedTrack = await this.artistModel.updateOne(
      {
        'albums.tracks.trackName': data.trackName,
      },
      {
        $pull: {
          'albums.$.tracks': {
            trackName: data.trackName,
          },
        },
      },
    );

    if (removedTrack.modifiedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    const { _id, albums } = await this.artistModel.findOne(
      { 'albums.albumName': data.albumName },
      { 'albums.$': 1 },
    );

    const elasticData = {
      id: _id,
      albums,
    };

    const elastic = this.sendToElastic(
      'update.elastic.artist',
      elasticData,
    );
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async findTrackById(id: string) {
    const findTrack = await this.artistModel.aggregate([
      {
        $unwind: '$albums',
      },
      {
        $unwind: '$albums.tracks',
      },
      {
        $match: {
          'albums.tracks._id': {
            $eq: new mongoose.Types.ObjectId(id),
          },
        },
      },
    ]);
    return findTrack;
  }

  async findTrackByName(trackName: string, albumName: string) {
    const artist = await this.artistModel.findOne({
      'albums.tracks.trackName': trackName,
    });

    const album = artist.albums.find((t) => t.albumName == albumName);
    const track = album.tracks.find((t) => t.trackName === trackName);

    return track;
  }

  getTime(seconds: number): string {
    let total: number = Math.round(seconds) / 60;
    let [minutes, percent]: string[] = String(total).split('.');
    let second: string = Math.round((Number(percent) * 60) / 100)
      .toString()
      .substring(0, 2);
    let hour: number = 0;
    if (Number(minutes) > 60) {
      total = Number(minutes) / 60;
      let [h1, percent] = String(total).split('.');
      hour = Number(h1);
      minutes = Math.round((Number(percent) * 60) / 100)
        .toString()
        .substring(0, 2);
    }
    if (String(hour).length == 1) hour = Number(`0${hour}`);
    if (String(minutes).length == 1) minutes = String(`0${minutes}`);
    if (String(second).length == 1) second = String(`0${second}`);
    return hour + ':' + minutes + ':' + second;
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
