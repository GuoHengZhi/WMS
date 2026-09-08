<script setup>
/**
 * 创建入库（PRD 6.3.1）：客户创建入库预报单（ASN）
 * 顶部模式切换：默认 / 批量导入；基本信息区 + 产品子表区
 * 入库单号规则：RK + yyyyMMddHHmmss + 3位流水（PRD 10.3）
 * 提交 → 状态=待揽货 → 跳"待揽货"列表
 */
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductPicker from '../../components/ProductPicker.vue'
import { createInbound, dict } from '../../api'
import { useUserStore } from '../../store/user'
import { WAREHOUSE, SERVICE_CHANNELS, INBOUND_TYPES, ARRIVAL_METHODS } from '../../mock/data'
import { genCode } from '../../mock/code'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'InboundCreate' })

const router = useRouter()
const { users } = dict()
const userStore = useUserStore()

// 模式：默认（在线逐行添加）/ 批量导入
const mode = ref('default')

// 基本信息（入库单号进入页面即生成并锁定；用户名默认当前登录账号）
const formRef = ref(null)
const form = reactive({
  username: userStore.username,
  code: genCode('RK'),
  warehouse: WAREHOUSE,
  trackNo: '',
  serviceChannel: SERVICE_CHANNELS[0],
  inboundType: INBOUND_TYPES[0],
  arrivalMethod: ARRIVAL_METHODS[0],
  etaTime: '',
  boxType: '拆单',
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请选择用户名', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择目的仓库', trigger: 'change' }],
  serviceChannel: [{ required: true, message: '请选择服务渠道', trigger: 'change' }],
  inboundType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
  arrivalMethod: [{ required: true, message: '请选择到仓方式', trigger: 'change' }],
  etaTime: [{ required: true, message: '请选择预计到仓时间', trigger: 'change' }],
  boxType: [{ required: true, message: '请选择箱型', trigger: 'change' }]
}

// 产品子表（增删行）
const items = ref([])

function onProductsPicked(rows) {
  rows.forEach((r) => {
    if (!items.value.find((it) => it.sku === r.sku)) {
      items.value.push({ sku: r.sku, name: r.name, nameEn: r.nameEn, forecastQty: 1 })
    }
  })
}

function removeItem(idx) {
  items.value.splice(idx, 1)
}

// 选择用户弹窗（管理员可代客户创建；默认当前登录账号）
const userVisible = ref(false)
function pickUser() {
  userVisible.value = true
}
function confirmUser(u) {
  form.username = u.username
  userVisible.value = false
}

// 批量导入（mock）：模板下载 + 上传后追加演示明细行
function downloadTemplate() {
  ElMessage.success('模板已开始下载（表头：Sku、预报数量）')
}
function mockUpload() {
  const demo = [
    { sku: 'S0005', name: '面膜', nameEn: '마스크팩', forecastQty: 30 },
    { sku: 'S0010', name: '护手霜', nameEn: '핸드크림', forecastQty: 20 }
  ]
  demo.forEach((d) => {
    if (!items.value.find((it) => it.sku === d.sku)) items.value.push(d)
  })
  ElMessage.success('导入成功：2 行明细已加入（演示数据，逐行校验通过）')
}

// 选择产品弹窗
const pickerVisible = ref(false)
const pickerUsername = computed(() => form.username)
const excludeSkus = computed(() => items.value.map((it) => it.sku))

const submitting = ref(false)
async function handleSubmit() {
  await formRef.value.validate()
  if (!items.value.length) return ElMessage.warning('请至少选择一个产品')
  const bad = items.value.find((it) => !Number.isInteger(it.forecastQty) || it.forecastQty <= 0)
  if (bad) return ElMessage.warning(`产品 ${bad.sku} 预报数量必须为正整数`)
  submitting.value = true
  try {
    const order = await createInbound({ ...form, items: items.value.map((it) => ({ ...it })) })
    ElMessage.success(`入库单 ${order.code} 创建成功（待揽货）`)
    router.push('/inbound/pickup')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-wrap">
    <el-card shadow="never" class="form-card">
      <!-- 模式切换：默认 / 批量导入 -->
      <el-radio-group v-model="mode" class="mode-switch">
        <el-radio-button value="default">默认</el-radio-button>
        <el-radio-button value="batch">批量导入</el-radio-button>
      </el-radio-group>

      <div class="form-title">基本信息</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <div class="inline-ctrl">
                <el-input v-model="form.username" readonly placeholder="默认当前登录账号" />
                <el-button @click="pickUser">{{ tl('common.selectUser', '选择') }}</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库单号">
              <el-input v-model="form.code" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择目的仓库" prop="warehouse">
              <el-select v-model="form.warehouse" style="width: 100%">
                <el-option :label="WAREHOUSE" :value="WAREHOUSE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="跟踪号">
              <el-input v-model="form.trackNo" placeholder="头程物流追踪号，多个用英文逗号隔开" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择服务渠道" prop="serviceChannel">
              <el-select v-model="form.serviceChannel" style="width: 100%">
                <el-option v-for="c in SERVICE_CHANNELS" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择入库类型" prop="inboundType">
              <el-select v-model="form.inboundType" style="width: 100%">
                <el-option v-for="t in INBOUND_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择到仓方式" prop="arrivalMethod">
              <el-select v-model="form.arrivalMethod" style="width: 100%">
                <el-option v-for="m in ARRIVAL_METHODS" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计到仓时间" prop="etaTime">
              <el-date-picker v-model="form.etaTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="箱型" prop="boxType">
              <el-radio-group v-model="form.boxType">
                <el-radio value="拆单">拆单(箱)</el-radio>
                <el-radio value="整单">整单(箱)</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-title">产品明细</div>
      <!-- 批量导入模式：模板下载 + 上传 -->
      <div v-if="mode === 'batch'" class="pt-toolbar">
        <el-button @click="downloadTemplate">{{ tl('common.downloadTemplate', '下载模板') }}</el-button>
        <el-button type="primary" @click="mockUpload">{{ tl('common.uploadFile', '点我上传') }}</el-button>
      </div>
      <div class="pt-toolbar">
        <el-button type="primary" @click="pickerVisible = true">{{ tl('common.chooseProduct', '选择产品') }}</el-button>
      </div>
      <el-table :data="items" border size="small">
        <el-table-column type="index" label="序号" width="56" align="center" />
        <el-table-column prop="sku" label="产品Sku" width="120" />
        <el-table-column prop="name" label="产品名称" min-width="140" />
        <el-table-column prop="nameEn" label="产品英文" min-width="140" />
        <el-table-column label="预报数量" width="160" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.forecastQty" :min="1" :precision="0" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" @click="removeItem($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="submit-bar">
        <el-button @click="router.back()">{{ tl('common.cancel', '取消') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ tl('common.submit', '提交') }}</el-button>
      </div>
    </el-card>

    <!-- 选择产品弹窗（仅已审核+启用产品） -->
    <ProductPicker v-model="pickerVisible" mode="inbound" :username="pickerUsername" :exclude-skus="excludeSkus" @confirm="onProductsPicked" />

    <!-- 选择用户弹窗 -->
    <el-dialog v-model="userVisible" title="选择用户" width="420px">
      <el-table :data="users" border size="small" highlight-current-row @row-click="confirmUser">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="role" label="角色" width="110" />
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped>
.mode-switch { margin-bottom: 16px; }
.inline-ctrl { display: flex; gap: 8px; width: 100%; }
.submit-bar { margin-top: 20px; display: flex; justify-content: center; gap: 12px; }
</style>