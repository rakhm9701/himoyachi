import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from 'src/entity/device.entity';
import { Member, MemberDocument } from 'src/entity/member.entity';
import { CreateDeviceDto, UpdateDeviceDto } from 'src/libs/dto/device.dto';
import { ErrorMessages } from 'src/libs/error/error.messages';
import { ValidationHelper } from 'src/libs/error/validation.helper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  //create device
  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    ValidationHelper.validateObjectId(createDeviceDto.memberId);

    const member = await this.memberModel.findById(createDeviceDto.memberId);
    if (!member) {
      throw new NotFoundException(ErrorMessages.MEMBER_NOT_FOUND);
    }

    const deviceKey = uuidv4().replace(/-/g, '').substring(0, 12);
    const newDevice = new this.deviceModel({
      ...createDeviceDto,
      deviceKey,
    });
    const result = await newDevice.save();
    console.log('Result:', result);
    return result;
  }

  //find devices by memberId
  async findByMemberId(
    memberId: string,
  ): Promise<{ device: Device[]; count: number }> {
    ValidationHelper.validateObjectId(memberId);
    const result = await this.deviceModel.find({ memberId });
    return {
      device: result,
      count: result.length,
    };
  }

  //find device by deviceKey
  async findByDeviceKey(deviceKey: string): Promise<Device> {
    const device = await this.deviceModel.findOne({ deviceKey });
    if (!device) {
      throw new NotFoundException(ErrorMessages.DEVICE_NOT_FOUND);
    }
    console.log('Device:', device);
    return device;
  }

  //update device
  async update(id: string, input: UpdateDeviceDto): Promise<Device> {
    ValidationHelper.validateObjectId(id);
    const device = await this.deviceModel.findByIdAndUpdate(id, input, {
      new: true,
    });
    if (!device) {
      throw new NotFoundException(ErrorMessages.DEVICE_NOT_FOUND);
    }
    console.log('Result:', device);
    return device;
  }

  //delete device
  async delete(id: string): Promise<{ message: string }> {
    ValidationHelper.validateObjectId(id);
    const device = await this.deviceModel.findByIdAndDelete(id);
    if (!device) {
      throw new NotFoundException(ErrorMessages.DEVICE_NOT_FOUND);
    }
    console.log('Deleted Device:', device);
    return { message: "Qurilma o'chirildi!" };
  }

  async updateLastSeen(deviceKey: string): Promise<Device> {
    const device = await this.deviceModel.findOneAndUpdate(
      { deviceKey },
      { lastSeen: new Date() },
      { new: true },
    );
    if (!device) {
      throw new NotFoundException(ErrorMessages.DEVICE_NOT_FOUND);
    }
    console.log('Device:', device);
    return device;
  }
}
