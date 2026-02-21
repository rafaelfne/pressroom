# Style Guide API Architecture

## Request Flow

```
Client Request
     |
     v
┌─────────────────────────────────────────────┐
│  API Route (apps/web/app/api/style-guides/) │
│  - Authenticate (NextAuth session)          │
│  - Validate input (Zod schemas)             │
│  - Catch errors                             │
└──────────────────┬──────────────────────────┘
                   |
                   v
┌─────────────────────────────────────────────┐
│  Business Logic (apps/web/lib/style-guides) │
│  - createStyleGuide()                       │
│  - listStyleGuides()                        │
│  - getStyleGuide()                          │
│  - updateStyleGuide()                       │
│  - deleteStyleGuide()                       │
│  - cloneStyleGuide()                        │
└──────────────────┬──────────────────────────┘
                   |
                   v
┌─────────────────────────────────────────────┐
│  Prisma ORM (apps/web/lib/prisma)           │
│  - styleGuide.create()                      │
│  - styleGuide.findMany()                    │
│  - styleGuide.findUnique()                  │
│  - styleGuide.update()                      │
│  - styleGuide.delete()                      │
│  - template.updateMany()                    │
└──────────────────┬──────────────────────────┘
                   |
                   v
┌─────────────────────────────────────────────┐
│  PostgreSQL Database                        │
│  - style_guides table                       │
│  - style_tokens table                       │
│  - templates table (for disconnect)         │
└─────────────────────────────────────────────┘
```

## Data Models

```
┌─────────────────────────────────────┐
│ StyleGuide                          │
├─────────────────────────────────────┤
│ id: string (cuid)                   │
│ name: string                        │
│ organizationId: string              │
│ isDefault: boolean                  │
│ createdAt: DateTime                 │
│ updatedAt: DateTime                 │
│                                     │
│ Relations:                          │
│ - organization: Organization        │
│ - tokens: StyleToken[] (cascade)    │
│ - templates: Template[]             │
└──────────────┬──────────────────────┘
               │
               │ 1:N (cascade delete)
               v
┌─────────────────────────────────────┐
│ StyleToken                          │
├─────────────────────────────────────┤
│ id: string (cuid)                   │
│ styleGuideId: string                │
│ name: string (unique per guide)     │
│ label: string                       │
│ category: TokenCategory             │
│ cssProperty: string                 │
│ value: string                       │
│ sortOrder: int                      │
│                                     │
│ Relations:                          │
│ - styleGuide: StyleGuide            │
└─────────────────────────────────────┘
```

## API Endpoints

### POST /api/style-guides
**Purpose**: Create new style guide  
**Auth**: Required  
**Body**: `styleGuideCreateSchema`
```typescript
{
  name: string;
  organizationId: string;
  isDefault?: boolean;
  tokens?: StyleToken[];
}
```
**Response**: `201` with created StyleGuide  
**Side Effects**: Unsets other defaults if `isDefault=true`

---

### GET /api/style-guides?organizationId=xxx
**Purpose**: List all style guides for an organization  
**Auth**: Required  
**Query Params**: `organizationId` (required)  
**Response**: `200` with `{ data: StyleGuide[] }`  
**Sorting**: Default first, then by createdAt DESC

---

### GET /api/style-guides/[id]
**Purpose**: Get single style guide with tokens  
**Auth**: Required  
**Response**: `200` with StyleGuide or `404`

---

### PUT /api/style-guides/[id]
**Purpose**: Update style guide  
**Auth**: Required  
**Body**: `styleGuideUpdateSchema`
```typescript
{
  name?: string;
  isDefault?: boolean;
  tokens?: StyleToken[]; // Replaces ALL tokens
}
```
**Response**: `200` with updated StyleGuide or `404`  
**Side Effects**: 
- Unsets other defaults if `isDefault=true`
- Replaces ALL tokens if provided (deleteMany + create)

---

### DELETE /api/style-guides/[id]
**Purpose**: Delete style guide  
**Auth**: Required  
**Response**: `200` with `{ message, affectedTemplates }` or `404`  
**Side Effects**:
- Disconnects templates (sets `styleGuideId: null`)
- Deletes style guide
- Cascades to tokens automatically

---

## Business Logic Functions

### createStyleGuide(data)
```typescript
// 1. If isDefault=true, unset other defaults in org
await prisma.styleGuide.updateMany({
  where: { organizationId, isDefault: true },
  data: { isDefault: false }
});

// 2. Create style guide with nested tokens
await prisma.styleGuide.create({
  data: {
    name, organizationId, isDefault,
    tokens: { create: [...] }
  },
  include: { tokens: true }
});
```

### listStyleGuides(organizationId)
```typescript
await prisma.styleGuide.findMany({
  where: { organizationId },
  include: { tokens: { orderBy: { sortOrder: 'asc' } } },
  orderBy: [
    { isDefault: 'desc' },  // Default first
    { createdAt: 'desc' }
  ]
});
```

### getStyleGuide(id)
```typescript
await prisma.styleGuide.findUnique({
  where: { id },
  include: { tokens: { orderBy: { sortOrder: 'asc' } } }
});
```

### updateStyleGuide(id, data)
```typescript
// 1. Get existing to know organization
const existing = await prisma.styleGuide.findUnique({ where: { id } });

// 2. If setting as default, unset others
if (data.isDefault === true) {
  await prisma.styleGuide.updateMany({
    where: { organizationId, isDefault: true, id: { not: id } },
    data: { isDefault: false }
  });
}

// 3. Update with token replacement
await prisma.styleGuide.update({
  where: { id },
  data: {
    name: data.name,
    isDefault: data.isDefault,
    tokens: data.tokens ? {
      deleteMany: {},  // Remove all existing
      create: [...]     // Add new ones
    } : undefined
  },
  include: { tokens: true }
});
```

### deleteStyleGuide(id)
```typescript
// 1. Disconnect templates
const affected = await prisma.template.updateMany({
  where: { styleGuideId: id },
  data: { styleGuideId: null }
});

// 2. Delete style guide (tokens cascade)
await prisma.styleGuide.delete({ where: { id } });

// 3. Return affected count
return affected.count;
```

### cloneStyleGuide(sourceId, targetOrgId)
```typescript
// 1. Get source with tokens
const source = await prisma.styleGuide.findUnique({
  where: { id: sourceId },
  include: { tokens: true }
});

// 2. Create clone in target org
await prisma.styleGuide.create({
  data: {
    name: source.name,
    organizationId: targetOrgId,
    isDefault: false,  // Never clone as default
    tokens: { create: source.tokens.map(...) }
  }
});
```

## Validation Layer

All inputs validated with Zod schemas from `@/lib/validation/style-guide-schemas`:

```typescript
styleGuideCreateSchema = z.object({
  name: z.string().min(1),
  organizationId: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
  tokens: z.array(styleTokenSchema).optional()
});

styleGuideUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
  tokens: z.array(styleTokenSchema).optional()
});

styleTokenSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),  // kebab-case
  label: z.string().min(1),
  category: z.enum(['color', 'typography', 'spacing', 'background', 'border']),
  cssProperty: z.string().min(1),
  value: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0)
});
```

## Error Handling

### Standard Error Response
```typescript
{
  error: string;           // Human-readable message
  details?: unknown;       // Validation errors from Zod
}
```

### HTTP Status Codes
- `200 OK` — Successful GET, PUT, DELETE
- `201 Created` — Successful POST
- `400 Bad Request` — Validation failed
- `401 Unauthorized` — Not authenticated
- `404 Not Found` — Style guide doesn't exist
- `500 Internal Server Error` — Unexpected error

### Error Flow
```typescript
try {
  // Business logic
} catch (error) {
  console.error('[API] Error:', error);  // Log details
  
  // Check for specific Prisma errors
  if (error.code === 'P2025') {
    return 404;  // Not found
  }
  
  return 500;  // Generic error
}
```

## Testing Strategy

### Unit Tests (Vitest + Mocks)
```typescript
// Mock auth
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    styleGuide: { create, findMany, ... },
    template: { updateMany }
  }
}));

// Test each route
describe('POST /api/style-guides', () => {
  it('returns 401 when not authenticated', ...);
  it('returns 400 for invalid input', ...);
  it('creates style guide successfully', ...);
});
```

### Test Coverage
- ✅ Authentication (401)
- ✅ Validation (400)
- ✅ Success paths (200, 201)
- ✅ Not found (404)
- ✅ Business logic (defaults, tokens, templates)

## Integration Points

### Template System
Templates reference style guides:
```typescript
model Template {
  styleGuideId: string?;
  styleGuide: StyleGuide?;
}
```

When style guide is deleted:
1. Templates are disconnected (`styleGuideId: null`)
2. Template rendering falls back to inline styles

### Puck Editor
Style tokens used in component props:
```typescript
{
  color: {
    mode: 'token',
    token: 'text-primary'  // References StyleToken.name
  }
}
```

Style resolution happens at render time:
```typescript
resolveStylableValue(value, styleGuide.tokens)
```

### Organization System
Style guides belong to organizations:
- One organization can have many style guides
- Only one default per organization
- Users need org membership to access

## Performance Considerations

### Database Queries
- Single query for create (with nested tokens)
- Single query for list (with included tokens)
- Single query for get (with included tokens)
- Two queries for update (check + update)
- Two queries for delete (disconnect + delete)

### Indexes
```sql
CREATE INDEX idx_style_guides_organizationId ON style_guides(organizationId);
CREATE INDEX idx_style_tokens_styleGuideId ON style_tokens(styleGuideId);
CREATE UNIQUE INDEX idx_style_tokens_guide_name ON style_tokens(styleGuideId, name);
```

### N+1 Prevention
All queries use `include` to eager-load tokens:
```typescript
prisma.styleGuide.findMany({
  include: { tokens: true }  // Single query, not N+1
});
```

## Security

### Authentication
All routes check session:
```typescript
const session = await auth();
if (!session?.user?.id) {
  return 401;
}
```

### Input Validation
All inputs validated with Zod:
```typescript
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return 400;
}
```

### SQL Injection
Prevented by Prisma ORM (parameterized queries)

### Authorization
Currently missing — future work:
- Check organization membership
- Check role permissions
- Check template ownership
