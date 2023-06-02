import { Controller } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { MessagePattern } from '@nestjs/microservices';
import { SearchDto } from './dto';

@Controller()
export class ElasticController {
  constructor(private readonly elasticService: ElasticService) {}

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
}
