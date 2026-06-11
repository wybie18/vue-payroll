---
name: vue-supabase-service
description: >
  Write Supabase service files for Vue.js projects following a strict, consistent
  architecture: typed service functions, shared response types, RPC calls, paginated
  queries with filters, and helper utilities in their own folder. Use this skill
  whenever the user wants to create, edit, or scaffold any Supabase service,
  query, mutation, RPC call, auth flow, or helper in a Vue.js/TypeScript project —
  even if they just say "add a service for X", "write a supabase query for Y",
  "create a helper for Z", or "how do I call an RPC in Vue". Always use this skill
  for anything touching `src/services/`, `src/types/`, or `src/helpers/` in a
  Vue + Supabase context.
---

# Vue + Supabase Service Skill

This skill produces Supabase service files that follow the project's established
architecture. Read `references/examples.md` for annotated, copy-paste-ready code
for every pattern. The rules below tell you *why* and *when* to use each one.

---

## Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Supabase client (already exists — don't recreate)
├── types/
│   ├── response.types.ts    # ServiceResponse, PaginatedResponse, AuthResponse
│   ├── auth.types.ts        # AuthCredentials, AuthResponse
│   └── <domain>.types.ts    # One file per domain (e.g. user.types.ts)
├── helpers/
│   └── <name>.helper.ts     # Pure utility functions (no Supabase calls here)
└── services/
    └── <domain>.service.ts  # All Supabase calls for a domain
```

---

## Non-negotiable conventions

**1. Every function returns a typed response wrapper — never throw, never return raw data.**

```ts
// ✅ Always
return { data, error }

// ❌ Never
throw error
return data
```

**2. Import the shared types, never redefine them inline.**

```ts
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type { AuthResponse } from '@/types/auth.types'
```

**3. Section headers use the banner comment style.**

```ts
// ─── Section Name ─────────────────────────────────────────────────────────────
```

Use `─` (U+2500) for the dashes — not hyphens. This is part of the project's
visual identity and makes files scannable at a glance.

**4. Types go in `src/types/`, helpers go in `src/helpers/`.**

- `types/`: interfaces, type aliases, enums — nothing executable
- `helpers/`: pure functions used across services (e.g. mappers, formatters, param builders)
- `services/`: functions that call Supabase

---

## Response Types Reference

These live in `src/types/response.types.ts`. Create this file if it doesn't exist.

```ts
import type { PostgrestError } from '@supabase/supabase-js'

export interface ServiceResponse<T = null> {
  data: T
  error: PostgrestError | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  error: PostgrestError | null
}
```

Auth responses live in `src/types/auth.types.ts`:

```ts
import type { AuthError } from '@supabase/supabase-js'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResponse<T = null> {
  data: T
  error: AuthError | null
}
```

---

## The Five Core Patterns

### 1. Basic CRUD

See `references/examples.md` → **CRUD** section.

- `getById` → `.maybeSingle()` → `ServiceResponse<T | null>`
- `create` → `.insert().select().single()` → `ServiceResponse<T>`
- `update` → `.update().eq().select().single()` → `ServiceResponse<T>`
- `delete` → `.delete().eq()` → `ServiceResponse<null>`

### 2. Paginated list with search / filters

See `references/examples.md` → **Paginated List** section.

Key points:
- Accept a params object with defaults: `{ page = 1, pageSize = 10, search = '' }`
- Calculate `from` / `to` with `(page - 1) * pageSize` and `from + pageSize - 1`
- Add `{ count: 'exact' }` to `.select()`
- Apply `.range(from, to)` on the query
- Apply filters conditionally *after* building the base query:
  ```ts
  if (search.trim()) {
    query = query.ilike('column_name', `%${search.trim()}%`)
  }
  ```
- On error, return `{ data: [], count: 0, error }`
- Map raw rows to the typed shape explicitly — don't cast with `as T[]`

### 3. RPC calls

See `references/examples.md` → **RPC** section.

```ts
const { data, error } = await supabase.rpc('function_name', { param1, param2 })
return { data: data ?? fallback, error }
```

- Use `ServiceResponse<T>` for scalar/object RPCs
- Use `PaginatedResponse<T>` only if the RPC returns a counted list
- Always provide a safe fallback for `data ?? fallback`

### 4. Auth service

See `references/examples.md` → **Auth** section.

- Use `AuthResponse<T>` (not `ServiceResponse`) for all `supabase.auth.*` calls
- Profile reads/writes use `ServiceResponse` (they go through the `profiles` table)
- The `setupInvitedUser` pattern: update auth first, then update the profile row

### 5. Helpers

See `references/examples.md` → **Helpers** section.

- Helpers are pure functions — no Supabase imports
- Name the file `<what-it-does>.helper.ts`
- Export named functions only (no default export)
- Common uses: row-to-type mappers, query param builders, date formatters

---

## How to approach a new service request

1. **Identify the domain** (e.g. "commodities", "orders", "users")
2. **Create or extend** `src/types/<domain>.types.ts` with the domain's interfaces
3. **Create** `src/services/<domain>.service.ts` — import from `@/lib/supabase` and `@/types/`
4. **Add helpers** to `src/helpers/` only if logic is reusable or non-trivial
5. **Check** whether `response.types.ts` / `auth.types.ts` exist — create them if not

When a user asks to "add X to the service", extend the existing file rather than
creating a new one. Keep one service file per domain.

---

## Read next

For copy-paste-ready code for every pattern above:
→ `references/examples.md`
