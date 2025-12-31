import { IsString, IsEnum } from 'class-validator';
import { CommandType } from '../enum/command.enum';

export class CreateCommandDto {
  @IsString()
  deviceKey: string;

  @IsEnum(CommandType)
  type: CommandType;
}
