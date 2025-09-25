import { put as putVercelBlob } from '@vercel/blob';
import { putLocalBlob } from './local-blob';
import { getStorageType } from './config';

export interface BlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string | null;
  contentDisposition: string | null;
  size: number;
}

export async function put(
  filename: string,
  buffer: ArrayBuffer,
  options: { access: 'public' } = { access: 'public' },
): Promise<BlobResult> {
  const storageType = getStorageType();

  if (storageType === 'local') {
    return putLocalBlob(filename, buffer, options);
  } else {
    return putVercelBlob(filename, buffer, options);
  }
}

// Re-export for compatibility
export { put as putBlob };






