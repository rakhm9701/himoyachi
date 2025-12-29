import { MemberLanguage, MemberRole } from '../enum/member.enum';
import { IsString, IsOptional, IsEnum, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class CreateMemberDto {
  @IsString()
  telegramId: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;

  @IsEnum(MemberLanguage)
  @IsOptional()
  language?: MemberLanguage;
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsIn(['user', 'parent', 'business'])
  @IsOptional()
  role?: string;

  @IsEnum(MemberLanguage)
  @IsOptional()
  language?: MemberLanguage;
}
