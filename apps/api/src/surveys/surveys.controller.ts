import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SurveysService } from './surveys.service';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @Post()
  create(@Body() dto: CreateSurveyDto) {
    return this.surveys.create(dto);
  }

  @Get(':id/analysis')
  analysis(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveys.analysis(id);
  }
}
