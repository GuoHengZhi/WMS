<script setup>
/**
 * 创建出库（一件代发，PRD 6.4.1）
 * 单选"默认"/"批量导入"；基本信息区 + 收件人区 + 产品子表区
 * 业务规则：未选仓库不能选产品；产品弹窗实时显示可库库存；数量超库存拦截
 * 提交 → 状态=待下架（分配发货单号）→ 跳"待下架"列表
 */
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductPicker from '../../components/ProductPicker.vue'
import { createOutbound, dict, getAvailableStock } from '../../api'
import { useUserStore } from '../../store/user'
import { WAREHOUSE, COUNTRIES } from '../../mock/data'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'OutboundCreate' })

const router = useRouter()
const { users } = dict()
const userStore = useUserStore()

const mode = ref('default')

const formRef = ref(null)
const form = reactive({
  username: userStore.username,
  refNo: '',
  warehouse: '',
  country: '韩国',
  receiverName: '',
  receiverPhone: '',
  receiverAddr: '',
  postCode: '',
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请选择用户名', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库名称', trigger: 'change' }],
  country: [{ required: true, message: '请选择国家', trigger: 'change' }],
  receiverName: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
  receiverPhone: [{ required: true, message: '请输入收件人电话', trigger: 'blur' }],
  receiverAddr: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  postCode: [{ required: true, message: '请输入邮编', trigger: 'blur' }]
}

// 产品子表
const items = ref([])

// 未选仓库时"选择产品"禁用（PRD 6.4.1 实测行为）
const pickerDisabled = computed(() => !form.warehouse)

// 仓库切换后清空已选产品（库存口径变化）
watch(() => form.warehouse, () => {
  items.value = []
})

function onProductsPicked(rows) {
  rows.forEach((r) => {
    if (!items.value.find((it) => it.sku === r.sku)) {
      items.value.push({ sku: r.sku, name: r.name, nameEn: r.nameEn, stock: r.available, qty: 1 })
    }
  })
}

function removeItem(idx) {
  items.value.splice(idx, 1)
}

// 行内实时校验：数量 > 可库库存时标红提示
function overStock(row) {
  return row.qty > row.stock
}

// 选择用户弹窗
const userVisible = ref(false)
function confirmUser(u) {
  form.username = u.username
  userVisible.value = false
}

// 批量导入（mock）
function downloadTemplate() {
  ElMessage.success('模板已开始下载（表头：参考号、仓库、国家、收件人、电话、地址、邮编、Sku、数量）')
}
function mockUpload() {
  if (!form.warehouse) return ElMessage.warning('请先选择仓库名称')
  const demo = [
    { sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', qty: 2 },
    { sku: 'S0004', name: '手机壳', nameEn: '폰케이스', qty: 1 }
  ]
  demo.forEach((d) => {
    if (!items.value.find((it) => it.sku === d.sku)) {
      items.value.push({ ...d, stock: getAvailableStock(form.username, form.warehouse, d.sku) })
    }
  })
  ElMessage.success('导入成功：2 张出库明细已加入（演示数据）')
}

// 选择产品弹窗
const pickerVisible = ref(false)
const pickerUsername = computed(() => form.username)
const excludeSkus = computed(() => items.value.map((it) => it.sku))

const submitting = ref(false)
async function handleSubmit() {
  await formRef.value.validate()
  if (!items.value.length) return ElMessage.warning('请至少选择一个产品')
  const over = items.value.find(overStock)
  if (over) return ElMessage.warning(`产品 ${over.sku} 数量超过可库库存（可用 ${over.stock}），请核对`)
  submitting.value = true
  try {
    const order = await createOutbound({
      ...form,
      receiverAddr: [form.receiverAddr, form.postCode].filter(Boolean).join(' '),
      items: items.value.map((it) => ({ sku: it.sku, name: it.name, nameEn: it.nameEn, qty: it.qty }))
    })
    ElMessage.success(`出库单 ${order.code} 创建成功（待下架），发货单号 ${order.deliveryNo}`)
    router.push('/outbound/outbound-djh')
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
                <el-button @click="userVisible = true">{{ tl('common.selectUser', '选择') }}</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参考号">
              <el-input v-model="form.refNo" placeholder="客户内部参考号（选填）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择仓库名称" prop="warehouse">
              <el-select v-model="form.warehouse" style="width: 100%" placeholder="请选择仓库">
                <el-option :label="WAREHOUSE" :value="WAREHOUSE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择国家" prop="country">
              <el-select v-model="form.country" style="width: 100%">
                <el-option v-for="c in COUNTRIES" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-title">收件人信息</div>
      <el-form label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="收件人姓名" required>
              <el-input v-model="form.receiverName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收件人电话" required>
              <el-input v-model="form.receiverPhone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址" required>
              <el-input v-model="form.receiverAddr" placeholder="州省/城市/地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编" required>
              <el-input v-model="form.postCode" />
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
      <div v-if="mode === 'batch'" class="pt-toolbar">
        <el-button @click="downloadTemplate">{{ tl('common.downloadTemplate', '下载模板') }}</el-button>
        <el-button type="primary" :disabled="pickerDisabled" @click="mockUpload">{{ tl('common.uploadFile', '点我上传') }}</el-button>
      </div>
      <div class="pt-toolbar">
        <el-button type="primary" :disabled="pickerDisabled" @click="pickerVisible = true">{{ tl('common.chooseProduct', '选择产品') }}</el-button>
        <span v-if="pickerDisabled" class="pick-tip">请先选择仓库名称</span>
      </div>
      <el-table :data="items" border size="small">
        <el-table-column type="index" label="序号" width="56" align="center" />
        <el-table-column prop="sku" label="Sku" width="110" />
        <el-table-column prop="name" label="产品名称" min-width="130" />
        <el-table-column prop="nameEn" label="英文名称" min-width="130" />
        <el-table-column prop="stock" label="库存" width="90" align="right" />
        <el-table-column label="数量" width="160" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.qty" :min="1" :precision="0" size="small" controls-position="right" :class="{ 'over-stock': overStock(row) }" />
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

    <!-- 选择产品弹窗（含实时库存列） -->
    <ProductPicker v-model="pickerVisible" mode="outbound" :username="pickerUsername" :warehouse="form.warehouse" :exclude-skus="excludeSkus" @confirm="onProductsPicked" />

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
.pick-tip { color: #909399; font-size: 12px; align-self: center; }
.over-stock :deep(.el-input__inner) { color: #f56c6c; font-weight: 600; }
.submit-bar { margin-top: 20px; display: flex; justify-content: center; gap: 12px; }
</style>