/**
 * 单号生成（PRD 10.3）：前缀 + yyyyMMddHHmmss + 3位流水，全局唯一、可配置
 * 入库 RK / 出库订单 CK / 换标 HB / 退货 TH / 账单 ZD
 */
const seqMap = {}

function pad(n, l = 3) {
  return String(n).padStart(l, '0')
}

export function ts14(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

export function genCode(prefix) {
  const now = new Date()
  // 按天 + 前缀 维度流水，保证唯一
  const key = `${prefix}${ts14(now).slice(0, 8)}`
  seqMap[key] = (seqMap[key] || 0) + 1
  return `${prefix}${ts14(now)}${pad(seqMap[key])}`
}
