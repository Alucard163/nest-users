export type UploadFileInput = {
  readonly key: string;
  readonly body: Buffer | Uint8Array;
  readonly contentType: string;
};

export interface FileStoragePort {
  uploadFile(input: UploadFileInput): Promise<void>;
  getPublicUrl(key: string): string;
}
