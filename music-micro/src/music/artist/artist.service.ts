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

@Injectable()
export class ArtistService {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<Artist>,
  ) {}

  async addArtist(dto: AddArtistDto) {
    // check exist artist
    try {
      const exist = await this.findArtist(dto.artistName, null);
      if (exist) throw new ConflictException();
    } catch (e) {
      if (e.status == 409) return MyConflictError;
    }

    // create artist and save in DB
    const artist = await this.artistModel.create({
      artistName: dto.artistName,
    });

    if (!artist) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    // this.eventEmitter.emit('add.artist', artist);

    return artist;
  }

  async updateArtistById(dto: UpdateArtistDto) {
    // check exist artist
    const findArtist = await this.findArtist(null, dto.id);
    if (!findArtist) return MyNotFoundError;

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update artist info
    const updatedArtist = await this.artistModel.updateOne(
      { _id: dto.id },
      {
        artistName: dto.artistName,
      },
    );

    if (updatedArtist.modifiedCount == 0)
      return MyInternalServerError;

    // send data with event emitter to elasticsearch
    // const data = {
    //   id,
    //   artistName: dto.artistName,
    // };
    // this.eventEmitter.emit('edit.artist', data);

    return {
      msg: 'artist info updated successfully',
      updated: updatedArtist.modifiedCount,
    };
  }

  async removeArtistByName(artistName: string) {
    // check exist artist
    const findArtist = await this.findArtist(artistName, null);
    if (!findArtist) return MyNotFoundError;
    const { _id } = findArtist;

    // remove artist from DB
    const deletedArtist = await this.artistModel.deleteOne({
      artistName,
    });

    if (deletedArtist.deletedCount == 0) return MyInternalServerError;

    // send data with event emitter to elasticsearch
    // this.eventEmitter.emit('remove.artist', _id);

    return {
      msg: 'artist removed successfully',
      removed: deletedArtist.deletedCount,
    };
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
}
