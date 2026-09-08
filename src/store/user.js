import { defineStore } from 'pinia'

const LS_KEY = 'wms_user'
const REMEMBER_TTL = 12 * 3600 * 1000 // 12小时内免登录

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    loginTime: 0,
    remember: false
  }),
  getters: {
    isLoggedIn: (s) => !!s.username
  },
  actions: {
    login({ username, remember }) {
      this.username = username
      this.remember = !!remember
      this.loginTime = Date.now()
      this.persist()
    },
    persist() {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ username: this.username, loginTime: this.loginTime, remember: this.remember }))
      } catch (e) { /* ignore */ }
    },
    /** 从 localStorage 恢复会话；勾选"12小时内免登录"后 12h 内免重复登录 */
    restore() {
      if (this.username) return
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (!raw) return
        const saved = JSON.parse(raw)
        if (!saved?.username) return
        if (saved.remember && Date.now() - saved.loginTime > REMEMBER_TTL) {
          this.logout()
          return
        }
        if (!saved.remember && Date.now() - saved.loginTime > 3600 * 1000) {
          // 未勾选免登录：会话过期（1h）强制重新登录
          this.logout()
          return
        }
        this.username = saved.username
        this.remember = !!saved.remember
        this.loginTime = saved.loginTime
      } catch (e) { /* ignore */ }
    },
    logout() {
      this.username = ''
      this.remember = false
      this.loginTime = 0
      try { localStorage.removeItem(LS_KEY) } catch (e) { /* ignore */ }
    }
  }
})
