import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from 'src/libs/dto/member.dto';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  //create member!
  @Post()
  async createMember(@Body() input: CreateMemberDto) {
    console.log('Post: createMember');
    return this.memberService.createMember(input);
  }

  //findByTelegramId
  @Get('telegram/:telegramId')
  async findByTelegramId(@Param('telegramId') telegramId: string) {
    console.log('Get: findByTelegramId');
    return this.memberService.findByTelegramId(telegramId);
  }

  //findById
  @Get(':id')
  async findById(@Param('id') id: string) {
    console.log('Get: findById');
    return this.memberService.findById(id);
  }

  //update
  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: UpdateMemberDto) {
    console.log('Patch: update member');
    return this.memberService.update(id, input);
  }
}
