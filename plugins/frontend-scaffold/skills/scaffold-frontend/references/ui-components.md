# UI Components

Generate ALL of these components in `src/components/ui/`. They are the foundation of every view.

Every component follows the same pattern:
- `<script setup lang="ts">` with typed props
- `import { cn } from '@/lib/utils'` for class merging
- Optional `class?: string` prop for caller customization
- `v-bind="$attrs"` for pass-through attributes where appropriate

## Button.vue

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:     'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:       'hover:bg-accent hover:text-accent-foreground',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-9 rounded-md px-3',
        lg:      'h-11 rounded-md px-8',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

interface Props extends /* @vue-ignore */ HTMLAttributes {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
})

const cls = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class))
</script>

<template>
  <button :class="cls" :disabled="disabled" :type="type" v-bind="$attrs">
    <slot />
  </button>
</template>
```

## Badge.vue

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { computed } from 'vue'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:   'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline:     'text-foreground',
        success:     'border-transparent bg-green-100 text-green-800',
        warning:     'border-transparent bg-yellow-100 text-yellow-800',
        info:        'border-transparent bg-blue-100 text-blue-800',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

type BadgeVariants = VariantProps<typeof badgeVariants>
interface Props { variant?: BadgeVariants['variant']; class?: string }
const props = withDefaults(defineProps<Props>(), { variant: 'default' })
const cls = computed(() => cn(badgeVariants({ variant: props.variant }), props.class))
</script>

<template>
  <div :class="cls"><slot /></div>
</template>
```

## Alert.vue

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { computed } from 'vue'
import { AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-vue-next'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default:     'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:     'border-green-500/50 text-green-700 bg-green-50 [&>svg]:text-green-600',
        warning:     'border-yellow-500/50 text-yellow-700 bg-yellow-50 [&>svg]:text-yellow-600',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

type AlertVariants = VariantProps<typeof alertVariants>
interface Props { variant?: AlertVariants['variant']; title?: string; class?: string }
const props = withDefaults(defineProps<Props>(), { variant: 'default' })
const cls = computed(() => cn(alertVariants({ variant: props.variant }), props.class))

const IconComponent = computed(() => {
  switch (props.variant) {
    case 'destructive': return AlertCircle
    case 'success':     return CheckCircle2
    case 'warning':     return AlertTriangle
    default:            return Info
  }
})
</script>

<template>
  <div role="alert" :class="cls">
    <component :is="IconComponent" class="h-4 w-4" />
    <div>
      <p v-if="title" class="mb-1 font-medium leading-none tracking-tight">{{ title }}</p>
      <div class="text-sm [&_p]:leading-relaxed"><slot /></div>
    </div>
  </div>
</template>
```

## Card.vue + compound components

Generate 6 files: Card.vue, CardHeader.vue, CardTitle.vue, CardDescription.vue, CardContent.vue, CardFooter.vue.

### Card.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <div :class="cn('rounded-lg border bg-card text-card-foreground shadow-sm', props.class)" v-bind="$attrs"><slot /></div>
</template>
```

### CardHeader.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6', props.class)"><slot /></div>
</template>
```

### CardTitle.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <h3 :class="cn('text-2xl font-semibold leading-none tracking-tight', props.class)"><slot /></h3>
</template>
```

### CardDescription.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <p :class="cn('text-sm text-muted-foreground', props.class)"><slot /></p>
</template>
```

### CardContent.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <div :class="cn('p-6 pt-0', props.class)"><slot /></div>
</template>
```

### CardFooter.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <div :class="cn('flex items-center p-6 pt-0', props.class)"><slot /></div>
</template>
```

## Input.vue

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string; type?: string; modelValue?: string | number; placeholder?: string; disabled?: boolean }
const props = withDefaults(defineProps<Props>(), { type: 'text' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
    v-bind="$attrs"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
```

## Textarea.vue

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string; rows?: number; modelValue?: string; placeholder?: string; disabled?: boolean }
const props = withDefaults(defineProps<Props>(), { rows: 3 })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    :rows="rows" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
    :class="cn(
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
```

## Label.vue

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Label as LabelRoot } from 'radix-vue'
interface Props { class?: string; for?: string }
const props = defineProps<Props>()
</script>
<template>
  <LabelRoot :for="props.for" :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)">
    <slot />
  </LabelRoot>
</template>
```

## Checkbox.vue

```vue
<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from 'radix-vue'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props { modelValue?: boolean | 'indeterminate'; disabled?: boolean; id?: string; class?: string }
const props = withDefaults(defineProps<Props>(), { modelValue: false })
const emit = defineEmits<{ 'update:modelValue': [value: boolean | 'indeterminate'] }>()
</script>

<template>
  <CheckboxRoot
    :checked="modelValue" :disabled="disabled" :id="id"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      props.class,
    )"
    @update:checked="emit('update:modelValue', $event)"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <Check class="h-4 w-4" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
```

## Select.vue

```vue
<script setup lang="ts">
import {
  SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent,
  SelectViewport, SelectItem, SelectItemText, SelectItemIndicator,
  SelectScrollUpButton, SelectScrollDownButton,
} from 'radix-vue'
import { Check, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface SelectOption { value: string; label: string; disabled?: boolean }
interface Props { modelValue?: string; options: SelectOption[]; placeholder?: string; disabled?: boolean; class?: string }
const props = withDefaults(defineProps<Props>(), { placeholder: 'Select…' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <SelectRoot :model-value="modelValue" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2',
        'text-sm ring-offset-background placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class,
      )"
    >
      <SelectValue :placeholder="placeholder" />
      <ChevronDown class="h-4 w-4 opacity-50 shrink-0" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        class="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md
               data-[state=open]:animate-in data-[state=closed]:animate-out
               data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
               data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
               data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        position="popper"
      >
        <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
          <ChevronUp class="h-4 w-4" />
        </SelectScrollUpButton>
        <SelectViewport class="p-1">
          <SelectItem
            v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled"
            class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none
                   focus:bg-accent focus:text-accent-foreground
                   data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <SelectItemIndicator><Check class="h-4 w-4" /></SelectItemIndicator>
            </span>
            <SelectItemText>{{ opt.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
        <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
          <ChevronDown class="h-4 w-4" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
```

## Dialog.vue

```vue
<script setup lang="ts">
import {
  DialogRoot, DialogTrigger, DialogPortal, DialogOverlay,
  DialogContent, DialogTitle, DialogDescription, DialogClose,
} from 'radix-vue'
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'

interface Props { open?: boolean; title: string; description?: string; class?: string }
const props = withDefaults(defineProps<Props>(), { open: false })
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogTrigger v-if="$slots.trigger" as-child><slot name="trigger" /></DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        :class="cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
          'gap-4 border bg-background p-6 shadow-lg duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'sm:rounded-lg', props.class,
        )"
        @interact-outside="emit('update:open', false)"
      >
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle class="text-lg font-semibold leading-none tracking-tight">{{ title }}</DialogTitle>
          <DialogDescription v-if="description" class="text-sm text-muted-foreground">{{ description }}</DialogDescription>
        </div>
        <slot />
        <div v-if="$slots.footer" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"><slot name="footer" /></div>
        <DialogClose
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          @click="emit('update:open', false)"
        >
          <X class="h-4 w-4" /><span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

## Tabs.vue

```vue
<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Tab { value: string; label: string }
interface Props { modelValue?: string; tabs: Tab[]; class?: string }
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <TabsRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event as string)">
    <TabsList :class="cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', props.class)">
      <TabsTrigger
        v-for="tab in tabs" :key="tab.value" :value="tab.value"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background
               transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
               disabled:pointer-events-none disabled:opacity-50
               data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      >{{ tab.label }}</TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="tab in tabs" :key="tab.value" :value="tab.value"
      class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    ><slot :name="tab.value" /></TabsContent>
  </TabsRoot>
</template>
```

## Table compound components

Generate 6 files: Table.vue, TableHeader.vue, TableBody.vue, TableRow.vue, TableHead.vue, TableCell.vue.

### Table.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <div :class="cn('relative w-full overflow-auto', props.class)">
    <table :class="cn('w-full caption-bottom text-sm')"><slot /></table>
  </div>
</template>
```

### TableHeader.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template><thead :class="cn('[&_tr]:border-b', props.class)"><slot /></thead></template>
```

### TableBody.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template><tbody :class="cn('[&_tr:last-child]:border-0', props.class)"><slot /></tbody></template>
```

### TableRow.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template><tr :class="cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', props.class)"><slot /></tr></template>
```

### TableHead.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template><th :class="cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', props.class)"><slot /></th></template>
```

### TableCell.vue
```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template><td :class="cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', props.class)"><slot /></td></template>
```

## Progress.vue

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string; modelValue?: number }
const props = withDefaults(defineProps<Props>(), { modelValue: 0 })
</script>
<template>
  <div :class="cn('h-2 w-full overflow-hidden rounded-full bg-secondary', props.class)">
    <div class="h-full w-full flex-1 bg-primary transition-all" :style="{ transform: `translateX(-${100 - (props.modelValue ?? 0)}%)` }" />
  </div>
</template>
```

## Separator.vue

```vue
<script setup lang="ts">
import { Separator as SeparatorRoot } from 'radix-vue'
import { cn } from '@/lib/utils'
interface Props { class?: string; orientation?: 'horizontal' | 'vertical'; decorative?: boolean }
const props = withDefaults(defineProps<Props>(), { orientation: 'horizontal', decorative: true })
</script>
<template>
  <SeparatorRoot
    :orientation="orientation" :decorative="decorative"
    :class="cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', props.class)"
  />
</template>
```

## Skeleton.vue

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
interface Props { class?: string }
const props = defineProps<Props>()
</script>
<template>
  <div :class="cn('h-4 rounded-md bg-muted animate-pulse', props.class)" />
</template>
```
