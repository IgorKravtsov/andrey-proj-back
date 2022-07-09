import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request, Response } from 'express';
import { API_HOST, UPLOAD_FILES_FOLDER } from 'src/common/constants';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/user/guards/auth.guard';

@Controller()
export class UploadController {
  constructor(private userService: UserService) {}

  @Post('upload/user-avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: `./${UPLOAD_FILES_FOLDER}`,
        filename(_, file, callback) {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file, @Req() request: Request) {
    const { currentUser } = request;
    const fileUrl = `${API_HOST}/${UPLOAD_FILES_FOLDER}/${file.filename}`;

    await this.userService.update(currentUser.id, {
      ...currentUser,
      photoUrl: fileUrl,
    });

    return {
      url: fileUrl,
    };
  }

  @Get('uploads/:path')
  async getImage(@Param('path') path: string, @Res() res: Response) {
    res.sendFile(path, { root: UPLOAD_FILES_FOLDER });
  }
}
