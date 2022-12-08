import { IsString } from 'class-validator';

export class RevokeSingleTokenDto {
  @IsString()
  tokenId: string;
}
