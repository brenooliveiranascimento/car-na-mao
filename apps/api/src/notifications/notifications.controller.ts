import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.getById(id);
  }

  @Post(':id/explanation')
  explain(@Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.explain(id);
  }
}
