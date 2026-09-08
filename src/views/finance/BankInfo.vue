<script setup>
/**
 * 银行账户（PRD 6.8.1）：每客户一套默认账户（单条记录保存）
 * 银行账号展示脱敏（保留后 4 位，PRD G-09/安全要求），保存后回显
 */
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { tl } from '../../utils/i18n'
import { getBankAccount, saveBankAccount } from '../../api'
import { maskAccount } from '../../utils/format'

defineOptions({ name: 'BankInfo' })

const userStore = useUserStore()

const formRef = ref(null)
const form = reactive({
  holder: '',
  bank: '',
  accountNo: '',
  branch: '',
  swift: '',
  currency: 'CNY'
})

const rules = {
  holder: [{ required: true, message: '请输入户名', trigger: 'blur' }],
  bank: [{ required: true, message: '请输入开户行', trigger: 'blur' }],
  accountNo: [{ required: true, message: '请输入银行账号', trigger: 'blur' }]
}

/** 脱敏展示（未输入时为空） */
const maskedNo = () => (form.accountNo ? maskAccount(form.accountNo) : '')

async function load() {
  const acc = await getBankAccount(userStore.username)
  if (acc) Object.assign(form, { holder: acc.holder, bank: acc.bank, accountNo: acc.accountNo, branch: acc.branch, swift: acc.swift, currency: acc.currency || 'CNY' })
}

function handleSave() {
  formRef.value.validate(async (ok) => {
    if (!ok) return
    await saveBankAccount({ username: userStore.username, ...form })
    ElMessage.success(tl('common.saveSuccess', '保存成功'))
  })
}

onMounted(load)
</script>

<template>
  <div class="page-wrap">
    <el-card shadow="never" header="银行账户" class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" style="max-width: 560px">
        <el-form-item label="户名" prop="holder">
          <el-input v-model="form.holder" placeholder="请输入户名" />
        </el-form-item>
        <el-form-item label="开户行" prop="bank">
          <el-input v-model="form.bank" placeholder="请输入开户行" />
        </el-form-item>
        <el-form-item label="银行账号" prop="accountNo">
          <el-input v-model="form.accountNo" placeholder="请输入银行账号" />
          <div class="mask-tip">脱敏显示：{{ maskedNo() || '—' }}（完整信息仅财务角色可见）</div>
        </el-form-item>
        <el-form-item label="开户支行">
          <el-input v-model="form.branch" placeholder="请输入开户支行" />
        </el-form-item>
        <el-form-item label="SWIFT/IBAN">
          <el-input v-model="form.swift" placeholder="境外收款编码（选填）" />
        </el-form-item>
        <el-form-item label="币种">
          <el-select v-model="form.currency" style="width: 160px">
            <el-option label="CNY（人民币）" value="CNY" />
            <el-option label="USD（美元）" value="USD" />
            <el-option label="KRW（韩元）" value="KRW" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">{{ tl('common.save', '保存') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
