<template>
  <el-aside :width="appStore.isSidebarCollapsed ? '64px' : '260px'" class="app-sidebar">
    <div class="sidebar-header">
      <div class="avatar-container" :class="{ 'collapsed': appStore.isSidebarCollapsed }">
        <span class="avatar-emoji">🚀</span>
        <h3 v-if="!appStore.isSidebarCollapsed" class="avatar-title">Learning Lab</h3>
      </div>
    </div>
    
    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="route.path"
        class="sidebar-menu"
        :collapse="appStore.isSidebarCollapsed"
        :router="true"
        unique-opened
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页总览</span>
        </el-menu-item>

        <!-- Pinia Submenu -->
        <el-sub-menu index="/pinia">
          <template #title>
            <el-icon><Briefcase /></el-icon>
            <span>Pinia 状态管理</span>
          </template>
          <el-menu-item index="/pinia/counter">计数器示例</el-menu-item>
          <el-menu-item index="/pinia/todo">Todo 任务清单</el-menu-item>
          <el-menu-item index="/pinia/cart">购物车系统</el-menu-item>
        </el-sub-menu>

        <!-- Element Plus Submenu -->
        <el-sub-menu index="/element-plus">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>Element Plus</span>
          </template>
          <el-menu-item index="/element-plus/basic">基础组件</el-menu-item>
          <el-menu-item index="/element-plus/form">智能表单</el-menu-item>
          <el-menu-item index="/element-plus/table">高级表格</el-menu-item>
          <el-menu-item index="/element-plus/dialog">反馈弹窗</el-menu-item>
        </el-sub-menu>

        <!-- ECharts Submenu -->
        <el-sub-menu index="/echarts">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>ECharts 可视化</span>
          </template>
          <el-menu-item index="/echarts/line">折线 & 面积图</el-menu-item>
          <el-menu-item index="/echarts/bar">柱状 & 条形图</el-menu-item>
          <el-menu-item index="/echarts/pie">饼图 & 环形图</el-menu-item>
          <el-menu-item index="/echarts/dashboard">综合大屏仪表盘</el-menu-item>
        </el-sub-menu>

        <!-- Three.js Submenu -->
        <el-sub-menu index="/threejs">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>Three.js 3D 渲染</span>
          </template>
          <el-menu-item index="/threejs/basic">基础三维场景</el-menu-item>
          <el-menu-item index="/threejs/geometry">几何体展示</el-menu-item>
          <el-menu-item index="/threejs/material-light">材质与光源</el-menu-item>
          <el-menu-item index="/threejs/earth">3D 炫酷地球</el-menu-item>
          <el-menu-item index="/threejs/animation">粒子星空动画</el-menu-item>
          <el-menu-item index="/threejs/advanced">进阶 3D 场景</el-menu-item>
        </el-sub-menu>

        <!-- D3.js Submenu -->
        <el-sub-menu index="/d3js">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>D3.js 可视化</span>
          </template>
          <el-menu-item index="/d3js/bar">SVG 柱状图</el-menu-item>
          <el-menu-item index="/d3js/force">力导向图</el-menu-item>
          <el-menu-item index="/d3js/treemap">矩形树图</el-menu-item>
          <el-menu-item index="/d3js/china-map">中国省份地图</el-menu-item>
        </el-sub-menu>

        <!-- Animation Submenu -->
        <el-sub-menu index="/animation">
          <template #title>
            <el-icon><VideoPlay /></el-icon>
            <span>🎬 动画特效</span>
          </template>
          <el-menu-item index="/animation/gsap">GSAP 时间轴</el-menu-item>
          <el-menu-item index="/animation/anime">Anime.js 描边</el-menu-item>
          <el-menu-item index="/animation/lottie">Lottie 矢量动画</el-menu-item>
        </el-sub-menu>

        <!-- VueUse Submenu -->
        <el-sub-menu index="/vueuse">
          <template #title>
            <el-icon><Pointer /></el-icon>
            <span>🧰 VueUse 常用库</span>
          </template>
          <el-menu-item index="/vueuse/mouse-tracker">鼠标轨迹追踪</el-menu-item>
          <el-menu-item index="/vueuse/storage-demo">本地响应式缓存</el-menu-item>
          <el-menu-item index="/vueuse/sensor-demo">传感器与状态</el-menu-item>
        </el-sub-menu>

        <!-- Utilities Submenu -->
        <el-sub-menu index="/utils">
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>🛠️ 工具方法实践</span>
          </template>
          <el-menu-item index="/utils/axios">Axios 网络请求</el-menu-item>
          <el-menu-item index="/utils/lodash">Lodash 实用函数</el-menu-item>
          <el-menu-item index="/utils/dayjs">Day.js 日期处理</el-menu-item>
        </el-sub-menu>

        <!-- Advanced Submenu -->
        <el-sub-menu index="/advanced">
          <template #title>
            <el-icon><Cpu /></el-icon>
            <span>🚀 高级功能实践</span>
          </template>
          <el-menu-item index="/advanced/tiptap">富文本编辑器</el-menu-item>
          <el-menu-item index="/advanced/excel">Excel 导入导出</el-menu-item>
          <el-menu-item index="/advanced/pdf-screenshot">PDF 与网页截图</el-menu-item>
          <el-menu-item index="/advanced/i18n">i18n 国际化</el-menu-item>
          <el-menu-item index="/advanced/drag-drop">拖拽排序看板</el-menu-item>
          <el-menu-item index="/advanced/virtual-scroll">虚拟滚动列表</el-menu-item>
        </el-sub-menu>

        <!-- Phase 5 Submenu -->
        <el-sub-menu index="/phase5">
          <template #title>
            <el-icon><Odometer /></el-icon>
            <span>🔬 工程进阶实践</span>
          </template>
          <el-menu-item index="/phase5/vue-query">TanStack Vue Query</el-menu-item>
          <el-menu-item index="/phase5/vitest">Vitest 单元测试</el-menu-item>
          <el-menu-item index="/phase5/vee-validate">VeeValidate + Zod</el-menu-item>
          <el-menu-item index="/phase5/leaflet">Leaflet.js 交互地图</el-menu-item>
          <el-menu-item index="/phase5/chartjs">Chart.js 图表对比</el-menu-item>
          <el-menu-item index="/phase5/vueuse-advanced">VueUse 高阶扩展</el-menu-item>
          <el-menu-item index="/phase5/markdown">Markdown 实时预览</el-menu-item>
        </el-sub-menu>

        <!-- Phase 6 Submenu -->
        <el-sub-menu index="/phase6">
          <template #title>
            <el-icon><Cellphone /></el-icon>
            <span>🎨 移动端与交互体验</span>
          </template>
          <el-menu-item index="/phase6/swiper">Swiper.js 轮播与视差</el-menu-item>
          <el-menu-item index="/phase6/motion">@vueuse/motion 手势动画</el-menu-item>
          <el-menu-item index="/phase6/driver">Driver.js 步骤引导</el-menu-item>
        </el-sub-menu>

        <!-- Phase 7 Submenu -->
        <el-sub-menu index="/phase7">
          <template #title>
            <el-icon><Compass /></el-icon>
            <span>🌐 3D & 地理</span>
          </template>
          <el-menu-item index="/cesium">CesiumJS 3D地球</el-menu-item>
          <el-menu-item index="/phase7/maplibre">Maplibre GL 3D 地图</el-menu-item>
          <el-menu-item index="/phase7/deckgl">Maplibre + deck.gl 进阶</el-menu-item>
          <el-menu-item index="/phase7/comlink">Comlink 多线程计算</el-menu-item>
          <el-menu-item index="/phase7/floating">Floating UI 精准定位</el-menu-item>
        </el-sub-menu>

        <!-- Phase 8 Submenu -->
        <el-sub-menu index="/phase8">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>🎯 实用工具扩展</span>
          </template>
          <el-menu-item index="/phase8/nprogress">NProgress 进度条</el-menu-item>
          <el-menu-item index="/phase8/qrcode">QRCode 二维码生成</el-menu-item>
          <el-menu-item index="/phase8/typed">Typed.js 打字机</el-menu-item>
          <el-menu-item index="/phase8/particles">tsParticles 粒子特效</el-menu-item>
          <el-menu-item index="/phase8/fabric">Fabric.js Canvas 画板</el-menu-item>
        </el-sub-menu>

        <!-- Phase 9 Submenu -->
        <el-sub-menu index="/phase9">
          <template #title>
            <el-icon><MagicStick /></el-icon>
            <span>🔮 专业场景集成</span>
          </template>
          <el-menu-item index="/phase9/vue-flow">Vue Flow 流程编辑器</el-menu-item>
          <el-menu-item index="/phase9/xterm">XTerm.js Web 终端</el-menu-item>
          <el-menu-item index="/phase9/monaco">Monaco Editor 编辑器</el-menu-item>
          <el-menu-item index="/phase9/wavesurfer">Wavesurfer.js 音频波形</el-menu-item>
          <el-menu-item index="/phase9/vcalendar">VCalendar 事件日历</el-menu-item>
        </el-sub-menu>

        <!-- Phase 10 / Exploration Submenu -->
        <el-sub-menu index="/exploration">
          <template #title>
            <el-icon><Opportunity /></el-icon>
            <span>🔮 前沿场景探索</span>
          </template>
          <el-menu-item index="/exploration/signature">在线电子签名</el-menu-item>
          <el-menu-item index="/exploration/rough-notation">手绘风格标注</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { HomeFilled, Briefcase, TrendCharts, Setting, Box, Connection, VideoPlay, Pointer, Tools, Cpu, Odometer, Cellphone, Compass, Files, MagicStick, Opportunity } from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.app-sidebar {
  background-color: var(--bg-color-secondary);
  border-right: 1px solid var(--border-color);
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width #{$transition-speed} #{$transition-ease}, background-color #{$transition-speed} #{$transition-ease}, border-color #{$transition-speed} #{$transition-ease};
  overflow: hidden;

  .sidebar-header {
    height: $header-height;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--border-color);
    
    .avatar-container {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      transition: all 0.3s;

      &.collapsed {
        justify-content: center;
        padding-left: 0;
      }

      .avatar-emoji {
        font-size: 1.5rem;
      }

      .avatar-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        margin: 0;
      }
    }
  }

  .menu-scrollbar {
    flex: 1;
    @include custom-scrollbar;
  }

  .sidebar-menu {
    border-right: none;
    background-color: transparent;

    :deep(.el-menu-item), :deep(.el-sub-menu__title) {
      height: 50px;
      line-height: 50px;
      margin: 4px 8px;
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 0.92rem;
      transition: all 0.2s;

      &:hover {
        background-color: var(--bg-color-primary) !important;
        color: $primary-color !important;
        
        .el-icon {
          color: $primary-color !important;
        }
      }
    }

    :deep(.el-menu-item.is-active) {
      background-color: rgba(99, 102, 241, 0.08) !important;
      color: $primary-color !important;
      font-weight: 600;

      .el-icon {
        color: $primary-color !important;
      }
    }
  }
}
</style>
