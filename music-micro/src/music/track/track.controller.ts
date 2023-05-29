import { Controller } from '@nestjs/common';
import { TrackService } from './track.service';
import { AddTrackDto, UpdateTrackDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @MessagePattern('add-track')
  // @UseInterceptors(FileInterceptor('track'))
  addTrack(dto: AddTrackDto) {
    return this.trackService.addTrack(dto);
  }

  @MessagePattern('update-track')
  updateTrack(dto: UpdateTrackDto) {
    return this.trackService.updateTrack(dto);
  }

  @MessagePattern('remove-track')
  removeTrack(data) {
    return this.trackService.removeTrack(data);
  }
}
