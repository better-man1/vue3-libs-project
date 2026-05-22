<template>
  <div class="home-container">
    <div class="welcome-banner">
      <h1>前端常用三方库学习与实践</h1>
      <p>欢迎来到三方库游乐场！本平台提供了 Vue 3、Pinia、Element Plus、ECharts 等核心生态以及其它工具库的交互式演示和源码学习。</p>
    </div>

    <!-- Quick Stats -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
              <span class="emoji">{{ stat.icon }}</span>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.title }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Visual Dashboard Section -->
    <el-row :gutter="20" class="main-dashboard-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📈 学习成长曲线 (ECharts 示例)</span>
              <el-tag type="success" effect="plain">实时渲染</el-tag>
            </div>
          </template>
          <div ref="chartRef" class="mini-chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="quick-nav-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🚀 快速跳转学习</span>
            </div>
          </template>
          <div class="quick-nav-links">
            <el-button 
              v-for="link in navLinks" 
              :key="link.text" 
              :type="link.type" 
              class="nav-btn"
              plain
              @click="router.push(link.path)"
            >
              {{ link.text }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Library Matrix -->
    <h2 class="section-title">📦 已集成核心库概览</h2>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="lib in coreLibs" :key="lib.name">
        <el-card class="lib-card" shadow="hover">
          <div class="lib-header">
            <h3>{{ lib.name }}</h3>
            <el-tag size="small" type="primary">{{ lib.version }}</el-tag>
          </div>
          <p class="lib-desc">{{ lib.desc }}</p>
          <div class="lib-footer">
            <code class="install-code">npm install {{ lib.pkg }}</code>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from '@/utils/echarts'

const router = useRouter()
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const stats = [
  { title: '已引入三方库', value: '45+', icon: '📦', bgColor: '#e0e7ff' },
  { title: '实践代码案例', value: '55+', icon: '💻', bgColor: '#fce7f3' },
  { title: '学习进度', value: '100%', icon: '🚀', bgColor: '#d1fae5' },
  { title: '学习时间 (天)', value: '28', icon: '⏰', bgColor: '#fef3c7' },
]

const navLinks = [
  { text: '🌐 CesiumJS 3D 地球', path: '/cesium', type: 'primary' as const },
  { text: '✍️ 在线电子签名', path: '/exploration/signature', type: 'success' as const },
  { text: '🖍️ 手绘风格标注', path: '/exploration/rough-notation', type: 'warning' as const },
  { text: '📝 Monaco 代码编辑器', path: '/phase9/monaco', type: 'info' as const },
  { text: '⚙️ Worker 多线程计算', path: '/phase7/comlink', type: 'danger' as const },
  { text: '🕸️ D3.js 关系力导向图', path: '/d3js/force', type: 'primary' as const },
]

const coreLibs = [
  { name: 'Vue 3', version: 'v3.5+', desc: '渐进式 JavaScript 框架，本系统所依赖的核心开发架构底座。', pkg: 'vue' },
  { name: 'Pinia', version: 'v3.0+', desc: 'Vue 官方状态管理库，支持模块化、DevTools 调试、强类型检查。', pkg: 'pinia' },
  { name: 'Element Plus', version: 'v2.14+', desc: '面向设计师和开发者的 Vue 3 组件库，支持全面的企业级交互组件。', pkg: 'element-plus' },
  { name: 'ECharts', version: 'v6.1+', desc: '企业级大屏、仪表盘首选的底层 Canvas/SVG 强大图表库。', pkg: 'echarts' },
  { name: 'CesiumJS', version: 'v1.141+', desc: '工业级三维地理空间数字地球引擎，支持全球级高精度地形和矢量实体渲染。', pkg: 'cesium' },
  { name: 'Three.js', version: 'r184', desc: '高级 WebGL 3D 渲染库，用于创建自定义三维场景、材质和粒子动画。', pkg: 'three' },
]

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: '#94a3b8' } }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#94a3b8' } },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: [
        {
          name: '学习小时数',
          type: 'line',
          smooth: true,
          data: [2, 3.5, 3, 5, 4.5, 7, 6],
          symbolSize: 8,
          itemStyle: { color: '#6366f1' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ])
          }
        },
        {
          name: '代码行数 (百行)',
          type: 'line',
          smooth: true,
          data: [1, 2.5, 2, 4, 3, 6.5, 5.5],
          symbolSize: 8,
          itemStyle: { color: '#ec4899' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(236, 72, 153, 0.3)' },
              { offset: 1, color: 'rgba(236, 72, 153, 0)' }
            ])
          }
        }
      ]
    }
    chartInstance.setOption(option)
    
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

const handleResize = () => {
  chartInstance?.resize()
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.home-container {
  padding-bottom: 40px;
}

.welcome-banner {
  padding: 40px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%);
  border: 1px solid var(--border-color);
  margin-bottom: 28px;
  
  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 12px;
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 1.05rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }
}

.stat-row {
  margin-bottom: 24px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    @include flex-center;
    
    .emoji {
      font-size: 1.4rem;
    }
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
  }
}

.main-dashboard-row {
  margin-bottom: 28px;
}

.chart-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .mini-chart-container {
    height: 320px;
    width: 100%;
  }
}

.quick-nav-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }

  .quick-nav-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px 0;
    
    .nav-btn {
      margin-left: 0;
      height: 46px;
      justify-content: flex-start;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 8px;
    }
  }
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 32px 0 20px 0;
}

.lib-card {
  margin-bottom: 20px;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  .lib-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
    }
  }
  
  .lib-desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
    flex-grow: 1;
    margin-bottom: 16px;
  }
  
  .lib-footer {
    border-top: 1px solid var(--border-color);
    padding-top: 12px;
    
    .install-code {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  }
}

.dark {
  .welcome-banner {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%);
  }
  .stat-card .stat-icon {
    background-color: rgba(255, 255, 255, 0.05) !important;
  }
}
</style>
