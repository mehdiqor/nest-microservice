import { Controller } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AddAlbumDto, UpdateAlbumDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @MessagePattern('add-album')
  addAlbum(dto: AddAlbumDto) {
    return this.albumService.addAlbum(dto);
  }

  @MessagePattern('update-album')
  updateAlbumById(dto: UpdateAlbumDto) {
    return this.albumService.updateAlbumById(dto);
  }

  @MessagePattern('remove-album')
  removeAlbumById(id: string) {
    return this.albumService.removeAlbumById(id);
  }
}
