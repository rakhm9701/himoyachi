import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto } from 'src/libs/dto/alert.dto';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  // create alert
  @Post()
  async create(@Body() input: CreateAlertDto) {
    console.log('Post: create alert');
    return this.alertService.create(input);
  }

  // get alerts by deviceId
  @Get('device/:deviceId')
  async findByDeviceId(@Param('deviceId') deviceId: string) {
    console.log('Get: find alerts by deviceId');
    return this.alertService.findByDeviceId(deviceId);
  }

  @Get('member/:memberId')
  async findByMemberId(@Param('memberId') memberId: string) {
    console.log('Get: find alerts by memberId');
    return this.alertService.findByMemberId(memberId);
  }
}
