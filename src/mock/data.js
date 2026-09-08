/**
 * Mock 基础与业务数据（参考 PRD 附录 A 实测样例）
 * 仓库：威汇赢韩国仓；账号：SHEN（主）/ VIP0157（演示数据隔离）
 */

export const WAREHOUSE = '威汇赢韩国仓'
export const FBA_WAREHOUSES = ['FBA首尔仓', 'FBA釜山仓']
export const SERVICE_CHANNELS = ['普通入库', '加急入库']
export const INBOUND_TYPES = ['整托', '整箱', '包裹']
export const ARRIVAL_METHODS = ['快递', '卡车', '自送']
export const DELIVERY_METHODS = ['自发头程', '中转代发']
export const CATEGORIES = ['化妆品', '电子产品', '保健用品', '其他品类']
export const COUNTRIES = ['韩国', '美国', '日本', '德国']
export const CARRIERS = ['CJ物流', '韩通国际', '顺丰国际']
export const RETURN_TYPES = ['退货换标', '退货重新上架', '销毁', '退回卖家']
export const GOODS_CONDITIONS = ['可售', '不可售']

const p = (n) => String(n).padStart(2, '0')
export const T = (y, mo, d, h = 9, mi = 0, s = 0) => `${y}-${p(mo)}-${p(d)} ${p(h)}:${p(mi)}:${p(s)}`

export const users = [
  { username: 'SHEN', name: 'SHEN（演示主账号）', role: '客户/卖家' },
  { username: 'VIP0157', name: 'VIP0157', role: '客户/卖家' }
]

export const warehouses = [
  { id: 'WH001', name: WAREHOUSE, country: '韩国', address: '韩国京畿道光明市 일직동 627-3', status: '启用' }
]

export const products = [
  { id: 'P001', username: 'SHEN', sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', category: '化妆品', length: 12, width: 8, height: 2, weight: 0.15, spec: '1', fnSku: 'X001A2B3C4D', enabled: true, audit: 'AUDITED' },
  { id: 'P002', username: 'SHEN', sku: 'S0002', name: '蓝牙耳机', nameEn: '블루투스 이어폰', category: '电子产品', length: 10, width: 10, height: 4, weight: 0.2, spec: '1', fnSku: 'X001B2C3D4E', enabled: true, audit: 'AUDITED' },
  { id: 'P003', username: 'SHEN', sku: 'S0003', name: '维生素C', nameEn: '비타민C', category: '保健用品', length: 8, width: 8, height: 12, weight: 0.3, spec: '1', fnSku: 'X001C3D4E5F', enabled: true, audit: 'AUDITED' },
  { id: 'P004', username: 'SHEN', sku: 'S0004', name: '手机壳', nameEn: '폰케이스', category: '电子产品', length: 16, width: 8, height: 2, weight: 0.08, spec: '1', fnSku: 'X001D4E5F6G', enabled: true, audit: 'AUDITED' },
  { id: 'P005', username: 'SHEN', sku: 'S0005', name: '面膜', nameEn: '마스크팩', category: '化妆品', length: 15, width: 10, height: 8, weight: 0.4, spec: '1', fnSku: 'X001E5F6G7H', enabled: true, audit: 'PENDING' },
  { id: 'P006', username: 'SHEN', sku: 'S0006', name: '保温杯', nameEn: '보온컵', category: '其他品类', length: 8, width: 8, height: 22, weight: 0.35, spec: '1', fnSku: 'X001F6G7H8I', enabled: true, audit: 'AUDITED' },
  { id: 'P007', username: 'SHEN', sku: 'S0007', name: '眼影盘', nameEn: '팔레트/02', category: '化妆品', length: 1, width: 1, height: 1, weight: 1, spec: '1', fnSku: 'X001G7H8I9J', enabled: true, audit: 'AUDITED' },
  { id: 'P008', username: 'SHEN', sku: 'S0008', name: '化妆刷', nameEn: '메이크업 브러시', category: '化妆品', length: 20, width: 5, height: 3, weight: 0.12, spec: '1', fnSku: 'X001H8I9J0K', enabled: true, audit: 'AUDITED' },
  { id: 'P009', username: 'SHEN', sku: 'S0009', name: '充电线', nameEn: '충전 케이블', category: '电子产品', length: 12, width: 6, height: 2, weight: 0.1, spec: '1', fnSku: 'X001I9J0K1L', enabled: true, audit: 'AUDITED' },
  { id: 'P010', username: 'SHEN', sku: 'S0010', name: '护手霜', nameEn: '핸드크림', category: '化妆品', length: 4, width: 4, height: 12, weight: 0.08, spec: '1', fnSku: 'X001J0K1L2M', enabled: true, audit: 'AUDITED' },
  { id: 'P011', username: 'SHEN', sku: 'S0011', name: '益生菌', nameEn: '프로바이오틱스', category: '保健用品', length: 6, width: 6, height: 10, weight: 0.25, spec: '1', fnSku: 'X001K1L2M3N', enabled: true, audit: 'REJECTED' },
  { id: 'P012', username: 'SHEN', sku: 'S0012', name: '发夹', nameEn: '머리핀', category: '其他品类', length: 10, width: 6, height: 2, weight: 0.05, spec: '1', fnSku: 'X001L2M3N4O', enabled: false, audit: 'AUDITED' },
  { id: 'P101', username: 'VIP0157', sku: 'S1001', name: '口罩', nameEn: '마스크', category: '化妆品', length: 15, width: 10, height: 8, weight: 0.3, spec: '1', fnSku: 'X101M3N4O5P', enabled: true, audit: 'AUDITED' },
  { id: 'P102', username: 'VIP0157', sku: 'S1002', name: '手机支架', nameEn: '폰스탠드', category: '电子产品', length: 10, width: 8, height: 8, weight: 0.18, spec: '1', fnSku: 'X101N4O5P6Q', enabled: true, audit: 'AUDITED' }
]

/** 实时库存：可用库存 = 在库 - 预占（PRD 10.1 Inventory） */
export const inventory = [
  { id: 'INV001', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0001', onHand: 420, reserved: 20 },
  { id: 'INV002', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0002', onHand: 350, reserved: 15 },
  { id: 'INV003', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0003', onHand: 260, reserved: 0 },
  { id: 'INV004', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0004', onHand: 800, reserved: 60 },
  { id: 'INV005', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0005', onHand: 180, reserved: 10 },
  { id: 'INV006', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0006', onHand: 90, reserved: 5 },
  { id: 'INV007', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0007', onHand: 520, reserved: 40 },
  { id: 'INV008', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0008', onHand: 300, reserved: 0 },
  { id: 'INV009', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0009', onHand: 640, reserved: 30 },
  { id: 'INV010', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0010', onHand: 150, reserved: 8 },
  { id: 'INV011', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0011', onHand: 75, reserved: 0 },
  { id: 'INV012', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0012', onHand: 44, reserved: 0 },
  { id: 'INV101', warehouse: WAREHOUSE, username: 'VIP0157', sku: 'S1001', onHand: 200, reserved: 0 },
  { id: 'INV102', warehouse: WAREHOUSE, username: 'VIP0157', sku: 'S1002', onHand: 120, reserved: 10 }
]

export const shops = [
  { id: 'SH01', username: 'SHEN', name: '亚马逊韩国站-官方旗舰店', nameEn: 'Amazon KR Flagship Store', platform: 'Amazon', authStatus: 'AUTHORIZED', sort: 1, remark: '主力店铺' },
  { id: 'SH02', username: 'SHEN', name: '亚马逊美国站-精品店', nameEn: 'Amazon US Boutique Store', platform: 'Amazon', authStatus: 'AUTHORIZED', sort: 2, remark: '' },
  { id: 'SH03', username: 'SHEN', name: 'Coupang火箭店', nameEn: 'Coupang Rocket Store', platform: 'Coupang', authStatus: 'AUTHORIZED', sort: 3, remark: '韩国本土平台' },
  { id: 'SH04', username: 'SHEN', name: '亚马逊日本站-新店', nameEn: 'Amazon JP New Store', platform: 'Amazon', authStatus: 'EXPIRED', sort: 4, remark: 'Token 已失效，需重新授权' },
  { id: 'SH11', username: 'VIP0157', name: 'Coupang代发店', nameEn: 'Coupang Dropship Store', platform: 'Coupang', authStatus: 'AUTHORIZED', sort: 1, remark: '' }
]

/** 平台订单商品行：平台产品Sku x 数量 */
const soi = (platformSku, qty) => ({ platformSku, qty })

export const shopOrders = [
  { id: 'SO01', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', orderNo: 'DD20260901-001', platformOrderNo: '111-2233445-1234567', createTime: T(2026, 9, 1, 10, 12, 33), items: [soi('AMZ-KR-EYESHADOW-02', 2)], amount: 236.0, mapStatus: 'MAPPED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO02', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', orderNo: 'DD20260901-002', platformOrderNo: '111-8877665-7654321', createTime: T(2026, 9, 1, 14, 30, 8), items: [soi('AMZ-KR-CUSHION-01', 1)], amount: 89.0, mapStatus: 'UNMAPPED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO03', username: 'SHEN', shopId: 'SH02', shopName: '亚马逊美国站-精品店', orderNo: 'DD20260902-001', platformOrderNo: '112-3344556-2233445', createTime: T(2026, 9, 2, 9, 5, 41), items: [soi('AMZ-US-CUP-01', 3)], amount: 267.0, mapStatus: 'MAPPED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO04', username: 'SHEN', shopId: 'SH03', shopName: 'Coupang火箭店', orderNo: 'DD20260902-002', platformOrderNo: 'CP-20260902-88123', createTime: T(2026, 9, 2, 16, 22, 17), items: [soi('CP-CABLE-C2L', 5)], amount: 125.0, mapStatus: 'MAPPED', orderStatus: 'AUDITED' },
  { id: 'SO05', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', orderNo: 'DD20260903-001', platformOrderNo: '111-5566778-3241556', createTime: T(2026, 9, 3, 11, 40, 52), items: [soi('AMZ-KR-BRUSH-SET', 2)], amount: 158.0, mapStatus: 'MAPPED', orderStatus: 'CONVERTED' },
  { id: 'SO06', username: 'SHEN', shopId: 'SH02', shopName: '亚马逊美国站-精品店', orderNo: 'DD20260903-002', platformOrderNo: '112-9988776-5544332', createTime: T(2026, 9, 3, 15, 8, 26), items: [soi('AMZ-US-MASK-3D', 10)], amount: 320.0, mapStatus: 'FAILED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO07', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', orderNo: 'DD20260904-001', platformOrderNo: '111-6677889-4455667', createTime: T(2026, 9, 4, 10, 18, 5), items: [soi('AMZ-KR-EYESHADOW-02', 1), soi('AMZ-KR-BRUSH-SET', 1)], amount: 197.0, mapStatus: 'MAPPED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO08', username: 'SHEN', shopId: 'SH03', shopName: 'Coupang火箭店', orderNo: 'DD20260905-001', platformOrderNo: 'CP-20260905-88234', createTime: T(2026, 9, 5, 13, 27, 44), items: [soi('CP-CUSHION-01', 2)], amount: 178.0, mapStatus: 'UNMAPPED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO09', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', orderNo: 'DD20260906-001', platformOrderNo: '111-7788990-1234987', createTime: T(2026, 9, 6, 9, 51, 12), items: [soi('AMZ-KR-CREAM-01', 4)], amount: 212.0, mapStatus: 'MAPPED', orderStatus: 'CONVERTED' },
  { id: 'SO10', username: 'SHEN', shopId: 'SH02', shopName: '亚马逊美国站-精品店', orderNo: 'DD20260907-001', platformOrderNo: '112-1122334-9876543', createTime: T(2026, 9, 7, 14, 36, 58), items: [soi('AMZ-US-VITA-C', 6)], amount: 354.0, mapStatus: 'MAPPED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO11', username: 'SHEN', shopId: 'SH04', shopName: '亚马逊日本站-新店', orderNo: 'DD20260908-001', platformOrderNo: '113-2233445-1234876', createTime: T(2026, 9, 8, 9, 15, 21), items: [soi('AMZ-JP-CUP-02', 1)], amount: 89.0, mapStatus: 'UNMAPPED', orderStatus: 'PENDING_AUDIT' },
  { id: 'SO12', username: 'VIP0157', shopId: 'SH11', shopName: 'Coupang代发店', orderNo: 'DD20260908-002', platformOrderNo: 'CP-20260908-88345', createTime: T(2026, 9, 8, 10, 2, 39), items: [soi('CP-MASK-KF94', 20)], amount: 400.0, mapStatus: 'MAPPED', orderStatus: 'PENDING_AUDIT' }
]

export const skuMappings = [
  { id: 'SM01', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', platformSku: 'AMZ-KR-EYESHADOW-02', systemSku: 'S0007', qty: 1, status: 'ENABLED', createTime: T(2026, 8, 20, 10, 0, 0) },
  { id: 'SM02', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', platformSku: 'AMZ-KR-BRUSH-SET', systemSku: 'S0008', qty: 1, status: 'ENABLED', createTime: T(2026, 8, 20, 10, 5, 0) },
  { id: 'SM03', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', platformSku: 'AMZ-KR-CREAM-01', systemSku: 'S0010', qty: 1, status: 'ENABLED', createTime: T(2026, 8, 21, 9, 30, 0) },
  { id: 'SM04', username: 'SHEN', shopId: 'SH02', shopName: '亚马逊美国站-精品店', platformSku: 'AMZ-US-CUP-01', systemSku: 'S0006', qty: 1, status: 'ENABLED', createTime: T(2026, 8, 22, 14, 12, 0) },
  { id: 'SM05', username: 'SHEN', shopId: 'SH02', shopName: '亚马逊美国站-精品店', platformSku: 'AMZ-US-VITA-C', systemSku: 'S0003', qty: 1, status: 'ENABLED', createTime: T(2026, 8, 23, 11, 45, 0) },
  { id: 'SM06', username: 'SHEN', shopId: 'SH03', shopName: 'Coupang火箭店', platformSku: 'CP-CABLE-C2L', systemSku: 'S0009', qty: 1, status: 'ENABLED', createTime: T(2026, 8, 25, 16, 8, 0) },
  { id: 'SM07', username: 'SHEN', shopId: 'SH03', shopName: 'Coupang火箭店', platformSku: 'CP-CUSHION-01', systemSku: 'S0001', qty: 2, status: 'ENABLED', createTime: T(2026, 8, 28, 10, 20, 0) },
  { id: 'SM08', username: 'SHEN', shopId: 'SH02', shopName: '亚马逊美国站-精品店', platformSku: 'AMZ-US-MASK-3D', systemSku: '', qty: 1, status: 'DISABLED', createTime: T(2026, 9, 1, 9, 55, 0) },
  { id: 'SM09', username: 'SHEN', shopId: 'SH01', shopName: '亚马逊韩国站-官方旗舰店', platformSku: 'AMZ-KR-CUSHION-01', systemSku: 'S0002', qty: 1, status: 'DISABLED', createTime: T(2026, 9, 2, 15, 40, 0) },
  { id: 'SM10', username: 'VIP0157', shopId: 'SH11', shopName: 'Coupang代发店', platformSku: 'CP-MASK-KF94', systemSku: 'S1001', qty: 1, status: 'ENABLED', createTime: T(2026, 8, 30, 13, 10, 0) }
]


// ==================== 业务单据数据（续建扩展） ====================
// 状态码与 utils/status.js 中各状态机映射一一对应（PRD 第 11 章）
// 单号规则（PRD 10.3）：入库 RK / 出库 CK / 换标 HB / 退货 TH / 账单 ZD + yyyyMMddHHmmss + 3位流水

/** 打印状态映射（出库面单，PRD 6.4.3） */
export const PRINT_STATUS = {
  PRINTED: { zh: '已打印', tag: 'success' },
  UNPRINTED: { zh: '未打印', tag: 'info' }
}

/** 库存变动类型（PRD 6.7.1 枚举全集） */
export const LEDGER_TYPES = [
  '入库上架', '一件代发出库', '换标出库', '换标回库', '退货上架', '盘点调整', '库存调整', '库存移位', '认领入库'
]

/** 入库单（ASN）：时间复合列使用 createTime/pickupTime/shelfTime 三时间戳 */
export const inboundOrders = [
  {
    id: 'IB01', code: 'RK20260827090817482', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'SF1368247901', deliveryMethod: '自发头程', serviceChannel: '普通入库',
    inboundType: '整箱', arrivalMethod: '快递', etaTime: T(2026, 8, 27, 9, 0, 0), boxType: '拆单',
    status: 'COMPLETED', remark: '韩国仓常规补货',
    createTime: T(2026, 8, 27, 9, 8, 50), pickupTime: T(2026, 8, 27, 9, 9, 53), shelfTime: T(2026, 8, 27, 9, 10, 2),
    items: [{ sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', forecastQty: 200 }]
  },
  {
    id: 'IB02', code: 'RK20260827090817831', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'CJ8812345678', deliveryMethod: '中转代发', serviceChannel: '普通入库',
    inboundType: '整托', arrivalMethod: '卡车', etaTime: T(2026, 8, 28, 14, 0, 0), boxType: '整单',
    status: 'COMPLETED', remark: '',
    createTime: T(2026, 8, 27, 10, 15, 12), pickupTime: T(2026, 8, 28, 10, 2, 40), shelfTime: T(2026, 8, 28, 14, 33, 8),
    items: [{ sku: 'S0004', name: '手机壳', nameEn: '폰케이스', forecastQty: 500 }]
  },
  {
    id: 'IB03', code: 'RK20260901093012205', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'SF1368250033', deliveryMethod: '自发头程', serviceChannel: '加急入库',
    inboundType: '包裹', arrivalMethod: '快递', etaTime: T(2026, 9, 1, 18, 0, 0), boxType: '拆单',
    status: 'COMPLETED', remark: '加急',
    createTime: T(2026, 9, 1, 9, 30, 12), pickupTime: T(2026, 9, 1, 15, 20, 5), shelfTime: T(2026, 9, 1, 16, 45, 31),
    items: [{ sku: 'S0002', name: '蓝牙耳机', nameEn: '블루투스 이어폰', forecastQty: 150 }]
  },
  {
    id: 'IB04', code: 'RK20260905140233417', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'CJ9955667788', deliveryMethod: '中转代发', serviceChannel: '普通入库',
    inboundType: '整箱', arrivalMethod: '卡车', etaTime: T(2026, 9, 7, 10, 0, 0), boxType: '拆单',
    status: 'SHELVING', remark: '大包装箱货',
    createTime: T(2026, 9, 5, 14, 2, 33), pickupTime: T(2026, 9, 6, 9, 40, 18), shelfTime: '',
    items: [{ sku: 'S0007', name: '眼影盘', nameEn: '팔레트/02', forecastQty: 300 }]
  },
  {
    id: 'IB05', code: 'RK20260907095840126', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'SF1368266612', deliveryMethod: '自发头程', serviceChannel: '普通入库',
    inboundType: '整箱', arrivalMethod: '自送', etaTime: T(2026, 9, 9, 9, 0, 0), boxType: '拆单',
    status: 'PENDING_CONFIRM', remark: '司机自送，到仓后电话联系',
    createTime: T(2026, 9, 7, 9, 58, 40), pickupTime: T(2026, 9, 8, 10, 12, 22), shelfTime: '',
    items: [{ sku: 'S0010', name: '护手霜', nameEn: '핸드크림', forecastQty: 120 }]
  },
  {
    id: 'IB06', code: 'RK20260908102932307', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'SF1368277788', deliveryMethod: '自发头程', serviceChannel: '普通入库',
    inboundType: '包裹', arrivalMethod: '快递', etaTime: T(2026, 9, 10, 12, 0, 0), boxType: '拆单',
    status: 'PENDING_PICKUP', remark: '',
    createTime: T(2026, 9, 8, 10, 29, 32), pickupTime: '', shelfTime: '',
    items: [{ sku: 'S0008', name: '化妆刷', nameEn: '메이크업 브러시', forecastQty: 80 }]
  },
  {
    id: 'IB07', code: 'RK20260908140552913', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'CJ7788990011', deliveryMethod: '中转代发', serviceChannel: '普通入库',
    inboundType: '整箱', arrivalMethod: '快递', etaTime: T(2026, 9, 11, 15, 0, 0), boxType: '整单',
    status: 'PENDING_PICKUP', remark: '预报 3 箱',
    createTime: T(2026, 9, 8, 14, 5, 52), pickupTime: '', shelfTime: '',
    items: [{ sku: 'S0009', name: '充电线', nameEn: '충전 케이블', forecastQty: 260 }]
  },
  {
    id: 'IB08', code: 'RK20260820164019962', username: 'SHEN', warehouse: WAREHOUSE,
    trackNo: 'SF1368201122', deliveryMethod: '自发头程', serviceChannel: '普通入库',
    inboundType: '包裹', arrivalMethod: '快递', etaTime: T(2026, 8, 21, 10, 0, 0), boxType: '拆单',
    status: 'CANCELLED', remark: '客户主动取消',
    createTime: T(2026, 8, 20, 16, 40, 19), pickupTime: '', shelfTime: '',
    items: [{ sku: 'S0006', name: '保温杯', nameEn: '보온컵', forecastQty: 50 }]
  },
  {
    id: 'IB11', code: 'RK20260906091827440', username: 'VIP0157', warehouse: WAREHOUSE,
    trackNo: 'CJ6677889900', deliveryMethod: '自发头程', serviceChannel: '普通入库',
    inboundType: '整箱', arrivalMethod: '快递', etaTime: T(2026, 9, 8, 10, 0, 0), boxType: '拆单',
    status: 'PENDING_CONFIRM', remark: 'VIP 客户',
    createTime: T(2026, 9, 6, 9, 18, 27), pickupTime: T(2026, 9, 7, 11, 5, 2), shelfTime: '',
    items: [{ sku: 'S1001', name: '口罩', nameEn: '마스크', forecastQty: 100 }]
  },
  {
    id: 'IB12', code: 'RK20260907094133678', username: 'VIP0157', warehouse: WAREHOUSE,
    trackNo: 'SF1368271122', deliveryMethod: '中转代发', serviceChannel: '加急入库',
    inboundType: '包裹', arrivalMethod: '快递', etaTime: T(2026, 9, 12, 10, 0, 0), boxType: '拆单',
    status: 'PENDING_PICKUP', remark: '',
    createTime: T(2026, 9, 7, 9, 41, 33), pickupTime: '', shelfTime: '',
    items: [{ sku: 'S1002', name: '手机支架', nameEn: '폰스탠드', forecastQty: 60 }]
  }
]

/** 认领管理（无主货）：无主货无归属用户，认领后并入本人入库流程 */
export const claims = [
  {
    id: 'CL01', code: 'RK20260905WUZHU001', warehouse: WAREHOUSE,
    trackNo: 'SF1368299901', deliveryMethod: '自发头程', remark: '外箱破损，无预报信息', status: 'UNCLAIMED',
    createTime: T(2026, 9, 5, 11, 20, 0), claimedBy: '', claimTime: ''
  },
  {
    id: 'CL02', code: 'RK20260907WUZHU002', warehouse: WAREHOUSE,
    trackNo: 'CJ5566778899', deliveryMethod: '中转代发', remark: '收到 2 箱化妆品，无标签', status: 'UNCLAIMED',
    createTime: T(2026, 9, 7, 15, 45, 0), claimedBy: '', claimTime: ''
  },
  {
    id: 'CL03', code: 'RK20260901WUZHU003', warehouse: WAREHOUSE,
    trackNo: 'SF1368233445', deliveryMethod: '自发头程', remark: '已认领并入库', status: 'CLAIMED',
    createTime: T(2026, 9, 1, 9, 30, 0), claimedBy: 'SHEN', claimTime: T(2026, 9, 2, 9, 12, 0)
  }
]

/** 出库单（一件代发）：三个号码体系 = 订单编号 CK / 发货单号 FH / 承运商单号（单号列） */
export const outboundOrders = [
  {
    id: 'OB01', code: 'CK20260830103847116', username: 'SHEN', warehouse: WAREHOUSE, country: '韩国',
    refNo: '', receiverName: '김민준', receiverPhone: '010-1234-5678', receiverAddr: '서울특별시 강남구 테헤란로 123',
    channel: 'CJ物流', carrier: 'CJ物流', deliveryNo: 'FH20260830103847001',
    carrierNo: 'CJ20260830123456', printStatus: 'PRINTED', status: 'SHIPPED',
    createTime: T(2026, 8, 30, 10, 38, 47), shipTime: T(2026, 8, 31, 9, 20, 15), remark: '',
    items: [{ sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', qty: 2 }]
  },
  {
    id: 'OB02', code: 'CK20260901092115832', username: 'SHEN', warehouse: WAREHOUSE, country: '韩国',
    refNo: 'REF-0901-01', receiverName: '이서연', receiverPhone: '010-8765-4321', receiverAddr: '부산광역시 해운대구 센텀로 99',
    channel: '韩通国际', carrier: '韩通国际', deliveryNo: 'FH20260901092115002',
    carrierNo: 'HT20260901887766', printStatus: 'PRINTED', status: 'SHIPPED',
    createTime: T(2026, 9, 1, 9, 21, 15), shipTime: T(2026, 9, 2, 14, 5, 40), remark: '易碎品贴标',
    items: [{ sku: 'S0004', name: '手机壳', nameEn: '폰케이스', qty: 1 }]
  },
  {
    id: 'OB03', code: 'CK20260905154028907', username: 'SHEN', warehouse: WAREHOUSE, country: '韩国',
    refNo: '', receiverName: '박지훈', receiverPhone: '010-2222-3333', receiverAddr: '인천광역시 연수구 송도동 55',
    channel: '顺丰国际', carrier: '顺丰国际', deliveryNo: 'FH20260905154028003',
    carrierNo: 'SF20260905778899', printStatus: 'UNPRINTED', status: 'PENDING_SHIP',
    createTime: T(2026, 9, 5, 15, 40, 28), shipTime: '', remark: '',
    items: [{ sku: 'S0002', name: '蓝牙耳机', nameEn: '블루투스 이어폰', qty: 3 }]
  },
  {
    id: 'OB04', code: 'CK20260907085436129', username: 'SHEN', warehouse: WAREHOUSE, country: '美国',
    refNo: 'AMZ-REF-0907', receiverName: 'John Smith', receiverPhone: '+1-415-555-0100', receiverAddr: '100 Main St, San Francisco, CA',
    channel: '韩通国际', carrier: '韩通国际', deliveryNo: 'FH20260907085436004',
    carrierNo: '', printStatus: 'UNPRINTED', status: 'PENDING_SHIP',
    createTime: T(2026, 9, 7, 8, 54, 36), shipTime: '', remark: '平台订单转单',
    items: [{ sku: 'S0006', name: '保温杯', nameEn: '보온컵', qty: 2 }]
  },
  {
    id: 'OB05', code: 'CK20260908091205463', username: 'SHEN', warehouse: WAREHOUSE, country: '韩国',
    refNo: '', receiverName: '최수빈', receiverPhone: '010-9999-8888', receiverAddr: '대전광역시 서구 둔산로 77',
    channel: '', carrier: '', deliveryNo: 'FH20260908091205005',
    carrierNo: '', printStatus: 'UNPRINTED', status: 'PENDING_PICKING',
    createTime: T(2026, 9, 8, 9, 12, 5), shipTime: '', remark: '',
    items: [{ sku: 'S0010', name: '护手霜', nameEn: '핸드크림', qty: 5 }]
  },
  {
    id: 'OB06', code: 'CK20260908104552170', username: 'SHEN', warehouse: WAREHOUSE, country: '日本',
    refNo: 'REF-0908-02', receiverName: '佐藤 健', receiverPhone: '+81-90-1234-5678', receiverAddr: '東京都渋谷区神南1-2-3',
    channel: '', carrier: '', deliveryNo: 'FH20260908104552006',
    carrierNo: '', printStatus: 'UNPRINTED', status: 'PENDING_PICKING',
    createTime: T(2026, 9, 8, 10, 45, 52), shipTime: '', remark: '店铺订单审核转入',
    items: [{ sku: 'S0003', name: '维生素C', nameEn: '비타민C', qty: 1 }]
  },
  {
    id: 'OB07', code: 'CK20260825112340872', username: 'SHEN', warehouse: WAREHOUSE, country: '韩国',
    refNo: '', receiverName: '정하은', receiverPhone: '010-5555-6666', receiverAddr: '광주광역시 서구 상무대로 12',
    channel: '', carrier: '', deliveryNo: 'FH20260825112340007',
    carrierNo: '', printStatus: 'UNPRINTED', status: 'CANCELLED',
    createTime: T(2026, 8, 25, 11, 23, 40), shipTime: '', remark: '客户取消',
    items: [{ sku: 'S0008', name: '化妆刷', nameEn: '메이크업 브러시', qty: 1 }]
  },
  {
    id: 'OB11', code: 'CK20260906142536310', username: 'VIP0157', warehouse: WAREHOUSE, country: '韩国',
    refNo: '', receiverName: '강도윤', receiverPhone: '010-7777-1111', receiverAddr: '제주특별자치도 연동 310',
    channel: 'CJ物流', carrier: 'CJ物流', deliveryNo: 'FH20260906142536011',
    carrierNo: 'CJ20260906665544', printStatus: 'PRINTED', status: 'SHIPPED',
    createTime: T(2026, 9, 6, 14, 25, 36), shipTime: T(2026, 9, 7, 10, 30, 0), remark: '',
    items: [{ sku: 'S1001', name: '口罩', nameEn: '마스크', qty: 20 }]
  }
]

/** 换标单（FBA Rebrand） */
export const rebrandOrders = [
  {
    id: 'RB01', code: 'HB20260829101247530', username: 'SHEN',
    fbaWarehouse: 'FBA首尔仓', shipWarehouse: WAREHOUSE, deliveryChannel: 'CJ物流', isFlag: '否',
    refNo: 'FBA-0829', fbaAddress: 'AMZ Seoul FC, 경기도 이천시 마장면', shipmentId: 'FBA15ABCD123', amazonNo: 'AMZ-2026-0829-01',
    attachment: '', status: 'PENDING_PICK', remark: '',
    createTime: T(2026, 8, 29, 10, 12, 47), shipTime: '',
    items: [{ sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', fnSku: 'X001A2B3C4D', newFnSku: 'X001Z9Y8X7W6', qty: 100 }]
  },
  {
    id: 'RB02', code: 'HB20260903155832241', username: 'SHEN',
    fbaWarehouse: 'FBA釜山仓', shipWarehouse: WAREHOUSE, deliveryChannel: '韩通国际', isFlag: '是',
    refNo: 'FBA-0903', fbaAddress: 'AMZ Busan FC, 부산광역시 강서구', shipmentId: 'FBA16EFGH456', amazonNo: 'AMZ-2026-0903-02',
    attachment: '装箱单.pdf', status: 'PENDING_LABEL', remark: '贴标物料自备',
    createTime: T(2026, 9, 3, 15, 58, 32), shipTime: '',
    items: [{ sku: 'S0007', name: '眼影盘', nameEn: '팔레트/02', fnSku: 'X001G7H8I9J', newFnSku: 'X001M8N7B6V5', qty: 60 }]
  },
  {
    id: 'RB03', code: 'HB20260906093018472', username: 'SHEN',
    fbaWarehouse: 'FBA首尔仓', shipWarehouse: WAREHOUSE, deliveryChannel: '顺丰国际', isFlag: '否',
    refNo: '', fbaAddress: 'AMZ Seoul FC, 경기도 이천시 마장면', shipmentId: 'FBA17JKLM789', amazonNo: 'AMZ-2026-0906-03',
    attachment: '', status: 'PENDING_DISPATCH', remark: '',
    createTime: T(2026, 9, 6, 9, 30, 18), shipTime: '',
    items: [{ sku: 'S0008', name: '化妆刷', nameEn: '메이크업 브러시', fnSku: 'X001H8I9J0K', newFnSku: 'X001Q5W4E3R2', qty: 40 }]
  },
  {
    id: 'RB04', code: 'HB20260822141005918', username: 'SHEN',
    fbaWarehouse: 'FBA釜山仓', shipWarehouse: WAREHOUSE, deliveryChannel: 'CJ物流', isFlag: '否',
    refNo: '', fbaAddress: 'AMZ Busan FC, 부산광역시 강서구', shipmentId: 'FBA18NOPQ012', amazonNo: 'AMZ-2026-0822-04',
    attachment: '', status: 'DISPATCHED', remark: '',
    createTime: T(2026, 8, 22, 14, 10, 5), shipTime: T(2026, 8, 25, 16, 22, 40),
    items: [{ sku: 'S0004', name: '手机壳', nameEn: '폰케이스', fnSku: 'X001D4E5F6G', newFnSku: 'X001T4R3E2W1', qty: 150 }]
  },
  {
    id: 'RB11', code: 'HB20260907112846305', username: 'VIP0157',
    fbaWarehouse: 'FBA首尔仓', shipWarehouse: WAREHOUSE, deliveryChannel: 'CJ物流', isFlag: '否',
    refNo: '', fbaAddress: 'AMZ Seoul FC, 경기도 이천시 마장면', shipmentId: 'FBA19RSTU345', amazonNo: 'AMZ-2026-0907-05',
    attachment: '', status: 'PENDING_PICK', remark: '',
    createTime: T(2026, 9, 7, 11, 28, 46), shipTime: '',
    items: [{ sku: 'S1001', name: '口罩', nameEn: '마스크', fnSku: 'X101M3N4O5P', newFnSku: 'X101B7V6C5X4', qty: 50 }]
  }
]

/** 退货单 */
export const returnOrders = [
  {
    id: 'RT01', code: 'TH20260825094012310', username: 'SHEN', warehouse: WAREHOUSE,
    inboundCode: '', trackNo: 'CJ1122334455', refNo: '', type: '退货重新上架',
    serviceChannel: '普通入库', inboundType: '包裹',
    departureTime: T(2026, 8, 24, 10, 0, 0), arrivalTime: T(2026, 8, 25, 9, 40, 12), etaTime: T(2026, 8, 25, 12, 0, 0),
    status: 'COMPLETED', finishTime: T(2026, 8, 28, 15, 30, 0), remark: '客户换货退回',
    items: [{ sku: 'S0004', name: '手机壳', nameEn: '폰케이스', forecastQty: 3 }]
  },
  {
    id: 'RT02', code: 'TH20260902103825670', username: 'SHEN', warehouse: WAREHOUSE,
    inboundCode: 'RK20260902103825990', trackNo: 'SF1368256677', refNo: 'RT-0902', type: '退货换标',
    serviceChannel: '普通入库', inboundType: '包裹',
    departureTime: T(2026, 9, 1, 14, 0, 0), arrivalTime: T(2026, 9, 2, 10, 38, 25), etaTime: T(2026, 9, 2, 12, 0, 0),
    status: 'COMPLETED', finishTime: T(2026, 9, 4, 11, 12, 0), remark: '',
    items: [{ sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', forecastQty: 5 }]
  },
  {
    id: 'RT03', code: 'TH20260906164533902', username: 'SHEN', warehouse: WAREHOUSE,
    inboundCode: 'RK20260906164533988', trackNo: 'CJ6677881122', refNo: '', type: '退货重新上架',
    serviceChannel: '普通入库', inboundType: '包裹',
    departureTime: T(2026, 9, 5, 9, 0, 0), arrivalTime: T(2026, 9, 6, 16, 45, 33), etaTime: T(2026, 9, 6, 18, 0, 0),
    status: 'PENDING_PROCESS', finishTime: '', remark: '质检后决定处置方式',
    items: [{ sku: 'S0002', name: '蓝牙耳机', nameEn: '블루투스 이어폰', forecastQty: 2 }]
  },
  {
    id: 'RT04', code: 'TH20260907115208846', username: 'SHEN', warehouse: WAREHOUSE,
    inboundCode: 'RK20260907115208877', trackNo: 'SF1368272233', refNo: '', type: '销毁',
    serviceChannel: '普通入库', inboundType: '包裹',
    departureTime: T(2026, 9, 6, 16, 0, 0), arrivalTime: T(2026, 9, 7, 11, 52, 8), etaTime: T(2026, 9, 7, 14, 0, 0),
    status: 'PENDING_FINISH', finishTime: '', remark: '已质检不可售，待销毁登记',
    items: [{ sku: 'S0011', name: '益生菌', nameEn: '프로바이오틱스', forecastQty: 10 }]
  },
  {
    id: 'RT05', code: 'TH20260908132847510', username: 'SHEN', warehouse: WAREHOUSE,
    inboundCode: '', trackNo: 'CJ8899002233', refNo: '', type: '退货换标',
    serviceChannel: '普通入库', inboundType: '包裹',
    departureTime: T(2026, 9, 8, 9, 0, 0), arrivalTime: '', etaTime: T(2026, 9, 9, 12, 0, 0),
    status: 'PENDING_RECEIVE', finishTime: '', remark: '',
    items: [{ sku: 'S0010', name: '护手霜', nameEn: '핸드크림', forecastQty: 8 }]
  },
  {
    id: 'RT06', code: 'TH20260908145930625', username: 'SHEN', warehouse: WAREHOUSE,
    inboundCode: 'RK20260908145930666', trackNo: 'SF1368279900', refNo: '', type: '退货重新上架',
    serviceChannel: '普通入库', inboundType: '包裹',
    departureTime: T(2026, 9, 7, 20, 0, 0), arrivalTime: T(2026, 9, 8, 14, 59, 30), etaTime: T(2026, 9, 8, 16, 0, 0),
    status: 'PENDING_SHELF', finishTime: '', remark: '',
    items: [{ sku: 'S0008', name: '化妆刷', nameEn: '메이크업 브러시', forecastQty: 4 }]
  },
  {
    id: 'RT11', code: 'TH20260905151120983', username: 'VIP0157', warehouse: WAREHOUSE,
    inboundCode: '', trackNo: 'CJ4455667788', refNo: '', type: '退回卖家',
    serviceChannel: '普通入库', inboundType: '包裹',
    departureTime: T(2026, 9, 4, 10, 0, 0), arrivalTime: '', etaTime: T(2026, 9, 10, 12, 0, 0),
    status: 'PENDING_RECEIVE', finishTime: '', remark: '',
    items: [{ sku: 'S1002', name: '手机支架', nameEn: '폰스탠드', forecastQty: 6 }]
  }
]

/** 库存流水（库存明细）：数量正增负减，备注列展示来源单据号 */
export const stockLedger = [
  { id: 'LG01', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', qty: 200, changeType: '入库上架', sourceCode: 'RK20260827090817482', remark: '', createTime: T(2026, 8, 27, 9, 10, 2) },
  { id: 'LG02', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0004', name: '手机壳', nameEn: '폰케이스', qty: 500, changeType: '入库上架', sourceCode: 'RK20260827090817831', remark: '', createTime: T(2026, 8, 28, 14, 33, 8) },
  { id: 'LG03', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', qty: -2, changeType: '一件代发出库', sourceCode: 'CK20260830103847116', remark: '', createTime: T(2026, 8, 31, 9, 20, 15) },
  { id: 'LG04', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0004', name: '手机壳', nameEn: '폰케이스', qty: -1, changeType: '一件代发出库', sourceCode: 'CK20260901092115832', remark: '', createTime: T(2026, 9, 2, 14, 5, 40) },
  { id: 'LG05', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0002', name: '蓝牙耳机', nameEn: '블루투스 이어폰', qty: 150, changeType: '入库上架', sourceCode: 'RK20260901093012205', remark: '', createTime: T(2026, 9, 1, 16, 45, 31) },
  { id: 'LG06', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0002', name: '蓝牙耳机', nameEn: '블루투스 이어폰', qty: -3, changeType: '一件代发出库', sourceCode: 'CK20260905154028907', remark: '下架完成', createTime: T(2026, 9, 6, 10, 8, 30) },
  { id: 'LG07', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0001', name: '眼影盘', nameEn: '팔레트/01', qty: 5, changeType: '退货上架', sourceCode: 'TH20260902103825670', remark: '退货质检可售', createTime: T(2026, 9, 3, 14, 20, 0) },
  { id: 'LG08', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0004', name: '手机壳', nameEn: '폰케이스', qty: -150, changeType: '换标出库', sourceCode: 'HB20260822141005918', remark: '', createTime: T(2026, 8, 23, 10, 5, 0) },
  { id: 'LG09', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0003', name: '维生素C', nameEn: '비타민C', qty: -1, changeType: '一件代发出库', sourceCode: 'CK20260908104552170', remark: '', createTime: T(2026, 9, 8, 11, 0, 0) },
  { id: 'LG10', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0006', name: '保温杯', nameEn: '보온컵', qty: -2, changeType: '盘点调整', sourceCode: 'PD20260905100000001', remark: '盘点差异核减', createTime: T(2026, 9, 5, 17, 0, 0) },
  { id: 'LG11', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0012', name: '发夹', nameEn: '머리핀', qty: -6, changeType: '库存调整', sourceCode: '', remark: '破损报损', createTime: T(2026, 8, 30, 15, 10, 0) },
  { id: 'LG12', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0005', name: '面膜', nameEn: '마스크팩', qty: 10, changeType: '认领入库', sourceCode: 'RK20260901WUZHU003', remark: '无主货认领', createTime: T(2026, 9, 2, 9, 30, 0) },
  { id: 'LG13', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0009', name: '充电线', nameEn: '충전 케이블', qty: 640, changeType: '入库上架', sourceCode: 'RK20260820164019961', remark: '', createTime: T(2026, 8, 21, 11, 0, 0) },
  { id: 'LG14', warehouse: WAREHOUSE, username: 'SHEN', sku: 'S0008', name: '化妆刷', nameEn: '메이크업 브러시', qty: 300, changeType: '入库上架', sourceCode: 'RK20260820164019960', remark: '', createTime: T(2026, 8, 21, 11, 30, 0) },
  { id: 'LG21', warehouse: WAREHOUSE, username: 'VIP0157', sku: 'S1001', name: '口罩', nameEn: '마스크', qty: 200, changeType: '入库上架', sourceCode: 'RK20260830100000001', remark: '', createTime: T(2026, 8, 30, 14, 0, 0) },
  { id: 'LG22', warehouse: WAREHOUSE, username: 'VIP0157', sku: 'S1001', name: '口罩', nameEn: '마스크', qty: -20, changeType: '一件代发出库', sourceCode: 'CK20260906142536310', remark: '', createTime: T(2026, 9, 7, 10, 30, 0) }
]

/** 订单账单（ZD 编号，费用人民币，PRD 6.8.2） */
export const bills = [
  { id: 'BL01', code: 'ZD20260827100000101', username: 'SHEN', warehouse: WAREHOUSE, relCode: 'RK20260827090817482', amount: 120.0, feeTime: T(2026, 8, 27, 9, 12, 0), remark: '入库操作费（200件）', status: 'PAID' },
  { id: 'BL02', code: 'ZD20260831100000102', username: 'SHEN', warehouse: WAREHOUSE, relCode: 'CK20260830103847116', amount: 35.5, feeTime: T(2026, 8, 31, 9, 25, 0), remark: '出库操作费+物流费', status: 'PAID' },
  { id: 'BL03', code: 'ZD20260902100000103', username: 'SHEN', warehouse: WAREHOUSE, relCode: 'CK20260901092115832', amount: 28.0, feeTime: T(2026, 9, 2, 14, 10, 0), remark: '出库操作费', status: 'PENDING' },
  { id: 'BL04', code: 'ZD20260903100000104', username: 'SHEN', warehouse: WAREHOUSE, relCode: 'TH20260902103825670', amount: 15.0, feeTime: T(2026, 9, 4, 11, 15, 0), remark: '退货处理费（5件）', status: 'PENDING' },
  { id: 'BL05', code: 'ZD20260905100000105', username: 'SHEN', warehouse: WAREHOUSE, relCode: 'WH202609-仓储费', amount: 268.4, feeTime: T(2026, 9, 5, 8, 0, 0), remark: '8月仓储费（按体积重×天数）', status: 'PENDING' },
  { id: 'BL06', code: 'ZD20260826100000106', username: 'SHEN', warehouse: WAREHOUSE, relCode: 'HB20260822141005918', amount: 45.0, feeTime: T(2026, 8, 25, 16, 30, 0), remark: '换标贴标费（150件）', status: 'PAID' },
  { id: 'BL11', code: 'ZD20260907100000111', username: 'VIP0157', warehouse: WAREHOUSE, relCode: 'CK20260906142536310', amount: 60.0, feeTime: T(2026, 9, 7, 10, 35, 0), remark: '出库操作费（20件）', status: 'PENDING' }
]

/** 银行账户（每用户单条，PRD 6.8.1） */
export const bankAccounts = [
  { id: 'BA01', username: 'SHEN', holder: '沈威', bank: '中国银行', accountNo: '6217856100001234567', branch: '北京朝阳支行', swift: 'BKCHCNBJ110', currency: 'CNY' },
  { id: 'BA02', username: 'VIP0157', holder: 'VIP0157', bank: '', accountNo: '', branch: '', swift: '', currency: 'CNY' }
]

/** 消息中心（未读数角标，PRD G-05） */
export const messages = [
  { id: 'MS01', username: 'SHEN', title: '店铺授权即将到期', content: '亚马逊日本站-新店 授权 Token 已失效，请及时重新授权。', time: T(2026, 9, 8, 9, 0, 0), read: false },
  { id: 'MS02', username: 'SHEN', title: '账单提醒', content: '您有 3 笔待支付账单，合计 ￥311.40，请及时处理。', time: T(2026, 9, 7, 18, 0, 0), read: false },
  { id: 'MS03', username: 'SHEN', title: '入库单已上架完成', content: '入库单 RK20260827090817482 已完成上架，库存已更新。', time: T(2026, 8, 27, 9, 15, 0), read: true },
  { id: 'MS11', username: 'VIP0157', title: '欢迎使用海外仓系统', content: '您的账号已开通，祝您使用愉快。', time: T(2026, 9, 1, 10, 0, 0), read: true }
]

/** 序号自增（新增单据 id 用） */
let idSeq = 1000
export function nextId(prefix) {
  idSeq += 1
  return `${prefix}${idSeq}`
}
