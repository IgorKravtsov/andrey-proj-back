import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  imports: [UserModule],
})
export class UploadModule {}
