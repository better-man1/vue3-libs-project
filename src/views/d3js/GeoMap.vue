<template>
  <div class="d3-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>D3.js 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>中国省份地图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>D3.js 中国省份地图投影</h2>
      <p>认识地理坐标系与墨卡托投影 (GeoMercator)。通过 D3 地理路径生成器 (GeoPath) 将 GeoJSON 拓扑多边形转换为 SVG 路径，并对各省虚拟指标进行热力映射与过渡重绘。</p>
    </div>

    <el-row :gutter="20">
      <!-- D3 Map Viewport -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="中国低多边形热力地图 (Low-Poly Hotspot Map)" 
          description="鼠标滑过省份多边形查看交互悬浮窗。点击省份将在右侧控制台锁定观测数据。"
          :code="geoMapCode"
        >
          <div class="chart-wrapper" ref="chartContainer">
            <!-- D3 will render the SVG map here -->
            <div 
              v-if="hoveredProvince" 
              class="map-tooltip"
              :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
            >
              <div class="tooltip-title">{{ hoveredProvince.properties.name }}</div>
              <div class="tooltip-body">
                <p>发展指数: <span class="val">{{ hoveredProvince.properties.value }}</span></p>
                <p>虚拟 GDP: <span class="val">{{ hoveredProvince.properties.gdp }}</span></p>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Panel Control Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 地理数据控制台</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">地图热力配置</h4>
            <div class="control-item">
              <span class="label">切换热力色系:</span>
              <el-select v-model="selectedTheme" @change="updateMapColors" class="w-full">
                <el-option label="🌌 经典极光蓝 (Indigo - Cyber)" value="indigo" />
                <el-option label="🌲 生机丛林绿 (Emerald - Health)" value="emerald" />
                <el-option label="🔥 炽热熔岩橙 (Amber - Warm)" value="amber" />
              </el-select>
            </div>
            <el-button type="primary" class="w-full mt-2" @click="randomizeMapData">
              🔀 随机刷新省份发展数据
            </el-button>
          </div>

          <div class="control-group">
            <h4 class="group-title">锁定观测区域</h4>
            <div v-if="selectedProvince" class="province-detail-box">
              <h3 class="prov-title">{{ selectedProvince.properties.name }}</h3>
              <div class="detail-row">
                <span class="label">省份坐标中心:</span>
                <span class="val">{{ formatCentroid(selectedProvince) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">综合指数:</span>
                <span class="val highlighted">{{ selectedProvince.properties.value }}</span>
              </div>
              <div class="detail-row">
                <span class="label">模拟GDP:</span>
                <span class="val">{{ selectedProvince.properties.gdp }}</span>
              </div>
              <el-button size="small" type="info" plain class="w-full mt-2" @click="selectedProvince = null">
                清除选择
              </el-button>
            </div>
            <div v-else class="province-empty-tip">
              点击地图中的省份区域，在此处锁定详细指标
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import chinaData from '@/assets/data/china.json'
import DemoCard from '@/components/common/DemoCard.vue'

// DOM Reference
const chartContainer = ref<HTMLDivElement | null>(null)

// Control state
const selectedTheme = ref('indigo')
const hoveredProvince = ref<any>(null)
const selectedProvince = ref<any>(null)
const tooltipPos = reactive({ x: 0, y: 0 })

// Type casting and deep cloning for GeoJSON to prevent mutating read-only asset
const geojson: any = JSON.parse(JSON.stringify(chinaData))

// Rewind GeoJSON polygons to counter-clockwise winding order for D3 spherical projection compatibility
const rewindGeoJSON = (data: any) => {
  data.features.forEach((feature: any) => {
    if (feature.geometry && feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach((ring: any[]) => {
        let sum = 0
        for (let i = 0; i < ring.length - 1; i++) {
          const p1 = ring[i]
          const p2 = ring[i + 1]
          sum += (p2[0] - p1[0]) * (p2[1] + p1[1])
        }
        if (sum < 0) {
          ring.reverse()
        }
      })
    }
  })
}
rewindGeoJSON(geojson)

// Format centroid coordinate output
const formatCentroid = (feature: any) => {
  if (!feature) return ''
  try {
    const centroid = d3.geoCentroid(feature)
    const lng = centroid[0].toFixed(1)
    const lat = centroid[1].toFixed(1)
    return `东经 ${lng}°E, 北纬 ${lat}°N`
  } catch (e) {
    return '计算中...'
  }
}

// SVG D3 variables
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
let mapPaths: d3.Selection<SVGPathElement, any, SVGGElement, unknown>

// Initialize Chart
const initChart = () => {
  if (!chartContainer.value) return

  // Reset
  d3.select(chartContainer.value).selectAll('svg').remove()

  const width = chartContainer.value.clientWidth
  const height = 440

  // 1. Create SVG
  svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 2. Set projection & Path Generator
  // Center near [104, 35] is standard for China maps
  const projection = d3.geoMercator()
    .center([105, 36])
    .scale(420) // Scale to fit screen
    .translate([width / 2, height / 2])

  const pathGenerator = d3.geoPath().projection(projection)

  // 3. Render map group
  const g = svg.append('g').attr('class', 'map-group')

  // Get color scale
  const colorScale = getColorScale()

  // 4. Draw province paths
  mapPaths = g.selectAll<SVGPathElement, any>('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', pathGenerator as any)
    .attr('class', 'province-path')
    .attr('fill', (d: any) => colorScale(d.properties.value))
    .attr('stroke', 'var(--border-color)')
    .attr('stroke-width', 1)
    .attr('cursor', 'pointer')
    .on('mouseenter', handleMouseEnter)
    .on('mousemove', handleMouseMove)
    .on('mouseleave', handleMouseLeave)
    .on('click', handleProvinceClick)
}

// Generate color scale based on theme
const getColorScale = (): d3.ScaleLinear<string, string> => {
  const minVal = 30
  const maxVal = 100

  switch (selectedTheme.value) {
    case 'emerald':
      return d3.scaleLinear<string>()
        .domain([minVal, maxVal])
        .range(['#022c22', '#10b981']) // Dark emerald to bright emerald
    case 'amber':
      return d3.scaleLinear<string>()
        .domain([minVal, maxVal])
        .range(['#451a03', '#f59e0b']) // Dark brown-orange to amber yellow
    case 'indigo':
    default:
      return d3.scaleLinear<string>()
        .domain([minVal, maxVal])
        .range(['#0f172a', '#6366f1']) // Dark slate to Indigo
  }
}

// Re-map colors on theme change
const updateMapColors = () => {
  if (!mapPaths) return
  const colorScale = getColorScale()
  
  mapPaths.transition()
    .duration(500)
    .attr('fill', d => colorScale(d.properties.value))
}

// Randomize values and update map with smooth transitions
const randomizeMapData = () => {
  geojson.features.forEach((feat: any) => {
    feat.properties.value = Math.floor(35 + Math.random() * 63)
  })

  // Trigger repaint with D3 transition
  const colorScale = getColorScale()
  mapPaths.transition()
    .duration(800)
    .attr('fill', d => colorScale(d.properties.value))

  // Update selected info if active
  if (selectedProvince.value) {
    const updated = geojson.features.find((f: any) => f.properties.name === selectedProvince.value.properties.name)
    if (updated) selectedProvince.value = updated
  }
}

// Interactive handlers
const handleMouseEnter = (event: any, d: any) => {
  hoveredProvince.value = d
  
  // Highlight boundary
  d3.select(event.currentTarget)
    .transition().duration(150)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .style('opacity', 0.95)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!chartContainer.value) return
  const rect = chartContainer.value.getBoundingClientRect()
  
  // Position tooltip relative to mouse
  tooltipPos.x = event.clientX - rect.left + 15
  tooltipPos.y = event.clientY - rect.top - 65
}

const handleMouseLeave = (event: any) => {
  hoveredProvince.value = null
  
  // Revert border
  d3.select(event.currentTarget)
    .transition().duration(150)
    .attr('stroke', 'var(--border-color)')
    .attr('stroke-width', 1)
    .style('opacity', 1.0)
}

const handleProvinceClick = (event: any, d: any) => {
  selectedProvince.value = d
  
  // Flash effect on clicked node
  d3.select(event.currentTarget)
    .attr('fill', '#ffffff')
    .transition().duration(300)
    .attr('fill', getColorScale()(d.properties.value))
}

// Layout size adjustment
const handleResize = () => {
  if (!chartContainer.value || !svg) return
  const width = chartContainer.value.clientWidth
  const height = 440

  svg.attr('width', width)
  
  const projection = d3.geoMercator()
    .center([105, 36])
    .scale(420)
    .translate([width / 2, height / 2])

  const pathGenerator = d3.geoPath().projection(projection)
  mapPaths.attr('d', pathGenerator as any)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const geoMapCode = `// D3 中国省份地图投影绘制核心逻辑
import * as d3 from 'd3'
import chinaData from '@/assets/data/china.json'

// 1. 初始化投影与路径生成器
const projection = d3.geoMercator()
  .center([105, 36])                      // 中国地理中心经纬度附近
  .scale(420)                            // 地图缩放倍数
  .translate([width / 2, height / 2])     // 平移至画布中心

const pathGenerator = d3.geoPath().projection(projection)

// 2. 映射颜色热力比例尺
const colorScale = d3.scaleLinear<string>()
  .domain([30, 100])
  .range(['#0f172a', '#6366f1'])          // Slate-900 渐变至 Indigo-500

// 3. 渲染绘制 SVG Paths
svg.select('.map-group')
  .selectAll('path')
  .data(chinaData.features)
  .enter()
  .append('path')
  .attr('d', pathGenerator)
  .attr('fill', d => colorScale(d.properties.value))
  .attr('stroke', 'var(--border-color)')
  .on('mouseenter', function() {
    d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2)
  })`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.d3-demo-container {
  padding-bottom: 24px;
}

.chart-wrapper {
  width: 100%;
  height: 440px;
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  position: relative;
  
  :deep(.province-path) {
    transition: fill 0.4s, opacity 0.2s;
  }
}

.map-tooltip {
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  min-width: 130px;
  
  .tooltip-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  .tooltip-body {
    p {
      margin: 2px 0;
      font-size: 0.78rem;
      color: var(--text-secondary);
      
      .val {
        font-family: monospace;
        color: #38bdf8;
        font-weight: 600;
      }
    }
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

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.province-detail-box {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  
  .prov-title {
    margin: 0 0 10px 0;
    font-size: 1.05rem;
    color: $primary-color;
    font-weight: 600;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    margin-bottom: 6px;
    
    .label {
      color: var(--text-secondary);
    }
    
    .val {
      color: var(--text-primary);
      font-family: monospace;
      
      &.highlighted {
        color: #eab308;
        font-weight: 600;
      }
    }
  }
}

.province-empty-tip {
  text-align: center;
  padding: 24px 12px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  border: 1px dashed var(--border-color);
  border-radius: 6px;
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 8px;
}
</style>
