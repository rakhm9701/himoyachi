import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DeviceOS } from '../enum/device.enum';

export class CreateDeviceDto {
  @IsString()
  memberId: string;

  @IsString()
  name: string;

  @IsEnum(DeviceOS)
  @IsOptional()
  osType?: DeviceOS;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DeviceOS)
  @IsOptional()
  osType?: DeviceOS;

  @IsString()
  @IsOptional()
  description?: string;
}
