<script setup>
/**
 * 店铺订单（PRD 6.1.1）
 * 筛选：选择店铺 / 状态 / 关键字（多个英文逗号隔开，匹配订单编号/平台单号）
 * 按钮：查询、同步订单、重新执行映射（选中后启用）、审核（选中后启用）
 * 审核：未映射订单拦截；通过后自动转一件代发出库单（状态=待下架）
 */
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '../../components/ProTable.vue'
import { queryShopOrders, queryShops, syncShopOrders, reMapShopOrders, auditShopOrders } from '../../api'
import { SHOP_ORDER_STATUS, MAP_STATUS } from '../../utils/status'
import { tl } from '../../utils/i18n'
import { moneyNum } from '../../utils/format'

defineOptions({ name: 'ShopOrder' })

const ptRef = ref(null)
const selection = ref([])
const shopOptions = ref([])

const filters = [
  { prop: 'shopId', label: '选择店铺', type: 'select', options: [] },
  { prop: 'orderStatus', label: '状态', type: 'select', options: Object.entries(SHOP_ORDER_STATUS).map(([value, m]) => ({ value, label: tl(m.key, m.zh) })) },
  { prop: 'keyword', label: '关键字', type: 'input-multi', placeholder: '订单编号/平台单号，多个英文逗号隔开' }
]

const columns = [
  { type: 'index', label: '序号' },
  { prop: 'username', label: '用户名', width: 100 },
  { prop: 'shopName', label: '店铺名称', minWidth: 170, showOverflowTooltip: true },
  { prop: 'orderNo', label: '订单编号', width: 160 },
  { prop: 'platformOrderNo', label: '平台订单号', width: 180 },
  { prop: 'createTime', label: '下单时间', width: 160, sortable: true },
  { prop: 'items', label: '商品明细', minWidth: 180, showOverflowTooltip: true, exportText: (row) => (row.items || []).map((it) => `${it.platformSku}×${it.qty}`).join('；') },
  { prop: 'mapStatus', label: '映射状态', width: 100, tagMap: MAP_STATUS },
  { prop: 'amount', label: '订单金额', width: 100, align: 'right', formatter: (row) => `￥${moneyNum(row.amount)}` },
  { prop: 'orderStatus', label: '状态', width: 100, tagMap: SHOP_ORDER_STATUS }
]

const fetchPage = (p) => queryShopOrders({ ...p, form: p.filters })

async function loadShopOptions() {
  const res = await queryShops({ page: 1, pageSize: 1000, form: {} })
  shopOptions.value = res.rows.map((s) => ({ value: s.id, label: s.name }))
  filters[0].options = [{ value: '', label: '全部' }, ...shopOptions.value]
}

/** 同步订单（手动触发，幂等去重） */
async function handleSync() {
  const { added, shops } = await syncShopOrders()
  ElMessage.success(`同步完成：已授权店铺 ${shops} 个，本次拉取订单 ${added} 条`)
  ptRef.value?.handleQuery()
}

/** 重新执行映射（仅映射失败/未映射订单有效） */
async function handleReMap() {
  if (!selection.value.length) return ElMessage.warning(tl('common.selectRows', '请先勾选数据'))
  const { ok, miss } = await reMapShopOrders(selection.value)
  if (miss.length) ElMessage.warning(`映射成功 ${ok} 条；${miss.join('、')} 无可用映射，请先在 SKU映射 中配置`)
  else ElMessage.success(`重新执行映射成功 ${ok} 条`)
  ptRef.value?.handleQuery()
}

/** 审核：未映射拦截；通过后转出库单 */
async function handleAudit() {
  if (!selection.value.length) return ElMessage.warning(tl('common.selectRows', '请先勾选数据'))
  await ElMessageBox.confirm(tl('common.operationConfirm', '此操作将执行该动作，是否继续？'), '审核订单', { type: 'warning' })
  await auditShopOrders(selection.value)
  ElMessage.success('审核通过，已生成一件代发出库单（待下架）')
  ptRef.value?.handleQuery()
}

onMounted(loadShopOptions)
</script>

<template>
  <div class="page-wrap">
    <ProTable
      ref="ptRef"
      :filters="filters"
      :columns="columns"
      :fetch="fetchPage"
      export-filename="店铺订单"
      @selection-change="(v) => (selection = v)"
    >
      <template #toolbar>
        <el-button type="primary" @click="handleSync">同步订单</el-button>
        <el-button :disabled="!selection.length" @click="handleReMap">重新执行映射</el-button>
        <el-button type="success" :disabled="!selection.length" @click="handleAudit">审核</el-button>
      </template>
      <template #items="{ row }">
        {{ (row.items || []).map((it) => `${it.platformSku}×${it.qty}`).join('；') }}
      </template>
    </ProTable>
  </div>
</template>