import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [MemberModule, DeviceModule]
})
export class ComponentsModule {}
