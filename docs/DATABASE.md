# Database Guide

This guide covers the database setup, schema management, and usage of Drizzle ORM in the AI Chatbot application.

## Overview

The application uses:

- **PostgreSQL** as the primary database
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for migrations and schema management
- **Drizzle Studio** for database visualization and management

## Database Schema

### Core Tables

#### Users

```typescript
export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});
```

#### Chats

```typescript
export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});
```

#### Messages

```typescript
export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});
```

#### Documents (Artifacts)

```typescript
export const document = pgTable("Document", {
  id: uuid("id").notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
    .notNull()
    .default("text"),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});
```

## Drizzle ORM Setup

### Configuration

The Drizzle configuration is defined in `drizzle.config.ts`:

```typescript
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
```

### Database Connection

The database connection is established in `lib/db/queries.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);
```

## Drizzle Studio

Drizzle Studio is a powerful web-based database management tool that provides a visual interface for your database.

### Starting Drizzle Studio

```bash
# Start Drizzle Studio
pnpm run db:studio

# Or directly with drizzle-kit
npx drizzle-kit studio
```

### Accessing Drizzle Studio

Once started, Drizzle Studio will be available at:

- **URL**: https://local.drizzle.studio
- **Features**:
  - Visual table browser
  - Data editing capabilities
  - Query execution
  - Schema visualization

### Studio Features

#### Table Browser

- View all tables and their relationships
- Browse data with pagination
- Filter and search capabilities
- Sort by any column

#### Data Management

- **Insert**: Add new records
- **Update**: Edit existing data
- **Delete**: Remove records
- **Bulk Operations**: Select multiple rows

#### Query Interface

- Execute raw SQL queries
- View query results
- Export data to CSV/JSON

#### Schema Visualization

- Visual representation of table relationships
- Foreign key connections
- Column types and constraints

## Database Operations

### Common Queries

#### User Operations

```typescript
// Get user by email
export async function getUser(email: string): Promise<Array<User>> {
  return await db.select().from(user).where(eq(user.email, email));
}

// Create new user
export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);
  return await db.insert(user).values({ email, password: hashedPassword });
}
```

#### Chat Operations

```typescript
// Save chat
export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  return await db.insert(chat).values({
    id,
    createdAt: new Date(),
    userId,
    title,
    visibility,
  });
}

// Get chat by ID
export async function getChatById({ id }: { id: string }) {
  const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
  return selectedChat;
}
```

#### Message Operations

```typescript
// Save messages
export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  return await db.insert(message).values(messages);
}

// Get messages by chat ID
export async function getMessagesByChatId({ id }: { id: string }) {
  return await db
    .select()
    .from(message)
    .where(eq(message.chatId, id))
    .orderBy(asc(message.createdAt));
}
```

## Migrations

### Generating Migrations

```bash
# Generate migration from schema changes
pnpm run db:generate

# Or directly with drizzle-kit
npx drizzle-kit generate
```

### Applying Migrations

```bash
# Apply pending migrations
pnpm run db:migrate

# Or directly
npx tsx lib/db/migrate.ts
```

### Migration Files

Migrations are stored in `lib/db/migrations/` and follow this naming pattern:

- `0000_keen_devos.sql` - Initial migration
- `0001_sparkling_blue_marvel.sql` - Second migration
- `0002_wandering_riptide.sql` - Third migration

### Migration Best Practices

1. **Always generate migrations** after schema changes
2. **Review migration files** before applying
3. **Test migrations** on development database first
4. **Backup production data** before major migrations
5. **Use transactions** for complex migrations

## Database Scripts

### Available Scripts

```bash
# Generate new migration
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Open Drizzle Studio
pnpm run db:studio

# Push schema changes (development only)
pnpm run db:push

# Pull schema from database
pnpm run db:pull

# Check migration status
pnpm run db:check

# Apply pending migrations
pnpm run db:up
```

### Script Descriptions

- **`db:generate`**: Creates migration files from schema changes
- **`db:migrate`**: Applies pending migrations to database
- **`db:studio`**: Opens Drizzle Studio web interface
- **`db:push`**: Pushes schema directly to database (dev only)
- **`db:pull`**: Pulls schema from existing database
- **`db:check`**: Validates migration files
- **`db:up`**: Applies migrations (alias for migrate)

## Type Safety

### Generated Types

Drizzle automatically generates TypeScript types from your schema:

```typescript
// Auto-generated types
export type User = InferSelectModel<typeof user>;
export type Chat = InferSelectModel<typeof chat>;
export type DBMessage = InferSelectModel<typeof message>;
export type Document = InferSelectModel<typeof document>;
```

### Type-Safe Queries

```typescript
// Fully typed query results
const users: User[] = await db.select().from(user);
const chats: Chat[] = await db
  .select()
  .from(chat)
  .where(eq(chat.userId, userId));
```

## Performance Optimization

### Query Optimization

```typescript
// Use select() to limit columns
const chatTitles = await db
  .select({ id: chat.id, title: chat.title })
  .from(chat)
  .where(eq(chat.userId, userId));

// Use joins for related data
const chatsWithUsers = await db
  .select()
  .from(chat)
  .leftJoin(user, eq(chat.userId, user.id));
```

### Indexing

```typescript
// Add indexes for frequently queried columns
export const chat = pgTable(
  "Chat",
  {
    // ... columns
  },
  (table) => ({
    userIdIdx: index("chat_user_id_idx").on(table.userId),
    createdAtIdx: index("chat_created_at_idx").on(table.createdAt),
  })
);
```

## Troubleshooting

### Common Issues

**Migration Errors:**

```bash
# Check migration status
pnpm run db:check

# Reset migrations (development only)
rm -rf lib/db/migrations/*
pnpm run db:generate
```

**Connection Issues:**

- Verify `POSTGRES_URL` in `.env.local`
- Check database server is running
- Ensure network connectivity

**Studio Won't Start:**

- Check if port is available
- Verify database connection
- Try restarting the process

**Type Errors:**

- Regenerate types: `pnpm run db:generate`
- Restart TypeScript server
- Check schema definitions

### Debugging Queries

```typescript
// Enable query logging
const db = drizzle(client, { logger: true });

// Use Drizzle Studio to test queries
// Access at https://local.drizzle.studio
```

## Best Practices

### Schema Design

1. Use descriptive table and column names
2. Add proper constraints and indexes
3. Use UUIDs for primary keys
4. Include timestamps for audit trails

### Query Patterns

1. Use prepared statements for repeated queries
2. Limit result sets with pagination
3. Use transactions for related operations
4. Handle errors gracefully

### Migration Strategy

1. Keep migrations small and focused
2. Test migrations on development first
3. Use descriptive migration names
4. Document breaking changes

### Studio Usage

1. Use Studio for data exploration
2. Test queries before implementing
3. Export data for backups
4. Monitor query performance






