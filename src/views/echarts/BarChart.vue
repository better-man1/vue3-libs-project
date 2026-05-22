<template>
  <div class="echarts-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>ECharts 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>柱状 & 条形图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>ECharts 柱状与条形图</h2>
      <p>柱状图常用于比较不同类别的数据大小。本例展示了多系列分组柱状图、堆叠柱状图以及水平横向条形图。</p>
    </div>

    <el-row :gutter="20">
      <!-- Chart -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="季度产品销量对比" 
          description="使用柱状图展示各大门类产品在最近三个季度的销售数据对比"
          :code="barChartCode"
        >
          <div class="chart-controls mb-3">
            <el-radio-group v-model="chartType" size="small" @change="updateChart">
              <el-radio-button label="bar">分组柱状图</el-radio-button>
              <el-radio-button label="stack">堆叠柱状图</el-radio-button>
              <el-radio-button label="horizontal">横向条形图</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </DemoCard>
      </el-col>

      <!-- Explanation side panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>📊 柱状图设计指南</span>
            </div>
          </template>
          <div class="info-content">
            <h4>1. 多维比对 (Multi-Series)</h4>
            <p>通过配置 `series` 数组，可以渲染多组柱体。配合 `legend` 图例组件，让用户可点击隐藏/显示单个维度。</p>
            
            <h4>2. 堆叠设置 (`stack`)</h4>
            <p>给 `series` 中的各列配置相同的 `stack` 标识值，即可实现堆叠效果，适用于展示各子类别在总量中的比重变化。</p>

            <h4>3. 坐标轴翻转</h4>
            <p>将 `xAxis` 的 `type` 改为 `'value'`，将 `yAxis` 的 `type` 改为 `'category'`，即可秒变横向条形图，极度适合分类名称较长或分类较多时的展示需求。</p>
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
const chartType = ref<'bar' | 'stack' | 'horizontal'>('bar')

watch(() => appStore.isDark, () => {
  if (chartInstance) {
    chartInstance.dispose()
    initChart()
  }
})

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value, appStore.isDark ? 'dark' : undefined)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return

  const textColor = appStore.isDark ? '#a1a1aa' : '#4b5563'
  const splitLineColor = appStore.isDark ? '#27272a' : '#f1f5f9'
  
  const categories = ['家用电器', '智能数码', '服装鞋帽', '户外运动', '美妆个护']
  const seriesData = {
    q1: [220, 180, 150, 80, 120],
    q2: [280, 230, 190, 120, 160],
    q3: [350, 310, 240, 160, 210]
  }

  let option: echarts.EChartsOption = {}

  if (chartType.value === 'bar') {
    option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['第一季度', '第二季度', '第三季度'], textStyle: { color: textColor } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        { name: '第一季度', type: 'bar', data: seriesData.q1, itemStyle: { color: '#6366f1' } },
        { name: '第二季度', type: 'bar', data: seriesData.q2, itemStyle: { color: '#ec4899' } },
        { name: '第三季度', type: 'bar', data: seriesData.q3, itemStyle: { color: '#10b981' } }
      ]
    }
  } else if (chartType.value === 'stack') {
    option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['第一季度', '第二季度', '第三季度'], textStyle: { color: textColor } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        { name: '第一季度', type: 'bar', stack: 'total', data: seriesData.q1, itemStyle: { color: '#6366f1' } },
        { name: '第二季度', type: 'bar', stack: 'total', data: seriesData.q2, itemStyle: { color: '#ec4899' } },
        { name: '第三季度', type: 'bar', stack: 'total', data: seriesData.q3, itemStyle: { color: '#10b981' } }
      ]
    }
  } else if (chartType.value === 'horizontal') {
    option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['第一季度', '第二季度', '第三季度'], textStyle: { color: textColor } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        { name: '第一季度', type: 'bar', data: seriesData.q1, itemStyle: { color: '#6366f1' } },
        { name: '第二季度', type: 'bar', data: seriesData.q2, itemStyle: { color: '#ec4899' } },
        { name: '第三季度', type: 'bar', data: seriesData.q3, itemStyle: { color: '#10b981' } }
      ]
    }
  }

  chartInstance.setOption(option, true)
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

const barChartCode = `// 切换分组、堆叠、横向的核心配置
const updateChart = () => {
  if (chartType.value === 'stack') {
    // 堆叠柱状图：所有 series 配置相同的 stack 属性
    chartInstance.setOption({
      series: [
        { name: 'Q1', type: 'bar', stack: 'total', data: [220, 180, 150] },
        { name: 'Q2', type: 'bar', stack: 'total', data: [280, 230, 190] }
      ]
    })
  } else if (chartType.value === 'horizontal') {
    // 横向条形图：交换 xAxis 与 yAxis 的 type 类型
    chartInstance.setOption({
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: ['电器', '数码', '服装'] }
    })
  }
}`
</script>

<style scoped lang="scss">
.echarts-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-3 {
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
