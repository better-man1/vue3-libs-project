<template>
  <div class="dashboard-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>ECharts 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>综合大屏仪表盘</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="dashboard-header mb-4">
      <div class="header-title">
        <h2>📊 综合业务数据看板</h2>
        <span class="update-time">最近同步时间: {{ curTime }}</span>
      </div>
      <el-button type="primary" @click="refreshDashboard">
        刷新全部看板数据
      </el-button>
    </div>

    <!-- KPI Cards -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :lg="6" v-for="kpi in kpiData" :key="kpi.title">
        <el-card class="kpi-card" shadow="hover">
          <div class="kpi-wrapper">
            <div class="kpi-left">
              <span class="kpi-title">{{ kpi.title }}</span>
              <span class="kpi-value">{{ kpi.value }}</span>
            </div>
            <div class="kpi-right" :style="{ color: kpi.color }">
              <span class="kpi-trend">{{ kpi.trend }}</span>
              <span class="kpi-icon">{{ kpi.icon }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Main Analytics Graph -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📈 核心转化率与访客量趋势</span>
              <el-tag type="info">每分钟更新</el-tag>
            </div>
          </template>
          <div ref="trendChartRef" class="main-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Multi-chart Grid -->
    <el-row :gutter="20">
      <!-- Device Proportions -->
      <el-col :xs="24" :md="8" class="mb-3">
        <el-card shadow="hover" class="grid-chart-card">
          <template #header>
            <span>📱 终端设备访问占比</span>
          </template>
          <div ref="deviceChartRef" class="grid-chart"></div>
        </el-card>
      </el-col>

      <!-- Referral Channels -->
      <el-col :xs="24" :md="8" class="mb-3">
        <el-card shadow="hover" class="grid-chart-card">
          <template #header>
            <span>🔗 外部推介来源排行</span>
          </template>
          <div ref="channelChartRef" class="grid-chart"></div>
        </el-card>
      </el-col>

      <!-- Radar Performance -->
      <el-col :xs="24" :md="8" class="mb-3">
        <el-card shadow="hover" class="grid-chart-card">
          <template #header>
            <span>🛡️ 系统性能多维雷达图</span>
          </template>
          <div ref="radarChartRef" class="grid-chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from '@/utils/echarts'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'

const appStore = useAppStore()
const curTime = ref(new Date().toLocaleTimeString())

// Chart DOM refs
const trendChartRef = ref<HTMLDivElement | null>(null)
const deviceChartRef = ref<HTMLDivElement | null>(null)
const channelChartRef = ref<HTMLDivElement | null>(null)
const radarChartRef = ref<HTMLDivElement | null>(null)

// ECharts instances
let trendChart: echarts.ECharts | null = null
let deviceChart: echarts.ECharts | null = null
let channelChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

const kpiData = ref([
  { title: '总营业收入', value: '¥1,250,920', trend: '↑ 12%', icon: '💰', color: '#10b981' },
  { title: '活动访问量 (UV)', value: '185,200', trend: '↑ 8%', icon: '👥', color: '#6366f1' },
  { title: '新增下单用户数', value: '12,490', trend: '↑ 24%', icon: '🛒', color: '#ec4899' },
  { title: '服务稳定性', value: '99.98%', trend: '↓ 0.01%', icon: '⚡', color: '#f59e0b' }
])

const initAllCharts = () => {
  const isDark = appStore.isDark
  const textColor = isDark ? '#a1a1aa' : '#4b5563'
  const splitLineColor = isDark ? '#27272a' : '#f1f5f9'

  // 1. Trend Chart
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value, isDark ? 'dark' : undefined)
    trendChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { data: ['访问量', '下单数'], textStyle: { color: textColor } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        {
          name: '访问量',
          type: 'line',
          smooth: true,
          data: [12000, 15000, 18000, 14000, 21000, 29000, 26000],
          itemStyle: { color: '#6366f1' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ])
          }
        },
        {
          name: '下单数',
          type: 'line',
          smooth: true,
          data: [800, 1100, 1500, 1000, 1700, 2500, 2200],
          itemStyle: { color: '#ec4899' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(236, 72, 153, 0.3)' },
              { offset: 1, color: 'rgba(236, 72, 153, 0)' }
            ])
          }
        }
      ]
    })
  }

  // 2. Device Chart
  if (deviceChartRef.value) {
    deviceChart = echarts.init(deviceChartRef.value, isDark ? 'dark' : undefined)
    deviceChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: '0', textStyle: { color: textColor } },
      series: [
        {
          name: '终端设备',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: isDark ? '#09090b' : '#fff', borderWidth: 2 },
          label: { show: false },
          data: [
            { value: 1048, name: '移动端 (Mobile)', itemStyle: { color: '#6366f1' } },
            { value: 735, name: '桌面端 (Desktop)', itemStyle: { color: '#ec4899' } },
            { value: 280, name: '平板端 (Tablet)', itemStyle: { color: '#10b981' } }
          ]
        }
      ]
    })
  }

  // 3. Channel Chart
  if (channelChartRef.value) {
    channelChart = echarts.init(channelChartRef.value, isDark ? 'dark' : undefined)
    channelChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'category',
        data: ['社交媒体', '直达推荐', '百度搜索', '谷歌推广', '邮件推广'],
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        {
          name: '访问量',
          type: 'bar',
          data: [320, 480, 640, 780, 890],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#ec4899' },
              { offset: 1, color: '#6366f1' }
            ]),
            borderRadius: [0, 5, 5, 0]
          }
        }
      ]
    })
  }

  // 4. Radar Chart
  if (radarChartRef.value) {
    radarChart = echarts.init(radarChartRef.value, isDark ? 'dark' : undefined)
    radarChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      radar: {
        indicator: [
          { name: '内存占用 (RAM)', max: 100 },
          { name: 'CPU 利用率', max: 100 },
          { name: '磁盘空间 (SSD)', max: 100 },
          { name: '网络延迟 (Ping)', max: 100 },
          { name: '负载均衡 (Load)', max: 100 }
        ],
        axisName: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor } },
        splitArea: { show: false }
      },
      series: [
        {
          name: '服务器表现',
          type: 'radar',
          data: [
            {
              value: [45, 60, 30, 15, 50],
              name: '主机 A',
              itemStyle: { color: '#6366f1' },
              areaStyle: { color: 'rgba(99, 102, 241, 0.2)' }
            },
            {
              value: [70, 40, 60, 45, 80],
              name: '主机 B',
              itemStyle: { color: '#10b981' },
              areaStyle: { color: 'rgba(16, 185, 129, 0.2)' }
            }
          ]
        }
      ]
    })
  }
}

const handleResize = () => {
  trendChart?.resize()
  deviceChart?.resize()
  channelChart?.resize()
  radarChart?.resize()
}

const refreshDashboard = () => {
  curTime.value = new Date().toLocaleTimeString()
  
  // Randomize values to simulate update
  kpiData.value[0].value = '¥' + (1250000 + Math.floor(Math.random() * 5000)).toLocaleString()
  kpiData.value[1].value = (185000 + Math.floor(Math.random() * 200)).toLocaleString()
  kpiData.value[2].value = (12400 + Math.floor(Math.random() * 100)).toLocaleString()
  
  // Re-run setup configurations
  initAllCharts()
  ElMessage.success('系统指标刷新成功')
}

// Watch theme toggles
watch(() => appStore.isDark, () => {
  // Dispose all existing instances
  trendChart?.dispose()
  deviceChart?.dispose()
  channelChart?.dispose()
  radarChart?.dispose()
  
  // Re-init
  initAllCharts()
})

onMounted(() => {
  initAllCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  deviceChart?.dispose()
  channelChart?.dispose()
  radarChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding-bottom: 40px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 16px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  
  .header-title {
    h2 {
      font-size: 1.6rem;
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    
    .update-time {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  }
}

.kpi-card {
  .kpi-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .kpi-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .kpi-title {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .kpi-value {
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--text-primary);
    }
  }
  
  .kpi-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    
    .kpi-trend {
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .kpi-icon {
      font-size: 1.4rem;
    }
  }
}

.main-chart {
  width: 100%;
  height: 350px;
}

.grid-chart-card {
  :deep(.el-card__header) {
    font-size: 0.95rem;
    font-weight: 600;
    padding: 12px 20px;
  }
  
  .grid-chart {
    width: 100%;
    height: 280px;
  }
}
</style>
