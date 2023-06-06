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
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Director.name)
    private directorModel: Model<Director>,
    private config: ConfigService,
  ) {}

  async addMovie(dto: AddMovieDto) {
    // check exist director
    const existDirector = await this.findDirector(dto.directorName);
    if (!existDirector) return MyNotFoundError(dto.directorName);

    // check exist movie
    try {
      const existMovie = await this.findMovie(dto.title, null);
      if (existMovie) throw new ConflictException();
    } catch (e) {
      if (e.status == HttpStatus.CONFLICT)
        return MyConflictError(dto.title);
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

    const elastic = this.sendToElastic(elasticData);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async updateMovie(dto: UpdateMovieDto) {
    // check exist movie
    const findMovie = await this.findMovie(null, dto.id);
    if (!findMovie) return MyNotFoundError(dto.id);
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
          'movies.$._id': dto.id,
          'movies.$.title': dto.title,
          'movies.$.year': dto.year,
          'movies.$.genre': dto.genre,
          'movies.$.link': dto.link,
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

    const elastic = this.sendToElastic(elasticData);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async removeMovie(data: any) {
    const { name, title } = data;

    // check exist director
    const existDirector = await this.findDirector(name);
    if (!existDirector) return MyNotFoundError(name);

    // check exist movie
    const findMovie = await this.findMovie(title, null);
    if (!findMovie) return MyNotFoundError(title);

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

    const elastic = this.sendToElastic(elasticData);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
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

  async findDirector(name: string) {
    const director = await this.directorModel.findOne({ name });
    return director;
  }

  sendToElastic(data: any) {
    const address = 'update.elastic.director';

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
