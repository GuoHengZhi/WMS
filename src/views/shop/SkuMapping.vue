<script setup>
/**
 * SKU映射（PRD 6.1.3）：平台产品 Sku → 系统 Sku 映射关系维护
 * 筛选：用户名、店铺名称、平台/系统产品sku、系统Sku状态
 * 按钮：查询、新增、批量删除（选中后启用）、导入、导出
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '../../components/ProTable.vue'
import { querySkuMappings, queryShops, queryProducts, saveSkuMapping, deleteSkuMappings } from '../../api'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'SkuMapping' })

/** 映射记录启用状态映射 */
const ENABLE_STATUS = {
  ENABLED: { zh: '启用', tag: 'success' },
  DISABLED: { zh: '禁用', tag: 'info' }
}

const ptRef = ref(null)
const selection = ref([])
const shopOptions = ref([])
const dialogVisible = ref(false)
const saving = ref(false)

const filters = [
  { prop: 'username', label: '用户名', type: 'input' },
  { prop: 'shopName', label: '店铺名称', type: 'input' },
  { prop: 'sku', label: '平台/系统产品Sku', type: 'input' },
  { prop: 'status', label: '系统Sku状态', type: 'select', options: [{ value: 'ENABLED', label: '启用' }, { value: 'DISABLED', label: '禁用' }] }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'username', label: '用户名', width: 100 },
  { prop: 'shopName', label: '店铺名称', minWidth: 170, showOverflowTooltip: true },
  { prop: 'platformSku', label: '平台产品Sku', width: 180 },
  { prop: 'systemSku', label: '系统Sku', width: 110 },
  { prop: 'qty', label: '系统Sku数量', width: 100, align: 'center' },
  { prop: 'status', label: '系统Sku状态', width: 104, tagMap: ENABLE_STATUS },
  { prop: 'createTime', label: '创建时间', width: 160, sortable: true },
  { prop: 'action', label: '操作', width: 120, noExport: true }
]

const fetchPage = (p) => querySkuMappings({ ...p, form: p.filters })

// 新增/编辑弹窗
const formRef = ref(null)
const form = reactive({ id: '', shopId: '', shopName: '', platformSku: '', systemSku: '', qty: 1, status: 'ENABLED' })
const rules = {
  shopId: [{ required: true, message: '请选择店铺', trigger: 'change' }],
  platformSku: [{ required: true, message: '请输入平台产品Sku', trigger: 'blur' }],
  systemSku: [{ required: true, message: '请输入系统Sku', trigger: 'blur' }],
  qty: [{ required: true, message: '请输入系统Sku数量', trigger: 'blur' }]
}

async function loadShopOptions() {
  const res = await queryShops({ page: 1, pageSize: 1000, form: {} })
  shopOptions.value = res.rows
}

function openDialog(row) {
  Object.assign(form, row ? { ...row } : { id: '', shopId: '', shopName: '', platformSku: '', systemSku: '', qty: 1, status: 'ENABLED' })
  dialogVisible.value = true
}

function onShopChange(shopId) {
  const s = shopOptions.value.find((x) => x.id === shopId)
  form.shopName = s?.name || ''
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    await saveSkuMapping({ ...form })
    ElMessage.success(tl('common.saveSuccess', '保存成功'))
    dialogVisible.value = false
    ptRef.value?.handleQuery()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

async function handleBatchDelete() {
  if (!selection.value.length) return ElMessage.warning(tl('common.selectRows', '请先勾选数据'))
  await ElMessageBox.confirm(tl('common.deleteConfirm', '此操作将删除所选数据，是否继续？'), '批量删除', { type: 'warning' })
  await deleteSkuMappings(selection.value.map((r) => r.id))
  ElMessage.success(tl('common.success', '操作成功'))
  ptRef.value?.handleQuery()
}

/** 单行删除 */
async function handleDelete(row) {
  await ElMessageBox.confirm(tl('common.deleteConfirm', '此操作将删除所选数据，是否继续？'), '删除', { type: 'warning' })
  await deleteSkuMappings([row.id])
  ElMessage.success(tl('common.success', '操作成功'))
  ptRef.value?.handleQuery()
}

/** 导入（mock）：下载模板 + 上传校验 */
function handleImport() {
  ElMessageBox.alert(
    '1. 下载模板（表头：店铺名称、平台产品Sku、系统Sku、系统Sku数量）；2. 填写后上传；3. 逐行校验，错误行提示行号与原因。（演示环境为模拟导入）',
    '导入',
    { confirmButtonText: tl('common.confirmText', '确定') }
  )
}

/** 模板下载（mock 导出表头空文件） */
function handleTemplate() {
  ElMessage.success('模板已开始下载（模拟）')
}

/** 供"导入"弹窗按钮复用的模拟上传 */
function mockUpload() {
  ElMessage.success('导入完成：成功 2 条，失败 0 条（模拟）')
  dialogVisible.value = false
  ptRef.value?.handleQuery()
}

/** 导出当前筛选条件数据 */
function handleExport() {
  ptRef.value?.exportCurrent()
}

onMounted(loadShopOptions)

// 供模板使用的产品列表（新增弹窗系统Sku下拉联想）
const productOptions = ref([])
async function loadProductOptions() {
  const res = await queryProducts({ page: 1, pageSize: 1000, form: {} })
  productOptions.value = res.rows.map((p) => p.sku)
}
onMounted(loadProductOptions)
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" export-filename="SKU映射" @selection-change="(v) => (selection = v)">
      <template #toolbar>
        <el-button type="primary" @click="openDialog()">新增</el-button>
        <el-button type="danger" :disabled="!selection.length" @click="handleBatchDelete">批量删除</el-button>
        <el-button @click="handleImport">导入</el-button>
        <el-button @click="handleExport">导出</el-button>
      </template>
      <template #action="{ row }">
        <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑映射' : '新增映射'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="选择店铺" prop="shopId">
          <el-select v-model="form.shopId" style="width: 100%" @change="onShopChange">
            <el-option v-for="s in shopOptions" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台产品Sku" prop="platformSku">
          <el-input v-model="form.platformSku" placeholder="如 AMZ-KR-EYESHADOW-02" />
        </el-form-item>
        <el-form-item label="系统Sku" prop="systemSku">
          <el-select v-model="form.systemSku" filterable allow-create default-first-option style="width: 100%" placeholder="选择或输入本人产品 Sku">
            <el-option v-for="s in productOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统Sku数量" prop="qty">
          <el-input-number v-model="form.qty" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-value="ENABLED" inactive-value="DISABLED" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>