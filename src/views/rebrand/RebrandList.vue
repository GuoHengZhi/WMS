<script setup>
/**
 * 换标列表（PRD 6.5.2~6.5.5）：一个组件按 props.mode 复用四个页面
 * mode='djh' 待拣货 | 'dtb' 待贴标 | 'dfh' 待发货 | 'yfh' 已发货
 * 筛选：用户名、订单编号或追踪号；列表：序号/订单编号/用户名/参考号/备注/创建时间/操作(查看)
 */
import { ref } from 'vue'
import ProTable from '../../components/ProTable.vue'
import { queryRebrand } from '../../api'
import { REBRAND_STATUS } from '../../utils/status'
import { tl } from '../../utils/i18n'

defineOptions({ name: 'RebrandList' })

const props = defineProps({
  mode: { type: String, default: 'djh' } // djh | dtb | dfh | yfh
})

const ptRef = ref(null)
const detailVisible = ref(false)
const detailRow = ref(null)

const MODE_TITLE = { djh: '待拣货', dtb: '待贴标', dfh: '待发货', yfh: '已发货' }

const filters = [
  { prop: 'username', label: '用户名', type: 'input' },
  { prop: 'codeOrTrack', label: '订单编号或追踪号', type: 'input-multi', placeholder: '订单编号/参考号，多个英文逗号隔开' }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'code', label: '订单编号', width: 180 },
  { prop: 'username', label: '用户名', width: 100, sortable: true },
  { prop: 'refNo', label: '参考号', width: 120, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', width: 160, sortable: true },
  { prop: 'status', label: '状态', width: 96, tagMap: REBRAND_STATUS },
  { prop: 'action', label: '操作', width: 80, noExport: true }
]

const fetchPage = (p) => queryRebrand({ ...p, form: p.filters, mode: props.mode })

function view(row) {
  detailRow.value = row
  detailVisible.value = true
}
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" :export-filename="`换标-${MODE_TITLE[mode]}`">
      <template #action="{ row }">
        <el-button link type="primary" @click="view(row)">查看</el-button>
      </template>
    </ProTable>

    <!-- 换标单详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="`换标单详情（${MODE_TITLE[mode]}）`" width="760px">
      <el-descriptions v-if="detailRow" :column="2" border size="small">
        <el-descriptions-item label="订单编号">{{ detailRow.code }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailRow.username }}</el-descriptions-item>
        <el-descriptions-item label="Fba仓库">{{ detailRow.fbaWarehouse }}</el-descriptions-item>
        <el-descriptions-item label="发货仓库">{{ detailRow.shipWarehouse }}</el-descriptions-item>
        <el-descriptions-item label="派送渠道">{{ detailRow.deliveryChannel }}</el-descriptions-item>
        <el-descriptions-item label="是否">{{ detailRow.isFlag }}</el-descriptions-item>
        <el-descriptions-item label="参考号">{{ detailRow.refNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="货件编号">{{ detailRow.shipmentId }}</el-descriptions-item>
        <el-descriptions-item label="亚马逊内部编号">{{ detailRow.amazonNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="附件">{{ detailRow.attachment || '—' }}</el-descriptions-item>
        <el-descriptions-item label="FBA地址" :span="2">{{ detailRow.fbaAddress }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ detailRow.shipTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="REBRAND_STATUS[detailRow.status]?.tag || 'info'">{{ tl(REBRAND_STATUS[detailRow.status]?.key, REBRAND_STATUS[detailRow.status]?.zh || detailRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '—' }}</el-descriptions-item>
      </el-descriptions>
      <div class="form-title" style="margin-top: 16px">产品明细</div>
      <el-table :data="detailRow?.items || []" border size="small">
        <el-table-column type="index" label="序号" width="56" align="center" />
        <el-table-column prop="sku" label="Sku" width="100" />
        <el-table-column prop="name" label="产品名称" min-width="120" />
        <el-table-column prop="fnSku" label="FnSku" min-width="130" />
        <el-table-column prop="newFnSku" label="新FnSku" min-width="130" />
        <el-table-column prop="qty" label="数量" width="80" align="right" />
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">{{ tl('common.close', '关闭') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
