# Artifact Creation and Management Guide

This guide explains how to create, save, and manage artifacts in the AI chatbot application.

## What are Artifacts?

Artifacts are interactive documents that appear alongside the chat conversation. They provide a dedicated workspace for content creation, editing, and collaboration. The system supports four types of artifacts:

- **Text**: For essays, emails, and other written content
- **Code**: For code snippets with execution capabilities (Python)
- **Image**: For image generation and editing
- **Sheet**: For spreadsheet-like data manipulation

## How Artifacts Work

### 1. Creation Process

Artifacts are created through the AI assistant using the `createDocument` tool. Here's the flow:

```
User Request → AI Processing → Tool Execution → UI Display → Database Save
     ↓              ↓              ↓              ↓              ↓
"Write code" → Analyzes request → createDocument → Artifact shows → Version saved
     ↓              ↓              ↓              ↓              ↓
"Create email" → Determines type → Generates ID → Content streams → User can edit
     ↓              ↓              ↓              ↓              ↓
"Make document" → Selects handler → Streams data → Real-time updates → Auto-save
```

**Detailed Flow:**

1. **User Request**: User asks AI to create content
2. **AI Processing**: AI determines appropriate artifact type and uses `createDocument` tool
3. **Tool Execution**: Tool generates unique ID and streams artifact metadata
4. **UI Display**: Artifact appears in the interface with real-time content updates
5. **Database Save**: Document is automatically saved with versioning support

### 2. Data Structure

Each artifact has the following structure:

```typescript
interface UIArtifact {
  title: string; // Display name
  documentId: string; // Unique identifier
  kind: ArtifactKind; // 'text' | 'code' | 'image' | 'sheet'
  content: string; // The actual content
  isVisible: boolean; // Whether artifact is shown
  status: "streaming" | "idle"; // Current state
  boundingBox: {
    // UI positioning
    top: number;
    left: number;
    width: number;
    height: number;
  };
}
```

### 3. Database Storage

Artifacts are stored in the `Document` table with versioning support:

```sql
CREATE TABLE Document (
  id UUID NOT NULL,
  createdAt TIMESTAMP NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  kind VARCHAR CHECK (kind IN ('text', 'code', 'image', 'sheet')),
  userId UUID NOT NULL REFERENCES User(id),
  PRIMARY KEY (id, createdAt)  -- Composite key for versioning
);
```

## Creating Artifacts

### For Users

1. **Request Content Creation**: Ask the AI to create specific content

   - "Write a Python script to analyze data"
   - "Create an email template for customer outreach"
   - "Generate a markdown document about project planning"

2. **AI Processing**: The AI will:

   - Determine the appropriate artifact type
   - Use the `createDocument` tool
   - Generate content in real-time
   - Display the artifact in the UI

3. **Interaction**: Once created, you can:
   - Edit content directly
   - Use toolbar actions (copy, run code, etc.)
   - Request modifications
   - View version history

### For Developers

#### Creating a New Artifact Type

1. **Define the Artifact Class**:

```typescript
// artifacts/my-type/client.tsx
export const myTypeArtifact = new Artifact<"my-type", MyMetadata>({
  kind: "my-type",
  description: "Description of what this artifact does",

  // Initialize metadata when artifact loads
  initialize: async ({ documentId, setMetadata }) => {
    // Load any required data
  },

  // Handle streaming data from AI
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === "data-myTypeDelta") {
      setArtifact((draft) => ({
        ...draft,
        content: streamPart.data,
        status: "streaming",
      }));
    }
  },

  // Render the artifact content
  content: ({ content, mode, onSaveContent, ...props }) => {
    return <MyCustomEditor content={content} onSave={onSaveContent} />;
  },

  // Define available actions
  actions: [
    {
      icon: <MyIcon />,
      description: "Action description",
      onClick: ({ content }) => {
        // Handle action
      },
    },
  ],

  // Define toolbar items
  toolbar: [
    {
      icon: <ToolbarIcon />,
      description: "Toolbar action",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [{ type: "text", text: "Request for AI" }],
        });
      },
    },
  ],
});
```

2. **Add to Artifact Definitions**:

```typescript
// components/artifact.tsx
export const artifactDefinitions = [
  textArtifact,
  codeArtifact,
  imageArtifact,
  sheetArtifact,
  myTypeArtifact, // Add your new artifact
];
```

3. **Create Server Handler**:

```typescript
// artifacts/my-type/server.ts
export const myTypeDocumentHandler = createDocumentHandler({
  kind: "my-type",
  onCreateDocument: async ({ id, title, dataStream, session }) => {
    // Generate initial content
    const content = await generateMyTypeContent(title);

    // Stream content to UI
    dataStream.write({
      type: "data-myTypeDelta",
      data: content,
      transient: true,
    });

    return content;
  },
  onUpdateDocument: async ({ document, description, dataStream, session }) => {
    // Handle updates
    const updatedContent = await updateMyTypeContent(
      document.content,
      description
    );

    dataStream.write({
      type: "data-myTypeDelta",
      data: updatedContent,
      transient: true,
    });

    return updatedContent;
  },
});
```

4. **Register Handler**:

```typescript
// lib/artifacts/server.ts
export const documentHandlersByArtifactKind = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
  myTypeDocumentHandler, // Add your handler
];
```

## Saving and Persistence

### Automatic Saving

Artifacts are automatically saved when:

1. **Content Changes**: Debounced saving (2-second delay) when user edits
2. **AI Updates**: Immediate save when AI modifies content
3. **Version Creation**: Each save creates a new version

### Manual Saving

Users can trigger saves by:

1. **Direct Editing**: Changes are auto-saved
2. **AI Requests**: Using toolbar actions to request AI modifications
3. **Copy Actions**: Content can be copied to clipboard

### Version Management

- Each save creates a new database entry with the same `id` but different `createdAt`
- Users can navigate between versions using the artifact actions
- Diff view shows changes between versions
- Only the latest version is editable

## API Endpoints

### Document Management

```typescript
// GET /api/document?id={documentId}
// Retrieves all versions of a document

// POST /api/document?id={documentId}
// Creates/updates a document version
// Body: { title: string, content: string, kind: ArtifactKind }

// DELETE /api/document?id={documentId}&timestamp={timestamp}
// Deletes document versions after specified timestamp
```

### User Artifacts

```typescript
// GET /api/user-artifact
// Retrieves the user's most recent artifact for sidebar display
// Returns null if user has no artifacts
// Requires authentication
```

## Best Practices

### For Content Creation

1. **Use Appropriate Artifact Types**:

   - Text: Essays, emails, documentation
   - Code: Scripts, functions, algorithms
   - Image: Visual content generation
   - Sheet: Data analysis, tables

2. **Provide Clear Instructions**:

   - Be specific about content requirements
   - Mention desired format or structure
   - Request specific features (comments, logs, etc.)

3. **Iterative Improvement**:
   - Start with basic content
   - Use toolbar actions for enhancements
   - Request specific modifications

### For Development

1. **Streaming Performance**:

   - Use appropriate chunk sizes for streaming
   - Implement proper debouncing for saves
   - Handle loading states gracefully

2. **Error Handling**:

   - Provide fallbacks for failed operations
   - Show meaningful error messages
   - Implement retry mechanisms

3. **User Experience**:
   - Show saving indicators
   - Provide clear action feedback
   - Maintain responsive UI during operations

## Troubleshooting

### Common Issues

1. **Artifact Not Appearing**:

   - Check if AI used `createDocument` tool
   - Verify artifact kind is supported
   - Check browser console for errors
   - Ensure user is authenticated (artifacts require login)

2. **Artifact Not Showing in Sidebar**:

   - Verify `/api/user-artifact` endpoint is working
   - Check if artifact was saved to database
   - Ensure user has at least one artifact
   - Check browser network tab for failed API calls

3. **Content Not Saving**:

   - Verify user authentication
   - Check network connectivity
   - Look for API errors in console
   - Ensure database connection is working

4. **Version Navigation Issues**:
   - Ensure document has multiple versions
   - Check if user has edit permissions
   - Verify artifact is in correct state

### Debug Information

- Check browser developer tools for API calls
- Monitor network tab for failed requests
- Review console logs for JavaScript errors
- Verify database entries for document versions

## Examples

### Creating a Text Document

```
User: "Write a professional email template for following up with clients"

AI Response: Uses createDocument tool with:
- title: "Client Follow-up Email Template"
- kind: "text"
- Generates email content with placeholders
```

### Creating a Code Artifact

```
User: "Create a Python function to calculate fibonacci numbers"

AI Response: Uses createDocument tool with:
- title: "Fibonacci Calculator"
- kind: "code"
- Generates Python code with proper formatting
- Includes run button for execution
```

### Updating an Existing Artifact

```
User: "Add error handling to the fibonacci function"

AI Response: Uses updateDocument tool with:
- id: [existing document ID]
- description: "Add error handling for invalid inputs"
- Updates the code with try-catch blocks
```

## Quick Reference

### For Users

- **Create Artifact**: Ask AI to "write code", "create document", "make email template"
- **Edit Content**: Click in artifact area to edit directly
- **Save Changes**: Changes auto-save after 2 seconds of inactivity
- **View Versions**: Use arrow buttons to navigate between versions
- **Copy Content**: Use copy button in artifact actions
- **Run Code**: Use play button for Python code execution

### For Developers

- **Add New Type**: Create client/server handlers, register in artifact definitions
- **Modify Existing**: Update artifact class, actions, or toolbar items
- **Debug Issues**: Check browser console, network tab, database entries
- **API Endpoints**: `/api/document` for CRUD operations, `/api/user-artifact` for sidebar

### Common Commands

```bash
# Check artifact-related files
find . -name "*artifact*" -type f

# View database schema
grep -A 20 "document.*pgTable" lib/db/schema.ts

# Test artifact creation
# Use browser dev tools to monitor /api/document calls
```

This documentation provides a comprehensive guide to understanding and working with the artifact system in the AI chatbot application.
