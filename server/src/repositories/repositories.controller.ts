
import { Controller, Get, Query } from '@nestjs/common';
import { RepositoriesService } from './repositories.service.js';

@Controller('api/repositories')
export class RepositoriesController {
  constructor(
    private readonly repositoriesService: RepositoriesService,
  ) {}

  @Get('analyze')
  analyzeRepository(@Query('url') url: string) {
    return this.repositoriesService.analyzeRepository(url);
  }
}
