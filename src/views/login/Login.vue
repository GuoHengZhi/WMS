<script setup>
/**
 * 登录页（PRD G-01）：账号 + 密码 + 图形验证码；"12小时内免登录"选项
 * 演示账号：SHEN / 123456（VIP0157 / 123456 演示数据隔离）
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'Login' })

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const form = ref({ account: 'SHEN', password: '', captcha: '', remember: false })

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 图形验证码（mock：4 位随机码，点击刷新）
const captchaCode = ref('')
function refreshCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  captchaCode.value = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function handleLogin() {
  await formRef.value.validate()
  if (form.value.captcha.toUpperCase() !== captchaCode.value) {
    ElMessage.error(tl('login.captchaError', '验证码错误'))
    refreshCaptcha()
    form.value.captcha = ''
    return
  }
  // mock 校验：任一账号 + 密码 123456 可登录
  if (form.value.password !== '123456') {
    ElMessage.error(tl('login.credentialError', '账号或密码错误'))
    refreshCaptcha()
    return
  }
  userStore.login({ username: form.value.account.toUpperCase(), remember: form.value.remember })
  ElMessage.success(`${tl('layout.welcome', '欢迎回来')}，${userStore.username}`)
  router.push('/basic/product')
}

onMounted(refreshCaptcha)
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-title">{{ tl('login.title', '海外仓系统') }}</div>
      <div class="login-subtitle">{{ tl('login.subtitle', '海外仓 WMS 管理系统') }}</div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
        <el-form-item prop="account">
          <el-input v-model="form.account" :placeholder="tl('login.accountPlaceholder', '请输入账号')">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" show-password :placeholder="tl('login.passwordPlaceholder', '请输入密码')">
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input v-model="form.captcha" :placeholder="tl('login.captchaPlaceholder', '请输入验证码')">
              <template #prefix><el-icon><Key /></el-icon></template>
            </el-input>
            <div class="captcha-img" title="点击刷新" @click="refreshCaptcha">{{ captchaCode }}</div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.remember">{{ tl('login.remember', '12小时内免登录') }}</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin">{{ tl('login.loginBtn', '登录') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="login-hint">{{ tl('login.demoHint', '演示账号：SHEN / 123456（VIP0157 / 123456 演示数据隔离）') }}</div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f3b73 0%, #2f6fb3 55%, #43a1d8 100%);
}
.login-card {
  width: 380px;
  padding: 36px 32px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 21, 41, 0.35);
}
.login-title { font-size: 22px; font-weight: 700; text-align: center; color: #1f3b73; }
.login-subtitle { font-size: 13px; text-align: center; color: #909399; margin: 6px 0 24px; }
.captcha-row { display: flex; gap: 10px; width: 100%; }
.captcha-img {
  flex: none;
  width: 96px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #1f3b73;
  background: linear-gradient(90deg, #e8f1fb, #d4e6f7);
}
.login-btn { width: 100%; }
.login-hint { font-size: 12px; color: #909399; text-align: center; margin-top: 4px; }
</style>
