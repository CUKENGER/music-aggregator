import { exec } from 'child_process';
import { IMusicProvider, TrackMeta } from './interfaces/provider.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class YouTubeProvider implements IMusicProvider {
  private readonly logger = new Logger(YouTubeProvider.name);
  source = 'youtube';

  async search(query: string, limit = 5): Promise<TrackMeta[]> {
    return new Promise((resolve, reject) => {
      const cmd = `yt-dlp "ytsearch${limit}:${query}" --dump-json --flat-playlist`;
      this.logger.log(`Executing: ${cmd}`);

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          this.logger.error(`yt-dlp error: ${err.message}`);
          this.logger.error(`stderr: ${stderr}`);
          // return reject(err);
          return resolve([
            {
              id: 'fallback',
              title: `No results for ${query}`,
              artist: 'system',
              source: 'internal',
              duration: 0,
            },
          ]);
        }

        if (!stdout) {
          this.logger.warn('yt-dlp returned empty stdout');
          return resolve([]);
        }

        try {
          const lines = stdout.trim().split('\n');
          const tracks = lines.map((line) => {
            const info = JSON.parse(line);
            return {
              id: info.id,
              title: info.title,
              artist: info.uploader,
              source: this.source,
              duration: info.duration,
            } as TrackMeta;
          });
          this.logger.log(`Found ${tracks.length} tracks`);
          resolve(tracks);
        } catch (parseErr) {
          this.logger.error(`JSON parse error: ${parseErr.message}`);
          this.logger.error(`stdout: ${stdout}`);
          reject(parseErr);
        }
      });
    });
  }

  async getTrack(id: string): Promise<TrackMeta> {
    return new Promise((resolve, reject) => {
      exec(
        `yt-dlp "https://www.youtube.com/watch?v=${id}" --dump-json`,
        (err, stdout) => {
          if (err) return reject(err);
          const info = JSON.parse(stdout);
          resolve({
            id: info.id,
            title: info.title,
            artist: info.uploader,
            album: info.album,
            duration: info.duration,
            source: this.source,
          });
        },
      );
    });
  }

  async getStream(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(
        `yt-dlp -f bestaudio --get-url "https://www.youtube.com/watch?v=${id}"`,
        (err, stdout) => {
          if (err) return reject(err);
          resolve(stdout.trim());
        },
      );
    });
  }
}
