<script setup>
/**
 * 退货列表（PRD 6.6.2~6.6.6）：一个组件按 props.mode 复用五个页面
 * mode='dlh' 退货待揽收 | 'dsj' 退货待上架 | 'dcl' 退货待处理 | 'dwc' 退货待完成 | 'ywc' 退货已完成
 * 列名按各页 PRD 逐字对应（dlh/dsj 含"入库单号"；ywc 以"退货完成时间"替代操作列）
 */
import { ref, computed } from 'vue'
import ProTable from '../../components/ProTable.vue'
import { queryReturn } from '../../api'
import { RETURN_STATUS } from '../../utils/status'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'ReturnList' })

const props = defineProps({
  mode: { type: String, default: 'dlh' } // dlh | dsj | dcl | dwc | ywc
})

const ptRef = ref(null)
const detailVisible = ref(false)
const detailRow = ref(null)

const MODE_TITLE = { dlh: '退货待揽收', dsj: '退货待上架', dcl: '退货待处理', dwc: '退货待完成', ywc: '退货已完成' }

/** 筛选：用户名、订单编号或追踪号；已完成页额外支持退货完成起止日期（PRD 6.6.6） */
const filters = computed(() => {
  const base = [
    { prop: 'username', label: '用户名', type: 'input' },
    { prop: 'codeOrTrack', label: '订单编号或追踪号', type: 'input-multi', placeholder: '退货单号/追踪号/入库单号，多个英文逗号隔开' }
  ]
  if (props.mode === 'ywc') {
    return [...base, { prop: 'finishStart', label: '退货完成起始日期', type: 'date' }, { prop: 'finishEnd', label: '退货完成截至日期', type: 'date' }]
  }
  return base
})

/** 列配置随 mode 变化 */
const columns = computed(() => {
  const dlhCols = [
    { type: 'index', label: '序号' },
    { prop: 'username', label: '用户名', width: 100, sortable: true },
    { prop: 'inboundCode', label: '入库单号', width: 180, sortable: true },
    { prop: 'trackNo', label: '追踪号', width: 140, sortable: true },
    { prop: 'code', label: '退货单号', width: 180 },
    { prop: 'refNo', label: '参考号', width: 110, sortable: true, showOverflowTooltip: true },
    { prop: 'type', label: '类型', width: 110 },
    { prop: 'remark', label: '备注', minWidth: 140, showOverflowTooltip: true },
    { prop: 'action', label: '操作', width: 80, noExport: true }
  ]
  if (props.mode === 'dlh' || props.mode === 'dsj') return dlhCols
  const dclCols = [
    { type: 'index', label: '序号' },
    { prop: 'username', label: '用户名', width: 100, sortable: true },
    { prop: 'code', label: '退货单号', width: 180, sortable: true },
    { prop: 'trackNo', label: '追踪号', width: 140, sortable: true },
    { prop: 'refNo', label: '参考号', width: 110, sortable: true, showOverflowTooltip: true },
    { prop: 'type', label: '类型', width: 110 },
    { prop: 'remark', label: '备注', minWidth: 140, showOverflowTooltip: true }
  ]
  if (props.mode === 'dcl' || props.mode === 'dwc') return [...dclCols, { prop: 'action', label: '操作', width: 80, noExport: true }]
  // ywc：报表页只读，退货完成时间用于 SLA 统计
  return [...dclCols, { prop: 'finishTime', label: '退货完成时间', width: 160, sortable: true }]
})

const fetchPage = (p) => queryReturn({ ...p, form: p.filters, mode: props.mode })

function view(row) {
  detailRow.value = row
  detailVisible.value = true
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" :export-filename="MODE_TITLE[mode]">
      <template #action="{ row }">
        <el-button link type="primary" @click="view(row)">查看</el-button>
      </template>
    </ProTable>

    <!-- 退货单详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="`退货单详情（${MODE_TITLE[mode]}）`" width="760px">
      <el-descriptions v-if="detailRow" :column="2" border size="small">
        <el-descriptions-item label="退货单号">{{ detailRow.code }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailRow.username }}</el-descriptions-item>
        <el-descriptions-item label="目的仓库">{{ detailRow.warehouse }}</el-descriptions-item>
        <el-descriptions-item label="关联入库单号">{{ detailRow.inboundCode || '—' }}</el-descriptions-item>
        <el-descriptions-item label="追踪号">{{ detailRow.trackNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="参考号">{{ detailRow.refNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="货物类型">{{ detailRow.type }}</el-descriptions-item>
        <el-descriptions-item label="服务渠道">{{ detailRow.serviceChannel }}</el-descriptions-item>
        <el-descriptions-item label="离港时间">{{ detailRow.departureTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="到港时间">{{ detailRow.arrivalTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="预计到仓时间">{{ detailRow.etaTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="退货完成时间">{{ detailRow.finishTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="RETURN_STATUS[detailRow.status]?.tag || 'info'">{{ tl(RETURN_STATUS[detailRow.status]?.key, RETURN_STATUS[detailRow.status]?.zh || detailRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '—' }}</el-descriptions-item>
      </el-descriptions>
      <div class="form-title" style="margin-top: 16px">产品明细</div>
      <el-table :data="detailRow?.items || []" border size="small">
        <el-table-column type="index" label="序号" width="56" align="center" />
        <el-table-column prop="sku" label="产品Sku" width="110" />
        <el-table-column prop="name" label="产品名称" min-width="120" />
        <el-table-column prop="nameEn" label="产品英文" min-width="120" />
        <el-table-column prop="forecastQty" label="预报数量" width="90" align="right" />
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">{{ tl('common.close', '关闭') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
