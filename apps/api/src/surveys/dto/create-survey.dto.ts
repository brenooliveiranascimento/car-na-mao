import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export class SurveyPointDto {
  @IsNumber() @Min(-90) @Max(90) latitude: number;
  @IsNumber() @Min(-180) @Max(180) longitude: number;
  @IsOptional() @IsNumber() @Min(0) accuracy: number | null;
  @IsNumber() timestamp: number;
}

export class CreateSurveyDto {
  @IsUUID() propertyId: string;
  /** Id generated on the phone; re-sending the same survey after a failed sync is safe. */
  @IsString() clientId: string;
  @IsISO8601() collectedAt: string;
  @IsArray() @ArrayMinSize(4) @ArrayMaxSize(20000) @ValidateNested({ each: true }) @Type(() => SurveyPointDto)
  points: SurveyPointDto[];
}
