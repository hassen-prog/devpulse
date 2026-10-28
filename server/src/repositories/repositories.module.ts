import { Module } from '@nestjs/common';
import { RepositoriesService } from './repositories.service.js';
import { RepositoriesController } from './repositories.controller.js';

@Module({
  providers: [RepositoriesService],
  controllers: [RepositoriesController]
})
export class RepositoriesModule {}
