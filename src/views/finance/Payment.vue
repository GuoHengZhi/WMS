<script setup>
/**
 * 订单账单（PRD 6.8.2）：按业务单据生成的费用账单，客户核对费用
 * 筛选：用户名、关联单号；按钮：查询、批量支付（勾选后启用，仅对待支付生效）
 * 列表：序号/账单编号/仓库名/用户名/关联单号/费用金额(￥)/费用时间/备注/状态/操作(查看)
 */
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '../../components/ProTable.vue'
import { queryBills, payBills } from '../../api'
import { BILL_STATUS } from '../../utils/status'
import { tl } from '../../utils/i18n'
import { moneyNum } from '../../utils/format'

defineOptions({ name: 'Payment' })

const ptRef = ref(null)
const selection = ref([])
const detailVisible = ref(false)
const detailRow = ref(null)

const filters = [
  { prop: 'relCode', label: '关联单号', type: 'input-multi', placeholder: '多个用英文逗号隔开' }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'code', label: '账单编号', width: 180, sortable: true },
  { prop: 'warehouse', label: '仓库名', minWidth: 130 },
  { prop: 'username', label: '用户名', width: 100 },
  { prop: 'relCode', label: '关联单号', width: 190, sortable: true },
  { prop: 'amount', label: '费用金额(￥)', width: 110, align: 'right', sortable: true, formatter: (row) => moneyNum(row.amount) },
  { prop: 'feeTime', label: '费用时间', width: 160, sortable: true },
  { prop: 'remark', label: '备注', minWidth: 170, showOverflowTooltip: true },
  { prop: 'status', label: '状态', width: 90, tagMap: BILL_STATUS },
  { prop: 'action', label: '操作', width: 80, noExport: true }
]

const fetchPage = (p) => queryBills({ ...p, form: p.filters })

/** 批量支付（勾选后启用，仅"待支付"生效，PRD 6.8.2 验收要点） */
async function handleBatchPay() {
  if (!selection.value.length) return ElMessage.warning(tl('common.selectRows', '请先勾选数据'))
  const pending = selection.value.filter((r) => r.status === 'PENDING')
  if (!pending.length) return ElMessage.warning('所选账单中无可支付的"待支付"账单')
  await ElMessageBox.confirm(`确认支付所选 ${pending.length} 笔待支付账单（合计 ￥${moneyNum(pending.reduce((s, b) => s + b.amount, 0))}）？`, '批量支付', { type: 'warning' })
  const n = await payBills(pending.map((b) => b.id))
  ElMessage.success(`支付成功 ${n} 笔（余额扣费，mock）`)
  ptRef.value?.handleQuery()
}

function view(row) {
  detailRow.value = row
  detailVisible.value = true
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" export-filename="订单账单" @selection-change="(v) => (selection = v)">
      <template #toolbar>
        <el-button type="primary" :disabled="!selection.length" @click="handleBatchPay">批量支付</el-button>
      </template>
      <template #action="{ row }">
        <el-button link type="primary" @click="view(row)">查看</el-button>
      </template>
    </ProTable>

    <!-- 账单明细弹窗 -->
    <el-dialog v-model="detailVisible" title="账单明细" width="560px">
      <el-descriptions v-if="detailRow" :column="2" border size="small">
        <el-descriptions-item label="账单编号">{{ detailRow.code }}</el-descriptions-item>
        <el-descriptions-item label="仓库名">{{ detailRow.warehouse }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailRow.username }}</el-descriptions-item>
        <el-descriptions-item label="关联单号">{{ detailRow.relCode }}</el-descriptions-item>
        <el-descriptions-item label="费用金额(￥)">￥{{ moneyNum(detailRow.amount) }}</el-descriptions-item>
        <el-descriptions-item label="费用时间">{{ detailRow.feeTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="BILL_STATUS[detailRow.status]?.tag || 'info'">{{ tl(BILL_STATUS[detailRow.status]?.key, BILL_STATUS[detailRow.status]?.zh || detailRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '—' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ tl('common.close', '关闭') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
