<template>
  <el-container class="app-layout-container">
    <!-- Sidebar -->
    <AppSidebar />

    <el-container class="app-main-container">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <el-main class="app-content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'

const appStore = useAppStore()

onMounted(() => {
  appStore.initTheme()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.app-layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-color-primary);
}

.app-main-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--bg-color-primary);
  transition: background-color #{$transition-speed} #{$transition-ease};
  @include custom-scrollbar;
}
</style>
