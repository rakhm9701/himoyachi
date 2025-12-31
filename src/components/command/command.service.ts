import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Command, CommandDocument } from 'src/entity/command.enitit';
import { Device, DeviceDocument } from 'src/entity/device.entity';
import { CreateCommandDto } from 'src/libs/dto/command.dto';
import { CommandStatus } from 'src/libs/enum/command.enum';
import { ErrorMessages } from 'src/libs/error/error.messages';
import { ValidationHelper } from 'src/libs/error/validation.helper';

@Injectable()
export class CommandService {
  constructor(
    @InjectModel(Command.name) private commandModel: Model<CommandDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  // Yangi buyruq yaratish (Bot'dan)
  async create(createCommandDto: CreateCommandDto): Promise<Command> {
    const device = await this.deviceModel.findOne({
      deviceKey: createCommandDto.deviceKey,
    });
    if (!device) {
      throw new NotFoundException(ErrorMessages.DEVICE_NOT_FOUND);
    }
    const newCommand = new this.commandModel({
      deviceId: device._id,
      type: createCommandDto.type,
    });
    return newCommand.save();
  }

  // Pending buyruqni olish (Script'dan)
  // Pending buyruqni olish (Script'dan)
  async getPendingCommand(
    deviceKey: string,
  ): Promise<{ type: string; commandId: string } | string> {
    const device = await this.deviceModel.findOne({ deviceKey });
    if (!device) {
      return '';
    }

    const command = await this.commandModel
      .findOne({
        deviceId: device._id,
        status: CommandStatus.PENDING,
      })
      .sort({ createdAt: -1 });

    if (!command) {
      return '';
    }

    // Screenshot bo'lsa - commandId ham qaytarish
    if (command.type === 'screenshot') {
      return {
        type: command.type,
        commandId: (command as any)._id.toString(),
      };
    }

    // Boshqa buyruqlar - executed qilish
    await this.commandModel.findByIdAndUpdate(command._id, {
      status: CommandStatus.EXECUTED,
      executedAt: new Date(),
    });

    return command.type;
  }
}
