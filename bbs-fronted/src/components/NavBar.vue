<template>
  <header class="navbar">
    <div class="navbar__inner">
      <!-- Logo -->
      <router-link to="/" class="navbar__logo">
        <div class="logo-box">
          <el-icon :size="20"><EditPen /></el-icon>
        </div>
        <span class="logo-text">BLOG</span>
      </router-link>

      <!-- Nav Links -->
      <nav class="navbar__links">
        <router-link to="/" class="navbar__link">首页</router-link>
        <router-link v-if="userStore.isAdmin" to="/admin" class="navbar__link">管理</router-link>
      </nav>

      <!-- User Actions -->
      <div class="navbar__actions">
        <template v-if="userStore.isLoggedIn">
          <div class="user-badge">
            <span class="user-name">{{ userStore.nickname }}</span>
            <button class="logout-btn" @click="handleLogout" title="退出">
              <el-icon><SwitchButton /></el-icon>
            </button>
          </div>
        </template>
        <template v-else>
          <router-link to="/login">
            <button class="login-btn">登录</button>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

async function handleLogout() {
  await userStore.logout()
  ElMessage.success('已退出')
  router.push('/')
}
</script>

<style scoped>
.navbar {
  border-bottom: 3px solid #000;
  background: var(--accent-yellow);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar__inner {
  max-width: 1000px;
  margin: 0 auto;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none !important;
  border: none !important;
}

.logo-box {
  width: 40px;
  height: 40px;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px; /* Slight radius */
  box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
}

.logo-text {
  font-size: 24px;
  font-weight: 900;
  color: #000;
  letter-spacing: -1px;
}

.navbar__links {
  display: flex;
  gap: 24px;
}

.navbar__link {
  font-size: 16px;
  font-weight: 700;
  color: #000 !important;
  text-transform: uppercase;
  padding: 4px 0;
  border-bottom: 3px solid transparent;
}

.navbar__link:hover,
.navbar__link.router-link-active {
  border-bottom-color: #000;
}

.navbar__actions {
  display: flex;
  align-items: center;
}

.login-btn {
  background: #000;
  color: #fff;
  border: none;
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 20px;
  cursor: pointer;
  box-shadow: 4px 4px 0 var(--primary);
  transition: all 0.2s;
}

.login-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--primary);
}

.login-btn:active {
  transform: translate(0, 0);
  box-shadow: none;
}

.user-badge {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #000;
  padding: 4px 4px 4px 12px;
  gap: 8px;
  box-shadow: 4px 4px 0 #000;
}

.user-name {
  font-weight: 700;
  font-size: 14px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  width: 32px;
  height: 32px;
  background: #FF0000;
  border: 2px solid #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #000;
}
</style>
