# Local Development Guide

This guide covers setting up and running the AI Chatbot project locally for development.

## Prerequisites

- Node.js 18+ and pnpm
- Docker (for local blob storage and Redis)
- PostgreSQL database

## Quick Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-chatbot-main
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/ai-chat"

# Authentication
AUTH_SECRET="your-auth-secret-here"

# AI Gateway (optional - for non-Vercel deployments)
AI_GATEWAY_API_KEY="your-ai-gateway-key"

# Blob Storage
# For production (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# For local development (MinIO)
USE_LOCAL_BLOB=true

# Redis (optional - for resumable streams)
REDIS_URL="redis://localhost:6379"
```

### 3. Start Local Services

#### Database Setup

```bash
# Run migrations
pnpm run db:migrate

# Open Drizzle Studio to view your database
pnpm run db:studio
```

**Drizzle Studio Features:**

- Visual database browser at https://local.drizzle.studio
- Edit data directly in the browser
- Execute SQL queries
- View table relationships
- Export data to CSV/JSON

#### Local Blob Storage (MinIO)

```bash
# Start MinIO with the provided script
./scripts/setup-local-storage.sh

# Or manually
docker run -d \
  --name minio-chatbot \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

#### Redis (Optional)

```bash
# Start Redis for resumable streams
docker run -d --name redis-chatbot -p 6379:6379 redis:alpine
```

### 4. Start Development Server

```bash
pnpm dev
```

Your app will be available at http://localhost:3000

## Local Services Access

| Service        | URL                          | Credentials             |
| -------------- | ---------------------------- | ----------------------- |
| App            | http://localhost:3000        | -                       |
| Drizzle Studio | https://local.drizzle.studio | -                       |
| MinIO Console  | http://localhost:9001        | minioadmin / minioadmin |
| MinIO API      | http://localhost:9000        | minioadmin / minioadmin |

## Development Workflow

### Database Changes

```bash
# Generate new migration
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# View database in Drizzle Studio
pnpm run db:studio
```

**Drizzle Studio Workflow:**

1. Make schema changes in `lib/db/schema.ts`
2. Generate migration: `pnpm run db:generate`
3. Apply migration: `pnpm run db:migrate`
4. View changes in Studio: `pnpm run db:studio`
5. Test queries and data in the web interface

### File Uploads

- With `USE_LOCAL_BLOB=true`: Files stored in local MinIO
- Without it: Files stored in Vercel Blob (requires token)

### Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm run lint

# Format code
pnpm run format
```

## Stopping Services

```bash
# Stop all containers
docker stop minio-chatbot redis-chatbot

# Remove containers
docker rm minio-chatbot redis-chatbot
```

## Troubleshooting

### Common Issues

**Port conflicts:**

- MinIO: 9000, 9001
- Redis: 6379
- App: 3000

**Database connection:**

- Verify PostgreSQL is running
- Check connection string in `.env.local`
- Run migrations: `pnpm run db:migrate`

**File uploads not working:**

- Check MinIO is running: `docker ps | grep minio`
- Verify `USE_LOCAL_BLOB=true` in `.env.local`
- Restart dev server after env changes

**Redis connection issues:**

- Check Redis container: `docker ps | grep redis`
- Verify `REDIS_URL` in `.env.local`
- Resumable streams will be disabled without Redis
