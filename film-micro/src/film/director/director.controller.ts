import { Controller, Get, Param } from '@nestjs/common';
import { DirectorService } from './director.service';
import { AddDirectorDto, UpdateDirectorDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Get('/:name')
  async addArtistRoute(@Param('name') name: string): Promise<any> {
    console.log(name);
    return this.directorService.findDirector(name);
  }

  @MessagePattern('add-director')
  addDirector(dto: AddDirectorDto) {
    // Register a new route in director name
    const route = this.addArtistRoute(dto.name);
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

  @MessagePattern('all-films')
  getAllData(message: string) {
    return this.directorService.getAllData(message);
  }
}
