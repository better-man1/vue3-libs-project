<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工程进阶</el-breadcrumb-item>
      <el-breadcrumb-item>Chart.js 图表对比</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Chart.js + vue-chartjs — 轻量图表引擎实践</h2>
      <p>体验与 ECharts 截然不同的 API 风格：Chart.js 基于 Canvas、配置驱动、体积更小。适合快速开发标准仪表盘。</p>
    </div>

    <!-- Comparison table -->
    <el-card shadow="hover" class="comparison-card mb-4">
      <template #header><span class="font-bold">⚖️ ECharts vs Chart.js 横向对比</span></template>
      <el-table :data="comparisonData" size="small" border>
        <el-table-column prop="feature" label="特性" width="150" />
        <el-table-column prop="echarts" label="Apache ECharts">
          <template #default="{ row }">
            <span v-html="row.echarts" />
          </template>
        </el-table-column>
        <el-table-column prop="chartjs" label="Chart.js">
          <template #default="{ row }">
            <span v-html="row.chartjs" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-row :gutter="20">
      <!-- Real-time Line Chart -->
      <el-col :xs="24" :lg="14">
        <DemoCard
          title="① 实时动态折线图 (Real-time Line)"
          description="每秒追加新数据点，图表自动滚动更新，体验 Chart.js 的轻量实时渲染性能。"
          :code="realtimeCode"
        >
          <div class="flex gap-2 mb-3">
            <el-button :type="isStreaming ? 'danger' : 'primary'" size="small" @click="toggleStream">
              {{ isStreaming ? '⏹️ 停止推送' : '▶️ 开始实时推送' }}
            </el-button>
            <el-button size="small" @click="resetChart">🔄 重置</el-button>
          </div>
          <canvas ref="realtimeChartRef" class="chart-canvas"></canvas>
        </DemoCard>
      </el-col>

      <!-- Doughnut Chart -->
      <el-col :xs="24" :lg="10">
        <DemoCard
          title="② 圆环图 — 资产组合分配"
          description="点击图例可切换显示/隐藏对应数据段，支持动画过渡。"
          :code="doughnutCode"
        >
          <canvas ref="doughnutChartRef" class="chart-canvas-sm"></canvas>
          <div class="asset-total flex justify-center mt-3">
            <el-tag type="success" size="large">总资产: ¥ {{ totalAssets.toLocaleString() }}</el-tag>
          </div>
        </DemoCard>
      </el-col>

      <!-- Mixed Bar + Line -->
      <el-col :xs="24">
        <DemoCard
          title="③ 混合图 — 双 Y 轴柱线叠加 (Mixed Bar + Line)"
          description="柱状图展示月度销售额，折线图展示环比增长率，两个 Y 轴量纲不同。"
          :code="mixedChartCode"
        >
          <canvas ref="mixedChartRef" class="chart-canvas-wide"></canvas>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js'
import DemoCard from '@/components/common/DemoCard.vue'

// Register required Chart.js components
Chart.register(
  LineController, LineElement, PointElement,
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Legend, Tooltip, Filler
)

// ─── Comparison data ─────────────────────────────────────────────────
const comparisonData = [
  { feature: '渲染方式', echarts: 'Canvas / SVG 双模', chartjs: 'Canvas 专用' },
  { feature: '包体积 (gzip)', echarts: '~370 kB', chartjs: '<b style="color:#10b981">~50 kB</b>' },
  { feature: '图表种类', echarts: '<b style="color:#10b981">40+（含3D、地理）</b>', chartjs: '8 种标准图表' },
  { feature: '大数据支持', echarts: '<b style="color:#10b981">万级数据点流畅</b>', chartjs: '适合千级以内' },
  { feature: '学习曲线', echarts: '较陡（配置项复杂）', chartjs: '<b style="color:#10b981">平缓（配置简洁）</b>' },
  { feature: 'TypeScript 支持', echarts: '较好', chartjs: '<b style="color:#10b981">原生 TS（@types/chart.js）</b>' },
  { feature: '适用场景', echarts: '大屏/BI/GIS', chartjs: '<b style="color:#10b981">轻量仪表盘/快速原型</b>' },
]

// ─── Realtime Line Chart ─────────────────────────────────────────────
const realtimeChartRef = ref<HTMLCanvasElement | null>(null)
let realtimeChart: Chart | null = null
let streamTimer: ReturnType<typeof setInterval> | null = null
const isStreaming = ref(false)
const MAX_POINTS = 20

const initRealtimeChart = () => {
  if (!realtimeChartRef.value) return
  const labels = Array.from({ length: MAX_POINTS }, (_, i) => `-${MAX_POINTS - i}s`)
  const data = Array.from({ length: MAX_POINTS }, () => Math.random() * 100)

  realtimeChart = new Chart(realtimeChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'CPU 使用率 (%)',
        data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: '使用率 (%)' } }
      }
    }
  })
}

const toggleStream = () => {
  if (isStreaming.value) {
    clearInterval(streamTimer!)
    isStreaming.value = false
  } else {
    isStreaming.value = true
    streamTimer = setInterval(() => {
      if (!realtimeChart) return
      const ds = realtimeChart.data.datasets[0]
      ds.data.push(Math.random() * 100)
      ds.data.shift()
      realtimeChart.data.labels?.push(`now`)
      realtimeChart.data.labels?.shift()
      realtimeChart.update('active')
    }, 1000)
  }
}

const resetChart = () => {
  if (streamTimer) { clearInterval(streamTimer); isStreaming.value = false }
  realtimeChart?.destroy()
  initRealtimeChart()
}

// ─── Doughnut Chart ──────────────────────────────────────────────────
const doughnutChartRef = ref<HTMLCanvasElement | null>(null)
let doughnutChart: Chart | null = null
const totalAssets = ref(2_450_000)

const initDoughnutChart = () => {
  if (!doughnutChartRef.value) return
  doughnutChart = new Chart(doughnutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['股票 (40%)', '债券 (25%)', '房产 (20%)', '黄金 (10%)', '现金 (5%)'],
      datasets: [{
        data: [40, 25, 20, 10, 5],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a0aec0'],
        borderWidth: 2,
        borderColor: 'var(--bg-color-primary)',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'right', labels: { padding: 16, usePointStyle: true } }
      }
    }
  })
}

// ─── Mixed Bar + Line Chart ──────────────────────────────────────────
const mixedChartRef = ref<HTMLCanvasElement | null>(null)
let mixedChart: Chart | null = null

const initMixedChart = () => {
  if (!mixedChartRef.value) return
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const sales = [420, 380, 510, 490, 620, 580, 710, 760, 820, 750, 890, 960]
  const growthRate = sales.map((v, i) => i === 0 ? 0 : +((v - sales[i - 1]) / sales[i - 1] * 100).toFixed(1))

  mixedChart = new Chart(mixedChartRef.value, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: '月销售额 (万元)',
          data: sales,
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderColor: '#6366f1',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: '环比增长率 (%)',
          type: 'line' as any,
          data: growthRate,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          pointBackgroundColor: '#f59e0b',
          tension: 0.4,
          fill: false,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: '销售额 (万元)' } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: '增长率 (%)' }, grid: { drawOnChartArea: false } }
      }
    }
  })
}

onMounted(() => {
  initRealtimeChart()
  initDoughnutChart()
  initMixedChart()
})

onBeforeUnmount(() => {
  if (streamTimer) clearInterval(streamTimer)
  realtimeChart?.destroy()
  doughnutChart?.destroy()
  mixedChart?.destroy()
})

const realtimeCode = `import { Chart, LineController, ... } from 'chart.js'
Chart.register(LineController, LineElement, ...)

const chart = new Chart(canvasRef, {
  type: 'line',
  data: { labels, datasets: [{ data, borderColor: '#6366f1', fill: true }] },
  options: { animation: { duration: 200 } }
})

// 实时追加数据
setInterval(() => {
  chart.data.datasets[0].data.push(Math.random() * 100)
  chart.data.datasets[0].data.shift()
  chart.update('active')   // 'active' 模式跳过动画，更流畅
}, 1000)`

const doughnutCode = `new Chart(canvas, {
  type: 'doughnut',
  data: {
    labels: ['股票', '债券', '房产'],
    datasets: [{ data: [40, 25, 20], backgroundColor: ['#6366f1', '#10b981', '#f59e0b'] }]
  },
  options: { cutout: '65%' }  // 圆环厚度控制
})`

const mixedChartCode = `// 混合图：datasets 中可混用不同 type
new Chart(canvas, {
  type: 'bar',  // 基础类型
  data: {
    datasets: [
      { type: 'bar',  label: '销售额', yAxisID: 'y' },
      { type: 'line', label: '增长率', yAxisID: 'y1' }  // 第二 Y 轴
    ]
  }
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.p5-demo-container { padding-bottom: 24px; }
.comparison-card .font-bold { font-weight: 700; }

.chart-canvas { width: 100% !important; height: 240px !important; }
.chart-canvas-sm { width: 100% !important; height: 220px !important; }
.chart-canvas-wide { width: 100% !important; height: 260px !important; }

.asset-total { margin-top: 12px; }

.flex { display: flex; }
.gap-2 { gap: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-3 { margin-top: 12px; }
.font-bold { font-weight: 700; }
.justify-center { justify-content: center; }
</style>
