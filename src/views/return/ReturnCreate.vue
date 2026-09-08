<script setup>
/**
 * 创建退货（PRD 6.6.1）：退货预报
 * 字段：选择目的仓库/跟踪号/Sku/选择服务渠道/选择入库类型/货物类型/离港时间/到港时间/预计到仓时间/备注/选择产品
 * 产品子表（实测列）：序号/产品Sku/产品名称/产品英文/预报数量/操作
 * 提交 → 退货单号 TH+日期+流水，状态=退货待揽收 → 跳"退货待揽收"列表
 */
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductPicker from '../../components/ProductPicker.vue'
import { createReturn, dict } from '../../api'
import { useUserStore } from '../../store/user'
import { WAREHOUSE, SERVICE_CHANNELS, INBOUND_TYPES, RETURN_TYPES } from '../../mock/data'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'ReturnCreate' })

const router = useRouter()
const { users } = dict()
const userStore = useUserStore()

const formRef = ref(null)
const form = reactive({
  username: userStore.username,
  warehouse: WAREHOUSE,
  trackNo: '',
  skuText: '',
  serviceChannel: SERVICE_CHANNELS[0],
  inboundType: INBOUND_TYPES[0],
  type: RETURN_TYPES[0],
  departureTime: '',
  arrivalTime: '',
  etaTime: '',
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请选择用户名', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择目的仓库', trigger: 'change' }],
  trackNo: [{ required: true, message: '请输入跟踪号（便于跟踪货物轨迹）', trigger: 'blur' }],
  serviceChannel: [{ required: true, message: '请选择服务渠道', trigger: 'change' }],
  inboundType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
  type: [{ required: true, message: '请选择货物类型', trigger: 'change' }],
  etaTime: [{ required: true, message: '请选择预计到仓时间', trigger: 'change' }]
}

// 产品子表
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

// 选择用户弹窗
const userVisible = ref(false)
function confirmUser(u) {
  form.username = u.username
  userVisible.value = false
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
    const order = await createReturn({ ...form, items: items.value.map((it) => ({ ...it })) })
    ElMessage.success(`退货单 ${order.code} 创建成功（退货待揽收）`)
    router.push('/return/return-dlh')
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
      <div class="form-title">退货预报</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
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
            <el-form-item label="选择目的仓库" prop="warehouse">
              <el-select v-model="form.warehouse" style="width: 100%">
                <el-option :label="WAREHOUSE" :value="WAREHOUSE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="跟踪号" prop="trackNo">
              <el-input v-model="form.trackNo" placeholder="便于跟踪货物轨迹" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Sku">
              <el-input v-model="form.skuText" placeholder="退回货物 Sku（选填，多个用英文逗号隔开）" />
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
            <el-form-item label="货物类型" prop="type">
              <el-select v-model="form.type" style="width: 100%">
                <el-option v-for="t in RETURN_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="离港时间">
              <el-date-picker v-model="form.departureTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到港时间">
              <el-date-picker v-model="form.arrivalTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计到仓时间" prop="etaTime">
              <el-date-picker v-model="form.etaTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期时间" style="width: 100%" />
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

    <!-- 选择产品弹窗 -->
    <ProductPicker v-model="pickerVisible" mode="return" :username="pickerUsername" :exclude-skus="excludeSkus" @confirm="onProductsPicked" />

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
.inline-ctrl { display: flex; gap: 8px; width: 100%; }
.submit-bar { margin-top: 20px; display: flex; justify-content: center; gap: 12px; }
</style>