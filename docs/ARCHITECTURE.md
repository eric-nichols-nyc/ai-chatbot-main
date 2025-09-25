# Architecture Overview

This document provides a high-level overview of the AI Chatbot application architecture.

## System Components

### Frontend

- **Next.js 15** with App Router
- **React 19** with Server Components
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TypeScript** for type safety

### Backend

- **Next.js API Routes** for server-side logic
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for migrations and schema management
- **Drizzle Studio** for database visualization
- **PostgreSQL** for data persistence
- **Redis** for resumable streams (optional)

### AI Integration

- **Vercel AI SDK** for LLM interactions
- **AI Gateway** for model routing
- **Multiple model providers** (xAI, OpenAI, etc.)

### Storage

- **Vercel Blob** for production file storage
- **MinIO** for local development file storage
- **PostgreSQL** for structured data

## Data Flow

### Chat Flow

```
User Input → API Route → AI Processing → Stream Response → Database Save
     ↓              ↓              ↓              ↓              ↓
  Message      Authentication   Model Call    Real-time UI    Persistence
```

### File Upload Flow

```
File Upload → Validation → Storage (Blob/MinIO) → URL Return → Database Reference
     ↓              ↓              ↓              ↓              ↓
  Form Data    Size/Type Check   Cloud/Local    Public URL    Message Attach
```

### Artifact Creation Flow

```
User Request → AI Analysis → Tool Execution → Artifact Display → Database Save
     ↓              ↓              ↓              ↓              ↓
  "Create X"    Determine Type   Generate ID    Real-time UI    Version Control
```

## Database Schema

### Drizzle ORM Integration

The application uses Drizzle ORM for type-safe database operations:

- **Schema Definition**: TypeScript-first schema in `lib/db/schema.ts`
- **Type Generation**: Automatic TypeScript types from schema
- **Query Builder**: Type-safe SQL query construction
- **Migration System**: Version-controlled database changes
- **Studio Interface**: Visual database management

### Core Tables

- **User**: Authentication and user data
- **Chat**: Conversation metadata
- **Message**: Individual messages with parts/attachments
- **Document**: Artifact storage
- **Suggestion**: Document suggestions
- **Vote**: Message voting
- **Stream**: Resumable stream tracking

### Relationships

```
User (1) → (N) Chat
Chat (1) → (N) Message
Chat (1) → (N) Vote
User (1) → (N) Document
Document (1) → (N) Suggestion
Chat (1) → (N) Stream
```

### Drizzle Studio Features

- **Visual Schema Browser**: Navigate tables and relationships
- **Data Editor**: Insert, update, delete records
- **Query Interface**: Execute SQL queries with results
- **Export Tools**: Download data as CSV/JSON
- **Real-time Updates**: Live data synchronization

## Storage Architecture

### Blob Storage Strategy

- **Production**: Vercel Blob (cloud)
- **Development**: MinIO (local Docker)
- **Unified Interface**: Automatic switching based on environment

### File Organization

```
chatbot-files/
├── images/
│   ├── 2024-01-15-avatar.jpg
│   └── 2024-01-15-screenshot.png
└── documents/
    ├── 2024-01-15-report.pdf
    └── 2024-01-15-data.json
```

## Security

### Authentication

- **NextAuth.js** for session management
- **Guest users** for anonymous access
- **User types** with different entitlements

### Data Protection

- **Environment variables** for secrets
- **Input validation** with Zod schemas
- **File type restrictions** for uploads
- **Size limits** for file uploads

## Performance Optimizations

### Streaming

- **Resumable streams** with Redis
- **Real-time UI updates** during generation
- **Graceful degradation** without Redis

### Caching

- **Redis** for stream state
- **Database queries** optimized with Drizzle
- **Static assets** served efficiently

### Scalability

- **Serverless architecture** with Vercel
- **Database connection pooling**
- **CDN distribution** for blob storage

## Development vs Production

### Local Development

- MinIO for blob storage
- Local PostgreSQL
- Optional Redis
- Hot reloading enabled

### Production

- Vercel Blob for file storage
- Neon PostgreSQL
- Upstash Redis
- Optimized builds
- CDN distribution

## Monitoring & Observability

### Logging

- **Console logging** for development
- **Structured logging** for production
- **Error tracking** with proper error types

### Analytics

- **Vercel Analytics** for usage metrics
- **OpenTelemetry** for distributed tracing
- **Performance monitoring**

## API Design

### RESTful Endpoints

- `POST /api/chat` - Send message
- `GET /api/chat/[id]/stream` - Resume stream
- `POST /api/files/upload` - Upload file
- `GET /api/history` - Get chat history

### Real-time Features

- **Server-Sent Events** for streaming
- **WebSocket-like behavior** with resumable streams
- **Optimistic updates** in UI

## Deployment

### Vercel Integration

- **Automatic deployments** from Git
- **Environment variables** management
- **Edge functions** for global performance
- **Preview deployments** for PRs

### Environment Management

- **Development**: Local services
- **Staging**: Vercel preview
- **Production**: Vercel production
