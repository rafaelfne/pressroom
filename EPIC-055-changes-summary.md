# EPIC-055: Template Access Model Migration - Implementation Summary

## Overview
Updated all template API routes and actions to use the new access model where:
- Templates have an `ownerId` field (instead of `createdById`)
- Users no longer have `organizationId` field
- New `TemplateAccess` model enables per-template sharing
- Access check: User can access a template if they are the owner OR have a TemplateAccess row

## Files Modified

### 1. `/apps/web/app/api/templates/route.ts`

#### POST Handler (Create Template)
- **Removed**: User lookup for `organizationId`
- **Changed**: Set `ownerId: session.user.id` instead of `createdById: session.user.id`
- **Added**: Support for optional `organizationId` from request body

#### GET Handler (List Templates)
- **Removed**: User lookup for `organizationId`
- **Changed**: Filter templates using new access model:
  ```typescript
  where: {
    deletedAt: null,
    OR: [
      { ownerId: session.user.id },
      { accesses: { some: { userId: session.user.id } } }
    ]
  }
  ```
- **Added**: Include `organization` and `owner` relations in response
- **Fixed**: Search and tags filters now use `AND` clause to work with `OR` access check

### 2. `/apps/web/app/api/templates/[id]/route.ts`

#### GET Handler (Get Single Template)
- **Removed**: User lookup for `organizationId`
- **Changed**: Access check using OR pattern (owner or has access)

#### PUT Handler (Update Template)
- **Removed**: User lookup for `organizationId`
- **Changed**: Access check using OR pattern (owner or has access)

#### DELETE Handler (Delete Template)
- **Removed**: User lookup for `organizationId`
- **Changed**: Access check using OR pattern (owner or has access)
- **Added**: Owner-only check - only template owner can delete (returns 403 if not owner)

### 3. `/apps/web/app/api/templates/[id]/duplicate/route.ts`

#### POST Handler (Duplicate Template)
- **Removed**: User lookup for `organizationId`
- **Changed**: Access check using OR pattern (owner or has access)
- **Changed**: Set `ownerId: session.user.id` instead of `createdById: session.user.id`
- **Kept**: Original `organizationId` from source template

### 4. `/apps/web/lib/templates/actions.ts`

#### `createTemplate` Server Action
- **Added**: Import and use `auth()` from `@/lib/auth`
- **Added**: Authentication check (throws error if not logged in)
- **Added**: Set `ownerId: session.user.id` when creating template

#### `getTemplates` Server Action
- **Added**: Import and use `auth()` from `@/lib/auth`
- **Added**: Authentication check (throws error if not logged in)
- **Changed**: Filter using new access model with OR pattern
- **Fixed**: Search and tags filters now use `AND` clause

### 5. `/apps/web/app/api/reports/render/route.ts`

#### POST Handler (Render Report)
- **Removed**: User lookup for `organizationId`
- **Removed**: Organization check (`User has no organization` error)
- **Changed**: Template lookup using new access model with OR pattern
- **Simplified**: Direct access check without organization validation

### 6. `/apps/web/lib/validation/template-schemas.ts`

#### `templateCreateSchema`
- **Added**: Optional `organizationId` field to support creating templates with specific organization

## Access Control Pattern

All routes now use this consistent pattern:

```typescript
const template = await prisma.template.findFirst({
  where: {
    id: templateId,
    deletedAt: null,
    OR: [
      { ownerId: session.user.id },
      { accesses: { some: { userId: session.user.id } } }
    ]
  }
});
```

## Delete Authorization

Only template owners can delete:

```typescript
if (existing.ownerId !== session.user.id) {
  return NextResponse.json(
    { error: 'Forbidden: Only the template owner can delete' }, 
    { status: 403 }
  );
}
```

## Testing Checklist

- [ ] Template creation sets correct ownerId
- [ ] Template listing shows owned templates
- [ ] Template listing shows shared templates (via TemplateAccess)
- [ ] Template GET works for owner
- [ ] Template GET works for users with TemplateAccess
- [ ] Template GET fails for unauthorized users
- [ ] Template UPDATE works for owner
- [ ] Template UPDATE works for users with TemplateAccess
- [ ] Template DELETE works for owner only
- [ ] Template DELETE fails for non-owners (even with TemplateAccess)
- [ ] Template DUPLICATE works for owner
- [ ] Template DUPLICATE works for users with TemplateAccess
- [ ] Report rendering works with new access model
- [ ] Server actions (createTemplate, getTemplates) work correctly
- [ ] Organization information still displays correctly in listings

## Migration Notes

- All template access is now based on ownership + explicit sharing
- Organization field is optional and informational only
- No breaking API changes - all endpoints maintain same request/response structure
- Template responses now include `owner` relation data for UI display

## Verification Commands

```bash
# Type check
pnpm tsc --noEmit

# Lint check
pnpm eslint app/api/templates/ app/api/reports/render/ lib/templates/actions.ts --max-warnings 0

# Run tests
pnpm test
```
