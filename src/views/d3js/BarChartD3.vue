<template>
  <div class="d3-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>D3.js 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>SVG 柱状图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>D3.js SVG 动态柱状图</h2>
      <p>认识 D3.js 的数据绑定与比例尺。探索经典的 Enter-Update-Exit 数据声明式生命周期，并在数据增删、打乱或排序时观察平滑的 SVG 补间动画。</p>
    </div>

    <el-row :gutter="20">
      <!-- D3 Chart Render Area -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="D3.js SVG 渲染视口" 
          description="点击右侧按钮更改、添加数据，观察柱体的平滑过渡动画效果"
          :code="d3BarCode"
        >
          <div class="chart-wrapper" ref="chartContainer">
            <!-- D3 will inject the SVG here -->
          </div>
        </DemoCard>
      </el-col>

      <!-- Panel Control Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 数据控制器</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">数据驱动操作</h4>
            <div class="button-grid">
              <el-button type="primary" @click="randomizeData">随机刷新值</el-button>
              <el-button type="success" @click="addDataItem" :disabled="dataList.length >= 10">新增一项</el-button>
              <el-button type="danger" @click="removeDataItem" :disabled="dataList.length <= 3">删减最后一项</el-button>
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">数据排列排序</h4>
            <div class="button-grid">
              <el-button type="warning" plain @click="sortData('asc')">升序排列</el-button>
              <el-button type="warning" plain @click="sortData('desc')">降序排列</el-button>
              <el-button type="info" plain @click="sortData('reset')">恢复初始</el-button>
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">当前数据集</h4>
            <div class="data-view-table">
              <div v-for="item in dataList" :key="item.id" class="data-item-row">
                <span class="data-label font-bold">{{ item.name }}:</span>
                <el-input-number 
                  v-model="item.value" 
                  :min="10" 
                  :max="100" 
                  size="small" 
                  @change="drawChart" 
                  controls-position="right"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import DemoCard from '@/components/common/DemoCard.vue'

// DOM Reference
const chartContainer = ref<HTMLDivElement | null>(null)

// Initial Data Structure
interface DataItem {
  id: number
  name: string
  value: number
}
const dataList = ref<DataItem[]>([
  { id: 1, name: 'HTML5', value: 80 },
  { id: 2, name: 'CSS3', value: 65 },
  { id: 3, name: 'Vue 3', value: 95 },
  { id: 4, name: 'Pinia', value: 75 },
  { id: 5, name: 'Vite', value: 85 },
  { id: 6, name: 'D3.js', value: 45 }
])

// Keep backup for restore sorting
let initialDataBackup = [...dataList.value.map(d => ({ ...d }))]
let nextId = 7

// Initialize D3 drawing variables
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>

const initChart = () => {
  if (!chartContainer.value) return

  // Remove existing SVGs to reset viewport
  d3.select(chartContainer.value).select('svg').remove()

  const width = chartContainer.value.clientWidth
  const height = 400

  // 1. Create SVG
  svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 2. Initial Draw Call
  drawChart()
}

// Main Draw and Update Function (Declarative D3)
const drawChart = () => {
  if (!chartContainer.value || !svg) return

  const margin = { top: 30, right: 30, bottom: 40, left: 50 }
  const width = chartContainer.value.clientWidth
  const height = 400
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const currentData = dataList.value

  // 1. Create/Retrieve main chart group container
  let g = svg.select<SVGGElement>('.chart-group')
  if (g.empty()) {
    g = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
  }

  // 2. Define X / Y Scales
  const x = d3.scaleBand()
    .domain(currentData.map(d => d.name))
    .range([0, chartWidth])
    .padding(0.3)

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([chartHeight, 0])

  // 3. Render / Update Axes
  let xAxis = g.select<SVGGElement>('.x-axis')
  if (xAxis.empty()) {
    xAxis = g.append('g').attr('class', 'x-axis')
  }
  xAxis.attr('transform', `translate(0, ${chartHeight})`)
    .transition().duration(600)
    .call(d3.axisBottom(x))
    // Format axis ticks
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', 'var(--text-secondary)')

  let yAxis = g.select<SVGGElement>('.y-axis')
  if (yAxis.empty()) {
    yAxis = g.append('g').attr('class', 'y-axis')
  }
  yAxis.transition().duration(600)
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', 'var(--text-secondary)')

  // Customize axis line colors
  xAxis.select('.domain').attr('stroke', 'var(--border-color)')
  yAxis.select('.domain').attr('stroke', 'var(--border-color)')
  xAxis.selectAll('.tick line').attr('stroke', 'var(--border-color)')
  yAxis.selectAll('.tick line').attr('stroke', 'var(--border-color)')

  // 4. Data Binding for Rects (Bars)
  const bars = g.selectAll<SVGRectElement, DataItem>('.bar-rect')
    .data(currentData, d => d.id)

  // EXIT: remove old bars with transition fade
  bars.exit()
    .transition()
    .duration(400)
    .attr('y', chartHeight)
    .attr('height', 0)
    .style('opacity', 0)
    .remove()

  // ENTER: append new bars starting from floor y
  const barsEnter = bars.enter()
    .append('rect')
    .attr('class', 'bar-rect')
    .attr('x', d => x(d.name) || 0)
    .attr('y', chartHeight)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('rx', 4) // Rounded top corners
    .attr('fill', 'url(#bar-gradient)') // Gradient fill
    .style('opacity', 0)

  // UPDATE + ENTER: animate size transitions
  barsEnter.merge(bars as any)
    .transition()
    .duration(800)
    .style('opacity', 1)
    .attr('x', d => x(d.name) || 0)
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.value))
    .attr('height', d => chartHeight - y(d.value))

  // Create gradient definitions in SVG if not exist
  let defs: any = svg.select('defs')
  if (defs.empty()) {
    defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%')
      
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4f46e5') // Indigo 600
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#06b6d4') // Cyan 500
  }
}

// Controls logic
const randomizeData = () => {
  dataList.value.forEach((item) => {
    item.value = Math.floor(20 + Math.random() * 75)
  })
  drawChart()
}

const addDataItem = () => {
  const languages = ['React', 'Angular', 'Node.js', 'Rust', 'Go', 'Python', 'Docker']
  const langName = languages[Math.floor(Math.random() * languages.length)] + `-${nextId}`
  
  dataList.value.push({
    id: nextId++,
    name: langName,
    value: Math.floor(30 + Math.random() * 65)
  })
  drawChart()
}

const removeDataItem = () => {
  if (dataList.value.length > 3) {
    dataList.value.pop()
    drawChart()
  }
}

const sortData = (mode: 'asc' | 'desc' | 'reset') => {
  if (mode === 'asc') {
    dataList.value.sort((a, b) => a.value - b.value)
  } else if (mode === 'desc') {
    dataList.value.sort((a, b) => b.value - a.value)
  } else {
    // Restore original list from initial backup
    dataList.value = initialDataBackup.map(d => ({ ...d }))
  }
  drawChart()
}

// Handle layout resize
const handleResize = () => {
  if (!chartContainer.value || !svg) return
  const width = chartContainer.value.clientWidth
  svg.attr('width', width)
  drawChart()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const d3BarCode = `// D3.js 核心绘制更新逻辑
import * as d3 from 'd3'

// 1. 定义比例尺
const x = d3.scaleBand()
  .domain(data.map(d => d.name))
  .range([0, width])
  .padding(0.3)

const y = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0])

// 2. 绑定数据
const bars = svg.selectAll('.bar-rect')
  .data(data, d => d.id)

// 3. EXIT 过程 (数据被删除)
bars.exit()
  .transition().duration(400)
  .attr('y', height).attr('height', 0).remove()

// 4. ENTER 过程 (新插入数据)
const enter = bars.enter()
  .append('rect')
  .attr('class', 'bar-rect')
  .attr('x', d => x(d.name))
  .attr('y', height)
  .attr('height', 0)

// 5. UPDATE 过程 (修改原有数据高度)
enter.merge(bars)
  .transition().duration(800)
  .attr('x', d => x(d.name))
  .attr('width', x.bandwidth())
  .attr('y', d => y(d.value))
  .attr('height', d => height - y(d.value))`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.d3-demo-container {
  padding-bottom: 24px;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 10px;
  overflow: hidden;
  
  :deep(svg) {
    font-family: inherit;
  }
}

.control-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
}

.control-group {
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--border-color);
  
  .group-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 10px 0;
    color: var(--text-primary);
  }
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  
  .el-button {
    margin: 0;
    width: 100%;
  }
}

.data-view-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
  @include custom-scrollbar;
  
  .data-item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background-color: var(--bg-color-primary);
    border-radius: 4px;
    border: 1px solid var(--border-color);
    
    .data-label {
      font-size: 0.82rem;
      color: var(--text-primary);
    }
  }
}

.font-bold {
  font-weight: 600;
}
</style>
