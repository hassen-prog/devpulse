import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('api/health')
  getHealth() {
  return {
    status: 'ok',
    service: 'DevPulse API',
    timestamp: new Date().toISOString(),
  };
}
}
