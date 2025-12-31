import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member, MemberDocument } from 'src/entity/member.entity';
import { CreateMemberDto, UpdateMemberDto } from 'src/libs/dto/member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
  ) {}

  //createMember
  async createMember(input: CreateMemberDto): Promise<Member> {
    const newMember = new this.memberModel(input);
    const result = await newMember.save();

    return result;
  }

  //findByTelegramId
  async findByTelegramId(telegramId: string): Promise<Member | null> {
    const result = await this.memberModel.findOne({ telegramId });

    return result;
  }

  //findById
  async findById(id: string): Promise<Member | null> {
    const result = await this.memberModel.findById(id);

    return result;
  }

  //update
  async update(id: string, input: UpdateMemberDto): Promise<Member | null> {
    const result = await this.memberModel.findByIdAndUpdate(id, input, {
      new: true,
    });

    return result;
  }
}
