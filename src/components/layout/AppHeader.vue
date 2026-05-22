<template>
  <el-header class="app-header">
    <div class="left-section">
      <el-button 
        type="primary" 
        link
        @click="appStore.toggleSidebar"
        class="toggle-btn"
      >
        <el-icon size="20px">
          <Expand v-if="appStore.isSidebarCollapsed" />
          <Fold v-else />
        </el-icon>
      </el-button>
      
      <div class="logo-text">
        <span class="gradient-text">Vue3 Playground</span>
        <span class="version-badge">v1.0.0</span>
      </div>
    </div>

    <div class="right-section">
      <el-tooltip :content="appStore.isDark ? '切换亮色模式' : '切换暗色模式'" placement="bottom">
        <el-button 
          circle
          @click="appStore.toggleDarkMode"
          class="theme-toggle"
        >
          <el-icon size="16px">
            <Moon v-if="appStore.isDark" />
            <Sunny v-else />
          </el-icon>
        </el-button>
      </el-tooltip>
      
      <el-link 
        href="https://github.com" 
        target="_blank" 
        class="github-link"
        :underline="false"
      >
        <el-avatar :size="28" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
      </el-link>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { Fold, Expand, Sunny, Moon } from '@element-plus/icons-vue'

const appStore = useAppStore()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.app-header {
  height: $header-height;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: var(--bg-color-secondary);
  border-bottom: 1px solid var(--border-color);
  z-index: 10;
  transition: background-color #{$transition-speed} #{$transition-ease}, border-color #{$transition-speed} #{$transition-ease};
  
  .left-section {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .toggle-btn {
      padding: 8px;
      color: var(--text-secondary);
      &:hover {
        color: $primary-color;
      }
    }

    .logo-text {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .gradient-text {
        font-size: 1.25rem;
        font-weight: 700;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .version-badge {
        font-size: 0.7rem;
        padding: 2px 6px;
        background-color: var(--border-color);
        color: var(--text-secondary);
        border-radius: 10px;
        font-weight: 500;
      }
    }
  }

  .right-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .theme-toggle {
      background-color: var(--bg-color-primary);
      border-color: var(--border-color);
      color: var(--text-primary);
      
      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }

    .github-link {
      display: flex;
      align-items: center;
      transition: transform 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
}
</style>
