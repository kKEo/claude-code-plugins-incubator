# Pinia Store Patterns

Generate stores using the Composition API pattern (`defineStore('name', () => {...})`).

## Auth Store — `src/stores/auth.ts`

Adapt `TOKEN_KEY` and the probe endpoint. The pattern is: persist token in sessionStorage, validate by calling a lightweight endpoint, redirect on failure.

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setToken, getOptions } from '@/api/client'

const TOKEN_KEY = '{{project_name}}_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(sessionStorage.getItem(TOKEN_KEY) ?? '')
  const isAuthenticated = ref<boolean>(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Restore token from session on init
  if (token.value) {
    setToken(token.value)
    isAuthenticated.value = true
  }

  async function login(newToken: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      setToken(newToken)
      await getOptions() // probe — throws on 401
      token.value = newToken
      isAuthenticated.value = true
      sessionStorage.setItem(TOKEN_KEY, newToken)
      return true
    } catch (err: unknown) {
      setToken('')
      isAuthenticated.value = false
      error.value = err instanceof Error ? err.message : 'Invalid token'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = ''
    isAuthenticated.value = false
    setToken('')
    sessionStorage.removeItem(TOKEN_KEY)
  }

  return { token, isAuthenticated, loading, error, login, logout }
})
```

## CRUD Entity Store — `src/stores/{{entities}}.ts`

Adapt to the user's entity name, type imports, and API functions. Key patterns:
- `loading` / `error` / data tri-state
- `etags` map for optimistic concurrency
- Every async function wraps API call in try/catch with error assignment
- Lazy-loaded sub-resources (fetched on demand from detail tabs)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { {{Entity}}, {{Entity}}Summary } from '@/api/types'
import * as api from '@/api/client'

export const use{{Entities}}Store = defineStore('{{entities}}', () => {
  const list = ref<{{Entity}}Summary[]>([])
  const total = ref(0)
  const current = ref<{{Entity}} | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ETag map: entity id → etag (for optimistic concurrency)
  const etags = ref<Record<string, string>>({})

  async function fetchList(params?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await api.listItems(params)
      list.value = res.items
      total.value = res.total
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch list'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const item = await api.getItem(id)
      current.value = item
      etags.value[item.id] = item.etag
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch item'
    } finally {
      loading.value = false
    }
  }

  async function create(req: any): Promise<{{Entity}} | null> {
    loading.value = true
    error.value = null
    try {
      const item = await api.createItem(req)
      etags.value[item.id] = item.etag
      return item
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Creation failed'
      return null
    } finally {
      loading.value = false
    }
  }

  async function update(id: string, req: any): Promise<boolean> {
    const etag = etags.value[id] ?? current.value?.etag ?? ''
    error.value = null
    try {
      const item = await api.updateItem(id, etag, req)
      if (current.value?.id === id) current.value = item
      etags.value[item.id] = item.etag
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      return false
    }
  }

  async function remove(id: string): Promise<boolean> {
    const etag = etags.value[id] ?? current.value?.etag ?? ''
    loading.value = true
    error.value = null
    try {
      await api.deleteItem(id, etag)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Delete failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    list, total, current, loading, error, etags,
    fetchList, fetchOne, create, update, remove, clearError,
  }
})
```
