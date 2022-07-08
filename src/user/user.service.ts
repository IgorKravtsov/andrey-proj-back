import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
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

  async update(
    id: number,
    data: QueryDeepPartialEntity<User>,
  ): Promise<{ message: string }> {
    const updateResult = await this.userRepository.update(id, data);
    const res = updateResult
      ? `User with id ${id} was successfully updated`
      : 'Error while updating';
    return { message: res };
  }

  transformUser(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
