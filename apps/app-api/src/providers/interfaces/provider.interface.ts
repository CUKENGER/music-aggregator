export interface IMusicProvider {
  search(
    query: string,
    limit?: number,
  ): Promise<TrackMeta[] | DeezerTrackMeta[]>;
  getTrack(id: string): Promise<TrackMeta>;
  getStream(id: string): Promise<string>;
}

export type TrackMeta = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  source: string;
};

export interface DeezerTrackMeta {
  id: string;
  title: string;
  duration?: number;
  source: string;

  // Deezer-specific
  preview?: string;
  link?: string;
  cover?: string;
  rank?: number;
  explicit?: boolean;
  title_short?: string;
  title_version?: string;
  explicit_lyrics?: boolean;
  explicit_content_lyrics?: number;
  explicit_content_cover?: number;
  md5_image?: string;

  artist?: {
    id: number;
    name: string;
    link: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    tracklist: string;
  };

  album?: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    tracklist: string;
    type: string;
  };

  type?: string;
}
