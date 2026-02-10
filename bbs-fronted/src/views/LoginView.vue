<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <div class="login-logo-box">
          <el-icon :size="40"><EditPen /></el-icon>
        </div>
        <h1 class="login-title">{{ isRegister ? 'JOIN US' : 'WELCOME BACK' }}</h1>
      </div>

      <!-- Form -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent="handleSubmit"
        class="login-form"
      >
        <el-form-item prop="email">
          <label class="custom-label">EMAIL</label>
          <el-input
            v-model="form.email"
            placeholder="YOUR@EMAIL.COM"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="password">
          <label class="custom-label">PASSWORD</label>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="DOT NOT SHARE IT"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item v-if="isRegister" prop="confirmPassword">
          <label class="custom-label">CONFIRM</label>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="TYPE IT AGAIN"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <button class="submit-btn" :disabled="submitting">
          {{ submitting ? 'WAIT...' : (isRegister ? 'REGISTER' : 'LOGIN') }}
        </button>
      </el-form>

      <!-- Toggle -->
      <div class="login-footer">
        <p>{{ isRegister ? 'ALREADY A MEMBER?' : 'NEW HERE?' }}</p>
        <a href="#" class="toggle-link" @click.prevent="toggleMode">
          {{ isRegister ? 'LOGIN NOW' : 'CREATE ACCOUNT' }}
        </a>
      </div>
    </div>
    
    <!-- Decor -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const isRegister = ref(false)
const submitting = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const validateConfirm = (rule, value, callback) => {
  if (isRegister.value && value !== form.password) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: 'Email required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password required', trigger: 'blur' },
    { min: 6, message: 'Min 6 chars', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: 'Confirm password', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

function toggleMode() {
  isRegister.value = !isRegister.value
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isRegister.value) {
      await userStore.register(form.email, form.password)
      ElMessage.success('Check your email!')
      isRegister.value = false
    } else {
      await userStore.login(form.email, form.password)
      ElMessage.success('Welcome back!')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (error) {
    ElMessage.error(error.message || 'Action failed')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border: 4px solid #000;
  box-shadow: 16px 16px 0 #000;
  padding: 40px;
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo-box {
  width: 80px;
  height: 80px;
  background: var(--primary);
  border: 3px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #fff;
  box-shadow: 6px 6px 0 #000;
}

.login-title {
  font-size: 2rem;
  font-weight: 900;
  color: #000;
  text-transform: uppercase;
}

.custom-label {
  display: block;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 8px;
  color: #000;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: #000;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;
  text-transform: uppercase;
  box-shadow: 6px 6px 0 var(--accent-green);
  border: 2px solid #000;
}

.submit-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 10px 10px 0 var(--accent-green);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  background: var(--accent-yellow);
  border: 2px solid #000;
  padding: 16px;
  font-weight: 700;
}

.toggle-link {
  display: block;
  margin-top: 8px;
  color: var(--primary-dark);
  text-decoration: underline;
  text-decoration-thickness: 3px;
}

/* Background shapes */
.bg-shape {
  position: absolute;
  border: 4px solid #000;
  z-index: 1;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: var(--accent-pink);
  border-radius: 50%;
  top: -50px;
  right: -100px;
  box-shadow: 10px 10px 0 rgba(0,0,0,0.1);
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: var(--accent-green);
  bottom: -50px;
  left: -50px;
  transform: rotate(45deg);
  box-shadow: 10px 10px 0 rgba(0,0,0,0.1);
}
</style>
