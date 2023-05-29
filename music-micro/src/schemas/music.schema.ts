import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class Track extends Document {
  @Prop({ required: true })
  trackName: string;

  @Prop({
    type: [String],
    default: [],
    required: false,
  })
  tags: string[];

  @Prop({ required: false })
  youtube_link: string;

  @Prop()
  length: string;

  @Prop()
  fileName: string;

  @Prop()
  filePath: string;
}

export const TrackSchema = SchemaFactory.createForClass(Track);

TrackSchema.index({
  trackName: 'text',
});

@Schema()
export class Album extends Document {
  @Prop({ required: true })
  albumName: string;

  @Prop({ required: false })
  year: string;

  @Prop({ required: true })
  genre: MusicGenre;

  @Prop({ type: [TrackSchema], default: [] })
  tracks: [Track];
}

export enum MusicGenre {
  ROCK = 'ROCK',
  METAL = 'METAL',
  JAZZ = 'JAZZ',
  BLUES = 'BLUES',
  COUNTRY = 'COUNTRY',
  CLASSIC = 'CLASSIC',
  ELECTRONIC = 'ELECTRONIC',
  POP = 'POP',
  RAP = 'RAP',
}

export const AlbumSchema = SchemaFactory.createForClass(Album);

AlbumSchema.index({
  albumName: 'text',
});

@Schema()
export class Artist extends Document {
  @Prop({ required: true })
  artistName: string;

  @Prop({ type: [AlbumSchema], default: [] })
  albums: [Album];
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);

ArtistSchema.index({
  artistName: 'text',
});
