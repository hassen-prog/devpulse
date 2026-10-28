import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RepositoriesModule } from './repositories/repositories.module.js';

@Module({
  imports: [RepositoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
