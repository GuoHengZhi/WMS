/**
 * Mock API 封装（src/api/index.js）
 * - 所有查询返回 Promise，分页/筛选/排序真实生效（PRD G-06）
 * - 数据隔离（PRD G-07）：查询自动按当前登录用户"用户名"过滤；认领（无主货）除外
 * - 写操作直接修改 mock 数组（内存态），单号由 mock/code.js 生成（PRD 10.3）
 */
import { useUserStore } from '../store/user'
import { genCode } from '../mock/code'
import {
  inboundOrders, claims, outboundOrders, rebrandOrders, returnOrders,
  stockLedger, bills, bankAccounts, messages, shops, shopOrders, skuMappings,
  products, inventory, users, warehouses, FBA_WAREHOUSES, CARRIERS, nextId, T
} from '../mock/data'
import { nowStr } from '../utils/format'

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

/** 当前登录用户名（数据隔离键） */
function currentUser() {
  try {
    return useUserStore().username
  } catch (e) {
    return ''
  }
}

// ---------------- 通用查询工具 ----------------

/** 多值包含：关键字按英文逗号拆分，任一命中即通过（PRD 筛选"多个英文逗号隔开"） */
function containsAny(fieldVal, keyword) {
  if (!keyword) return true
  const kws = String(keyword).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (!kws.length) return true
  const v = String(fieldVal ?? '').toLowerCase()
  return kws.some((k) => v.includes(k))
}

/** 模糊包含 */
function fuzzy(fieldVal, keyword) {
  if (!keyword) return true
  return String(fieldVal ?? '').toLowerCase().includes(String(keyword).trim().toLowerCase())
}

/** 日期区间（yyyy-MM-dd 前缀比较，闭区间） */
function inDateRange(fieldVal, start, end) {
  const v = String(fieldVal ?? '')
  if (start && v.slice(0, 10) < start) return false
  if (end && v.slice(0, 10) > end) return false
  return true
}

/** 排序：{ prop, order: 'asc'|'desc' }，字符串/数字通用比较 */
function applySort(rows, sort) {
  if (!sort || !sort.prop || !sort.order) return rows
  const dir = sort.order === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const va = a[sort.prop] ?? ''
    const vb = b[sort.prop] ?? ''
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
    return String(va).localeCompare(String(vb), 'zh-CN') * dir
  })
}

/** 分页切片 */
function paginate(rows, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

/** 列表查询统一出口：过滤 → 排序 → 分页，返回 { rows, total } */
async function listQuery(rows, { page = 1, pageSize = 10, sort = null } = {}) {
  await delay()
  const sorted = applySort(rows, sort)
  return { rows: paginate(sorted, page, pageSize), total: sorted.length }
}

/** 查询参数解构简写 */
function q(params = {}) {
  return { form: params.form || {}, page: params.page || 1, pageSize: params.pageSize || 10, sort: params.sort || null }
}

// ---------------- 库存 ----------------

/** 可库库存 = 在库 - 预占（PRD 10.1） */
export function getAvailableStock(username, warehouse, sku) {
  const inv = inventory.find((i) => i.username === username && i.warehouse === warehouse && i.sku === sku)
  if (!inv) return 0
  return Math.max(0, (inv.onHand || 0) - (inv.reserved || 0))
}

/** 库存预占（创建出库/换标时占用） */
function reserveStock(username, warehouse, sku, qty) {
  const inv = inventory.find((i) => i.username === username && i.warehouse === warehouse && i.sku === sku)
  if (inv) inv.reserved = (inv.reserved || 0) + qty
}

/** 实时库存查询（库存查询页）：join 产品档案补充名称/分类/规格 */
export async function queryInventory(params = {}) {
  const { form } = q(params)
  const un = currentUser()
  let rows = inventory.filter((i) => !un || i.username === un)
  if (form.warehouse) rows = rows.filter((r) => r.warehouse === form.warehouse)
  if (form.skuOrFn) rows = rows.filter((r) => {
    const p = products.find((x) => x.sku === r.sku && x.username === r.username)
    return containsAny(r.sku, form.skuOrFn) || containsAny(p?.fnSku, form.skuOrFn)
  })
  if (form.productName) {
    rows = rows.filter((r) => {
      const p = products.find((x) => x.sku === r.sku && x.username === r.username)
      return fuzzy(p?.name, form.productName) || fuzzy(p?.nameEn, form.productName)
    })
  }
  const joined = rows.map((r) => {
    const p = products.find((x) => x.sku === r.sku && x.username === r.username) || {}
    return { ...r, name: p.name || '', nameEn: p.nameEn || '', category: p.category || '', spec: p.spec || '', available: (r.onHand || 0) - (r.reserved || 0) }
  })
  return listQuery(joined, params)
}

/** 库存流水查询（库存明细页） */
export async function queryStockLedger(params = {}) {
  const { form } = q(params)
  const un = currentUser()
  let rows = stockLedger.filter((r) => !un || r.username === un)
  if (form.warehouse) rows = rows.filter((r) => r.warehouse === form.warehouse)
  if (form.skuOrFn) rows = rows.filter((r) => {
    const p = products.find((x) => x.sku === r.sku && x.username === r.username)
    return containsAny(r.sku, form.skuOrFn) || containsAny(p?.fnSku, form.skuOrFn)
  })
  if (form.productName) rows = rows.filter((r) => fuzzy(r.name, form.productName) || fuzzy(r.nameEn, form.productName))
  if (form.startDate || form.endDate) rows = rows.filter((r) => inDateRange(r.createTime, form.startDate, form.endDate))
  return listQuery(rows, params)
}

// ---------------- 入库 ----------------

const INBOUND_MODE_STATUS = { pickup: 'PENDING_PICKUP', confirm: 'PENDING_CONFIRM' }

export async function queryInbound(params = {}) {
  const { form, mode } = { ...q(params), mode: params.mode || 'all' }
  const un = currentUser()
  let rows = inboundOrders.filter((r) => !un || r.username === un)
  if (INBOUND_MODE_STATUS[mode]) rows = rows.filter((r) => r.status === INBOUND_MODE_STATUS[mode])
  if (form.warehouse) rows = rows.filter((r) => r.warehouse === form.warehouse)
  if (form.username) rows = rows.filter((r) => fuzzy(r.username, form.username))
  if (form.codeOrTrack) rows = rows.filter((r) => containsAny(r.code, form.codeOrTrack) || containsAny(r.trackNo, form.codeOrTrack))
  if (form.shelfStatus === '上架') rows = rows.filter((r) => !!r.shelfTime)
  if (form.shelfStatus === '未上架') rows = rows.filter((r) => !r.shelfTime)
  if (form.startDate || form.endDate) rows = rows.filter((r) => inDateRange(r.createTime, form.startDate, form.endDate))
  if (form.status) rows = rows.filter((r) => r.status === form.status)
  return listQuery(rows, params)
}

/** 创建入库单（状态=待揽货） */
export async function createInbound(payload) {
  await delay(200)
  const order = {
    id: nextId('IB'),
    code: payload.code || genCode('RK'),
    username: payload.username,
    warehouse: payload.warehouse,
    trackNo: payload.trackNo || '',
    deliveryMethod: payload.deliveryMethod || '自发头程',
    serviceChannel: payload.serviceChannel,
    inboundType: payload.inboundType,
    arrivalMethod: payload.arrivalMethod,
    etaTime: payload.etaTime,
    boxType: payload.boxType || '拆单',
    status: 'PENDING_PICKUP',
    remark: payload.remark || '',
    createTime: nowStr(),
    pickupTime: '',
    shelfTime: '',
    items: payload.items.map((it) => ({ sku: it.sku, name: it.name, nameEn: it.nameEn, forecastQty: it.forecastQty }))
  }
  inboundOrders.unshift(order)
  return order
}

// ---------------- 认领 ----------------

export async function queryClaims(params = {}) {
  const { form } = q(params)
  // 无主货无归属用户，客户只可见"待认领"记录（PRD 6.3.5）
  let rows = claims.filter((r) => r.status === 'UNCLAIMED')
  if (form.warehouse) rows = rows.filter((r) => r.warehouse === form.warehouse)
  if (form.codeOrTrack) rows = rows.filter((r) => containsAny(r.code, form.codeOrTrack) || containsAny(r.trackNo, form.codeOrTrack))
  return listQuery(rows, params)
}

/** 认领：生成/关联本人入库单（状态=待确认），记录认领人与时间（PRD 6.3.5） */
export async function claimCargo(id) {
  await delay(200)
  const c = claims.find((x) => x.id === id)
  if (!c || c.status !== 'UNCLAIMED') throw new Error('该货物已被认领')
  const username = currentUser()
  c.status = 'CLAIMED'
  c.claimedBy = username
  c.claimTime = nowStr()
  const order = {
    id: nextId('IB'),
    code: c.code.startsWith('RK') && c.code.includes('WUZHU') ? genCode('RK') : c.code,
    username,
    warehouse: c.warehouse,
    trackNo: c.trackNo,
    deliveryMethod: c.deliveryMethod,
    serviceChannel: '普通入库',
    inboundType: '包裹',
    arrivalMethod: '快递',
    etaTime: nowStr(),
    boxType: '拆单',
    status: 'PENDING_CONFIRM',
    remark: `认领入库（原无主货：${c.remark || '无'}）`,
    createTime: c.createTime,
    pickupTime: nowStr(),
    shelfTime: '',
    items: []
  }
  inboundOrders.unshift(order)
  return order
}

// ---------------- 出库（一件代发） ----------------

const OUTBOUND_MODE_STATUS = { djh: 'PENDING_PICKING', dfh: 'PENDING_SHIP', yfh: 'SHIPPED' }

export async function queryOutbound(params = {}) {
  const { form, mode } = { ...q(params), mode: params.mode || 'all' }
  const un = currentUser()
  let rows = outboundOrders.filter((r) => !un || r.username === un)
  if (OUTBOUND_MODE_STATUS[mode]) rows = rows.filter((r) => r.status === OUTBOUND_MODE_STATUS[mode])
  if (form.warehouse) rows = rows.filter((r) => r.warehouse === form.warehouse)
  if (form.username) rows = rows.filter((r) => fuzzy(r.username, form.username))
  if (form.codeOrRef) rows = rows.filter((r) => containsAny(r.code, form.codeOrRef) || containsAny(r.refNo, form.codeOrRef))
  if (form.deliveryNo) rows = rows.filter((r) => containsAny(r.deliveryNo, form.deliveryNo))
  if (form.receiver) rows = rows.filter((r) => fuzzy(r.receiverName, form.receiver))
  if (form.shipStart || form.shipEnd) rows = rows.filter((r) => inDateRange(r.shipTime || '9999', form.shipStart, form.shipEnd))
  if (form.printStatus) rows = rows.filter((r) => r.printStatus === form.printStatus)
  if (form.carrier) rows = rows.filter((r) => r.carrier === form.carrier)
  if (form.status) rows = rows.filter((r) => r.status === form.status)
  return listQuery(rows, params)
}

/** 创建出库单：库存预占校验（防超卖，PRD 6.4.1），状态=待下架，分配发货单号 */
export async function createOutbound(payload) {
  await delay(200)
  // 提交时重新校验可用库存
  for (const it of payload.items) {
    const avail = getAvailableStock(payload.username, payload.warehouse, it.sku)
    if (it.qty > avail) throw new Error(`Sku ${it.sku} 可库库存不足（可用 ${avail}，需 ${it.qty}）`)
  }
  payload.items.forEach((it) => reserveStock(payload.username, payload.warehouse, it.sku, it.qty))
  const order = {
    id: nextId('OB'),
    code: payload.code || genCode('CK'),
    username: payload.username,
    warehouse: payload.warehouse,
    country: payload.country,
    refNo: payload.refNo || '',
    receiverName: payload.receiverName,
    receiverPhone: payload.receiverPhone,
    receiverAddr: payload.receiverAddr,
    channel: '',
    carrier: '',
    deliveryNo: genCode('FH'),
    carrierNo: '',
    printStatus: 'UNPRINTED',
    status: 'PENDING_PICKING',
    createTime: nowStr(),
    shipTime: '',
    remark: payload.remark || '',
    items: payload.items.map((it) => ({ sku: it.sku, name: it.name, nameEn: it.nameEn, qty: it.qty }))
  }
  outboundOrders.unshift(order)
  return order
}

/** 批量打印面单：打印状态 → 已打印（PRD 6.4.3） */
export async function printOutbound(ids) {
  await delay(300)
  let n = 0
  outboundOrders.forEach((o) => {
    if (ids.includes(o.id) && o.printStatus === 'UNPRINTED') {
      o.printStatus = 'PRINTED'
      n += 1
    }
  })
  return n
}

// ---------------- 换标 ----------------

const REBRAND_MODE_STATUS = { djh: 'PENDING_PICK', dtb: 'PENDING_LABEL', dfh: 'PENDING_DISPATCH', yfh: 'DISPATCHED' }

export async function queryRebrand(params = {}) {
  const { form, mode } = { ...q(params), mode: params.mode || 'all' }
  const un = currentUser()
  let rows = rebrandOrders.filter((r) => !un || r.username === un)
  if (REBRAND_MODE_STATUS[mode]) rows = rows.filter((r) => r.status === REBRAND_MODE_STATUS[mode])
  if (form.username) rows = rows.filter((r) => fuzzy(r.username, form.username))
  if (form.codeOrTrack) rows = rows.filter((r) => containsAny(r.code, form.codeOrTrack) || containsAny(r.refNo, form.codeOrTrack))
  return listQuery(rows, params)
}

/** 创建换标单：FnSku 校验 + 库存预占，状态=待拣货 */
export async function createRebrand(payload) {
  await delay(200)
  for (const it of payload.items) {
    if (!it.newFnSku) throw new Error(`Sku ${it.sku} 新FnSku 必填`)
    if (it.newFnSku === it.fnSku) throw new Error(`Sku ${it.sku} 新FnSku 不能与旧 FnSku 相同`)
    const avail = getAvailableStock(payload.username, payload.shipWarehouse, it.sku)
    if (it.qty > avail) throw new Error(`Sku ${it.sku} 可库库存不足（可用 ${avail}，需 ${it.qty}）`)
  }
  payload.items.forEach((it) => reserveStock(payload.username, payload.shipWarehouse, it.sku, it.qty))
  const order = {
    id: nextId('RB'),
    code: payload.code || genCode('HB'),
    username: payload.username,
    fbaWarehouse: payload.fbaWarehouse,
    shipWarehouse: payload.shipWarehouse,
    deliveryChannel: payload.deliveryChannel,
    isFlag: payload.isFlag || '否',
    refNo: payload.refNo || '',
    fbaAddress: payload.fbaAddress,
    shipmentId: payload.shipmentId,
    amazonNo: payload.amazonNo || '',
    attachment: payload.attachment || '',
    status: 'PENDING_PICK',
    remark: payload.remark || '',
    createTime: nowStr(),
    shipTime: '',
    items: payload.items.map((it) => ({ sku: it.sku, name: it.name, nameEn: it.nameEn, fnSku: it.fnSku, newFnSku: it.newFnSku, qty: it.qty }))
  }
  rebrandOrders.unshift(order)
  return order
}

// ---------------- 退货 ----------------

const RETURN_MODE_STATUS = { dlh: 'PENDING_RECEIVE', dsj: 'PENDING_SHELF', dcl: 'PENDING_PROCESS', dwc: 'PENDING_FINISH', ywc: 'COMPLETED' }

export async function queryReturn(params = {}) {
  const { form, mode } = { ...q(params), mode: params.mode || 'all' }
  const un = currentUser()
  let rows = returnOrders.filter((r) => !un || r.username === un)
  if (RETURN_MODE_STATUS[mode]) rows = rows.filter((r) => r.status === RETURN_MODE_STATUS[mode])
  if (form.username) rows = rows.filter((r) => fuzzy(r.username, form.username))
  if (form.codeOrTrack) rows = rows.filter((r) => containsAny(r.code, form.codeOrTrack) || containsAny(r.trackNo, form.codeOrTrack) || containsAny(r.inboundCode, form.codeOrTrack))
  if (form.finishStart || form.finishEnd) rows = rows.filter((r) => inDateRange(r.finishTime || '9999', form.finishStart, form.finishEnd))
  return listQuery(rows, params)
}

/** 创建退货预报，状态=退货待揽收 */
export async function createReturn(payload) {
  await delay(200)
  const order = {
    id: nextId('RT'),
    code: payload.code || genCode('TH'),
    username: payload.username,
    warehouse: payload.warehouse,
    inboundCode: '',
    trackNo: payload.trackNo || '',
    refNo: payload.refNo || '',
    type: payload.type,
    serviceChannel: payload.serviceChannel,
    inboundType: payload.inboundType,
    departureTime: payload.departureTime || '',
    arrivalTime: payload.arrivalTime || '',
    etaTime: payload.etaTime,
    status: 'PENDING_RECEIVE',
    finishTime: '',
    remark: payload.remark || '',
    items: payload.items.map((it) => ({ sku: it.sku, name: it.name, nameEn: it.nameEn, forecastQty: it.forecastQty }))
  }
  returnOrders.unshift(order)
  return order
}

// ---------------- 我的店铺 ----------------

export async function queryShopOrders(params = {}) {
  const { form } = q(params)
  const un = currentUser()
  let rows = shopOrders.filter((r) => !un || r.username === un)
  if (form.shopId) rows = rows.filter((r) => r.shopId === form.shopId)
  if (form.orderStatus) rows = rows.filter((r) => r.orderStatus === form.orderStatus)
  if (form.keyword) rows = rows.filter((r) => containsAny(r.orderNo, form.keyword) || containsAny(r.platformOrderNo, form.keyword))
  return listQuery(rows, params)
}

/** 同步订单（mock）：按授权店铺批量拉取，按平台单号幂等去重 */
export async function syncShopOrders() {
  await delay(600)
  const un = currentUser()
  const myShops = shops.filter((s) => s.username === un && s.authStatus === 'AUTHORIZED')
  let added = 0
  myShops.forEach((s, idx) => {
    const platformOrderNo = `SYNC-${Date.now()}-${idx}`
    if (shopOrders.some((o) => o.platformOrderNo === platformOrderNo)) return
    shopOrders.unshift({
      id: nextId('SO'), username: un, shopId: s.id, shopName: s.name,
      orderNo: genCode('DD'), platformOrderNo,
      createTime: nowStr(),
      items: [{ platformSku: `AMZ-KR-EYESHADOW-0${(idx % 9) + 1}`, qty: 1 }],
      amount: 118.0, mapStatus: 'UNMAPPED', orderStatus: 'PENDING_AUDIT'
    })
    added += 1
  })
  return { added, shops: myShops.length }
}

/** 重新执行映射：按 店铺+平台Sku 查映射，成功置 MAPPED */
export async function reMapShopOrders(rows) {
  await delay(300)
  let ok = 0
  const miss = []
  rows.forEach((row) => {
    const hit = row.items.every((it) => skuMappings.some((m) => m.shopId === row.shopId && m.platformSku === it.platformSku && m.status === 'ENABLED'))
    if (hit) {
      row.mapStatus = 'MAPPED'
      ok += 1
    } else {
      miss.push(row.orderNo)
    }
  })
  return { ok, miss }
}

/** 审核店铺订单：未映射拦截；通过后自动生成一件代发出库单（状态=待下架） */
export async function auditShopOrders(rows) {
  await delay(300)
  const un = currentUser()
  const notMapped = rows.filter((r) => r.mapStatus !== 'MAPPED')
  if (notMapped.length) throw new Error(`订单 ${notMapped.map((r) => r.orderNo).join('、')} 未完成 SKU 映射，无法审核`)
  rows.forEach((row) => {
    if (row.orderStatus !== 'PENDING_AUDIT') return
    row.orderStatus = 'AUDITED'
    // 映射后的系统 Sku 组合生成出库明细
    const items = []
    row.items.forEach((it) => {
      skuMappings.filter((m) => m.shopId === row.shopId && m.platformSku === it.platformSku && m.status === 'ENABLED')
        .forEach((m) => items.push({ sku: m.systemSku, name: (products.find((p) => p.sku === m.systemSku) || {}).name || m.systemSku, nameEn: '', qty: m.qty * it.qty }))
    })
    outboundOrders.unshift({
      id: nextId('OB'), code: genCode('CK'), username: un, warehouse: warehouses[0].name, country: '韩国',
      refNo: row.orderNo, receiverName: '平台收件人', receiverPhone: '010-0000-0000', receiverAddr: '서울특별시 중구',
      channel: '', carrier: '', deliveryNo: genCode('FH'), carrierNo: '', printStatus: 'UNPRINTED',
      status: 'PENDING_PICKING', createTime: nowStr(), shipTime: '', remark: `店铺订单 ${row.orderNo} 审核转入`,
      items
    })
    row.orderStatus = 'CONVERTED'
  })
  return true
}

export async function queryShops(params = {}) {
  const { form } = q(params)
  const un = currentUser()
  let rows = shops.filter((r) => !un || r.username === un)
  if (form.name) rows = rows.filter((r) => fuzzy(r.name, form.name) || fuzzy(r.nameEn, form.name))
  return listQuery(rows, params)
}

/** 新增/编辑店铺（同用户下店铺名称唯一） */
export async function saveShop(payload) {
  await delay(200)
  const dup = shops.find((s) => s.username === currentUser() && s.name === payload.name && s.id !== payload.id)
  if (dup) throw new Error('店铺名称已存在（同用户下唯一）')
  if (payload.id) {
    Object.assign(shops.find((s) => s.id === payload.id), payload)
  } else {
    shops.unshift({ id: nextId('SH'), username: currentUser(), authStatus: 'AUTHORIZED', ...payload })
  }
  return true
}

/** 删除店铺：存在未审核订单时拦截 */
export async function deleteShop(id) {
  await delay(200)
  const has = shopOrders.some((o) => o.shopId === id && o.orderStatus === 'PENDING_AUDIT')
  if (has) throw new Error('该店铺存在未审核订单，不可删除')
  const idx = shops.findIndex((s) => s.id === id)
  if (idx > -1) shops.splice(idx, 1)
  return true
}

// ---------------- SKU 映射 ----------------

export async function querySkuMappings(params = {}) {
  const { form } = q(params)
  const un = currentUser()
  let rows = skuMappings.filter((r) => !un || r.username === un)
  if (form.username) rows = rows.filter((r) => fuzzy(r.username, form.username))
  if (form.shopName) rows = rows.filter((r) => fuzzy(r.shopName, form.shopName))
  if (form.sku) rows = rows.filter((r) => containsAny(r.platformSku, form.sku) || containsAny(r.systemSku, form.sku))
  if (form.status) rows = rows.filter((r) => r.status === form.status)
  return listQuery(rows, params)
}

/** 新增/编辑映射：同店铺+平台Sku 唯一；系统 Sku 必须为本人已审核产品 */
export async function saveSkuMapping(payload) {
  await delay(200)
  const un = currentUser()
  const dup = skuMappings.find((m) => m.username === un && m.shopId === payload.shopId && m.platformSku === payload.platformSku && m.id !== payload.id)
  if (dup) throw new Error('同一店铺 + 平台产品Sku 已存在映射')
  if (payload.systemSku) {
    const p = products.find((x) => x.username === un && x.sku === payload.systemSku)
    if (!p) throw new Error(`系统 Sku ${payload.systemSku} 在产品管理中不存在`)
    if (!p.enabled) throw new Error(`系统 Sku ${payload.systemSku} 已禁用，不可用于映射`)
  }
  if (payload.id) {
    Object.assign(skuMappings.find((m) => m.id === payload.id), payload)
  } else {
    skuMappings.unshift({ id: nextId('SM'), username: un, createTime: nowStr(), ...payload })
  }
  return true
}

export async function deleteSkuMappings(ids) {
  await delay(200)
  for (const id of ids) {
    const idx = skuMappings.findIndex((m) => m.id === id)
    if (idx > -1) skuMappings.splice(idx, 1)
  }
  return true
}

// ---------------- 产品 ----------------

export async function queryProducts(params = {}) {
  const { form } = q(params)
  const un = currentUser()
  let rows = products.filter((r) => !un || r.username === un)
  if (form.username) rows = rows.filter((r) => fuzzy(r.username, form.username))
  if (form.skuOrFn) rows = rows.filter((r) => containsAny(r.sku, form.skuOrFn) || containsAny(r.fnSku, form.skuOrFn))
  if (form.productName) rows = rows.filter((r) => fuzzy(r.name, form.productName) || fuzzy(r.nameEn, form.productName))
  if (form.enabled === '1') rows = rows.filter((r) => r.enabled)
  if (form.enabled === '0') rows = rows.filter((r) => !r.enabled)
  if (form.audit) rows = rows.filter((r) => r.audit === form.audit)
  return listQuery(rows, params)
}

/** 新增/编辑产品（新增默认待审核；Sku 用户内唯一） */
export async function saveProduct(payload) {
  await delay(200)
  const un = currentUser()
  const dup = products.find((p) => p.username === un && p.sku === payload.sku && p.id !== payload.id)
  if (dup) throw new Error(`Sku ${payload.sku} 已存在（用户内唯一）`)
  if (payload.id) {
    Object.assign(products.find((p) => p.id === payload.id), payload)
  } else {
    products.unshift({ id: nextId('P'), username: un, audit: 'PENDING', enabled: true, ...payload })
  }
  return true
}

/** 启用/禁用 */
export async function toggleProduct(id, enabled) {
  await delay(150)
  const p = products.find((x) => x.id === id)
  if (p) p.enabled = enabled
  return true
}

/** 批量审核（通过/驳回，驳回必填原因） */
export async function auditProducts(ids, result, reason = '') {
  await delay(200)
  if (result === 'REJECTED' && !reason) throw new Error('驳回必须填写原因')
  products.forEach((p) => {
    if (ids.includes(p.id)) p.audit = result
  })
  return true
}

// ---------------- 财务 ----------------

export async function queryBills(params = {}) {
  const { form } = q(params)
  const un = currentUser()
  let rows = bills.filter((r) => !un || r.username === un)
  if (form.relCode) rows = rows.filter((r) => containsAny(r.relCode, form.relCode))
  return listQuery(rows, params)
}

/** 批量支付（仅待支付生效） */
export async function payBills(ids) {
  await delay(300)
  let n = 0
  bills.forEach((b) => {
    if (ids.includes(b.id) && b.status === 'PENDING') {
      b.status = 'PAID'
      n += 1
    }
  })
  return n
}

export async function getBankAccount(username) {
  await delay(150)
  return bankAccounts.find((b) => b.username === username) || null
}

/** 保存银行账户（每客户单条记录） */
export async function saveBankAccount(payload) {
  await delay(200)
  const exist = bankAccounts.find((b) => b.username === payload.username)
  if (exist) {
    Object.assign(exist, payload)
  } else {
    bankAccounts.push({ id: nextId('BA'), ...payload })
  }
  return true
}

// ---------------- 消息中心 ----------------

export async function queryMessages() {
  await delay(100)
  const un = currentUser()
  return messages.filter((m) => m.username === un).sort((a, b) => (a.time < b.time ? 1 : -1))
}

export function unreadCount(list) {
  return list.filter((m) => !m.read).length
}

export async function markAllMessagesRead() {
  const un = currentUser()
  messages.forEach((m) => {
    if (m.username === un) m.read = true
  })
  return true
}

// ---------------- 字典（下拉数据源） ----------------

export function dict() {
  return { warehouses, fbaWarehouses: FBA_WAREHOUSES, carriers: CARRIERS, users, channels: ['CJ物流', '韩通国际', '顺丰国际'] }
}