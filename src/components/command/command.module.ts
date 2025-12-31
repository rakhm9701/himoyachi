import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandController } from './command.controller';
import { CommandService } from './command.service';
import { Device, DeviceSchema } from '../../entity/device.entity';
import { Command, CommandSchema } from 'src/entity/command.enitit';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Command.name, schema: CommandSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [CommandController],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}