<template>
  <div class="d3-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>D3.js 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>矩形树图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>D3.js 嵌套矩形树图 (TreeMap)</h2>
      <p>展示具有树状结构层级比例的数据。通过 D3.js 层次布局器计算矩形坐标，用不同面积大小直观表达每个子节点在整体中所占的比重。</p>
    </div>

    <el-row :gutter="20">
      <!-- TreeMap Chart Render View -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="代码体积包占比分析 (Bundle Analyzer)" 
          description="悬浮矩形区域查看对应模块的绝对大小和占比，支持按大小或子项数量重绘"
          :code="treemapCode"
        >
          <div class="chart-wrapper" ref="chartContainer">
            <!-- SVG injected by D3 -->
          </div>
        </DemoCard>
      </el-col>

      <!-- Panel Control Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 布局器控制器</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">切换面积计算依据</h4>
            <el-radio-group v-model="sumCriterion" @change="drawTreeMap" class="w-full">
              <el-radio-button label="size">💾 模块体积 (KB)</el-radio-button>
              <el-radio-button label="count">📄 文件项数量</el-radio-button>
            </el-radio-group>
          </div>

          <div class="control-group">
            <h4 class="group-title">树图填充色系</h4>
            <el-select v-model="selectedColorScheme" @change="drawTreeMap" class="w-full">
              <el-option label="🎨 缤纷炫彩 (SchemeTableau10)" value="tableau" />
              <el-option label="🌌 冷感深邃 (SchemeCool)" value="cool" />
              <el-option label="🌅 温润莫兰迪 (SchemeWarm)" value="warm" />
            </el-select>
          </div>

          <div class="control-group">
            <h4 class="group-title">数据节点导航</h4>
            <div class="module-statistics">
              <div class="stat-item">
                <span class="label">项目总大小:</span>
                <span class="val">{{ totalSize }} KB</span>
              </div>
              <div class="stat-item">
                <span class="label">包含节点总数:</span>
                <span class="val">19 个文件</span>
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

// Control Reactive State
const sumCriterion = ref<'size' | 'count'>('size')
const selectedColorScheme = ref('tableau')
const totalSize = ref(0)

// Hierarchical dataset representing the Vue project bundle analyzer
interface TreeDataNode {
  name: string
  value?: number // file size in KB
  children?: TreeDataNode[]
}

const rawBundleData: TreeDataNode = {
  name: 'Root Bundle',
  children: [
    {
      name: 'views (页面)',
      children: [
        { name: 'ThreejsEarth.vue', value: 680 },
        { name: 'EchartsDashboard.vue', value: 450 },
        { name: 'D3ChinaMap.vue', value: 510 },
        { name: 'BasicComponents.vue', value: 240 },
        { name: 'TableDemo.vue', value: 160 },
        { name: 'FormDemo.vue', value: 180 },
        { name: 'CartStore.vue', value: 95 }
      ]
    },
    {
      name: 'components (组件)',
      children: [
        { name: 'AppSidebar.vue', value: 120 },
        { name: 'AppHeader.vue', value: 65 },
        { name: 'AppLayout.vue', value: 45 },
        { name: 'DemoCard.vue', value: 80 }
      ]
    },
    {
      name: 'assets (静态资源)',
      children: [
        { name: 'china.geojson', value: 380 },
        { name: 'variables.scss', value: 35 },
        { name: 'mixins.scss', value: 15 },
        { name: 'logo.png', value: 110 }
      ]
    },
    {
      name: 'router & stores (核心逻辑)',
      children: [
        { name: 'router/index.ts', value: 25 },
        { name: 'stores/app.ts', value: 10 },
        { name: 'stores/cart.ts', value: 15 },
        { name: 'main.ts', value: 8 }
      ]
    }
  ]
}

// D3 Elements
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>

const initChart = () => {
  if (!chartContainer.value) return

  // Reset
  d3.select(chartContainer.value).selectAll('svg').remove()

  const width = chartContainer.value.clientWidth
  const height = 400

  // 1. Create SVG
  svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 2. Draw
  drawTreeMap()
}

const drawTreeMap = () => {
  if (!chartContainer.value || !svg) return

  const width = chartContainer.value.clientWidth
  const height = 400

  // 1. Reset SVG children
  svg.selectAll('*').remove()

  // 2. Define Color Scale
  let colorScale: d3.ScaleOrdinal<string, string>
  
  if (selectedColorScheme.value === 'cool') {
    colorScale = d3.scaleOrdinal(d3.quantize(d3.interpolateCool, 8))
  } else if (selectedColorScheme.value === 'warm') {
    colorScale = d3.scaleOrdinal(d3.quantize(d3.interpolateWarm, 8))
  } else {
    colorScale = d3.scaleOrdinal(d3.schemeTableau10)
  }

  // 3. Create Root Hierarchy
  const root = d3.hierarchy<TreeDataNode>(rawBundleData)
    
  // 4. Sum according to selected criterion
  if (sumCriterion.value === 'size') {
    root.sum(d => d.value || 0)
    // Compute total sum size for panel report
    totalSize.value = root.value || 0
  } else {
    root.count()
  }

  // Sort nodes in decending order
  root.sort((a, b) => (b.value || 0) - (a.value || 0))

  // 5. Generate D3 Treemap coordinates
  d3.treemap<TreeDataNode>()
    .size([width, height])
    .padding(2)
    (root)

  // 6. Draw cell groups (filtering out root itself)
  const cells = svg.selectAll<SVGGElement, d3.HierarchyRectangularNode<TreeDataNode>>('g')
    .data(root.leaves() as d3.HierarchyRectangularNode<TreeDataNode>[])
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
    .attr('class', 'treemap-cell')

  // Append rect
  cells.append('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => {
      // Color by parent name to visually group modules
      const parentName = d.parent ? d.parent.data.name : 'Unknown'
      return colorScale(parentName)
    })
    .attr('rx', 3)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.5)
    .attr('opacity', 0.85)
    .on('mouseenter', function() {
      d3.select(this)
        .transition().duration(200)
        .attr('opacity', 1.0)
        .attr('stroke-width', 2)
        .attr('stroke', '#6366f1')
    })
    .on('mouseleave', function() {
      d3.select(this)
        .transition().duration(200)
        .attr('opacity', 0.85)
        .attr('stroke-width', 0.5)
        .attr('stroke', '#ffffff')
    })

  // Append node title text
  cells.append('text')
    .attr('x', 6)
    .attr('y', 18)
    .text(d => d.data.name)
    .style('font-size', '11px')
    .style('font-weight', '600')
    .style('fill', '#ffffff')
    .style('pointer-events', 'none')
    .attr('clip-path', (_, i) => `url(#clip-${i})`)

  // Append node value (size / count) text
  cells.append('text')
    .attr('x', 6)
    .attr('y', 32)
    .text(d => sumCriterion.value === 'size' ? `${d.value} KB` : '1 项')
    .style('font-size', '10px')
    .style('fill', '#f1f5f9')
    .style('opacity', 0.85)
    .style('pointer-events', 'none')
    .attr('clip-path', (_, i) => `url(#clip-${i})`)

  // Create clip path templates so text fits perfectly inside rect grids without overflow
  cells.append('clipPath')
    .attr('id', (_, i) => `clip-${i}`)
    .append('rect')
    .attr('width', d => Math.max(0, d.x1 - d.x0 - 4))
    .attr('height', d => Math.max(0, d.y1 - d.y0 - 4))

  // Append SVG title (native tooltips)
  cells.append('title')
    .text(d => {
      const percentage = root.value ? ((d.value || 0) / root.value * 100).toFixed(1) : 0
      return `文件: ${d.data.name}\n分类: ${d.parent?.data.name}\n大小: ${d.value} KB (${percentage}%)`
    })
}

// Handle window resizing
const handleResize = () => {
  if (!chartContainer.value || !svg) return
  const width = chartContainer.value.clientWidth
  svg.attr('width', width)
  drawTreeMap()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const treemapCode = `// D3.js TreeMap 核心坐标映射
import * as d3 from 'd3'

// 1. 生成树状层次结构对象
const root = d3.hierarchy(bundleData)

// 2. 根据体积或子节点数量累加值
root.sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value)

// 3. 定义 D3 树形图布局参数
const treemapLayout = d3.treemap()
  .size([width, height])
  .padding(2) // 单元格间距

// 4. 将布局坐标灌注计算回 root 节点
treemapLayout(root)

// 5. 渲染 leaves 叶子节点并绑定坐标
const cells = svg.selectAll('.cell')
  .data(root.leaves())
  .enter()
  .append('g')
  .attr('transform', d => \`translate(\${d.x0}, \${d.y0})\`)

cells.append('rect')
  .attr('width', d => d.x1 - d.x0)
  .attr('height', d => d.y1 - d.y0)
  .attr('fill', d => colorScale(d.parent.data.name))`
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
  overflow: hidden;
  
  :deep(.treemap-cell text) {
    font-family: monospace;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
}

.control-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
}

.control-group {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-color);
  
  .group-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-primary);
  }
}

.module-statistics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-color-primary);
    padding: 10px 14px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    
    .label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .val {
      font-size: 0.95rem;
      font-weight: 600;
      color: $primary-color;
      font-family: monospace;
    }
  }
}

.w-full {
  width: 100%;
}
</style>
