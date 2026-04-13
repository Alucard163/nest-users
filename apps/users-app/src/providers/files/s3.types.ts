export type S3Config = {
  readonly endpoint: string;
  readonly region: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucket: string;
  readonly forcePathStyle: boolean;
  readonly publicUrl?: string;
};

export type UploadObjectInput = {
  readonly key: string;
  readonly body: Uint8Array;
  readonly contentType: string;
};
