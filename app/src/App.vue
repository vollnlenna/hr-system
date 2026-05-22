<template>
  <div v-if="initializing" class="loader">Загрузка...</div>

  <div v-else class="app-layout">
    <aside v-if="isAuthenticated" class="sidebar">
      <router-link to="/" class="logo-link">
        <img src="/logo.png" alt="Logo" class="sidebar-logo" />
      </router-link>

      <nav class="sidebar-nav">
        <router-link
          to="/organizations"
          class="nav-item"
          :class="{ active: $route.path === '/organizations' }"
        >
          Организации
        </router-link>
        <router-link
          to="/departments"
          class="nav-item"
          :class="{ active: $route.path === '/departments' }"
        >
          Отделы
        </router-link>
        <router-link
          to="/positions"
          class="nav-item"
          :class="{ active: $route.path === '/positions' }"
        >
          Должности
        </router-link>
        <router-link
          to="/employees"
          class="nav-item"
          :class="{ active: $route.path === '/employees' }"
        >
          Сотрудники
        </router-link>
        <router-link
          to="/hrOperations"
          class="nav-item"
          :class="{ active: $route.path === '/hrOperations' }"
        >
          Кадровые операции
        </router-link>
        <router-link
          to="/change-history"
          class="nav-item"
          :class="{ active: $route.path === '/change-history' }"
        >
          История изменений
        </router-link>
        <router-link
          v-if="isAdmin"
          to="/users"
          class="nav-item"
          :class="{ active: $route.path === '/users' }"
        >
          Пользователи
        </router-link>
      </nav>
      <button class="nav-item logout-btn" @click="handleLogout">Выход</button>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()
const { isAuthenticated, isAdmin, logout, initializing } = auth

async function handleLogout() {
  await logout()
  await router.push('/login')
}
</script>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  padding: 50px;
  font-size: 20px;
}

.app-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 220px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
}

.logo-link {
  display: block;
  text-align: center;
  margin-bottom: 30px;
  padding: 0 15px;
  text-decoration: none;
}

.sidebar-logo {
  width: 160px;
  height: auto;
  border: none;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 15px;
  flex: 1;
}

.nav-item {
  display: block;
  padding: 12px 20px;
  text-decoration: none;
  color: #000;
  border: 3px solid #000;
  background: #fff;
  border-radius: 6px;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  font-family: 'Courier New', monospace;
}

.nav-item:hover {
  background: #000;
  color: #fff;
}

.nav-item.active {
  background: #000;
  color: #fff;
}

.logout-btn {
  margin: 20px 15px 0;
  color: red;
  border-color: red;
  background: #fff;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: red;
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: scroll;
}
</style>
