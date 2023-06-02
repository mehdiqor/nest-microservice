import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Director } from 'src/schemas/film.schema';
import { AddDirectorDto, UpdateDirectorDto } from './dto';
import {
  MyConflictError,
  MyInternalServerError,
  MyNotFoundError,
} from 'src/utils';

@Injectable()
export class DirectorService {
  constructor(
    @InjectModel(Director.name)
    private directorModel: Model<Director>,
  ) {}

  async addDirector(dto: AddDirectorDto) {
    // check exist director
    try {
      const existDirector = await this.findDirector(dto.name, null);
      if (existDirector) throw new ConflictException();
    } catch (e) {
      if (e.status == HttpStatus.CONFLICT) return MyConflictError;
    }

    // add to db
    const director = await this.directorModel.create({
      name: dto.name,
    });

    if (!director) return MyInternalServerError;

    // send data to elastic
    // this.eventEmitter.emit('add.director', director);

    return director;
  }

  async updateDirector(dto: UpdateDirectorDto) {
    // check exist director
    const findDirector = await this.findDirector(null, dto.id);
    if (!findDirector) return MyNotFoundError;

    // delete empty data
    Object.keys(dto).forEach((key) => {
      if (!dto[key]) delete dto[key];
    });

    // update director
    const updatedDirector = await this.directorModel.updateOne(
      { _id: dto.id },
      { name: dto.name },
    );

    if (updatedDirector.modifiedCount == 0)
      return MyInternalServerError;

    // send data to elastic
    const data = {
      id: dto.id,
      name: dto.name,
    };
    // this.eventEmitter.emit('edit.director', data);

    return {
      msg: 'director info updated successfully',
      updated: updatedDirector.modifiedCount,
    };
  }

  async removeDirector(id: string) {
    // check exist director
    const findDirector = await this.findDirector(null, id);
    if (!findDirector) return MyNotFoundError;

    // delete from db
    const removedDirector = await this.directorModel.deleteOne({
      _id: id,
    });

    if (removedDirector.deletedCount == 0)
      return MyInternalServerError;

    // send data to elastic
    // this.eventEmitter.emit('remove.director', id);

    return {
      msg: 'director removed successfully',
      removed: removedDirector.deletedCount,
    };
  }

  async findDirector(name?: string, id?: string) {
    if (name) {
      const director = await this.directorModel.findOne({
        name,
      });
      return director;
    }
    if (id) {
      const director = await this.directorModel.findById(id);
      return director;
    }
  }
}
