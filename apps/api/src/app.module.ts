import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { PropertiesModule } from './properties/properties.module';
import { SurveysModule } from './surveys/surveys.module';

@Module({
  imports: [DatabaseModule, AiModule, PropertiesModule, NotificationsModule, SurveysModule],
  controllers: [HealthController],
})
export class AppModule {}
