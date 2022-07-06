import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { UserDto } from './dtos/user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOne(
    condition: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    relations: string[] = [],
  ): Promise<User> {
    return this.userRepository.findOne({ relations, where: condition });
  }

  async create(data: DeepPartial<User>): Promise<DeepPartial<User> & User> {
    return this.userRepository.save(data);
  }

  transformUser(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
