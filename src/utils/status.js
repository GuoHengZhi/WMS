import { tl } from './i18n'
import { maskAccount } from './format'

/**
 * 状态机映射（PRD 第 11 章）
 * zh 为中文文案兜底，key 为 i18n key，tag 为 el-tag 颜色
 */
export const INBOUND_STATUS = {
  PENDING_PICKUP: { zh: '待揽货', key: 'status.inbound.pendingPickup', tag: 'warning' },
  PENDING_CONFIRM: { zh: '待确认', key: 'status.inbound.pendingConfirm', tag: 'primary' },
  SHELVING: { zh: '上架中', key: 'status.inbound.shelving', tag: 'primary' },
  COMPLETED: { zh: '已完成', key: 'status.inbound.completed', tag: 'success' },
  CANCELLED: { zh: '已取消', key: 'status.inbound.cancelled', tag: 'info' },
  UNCLAIMED: { zh: '无主货', key: 'status.inbound.unclaimed', tag: 'danger' }
}

export const OUTBOUND_STATUS = {
  PENDING_PICKING: { zh: '待下架', key: 'status.outbound.pendingPicking', tag: 'warning' },
  PENDING_SHIP: { zh: '待出货', key: 'status.outbound.pendingShip', tag: 'primary' },
  SHIPPED: { zh: '已出货', key: 'status.outbound.shipped', tag: 'success' },
  CANCELLED: { zh: '已取消', key: 'status.outbound.cancelled', tag: 'info' }
}

export const REBRAND_STATUS = {
  PENDING_PICK: { zh: '待拣货', key: 'status.rebrand.pendingPick', tag: 'warning' },
  PENDING_LABEL: { zh: '待贴标', key: 'status.rebrand.pendingLabel', tag: 'primary' },
  PENDING_DISPATCH: { zh: '待发货', key: 'status.rebrand.pendingDispatch', tag: 'warning' },
  DISPATCHED: { zh: '已发货', key: 'status.rebrand.dispatched', tag: 'success' },
  CANCELLED: { zh: '已取消', key: 'status.rebrand.cancelled', tag: 'info' }
}

export const RETURN_STATUS = {
  PENDING_RECEIVE: { zh: '待揽收', key: 'status.ret.pendingReceive', tag: 'warning' },
  PENDING_SHELF: { zh: '待上架', key: 'status.ret.pendingShelf', tag: 'primary' },
  PENDING_PROCESS: { zh: '待处理', key: 'status.ret.pendingProcess', tag: 'primary' },
  PENDING_FINISH: { zh: '待完成', key: 'status.ret.pendingFinish', tag: 'warning' },
  COMPLETED: { zh: '已完成', key: 'status.ret.completed', tag: 'success' },
  CANCELLED: { zh: '已取消', key: 'status.ret.cancelled', tag: 'info' }
}

export const BILL_STATUS = {
  PENDING: { zh: '待支付', key: 'status.bill.pending', tag: 'warning' },
  PAID: { zh: '已支付', key: 'status.bill.paid', tag: 'success' },
  CANCELLED: { zh: '已取消', key: 'status.bill.cancelled', tag: 'info' }
}

export const AUDIT_STATUS = {
  PENDING: { zh: '待审核', key: 'status.audit.pending', tag: 'warning' },
  AUDITED: { zh: '已审核', key: 'status.audit.audited', tag: 'success' },
  REJECTED: { zh: '已驳回', key: 'status.audit.rejected', tag: 'danger' }
}

export const MAP_STATUS = {
  MAPPED: { zh: '已映射', key: 'status.map.mapped', tag: 'success' },
  UNMAPPED: { zh: '未映射', key: 'status.map.unmapped', tag: 'warning' },
  FAILED: { zh: '映射失败', key: 'status.map.failed', tag: 'danger' }
}

export const SHOP_ORDER_STATUS = {
  PENDING_AUDIT: { zh: '待审核', key: 'status.shopOrder.pendingAudit', tag: 'warning' },
  AUDITED: { zh: '已审核', key: 'status.shopOrder.audited', tag: 'success' },
  CONVERTED: { zh: '已转出库', key: 'status.shopOrder.converted', tag: 'primary' }
}

export const SHOP_AUTH_STATUS = {
  AUTHORIZED: { zh: '已授权', key: 'status.shop.authorized', tag: 'success' },
  EXPIRED: { zh: '已失效', key: 'status.shop.expired', tag: 'danger' }
}

export function statusText(map, code) {
  const m = map[code]
  return m ? tl(m.key, m.zh) : code
}

export function statusTag(map, code) {
  return map[code]?.tag || 'info'
}

export { maskAccount }
