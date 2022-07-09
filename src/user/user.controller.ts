import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UpdateEmailDto } from './dtos/update-email.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UserToken } from './dtos/user-token.dto';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from './guards/auth.guard';
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

  @UseGuards(AuthGuard)
  @Get('user')
  async user(@Req() request: Request): Promise<UserDto> {
    const user = await this.userService.findOne({ id: request.currentUser.id });

    return this.userService.transformUser(user);
  }

  @UseGuards(AuthGuard)
  @Put('user/update-password')
  async updatePassword(
    @Req() request: Request,
    @Body() body: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const { newPassword, oldPassword } = body;
    const user = await this.userService.findOne({ id: request.currentUser.id });

    if (user.password !== oldPassword) {
      throw new BadRequestException('Old password is not match');
    }

    const res = await this.userService.update(user.id, {
      ...user,
      password: newPassword,
    });

    return res;
  }

  @UseGuards(AuthGuard)
  @Put('user/update-email')
  async updateEmail(
    @Req() request: Request,
    @Body() body: UpdateEmailDto,
  ): Promise<{ message: string }> {
    const { currentUser } = request;
    const { newEmail } = body;

    const user = await this.userService.findOne({
      email: newEmail,
    });

    if (user) {
      throw new BadRequestException(`Email ${newEmail} is already exists`);
    }

    const res = await this.userService.update(user.id, {
      ...currentUser,
      email: newEmail,
    });

    return res;
  }

  // @Post('auth/logout')
  // async logout(@Res({ passthrough: true }) response: Response) {
  //   response.clearCookie(USER_IN_COOKIE)

  //   return {
  //     message: 'Выход выполнен успешно',
  //   }
  // }
}
