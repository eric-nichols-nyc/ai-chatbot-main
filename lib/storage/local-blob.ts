import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// MinIO configuration for local development
const s3Client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = 'chatbot-files';

// Initialize bucket if it doesn't exist
async function ensureBucketExists() {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: '.keep',
        Body: '',
      }),
    );
  } catch (error) {
    // Bucket might not exist, that's okay for now
    console.log('Bucket initialization note:', error);
  }
}

export async function putLocalBlob(
  filename: string,
  buffer: ArrayBuffer,
  options: { access: 'public' } = { access: 'public' },
) {
  await ensureBucketExists();

  const key = `${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: getContentType(filename),
  });

  await s3Client.send(command);

  // Return a URL that can be used to access the file
  const url = `http://localhost:9000/${BUCKET_NAME}/${key}`;

  return {
    url,
    downloadUrl: url,
    pathname: `/${BUCKET_NAME}/${key}`,
    contentType: getContentType(filename),
    contentDisposition: null,
    size: buffer.byteLength,
  };
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
  };
  return types[ext || ''] || 'application/octet-stream';
}

// For compatibility with Vercel Blob API
export const put = putLocalBlob;






