import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async check() {
    const row = await this.db.one<{ postgis: string }>('SELECT postgis_lib_version() AS postgis');
    return { status: 'ok', postgis: row?.postgis ?? null };
  }
}
