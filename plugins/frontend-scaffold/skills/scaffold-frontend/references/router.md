# Router Pattern

Generate `src/router/index.ts`. Adapt route paths and component imports to the user's entity.

## Key patterns:
- Lazy-loaded route components via dynamic `import()`
- `meta: { public: true }` for unauthenticated routes (login)
- `beforeEach` guard checking auth store, redirecting to `/login`
- Catch-all redirect to the list view

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      redirect: '/{{entities}}',
    },
    {
      path: '/{{entities}}',
      name: '{{entities}}',
      component: () => import('@/views/{{Entity}}ListView.vue'),
    },
    {
      path: '/{{entities}}/new',
      name: 'create-{{entity}}',
      component: () => import('@/views/Create{{Entity}}View.vue'),
    },
    {
      path: '/{{entities}}/:id',
      name: '{{entity}}-detail',
      component: () => import('@/views/{{Entity}}DetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/{{entities}}',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: '{{entities}}' }
  }
})

export default router
```

Replace `{{entities}}` with the plural form (kebab-case route path) and `{{Entity}}` with the PascalCase form for component file names.
