<script setup>
/**
 * 库存明细（库存流水，PRD 6.7.1）：展示库存变动流水，可追溯来源单据
 * 筛选：仓库名、用户名、Sku/Fnsku、产品名称、变动时间开始/截止
 * 列表：序号/仓库名称/用户名/Sku/产品名称/英文名称/数量（正增负减）/变动类型/备注（来源单号）
 */
import ProTable from '../../components/ProTable.vue'
import { queryStockLedger } from '../../api'
import { WAREHOUSE } from '../../mock/data'

defineOptions({ name: 'StockDetail' })

const filters = [
  { prop: 'warehouse', label: '仓库名称', type: 'select', options: [{ value: WAREHOUSE, label: WAREHOUSE }] },
  { prop: 'skuOrFn', label: 'Sku/Fnsku', type: 'input-multi', placeholder: '多个用英文逗号隔开' },
  { prop: 'productName', label: '产品名称', type: 'input', placeholder: '中文/英文名称' },
  { prop: 'startDate', label: '变动时间开始', type: 'date' },
  { prop: 'endDate', label: '变动时间截止', type: 'date' }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'warehouse', label: '仓库名称', width: 130 },
  { prop: 'username', label: '用户名', width: 100 },
  { prop: 'sku', label: 'Sku', width: 100 },
  { prop: 'name', label: '产品名称', minWidth: 120, showOverflowTooltip: true },
  { prop: 'nameEn', label: '英文名称', minWidth: 120, showOverflowTooltip: true },
  { prop: 'qty', label: '数量', width: 90, align: 'right', formatter: (row) => (row.qty > 0 ? `+${row.qty}` : String(row.qty)) },
  { prop: 'changeType', label: '变动类型', width: 110 },
  { prop: 'sourceCode', label: '备注', minWidth: 180, showOverflowTooltip: true, formatter: (row) => [row.sourceCode, row.remark].filter(Boolean).join(' / ') }
]

const fetchPage = (p) => queryStockLedger({ ...p, form: p.filters })
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" export-filename="库存明细">
      <template #toolbar>
        <el-button @click="ptRef?.exportCurrent()">导出</el-button>
      </template>
      <template #qty="{ row }">
        <span :class="row.qty > 0 ? 'qty-plus' : row.qty < 0 ? 'qty-minus' : 'qty-zero'">{{ row.qty > 0 ? `+${row.qty}` : row.qty }}</span>
      </template>
    </ProTable>
  </div>
</template>