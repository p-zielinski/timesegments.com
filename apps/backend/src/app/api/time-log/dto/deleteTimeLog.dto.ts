import { IsString } from 'class-validator';

export class DeleteTimeLogDto {
  @IsString()
  timeLogId: string;
}
