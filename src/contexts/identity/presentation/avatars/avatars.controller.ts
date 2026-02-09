import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { User } from '../../../../shared/decorators';
import { ValidateImageFilePipe } from '../../../../shared/pipes/validate-image-file.pipe';
import {
  DeleteAvatarUseCase,
  UploadAvatarUseCase,
} from '../../application/use-cases';
import { AvatarResponseDto } from '../http/dto/avatar.response.dto';

@ApiTags('Avatars')
@ApiBearerAuth()
@Controller('profile/avatars')
export class AvatarsController {
  constructor(
    private readonly uploadAvatar: UploadAvatarUseCase,
    private readonly deleteAvatar: DeleteAvatarUseCase,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  public async upload(
    @User('userId') userId: string,
    @UploadedFile(new ValidateImageFilePipe()) file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {
    const { avatar, url } = await this.uploadAvatar.execute({ userId, file });
    return AvatarResponseDto.from({
      id: avatar.id,
      fileName: avatar.fileName,
      url,
      createdAt: avatar.createdAt,
    });
  }

  @Delete(':id')
  public async delete(
    @User('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ success: true }> {
    return this.deleteAvatar.execute({ userId, avatarId: id });
  }
}
