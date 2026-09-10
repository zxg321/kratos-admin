<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../store/auth'
import { loginApi, type LoginResult } from '../api/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const captchaId = ref('')
const captchaCode = ref('')
const captchaBase64 = ref('')
const loading = ref(false)

// 加载验证码图片（固定文本验证码，支持输入）。
async function loadCaptcha() {
  try {
    const res = await loginApi.captcha('digit')
    captchaId.value = res.captcha_id
    // 后端返回的 captcha_base64 已带 data:image/png;base64, 前缀。
    captchaBase64.value = res.captcha_base64.startsWith('data:')
      ? res.captcha_base64
      : `data:image/png;base64,${res.captcha_base64}`
  } catch {
    ElMessage.error('验证码加载失败')
  }
}

function handleLoginResult(res: LoginResult) {
  if (res.status !== 1 && res.status !== 4) {
    ElMessage.warning(`登录需要继续完成：状态 ${res.status}`)
    return
  }
  // 保存 token 与过期时间戳（由路由守卫主动校验过期）。
  auth.saveAuth(res.access_token, res.expires_in || 3600)
  ElMessage.success('登录成功')
  // 支持受保护页被守卫重定向到登录页后回跳原目标。
  const redirect = (router.currentRoute.value.query.redirect as string) || '/'
  void router.replace(redirect)
}

// 复用现有 kratos-admin 登录接口换取 JWT（账号体系复用）。
async function login() {
  if (!username.value || !password.value || !captchaCode.value) {
    ElMessage.warning('请输入账号、密码和验证码')
    return
  }
  loading.value = true
  try {
    const res = await loginApi.login(username.value, password.value, {
      captcha_id: captchaId.value,
      captcha_code: captchaCode.value,
    })
    handleLoginResult(res)
  } catch (e) {
    ElMessage.error((e as Error).message)
    void loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadCaptcha()
})
</script>

<template>
  <div class="login-view">
    <el-card class="login-card" header="GIS 门户登录">
      <el-form label-position="top" @submit.prevent="login">
        <el-form-item label="账号">
          <el-input v-model="username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="captcha-row">
            <el-input v-model="captchaCode" placeholder="请输入验证码" @keyup.enter="login" />
            <img
              v-if="captchaBase64"
              class="captcha-img"
              :src="captchaBase64"
              alt="验证码"
              title="点击刷新"
              @click="loadCaptcha"
            />
          </div>
        </el-form-item>
        <el-button type="primary" :loading="loading" class="login-btn" @click="login">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f7fa;
}
.login-card {
  width: 380px;
}
.login-btn {
  width: 100%;
}
.captcha-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.captcha-img {
  height: 32px;
  width: 110px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}
</style>
