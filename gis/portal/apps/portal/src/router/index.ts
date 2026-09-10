import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
    { path: '/', component: () => import('../views/WorkbenchView.vue') },
  ],
})

// 登录态守卫：
// 1. token 已过期 → 主动清理并回登录页（不携带过期 token 进入工作台）。
// 2. 未登录访问受保护页 → 跳登录页并携带 redirect，登录后回跳原目标。
// 3. 已登录访问登录页 → 跳转工作台。
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (auth.token && auth.isExpired) {
    auth.clear()
  }
  if (!to.meta.public && !auth.isAuthenticated) {
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined
    return redirect ? { path: '/login', query: { redirect } } : { path: '/login' }
  }
  if (to.path === '/login' && auth.isAuthenticated) {
    return { path: '/' }
  }
})
