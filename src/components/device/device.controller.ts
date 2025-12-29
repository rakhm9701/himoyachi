import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto } from 'src/libs/dto/device.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  //create device
  @Post()
  async create(@Body() input: CreateDeviceDto) {
    console.log('Post: create device');
    return this.deviceService.create(input);
  }

  //find devices by memberId
  @Get('member/:memberId')
  async findByMemberId(@Param('memberId') memberId: string) {
    console.log('Get: find devices by memberId');
    return this.deviceService.findByMemberId(memberId);
  }

  //find device by deviceKey
  @Get('key/:deviceKey')
  async findByDeviceKey(@Param('deviceKey') deviceKey: string) {
    console.log('Get: find device by deviceKey');
    return this.deviceService.findByDeviceKey(deviceKey);
  }

  //update device
  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: UpdateDeviceDto) {
    console.log('Patch: update device');
    return this.deviceService.update(id, input);
  }

  //delete device
  @Delete(':id')
  async delete(@Param('id') id: string) {
    console.log('Delete: delete device');
    return this.deviceService.delete(id);
  }

  @Patch('key/:deviceKey/lastseen')
  async updateLastSeen(@Param('deviceKey') deviceKey: string) {
    console.log('Patch: update device last seen');
    return this.deviceService.updateLastSeen(deviceKey);
  }
}
