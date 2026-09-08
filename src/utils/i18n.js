import { i18n } from '../locales'

/**
 * i18n 取值兜底：key 未配置时返回中文兜底文案，
 * 避免出现 PRD 中实测到的 "forecast.filter.placeholder.status" 之类漏翻 key 直接上屏的问题。
 */
export function tl(key, fallbackZh) {
  if (!key) return fallbackZh || ''
  try {
    const v = i18n.global.t(key)
    return v === key ? (fallbackZh || key) : v
  } catch (e) {
    return fallbackZh || key
  }
}