import {
  ConflictException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Director } from 'src/schemas/film.schema';
import { AddMovieDto, UpdateMovieDto } from './dto';
import {
  MyConflictError,
  MyInternalServerError,
  MyNotFoundError,
} from 'src/utils';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Director.name)
    private directorModel: Model<Director>,
  ) {}

  async addMovie(dto: AddMovieDto) {
    // check exist movie
    try {
      const existMovie = await this.findMovie(dto.title, null);
      if (existMovie) throw new ConflictException();
    } catch (e) {
      if (e.status == HttpStatus.CONFLICT) return MyConflictError;
    }

    // add to db
    const data = {
      title: dto.title,
      year: dto.year,
      genre: dto.genre,
      link: dto.link,
      //   imageName: file.filename,
      //   imagePath,
    };

    const movie = await this.directorModel.updateOne(
      { name: dto.directorName },
      {
        $push: {
          movies: {
            ...data,
          },
        },
      },
    );

    if (movie.modifiedCount == 0) return MyInternalServerError;

    // send data to elastic
    const { _id, movies } = await this.directorModel.findOne({
      name: dto.directorName,
    });

    const elasticData = {
      id: _id,
      movies,
    };

    // this.eventEmitter.emit('update.director', elasticData);

    return {
      msg: 'movie added successfully',
      add: movie.modifiedCount,
    };
  }

  async updateMovie(dto: UpdateMovieDto) {
    // check exist movie
    const findMovie = await this.findMovie(null, dto.id);
    if (!findMovie) return MyNotFoundError;
    const { _id: directorId } = findMovie;

    const data = {
      title: dto.title,
      year: dto.year,
      genre: dto.genre,
      link: dto.link,
    };

    // delete empty data
    Object.keys(data).forEach((key) => {
      if (!data[key]) delete data[key];
    });

    // update movie
    const updatedMovie = await this.directorModel.updateOne(
      { 'movies._id': dto.id },
      {
        $set: {
          movies: {
            ...data,
          },
        },
      },
    );

    if (updatedMovie.modifiedCount == 0) return MyInternalServerError;

    // send data to elastic
    const { movies } = await this.directorModel.findById(directorId);

    const elasticData = {
      id: directorId,
      movies,
    };
    // this.eventEmitter.emit('update.director', elasticData);

    return {
      msg: 'movie info updated successfully',
      updated: updatedMovie.modifiedCount,
    };
  }

  async removeMovie(name: string, title: string) {
    // check exist movie
    const findMovie = await this.findMovie(title, null);
    if (!findMovie) return MyNotFoundError;

    // remove from db
    const removedMovie = await this.directorModel.updateOne(
      { 'movies.title': title },
      {
        $pull: {
          movies: {
            title,
          },
        },
      },
    );

    if (removedMovie.modifiedCount == 0) return MyInternalServerError;

    // send data to elastic
    const { _id, movies } = await this.directorModel.findOne({
      name,
    });

    const elasticData = {
      id: _id,
      movies,
    };

    // this.eventEmitter.emit('update.director', elasticData);

    return {
      msg: 'movie removed successfully',
      removed: removedMovie.modifiedCount,
    };
  }

  async findMovie(title?: string, id?: string) {
    if (title) {
      const movie = await this.directorModel.findOne(
        { 'movies.title': title },
        { 'movies.$': 1 },
      );
      return movie;
    }
    if (id) {
      const movie = await this.directorModel.findOne({
        'movies._id': id,
      });
      return movie;
    }
  }
}
