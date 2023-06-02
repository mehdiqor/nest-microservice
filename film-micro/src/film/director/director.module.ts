import { Module } from '@nestjs/common';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Director, DirectorSchema } from 'src/schemas/film.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Director.name,
        schema: DirectorSchema,
      },
    ]),
  ],
  controllers: [DirectorController],
  providers: [DirectorService],
})
export class DirectorModule {}
