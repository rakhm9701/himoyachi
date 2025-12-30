import { IsString, IsOptional } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  deviceKey: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}