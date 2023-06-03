import { Client } from '@elastic/elasticsearch';
import { Inject, Injectable } from '@nestjs/common';
import {
  MyConflictError,
  MyInternalServerError,
  MyNotFoundError,
} from '../utils';
import { SearchDto } from './dto';

@Injectable()
export class ElasticService {
  constructor(
    @Inject('ELASTIC_CLIENT')
    private esClient: Client,
  ) {}

  // Search
  async wordSearch(dto: SearchDto) {
    const { index, search } = dto;
    // check exist index
    const exist = await this.checkExistIndex(index);
    if (!exist) return MyNotFoundError(index);

    const body = await this.esClient.search({
      index,
      q: search,
    });

    const result = body.hits.hits;
    return result;
  }

  async regexpSearch(dto: SearchDto) {
    const { index, search } = dto;
    // check exist index
    const exist = await this.checkExistIndex(index);
    if (!exist) return MyNotFoundError(index);
    const body = await this.esClient.search({
      index,
      query: {
        bool: {
          should: [
            {
              regexp: { artistName: `.*${search}.*` },
            },
            {
              regexp: { albumName: `.*${search}.*` },
            },
            {
              regexp: { trackName: `.*${search}.*` },
            },
            {
              regexp: { genre: `.*${search}.*` },
            },
            {
              regexp: { tags: `.*${search}.*` },
            },
            {
              regexp: { title: `.*${search}.*` },
            },
            {
              regexp: { year: `.*${search}.*` },
            },
            {
              regexp: { name: `.*${search}.*` },
            },
          ],
        },
      },
    });

    const result = body.hits.hits;
    return result;
  }

  async movieSearch(search: string) {
    console.log(search);
    const body = await this.esClient.search({
      index: 'film',
      body: {
        query: {
          query_string: {
            query: `movies.title:"${search}"`,
          },
        },
      },
    });

    const result = body.hits.hits[0];
    return result;
  }

  // Admin Panel
  async removeDirectlyFromElastic(data) {
    const elastic = await this.esClient.delete({
      index: data.index,
      id: data.id,
    });

    if (elastic._shards.successful == 0) console.log('elastic error');

    console.log({
      msg: 'Removed',
      result: elastic._shards,
    });
  }

  async syncMusicDataWithElastic(data) {
    const elastic = await this.esClient.index({
      index: 'musics',
      id: data.id,
      body: {
        artistName: data.artistName,
        albums: data.albums,
      },
    });

    if (elastic._shards.successful == 0) console.log('elastic error');

    console.log({
      msg: 'Synced',
      result: elastic._shards,
    });
  }

  async syncFilmDataWithElastic(data) {
    const elastic = await this.esClient.index({
      index: 'film',
      id: data.id,
      body: {
        name: data.name,
        movies: data.movies,
      },
    });

    if (elastic._shards.successful == 0) console.log('elastic error');

    console.log({
      msg: 'Synced',
      result: elastic._shards,
    });
  }

  async createIndex(indexName: string) {
    // check exist index
    const exist = await this.checkExistIndex(indexName);
    if (exist) return MyConflictError(indexName);

    // add index
    const index = await this.esClient.indices.create({
      index: indexName,
    });
    console.log(index);
  }

  async checkExistIndex(indexName: string) {
    const index = await this.esClient.indices.exists({
      index: indexName,
    });

    console.log(index);
    return index;
  }

  async removeIndex(indexName: string) {
    const index = await this.esClient.indices.delete({
      index: indexName,
    });

    if (index.acknowledged == false) console.log('elastic error');

    console.log({
      msg: 'Index removed',
      removed: index.acknowledged,
    });
  }

  // Artist Event Emitter
  async addArtist(data) {
    const elastic = await this.esClient.index({
      index: 'musics',
      id: data._id,
      body: {
        artistName: data.artistName,
        albums: data.albums,
      },
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }

  async editArtist(data) {
    const elastic = await this.esClient.update({
      index: 'musics',
      id: data.id,
      body: {
        doc: {
          artistName: data.artistName,
        },
      },
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }

  async removeArtist(id: string) {
    const elastic = await this.esClient.delete({
      index: 'musics',
      id,
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }

  async updateArtist(data) {
    const elastic = await this.esClient.update({
      index: 'musics',
      id: data.id,
      body: {
        doc: {
          albums: data.albums,
        },
      },
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }

  // Director Event Emitter
  async addDirector(data) {
    const elastic = await this.esClient.index({
      index: 'film',
      id: data._id,
      body: {
        name: data.name,
        movies: data.movies,
      },
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }

  async editDirector(data) {
    const elastic = await this.esClient.update({
      index: 'film',
      id: data.id,
      body: {
        doc: {
          name: data.name,
        },
      },
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }

  async removeDirector(id: string) {
    const elastic = await this.esClient.delete({
      index: 'film',
      id,
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }

  async updateDirector(data) {
    const elastic = await this.esClient.update({
      index: 'film',
      id: data.id,
      body: {
        doc: {
          movies: data.movies,
        },
      },
    });

    if (elastic._shards.successful == 0) return MyInternalServerError;
  }
}
