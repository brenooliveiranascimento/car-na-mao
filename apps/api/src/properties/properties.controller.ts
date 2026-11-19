import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly properties: PropertiesService,
    private readonly notifications: NotificationsService,
  ) {}

  @Get('demo')
  demo() {
    return this.properties.findDemo();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.properties.findById(id);
  }

  @Get(':id/notifications')
  listNotifications(@Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.listByProperty(id);
  }
}
