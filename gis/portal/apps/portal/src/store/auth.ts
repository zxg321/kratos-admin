import { defineStore } from 'pinia'

const TOKEN_KEY = 'gis_admin_token'
const EXPIRES_AT_KEY = 'gis_admin_expires_at'

// 过期提前量（毫秒）：临近过期即视为失效，避免边界请求才被 401 拦截。
const EXPIRY_SLACK_MS = 30 * 1000

// 登录态：token 来自 admin 后端会话（HS256 JWT，payload 无 exp claim），
// 过期时间由登录响应 expires_in(秒) 换算为绝对时间戳持久化，供路由守卫主动校验。
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) ?? '',
    expiresAt: Number(localStorage.getItem(EXPIRES_AT_KEY) ?? 0),
  }),
  getters: {
    // 未登录或过期信息缺失（旧会话/手动注入 token）一律视为失效。
    isExpired: (s) => !s.token || s.expiresAt <= 0 || Date.now() >= s.expiresAt - EXPIRY_SLACK_MS,
    isAuthenticated: (s) =>
      s.token.length > 0 && s.expiresAt > 0 && Date.now() < s.expiresAt - EXPIRY_SLACK_MS,
  },
  actions: {
    saveAuth(token: string, expiresIn: number) {
      this.token = token
      this.expiresAt = Date.now() + expiresIn * 1000
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(EXPIRES_AT_KEY, String(this.expiresAt))
    },
    clear() {
      this.token = ''
      this.expiresAt = 0
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EXPIRES_AT_KEY)
    },
    tryRestoreToken() {
      this.token = localStorage.getItem(TOKEN_KEY) ?? ''
      this.expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY) ?? 0)
    },
  },
})
