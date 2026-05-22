<template>
  <div class="echarts-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>ECharts 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>饼图 & 环形图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>ECharts 饼图与环形图</h2>
      <p>饼图用于表示各类别占比。本例展示了基础饼图、中空环形图以及按数据大小伸展半径的南丁格尔玫瑰图。</p>
    </div>

    <el-row :gutter="20">
      <!-- Chart -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="系统访问来源统计" 
          description="使用饼图表达各个渠道的流量来源分布"
          :code="pieChartCode"
        >
          <div class="chart-controls mb-3">
            <el-radio-group v-model="chartType" size="small" @change="updateChart">
              <el-radio-button label="pie">基础饼图</el-radio-button>
              <el-radio-button label="donut">中空环形图</el-radio-button>
              <el-radio-button label="rose">南丁格尔玫瑰图</el-radio-button>
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
              <span>🥮 占比图设计核心</span>
            </div>
          </template>
          <div class="info-content">
            <h4>1. 数据结构</h4>
            <p>与柱状图不同，饼图的 `series.data` 接收一个由键值对组成的对象数组，形如：`{ name: '名称', value: 120 }`，无需配置单独的 `xAxis` 和 `yAxis`。</p>
            
            <h4>2. 中空环形图 (`radius`)</h4>
            <p>将 `radius` 设为一个数组，如 `['40%', '70%']`，即可实现中空环效果。第一项为内圈半径，第二项为外圈半径。</p>

            <h4>3. 南丁格尔玫瑰图 (`roseType`)</h4>
            <p>通过配置 `roseType: 'radius'`，数据的比例值不仅体现在弧度大小上，也体现在扇形的半径长度上，具有极强的视觉张力。</p>
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
const chartType = ref<'pie' | 'donut' | 'rose'>('pie')

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
  
  const sourceData = [
    { value: 1048, name: '搜索引擎' },
    { value: 735, name: '直接访问' },
    { value: 580, name: '邮件营销' },
    { value: 484, name: '联盟广告' },
    { value: 300, name: '视频广告' }
  ]

  let option: echarts.EChartsOption = {}

  if (chartType.value === 'pie') {
    option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
      legend: { bottom: '5%', left: 'center', textStyle: { color: textColor } },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '65%',
          center: ['50%', '45%'],
          data: sourceData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius: 6
          }
        }
      ]
    }
  } else if (chartType.value === 'donut') {
    option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
      legend: { bottom: '5%', left: 'center', textStyle: { color: textColor } },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: appStore.isDark ? '#09090b' : '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: sourceData
        }
      ]
    }
  } else if (chartType.value === 'rose') {
    option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
      legend: { bottom: '5%', left: 'center', textStyle: { color: textColor } },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: ['15%', '65%'],
          center: ['50%', '45%'],
          roseType: 'radius',
          itemStyle: {
            borderRadius: 8
          },
          data: sourceData
        }
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

const pieChartCode = `// 饼图核心 Radius 差异与 Rose 玫瑰配置
const sourceData = [
  { value: 1048, name: '搜索引擎' },
  { value: 735, name: '直接访问' }
]

// Donut 环形图 radius 数组表示内外半径比
const donutOption = {
  series: [{
    type: 'pie',
    radius: ['45%', '70%'],
    data: sourceData
  }]
}

// Rose 玫瑰图通过 roseType 指派
const roseOption = {
  series: [{
    type: 'pie',
    radius: ['15%', '65%'],
    roseType: 'radius', // 关键配置点
    data: sourceData
  }]
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
