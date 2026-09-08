import { defineStore } from 'pinia'

/**
 * 多标签页工作区（PRD G-03）
 * 点击菜单新增 Tab、可切换、可关闭；关闭 Tab 不影响其他页面状态（keep-alive 按路由 path 缓存）
 */
export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [] // [{ path, title }]
  }),
  actions: {
    open(path, title) {
      if (!this.tabs.find((t) => t.path === path)) {
        this.tabs.push({ path, title })
      }
    },
    close(path) {
      const idx = this.tabs.findIndex((t) => t.path === path)
      if (idx > -1) this.tabs.splice(idx, 1)
      return this.tabs[Math.max(0, idx - 1)]
    },
    closeOthers(path) {
      this.tabs = this.tabs.filter((t) => t.path === path)
    }
  }
})
