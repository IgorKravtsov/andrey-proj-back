import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UserToken } from './dtos/user-token.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('auth/register')
  async register(@Body() body: RegisterDto): Promise<UserToken> {
    const { email, password } = body;

    const user = await this.userService.findOne({ email });

    if (user) {
      throw new BadRequestException(
        `Пользователь с email "${email} уже существует"`,
      );
    }
    const newUser = await this.userService.create({
      email,
      password,
    });

    const jwt_token = await this.jwtService.signAsync({ id: newUser.id });

    return { token: jwt_token };
  }

  @Post('auth/login')
  async login(@Body() body: LoginDto): Promise<UserToken> {
    const { email, password } = body;
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    if (password !== user.password) {
      throw new BadRequestException('Invalid credentials');
    }
    const jwt_token = await this.jwtService.signAsync({ id: user.id }); // sign more data in future

    return { token: jwt_token };
  }
}
