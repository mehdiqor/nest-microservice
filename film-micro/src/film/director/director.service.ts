import {
  ConflictException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Director } from 'src/schemas/film.schema';
import { AddDirectorDto, UpdateDirectorDto } from './dto';
import {
  MyConflictError,
  MyInternalServerError,
  MyNotFoundError,
} from 'src/utils';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DirectorService {
  constructor(
    @InjectModel(Director.name)
    private directorModel: Model<Director>,
    private config: ConfigService,
  ) {}

  async addDirector(dto: AddDirectorDto) {
    // check exist director
    try {
      const existDirector = await this.findDirector(dto.name, null);
      if (existDirector) throw new ConflictException();
    } catch (e) {
      if (e.status == HttpStatus.CONFLICT)
        return MyConflictError(dto.name);
    }

    // add to db
    const director = await this.directorModel.create({
      name: dto.name,
    });

    if (!director) return MyInternalServerError('DataBase');

    // send data to elastic
    const elastic = this.sendToElastic(
      'add.elastic.director',
      director,
    );
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async updateDirector(dto: UpdateDirectorDto) {
    // check exist director
    const findDirector = await this.findDirector(null, dto.id);
    if (!findDirector) return MyNotFoundError(dto.id);

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
    const elastic = this.sendToElastic('edit.elastic.director', data);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
  }

  async removeDirector(id: string) {
    // check exist director
    const findDirector = await this.findDirector(null, id);
    if (!findDirector) return MyNotFoundError(id);

    // delete from db
    const removedDirector = await this.directorModel.deleteOne({
      _id: id,
    });

    if (removedDirector.deletedCount == 0)
      return MyInternalServerError;

    // send data to elastic
    const elastic = this.sendToElastic('remove.elastic.director', id);
    if (!elastic) return MyInternalServerError('Elastic');

    return elastic;
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

  async getAllData(message: string) {
    if (message == 'ADMIN') {
      const filmsData = await this.directorModel.find();
      return filmsData;
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
