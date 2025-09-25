// Storage configuration
export const STORAGE_CONFIG = {
  // Set to true to use local MinIO instead of Vercel Blob
  USE_LOCAL_BLOB: process.env.USE_LOCAL_BLOB === 'true',

  // MinIO configuration
  MINIO: {
    endpoint: 'http://localhost:9000',
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    bucket: 'chatbot-files',
  },

  // Vercel Blob configuration
  VERCEL_BLOB: {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  },
};

export function getStorageType(): 'local' | 'vercel' {
  return STORAGE_CONFIG.USE_LOCAL_BLOB ? 'local' : 'vercel';
}






