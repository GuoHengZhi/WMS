import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../store/user'
import { tl } from '../utils/i18n'

const MainLayout = () => import('../layout/MainLayout.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { titleKey: 'menu.login', title: '登录' }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/basic/product',
    children: [
      // 我的店铺
      { path: 'shop/order', name: 'ShopOrder', component: () => import('../views/shop/ShopOrder.vue'), meta: { parentKey: 'menu.shop', title: '店铺订单' } },
      { path: 'shop/authorize', name: 'ShopAuthorize', component: () => import('../views/shop/ShopAuthorize.vue'), meta: { parentKey: 'menu.shop', title: '店铺授权' } },
      { path: 'shop/sku_mapping', name: 'SkuMapping', component: () => import('../views/shop/SkuMapping.vue'), meta: { parentKey: 'menu.shop', title: 'SKU映射' } },
      // 基本信息
      { path: 'basic/product', name: 'ProductManage', component: () => import('../views/basic/ProductManage.vue'), meta: { parentKey: 'menu.basic', title: '产品管理' } },
      // 入库管理
      { path: 'inbound/claim', name: 'ClaimManage', component: () => import('../views/inbound/ClaimManage.vue'), meta: { parentKey: 'menu.inbound', title: '认领管理' } },
      { path: 'inbound/create', name: 'InboundCreate', component: () => import('../views/inbound/InboundCreate.vue'), meta: { parentKey: 'menu.inbound', title: '创建入库' } },
      { path: 'inbound/pickup', name: 'InboundPickup', component: () => import('../views/inbound/InboundList.vue'), props: { mode: 'pickup' }, meta: { parentKey: 'menu.inbound', title: '待揽货' } },
      { path: 'inbound/confirm', name: 'InboundConfirm', component: () => import('../views/inbound/InboundList.vue'), props: { mode: 'confirm' }, meta: { parentKey: 'menu.inbound', title: '待确认' } },
      { path: 'inbound/all', name: 'InboundAll', component: () => import('../views/inbound/InboundList.vue'), props: { mode: 'all' }, meta: { parentKey: 'menu.inbound', title: '所有单' } },
      // 一件代发
      { path: 'outbound/create', name: 'OutboundCreate', component: () => import('../views/outbound/OutboundCreate.vue'), meta: { parentKey: 'menu.outbound', title: '创建出库' } },
      { path: 'outbound/outbound-djh', name: 'OutboundDjh', component: () => import('../views/outbound/OutboundList.vue'), props: { mode: 'djh' }, meta: { parentKey: 'menu.outbound', title: '待下架' } },
      { path: 'outbound/outbound-dfh', name: 'OutboundDfh', component: () => import('../views/outbound/OutboundList.vue'), props: { mode: 'dfh' }, meta: { parentKey: 'menu.outbound', title: '待出货' } },
      { path: 'outbound/outbound-yfh', name: 'OutboundYfh', component: () => import('../views/outbound/OutboundList.vue'), props: { mode: 'yfh' }, meta: { parentKey: 'menu.outbound', title: '已出货' } },
      { path: 'outbound/outbound-all', name: 'OutboundAll', component: () => import('../views/outbound/OutboundList.vue'), props: { mode: 'all' }, meta: { parentKey: 'menu.outbound', title: '所有单' } },
      // 换标管理
      { path: 'fbarebrand/create', name: 'RebrandCreate', component: () => import('../views/rebrand/RebrandCreate.vue'), meta: { parentKey: 'menu.rebrand', title: '创建换标' } },
      { path: 'fbarebrand/rebrand-djh', name: 'RebrandDjh', component: () => import('../views/rebrand/RebrandList.vue'), props: { mode: 'djh' }, meta: { parentKey: 'menu.rebrand', title: '待拣货' } },
      { path: 'fbarebrand/rebrand-dtb', name: 'RebrandDtb', component: () => import('../views/rebrand/RebrandList.vue'), props: { mode: 'dtb' }, meta: { parentKey: 'menu.rebrand', title: '待贴标' } },
      { path: 'fbarebrand/rebrand-dfh', name: 'RebrandDfh', component: () => import('../views/rebrand/RebrandList.vue'), props: { mode: 'dfh' }, meta: { parentKey: 'menu.rebrand', title: '待发货' } },
      { path: 'fbarebrand/rebrand-yfh', name: 'RebrandYfh', component: () => import('../views/rebrand/RebrandList.vue'), props: { mode: 'yfh' }, meta: { parentKey: 'menu.rebrand', title: '已发货' } },
      // 退货管理
      { path: 'return/create', name: 'ReturnCreate', component: () => import('../views/return/ReturnCreate.vue'), meta: { parentKey: 'menu.return', title: '创建退货' } },
      { path: 'return/return-dlh', name: 'ReturnDlh', component: () => import('../views/return/ReturnList.vue'), props: { mode: 'dlh' }, meta: { parentKey: 'menu.return', title: '退货待揽收' } },
      { path: 'return/return-dsj', name: 'ReturnDsj', component: () => import('../views/return/ReturnList.vue'), props: { mode: 'dsj' }, meta: { parentKey: 'menu.return', title: '退货待上架' } },
      { path: 'return/return-dcl', name: 'ReturnDcl', component: () => import('../views/return/ReturnList.vue'), props: { mode: 'dcl' }, meta: { parentKey: 'menu.return', title: '退货待处理' } },
      { path: 'return/return-dwc', name: 'ReturnDwc', component: () => import('../views/return/ReturnList.vue'), props: { mode: 'dwc' }, meta: { parentKey: 'menu.return', title: '退货待完成' } },
      { path: 'return/return-ywc', name: 'ReturnYwc', component: () => import('../views/return/ReturnList.vue'), props: { mode: 'ywc' }, meta: { parentKey: 'menu.return', title: '退货已完成' } },
      // 库存管理
      { path: 'stock/stock-detail', name: 'StockDetail', component: () => import('../views/stock/StockDetail.vue'), meta: { parentKey: 'menu.stock', title: '库存明细' } },
      { path: 'stock/inquiry', name: 'StockInquiry', component: () => import('../views/stock/StockInquiry.vue'), meta: { parentKey: 'menu.stock', title: '库存查询' } },
      // 财务中心
      { path: 'finance/bankInfo', name: 'BankInfo', component: () => import('../views/finance/BankInfo.vue'), meta: { parentKey: 'menu.finance', title: '银行账户' } },
      { path: 'finance/payment', name: 'Payment', component: () => import('../views/finance/Payment.vue'), meta: { parentKey: 'menu.finance', title: '订单账单' } },
      // 个人设置
      { path: 'profile', name: 'Profile', component: () => import('../views/profile/Profile.vue'), meta: { parentKey: '', title: '个人设置' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  userStore.restore()
  if (to.path !== '/login' && !userStore.isLoggedIn) return '/login'
  if (to.path === '/login' && userStore.isLoggedIn) return '/basic/product'
  const title = to.meta?.title || ''
  document.title = title ? `${title} - 海外仓系统` : '海外仓系统'
})

export default router

// 面包屑/Tab 标题：i18n key 优先，缺省回退中文标题
export function routeTitle(route) {
  if (route?.meta?.titleKey) return tl(route.meta.titleKey, route.meta.title || '')
  return route?.meta?.title || ''
}
