<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chat SDK</h1>
</a>

<p align="center">
    Chat SDK is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://sdk.vercel.ai/docs)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports xAI (default), OpenAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for saving chat history and user data
  - [Drizzle ORM](https://orm.drizzle.team) for type-safe database operations
  - [Drizzle Studio](https://orm.drizzle.team/studio) for database management
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
  - **Local Blob Storage** with MinIO for development
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Providers

This template uses the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) to access multiple AI models through a unified interface. The default configuration includes [xAI](https://x.ai) models (`grok-2-vision-1212`, `grok-3-mini-beta`) routed through the gateway.

### AI Gateway Authentication

**For Vercel deployments**: Authentication is handled automatically via OIDC tokens.

**For non-Vercel deployments**: You need to provide an AI Gateway API key by setting the `AI_GATEWAY_API_KEY` environment variable in your `.env.local` file.

With the [AI SDK](https://ai-sdk.dev/docs/introduction), you can also switch to direct LLM providers like [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://ai-sdk.dev/providers/ai-sdk-providers) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET&envDescription=Learn+more+about+how+to+get+the+API+Keys+for+the+application&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&demo-title=AI+Chatbot&demo-description=An+Open-Source+AI+Chatbot+Template+Built+With+Next.js+and+the+AI+SDK+by+Vercel.&demo-url=https%3A%2F%2Fchat.vercel.ai&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22ai%22%2C%22productSlug%22%3A%22grok%22%2C%22integrationSlug%22%3A%22xai%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22upstash-kv%22%2C%22integrationSlug%22%3A%22upstash%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).

## Database Management

### Drizzle Studio

Drizzle Studio provides a visual interface for managing your database:

```bash
# Start Drizzle Studio
pnpm run db:studio
```

**Access**: https://local.drizzle.studio

**Features:**

- Browse and edit data in tables
- Execute SQL queries
- View table relationships
- Export data to CSV/JSON
- Visual schema representation

### Database Scripts

```bash
# Generate migration from schema changes
pnpm run db:generate

# Apply pending migrations
pnpm run db:migrate

# Open Drizzle Studio
pnpm run db:studio

# Push schema changes (development only)
pnpm run db:push
```

## Local Blob Storage Setup

This project includes a local blob storage solution using MinIO for development, allowing you to test file uploads without needing Vercel Blob credentials.

### Quick Start

1. **Start MinIO with Docker:**

   ```bash
   # Using the provided script
   ./scripts/setup-local-storage.sh

   # Or manually with Docker
   docker run -d \
     --name minio-chatbot \
     -p 9000:9000 \
     -p 9001:9001 \
     -e "MINIO_ROOT_USER=minioadmin" \
     -e "MINIO_ROOT_PASSWORD=minioadmin" \
     minio/minio server /data --console-address ":9001"
   ```

2. **Enable local blob storage:**

   ```bash
   # Add to your .env.local file
   echo "USE_LOCAL_BLOB=true" >> .env.local
   ```

3. **Start your development server:**
   ```bash
   pnpm dev
   ```

### MinIO Access

- **API Endpoint**: http://localhost:9000
- **Web Console**: http://localhost:9001
- **Username**: `minioadmin`
- **Password**: `minioadmin`

### How It Works

The project automatically switches between local and production blob storage based on the `USE_LOCAL_BLOB` environment variable:

- **`USE_LOCAL_BLOB=true`**: Uses local MinIO instance
- **`USE_LOCAL_BLOB=false` or unset**: Uses Vercel Blob (production)

### File Upload Testing

Once MinIO is running and `USE_LOCAL_BLOB=true` is set:

1. Upload files through the chat interface
2. Files are stored in the `chatbot-files` bucket
3. View uploaded files in the MinIO console
4. Files are accessible at `http://localhost:9000/chatbot-files/[filename]`

### Stopping MinIO

```bash
# Stop the container
docker stop minio-chatbot

# Remove the container
docker rm minio-chatbot
```

### Troubleshooting

**MinIO won't start:**

- Ensure Docker is running
- Check if ports 9000 and 9001 are available
- Try removing existing container: `docker rm -f minio-chatbot`

**Files not uploading:**

- Verify `USE_LOCAL_BLOB=true` in `.env.local`
- Check MinIO is running: `docker ps | grep minio`
- Restart your development server after changing environment variables

**Can't access MinIO console:**

- Ensure you're using the correct URL: http://localhost:9001
- Check credentials: `minioadmin` / `minioadmin`
- Verify the container is running on the correct ports
# ai-chatbot-main
