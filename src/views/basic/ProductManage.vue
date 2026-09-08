<script setup>
/**
 * 产品管理（PRD 6.2.1）
 * 筛选：用户名、Sku或FnSku（多个逗号）、中文/英文名称（模糊）、状态、审核状态
 * 按钮：查询、新增、审核（选中后启用）、导入、导出
 * 列表：序号/用户名/Sku/产品图片/中文名称/英文名称/所属分类/长*宽*高(cm)/重量(kg)/规格/状态/审核状态/操作(复制、更多)
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '../../components/ProTable.vue'
import { queryProducts, saveProduct, toggleProduct, auditProducts, queryInventory } from '../../api'
import { AUDIT_STATUS } from '../../utils/status'
import { CATEGORIES } from '../../mock/data'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'ProductManage' })

const ptRef = ref(null)
const selection = ref([])

const filters = [
  { prop: 'username', label: '用户名', type: 'input' },
  { prop: 'skuOrFn', label: 'Sku或FnSku', type: 'input-multi', placeholder: '多个用英文逗号隔开' },
  { prop: 'productName', label: '中文名称', type: 'input', placeholder: '中文/英文名称' },
  { prop: 'enabled', label: '状态', type: 'select', options: [{ value: '1', label: '启用' }, { value: '0', label: '禁用' }] },
  { prop: 'audit', label: '审核状态', type: 'select', options: Object.entries(AUDIT_STATUS).map(([value, m]) => ({ value, label: tl(m.key, m.zh) })) }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'username', label: '用户名', width: 96 },
  { prop: 'sku', label: 'Sku', width: 90 },
  { prop: 'image', label: '产品图片', width: 80, align: 'center', noExport: true },
  { prop: 'name', label: '中文名称', minWidth: 110, showOverflowTooltip: true },
  { prop: 'nameEn', label: '英文名称', minWidth: 120, showOverflowTooltip: true },
  { prop: 'category', label: '所属分类', width: 90 },
  { prop: 'size', label: '长*宽*高(cm)', width: 110, align: 'center' },
  { prop: 'weight', label: '重量(kg)', width: 86, align: 'right' },
  { prop: 'spec', label: '规格', width: 70, align: 'center' },
  { prop: 'enabled', label: '状态', width: 86, align: 'center', noExport: true },
  { prop: 'audit', label: '审核状态', width: 96, tagMap: AUDIT_STATUS },
  { prop: 'action', label: '操作', width: 130, noExport: true }
]

/** 行数据 → 列展示适配 */
const fetchPage = async (p) => {
  const res = await queryProducts({ ...p, form: p.filters })
  return {
    total: res.total,
    rows: res.rows.map((r) => ({ ...r, size: `${r.length}*${r.width}*${r.height}` }))
  }
}

// ---- 新增/编辑/复制弹窗 ----
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref(null)
const emptyForm = () => ({ id: '', sku: '', name: '', nameEn: '', category: CATEGORIES[0], length: 10, width: 10, height: 10, weight: 0.1, spec: '1', fnSku: '' })
const form = reactive(emptyForm())
const rules = {
  sku: [{ required: true, message: '请输入 Sku', trigger: 'blur' }],
  name: [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
  nameEn: [{ required: true, message: '请输入英文名称', trigger: 'blur' }]
}

function openDialog(row, mode = 'edit') {
  const base = row ? { ...row } : emptyForm()
  // 复制：以选中行为模板新建，Sku 需重新填写（PRD 6.2.1 交互 3）
  Object.assign(form, base, { id: mode === 'copy' ? '' : base.id, sku: mode === 'copy' ? '' : base.sku })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    await saveProduct({ ...form, id: form.id || undefined })
    ElMessage.success(tl('common.saveSuccess', '保存成功'))
    dialogVisible.value = false
    ptRef.value?.handleQuery()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

async function handleEnabled(row, val) {
  await toggleProduct(row.id, val)
  ElMessage.success(val ? '已启用' : '已禁用')
}

// ---- 审核（批量通过/驳回，驳回必填原因） ----
const auditVisible = ref(false)
const auditForm = reactive({ result: 'AUDITED', reason: '' })

function openAudit() {
  if (!selection.value.length) return ElMessage.warning(tl('common.selectRows', '请先勾选数据'))
  auditForm.result = 'AUDITED'
  auditForm.reason = ''
  auditVisible.value = true
}

async function handleAudit() {
  try {
    await auditProducts(selection.value.map((r) => r.id), auditForm.result, auditForm.reason)
    ElMessage.success(auditForm.result === 'AUDITED' ? '审核通过' : '已驳回')
    auditVisible.value = false
    ptRef.value?.handleQuery()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

// ---- 导入（mock） / 导出 ----
function handleImport() {
  ElMessageBox.alert('1. 下载模板；2. 填写产品信息后上传；3. 逐行校验并返回错误报告（演示环境为模拟导入）。', '导入', { confirmButtonText: tl('common.confirmText', '确定') })
}

function handleExport() {
  ptRef.value?.exportCurrent()
}

// ---- 查看库存（"更多"下拉） ----
const stockVisible = ref(false)
const stockRows = ref([])

async function viewStock(row) {
  const res = await queryInventory({ page: 1, pageSize: 100, form: { skuOrFn: row.sku } })
  stockRows.value = res.rows
  stockVisible.value = true
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" export-filename="产品管理" @selection-change="(v) => (selection = v)">
      <template #toolbar>
        <el-button type="primary" @click="openDialog(null, 'create')">新增</el-button>
        <el-button type="success" :disabled="!selection.length" @click="openAudit">审核</el-button>
        <el-button @click="handleImport">导入</el-button>
        <el-button @click="handleExport">导出</el-button>
      </template>
      <template #image="{ row }">
        <div class="img-ph">{{ (row.name || 'P').slice(0, 1) }}</div>
      </template>
      <template #enabled="{ row }">
        <el-switch :model-value="row.enabled" @change="(v) => handleEnabled(row, v)" />
      </template>
      <template #action="{ row }">
        <el-button link type="primary" @click="openDialog(row, 'copy')">复制</el-button>
        <el-dropdown trigger="click" @command="(cmd) => (cmd === 'edit' ? openDialog(row, 'edit') : viewStock(row))">
          <el-button link type="primary">
            更多<el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">编辑</el-dropdown-item>
              <el-dropdown-item command="stock">查看库存</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ProTable>

    <!-- 新增/编辑/复制弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑产品' : '新增产品'" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="Sku" prop="sku"><el-input v-model="form.sku" placeholder="用户内唯一" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="FnSku"><el-input v-model="form.fnSku" placeholder="Amazon FBA 标识（选填）" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="中文名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="英文名称" prop="nameEn"><el-input v-model="form.nameEn" placeholder="支持任意语言文本" /></el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="所属分类">
              <el-select v-model="form.category" style="width: 100%">
                <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"><el-form-item label="规格"><el-input v-model="form.spec" placeholder="包装规格/单位" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="长(cm)"><el-input-number v-model="form.length" :min="0.1" :precision="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="宽(cm)"><el-input-number v-model="form.width" :min="0.1" :precision="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="高(cm)"><el-input-number v-model="form.height" :min="0.1" :precision="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="重量(kg)"><el-input-number v-model="form.weight" :min="0.01" :precision="2" style="width: 100%" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditVisible" title="产品审核" width="440px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.result">
            <el-radio value="AUDITED">通过</el-radio>
            <el-radio value="REJECTED">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.result === 'REJECTED'" label="驳回原因" required>
          <el-input v-model="auditForm.reason" type="textarea" :rows="2" placeholder="驳回必填原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAudit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看库存弹窗 -->
    <el-dialog v-model="stockVisible" title="查看库存" width="560px">
      <el-table :data="stockRows" border>
        <el-table-column type="index" label="序号" width="56" align="center" />
        <el-table-column prop="warehouse" label="仓库名称" min-width="130" />
        <el-table-column prop="sku" label="Sku" width="100" />
        <el-table-column prop="onHand" label="在库" width="80" align="right" />
        <el-table-column prop="reserved" label="预占" width="80" align="right" />
        <el-table-column prop="available" label="可库库存" width="90" align="right" />
      </el-table>
    </el-dialog>
  </div>
</template>
