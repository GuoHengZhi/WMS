<script setup>
/**
 * ProTable 通用列表封装（PRD G-06 通用列表能力）
 * 筛选区（配置化）+ 工具条插槽 + 表格（列配置/多选/服务端排序）+ 分页 + 导出
 * 数据由页面注入 fetch({ page, pageSize, filters, sort }) => Promise<{ rows, total }>
 */
import { reactive, ref, onMounted, onActivated } from 'vue'
import { statusText, statusTag } from '../utils/status'
import { exportExcel } from '../utils/format'

const props = defineProps({
  /** 筛选配置：{ prop, label, type: input|input-multi|select|date, options, placeholder, default } */
  filters: { type: Array, default: () => [] },
  /** 列配置：{ type: index|selection, prop, label, width, minWidth, sortable, slot, tagMap, formatter, align, noExport } */
  columns: { type: Array, required: true },
  /** 数据源：({ page, pageSize, filters, sort }) => Promise<{ rows, total }> */
  fetch: { type: Function, required: true },
  /** 导出文件名 */
  exportFilename: { type: String, default: '导出数据' },
  rowKey: { type: String, default: 'id' },
  /** 是否挂载即查询 */
  immediate: { type: Boolean, default: true }
})

const emit = defineEmits(['selection-change'])

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const sortState = ref(null)
const selection = ref([])
const tableRef = ref(null)

// 筛选表单：按配置初始化（支持 default 默认值）
const initForm = () => Object.fromEntries(props.filters.map((f) => [f.prop, f.default ?? '']))
const filterForm = reactive(initForm())

async function load() {
  loading.value = true
  try {
    const res = await props.fetch({
      page: page.value,
      pageSize: pageSize.value,
      filters: { ...filterForm },
      sort: sortState.value ? { ...sortState.value } : null
    })
    rows.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

/** 查询：回到第一页 */
function handleQuery() {
  page.value = 1
  load()
}

/** 重置为默认值并查询 */
function handleReset() {
  Object.assign(filterForm, initForm())
  handleQuery()
}

function onSortChange({ prop, order }) {
  sortState.value = order ? { prop, order: order === 'ascending' ? 'asc' : 'desc' } : null
  load()
}

function onSelectionChange(vals) {
  selection.value = vals
  emit('selection-change', vals)
}

/** 导出当前筛选条件下全部数据（列与页面一致，状态列输出中文文案，PRD G-06） */
async function exportCurrent() {
  const res = await props.fetch({ page: 1, pageSize: 100000, filters: { ...filterForm }, sort: sortState.value ? { ...sortState.value } : null })
  const all = (res.rows || []).map((r, i) => ({ ...r, __seq: i + 1 }))
  const cols = props.columns
    .filter((c) => c.type !== 'selection' && !c.noExport)
    .map((c) => {
      if (c.type === 'index') return { ...c, prop: '__seq' }
      // tagMap 状态列导出为中文文案
      if (c.tagMap && !c.formatter && !c.exportText) return { ...c, exportText: (row) => statusText(c.tagMap, row[c.prop]) }
      return c
    })
  exportExcel(cols, all, props.exportFilename)
}

/** 列默认渲染：tagMap > formatter > 原始值 */
function formatCell(col, row) {
  if (col.tagMap) return statusText(col.tagMap, row[col.prop])
  if (col.formatter) return col.formatter(row, row[col.prop])
  const v = row[col.prop]
  return v === null || v === undefined ? '' : v
}

// 首次挂载加载；从 keep-alive 缓存复用（切换 Tab/路由）时刷新数据（避免首次双重加载）
let mountedLoaded = false
onMounted(() => {
  if (props.immediate) load()
  mountedLoaded = true
})
onActivated(() => {
  if (mountedLoaded) {
    mountedLoaded = false
  } else {
    load()
  }
})

defineExpose({ load, handleQuery, exportCurrent, clearSelection: () => tableRef.value?.clearSelection(), toggleRowSelection: (row) => tableRef.value?.toggleRowSelection(row), filterForm })
</script>

<template>
  <div class="pro-table">
    <el-card shadow="never">
      <!-- 筛选区 -->
      <el-form v-if="filters.length" class="pt-filters" inline @submit.prevent>
        <el-form-item v-for="f in filters" :key="f.prop" :label="f.label">
          <el-input
            v-if="!f.type || f.type === 'input'"
            v-model="filterForm[f.prop]"
            :placeholder="f.placeholder || `请输入${f.label}`"
            clearable
            @keyup.enter="handleQuery"
          />
          <el-input
            v-else-if="f.type === 'input-multi'"
            v-model="filterForm[f.prop]"
            :placeholder="f.placeholder || '多个用英文逗号隔开'"
            clearable
            @keyup.enter="handleQuery"
          />
          <el-select v-else-if="f.type === 'select'" v-model="filterForm[f.prop]" :placeholder="f.placeholder || '全部'" clearable>
            <el-option v-for="o in f.options" :key="String(o.value)" :label="o.label" :value="o.value" />
          </el-select>
          <el-date-picker
            v-else-if="f.type === 'date'"
            v-model="filterForm[f.prop]"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="f.placeholder || '选择日期'"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具条（页面自定义按钮区） -->
      <div v-if="$slots.toolbar" class="pt-toolbar">
        <slot name="toolbar" />
      </div>

      <!-- 表格 -->
      <el-table ref="tableRef" v-loading="loading" :data="rows" :row-key="rowKey" border stripe @selection-change="onSelectionChange" @sort-change="onSortChange">
        <template v-for="col in columns" :key="col.type || col.prop">
          <el-table-column v-if="col.type === 'index'" type="index" :label="col.label || '序号'" :width="col.width || 56" align="center" />
          <el-table-column v-else-if="col.type === 'selection'" type="selection" width="42" align="center" />
          <el-table-column
            v-else
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :sortable="col.sortable ? 'custom' : false"
            :align="col.align || 'left'"
            :show-overflow-tooltip="col.showOverflowTooltip !== false"
          >
            <template #default="{ row, $index }">
              <el-tag v-if="col.tagMap" :type="statusTag(col.tagMap, row[col.prop])" size="small">{{ statusText(col.tagMap, row[col.prop]) }}</el-tag>
              <slot v-else-if="col.slot" :name="col.slot" :row="row" :index="$index" />
              <template v-else>{{ formatCell(col, row) }}</template>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 分页（默认 10 条/页可选，PRD G-06） -->
      <div class="pt-pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="(p) => { page = p; load() }"
          @size-change="(s) => { pageSize = s; page = 1; load() }"
        />
      </div>
    </el-card>
  </div>
</template>