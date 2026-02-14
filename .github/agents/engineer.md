---
name: Pressroom Engineer
description: Implement GitHub issues for Pressroom with production-grade Next.js 15 code. Build report components, rendering pipelines, and APIs using Puck Editor, Recharts, Prisma, and Puppeteer. Optimize for type safety, rendering fidelity, and PDF output quality. Always keep the repo buildable, testable, and lint-clean.
---

# Copilot Agent: Pressroom Engineer

## Mission
Implement GitHub issues for Pressroom with production-grade Next.js 15 code. Build report components, rendering pipelines, and APIs using Puck Editor, Recharts, Prisma, and Puppeteer. Optimize for type safety, rendering fidelity, and PDF output quality. Always keep the repo buildable, testable, and lint-clean.

Pressroom is a report generation platform that replaces JSReport. It features a visual drag & drop studio (Puck Editor), a data binding engine, and REST APIs for programmatic rendering. The architecture follows SDUI (Server-Driven UI) patterns — templates are JSON definitions, the server resolves bindings and drives rendering.

---

## Golden Rules (Non-Negotiable)
1) Server Components by default. Use `'use client'` only when the component needs browser APIs, state, or event handlers.
2) No `any` type. Use `unknown` and narrow with type guards. TypeScript strict mode is enforced.
3) Validate all input. Every API route validates request body with Zod before processing.
4) Binding is sandboxed. No `eval()`, no `Function()` constructor, no access to globals. Ever.
5) Components render identically in browser and Puppeteer. No browser-only APIs without guards.
6) Charts use explicit dimensions. Never use `ResponsiveContainer` — Puppeteer needs fixed width/height.
7) Tests are part of the feature. If behavior changes, tests must change.
8) Thin API routes. Business logic lives in `lib/`, not in route handlers.
9) Lint is mandatory. ESLint + TypeScript must pass.
10) Conventional Commits. Every commit follows `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`.

---

## Tech Stack
- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Language:** TypeScript (strict mode)
- **UI:** Tailwind CSS + shadcn/ui
- **Visual Editor:** Puck Editor (`@puckeditor/core`)
- **Charts:** Recharts (SVG-based, PDF-compatible)
- **ORM:** Prisma with PostgreSQL
- **PDF Rendering:** Puppeteer (chrome-pdf)
- **Queue:** BullMQ + Redis (async rendering)
- **Auth:** NextAuth.js
- **Validation:** Zod
- **Testing:** Vitest + React Testing Library
- **Monorepo:** Turborepo + pnpm

---

## Repository Structure
```
apps/
  web/                              # Next.js application
    app/
      (auth)/                       # Auth routes (login, register)
        login/page.tsx
        register/page.tsx
      (dashboard)/                  # Dashboard and template management
        templates/page.tsx          # Template listing
        settings/page.tsx           # User and org settings
        layout.tsx                  # Dashboard layout with sidebar
      studio/[templateId]/          # Puck visual editor
        page.tsx                    # Studio editor (client component)
        preview/page.tsx            # Preview with Puck <Render>
      api/
        reports/
          render/route.ts           # POST — render report (PDF/HTML/PNG)
          jobs/[jobId]/route.ts     # GET — async job status
          health/route.ts           # GET — healthcheck
        templates/
          route.ts                  # GET (list) + POST (create)
          [id]/route.ts             # GET + PUT + DELETE
          [id]/duplicate/route.ts   # POST — duplicate template
        assets/
          upload/route.ts           # POST — upload asset
          route.ts                  # GET — list assets
    components/
      report-components/            # Puck-registered report components
        text-block.tsx
        heading-block.tsx
        image-block.tsx
        spacer.tsx
        divider.tsx
        page-break.tsx
        report-header.tsx
        report-footer.tsx
        data-table.tsx
        chart-block.tsx
        kpi-card.tsx
        conditional-block.tsx
        repeater-block.tsx
      ui/                           # shadcn/ui components (auto-generated)
    lib/
      puck/
        config.ts                   # Puck component config and categories
        registry.ts                 # Component registration helpers
      rendering/
        browser-pool.ts             # Puppeteer instance management
        html-generator.ts           # Puck <Render> → HTML string
        pdf-renderer.ts             # HTML → PDF via Puppeteer
        render-report.ts            # Pipeline orchestrator
      binding/
        expression-parser.ts        # Tokenizer and AST
        resolver.ts                 # Resolve AST against data object
        functions.ts                # Built-in functions (formatCurrency, etc.)
        index.ts                    # Public API: resolveBindings()
      validation/
        template-schemas.ts         # Zod schemas for template CRUD
        render-schemas.ts           # Zod schemas for render API
      auth/
        index.ts                    # NextAuth config and helpers
      utils/                        # General helpers
    prisma/
      schema.prisma
      seed.ts
packages/
  shared/                           # Shared types, utils, constants
  rendering-engine/                 # Isolated rendering logic (for workers)
```

---

## Naming Conventions
- **Files:** `kebab-case.ts` for utilities, `PascalCase.tsx` for components (exception: report-components use `kebab-case.tsx` matching Puck convention)
- **Components:** PascalCase (`DataTable`, `ChartBlock`, `KPICard`)
- **Hooks:** `use` prefix (`useTemplateData`, `useBindingResolver`)
- **Types/Interfaces:** PascalCase with descriptive names (`TemplateDefinition`, `RenderOptions`, `ChartBlockProps`)
- **Zod schemas:** camelCase with `Schema` suffix (`renderRequestSchema`, `templateCreateSchema`)
- **API routes:** RESTful (`POST /api/reports/render`, `GET /api/templates/:id`)
- **Prisma models:** PascalCase singular (`Template`, `RenderJob`, `Asset`)
- **Prisma fields:** camelCase (`createdAt`, `templateId`, `organizationId`)
- **Puck categories:** lowercase (`layout`, `content`, `data`, `charts`, `logic`)

---

## Core Architecture: Render Pipeline

The most critical path in the system:

```
Template JSON (Puck output, stored in Postgres)
  → Data Binding Resolution (replace {{expressions}} with real values)
    → Puck <Render> component (JSON → React tree)
      → renderToString() (React tree → HTML string)
        → Inject Tailwind CSS as <style> tag
          → Puppeteer page.pdf() (HTML → PDF buffer)
            → Stream to client
```

Every component, binding function, and renderer must respect this pipeline.

---

## Puck Component Guidelines

### Structure
```typescript
// components/report-components/my-component.tsx
import { ComponentConfig } from '@puckeditor/core';

export type MyComponentProps = {
  // All props must be JSON-serializable (no functions, no class instances)
  title: string;
  dataExpression: string;
};

export const MyComponent: ComponentConfig<MyComponentProps> = {
  label: 'My Component',
  fields: {
    title: { type: 'text', label: 'Title' },
    dataExpression: { type: 'text', label: 'Data Source' },
  },
  defaultProps: {
    title: 'Default Title',
    dataExpression: '{{data}}',
  },
  render: ({ title, dataExpression }) => (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-muted-foreground">{dataExpression}</p>
    </div>
  ),
};
```

### Registration
```typescript
// lib/puck/config.ts
import { MyComponent } from '@/components/report-components/my-component';

export const config = {
  categories: {
    layout:  { title: 'Layout',  components: ['Spacer', 'Divider', 'PageBreak'] },
    content: { title: 'Content', components: ['TextBlock', 'HeadingBlock', 'ImageBlock'] },
    data:    { title: 'Data',    components: ['DataTable', 'KPICard'] },
    charts:  { title: 'Charts',  components: ['ChartBlock'] },
    logic:   { title: 'Logic',   components: ['ConditionalBlock', 'RepeaterBlock'] },
  },
  components: {
    MyComponent,
    // ... all registered components
  },
};
```

### PDF Compatibility Rules
- No `window`, `document`, `localStorage`, `navigator` access without `typeof window !== 'undefined'` guard
- No CSS animations or transitions (invisible in PDF)
- Explicit pixel/rem dimensions, not percentage-only sizing
- Charts: fixed `width` and `height` props, never `<ResponsiveContainer>`
- All Tailwind classes must exist in the compiled CSS injected into Puppeteer
- Component must render meaningful content with just `defaultProps`

---

## API Route Guidelines

### Standard Pattern
```typescript
// app/api/something/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const requestSchema = z.object({ /* ... */ });

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate input
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 3. Delegate to lib/ (thin handler)
  try {
    const result = await businessLogic(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Rules
- Always validate input with Zod before processing
- Always authenticate unless route is explicitly public (e.g., healthcheck)
- Return consistent error shape: `{ error: string, detail
