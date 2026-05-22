<template>
  <div class="echarts-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>ECharts 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>折线 & 面积图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>ECharts 折线与面积图</h2>
      <p>折线图常用于展示连续时间间隔内的数据变化趋势。本例演示了渐变面积填充、数据平滑曲线、Tooltips 指针以及图例切换控制。</p>
    </div>

    <el-row :gutter="20">
      <!-- Chart -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="系统服务器负载趋势" 
          description="展示 CPU 与内存利用率的实时演变数据，支持缩放与图例筛选"
          :code="lineChartCode"
        >
          <div ref="chartRef" class="chart-container"></div>
        </DemoCard>
      </el-col>

      <!-- Control & Info Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>📈 图表核心配置点</span>
            </div>
          </template>
          <div class="info-content">
            <h4>1. Container 挂载</h4>
            <p>ECharts 渲染需要指定宽高的 DOM 节点。在 Vue 中使用 `ref` 获取节点引用，在 `onMounted` 钩子中执行 `echarts.init()`。</p>
            
            <h4>2. 渐变色面积填充 (`areaStyle`)</h4>
            <p>通过 `echarts.graphic.LinearGradient` 实现从上到下透明度渐变的炫酷面积底色，增强现代视觉质感。</p>

            <h4>3. 自适应缩放 (`resize`)</h4>
            <p>监听全局 `resize` 事件，在窗口大小发生改变时触发 `chartInstance.resize()`，保持图表比例正确。</p>

            <h4>4. 资源清理</h4>
            <p>在组件卸载前 (`onBeforeUnmount`) 务必解绑 `resize` 事件，并调用 `chartInstance.dispose()` 释放实例资源，规避内存泄露。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from '@/utils/echarts'
import { useAppStore } from '@/stores/app'
import DemoCard from '@/components/common/DemoCard.vue'

const appStore = useAppStore()
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// Re-init chart or set options when dark mode changes
watch(() => appStore.isDark, () => {
  if (chartInstance) {
    chartInstance.dispose()
    initChart()
  }
})

const initChart = () => {
  if (!chartRef.value) return
  
  // Use ECharts dark theme if app is in dark mode
  chartInstance = echarts.init(chartRef.value, appStore.isDark ? 'dark' : undefined)
  
  const textColor = appStore.isDark ? '#a1a1aa' : '#4b5563'
  const splitLineColor = appStore.isDark ? '#27272a' : '#f1f5f9'
  
  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    legend: {
      data: ['CPU 利用率', '内存 使用率'],
      textStyle: { color: textColor }
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
      data: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: splitLineColor } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        formatter: '{value} %',
        color: textColor
      },
      splitLine: { lineStyle: { color: splitLineColor } }
    },
    series: [
      {
        name: 'CPU 利用率',
        type: 'line',
        smooth: true,
        data: [15, 22, 58, 36, 42, 85, 45],
        symbolSize: 6,
        itemStyle: { color: '#6366f1' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.4)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0)' }
          ])
        }
      },
      {
        name: '内存 使用率',
        type: 'line',
        smooth: true,
        data: [35, 38, 42, 45, 52, 60, 58],
        symbolSize: 6,
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

const lineChartCode = `// Component script setup
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['CPU 利用率', '内存 使用率'] },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30']
      },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} %' } },
      series: [
        {
          name: 'CPU 利用率',
          type: 'line',
          smooth: true,
          data: [15, 22, 58, 36, 42, 85, 45],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.4)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ])
          }
        }
      ]
    })
  }
  window.addEventListener('resize', () => chartInstance?.resize())
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
})`
</script>

<style scoped lang="scss">
.echarts-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.header-desc {
  margin-bottom: 24px;
  h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 6px;
  }
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
}

.chart-container {
  width: 100%;
  height: 400px;
}

.info-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
  
  .info-content {
    h4 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      
      &:not(:first-child) {
        margin-top: 20px;
      }
    }
    
    p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
  }
}
</style>
