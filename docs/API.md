# API Documentation

This document describes the API endpoints and their usage in the AI Chatbot application.

## Authentication

All API endpoints require authentication unless specified otherwise. The application uses NextAuth.js for session management.

### Guest Access

- Guest users can access the application without registration
- Limited functionality and rate limits apply

## Chat API

### Send Message

**POST** `/api/chat`

Send a message to the AI and receive a streaming response.

#### Request Body

```typescript
{
  id: string; // Chat ID (UUID)
  message: ChatMessage; // User message
  selectedChatModel: string; // AI model to use
  selectedVisibilityType: "public" | "private";
}
```

#### Response

- **Content-Type**: `text/plain; charset=utf-8`
- **Stream**: Server-sent events with AI response

#### Example

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "id": "chat-uuid",
    "message": {
      "id": "msg-uuid",
      "role": "user",
      "parts": [{"type": "text", "text": "Hello!"}]
    },
    "selectedChatModel": "chat-model",
    "selectedVisibilityType": "private"
  }'
```

### Resume Stream

**GET** `/api/chat/[id]/stream`

Resume an interrupted AI response stream.

#### Parameters

- `id`: Chat ID

#### Response

- **Content-Type**: `text/plain; charset=utf-8`
- **Stream**: Server-sent events with remaining response

#### Example

```bash
curl http://localhost:3000/api/chat/chat-uuid/stream
```

### Delete Chat

**DELETE** `/api/chat`

Delete a chat and all its messages.

#### Query Parameters

- `id`: Chat ID to delete

#### Response

- **Status**: 200 on success
- **Body**: `{ success: true }`

#### Example

```bash
curl -X DELETE "http://localhost:3000/api/chat?id=chat-uuid"
```

## File Upload API

### Upload File

**POST** `/api/files/upload`

Upload a file (image) to blob storage.

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field

#### File Restrictions

- **Types**: JPEG, PNG only
- **Size**: Maximum 5MB
- **Authentication**: Required

#### Response

```typescript
{
  url: string; // Public URL to access file
  downloadUrl: string; // Download URL
  pathname: string; // File path
  contentType: string; // MIME type
  contentDisposition: string | null;
  size: number; // File size in bytes
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -F "file=@/path/to/image.jpg"
```

### Local Upload (Development)

**POST** `/api/files/upload-local`

Alternative upload endpoint for local development with MinIO.

Same interface as `/api/files/upload` but uses local MinIO storage.

## History API

### Get Chat History

**GET** `/api/history`

Retrieve user's chat history.

#### Query Parameters

- `limit`: Number of chats to return (default: 50)
- `offset`: Number of chats to skip (default: 0)

#### Response

```typescript
{
  chats: Array<{
    id: string;
    title: string;
    createdAt: string;
    visibility: "public" | "private";
  }>;
  total: number;
}
```

#### Example

```bash
curl "http://localhost:3000/api/history?limit=10&offset=0"
```

## Document API

### Create Document

**POST** `/api/document`

Create a new document/artifact.

#### Request Body

```typescript
{
  title: string;
  content: string;
  kind: "text" | "code" | "image" | "sheet";
}
```

#### Response

```typescript
{
  id: string;
  title: string;
  content: string;
  kind: string;
  createdAt: string;
}
```

### Update Document

**PUT** `/api/document/[id]`

Update an existing document.

#### Parameters

- `id`: Document ID

#### Request Body

```typescript
{
  title?: string;
  content?: string;
}
```

#### Response

```typescript
{
  id: string;
  title: string;
  content: string;
  kind: string;
  updatedAt: string;
}
```

## Suggestions API

### Get Suggestions

**GET** `/api/suggestions`

Get AI-generated suggestions for document improvements.

#### Query Parameters

- `documentId`: Document ID
- `documentCreatedAt`: Document creation timestamp

#### Response

```typescript
{
  suggestions: Array<{
    id: string;
    originalText: string;
    suggestedText: string;
    description: string;
    isResolved: boolean;
  }>;
}
```

## Vote API

### Vote on Message

**POST** `/api/vote`

Vote on a message (upvote/downvote).

#### Request Body

```typescript
{
  chatId: string;
  messageId: string;
  type: "up" | "down";
}
```

#### Response

- **Status**: 200 on success
- **Body**: `{ success: true }`

## Error Responses

All API endpoints return consistent error responses:

```typescript
{
  error: string;           // Error message
  code?: string;          // Error code
  details?: any;          // Additional error details
}
```

### Common Error Codes

- `unauthorized:chat` - Authentication required
- `forbidden:chat` - Insufficient permissions
- `not_found:chat` - Chat not found
- `rate_limit:chat` - Rate limit exceeded
- `bad_request:api` - Invalid request format
- `bad_request:database` - Database error

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

### User Types and Limits

- **Guest**: 10 messages per day
- **Regular**: 1000 messages per day

### Headers

Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

## Webhooks

The application supports webhooks for real-time updates:

### Stream Events

Server-sent events for real-time AI responses:

- `data-appendMessage`: New message content
- `data-finish`: Stream completion
- `data-error`: Stream error

### Example Event Stream

```
data: {"type":"data-appendMessage","data":"Hello","transient":false}

data: {"type":"data-appendMessage","data":" world!","transient":false}

data: {"type":"data-finish","data":null,"transient":false}
```






