# API Client Pattern

Generate `src/api/client.ts` and `src/api/types.ts`. Adapt to the user's entity, fields, and API base path.

## src/api/client.ts

The client provides:
- Module-scoped bearer token management (`setToken`/`getToken`)
- Generic typed `request<T>()` helper with error handling
- `ApiResponseError` class with status, code, and message
- Idempotency key generation for mutating requests
- ETag support via `If-Match` header
- WebSocket URL builder for real-time events

Replace `{{API_BASE_PATH}}` with the user's API prefix (e.g. `/v1` or `/api/v1`).
Replace `{{ENTITY}}` references with the actual entity names and endpoints.

```typescript
import { v4 as uuidv4 } from 'uuid'
// Import types from ./types — adapt to the user's domain types

let _token: string = ''

export function setToken(token: string) {
  _token = token
}

export function getToken(): string {
  return _token
}

export class ApiResponseError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiResponseError'
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${_token}`,
    ...extraHeaders,
  }

  const res = await fetch(`{{API_BASE_PATH}}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let code = 'unknown_error'
    let message = res.statusText
    try {
      const err = await res.json()
      code = err.code ?? code
      message = err.message ?? message
    } catch {
      // ignore parse error
    }
    throw new ApiResponseError(res.status, code, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function idempotencyKey(): string {
  return uuidv4()
}

// ── API functions ────────────────────────────────────────────────────────────
// Adapt these to the user's entity and endpoints.
// Pattern: GET for reads, POST/PUT/DELETE with idempotency key + If-Match ETag for mutations.

// Example: validate token by calling a lightweight endpoint
export async function getOptions(): Promise<any> {
  return request<any>('GET', '/options')
}

// Example: list with pagination and optional status filter
export async function listItems(params?: {
  status?: string
  limit?: number
  offset?: number
}): Promise<any> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.limit != null) qs.set('limit', String(params.limit))
  if (params?.offset != null) qs.set('offset', String(params.offset))
  const query = qs.toString() ? `?${qs}` : ''
  return request<any>('GET', `/list${query}`)
}

// Example: get single item
export async function getItem(id: string): Promise<any> {
  return request<any>('GET', `/${id}`)
}

// Example: create with idempotency
export async function createItem(req: any): Promise<any> {
  return request<any>('POST', '/create', req, {
    'Idempotency-Key': idempotencyKey(),
  })
}

// Example: update with optimistic concurrency
export async function updateItem(id: string, etag: string, req: any): Promise<any> {
  return request<any>('POST', `/${id}`, req, {
    'Idempotency-Key': idempotencyKey(),
    'If-Match': etag,
  })
}

// Example: delete with concurrency check
export async function deleteItem(id: string, etag: string): Promise<any> {
  return request<any>('DELETE', `/${id}`, undefined, {
    'Idempotency-Key': idempotencyKey(),
    'If-Match': etag,
  })
}

// ── WebSocket ────────────────────────────────────────────────────────────────

export function buildEventsWsUrl(id: string, cursor = '0'): string {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
  const params = new URLSearchParams({ from: cursor, token: _token })
  return `${protocol}://${host}{{API_BASE_PATH}}/${id}/events?${params.toString()}`
}
```

## src/api/types.ts

Generate TypeScript interfaces for the user's domain. Follow these patterns:

```typescript
// Status enum as union type
export type {{Entity}}Status = 'pending' | 'active' | 'failed' // adapt to user's statuses

// Core entity interface
export interface {{Entity}} {
  id: string
  // ... user's fields
  status: {{Entity}}Status
  created_at: string
  updated_at: string
  etag: string
}

// Summary for list view (lighter than full entity)
export interface {{Entity}}Summary {
  id: string
  // ... subset of fields for the table
  status: {{Entity}}Status
  created_at: string
  etag: string
}

// Create request
export interface Create{{Entity}}Request {
  // ... fields needed to create
}

// List response with pagination
export interface ListResponse {
  items: {{Entity}}Summary[]
  total: number
  limit: number
  offset: number
}

// API error shape
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Event for WebSocket stream
export type EventLevel = 'debug' | 'info' | 'warn' | 'error'

export interface {{Entity}}Event {
  id: string
  {{entity}}_id: string
  ts: string
  source: string
  level: EventLevel
  message: string
  attributes?: Record<string, unknown>
}
```

### Guidelines for type generation:
- Use string literal union types for enums (not TypeScript `enum`)
- Include `etag: string` on entities that support optimistic concurrency
- Include `created_at` and `updated_at` as ISO 8601 strings
- Summary types should have fewer fields than the full entity (used in list views)
- Request types should omit server-generated fields (id, etag, timestamps)
