<script setup>
/**
 * 创建换标（PRD 6.5.1）：FBA 换标单
 * 字段：选择Fba仓库/选择发货仓库/选择派送渠道/是否/参考号/FBA地址/货件编号/亚马逊内部编号/点我上传/选择产品
 * 产品子表（实测列）：序号/Sku/产品名称/FnSku/新FnSku/数量/操作(删除)
 * 规则：FnSku 默认带出可编辑；新FnSku 必填且 ≠ 旧 FnSku；数量 ≤ 发货仓库可库库存
 * 提交 → 状态=待拣货 → 跳"待拣货"列表
 */
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductPicker from '../../components/ProductPicker.vue'
import { createRebrand, dict } from '../../api'
import { useUserStore } from '../../store/user'
import { FBA_WAREHOUSES, CARRIERS } from '../../mock/data'
import { WAREHOUSE } from '../../mock/data'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'RebrandCreate' })

const router = useRouter()
const { users } = dict()
const userStore = useUserStore()

const formRef = ref(null)
const form = reactive({
  username: userStore.username,
  fbaWarehouse: FBA_WAREHOUSES[0],
  shipWarehouse: WAREHOUSE,
  deliveryChannel: CARRIERS[0],
  isFlag: '否',
  refNo: '',
  fbaAddress: '',
  shipmentId: '',
  amazonNo: '',
  attachment: '',
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请选择用户名', trigger: 'change' }],
  fbaWarehouse: [{ required: true, message: '请选择Fba仓库', trigger: 'change' }],
  shipWarehouse: [{ required: true, message: '请选择发货仓库', trigger: 'change' }],
  deliveryChannel: [{ required: true, message: '请选择派送渠道', trigger: 'change' }],
  isFlag: [{ required: true, message: '请选择', trigger: 'change' }],
  fbaAddress: [{ required: true, message: '请输入FBA地址', trigger: 'blur' }],
  shipmentId: [{ required: true, message: '请输入货件编号（如 FBA15ABCD123）', trigger: 'blur' }]
}

// 产品子表：FnSku 带出可编辑，新FnSku 手工录入
const items = ref([])

function onProductsPicked(rows) {
  rows.forEach((r) => {
    if (!items.value.find((it) => it.sku === r.sku)) {
      items.value.push({ sku: r.sku, name: r.name, nameEn: r.nameEn, fnSku: r.fnSku || '', newFnSku: '', qty: 1 })
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

// 上传附件（mock：装箱单/授权文件）
function mockUpload() {
  form.attachment = '装箱单.pdf'
  ElMessage.success('附件上传成功（模拟，支持 pdf/jpg/png/xlsx，≤10MB）')
}

// 选择产品弹窗（含 FnSku 列与库存列）
const pickerVisible = ref(false)
const pickerUsername = computed(() => form.username)
const excludeSkus = computed(() => items.value.map((it) => it.sku))

const submitting = ref(false)
async function handleSubmit() {
  await formRef.value.validate()
  if (!items.value.length) return ElMessage.warning('请至少选择一个产品')
  const noNew = items.value.find((it) => !it.newFnSku)
  if (noNew) return ElMessage.warning(`产品 ${noNew.sku} 新FnSku 必填`)
  const same = items.value.find((it) => it.newFnSku === it.fnSku)
  if (same) return ElMessage.warning(`产品 ${same.sku} 新FnSku 不能与旧 FnSku 相同`)
  submitting.value = true
  try {
    const order = await createRebrand({ ...form, items: items.value.map((it) => ({ ...it })) })
    ElMessage.success(`换标单 ${order.code} 创建成功（待拣货）`)
    router.push('/fbarebrand/rebrand-djh')
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
      <div class="form-title">基本信息</div>
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
            <el-form-item label="选择Fba仓库" prop="fbaWarehouse">
              <el-select v-model="form.fbaWarehouse" style="width: 100%">
                <el-option v-for="w in FBA_WAREHOUSES" :key="w" :label="w" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择发货仓库" prop="shipWarehouse">
              <el-select v-model="form.shipWarehouse" style="width: 100%">
                <el-option :label="WAREHOUSE" :value="WAREHOUSE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择派送渠道" prop="deliveryChannel">
              <el-select v-model="form.deliveryChannel" style="width: 100%">
                <el-option v-for="c in CARRIERS" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否" prop="isFlag">
              <el-select v-model="form.isFlag" style="width: 100%">
                <el-option label="否" value="否" />
                <el-option label="是" value="是" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参考号">
              <el-input v-model="form.refNo" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="FBA地址" prop="fbaAddress">
              <el-input v-model="form.fbaAddress" type="textarea" :rows="2" placeholder="亚马逊仓收货地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货件编号" prop="shipmentId">
              <el-input v-model="form.shipmentId" placeholder="Amazon Shipment ID，如 FBA15ABCD123" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="亚马逊内部编号">
              <el-input v-model="form.amazonNo" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="附件">
              <div class="inline-ctrl">
                <el-input v-model="form.attachment" readonly placeholder="装箱单/授权文件等" />
                <el-button @click="mockUpload">{{ tl('common.uploadFile', '点我上传') }}</el-button>
              </div>
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
        <el-table-column prop="sku" label="Sku" width="100" />
        <el-table-column prop="name" label="产品名称" min-width="120" />
        <el-table-column label="FnSku" min-width="170">
          <template #default="{ row }">
            <el-input v-model="row.fnSku" size="small" placeholder="FnSku（默认带出，可编辑）" />
          </template>
        </el-table-column>
        <el-table-column label="新FnSku" min-width="170">
          <template #default="{ row }">
            <el-input v-model="row.newFnSku" size="small" placeholder="必填，且与旧 FnSku 不同" />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="150" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.qty" :min="1" :precision="0" size="small" controls-position="right" />
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

    <!-- 选择产品弹窗（FnSku + 库存列） -->
    <ProductPicker v-model="pickerVisible" mode="rebrand" :username="pickerUsername" :warehouse="form.shipWarehouse" :exclude-skus="excludeSkus" @confirm="onProductsPicked" />

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