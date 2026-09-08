<script setup>
/**
 * 个人设置（PRD G-05）：个人信息展示 + 修改密码 + 偏好设置（界面语言）
 */
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../../store/user'
import { tl } from '../../utils/i18n'
import { setLocale } from '../../locales'

defineOptions({ name: 'Profile' })

const userStore = useUserStore()
const { locale } = useI18n()

// 修改密码（mock：不做真实校验）
const pwdFormRef = ref(null)
const pwdForm = reactive({ oldPwd: '', newPwd: '', confirmPwd: '' })
const pwdRules = {
  oldPwd: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少 6 位', trigger: 'blur' }
  ],
  confirmPwd: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, cb) => (value === pwdForm.newPwd ? cb() : cb(new Error('两次输入的新密码不一致'))),
      trigger: 'blur'
    }
  ]
}

function changePwd() {
  pwdFormRef.value.validate(() => {
    ElMessage.success(tl('profile.pwdChanged', '密码修改成功（演示环境不真实校验）'))
    pwdFormRef.value.resetFields()
  })
}

// 偏好设置
const prefForm = reactive({ lang: locale.value })
function savePref() {
  setLocale(prefForm.lang)
  locale.value = prefForm.lang
  ElMessage.success(tl('common.saveSuccess', '保存成功'))
}

const loginTime = new Date(userStore.loginTime || Date.now()).toLocaleString('zh-CN')
</script>

<template>
  <div class="page-wrap">
    <el-row :gutter="12">
      <!-- 个人信息 -->
      <el-col :span="8">
        <el-card shadow="never" header="个人信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ userStore.username }}</el-descriptions-item>
            <el-descriptions-item label="角色">客户/卖家</el-descriptions-item>
            <el-descriptions-item label="登录时间">{{ loginTime }}</el-descriptions-item>
            <el-descriptions-item label="免登录">{{ userStore.remember ? '是（12小时内）' : '否' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 修改密码 -->
      <el-col :span="8">
        <el-card shadow="never" :header="tl('profile.changePwd', '修改密码')">
          <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="90px">
            <el-form-item :label="tl('profile.oldPwd', '原密码')" prop="oldPwd">
              <el-input v-model="pwdForm.oldPwd" type="password" show-password />
            </el-form-item>
            <el-form-item :label="tl('profile.newPwd', '新密码')" prop="newPwd">
              <el-input v-model="pwdForm.newPwd" type="password" show-password />
            </el-form-item>
            <el-form-item :label="tl('profile.confirmPwd', '确认新密码')" prop="confirmPwd">
              <el-input v-model="pwdForm.confirmPwd" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePwd">{{ tl('profile.save', '保存') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 偏好设置 -->
      <el-col :span="8">
        <el-card shadow="never" :header="tl('profile.preference', '偏好设置')">
          <el-form :model="prefForm" label-width="90px">
            <el-form-item :label="tl('profile.lang', '界面语言')">
              <el-select v-model="prefForm.lang" style="width: 160px">
                <el-option label="中文" value="zh" />
                <el-option label="English" value="en" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePref">{{ tl('profile.save', '保存') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>