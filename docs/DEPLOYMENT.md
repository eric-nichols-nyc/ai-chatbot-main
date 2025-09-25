# Deployment Guide

This guide covers deploying the AI Chatbot application to various platforms.

## Vercel Deployment (Recommended)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET&envDescription=Learn+more+about+how+to+get+the+API+Keys+for+the+application&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&demo-title=AI+Chatbot&demo-description=An+Open-Source+AI+Chatbot+Template+Built+With+Next.js+and+the+AI+SDK+by+Vercel.&demo-url=https%3A%2F%2Fchat.vercel.ai&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22ai%22%2C%22productSlug%22%3A%22grok%22%2C%22integrationSlug%22%3A%22xai%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22upstash-kv%22%2C%22integrationSlug%22%3A%22upstash%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

### Manual Vercel Deployment

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add AUTH_SECRET
   vercel env add POSTGRES_URL
   vercel env add BLOB_READ_WRITE_TOKEN
   vercel env add REDIS_URL
   ```

### Environment Variables for Vercel

#### Required

```bash
AUTH_SECRET=your-auth-secret-here
POSTGRES_URL=your-postgres-connection-string
```

#### Optional

```bash
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
REDIS_URL=your-redis-connection-string
AI_GATEWAY_API_KEY=your-ai-gateway-key
```

## Database Setup

### Neon (Recommended for Vercel)

1. **Create Neon Account:**

   - Visit [Neon Console](https://console.neon.tech)
   - Create a new project

2. **Get Connection String:**

   - Copy the connection string
   - Add to Vercel environment variables

3. **Run Migrations:**
   ```bash
   vercel env pull .env.local
   pnpm run db:migrate
   ```

### Other PostgreSQL Providers

#### Supabase

```bash
POSTGRES_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

#### Railway

```bash
POSTGRES_URL=postgresql://postgres:[password]@[host]:[port]/railway
```

#### PlanetScale

```bash
POSTGRES_URL=mysql://[username]:[password]@[host]/[database]?ssl={"rejectUnauthorized":true}
```

## Blob Storage Setup

### Vercel Blob (Production)

1. **Enable Blob Storage:**

   - Go to Vercel Dashboard
   - Navigate to Storage tab
   - Create a new Blob store

2. **Get Token:**
   - Copy the `BLOB_READ_WRITE_TOKEN`
   - Add to environment variables

### Alternative Blob Storage

#### AWS S3

```typescript
// lib/storage/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

#### Cloudinary

```typescript
// lib/storage/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

## Redis Setup (Optional)

### Upstash (Recommended for Vercel)

1. **Create Upstash Account:**

   - Visit [Upstash Console](https://console.upstash.com)
   - Create a new Redis database

2. **Get Connection String:**
   ```bash
   REDIS_URL=redis://default:[password]@[host]:[port]
   ```

### Other Redis Providers

#### Railway Redis

```bash
REDIS_URL=redis://default:[password]@[host]:[port]
```

#### Redis Cloud

```bash
REDIS_URL=redis://default:[password]@[host]:[port]
```

## AI Model Configuration

### Vercel AI Gateway (Default)

No additional configuration needed for Vercel deployments. Authentication is handled automatically.

### Direct Provider Setup

#### OpenAI

```bash
OPENAI_API_KEY=your-openai-api-key
```

#### Anthropic

```bash
ANTHROPIC_API_KEY=your-anthropic-api-key
```

#### xAI

```bash
XAI_API_KEY=your-xai-api-key
```

## Custom Domain Setup

### Vercel Custom Domain

1. **Add Domain:**

   - Go to Vercel Dashboard
   - Navigate to Domains
   - Add your custom domain

2. **Configure DNS:**
   - Add CNAME record pointing to Vercel
   - Wait for SSL certificate provisioning

### SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.

## Monitoring and Analytics

### Vercel Analytics

Automatically enabled for Vercel deployments:

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking

#### Sentry Integration

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Performance Optimization

### Build Optimization

```bash
# Production build
pnpm run build

# Analyze bundle
pnpm run build -- --analyze
```

### Image Optimization

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ["localhost", "your-blob-domain.com"],
  },
};
```

### Caching Strategy

```typescript
// app/api/chat/route.ts
export const runtime = "edge";
export const dynamic = "force-dynamic";
```

## Security Considerations

### Environment Variables

- Never commit `.env` files
- Use Vercel's environment variable management
- Rotate secrets regularly

### CORS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://yourdomain.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE",
          },
        ],
      },
    ];
  },
};
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

## Troubleshooting

### Common Deployment Issues

**Build Failures:**

- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

**Database Connection Issues:**

- Verify connection string format
- Check database accessibility
- Ensure migrations are run

**Environment Variable Issues:**

- Verify all required variables are set
- Check variable names match exactly
- Restart deployment after adding variables

**Blob Storage Issues:**

- Verify blob storage is enabled
- Check token permissions
- Test file upload functionality

### Debugging

```bash
# Local debugging
vercel env pull .env.local
pnpm dev

# Production debugging
vercel logs [deployment-url]
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA,
  });
}
```






