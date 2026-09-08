<script setup>
/**
 * MainLayout 主框架（PRD 6.0 全局框架需求）
 * G-02 左侧菜单树 + 面包屑；G-03 顶部多标签页；G-04 语言切换；G-05 用户菜单与消息中心
 */
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/user'
import { useTabsStore } from '../store/tabs'
import { routeTitle } from '../router'
import { tl } from '../utils/i18n'
import { setLocale } from '../locales'
import { queryMessages, unreadCount, markAllMessagesRead } from '../api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tabsStore = useTabsStore()
const { locale } = useI18n()

const collapsed = ref(false)

// 菜单结构（与 router/index.js 一一对应，8 大模块；key 为 i18n 键）
const menus = [
  { key: 'menu.shop', title: '我的店铺', children: [
    { path: '/shop/order', key: 'menu.shopOrder', title: '店铺订单' },
    { path: '/shop/authorize', key: 'menu.shopAuthorize', title: '店铺授权' },
    { path: '/shop/sku_mapping', key: 'menu.skuMapping', title: 'SKU映射' }
  ] },
  { key: 'menu.basic', title: '基本信息', children: [
    { path: '/basic/product', key: 'menu.product', title: '产品管理' }
  ] },
  { key: 'menu.inbound', title: '入库管理', children: [
    { path: '/inbound/claim', key: 'menu.claim', title: '认领管理' },
    { path: '/inbound/create', key: 'menu.inboundCreate', title: '创建入库' },
    { path: '/inbound/pickup', key: 'menu.pickup', title: '待揽货' },
    { path: '/inbound/confirm', key: 'menu.confirm', title: '待确认' },
    { path: '/inbound/all', key: 'menu.inboundAll', title: '所有单' }
  ] },
  { key: 'menu.outbound', title: '一件代发', children: [
    { path: '/outbound/create', key: 'menu.outboundCreate', title: '创建出库' },
    { path: '/outbound/outbound-djh', key: 'menu.picking', title: '待下架' },
    { path: '/outbound/outbound-dfh', key: 'menu.pendingShip', title: '待出货' },
    { path: '/outbound/outbound-yfh', key: 'menu.shipped', title: '已出货' },
    { path: '/outbound/outbound-all', key: 'menu.outboundAll', title: '所有单' }
  ] },
  { key: 'menu.rebrand', title: '换标管理', children: [
    { path: '/fbarebrand/create', key: 'menu.rebrandCreate', title: '创建换标' },
    { path: '/fbarebrand/rebrand-djh', key: 'menu.rebrandPick', title: '待拣货' },
    { path: '/fbarebrand/rebrand-dtb', key: 'menu.rebrandLabel', title: '待贴标' },
    { path: '/fbarebrand/rebrand-dfh', key: 'menu.rebrandDispatch', title: '待发货' },
    { path: '/fbarebrand/rebrand-yfh', key: 'menu.rebrandShipped', title: '已发货' }
  ] },
  { key: 'menu.ret', title: '退货管理', children: [
    { path: '/return/create', key: 'menu.returnCreate', title: '创建退货' },
    { path: '/return/return-dlh', key: 'menu.returnReceive', title: '退货待揽收' },
    { path: '/return/return-dsj', key: 'menu.returnShelf', title: '退货待上架' },
    { path: '/return/return-dcl', key: 'menu.returnProcess', title: '退货待处理' },
    { path: '/return/return-dwc', key: 'menu.returnFinish', title: '退货待完成' },
    { path: '/return/return-ywc', key: 'menu.returnDone', title: '退货已完成' }
  ] },
  { key: 'menu.stock', title: '库存管理', children: [
    { path: '/stock/stock-detail', key: 'menu.stockDetail', title: '库存明细' },
    { path: '/stock/inquiry', key: 'menu.stockInquiry', title: '库存查询' }
  ] },
  { key: 'menu.finance', title: '财务中心', children: [
    { path: '/finance/bankInfo', key: 'menu.bankInfo', title: '银行账户' },
    { path: '/finance/payment', key: 'menu.payment', title: '订单账单' }
  ] }
]

// 面包屑：父级模块 > 当前页面
const parentTitle = computed(() => {
  const key = route.meta?.parentKey
  return key ? tl(key, '') : ''
})
const currentTitle = computed(() => routeTitle(route))

// ---- 多标签页（G-03）：访问页面即开 Tab，可切换/关闭；右键 Tab = 仅保留当前 ----
watch(
  () => route.path,
  (path) => {
    if (path !== '/login') tabsStore.open(path, currentTitle.value)
  },
  { immediate: true }
)

const activeTabs = computed(() => tabsStore.tabs)

function switchTab(path) {
  if (path !== route.path) router.push(path)
}

function closeTab(path) {
  const next = tabsStore.close(path)
  if (path === route.path) {
    router.push(next?.path && next.path !== path ? next.path : '/basic/product')
  }
}

function closeOthers(path) {
  tabsStore.closeOthers(path)
  if (route.path !== path) router.push(path)
}

// keep-alive：按已打开 Tab 的组件名缓存；props.mode 复用的列表组件（一个组件多个路由）映射到组件名
const MODE_LIST_MAP = {
  InboundPickup: 'InboundList', InboundConfirm: 'InboundList', InboundAll: 'InboundList',
  OutboundDjh: 'OutboundList', OutboundDfh: 'OutboundList', OutboundYfh: 'OutboundList', OutboundAll: 'OutboundList',
  RebrandDjh: 'RebrandList', RebrandDtb: 'RebrandList', RebrandDfh: 'RebrandList', RebrandYfh: 'RebrandList',
  ReturnDlh: 'ReturnList', ReturnDsj: 'ReturnList', ReturnDcl: 'ReturnList', ReturnDwc: 'ReturnList', ReturnYwc: 'ReturnList'
}
const cachedNames = computed(() => {
  const names = new Set()
  tabsStore.tabs.forEach((t) => {
    const name = router.resolve(t.path)?.name
    if (name) names.add(MODE_LIST_MAP[name] || name)
  })
  return [...names]
})

// ---- 消息中心（G-05）：未读数角标 ----
const msgList = ref([])
const unread = computed(() => unreadCount(msgList.value))

async function loadMessages() {
  msgList.value = await queryMessages()
}

async function readAll() {
  await markAllMessagesRead()
  await loadMessages()
  ElMessage.success(tl('common.success', '操作成功'))
}

// ---- 语言切换（G-04） ----
function switchLang(lang) {
  setLocale(lang)
  locale.value = lang
  tabsStore.open(route.path, currentTitle.value) // 刷新当前 Tab 标题
}

// ---- 用户菜单 ----
function goProfile() {
  router.push('/profile')
}

async function logout() {
  await ElMessageBox.confirm(tl('layout.logoutConfirm', '确定退出登录吗？'), '提示', { type: 'warning' })
  userStore.logout()
  tabsStore.closeOthers('__reset__') // 清空标签页
  router.push('/login')
}

onMounted(loadMessages)
</script>

<template>
  <el-container class="layout">
    <!-- 左侧菜单树（G-02） -->
    <el-aside :width="collapsed ? '64px' : '210px'" class="aside">
      <div class="logo">
        <span v-if="!collapsed">海外仓系统</span>
        <span v-else>仓</span>
      </div>
      <el-scrollbar>
        <el-menu :default-active="route.path" :collapse="collapsed" router unique-opened class="menu" popper-class="menu-popper">
          <el-sub-menu v-for="m in menus" :key="m.key" :index="m.key">
            <template #title>{{ tl(m.key, m.title) }}</template>
            <el-menu-item v-for="c in m.children" :key="c.path" :index="c.path">{{ tl(c.key, c.title) }}</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- 顶部：折叠 + 面包屑 + 语言/消息/用户 -->
      <el-header class="header" height="50px">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="collapsed = !collapsed">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-if="parentTitle">{{ parentTitle }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- 语言切换（G-04） -->
          <el-dropdown @command="switchLang">
            <span class="header-item">
              <el-icon><Position /></el-icon>
              {{ tl('layout.language', '语言') }} / {{ locale === 'zh' ? '中文' : 'English' }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh">中文</el-dropdown-item>
                <el-dropdown-item command="en">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 消息中心（G-05）：未读数角标 -->
          <el-popover placement="bottom" :width="320" trigger="click" @show="loadMessages">
            <template #reference>
              <span class="header-item msg-btn">
                <el-badge :value="unread" :hidden="!unread" :max="99">
                  <el-icon><Bell /></el-icon>
                </el-badge>
              </span>
            </template>
            <div class="msg-panel">
              <div class="msg-head">
                <b>{{ tl('layout.messages', '消息中心') }}</b>
                <el-button link type="primary" size="small" @click="readAll">全部已读</el-button>
              </div>
              <el-empty v-if="!msgList.length" :description="tl('layout.noMessage', '暂无消息')" :image-size="60" />
              <div v-for="m in msgList" :key="m.id" class="msg-item" :class="{ unread: !m.read }">
                <div class="msg-title">
                  <el-badge v-if="!m.read" is-dot class="msg-dot" />
                  {{ m.title }}
                </div>
                <div class="msg-content">{{ m.content }}</div>
                <div class="msg-time">{{ m.time }}</div>
              </div>
            </div>
          </el-popover>

          <!-- 用户下拉（G-05） -->
          <el-dropdown @command="(cmd) => (cmd === 'profile' ? goProfile() : logout())">
            <span class="header-item user-item">
              <el-icon><User /></el-icon>
              {{ userStore.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">{{ tl('layout.profile', '个人设置') }}</el-dropdown-item>
                <el-dropdown-item command="logout" divided>{{ tl('layout.logout', '退出登录') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 多标签页工作区（G-03） -->
      <div class="tabs-bar">
        <div
          v-for="t in activeTabs"
          :key="t.path"
          class="tab-item"
          :class="{ active: t.path === route.path }"
          @click="switchTab(t.path)"
          @contextmenu.prevent="closeOthers(t.path)"
        >
          <span class="tab-title">{{ t.title }}</span>
          <el-icon class="tab-close" @click.stop="closeTab(t.path)"><Close /></el-icon>
        </div>
      </div>

      <!-- 主内容区：按 Tab 缓存页面状态（关闭 Tab 不影响其他页面，G-03） -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <!-- :key 按路由路径隔离实例：同一列表组件（props.mode 复用）在各 Tab 下独立缓存 -->
          <keep-alive :include="cachedNames">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout { height: 100%; }
.aside { background: #001529; transition: width 0.2s; overflow: hidden; }
.logo { height: 50px; line-height: 50px; text-align: center; color: #fff; font-weight: 600; font-size: 15px; letter-spacing: 1px; white-space: nowrap; }
.menu {
  border-right: none;
  background: #001529;
  /* Element Plus 菜单主题变量：子菜单容器/弹出层统一深色（修复子菜单白底白字不可见问题） */
  --el-menu-bg-color: #001529;
  --el-menu-text-color: rgba(255, 255, 255, 0.72);
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);
  --el-menu-hover-text-color: #ffffff;
  --el-menu-active-color: #409eff;
}
.menu :deep(.el-sub-menu__title),
.menu :deep(.el-menu-item) { color: var(--el-menu-text-color); }
.menu :deep(.el-sub-menu__title:hover),
.menu :deep(.el-menu-item:hover) { background: rgba(255, 255, 255, 0.08); }
.menu :deep(.el-menu-item.is-active) { color: #409eff; background: rgba(64, 158, 255, 0.18); }

.header { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #e4e7ed; padding: 0 16px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.collapse-btn { font-size: 18px; cursor: pointer; color: #606266; }
.header-right { display: flex; align-items: center; gap: 18px; }
.header-item { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #303133; font-size: 13px; }
.msg-btn { font-size: 18px; }
.user-item { font-weight: 600; }

.msg-panel { max-height: 360px; overflow: auto; }
.msg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.msg-item { padding: 8px 4px; border-bottom: 1px solid #f0f0f0; }
.msg-item.unread .msg-title { font-weight: 600; }
.msg-title { font-size: 13px; color: #303133; display: flex; align-items: center; gap: 4px; }
.msg-content { font-size: 12px; color: #909399; margin-top: 2px; }
.msg-time { font-size: 12px; color: #c0c4cc; margin-top: 2px; }

.tabs-bar { background: #fff; border-bottom: 1px solid #e4e7ed; padding: 5px 12px 0; display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; }
.tab-item { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border: 1px solid #e4e7ed; border-bottom: none; border-radius: 4px 4px 0 0; cursor: pointer; font-size: 12px; color: #606266; background: #f5f7fa; white-space: nowrap; }
.tab-item.active { background: #ecf5ff; color: #409eff; border-color: #d9ecff; }
.tab-close { font-size: 12px; border-radius: 50%; }
.tab-close:hover { background: #c0c4cc; color: #fff; }

.main { padding: 0; background: #f0f2f5; overflow: auto; }
</style>

<style>
/* 折叠态弹出子菜单（teleport 到 body，不在 .menu 作用域内）：与侧边菜单保持同一深色主题 */
.menu-popper.el-menu--vertical,
.menu-popper .el-menu--popup {
  background-color: #001529;
}
.menu-popper .el-menu--popup .el-menu-item {
  color: rgba(255, 255, 255, 0.72);
}
.menu-popper .el-menu--popup .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}
.menu-popper .el-menu--popup .el-menu-item.is-active {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.18);
}
</style>