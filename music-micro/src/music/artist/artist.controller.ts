import { Controller } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { AddArtistDto, UpdateArtistDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';

// @ApiTags('Music')
@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @MessagePattern('add-artist')
  addArtist(dto: AddArtistDto) {
    return this.artistService.addArtist(dto);
  }

  @MessagePattern('update-artist')
  updateArtistById(id: string, dto: UpdateArtistDto) {
    return this.artistService.updateArtistById(id, dto);
  }

  @MessagePattern('remove-artist')
  removeArtistByName(artistName: string) {
    return this.artistService.removeArtistByName(artistName);
  }
}
