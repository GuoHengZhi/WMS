<script setup>
/**
 * 库存查询（实时库存，PRD 6.7.2）：当前可用库存实时查询（卖家最常用页）
 * 筛选：仓库名、用户名、Sku/Fnsku、产品名称
 * 列表：序号/仓库名称/用户名/Sku/产品图片/产品名称/英文名称/分类/规格/可库库存
 * 可库库存 = 在库库存 - 预占
 */
import ProTable from '../../components/ProTable.vue'
import { queryInventory } from '../../api'
import { WAREHOUSE } from '../../mock/data'

defineOptions({ name: 'StockInquiry' })

const filters = [
  { prop: 'warehouse', label: '仓库名称', type: 'select', options: [{ value: WAREHOUSE, label: WAREHOUSE }] },
  { prop: 'skuOrFn', label: 'Sku/Fnsku', type: 'input-multi', placeholder: '多个用英文逗号隔开' },
  { prop: 'productName', label: '产品名称', type: 'input', placeholder: '中文/英文名称' }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'warehouse', label: '仓库名称', width: 130 },
  { prop: 'username', label: '用户名', width: 100 },
  { prop: 'sku', label: 'Sku', width: 100 },
  { prop: 'image', label: '产品图片', width: 80, align: 'center', noExport: true },
  { prop: 'name', label: '产品名称', minWidth: 120, showOverflowTooltip: true },
  { prop: 'nameEn', label: '英文名称', minWidth: 120, showOverflowTooltip: true },
  { prop: 'category', label: '分类', width: 90 },
  { prop: 'spec', label: '规格', width: 70, align: 'center' },
  { prop: 'onHand', label: '在库总量', width: 90, align: 'right' },
  { prop: 'reserved', label: '预占数量', width: 90, align: 'right' },
  { prop: 'available', label: '可库库存', width: 96, align: 'right' }
]

const fetchPage = (p) => queryInventory({ ...p, form: p.filters })
</script>

<template>
  <div class="page-wrap">
    <ProTable ref="ptRef" :filters="filters" :columns="columns" :fetch="fetchPage" export-filename="库存查询">
      <template #toolbar>
        <el-button @click="ptRef?.exportCurrent()">导出</el-button>
      </template>
      <template #image="{ row }">
        <div class="img-ph">{{ (row.name || 'P').slice(0, 1) }}</div>
      </template>
      <template #available="{ row }">
        <span :class="row.available > 0 ? 'qty-plus' : 'qty-zero'">{{ row.available }}</span>
      </template>
    </ProTable>
  </div>
</template>