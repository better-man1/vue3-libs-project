import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')
  const isSidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')

  const initTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    localStorage.setItem('sidebar_collapsed', isSidebarCollapsed.value ? 'true' : 'false')
  }

  return {
    isDark,
    isSidebarCollapsed,
    initTheme,
    toggleDarkMode,
    toggleSidebar,
  }
})
