import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../decorators';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Приветственное сообщение' })
  @ApiResponse({ status: 200, description: 'Возвращает приветственное сообщение' })
  getHello(): string {
    return 'Привет мир!';
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health чек' })
  @ApiResponse({ 
    status: 200, 
    description: 'Все ок',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-10-28T12:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' }
      }
    }
  })
  healthCheck(): { status: string; timestamp: string; uptime: number; environment: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
