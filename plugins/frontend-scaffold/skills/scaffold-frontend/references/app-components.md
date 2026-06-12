# App Components

Generate these in `src/components/app/`. Unlike the UI components (which are generic), app components are domain-aware but follow reusable patterns.

## StatusBadge.vue

Maps entity status enum to Badge color variant. Adapt the switch cases to the user's status values.

```vue
<script setup lang="ts">
import type { {{Entity}}Status } from '@/api/types'
import Badge from '@/components/ui/Badge.vue'
import { computed } from 'vue'

const props = defineProps<{ status: {{Entity}}Status; class?: string }>()

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'

const variant = computed((): BadgeVariant => {
  switch (props.status) {
    case 'ready':    return 'success'
    case 'active':   return 'info'
    case 'degraded': return 'warning'
    case 'failed':   return 'destructive'
    case 'pending':
    default:         return 'outline'
  }
})

const label = computed(() => props.status.replace(/_/g, ' '))
</script>

<template>
  <Badge :variant="variant" :class="props.class">{{ label }}</Badge>
</template>
```

## EventStream.vue

WebSocket-powered real-time log viewer with dark terminal aesthetic. Only generate if the user wants event streaming.

Replace `{{entity}}` placeholders with actual entity names.

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { {{Entity}}Event } from '@/api/types'
import { buildEventsWsUrl } from '@/api/client'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import { Pause, Play, ChevronRight, ChevronDown } from 'lucide-vue-next'

const props = defineProps<{ {{entity}}Id: string }>()

const events = ref<{{Entity}}Event[]>([])
const paused = ref(false)
const scrollEl = ref<HTMLElement | null>(null)
let ws: WebSocket | null = null
let cursor = '0'
const MAX_EVENTS = 500

type Level = 'debug' | 'info' | 'warn' | 'error'
const visibleLevels = ref<Set<Level>>(new Set(['info', 'warn', 'error']))

function toggleLevel(level: Level) {
  const s = new Set(visibleLevels.value)
  if (s.has(level)) s.delete(level)
  else s.add(level)
  visibleLevels.value = s
}

const filteredEvents = computed(() =>
  events.value.filter(e => visibleLevels.value.has(e.level as Level))
)

const expandedIds = ref<Set<string>>(new Set())

function toggleExpand(id: string) {
  const s = new Set(expandedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedIds.value = s
}

function hasAttrs(ev: {{Entity}}Event): boolean {
  return !!ev.attributes && Object.keys(ev.attributes).length > 0
}

function connect() {
  if (ws) { ws.onclose = null; ws.close() }
  const url = buildEventsWsUrl(props.{{entity}}Id, cursor)
  ws = new WebSocket(url)

  ws.onmessage = (ev) => {
    try {
      const event: {{Entity}}Event = JSON.parse(ev.data as string)
      cursor = event.id
      events.value.push(event)
      if (events.value.length > MAX_EVENTS) {
        events.value.splice(0, events.value.length - MAX_EVENTS)
      }
      if (!paused.value) nextTick(scrollToBottom)
    } catch { /* ignore malformed frame */ }
  }

  ws.onclose = () => {
    setTimeout(() => { if (ws?.readyState !== WebSocket.OPEN) connect() }, 3_000)
  }
}

function scrollToBottom() {
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

onMounted(() => { connect() })
onUnmounted(() => { if (ws) { ws.onclose = null; ws.close() } })

watch(() => props.{{entity}}Id, () => { events.value = []; cursor = '0'; connect() })

function togglePause() {
  paused.value = !paused.value
  if (!paused.value) nextTick(scrollToBottom)
}

function levelVariant(level: string) {
  switch (level) {
    case 'error': return 'destructive'
    case 'warn':  return 'warning'
    case 'info':  return 'info'
    default:      return 'secondary'
  }
}
</script>

<template>
  <div class="flex h-full flex-col rounded-md border bg-zinc-950 text-zinc-100">
    <!-- Toolbar -->
    <div class="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
      <span class="text-xs font-medium text-zinc-400">Event stream</span>
      <div class="flex items-center gap-1.5">
        <button
          v-for="lvl in (['debug', 'info', 'warn', 'error'] as Level[])"
          :key="lvl"
          class="rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors"
          :class="visibleLevels.has(lvl)
            ? lvl === 'error'   ? 'bg-red-900/60 text-red-300'
            : lvl === 'warn'    ? 'bg-yellow-900/60 text-yellow-300'
            : lvl === 'debug'   ? 'bg-zinc-700 text-zinc-300'
            :                     'bg-blue-900/60 text-blue-300'
            : 'bg-zinc-800/40 text-zinc-600'"
          @click="toggleLevel(lvl)"
        >{{ lvl }}</button>
        <Button
          variant="ghost" size="icon"
          class="h-6 w-6 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          @click="togglePause"
        >
          <Pause v-if="!paused" class="h-3.5 w-3.5" />
          <Play v-else class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>

    <!-- Log lines -->
    <div ref="scrollEl" class="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
      <template v-for="ev in filteredEvents" :key="ev.id">
        <div class="flex gap-2 py-0.5">
          <span class="shrink-0 text-zinc-500">{{ new Date(ev.ts).toLocaleTimeString() }}</span>
          <Badge
            :variant="levelVariant(ev.level) as 'destructive' | 'warning' | 'info' | 'secondary'"
            class="shrink-0 self-start px-1 py-0 text-[10px]"
          >{{ ev.level }}</Badge>
          <span class="shrink-0 text-zinc-400">{{ ev.source }}</span>
          <span class="break-all text-zinc-200">{{ ev.message }}</span>
          <button
            v-if="hasAttrs(ev)"
            class="ml-auto shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
            @click="toggleExpand(ev.id)"
          >
            <ChevronDown v-if="expandedIds.has(ev.id)" class="h-3 w-3" />
            <ChevronRight v-else class="h-3 w-3" />
          </button>
        </div>
        <div
          v-if="hasAttrs(ev) && expandedIds.has(ev.id)"
          class="mb-1 ml-16 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[10px] text-zinc-500"
        >
          <div v-for="(val, key) in ev.attributes" :key="key" class="flex gap-2">
            <span class="shrink-0 text-zinc-600">{{ key }}</span>
            <span class="text-zinc-400">{{ val }}</span>
          </div>
        </div>
      </template>
      <div v-if="filteredEvents.length === 0" class="text-zinc-500">
        {{ events.length === 0 ? 'Waiting for events…' : 'No events match the current level filter.' }}
      </div>
    </div>
  </div>
</template>
```

## MetricsPanel.vue

Polling data panel that fetches metrics on an interval and displays as a grid of stat cards.

Replace `{{entity}}` and the metrics fields with the user's actual metric names.

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getMetrics } from '@/api/client'
import Card from '@/components/ui/Card.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Alert from '@/components/ui/Alert.vue'

const props = defineProps<{ {{entity}}Id: string }>()

const metrics = ref<Record<string, number> | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

async function load() {
  loading.value = !metrics.value
  error.value = null
  try {
    metrics.value = await getMetrics(props.{{entity}}Id)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load metrics'
  } finally {
    loading.value = false
  }
}

onMounted(() => { load(); timer = setInterval(load, 30_000) })
onUnmounted(() => { if (timer) clearInterval(timer) })
watch(() => props.{{entity}}Id, () => { metrics.value = null; load() })

function fmt(n: number | undefined, decimals = 1): string {
  if (n == null) return '—'
  return n.toFixed(decimals)
}

// Adapt this computed to the user's actual metrics shape
const stats = computed(() => {
  if (!metrics.value) return []
  // Example stats — replace with actual metric fields
  return [
    { label: 'Success Rate', value: `${fmt((metrics.value as any).success_rate * 100)}%` },
    { label: 'Latency p95', value: `${fmt((metrics.value as any).latency_p95_ms)} ms` },
    { label: 'Throughput', value: `${fmt((metrics.value as any).throughput)}/s` },
    { label: 'Error Rate', value: `${fmt((metrics.value as any).error_rate * 100)}%` },
  ]
})
</script>

<template>
  <div>
    <div v-if="loading && !metrics" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card v-for="i in 4" :key="i" class="p-4">
        <Skeleton class="mb-2 h-3 w-24" />
        <Skeleton class="h-6 w-16" />
      </Card>
    </div>
    <Alert v-else-if="error" variant="destructive" :title="error" />
    <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label" class="p-4">
        <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">{{ stat.value }}</p>
      </Card>
    </div>
  </div>
</template>
```
