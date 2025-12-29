import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ErrorMessages } from './error.messages';


export class ValidationHelper {
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
  }

  static validateObjectId(id: string): void {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(ErrorMessages.INVALID_ID);
    }
  }
}