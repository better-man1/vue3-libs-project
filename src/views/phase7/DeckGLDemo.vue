<template>
  <div class="deckgl-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>🌐 3D & 地理</el-breadcrumb-item>
      <el-breadcrumb-item>Maplibre + deck.gl 进阶</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Maplibre GL & deck.gl — 十万级地理数据 GPU 渲染</h2>
      <p>利用 Maplibre GL 的高性能矢量底图与 deck.gl 渲染引擎的 WebGL2 硬件加速能力相结合。支持在 GPU 上并行计算并秒级渲染高达十万级的数据要素，本例展示全球流光航班线、3D 蜂窝聚合网络、以及高频城市散点动态脉冲效果。</p>
    </div>

    <!-- Map & Control Section -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="高性能 deck.gl WebGL2 渲染视口"
          description="按住右键并拖动鼠标可调整倾角 (Pitch) 与旋转角 (Bearing) 以查看 3D 六边形柱状拉伸高度。"
          :code="deckGLExampleCode"
        >
          <!-- Controls bar -->
          <div class="map-controls mb-3 flex flex-wrap justify-between items-center gap-2">
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-xs text-secondary font-bold">图层类型:</span>
              <el-radio-group v-model="activeLayerType" size="small" @change="onLayerTypeChange">
                <el-radio-button value="arcs">✈️ 全球航线 (Arc)</el-radio-button>
                <el-radio-button value="hexagon">⬡ 3D 蜂窝热力 (Hexagon)</el-radio-button>
                <el-radio-button value="scatter">📡 动态散点 (Scatter)</el-radio-button>
              </el-radio-group>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-secondary font-bold">要素数据量:</span>
              <el-select v-model="dataCount" size="small" style="width: 110px;" @change="onDataCountChange">
                <el-option label="1,000 条" :value="1000" />
                <el-option label="10,000 条" :value="10000" />
                <el-option label="50,000 条" :value="50000" />
                <el-option label="100,000 条" :value="100000" />
              </el-select>
              <el-button size="small" type="warning" plain @click="toggleRotation">
                {{ isRotating ? '⏸️ 停止旋转' : '🔄 自动旋转' }}
              </el-button>
            </div>
          </div>

          <!-- Map Container -->
          <div class="map-wrapper">
            <div id="deckgl-map-container" class="map-container-instance"></div>
            
            <!-- FPS and Camera HUD -->
            <div class="map-hud-overlay">
              <div class="hud-item"><span class="hud-label">真实帧率:</span> <span class="hud-value" :class="fpsClass">{{ currentFps }} FPS</span></div>
              <div class="hud-item"><span class="hud-label">渲染耗时:</span> <span class="hud-value">{{ renderTime.toFixed(1) }} ms</span></div>
              <div class="hud-item"><span class="hud-label">数据加载:</span> <span class="hud-value">{{ formatNumber(actualDataSize) }} 要素</span></div>
            </div>

            <!-- Hover Information Overlay -->
            <div class="map-tooltip-overlay" v-if="hoveredObject">
              <h4 class="tooltip-title">{{ hoveredObject.title }}</h4>
              <p class="tooltip-desc my-1">{{ hoveredObject.description }}</p>
              <p class="tooltip-coords m-0" v-if="hoveredObject.coords">位置: [{{ hoveredObject.coords[0].toFixed(4) }}, {{ hoveredObject.coords[1].toFixed(4) }}]</p>
            </div>
            
            <div class="map-tips text-xxs text-secondary">
              💡 鼠标滚轮缩放，按住鼠标右键拖拽调整 3D 俯视视角
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Config & Info Panels -->
      <el-col :xs="24" :lg="8">
        <!-- Dynamic Layer Properties Panel -->
        <el-card shadow="hover" class="info-card mb-4">
          <template #header>
            <div class="font-bold flex items-center gap-2">
              <span>⚙️ 图层效果参数调节</span>
            </div>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <!-- Arcs controls -->
            <div v-if="activeLayerType === 'arcs'" class="flex flex-col gap-4">
              <div class="control-item">
                <span class="control-label">流光动画速度:</span>
                <el-slider v-model="arcProps.speed" :min="0.1" :max="2.5" :step="0.1" style="width: 140px;" @input="updateLayers" />
              </div>
              <div class="control-item">
                <span class="control-label">航线宽度:</span>
                <el-slider v-model="arcProps.width" :min="1" :max="8" :step="0.5" style="width: 140px;" @input="updateLayers" />
              </div>
              <div class="control-item">
                <span class="control-label">发光色相:</span>
                <el-color-picker v-model="arcProps.primaryColor" size="small" @change="updateLayers" />
              </div>
              <div class="text-xxs text-info leading-relaxed">
                全球航线图利用 3D Arc 贝塞尔曲线算法计算源目标点轨迹。为展示动态流光，我们在主渲染循环中根据弧形倾角插值渲染了一层高亮度“飞行粒子”。
              </div>
            </div>

            <!-- Hexagon controls -->
            <div v-if="activeLayerType === 'hexagon'" class="flex flex-col gap-4">
              <div class="control-item">
                <span class="control-label">六边形半径 (米):</span>
                <el-slider v-model="hexProps.radius" :min="500" :max="8000" :step="100" style="width: 140px;" @input="updateLayers" />
              </div>
              <div class="control-item">
                <span class="control-label">拉伸高度比例:</span>
                <el-slider v-model="hexProps.elevationScale" :min="1" :max="100" :step="2" style="width: 140px;" @input="updateLayers" />
              </div>
              <div class="control-item">
                <span class="control-label">蜂窝不透明度:</span>
                <el-slider v-model="hexProps.opacity" :min="0.1" :max="1.0" :step="0.05" style="width: 140px;" @input="updateLayers" />
              </div>
              <div class="text-xxs text-info leading-relaxed">
                蜂窝热力图（HexagonLayer）是 deck.gl 的核心聚合图层。它在 GPU 上执行空间网格合并，将散点按照指定的地理半径进行 3D 柱体聚合渲染。柱子高度与颜色深浅直观地揭示了数据的局部密度。
              </div>
            </div>

            <!-- Scatter controls -->
            <div v-if="activeLayerType === 'scatter'" class="flex flex-col gap-4">
              <div class="control-item">
                <span class="control-label">基础散点半径 (米):</span>
                <el-slider v-model="scatterProps.radiusScale" :min="10" :max="500" :step="10" style="width: 140px;" @input="updateLayers" />
              </div>
              <div class="control-item">
                <span class="control-label">动态脉冲速度:</span>
                <el-slider v-model="scatterProps.pulseSpeed" :min="0.5" :max="3.0" :step="0.1" style="width: 140px;" @input="updateLayers" />
              </div>
              <div class="control-item">
                <span class="control-label">散点配色样式:</span>
                <el-select v-model="scatterProps.colorTheme" size="small" style="width: 120px;" @change="updateLayers">
                  <el-option label="🟢 激光翡翠" value="green" />
                  <el-option label="🔴 熔岩赛博" value="red" />
                  <el-option label="🔵 深邃幽蓝" value="blue" />
                </el-select>
              </div>
              <div class="text-xxs text-info leading-relaxed">
                动态散点图（ScatterplotLayer）使用着色器实例化渲染（Instanced Rendering）。每个点包含发光的半透明过渡边缘，配合主线程的时间变化插值半径，营造脉冲电磁波雷达检索特效。
              </div>
            </div>
          </div>
        </el-card>

        <!-- Technical Specs Card -->
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="font-bold">📚 deck.gl 超海量渲染奥秘</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2"><strong>1. WebGL2 与着色器实例化</strong><br/>传统地图库（如 Leaflet 或普通 Mapbox）在渲染 10 万个 SVG/DOM 节点时，会因主线程频繁回流（Reflow）与 DOM 开销导致页面直接卡死崩溃。deck.gl 将所有数据打包为 TypedArrays，通过<strong>实例化渲染（Instanced Rendering）</strong>，让 GPU 执行绘制，主线程开销几乎为零。</p>
            <p class="mb-2"><strong>2. 零网络载入策略</strong><br/>十万级经纬度坐标的 GeoJSON 静态文件体积超过 10MB。为防范网络加载阻塞，我们使用纯 CPU 随机矩阵数学分布（Concentric/Normal Distribution）算法，在客户端本地秒级计算并生成高密度的坐标集。</p>
            <p><strong>3. 深度分层叠加 (Custom Overlay)</strong><br/>通过 <code>MapboxOverlay</code> 将 deck.gl 独立层与 Maplibre GL 的 WebGL 渲染管线融为一体，共享同一个相机矩阵与深度缓冲区（Depth Buffer），确保了 3D 视角偏航、翻转与缩放时的绝对同步。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'

// Import Maplibre GL
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Import deck.gl elements
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers'
import { HexagonLayer } from '@deck.gl/aggregation-layers'

// UI state
const activeLayerType = ref<'arcs' | 'hexagon' | 'scatter'>('arcs')
const dataCount = ref<number>(10000)
const isRotating = ref<boolean>(false)
const hoveredObject = ref<any>(null)

// Performance states
const currentFps = ref<number>(60)
const renderTime = ref<number>(0)
const actualDataSize = ref<number>(10000)

// Layer parameters
const arcProps = ref({
  speed: 1.0,
  width: 2.0,
  primaryColor: '#39ff14' // neon green
})

const hexProps = ref({
  radius: 1200,
  elevationScale: 30,
  opacity: 0.8
})

const scatterProps = ref({
  radiusScale: 80,
  pulseSpeed: 1.5,
  colorTheme: 'green'
})

// Instances
let map: maplibregl.Map | null = null
let deckOverlay: MapboxOverlay | null = null
let animationFrameId: number | null = null
let rotationAngle = 0
let lastFpsUpdateTime = 0
let frameCount = 0

// Raw data storage
let cachedFlightData: any[] = []
let cachedPointData: any[] = []

// Target Airport Hubs Coordinates [lng, lat]
const AIRPORTS = [
  { name: '北京首都国际机场 (PEK)', coords: [116.6033, 40.0801] },
  { name: '上海浦东国际机场 (PVG)', coords: [121.8083, 31.1443] },
  { name: '东京羽田国际机场 (HND)', coords: [139.7798, 35.5494] },
  { name: '伦敦希思罗机场 (LHR)', coords: [-0.4614, 51.4700] },
  { name: '纽约肯尼迪国际机场 (JFK)', coords: [-73.7781, 40.6413] },
  { name: '旧金山国际机场 (SFO)', coords: [-122.3790, 37.6213] },
  { name: '巴黎戴高乐机场 (CDG)', coords: [2.5500, 49.0097] },
  { name: '悉尼金斯福德·史密斯机场 (SYD)', coords: [151.1772, -33.9461] },
  { name: '迪拜国际机场 (DXB)', coords: [55.3644, 25.2532] },
  { name: '新加坡樟宜机场 (SIN)', coords: [103.9915, 1.3644] },
  { name: '莫斯科谢列梅捷沃机场 (SVO)', coords: [37.4146, 55.9726] },
  { name: '洛杉矶国际机场 (LAX)', coords: [-118.4085, 33.9416] }
]

// ─── Generate flight routes (For ArcLayer) ─────────────────────────────
const generateFlights = (count: number) => {
  const data = []
  const start = performance.now()
  
  for (let i = 0; i < count; i++) {
    // Pick two random airports
    const idxA = Math.floor(Math.random() * AIRPORTS.length)
    let idxB = Math.floor(Math.random() * AIRPORTS.length)
    while (idxA === idxB) {
      idxB = Math.floor(Math.random() * AIRPORTS.length)
    }
    
    const fromAir = AIRPORTS[idxA]
    const toAir = AIRPORTS[idxB]
    
    // Add jitter to create beautiful thick route bundles
    const jitter = () => (Math.random() - 0.5) * 1.5
    
    data.push({
      id: i,
      fromName: fromAir.name,
      toName: toAir.name,
      source: [fromAir.coords[0] + jitter(), fromAir.coords[1] + jitter()],
      target: [toAir.coords[0] + jitter(), toAir.coords[1] + jitter()],
      // Random phase offset for dash flow animation
      phase: Math.random() * Math.PI * 2,
      progress: Math.random() // Normalized dynamic progress marker [0..1]
    })
  }
  
  renderTime.value = performance.now() - start
  return data
}

// ─── Generate dense point clusters (For Hexagon/Scatter) ──────────────
const generatePoints = (count: number) => {
  const data = []
  const start = performance.now()
  
  // Center clusters around China (Beijing/Shanghai) and Europe (London/Paris)
  const centers = [
    [121.4737, 31.2304], // Shanghai
    [116.4074, 39.9042], // Beijing
    [-0.1278, 51.5074],  // London
    [103.8198, 1.3521],  // Singapore
    [-74.0060, 40.7128]  // New York
  ]
  
  for (let i = 0; i < count; i++) {
    const center = centers[i % centers.length]
    
    // Generate concentric layout: polar coordinates for cluster shapes
    const r = Math.pow(Math.random(), 2.5) * 12.0 // Exponential decay for dense core
    const theta = Math.random() * Math.PI * 2
    
    const lng = center[0] + r * Math.cos(theta)
    const lat = center[1] + r * Math.sin(theta) * 0.8
    
    data.push({
      id: i,
      position: [lng, lat],
      // Dynamic pulsing radius parameter
      pulseOffset: Math.random() * Math.PI * 2
    })
  }
  
  renderTime.value = performance.now() - start
  return data
}

// ─── Color Helper (HEX to RGB) ──────────────────────────────────────
const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.replace('#', ''), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

// ─── Create deck.gl Layers ──────────────────────────────────────────
const createDeckLayers = (time: number) => {
  const primaryRgb = hexToRgb(arcProps.value.primaryColor)
  
  if (activeLayerType.value === 'arcs') {
    // Update flight particle progress
    const speedCoeff = arcProps.value.speed * 0.005
    const animatedFlights = cachedFlightData.map(f => {
      let progress = f.progress + speedCoeff
      if (progress > 1.0) progress = 0.0
      return { ...f, progress }
    })
    cachedFlightData = animatedFlights // Cache to sustain animation continuity

    return [
      // 1. Static Arc Curves
      new ArcLayer({
        id: 'flight-arcs',
        data: cachedFlightData,
        pickable: true,
        getWidth: arcProps.value.width,
        getSourcePosition: (d: any) => d.source,
        getTargetPosition: (d: any) => d.target,
        getSourceColor: primaryRgb.concat([80]) as [number, number, number, number],
        getTargetColor: [255, 0, 128, 80],
        onHover: ((info: any) => {
          if (info.object) {
            const obj = info.object as any
            hoveredObject.value = {
              title: '✈️ 模拟航班航线',
              description: `${obj.fromName.split(' ')[0]} ➔ ${obj.toName.split(' ')[0]}`,
              coords: obj.source
            }
          } else {
            hoveredObject.value = null
          }
        }) as any,
        updateTriggers: {
          getWidth: [arcProps.value.width],
          getSourceColor: [arcProps.value.primaryColor]
        }
      }),

      // 2. Glowing Animated Flight Dots
      new ScatterplotLayer({
        id: 'flight-particles',
        data: cachedFlightData,
        pickable: false,
        getPosition: (d: any) => {
          // Linear interpolation along flight curve
          const p = d.progress
          const lng = d.source[0] * (1 - p) + d.target[0] * p
          const lat = d.source[1] * (1 - p) + d.target[1] * p
          return [lng, lat]
        },
        getRadius: 80000,
        radiusMinPixels: 2.5,
        radiusMaxPixels: 6.0,
        getFillColor: [255, 255, 255, 220],
        updateTriggers: {
          getPosition: [time]
        }
      })
    ]
  }

  if (activeLayerType.value === 'hexagon') {
    return [
      new HexagonLayer({
        id: 'heatmap-hexagon',
        data: cachedPointData,
        pickable: true,
        extruded: true, // 3D Extrusion Enable
        radius: hexProps.value.radius,
        elevationScale: hexProps.value.elevationScale,
        elevationRange: [0, 500],
        getPosition: (d: any) => d.position,
        opacity: hexProps.value.opacity,
        // Color scale (RGB array list from low density to high density)
        colorRange: [
          [1, 152, 189],
          [73, 227, 206],
          [216, 254, 181],
          [254, 237, 177],
          [254, 173, 84],
          [209, 55, 78]
        ],
        onHover: ((info: any) => {
          if (info.object) {
            const obj = info.object as any
            hoveredObject.value = {
              title: '⬡ 六边形空间聚合网格',
              description: `区域聚集要素数: ${obj.points.length} 个`,
              coords: obj.centroid
            }
          } else {
            hoveredObject.value = null
          }
        }) as any,
        updateTriggers: {
          radius: [hexProps.value.radius],
          elevationScale: [hexProps.value.elevationScale],
          opacity: [hexProps.value.opacity]
        }
      })
    ]
  }

  if (activeLayerType.value === 'scatter') {
    // Compute scatter dynamic colors based on configuration theme
    let baseColor: [number, number, number] = [0, 255, 128] // green default
    if (scatterProps.value.colorTheme === 'red') baseColor = [255, 60, 0]
    if (scatterProps.value.colorTheme === 'blue') baseColor = [0, 180, 255]

    return [
      new ScatterplotLayer({
        id: 'scatter-nodes',
        data: cachedPointData,
        pickable: true,
        getPosition: (d: any) => d.position,
        // Pulsate radius scale using time sine wave
        getRadius: (d: any) => {
          const t = time * 0.003 * scatterProps.value.pulseSpeed + d.pulseOffset
          const pulse = (Math.sin(t) + 1) * 0.5 // scale factor [0..1]
          return scatterProps.value.radiusScale * (0.4 + pulse * 0.6)
        },
        radiusMinPixels: 2,
        radiusMaxPixels: 12,
        getFillColor: (d: any) => {
          const t = time * 0.003 * scatterProps.value.pulseSpeed + d.pulseOffset
          const alpha = Math.floor((Math.sin(t) + 1.2) * 80) // animated transparency
          return baseColor.concat([alpha]) as [number, number, number, number]
        },
        getLineColor: baseColor.concat([240]) as [number, number, number, number],
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 2.5,
        stroked: true,
        filled: true,
        onHover: ((info: any) => {
          if (info.object) {
            const obj = info.object as any
            hoveredObject.value = {
              title: '📡 动态传感器散点要素',
              description: `散点 ID: #${obj.id}`,
              coords: obj.position
            }
          } else {
            hoveredObject.value = null
          }
        }) as any,
        updateTriggers: {
          getRadius: [time, scatterProps.value.radiusScale, scatterProps.value.pulseSpeed],
          getFillColor: [time, scatterProps.value.colorTheme, scatterProps.value.pulseSpeed],
          getLineColor: [scatterProps.value.colorTheme]
        }
      })
    ]
  }

  return []
}

// ─── Data State Handler ─────────────────────────────────────────────
const syncDataSize = () => {
  if (activeLayerType.value === 'arcs') {
    cachedFlightData = generateFlights(dataCount.value)
    actualDataSize.value = cachedFlightData.length
  } else {
    cachedPointData = generatePoints(dataCount.value)
    actualDataSize.value = cachedPointData.length
  }
}

const onLayerTypeChange = () => {
  syncDataSize()
  updateLayers()
  // Adjust camera to fit target dataset layouts
  if (map) {
    if (activeLayerType.value === 'arcs') {
      map.easeTo({
        center: [30, 20],
        zoom: 1.2,
        pitch: 25,
        bearing: 0,
        duration: 1500
      })
    } else if (activeLayerType.value === 'hexagon') {
      map.easeTo({
        center: [121.4737, 31.2304], // Shanghai
        zoom: 9.8,
        pitch: 58,
        bearing: -20,
        duration: 1500
      })
    } else {
      map.easeTo({
        center: [116.4074, 39.9042], // Beijing
        zoom: 8.5,
        pitch: 45,
        bearing: 10,
        duration: 1500
      })
    }
  }
}

const onDataCountChange = () => {
  syncDataSize()
  updateLayers()
}

// ─── Update Layers inside Overlay ───────────────────────────────────
const updateLayers = () => {
  if (deckOverlay) {
    const time = performance.now()
    deckOverlay.setProps({
      layers: createDeckLayers(time)
    })
  }
}

// ─── Auto Camera Rotation ──────────────────────────────────────────
const toggleRotation = () => {
  isRotating.value = !isRotating.value
}

// ─── Rendering Core Frame Cycle ────────────────────────────────────
const renderLoop = (time: number) => {
  if (!map) return

  // Calculate FPS (frame rate updates every 500ms)
  frameCount++
  if (time - lastFpsUpdateTime >= 500) {
    const delta = time - lastFpsUpdateTime
    currentFps.value = Math.min(60, Math.round((frameCount * 1000) / delta))
    frameCount = 0
    lastFpsUpdateTime = time
  }

  // Camera auto rotation
  if (isRotating.value) {
    rotationAngle = (rotationAngle + 0.1) % 360
    map.setBearing(rotationAngle)
  }

  // Force deck.gl dynamic layers update (for flight moving particles or radar pulse scatter)
  if (activeLayerType.value === 'arcs' || activeLayerType.value === 'scatter') {
    updateLayers()
  }

  animationFrameId = requestAnimationFrame(renderLoop)
}

// ─── Map Lifecycle Mount ───────────────────────────────────────────
onMounted(() => {
  syncDataSize()

  // Initialize Maplibre GL Dark Theme Map
  map = new maplibregl.Map({
    container: 'deckgl-map-container',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [30, 20],
    zoom: 1.2,
    pitch: 25,
    bearing: 0
  })

  // Create deck.gl custom overlay
  deckOverlay = new MapboxOverlay({
    layers: createDeckLayers(0)
  })

  // Hook deck.gl overlay control onto maplibre instance
  map.addControl(deckOverlay as any)

  map.on('load', () => {
    // Start animation frame loop
    lastFpsUpdateTime = performance.now()
    animationFrameId = requestAnimationFrame(renderLoop)
  })
})

// ─── Map Lifecycle Cleanup ─────────────────────────────────────────
onBeforeUnmount(() => {
  // Cancel render cycle loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // Remove deck overlay control
  if (map && deckOverlay) {
    map.removeControl(deckOverlay as any)
    deckOverlay = null
  }

  // Completely destroy map instance to release WebGL canvas memory
  if (map) {
    map.remove()
    map = null
  }
})

// ─── Utility Formatting Helpers ─────────────────────────────────────
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\n))/g, ',')
}

const fpsClass = computed(() => {
  if (currentFps.value >= 50) return 'text-success'
  if (currentFps.value >= 30) return 'text-warning'
  return 'text-danger'
})

// Code display mock for demo card preview
const deckGLExampleCode = `
<template>
  <div id="deckgl-map-container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ArcLayer, HexagonLayer, ScatterplotLayer } from 'deck.gl'

let map = null
let deckOverlay = null

onMounted(() => {
  // Initialize maplibre map
  map = new maplibregl.Map({
    container: 'deckgl-map-container',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [121.4737, 31.2304],
    zoom: 9.8,
    pitch: 58
  })

  // Initialize deck.gl MapboxOverlay
  deckOverlay = new MapboxOverlay({
    layers: [
      new HexagonLayer({
        id: 'heatmap-hexagon',
        data: pointData, // 100,000 dense coordinate items
        extruded: true,
        radius: 1200,
        elevationScale: 30,
        getPosition: d => d.position,
        opacity: 0.8
      })
    ]
  })

  // Bind overlay with Maplibre GL
  map.addControl(deckOverlay)
})

onBeforeUnmount(() => {
  if (map && deckOverlay) {
    map.removeControl(deckOverlay)
  }
  if (map) {
    map.remove()
  }
})
<\/script>
`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.deckgl-demo-container {
  padding-bottom: 24px;
}

.map-controls {
  padding: 8px 12px;
  background: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.map-wrapper {
  width: 100%;
  height: 520px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
}

.map-container-instance {
  width: 100%;
  height: 100%;
}

/* Floating overlay camera/performance hud */
.map-hud-overlay {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 160px;
  background: rgba(18, 18, 24, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .hud-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7rem;
    color: #a0aec0;
  }

  .hud-label {
    font-weight: 500;
  }

  .hud-value {
    font-weight: 700;
    color: #edf2f7;

    &.text-success {
      color: #39ff14 !important;
      text-shadow: 0 0 4px rgba(57, 255, 20, 0.4);
    }
    &.text-warning {
      color: #ecc94b !important;
    }
    &.text-danger {
      color: #f56c6c !important;
    }
  }
}

/* Tooltip detail overlay */
.map-tooltip-overlay {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 220px;
  background: rgba(18, 18, 24, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  z-index: 10;
  pointer-events: none;

  .tooltip-title {
    font-size: 0.78rem;
    color: #edf2f7;
    margin: 0;
    font-weight: 700;
  }

  .tooltip-desc {
    font-size: 0.72rem;
    color: #a0aec0;
  }

  .tooltip-coords {
    font-size: 0.65rem;
    color: #718096;
    font-family: monospace;
  }
}

.map-tips {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 20px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.flex {
  display: flex;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-2 {
  gap: 8px;
}
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.my-1 {
  margin-top: 4px;
  margin-bottom: 4px;
}
.m-0 {
  margin: 0;
}
.text-xxs {
  font-size: 0.68rem;
}
.text-xs {
  font-size: 0.75rem;
}
.font-bold {
  font-weight: 700;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .control-label {
    font-weight: 500;
  }
}

.text-info {
  background: rgba(var(--el-color-info-rgb), 0.1);
  border-radius: 6px;
  padding: 8px 10px;
  border-left: 3px solid var(--el-color-info);
  margin-top: 12px;
}
</style>
