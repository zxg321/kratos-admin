<script setup lang="ts">
import { useAuthStore } from './store/auth'
import { router } from './router'

const auth = useAuthStore()

auth.tryRestoreToken()

router.beforeEach((to) => {
  if (to.path !== '/login' && !auth.token) {
    return { path: '/login' }
  }
})
</script>

<template>
  <router-view />
</template>
