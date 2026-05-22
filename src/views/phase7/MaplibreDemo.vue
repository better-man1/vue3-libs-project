<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>计算与空间</el-breadcrumb-item>
      <el-breadcrumb-item>Maplibre GL 3D地图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Maplibre GL — 高性能 WebGL 3D 矢量地图与数据拉伸</h2>
      <p>学习使用 Maplibre GL (Mapbox GL 的开源分支) 渲染矢量切片地图。通过自定义 GeoJSON 面要素数据，构建 3D 城市建筑高度拉伸 (fill-extrusion) 特效，并实现平滑的 3D 视角飞行切换。</p>
    </div>

    <!-- Map Area -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="WebGL 交互式 3D 城市沙盘"
          description="按住右键并拖动鼠标可调整倾角 (Pitch) 与旋转角 (Bearing)。"
          :code="maplibreExampleCode"
        >
          <!-- Controls bar -->
          <div class="map-controls mb-3 flex flex-wrap justify-between items-center gap-2">
            <div class="flex gap-2">
              <el-button-group size="small">
                <el-button type="primary" @click="flyToLocation('beijing')">📍 飞往北京</el-button>
                <el-button type="primary" @click="flyToLocation('shanghai')">📍 飞往上海</el-button>
                <el-button type="primary" @click="flyToLocation('hangzhou')">📍 飞往杭州</el-button>
              </el-button-group>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-secondary font-bold">主题底图:</span>
              <el-select v-model="currentStyle" size="small" style="width: 120px;" @change="changeMapStyle">
                <el-option label="🌑 暗黑霓虹" value="dark" />
                <el-option label="❄️ 亮白极简" value="light" />
                <el-option label="🌌 经典航线" value="voyager" />
              </el-select>
              <el-button size="small" type="warning" plain @click="toggleRotation">
                {{ isRotating ? '⏸️ 停止自动旋转' : '🔄 开启自动旋转' }}
              </el-button>
            </div>
          </div>

          <!-- Map Container -->
          <div class="map-wrapper">
            <div id="maplibre-container" class="map-container-instance"></div>
            
            <!-- Map Overlay Info Panel -->
            <div class="map-overlay-card" v-if="hoveredBuilding">
              <h4 class="text-primary font-bold text-xs">🏢 {{ hoveredBuilding.name }}</h4>
              <p class="text-secondary text-xxs my-1">高度: {{ hoveredBuilding.height }}m</p>
              <p class="text-secondary text-xxs m-0">功能: {{ hoveredBuilding.purpose }}</p>
            </div>
            
            <div class="map-tips text-xxs text-secondary">
              💡 鼠标滚轮缩放，按住鼠标右键拖拽调整 3D 俯视视角
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Information Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="font-bold">🏙️ 3D 建筑物数据规格</div>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2">我们在此坐标区下注入了自定义 3D 特区数据，使用 <code>fill-extrusion</code> 图层渲染：</p>
            
            <ul class="data-spec-list mb-3">
              <li><strong>Antigravity Tower</strong>: 280米 (研发主楼)</li>
              <li><strong>Gemini Data Hub</strong>: 210米 (数据中心)</li>
              <li><strong>DeepMind Lab</strong>: 160米 (研究基地)</li>
              <li><strong>Shiki Tech Center</strong>: 120米 (科技孵化)</li>
            </ul>

            <el-divider />

            <div class="flex justify-between items-center">
              <span>动态拉伸高度调整：</span>
              <el-slider v-model="heightScale" :min="0.5" :max="2.5" :step="0.1" style="width: 140px;" @input="updateHeights" />
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <span class="font-bold">💡 WebGL 空间地图优化</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2"><strong>1. WebGL 性能开销</strong><br/>Maplibre GL 利用 GPU 渲染矢量切片，相较于 Leaflet.js 的 DOM/Canvas 混合渲染，能够处理数十万级别的数据元素并保持 60 帧。但移动端需注意防范内存溢出，应当在 <code>onBeforeUnmount</code> 阶段调用 <code>map.remove()</code>。</p>
            <p class="mb-2"><strong>2. 3D 挤压 (Extrusion)</strong><br/>使用 <code>fill-extrusion</code> 需要要素中包含高度字段。可结合 <code>['get', 'property']</code> 表达式实时动态拉伸。</p>
            <p><strong>3. 地理坐标系</strong><br/>Maplibre 使用墨卡托投影。经纬度以 <code>[lng, lat]</code> 数组排列，与 Leaflet 或某些国内地图（如高德使用 gcj02 坐标）的序列格式及偏移有区别。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'

// Import Maplibre GL
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// States
const currentStyle = ref('dark')
const isRotating = ref(false)
const heightScale = ref(1.0)
const hoveredBuilding = ref<any>(null)

let map: maplibregl.Map | null = null
let animationFrameId: number | null = null

// Style mapping
const styleUrls: Record<string, string> = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
}

// Target cities coordinates [lng, lat]
const locations = {
  beijing: { center: [116.3974, 39.9082] as [number, number], zoom: 15.5, pitch: 60, bearing: -10 },
  shanghai: { center: [121.4737, 31.2304] as [number, number], zoom: 15, pitch: 55, bearing: 45 },
  hangzhou: { center: [120.1535, 30.2874] as [number, number], zoom: 14.5, pitch: 50, bearing: -30 }
}

// ─── Custom 3D building GeoJSON Data ──────────────────────────────────
// Centered around Beijing Tiananmen area (116.3974, 39.9082) for direct observation
const mockBuildings = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 1, name: 'Antigravity Tower (AG总部)', height: 280, base: 0, purpose: '核心算法研发总部' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.3940, 39.9060],
          [116.3960, 39.9060],
          [116.3960, 39.9075],
          [116.3940, 39.9075],
          [116.3940, 39.9060]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 2, name: 'Gemini Data Hub (数据中枢)', height: 210, base: 0, purpose: '高吞吐量算力交换池' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.3990, 39.9060],
          [116.4010, 39.9060],
          [116.4010, 39.9075],
          [116.3990, 39.9075],
          [116.3990, 39.9060]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 3, name: 'DeepMind Lab (脑机芯片研发所)', height: 160, base: 0, purpose: '生物智能及超级神经网络室' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.3950, 39.9090],
          [116.3970, 39.9090],
          [116.3970, 39.9102],
          [116.3950, 39.9102],
          [116.3950, 39.9090]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 4, name: 'Shiki Tech Center (科技转化基地)', height: 120, base: 0, purpose: '前端及浏览器内核适配区' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.3985, 39.9090],
          [116.4005, 39.9090],
          [116.4005, 39.9102],
          [116.3985, 39.9102],
          [116.3985, 39.9090]
        ]]
      }
    }
  ]
}

// ─── Initialize Maplibre ──────────────────────────────────────────────
onMounted(() => {
  map = new maplibregl.Map({
    container: 'maplibre-container',
    style: styleUrls.dark,
    center: locations.beijing.center,
    zoom: 14.5,
    pitch: 55,
    bearing: -15
  })

  // Load custom 3D building models when style is loaded
  map.on('style.load', () => {
    add3DLayer()
  })

  // Map rotation loop function
  const rotateCamera = () => {
    if (isRotating.value && map) {
      map.rotateTo((map.getBearing() + 0.1) % 360, { duration: 0 })
      animationFrameId = requestAnimationFrame(rotateCamera)
    }
  }

  // Bind mouse hover event
  map.on('mousemove', '3d-buildings-layer', (e) => {
    if (e.features && e.features.length > 0) {
      const properties = e.features[0].properties
      hoveredBuilding.value = properties
    }
  })

  map.on('mouseleave', '3d-buildings-layer', () => {
    hoveredBuilding.value = null
  })
})

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (map) {
    map.remove()
  }
})

// Add GeoJSON source and fill-extrusion layer
const add3DLayer = () => {
  if (!map) return

  // Avoid duplicate registration on style change
  if (map.getSource('cbd-data')) return

  map.addSource('cbd-data', {
    type: 'geojson',
    data: mockBuildings as any
  })

  map.addLayer({
    id: '3d-buildings-layer',
    source: 'cbd-data',
    type: 'fill-extrusion',
    paint: {
      'fill-extrusion-color': [
        'match',
        ['get', 'id'],
        1, '#6366f1',
        2, '#ec4899',
        3, '#10b981',
        4, '#f59e0b',
        '#6b7280'
      ],
      'fill-extrusion-height': [
        '*',
        ['get', 'height'],
        heightScale.value
      ],
      'fill-extrusion-base': ['get', 'base'],
      'fill-extrusion-opacity': 0.8
    }
  })
}

// Switch map style (e.g. Light, Dark)
const changeMapStyle = () => {
  if (!map) return
  map.setStyle(styleUrls[currentStyle.value])
  // Re-append layers on style update
  map.once('style.load', () => {
    add3DLayer()
  })
}

// Fly smoothly to target city
const flyToLocation = (cityKey: 'beijing' | 'shanghai' | 'hangzhou') => {
  if (!map) return
  const config = locations[cityKey]
  map.flyTo({
    center: config.center,
    zoom: config.zoom,
    pitch: config.pitch,
    bearing: config.bearing,
    speed: 0.9,
    curve: 1.3,
    essential: true
  })
}

// Toggle map auto rotating
const toggleRotation = () => {
  isRotating.value = !isRotating.value
  if (isRotating.value) {
    const rotateCamera = () => {
      if (isRotating.value && map) {
        map.rotateTo((map.getBearing() + 0.1) % 360, { duration: 0 })
        animationFrameId = requestAnimationFrame(rotateCamera)
      }
    }
    rotateCamera()
  } else {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
}

// Modify 3D Extrusion height factor in real time
const updateHeights = () => {
  if (!map) return
  if (map.getLayer('3d-buildings-layer')) {
    map.setPaintProperty('3d-buildings-layer', 'fill-extrusion-height', [
      '*',
      ['get', 'height'],
      heightScale.value
    ])
  }
}

// Example Code
const maplibreExampleCode = `<template>
  <div id="map-container"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

onMounted(() => {
  const map = new maplibregl.Map({
    container: 'map-container',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [116.3974, 39.9082],
    zoom: 14.5,
    pitch: 55
  })

  map.on('load', () => {
    map.addSource('cbd-data', { type: 'geojson', data: geojsonData })
    map.addLayer({
      id: '3d-buildings',
      source: 'cbd-data',
      type: 'fill-extrusion',
      paint: {
        'fill-extrusion-color': '#6366f1',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.8
      }
    })
  })
})
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.map-controls {
  padding: 8px 12px;
  background: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.map-wrapper {
  width: 100%;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
}

.map-container-instance {
  width: 100%;
  height: 100%;
}

/* Floating overlay details panel */
.map-overlay-card {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 200px;
  background: rgba(var(--bg-color-secondary-rgb), 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 10;
  pointer-events: none;
}

.map-tips {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.65);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  z-index: 10;
}

.data-spec-list {
  padding-left: 16px;
  margin: 8px 0;
  
  li {
    margin: 4px 0;
  }
}

.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.my-1 { margin-top: 4px; margin-bottom: 4px; }
.m-0 { margin: 0; }
.text-xxs { font-size: 0.68rem; }
.font-bold { font-weight: 700; }
</style>
