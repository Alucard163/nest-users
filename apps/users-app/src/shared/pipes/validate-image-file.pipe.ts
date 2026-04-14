import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';

const MAX_IMAGE_SIZE_BYTES: number = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES: ReadonlyArray<string> = ['image/jpeg', 'image/png'];
@Injectable()
export class ValidateImageFilePipe
  implements PipeTransform<Express.Multer.File, Express.Multer.File>
{
  public transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) throw new BadRequestException('Файл обязателен');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      throw new BadRequestException(
        'Разрешены только изображения jpeg или png',
      );
    if (file.size > MAX_IMAGE_SIZE_BYTES)
      throw new BadRequestException('Максимальный размер файла 10MB');
    return file;
  }
}
