<template>
  <div class="login-page">
    <img src="/logo.png" alt="Logo" class="login-logo" />

    <div class="login-card">
      <h2>Вход в систему</h2>

      <div v-if="error" class="error-box">{{ error }}</div>

      <form @submit.prevent="onSubmit">
        <label>Логин</label>
        <input id="login-input" v-model="form.login" type="text" autocomplete="username" />

        <label>Пароль</label>
        <div class="password-input-wrapper">
          <input
            id="password-input"
            :type="showPassword ? 'text' : 'password'"
            v-model="form.password"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="password-toggle"
            style="top: 50%; transform: translateY(-50%)"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
          >
            <Icon :icon="showPassword ? 'mdi:eye' : 'mdi:eye-off'" width="16" />
          </button>
        </div>

        <button class="btn-login" type="submit" :disabled="loading">
          {{ loading ? 'Входим...' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import { useAuth } from '../composables/useAuth'
import { Icon } from '@iconify/vue'

const router = useRouter()
const { login } = useAuth()

const form = reactive({
  login: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function onSubmit() {
  error.value = ''
  if (!form.login || !form.password) {
    error.value = 'Введите логин и пароль'
    return
  }

  loading.value = true
  try {
    await login(form.login, form.password)
    await router.push('/')
  } catch (e) {
    if (isAxiosError(e)) {
      error.value = e.response?.data?.message ?? 'Ошибка авторизации'
    } else {
      error.value = 'Ошибка авторизации'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px 0;
}

.login-logo {
  display: block;
  width: 200px;
  height: auto;
}

.login-card {
  border: 1px solid #000;
  border-radius: 12px;
  padding: 20px;
  width: 320px;
  background: #fff;
  box-sizing: border-box;
}

.login-card h2 {
  margin-bottom: 16px;
  margin-top: 0;
}

label {
  display: block;
  font-size: 13px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.btn-login {
  margin-top: 16px;
  width: 100%;
  border-radius: 8px;
  border: none;
  padding: 9px;
  background: #1b2234;
  color: #fff;
  cursor: pointer;
}
</style>
