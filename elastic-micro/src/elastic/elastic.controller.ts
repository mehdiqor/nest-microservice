import { Controller } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { MessagePattern } from '@nestjs/microservices';
import { SearchDto } from './dto';

@Controller()
export class ElasticController {
  constructor(private readonly elasticService: ElasticService) {}

  @MessagePattern('all-documents')
  getAllDocuments(index: string) {
    return this.elasticService.getAllDocuments(index);
  }

  @MessagePattern('word-search')
  wordSearch(dto: SearchDto) {
    return this.elasticService.wordSearch(dto);
  }

  @MessagePattern('regexp-search')
  regexpSearch(dto: SearchDto) {
    return this.elasticService.regexpSearch(dto);
  }

  @MessagePattern('movie-search')
  movieSearch(search: string) {
    return this.elasticService.movieSearch(search);
  }

  @MessagePattern('create-index')
  createIndex(indexName: string) {
    return this.elasticService.createIndex(indexName);
  }

  @MessagePattern('exist-index')
  checkExistIndex(indexName: string) {
    return this.elasticService.checkExistIndex(indexName);
  }

  @MessagePattern('remove-index')
  removeIndex(indexName: string) {
    return this.elasticService.removeIndex(indexName);
  }

  @MessagePattern('add.elastic.director')
  addDirector(data) {
    return this.elasticService.addDirector(data);
  }

  @MessagePattern('edit.elastic.director')
  editDirector(data) {
    return this.elasticService.editDirector(data);
  }

  @MessagePattern('remove.elastic.director')
  removeDirector(id: string) {
    return this.elasticService.removeDirector(id);
  }

  @MessagePattern('update.elastic.director')
  updateDirector(data) {
    return this.elasticService.updateDirector(data);
  }

  @MessagePattern('add.elastic.artist')
  addArtist(data) {
    return this.elasticService.addArtist(data);
  }

  @MessagePattern('edit.elastic.artist')
  editArtist(data) {
    return this.elasticService.editArtist(data);
  }

  @MessagePattern('remove.elastic.artist')
  removeArtist(id) {
    return this.elasticService.removeArtist(id);
  }

  @MessagePattern('update.elastic.artist')
  updateArtist(data) {
    return this.elasticService.updateArtist(data);
  }
}
