import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CommandService } from './command.service';
import { CreateCommandDto } from 'src/libs/dto/command.dto';


@Controller('command')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  // Bot'dan buyruq yaratish
  @Post()
  async create(@Body() createCommandDto: CreateCommandDto) {
    console.log('Post: createCommand');
    return this.commandService.create(createCommandDto);
  }

  // Script'dan buyruq olish
  @Get(':deviceKey')
  async getPendingCommand(@Param('deviceKey') deviceKey: string) {
    console.log('Get: getPendingCommand');
    return this.commandService.getPendingCommand(deviceKey);
  }
}