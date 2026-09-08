/** 金额格式化：人民币 ￥，两位小数（PRD G-09） */
export function fmtMoney(v) {
  const n = Number(v) || 0
  return `￥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** 金额数值（不带符号） */
export function moneyNum(v) {
  const n = Number(v) || 0
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** 当前时间 yyyy-MM-dd HH:mm:ss */
export function nowStr() {
  return fmtDateTime(new Date())
}

export function fmtDateTime(d) {
  if (!d) return ''
  if (typeof d === 'string') return d
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/** 逗号分隔的多值输入 → 数组 */
export function splitMulti(v) {
  if (!v) return []
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 银行账号脱敏：保留后4位 */
export function maskAccount(no) {
  const s = String(no || '')
  if (s.length <= 4) return s
  return `${'**** '.repeat(Math.max(1, Math.ceil((s.length - 4) / 4))).trim()}${s.slice(-4)}`
}

/**
 * 导出 Excel：以 HTML table 生成 .xls（Excel 可直接打开，列名与页面一致，遵循当前筛选条件）
 */
export function exportExcel(columns, rows, filename) {
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const cell = (c, row) => {
    if (typeof c.exportText === 'function') return esc(c.exportText(row))
    const v = row[c.prop]
    if (typeof c.formatter === 'function') return esc(c.formatter(row, v))
    return esc(v ?? '')
  }
  const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join('')
  const body = rows.map((r) => `<tr>${columns.map((c) => `<td>${cell(c, r)}</td>`).join('')}</tr>`).join('')
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
