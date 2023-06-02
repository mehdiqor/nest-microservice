import { Module } from '@nestjs/common';
import { ElasticModule } from './elastic/elastic.module';

@Module({
  imports: [ElasticModule],
})
export class AppModule {}
