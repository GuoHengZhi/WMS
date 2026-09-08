<script setup>
/**
 * 入库列表（PRD 6.3.2/6.3.3/6.3.4）：一个组件按 props.mode 复用三个页面
 * mode='pickup'  待揽货（PENDING_PICKUP）
 * mode='confirm' 待确认（PENDING_CONFIRM，列：序号/入库单号/用户名/仓库名/追踪号/交货方式/备注/操作）
 * mode='all'     所有单（全状态 + 复合时间列 + 状态列）
 */
import { ref, computed } from 'vue'
import ProTable from '../../components/ProTable.vue'
import { queryInbound } from '../../api'
import { INBOUND_STATUS } from '../../utils/status'
import { WAREHOUSE } from '../../mock/data'
import { tl } from '../../utils/i18n'
import { exportExcel } from '../../utils/format'

defineOptions({ name: 'InboundList' })

const props = defineProps({
  mode: { type: String, default: 'all' } // pickup | confirm | all
})

const ptRef = ref(null)
const detailVisible = ref(false)
const detailRow = ref(null)

/** 筛选配置随 mode 变化（PRD 6.3.2 同"所有单"；6.3.3 仅仓库名/用户名/编号或追踪号） */
const filters = computed(() => {
  const base = [
    { prop: 'warehouse', label: '仓库名', type: 'select', options: [{ value: WAREHOUSE, label: WAREHOUSE }] },
    { prop: 'username', label: '用户名', type: 'input' },
    { prop: 'codeOrTrack', label: '入库编号或追踪号', type: 'input-multi', placeholder: '多个用英文逗号隔开' }
  ]
  if (props.mode === 'confirm') return base
  return [
    ...base,
    { prop: 'shelfStatus', label: '上架状态', type: 'select', options: [{ value: '上架', label: '上架' }, { value: '未上架', label: '未上架' }] },
    { prop: 'startDate', label: '起始日期', type: 'date' },
    { prop: 'endDate', label: '截至日期', type: 'date' },
    { prop: 'status', label: '状态', type: 'select', options: Object.entries(INBOUND_STATUS).map(([value, m]) => ({ value, label: tl(m.key, m.zh) })) }
  ]
})

/** 列配置随 mode 变化（PRD 6.3.4：序号/入库单号/用户名/仓库名/追踪号/交货方式/备注/时间/状态/操作） */
const columns = computed(() => {
  const base = [
    { type: 'index', label: '序号' },
    { prop: 'code', label: '入库单号', width: 180 },
    { prop: 'username', label: '用户名', width: 100, sortable: true },
    { prop: 'warehouse', label: '仓库名', minWidth: 130, sortable: true },
    { prop: 'trackNo', label: '追踪号', width: 140, showOverflowTooltip: true },
    { prop: 'deliveryMethod', label: '交货方式', width: 100 },
    { prop: 'remark', label: '备注', minWidth: 140, showOverflowTooltip: true }
  ]
  if (props.mode === 'confirm') return [...base, { prop: 'action', label: '操作', width: 80, noExport: true }]
  return [
    ...base,
    { prop: 'time', label: '时间', width: 220, noExport: true },
    { prop: 'status', label: '状态', width: 96, tagMap: INBOUND_STATUS },
    { prop: 'action', label: '操作', width: 80, noExport: true }
  ]
})

const fetchPage = (p) => queryInbound({ ...p, form: p.filters, mode: props.mode })

function view(row) {
  detailRow.value = row
  detailVisible.value = true
}

/** 导出：遵循当前筛选条件；时间列展开为 创建时间/揽收时间/上架时间 三列（PRD 6.3.4 建议） */
async function handleExport() {
  const res = await queryInbound({ page: 1, pageSize: 100000, form: ptRef.value?.filterForm || {}, mode: props.mode })
  const cols = [
    { prop: '__seq', label: '序号' },
    { prop: 'code', label: '入库单号' },
    { prop: 'username', label: '用户名' },
    { prop: 'warehouse', label: '仓库名' },
    { prop: 'trackNo', label: '追踪号' },
    { prop: 'deliveryMethod', label: '交货方式' },
    { prop: 'remark', label: '备注' },
    { prop: 'createTime', label: '创建时间' },
    { prop: 'pickupTime', label: '揽收时间' },
    { prop: 'shelfTime', label: '上架时间' },
    { prop: 'status', label: '状态', exportText: (row) => tl(INBOUND_STATUS[row.status]?.key, INBOUND_STATUS[row.status]?.zh || row.status) }
  ]
  exportExcel(cols, (res.rows || []).map((r, i) => ({ ...r, __seq: i + 1 })), `入库${props.mode === 'pickup' ? '待揽货' : props.mode === 'confirm' ? '待确认' : '所有单'}`)
}

/** 详情弹窗产品明细表 */
function detailItems(row) {
  return row?.items || []
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" :export-filename="`入库${mode === 'pickup' ? '待揽货' : mode === 'confirm' ? '待确认' : '所有单'}`">
      <template #toolbar>
        <el-button v-if="mode !== 'confirm'" @click="handleExport">导出</el-button>
      </template>
      <template #time="{ row }">
        <div class="time-comp">
          <div v-if="row.createTime">创建：{{ row.createTime }}</div>
          <div v-if="row.pickupTime">揽收：{{ row.pickupTime }}</div>
          <div v-if="row.shelfTime">上架：{{ row.shelfTime }}</div>
        </div>
      </template>
      <template #action="{ row }">
        <el-button link type="primary" @click="view(row)">查看</el-button>
      </template>
    </ProTable>

    <!-- 详情弹窗：基本信息 + 产品明细（PRD 6.3.4 查看） -->
    <el-dialog v-model="detailVisible" title="入库单详情" width="760px">
      <el-descriptions v-if="detailRow" :column="2" border size="small">
        <el-descriptions-item label="入库单号">{{ detailRow.code }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailRow.username }}</el-descriptions-item>
        <el-descriptions-item label="仓库名">{{ detailRow.warehouse }}</el-descriptions-item>
        <el-descriptions-item label="追踪号">{{ detailRow.trackNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="交货方式">{{ detailRow.deliveryMethod }}</el-descriptions-item>
        <el-descriptions-item label="服务渠道">{{ detailRow.serviceChannel }}</el-descriptions-item>
        <el-descriptions-item label="入库类型">{{ detailRow.inboundType }}</el-descriptions-item>
        <el-descriptions-item label="到仓方式">{{ detailRow.arrivalMethod }}</el-descriptions-item>
        <el-descriptions-item label="预计到仓时间">{{ detailRow.etaTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="箱型">{{ detailRow.boxType }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="INBOUND_STATUS[detailRow.status]?.tag || 'info'">{{ tl(INBOUND_STATUS[detailRow.status]?.key, INBOUND_STATUS[detailRow.status]?.zh || detailRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '—' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailRow.createTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="揽收时间">{{ detailRow.pickupTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="上架时间">{{ detailRow.shelfTime || '—' }}</el-descriptions-item>
      </el-descriptions>
      <div class="form-title" style="margin-top: 16px">产品明细</div>
      <el-table :data="detailItems(detailRow)" border size="small">
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