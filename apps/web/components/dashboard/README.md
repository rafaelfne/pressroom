# Dashboard Layout and Template Management

This directory contains the dashboard layout and template management components for the Pressroom app.

## Architecture Overview

```
apps/web/
├── app/(dashboard)/          # Dashboard route group
│   ├── layout.tsx           # Sidebar layout for all dashboard pages
│   └── templates/
│       ├── page.tsx         # Templates listing (Server Component)
│       └── loading.tsx      # Loading skeleton
├── components/dashboard/     # Reusable dashboard components
│   ├── template-card.tsx    # Individual template card (Client Component)
│   ├── template-grid.tsx    # Grid layout for templates (Server Component)
│   ├── template-search.tsx  # Debounced search input (Client Component)
│   └── empty-state.tsx      # Empty state UI (Server Component)
└── lib/templates/
    └── actions.ts           # Server Actions for template CRUD
```

## Features

### 1. Server Actions (`lib/templates/actions.ts`)

All template mutations and queries use Next.js Server Actions:

- **`createTemplate(formData)`** - Creates a new template with default values and redirects to studio
- **`deleteTemplate(id)`** - Soft-deletes a template (sets `deletedAt` timestamp)
- **`duplicateTemplate(id)`** - Creates a copy with "Copy of" prefix
- **`getTemplates(params)`** - Fetches templates with:
  - Full-text search (case-insensitive) on name and description
  - Tag filtering (comma-separated list)
  - Pagination (default 12 per page)
  - Sorting (default: updatedAt DESC)
  - Auto-excludes soft-deleted templates

### 2. Dashboard Layout

- **Responsive sidebar**
  - 64px width on mobile (icons only)
  - 240px width on desktop (with labels)
  - Fixed positioning with proper z-index
- **Navigation links**
  - Templates (FileText icon)
  - Settings (Settings icon)
- **Main content area** with container and padding

### 3. Templates Listing Page

Server Component that:
- Uses Next.js 15 async `searchParams` API
- Shows header with "New Template" button
- Renders search input when templates exist
- Shows empty state when no templates
- Shows "no results" message when search returns empty
- Passes data to `TemplateGrid` component

### 4. Template Card

Client Component with:
- **Visual elements**
  - Truncated name (clickable to studio)
  - Description (2-line clamp)
  - Tags (max 3 shown, "+N more" text)
  - Last updated date
- **Dropdown menu** (hover to reveal)
  - Edit → Links to studio
  - Duplicate → Server Action
  - Download JSON → Client-side download
  - Delete → Server Action (destructive style)
- **Filename sanitization** for downloads
  - Replaces non-alphanumeric with hyphens
  - Removes consecutive hyphens
  - Trims leading/trailing hyphens
  - Fallback to "template" if empty

### 5. Template Search

Client Component with:
- Debounced input (300ms delay)
- Updates URL query parameters
- Resets to page 1 on new search
- Search icon inside input field
- Uses Next.js 15 navigation hooks

### 6. Loading State

Shows skeleton UI matching the actual page layout with:
- Header skeletons
- Search skeleton
- 6 template card skeletons in grid

## Type Safety

All components use TypeScript strict mode:
- No `any` types
- Proper Prisma type casting for JSON fields
- Explicit type annotations for all exports
- Type-safe server actions

## Server/Client Component Strategy

- **Server Components by default** for data fetching and static UI
- **Client Components only when needed** for:
  - Interactive dropdown menus (`template-card.tsx`)
  - Debounced search input (`template-search.tsx`)

## URL-Based State Management

Search and filter state is managed via URL query parameters:
- `?search=query` - Search term
- `?tags=tag1,tag2` - Comma-separated tags
- `?page=2` - Page number
- `?sortBy=name` - Sort field
- `?sortOrder=asc` - Sort direction

This enables:
- Shareable URLs
- Browser back/forward navigation
- Bookmarkable searches

## Styling

All components use Tailwind CSS with:
- Responsive breakpoints (mobile-first)
- shadcn/ui components for consistency
- `cn()` utility for conditional classes
- Proper spacing and typography

## Error Handling

- Server Actions throw descriptive errors with context
- Template not found errors include template ID
- Form validation errors are descriptive
- Filename sanitization handles edge cases

## Performance

- Server Components reduce client JS
- Debounced search prevents excessive queries
- Pagination limits results per page
- Loading skeletons improve perceived performance

## Future Enhancements

- [ ] Add authentication checks to server actions
- [ ] Add organization-scoped filtering
- [ ] Add pagination controls to UI
- [ ] Add tag management UI
- [ ] Add toast notifications for actions
- [ ] Add confirmation dialogs for delete
- [ ] Add keyboard shortcuts
- [ ] Add bulk actions (multi-select)
- [ ] Add template preview thumbnails
- [ ] Add sorting UI controls
