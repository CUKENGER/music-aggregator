import { Controller, Get, Logger, Param, Query, Res } from '@nestjs/common';
import { StreamService } from './stream.service';
import { Response } from 'express';

@Controller('stream')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);
  constructor(private readonly streamService: StreamService) {}

  @Get(':id')
  async getStream(
    @Param('id') id: string,
    @Query('source') source: string,
    @Res() res: Response,
  ) {
    const start = Date.now();

    this.logger.log(`SEARCH request stream source="${source ?? 'all'}"`);
    try {
      const stream = await this.streamService.getStream(id, source);

      this.logger.log(
        `SEARCH success stream id="${id}" source="${source ?? 'all'}" time=${Date.now() - start}ms`,
      );

      res.setHeader('Content-Type', 'audio/mpeg');

      stream.pipe(res);

      stream.on('error', () => {
        res.status(500).end();
      });
    } catch (err) {
      this.logger.error(
        `SEARCH failed stream id="${id}" source="${source ?? 'all'}"`,
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }
  }
}
