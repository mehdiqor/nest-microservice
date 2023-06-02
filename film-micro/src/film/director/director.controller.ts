import { Controller } from '@nestjs/common';
import { DirectorService } from './director.service';
import { AddDirectorDto, UpdateDirectorDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @MessagePattern('add-director')
  addDirector(dto: AddDirectorDto) {
    return this.directorService.addDirector(dto);
  }

  @MessagePattern('update-director')
  updateDirector(dto: UpdateDirectorDto) {
    return this.directorService.updateDirector(dto);
  }

  @MessagePattern('remove-director')
  removeDirector(id: string) {
    return this.directorService.removeDirector(id);
  }
}
