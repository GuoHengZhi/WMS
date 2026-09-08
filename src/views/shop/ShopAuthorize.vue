<script setup>
/**
 * 店铺授权（PRD 6.1.2）
 * 筛选：店铺中文/英文名称（模糊）；按钮：查询、新增
 * 列表：序号、用户名、店铺名称、英文名称、授权状态、排序、备注、操作（编辑/删除）
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '../../components/ProTable.vue'
import { queryShops, saveShop, deleteShop } from '../../api'
import { SHOP_AUTH_STATUS } from '../../utils/status'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'ShopAuthorize' })

const ptRef = ref(null)
const dialogVisible = ref(false)
const saving = ref(false)

const filters = [{ prop: 'name', label: '店铺名称', type: 'input', placeholder: '店铺中文/英文名称' }]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'username', label: '用户名', width: 100 },
  { prop: 'name', label: '店铺名称', minWidth: 180, showOverflowTooltip: true },
  { prop: 'nameEn', label: '英文名称', minWidth: 180, showOverflowTooltip: true },
  { prop: 'platform', label: '平台', width: 100 },
  { prop: 'authStatus', label: '授权状态', width: 96, tagMap: SHOP_AUTH_STATUS },
  { prop: 'sort', label: '排序', width: 70, align: 'center' },
  { prop: 'remark', label: '备注', minWidth: 140, showOverflowTooltip: true },
  { prop: 'action', label: '操作', width: 120, noExport: true }
]

const fetchPage = (p) => queryShops({ ...p, form: p.filters })

// 新增/编辑弹窗
const formRef = ref(null)
const form = reactive({ id: '', platform: 'Amazon', name: '', nameEn: '', authType: 'oauth', sort: 1, remark: '' })
const rules = {
  name: [{ required: true, message: '请输入店铺中文名称', trigger: 'blur' }],
  nameEn: [{ required: true, message: '请输入店铺英文名称', trigger: 'blur' }]
}

function openDialog(row) {
  Object.assign(form, row ? { id: row.id, platform: row.platform, name: row.name, nameEn: row.nameEn, authType: 'oauth', sort: row.sort, remark: row.remark } : { id: '', platform: 'Amazon', name: '', nameEn: '', authType: 'oauth', sort: 1, remark: '' })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    await saveShop({ id: form.id || undefined, platform: form.platform, name: form.name, nameEn: form.nameEn, sort: form.sort, remark: form.remark })
    ElMessage.success(tl('common.saveSuccess', '保存成功'))
    dialogVisible.value = false
    ptRef.value?.handleQuery()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(tl('common.deleteConfirm', '此操作将删除所选数据，是否继续？'), '删除店铺', { type: 'warning' })
  try {
    await deleteShop(row.id)
    ElMessage.success(tl('common.success', '操作成功'))
    ptRef.value?.handleQuery()
  } catch (e) {
    ElMessage.error(e.message)
  }
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" export-filename="店铺授权">
      <template #toolbar>
        <el-button type="primary" @click="openDialog()">新增</el-button>
      </template>
      <template #action="{ row }">
        <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 新增/编辑弹窗：平台、中英文名、授权方式、排序、备注 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑店铺' : '新增店铺'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="平台">
          <el-select v-model="form.platform" style="width: 200px">
            <el-option v-for="p in ['Amazon', 'Coupang', 'Shopee', '11Street', 'Lazada']" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺中文名" prop="name">
          <el-input v-model="form.name" placeholder="请输入店铺中文名称" />
        </el-form-item>
        <el-form-item label="店铺英文名" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入店铺英文名称" />
        </el-form-item>
        <el-form-item label="授权方式">
          <el-radio-group v-model="form.authType">
            <el-radio value="oauth">OAuth 授权跳转</el-radio>
            <el-radio value="credential">填入凭据</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
