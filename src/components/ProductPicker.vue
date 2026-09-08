<script setup>
/**
 * ProductPicker 产品选择弹窗（创建入库/出库/换标/退货共用）
 * - 仅列出"已审核 + 启用"的产品（PRD 6.2.1 业务规则 2）
 * - outbound/rebrand 模式实时显示"库存"列（可库库存 = 在库 - 预占，PRD 6.4.1）
 * - rebrand 模式显示 FnSku 列
 */
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { queryProducts, getAvailableStock } from '../api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** 弹窗用途：inbound|outbound|rebrand|return，影响列展示 */
  mode: { type: String, default: 'inbound' },
  /** 数据归属用户（创建页可切换） */
  username: { type: String, required: true },
  /** 出库/换标需按仓库展示库存 */
  warehouse: { type: String, default: '' },
  /** 已选 Sku（避免重复添加，禁用勾选） */
  excludeSkus: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const loading = ref(false)
const list = ref([])
const keyword = ref('')
const selection = ref([])

const showStock = computed(() => props.mode === 'outbound' || props.mode === 'rebrand')
const showFnSku = computed(() => props.mode === 'rebrand')

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter((r) => String(r.sku).toLowerCase().includes(k) || String(r.name).toLowerCase().includes(k) || String(r.nameEn).toLowerCase().includes(k))
})

async function fetchList() {
  if (!props.username) return
  loading.value = true
  try {
    const res = await queryProducts({ page: 1, pageSize: 1000, form: { audit: 'AUDITED', enabled: '1' } })
    list.value = (res.rows || []).map((p) => ({
      sku: p.sku,
      name: p.name,
      nameEn: p.nameEn,
      fnSku: p.fnSku,
      // 出库/换标显示该仓库实时可库库存（无库存记录则为 0）
      available: showStock.value ? getAvailableStock(props.username, props.warehouse, p.sku) : ''
    }))
  } finally {
    loading.value = false
  }
}

watch(visible, (v) => {
  if (v) {
    keyword.value = ''
    selection.value = []
    fetchList()
  }
})

function disabledRow(row) {
  return props.excludeSkus.includes(row.sku)
}

function handleConfirm() {
  if (!selection.value.length) {
    ElMessage.warning('请先勾选产品')
    return
  }
  emit('confirm', selection.value.map((r) => ({ ...r })))
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" title="选择产品" width="820px" destroy-on-close>
    <div style="margin-bottom: 12px">
      <el-input v-model="keyword" placeholder="输入 Sku / 名称检索" clearable style="width: 260px" />
    </div>
    <el-table v-loading="loading" :data="filtered" height="380" border @selection-change="(v) => (selection = v)">
      <el-table-column type="selection" width="42" :selectable="(row) => !disabledRow(row)" />
      <el-table-column type="index" label="序号" width="56" align="center" />
      <el-table-column prop="sku" label="产品Sku" width="110" />
      <el-table-column prop="name" label="产品名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="nameEn" label="产品英文" min-width="120" show-overflow-tooltip />
      <el-table-column v-if="showFnSku" prop="fnSku" label="FnSku" min-width="130" show-overflow-tooltip />
      <el-table-column v-if="showStock" label="库存" width="90" align="center">
        <template #default="{ row }">
          <span :class="row.available > 0 ? 'qty-plus' : 'qty-zero'">{{ row.available }}</span>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>
