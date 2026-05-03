import { Controller, Get, Logger, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string, @Query('source') source?: string) {
    const start = Date.now();

    this.logger.log(`SEARCH request q="${query}" source="${source ?? 'all'}"`);
    try {
      const result = await this.searchService.search(query, source);

      this.logger.log(
        `SEARCH success q="${query}" source="${source ?? 'all'}" time=${Date.now() - start}ms`,
      );

      return result;
    } catch (err) {
      this.logger.error(
        `SEARCH failed q="${query}" source="${source ?? 'all'}"`,
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }
  }
}
