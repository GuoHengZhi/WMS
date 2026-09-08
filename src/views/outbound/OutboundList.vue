<script setup>
/**
 * 出库列表（PRD 6.4.2~6.4.5）：一个组件按 props.mode 复用四个页面
 * mode='djh' 待下架 | 'dfh' 待出货（打印） | 'yfh' 已出货（更多下拉/补打） | 'all' 所有单
 * 三个号码体系：订单编号 CK / 发货单号 FH / 单号（承运商追踪号）
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ProTable from '../../components/ProTable.vue'
import { queryOutbound, printOutbound } from '../../api'
import { OUTBOUND_STATUS } from '../../utils/status'
import { WAREHOUSE, CARRIERS, PRINT_STATUS } from '../../mock/data'
import { tl } from '../../utils/i18n'
import { exportExcel } from '../../utils/format'

defineOptions({ name: 'OutboundList' })

const props = defineProps({
  mode: { type: String, default: 'all' } // djh | dfh | yfh | all
})

const ptRef = ref(null)
const selection = ref([])
const detailVisible = ref(false)
const detailRow = ref(null)

const printOptions = [{ value: 'PRINTED', label: '已打印' }, { value: 'UNPRINTED', label: '未打印' }]

/** 筛选配置随 mode 变化（PRD 6.4.2~6.4.5） */
const filters = computed(() => {
  const base = [
    { prop: 'warehouse', label: '仓库名', type: 'select', options: [{ value: WAREHOUSE, label: WAREHOUSE }] },
    { prop: 'username', label: '用户名', type: 'input' },
    { prop: 'codeOrRef', label: '订单编号或参考号', type: 'input-multi', placeholder: '多个用英文逗号隔开' }
  ]
  if (props.mode === 'djh') return base
  if (props.mode === 'dfh') return [...base, { prop: 'printStatus', label: '面单打印状态', type: 'select', options: printOptions }]
  const middle = [
    { prop: 'deliveryNo', label: '发货单号', type: 'input-multi', placeholder: '多个用英文逗号隔开' },
    { prop: 'receiver', label: '收件人', type: 'input' },
    { prop: 'shipStart', label: '发货起始日期', type: 'date' },
    { prop: 'shipEnd', label: '发货截至日期', type: 'date' }
  ]
  const tail = [
    { prop: 'printStatus', label: '面单打印状态', type: 'select', options: printOptions },
    { prop: 'carrier', label: '选择服务商', type: 'select', options: CARRIERS.map((c) => ({ value: c, label: c })) }
  ]
  if (props.mode === 'yfh') return [...base, ...middle, ...tail]
  // 所有单：再加状态筛选（PRD 6.4.5）
  return [...base, ...middle, { prop: 'status', label: '状态', type: 'select', options: Object.entries(OUTBOUND_STATUS).map(([value, m]) => ({ value, label: tl(m.key, m.zh) })) }, ...tail]
})

/** 列配置随 mode 变化（列名与 PRD 逐字对应） */
const columns = computed(() => {
  if (props.mode === 'djh') {
    return [
      { type: 'index', label: '序号' },
      { prop: 'code', label: '订单编号', width: 180 },
      { prop: 'username', label: '用户名', width: 100, sortable: true },
      { prop: 'warehouse', label: '仓库名', minWidth: 130, sortable: true },
      { prop: 'refNo', label: '参考号', width: 120, showOverflowTooltip: true },
      { prop: 'deliveryNo', label: '发货单号', width: 180 },
      { prop: 'receiverName', label: '收件人', width: 110 },
      { prop: 'receiverPhone', label: '收件人电话', width: 130 },
      { prop: 'remark', label: '备注', minWidth: 130, showOverflowTooltip: true },
      { prop: 'createTime', label: '创建时间', width: 160, sortable: true },
      { prop: 'action', label: '操作', width: 80, noExport: true }
    ]
  }
  const dfh = [
    { type: 'index', label: '序号' },
    { prop: 'code', label: '订单编号', width: 180 },
    { prop: 'username', label: '用户名', width: 100, sortable: true },
    { prop: 'warehouse', label: '仓库名', minWidth: 120, sortable: true },
    { prop: 'refNo', label: '参考号', width: 110, showOverflowTooltip: true },
    { prop: 'channel', label: '物流渠道', width: 100 },
    { prop: 'deliveryNo', label: '发货单号', width: 180 },
    { prop: 'receiverName', label: '收件人', width: 100 },
    { prop: 'receiverPhone', label: '收件人电话', width: 124 },
    { prop: 'remark', label: '备注', minWidth: 110, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 160, sortable: true },
    { prop: 'carrierNo', label: '单号', width: 170, showOverflowTooltip: true },
    { prop: 'printStatus', label: '打印状态', width: 90, tagMap: PRINT_STATUS },
    { prop: 'action', label: '操作', width: 80, noExport: true }
  ]
  if (props.mode === 'dfh') return dfh
  if (props.mode === 'yfh') {
    return [
      { type: 'index', label: '序号' },
      { prop: 'code', label: '订单编号', width: 180 },
      { prop: 'username', label: '用户名', width: 100, sortable: true },
      { prop: 'warehouse', label: '仓库名', minWidth: 120, sortable: true },
      { prop: 'refNo', label: '参考号', width: 110, showOverflowTooltip: true },
      { prop: 'channel', label: '物流渠道', width: 100 },
      { prop: 'deliveryNo', label: '发货单号', width: 180 },
      { prop: 'receiverName', label: '收件人', width: 100 },
      { prop: 'receiverPhone', label: '收件人电话', width: 124 },
      { prop: 'remark', label: '备注', minWidth: 110, showOverflowTooltip: true },
      { prop: 'shipTime', label: '发货时间', width: 160, sortable: true },
      { prop: 'printStatus', label: '打印状态', width: 90, tagMap: PRINT_STATUS },
      { prop: 'action', label: '操作', width: 90, noExport: true }
    ]
  }
  // 所有单（PRD 6.4.5）
  return [
    { type: 'index', label: '序号' },
    { prop: 'code', label: '订单编号', width: 180 },
    { prop: 'username', label: '用户名', width: 96, sortable: true },
    { prop: 'warehouse', label: '仓库名', minWidth: 116, sortable: true },
    { prop: 'channel', label: '物流渠道', width: 96 },
    { prop: 'refNo', label: '参考号', width: 106, showOverflowTooltip: true },
    { prop: 'deliveryNo', label: '发货单号', width: 176 },
    { prop: 'receiverName', label: '收件人', width: 96 },
    { prop: 'receiverPhone', label: '收件人电话', width: 122 },
    { prop: 'remark', label: '备注', minWidth: 100, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 156, sortable: true },
    { prop: 'shipTime', label: '发货时间', width: 156, sortable: true },
    { prop: 'status', label: '状态', width: 90, tagMap: OUTBOUND_STATUS },
    { prop: 'printStatus', label: '打印状态', width: 90, tagMap: PRINT_STATUS },
    { prop: 'action', label: '操作', width: 80, noExport: true }
  ]
})

const fetchPage = (p) => queryOutbound({ ...p, form: p.filters, mode: props.mode })

/** 批量打印面单：打印状态 → 已打印（PRD 6.4.3；已出货页可补打） */
async function handlePrint() {
  if (!selection.value.length) return ElMessage.warning(tl('common.selectRows', '请先勾选数据'))
  const n = await printOutbound(selection.value.map((r) => r.id))
  ElMessage.success(n ? `打印成功 ${n} 单（面单已生成，打印状态更新为"已打印"）` : '所选订单均已打印（无新增打印）')
  ptRef.value?.handleQuery()
}

/** 导出打单数据：结构化 Excel 供第三方打单工具（PRD 6.4.2） */
async function handleExportLabel() {
  const res = await queryOutbound({ page: 1, pageSize: 100000, form: ptRef.value?.filterForm || {}, mode: props.mode })
  const cols = [
    { prop: 'code', label: '订单编号' },
    { prop: 'receiverName', label: '收件人' },
    { prop: 'receiverPhone', label: '收件人电话' },
    { prop: 'receiverAddr', label: '收件人地址' },
    { prop: 'country', label: '国家' },
    { prop: 'channel', label: '物流渠道' },
    { prop: 'deliveryNo', label: '发货单号' },
    { prop: 'itemsText', label: '产品明细', exportText: (r) => r.itemsText },
    { prop: 'remark', label: '备注' }
  ]
  exportExcel(cols, (res.rows || []).map((r) => ({ ...r, itemsText: (r.items || []).map((it) => `${it.sku}×${it.qty}`).join('；') })), '打单数据')
}

function view(row) {
  detailRow.value = row
  detailVisible.value = true
}

function reprint(row) {
  ElMessage.success(`补打面单：${row.code}（模拟打印）`)
}

function trackLogistics(row) {
  ElMessage.info(`物流轨迹查询：${row.carrierNo || row.deliveryNo}（模拟对接物流商轨迹 API）`)
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" :export-filename="`一件代发-${mode}`" @selection-change="(v) => (selection = v)">
      <template #toolbar>
        <el-button @click="ptRef?.exportCurrent()">导出</el-button>
        <el-button v-if="mode === 'djh'" @click="handleExportLabel">导出打单数据</el-button>
        <el-button v-if="mode === 'dfh' || mode === 'yfh'" type="primary" :disabled="!selection.length" @click="handlePrint">打印</el-button>
      </template>
      <template #action="{ row }">
        <!-- 已出货：更多下拉（查看详情/补打面单/查看物流轨迹，PRD 6.4.4） -->
        <el-dropdown v-if="mode === 'yfh'" trigger="click" @command="(cmd) => (cmd === 'view' ? view(row) : cmd === 'reprint' ? reprint(row) : trackLogistics(row))">
          <el-button link type="primary">
            更多<el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="view">查看详情</el-dropdown-item>
              <el-dropdown-item command="reprint">补打面单</el-dropdown-item>
              <el-dropdown-item command="track">查看物流轨迹</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-else link type="primary" @click="view(row)">查看</el-button>
      </template>
    </ProTable>

    <!-- 出库单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="出库单详情" width="780px">
      <el-descriptions v-if="detailRow" :column="2" border size="small">
        <el-descriptions-item label="订单编号">{{ detailRow.code }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailRow.username }}</el-descriptions-item>
        <el-descriptions-item label="仓库名">{{ detailRow.warehouse }}</el-descriptions-item>
        <el-descriptions-item label="目的国家">{{ detailRow.country }}</el-descriptions-item>
        <el-descriptions-item label="参考号">{{ detailRow.refNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="物流渠道">{{ detailRow.channel || '—' }}</el-descriptions-item>
        <el-descriptions-item label="发货单号">{{ detailRow.deliveryNo }}</el-descriptions-item>
        <el-descriptions-item label="单号（承运商）">{{ detailRow.carrierNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ detailRow.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="收件人电话">{{ detailRow.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收件地址" :span="2">{{ detailRow.receiverAddr }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ detailRow.shipTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="OUTBOUND_STATUS[detailRow.status]?.tag || 'info'">{{ tl(OUTBOUND_STATUS[detailRow.status]?.key, OUTBOUND_STATUS[detailRow.status]?.zh || detailRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="打印状态">{{ PRINT_STATUS[detailRow.printStatus]?.zh || detailRow.printStatus }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailRow.remark || '—' }}</el-descriptions-item>
      </el-descriptions>
      <div class="form-title" style="margin-top: 16px">产品明细</div>
      <el-table :data="detailRow?.items || []" border size="small">
        <el-table-column type="index" label="序号" width="56" align="center" />
        <el-table-column prop="sku" label="Sku" width="110" />
        <el-table-column prop="name" label="产品名称" min-width="130" />
        <el-table-column prop="nameEn" label="英文名称" min-width="130" />
        <el-table-column prop="qty" label="数量" width="80" align="right" />
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">{{ tl('common.close', '关闭') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>