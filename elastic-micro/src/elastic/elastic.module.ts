import { Module } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ElasticService } from './elastic.service';
import { ElasticController } from './elastic.controller';
require('dotenv').config();

@Module({
  controllers: [ElasticController],
  providers: [
    {
      provide: 'ELASTIC_CLIENT',
      useFactory: async() => {
        return new Client({
          node: process.env.ELASTIC_URL,
          auth: {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
          },
        });
      },
    },
    ElasticService,
  ],
})
export class ElasticModule {}
