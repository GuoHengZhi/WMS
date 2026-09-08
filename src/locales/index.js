import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('wms_locale') || 'zh',
  fallbackLocale: 'zh',
  missingWarn: false,
  fallbackWarn: false,
  messages: { zh, en }
})

export function setLocale(lang) {
  i18n.global.locale.value = lang
  try { localStorage.setItem('wms_locale', lang) } catch (e) { /* ignore */ }
}
