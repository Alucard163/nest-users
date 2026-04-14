import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { FileStoragePort, UploadFileInput } from '../../contexts/identity/application/ports';
import type { S3Config, UploadObjectInput } from './s3.types';

@Injectable()
export class S3Service implements FileStoragePort, OnModuleInit {
  private readonly config: S3Config;
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.config = this.readConfig();
    this.client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      forcePathStyle: this.config.forcePathStyle,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  public async onModuleInit(): Promise<void> {
    await this.ensureBucketExists(this.config.bucket);
  }

  public async uploadObject(input: UploadObjectInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
  }

  public async uploadFile(input: UploadFileInput): Promise<void> {
    await this.uploadObject({
      key: input.key,
      body: input.body,
      contentType: input.contentType,
    });
  }
  public getPublicUrl(key: string): string {
    const baseUrl: string = this.config.publicUrl ?? this.config.endpoint;
    return `${baseUrl}/${this.config.bucket}/${key}`;
  }

  private async ensureBucketExists(bucket: string): Promise<void> {
    const exists: boolean = await this.client
      .send(new HeadBucketCommand({ Bucket: bucket }))
      .then(() => true)
      .catch(() => false);
    if (exists) return;
    await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
  }

  private readConfig(): S3Config {
    const endpoint: string | undefined =
      this.configService.get<string>('s3.endpoint');
    const region: string =
      this.configService.get<string>('s3.region') ?? 'us-east-1';
    const accessKeyId: string | undefined =
      this.configService.get<string>('s3.accessKeyId');
    const secretAccessKey: string | undefined =
      this.configService.get<string>('s3.secretAccessKey');
    const bucket: string | undefined =
      this.configService.get<string>('s3.bucket');
    const forcePathStyle: boolean =
      this.configService.get<boolean>('s3.forcePathStyle') ?? true;
    const publicUrl: string | undefined =
      this.configService.get<string>('s3.publicUrl');
    if (!endpoint)
      throw new Error('S3_ENDPOINT is not defined in environment variables');
    if (!accessKeyId)
      throw new Error(
        'S3_ACCESS_KEY_ID is not defined in environment variables',
      );
    if (!secretAccessKey)
      throw new Error(
        'S3_SECRET_ACCESS_KEY is not defined in environment variables',
      );
    if (!bucket)
      throw new Error('S3_BUCKET is not defined in environment variables');
    return {
      endpoint,
      region,
      accessKeyId,
      secretAccessKey,
      bucket,
      forcePathStyle,
      publicUrl,
    };
  }
}
