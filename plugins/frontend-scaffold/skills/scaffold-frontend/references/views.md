# View Patterns

Generate views in `src/views/`. Each view follows a specific pattern. Adapt entity names, fields, statuses, and routes.

## LoginView.vue

Centered card login with bearer token auth. Gradient background, show/hide token toggle.

**Pattern:**
- Full-screen centered layout with gradient background
- Card with header, input field (password type with show/hide), and submit button
- Uses auth store's `login()` method
- Redirects to list view on success
- Shows error alert on failure
- Enter key triggers login

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'
import { Eye, EyeOff, Server } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const token = ref('')
const showToken = ref(false)

async function handleLogin() {
  const ok = await auth.login(token.value.trim())
  if (ok) router.push('/{{entities}}')
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
    <div class="mb-8 flex items-center gap-2 text-slate-800">
      <Server class="h-7 w-7" />
      <span class="text-xl font-bold tracking-tight">{{Project Title}}</span>
    </div>
    <Card class="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your API bearer token to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Alert v-if="auth.error" variant="destructive" :title="auth.error" />
          <div class="space-y-1.5">
            <Label for="token">Bearer token</Label>
            <div class="relative">
              <Input id="token" v-model="token" :type="showToken ? 'text' : 'password'" placeholder="Paste your API token" class="pr-10" @keydown.enter="handleLogin" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="showToken = !showToken">
                <Eye v-if="!showToken" class="h-4 w-4" /><EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex-col gap-2">
        <Button class="w-full" :disabled="auth.loading || !token.trim()" @click="handleLogin">
          {{ auth.loading ? 'Verifying…' : 'Continue' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
```

## ListView — `{{Entity}}ListView.vue`

Table with status filter tabs, auto-refresh, skeleton loading, empty state.

**Pattern:**
- Sticky header with branding + sign-out
- Page header with count + Refresh/New buttons
- Status filter tabs (pill-style toggle buttons)
- Data table with skeleton loading rows
- Empty state with CTA link
- Clickable rows navigating to detail
- Auto-refresh via `setInterval` (10s)
- Cleanup in `onUnmounted`

```
Structure:
- header: sticky nav with app name + logout
- main:
  - page header (title, count, action buttons)
  - status filter tabs (all + each status value)
  - error alert
  - bordered table wrapper
    - table header row (one column per visible field + Actions)
    - loading: 5 skeleton rows
    - empty: colspan message with CTA
    - data: one row per item, clickable
```

Key implementation details:
- `statusFilter` ref with `'all'` | each status value
- `load()` function that calls `store.fetchList(params)`
- `setInterval(load, 10_000)` in `onMounted`, cleared in `onUnmounted`
- `formatDate()` helper for ISO dates
- `shortId()` helper that slices IDs to 8 chars
- StatusBadge component for status display
- Label maps for enum display values

## CreateView — `Create{{Entity}}View.vue` (Multi-step Wizard)

**Pattern:**
- Step tracking: `ref(1)`, `TOTAL_STEPS` constant
- Progress bar with step labels
- Per-step validation computed properties (`step1Valid`, `step2Valid`, etc.)
- Back/Next navigation with conditional Submit on final step
- Each step renders in a separate `<Card v-if="step === N">` block
- Final step shows a review summary (`<dl>` grid)
- Submit calls store's create function and redirects on success

```
Structure:
- header: sticky nav with back button + title
- main:
  - progress section (step N of M, progress bar, step labels)
  - step 1 card: primary configuration fields
  - step 2 card: secondary configuration fields
  - step 3 card: credentials/sensitive fields (with show/hide)
  - step 4 card: review summary (dl grid of all values)
  - navigation: Back / Next / Submit buttons
```

Key implementation details:
- `canNext` computed checks current step's validation
- `next()` and `back()` increment/decrement step
- Progress computed as `((step - 1) / (TOTAL_STEPS - 1)) * 100`
- Review step uses `<dl class="grid grid-cols-2 gap-x-6 gap-y-3">`
- Submit button shows loading state with `submitting` ref

## DetailView — `{{Entity}}DetailView.vue`

**Pattern:**
- 3-column grid layout: 1 column sidebar + 2 column content area
- Sidebar: Configuration card (icon + label pairs) + Actions card (mutation buttons)
- Content area: custom tab switcher + tab content panels
- Multiple dialog refs for mutations
- Status polling via `setInterval` while non-terminal
- Lazy-loaded tab data (fetched on first tab switch)

```
Structure:
- header: sticky nav with back button + entity ID + status badge + refresh
- loading state: skeleton placeholders
- error state: alert
- content:
  - grid lg:grid-cols-3
    - left (lg:col-span-1):
      - config card (icon + label pairs for each field)
      - actions card (mutation buttons + destructive delete)
    - right (lg:col-span-2):
      - tab switcher (button group in muted container)
      - tab content panels (events, metrics, etc.)
  - mutation dialogs
```

Key implementation details:
- `activeTab` ref for tab switching
- `isTerminal` / `isMutable` computed from status
- `switchTab()` function that lazy-fetches data for certain tabs
- Each mutation button opens a dialog ref
- Mutation handlers call store, close dialog on success, refresh
- Config card uses `<div class="flex items-start gap-2">` with Lucide icons
- Tab switcher is a `<div class="flex gap-1.5 rounded-lg border p-1 bg-muted">` with buttons

