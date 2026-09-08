<script setup>
/**
 * 认领管理（PRD 6.3.5）：仓库收到"无主货"挂出待认领列表
 * 筛选：仓库名、入库编号或追踪号（多个英文逗号隔开）；按钮：查询
 * 认领后生成/关联本人入库单（状态=待确认），记录从客户列表消失
 */
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '../../components/ProTable.vue'
import { queryClaims, claimCargo } from '../../api'
import { WAREHOUSE } from '../../mock/data'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'ClaimManage' })

const ptRef = ref(null)

const filters = [
  { prop: 'warehouse', label: '仓库名', type: 'select', options: [{ value: WAREHOUSE, label: WAREHOUSE }] },
  { prop: 'codeOrTrack', label: '入库编号或追踪号', type: 'input-multi', placeholder: '多个用英文逗号隔开' }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'code', label: '入库单号', width: 190 },
  { prop: 'trackNo', label: '追踪号', width: 150 },
  { prop: 'deliveryMethod', label: '交货方式', width: 110 },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
  { prop: 'action', label: '操作', width: 100, noExport: true }
]

const fetchPage = (p) => queryClaims({ ...p, form: p.filters })

/** 认领：确认后并入本人入库流程（待确认列表可见） */
async function handleClaim(row) {
  await ElMessageBox.confirm(
    `确认认领无主货 ${row.code}（追踪号 ${row.trackNo}）？认领后将生成您的入库单并进入"待确认"流程。`,
    '认领',
    { type: 'warning' }
  )
  try {
    const order = await claimCargo(row.id)
    ElMessage.success(`认领成功，已生成入库单 ${order.code}（待确认）`)
    ptRef.value?.handleQuery()
  } catch (e) {
    ElMessage.error(e.message)
  }
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" export-filename="认领管理">
      <template #action="{ row }">
        <el-button link type="primary" @click="handleClaim(row)">认领</el-button>
      </template>
    </ProTable>
  </div>
</template>
