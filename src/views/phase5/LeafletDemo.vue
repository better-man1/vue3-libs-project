<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工程进阶</el-breadcrumb-item>
      <el-breadcrumb-item>Leaflet.js 交互地图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Leaflet.js — 轻量级交互式 Web 地图</h2>
      <p>使用 <code>@vue-leaflet/vue-leaflet</code> 组件化 API 渲染交互地图，支持标记点、弹窗、GeoJSON 图层与地图图层切换。</p>
    </div>

    <el-row :gutter="20">
      <!-- Map area -->
      <el-col :xs="24" :lg="17">
        <DemoCard
          title="城市经济热力地图"
          description="点击地图任意位置可添加自定义标记，悬停省份边界可高亮显示。"
          :code="leafletCode"
        >
          <!-- Layer switcher -->
          <div class="map-controls flex gap-2 mb-3 flex-wrap">
            <el-radio-group v-model="activeLayer" size="small" @change="handleLayerChange">
              <el-radio-button value="osm">🗺️ 街道图</el-radio-button>
              <el-radio-button value="satellite">🛰️ 卫星图</el-radio-button>
              <el-radio-button value="dark">🌑 暗色主题</el-radio-button>
            </el-radio-group>
            <el-button size="small" @click="clearCustomMarkers">🗑️ 清除自定义标记</el-button>
          </div>

          <!-- The Leaflet Map -->
          <div id="leaflet-map" ref="mapContainer" class="map-viewport"></div>

          <div class="map-tip text-xs text-secondary mt-2">
            💡 点击地图空白区域可添加自定义坐标标记；点击城市标记查看经济数据
          </div>
        </DemoCard>
      </el-col>

      <!-- Sidebar Info -->
      <el-col :xs="24" :lg="7">
        <!-- City list -->
        <el-card shadow="hover" class="info-card mb-4">
          <template #header>
            <span class="font-bold">🏙️ 城市经济数据</span>
          </template>
          <div class="city-list">
            <div
              v-for="city in cities"
              :key="city.name"
              class="city-row flex justify-between items-center"
              @click="flyToCity(city)"
            >
              <span class="city-name">{{ city.icon }} {{ city.name }}</span>
              <el-tag :type="getGdpTagType(city.gdp)" size="small">
                ¥{{ city.gdp }} 万亿
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- Custom markers -->
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="font-bold">📍 自定义标记记录</span>
          </template>
          <div v-if="customMarkers.length === 0" class="text-xs text-secondary text-center py-4">
            点击地图添加标记
          </div>
          <div v-else class="marker-list">
            <div
              v-for="(m, idx) in customMarkers"
              :key="idx"
              class="marker-row text-xs flex justify-between"
            >
              <span class="font-mono">{{ m.lat.toFixed(4) }}, {{ m.lng.toFixed(4) }}</span>
              <el-button link type="danger" size="small" @click="removeMarker(idx)">×</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// Fix Leaflet default marker icon issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── City Data ────────────────────────────────────────────────────────
const cities = [
  { name: '北京', icon: '🏛️', lat: 39.9042, lng: 116.4074, gdp: 4.16, desc: '政治文化中心，科创资源密集' },
  { name: '上海', icon: '🏙️', lat: 31.2304, lng: 121.4737, gdp: 4.72, desc: '中国最大经济中心与国际金融枢纽' },
  { name: '深圳', icon: '🔬', lat: 22.5431, lng: 114.0579, gdp: 3.24, desc: '科技创新与制造业双驱动' },
  { name: '广州', icon: '🌸', lat: 23.1291, lng: 113.2644, gdp: 2.99, desc: '华南商贸中心与交通枢纽' },
  { name: '成都', icon: '🐼', lat: 30.5728, lng: 104.0668, gdp: 2.08, desc: '西部经济中心，互联网新兴城市' },
  { name: '杭州', icon: '⛵', lat: 30.2741, lng: 120.1551, gdp: 1.87, desc: '数字经济领先，电商创业中心' },
]

// ─── Map State ────────────────────────────────────────────────────────
const mapContainer = ref<HTMLElement | null>(null)
const activeLayer = ref<'osm' | 'satellite' | 'dark'>('osm')
const customMarkers = ref<{ lat: number; lng: number }[]>([])

let map: L.Map | null = null
const customMarkerLayers: L.Marker[] = []

// Tile layer definitions
const tileLayers = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri World Imagery'
  }),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CARTO Dark'
  })
}

let currentTileLayer: L.TileLayer | null = null

const handleLayerChange = (val: any) => {
  if (!map) return
  if (currentTileLayer) map.removeLayer(currentTileLayer)
  currentTileLayer = tileLayers[val as 'osm' | 'satellite' | 'dark']
  currentTileLayer.addTo(map)
}

const flyToCity = (city: typeof cities[0]) => {
  map?.flyTo([city.lat, city.lng], 10, { duration: 1.5 })
  ElMessage.info(`飞向 ${city.icon} ${city.name}`)
}

const clearCustomMarkers = () => {
  customMarkerLayers.forEach(m => map?.removeLayer(m))
  customMarkerLayers.length = 0
  customMarkers.value = []
}

const removeMarker = (idx: number) => {
  map?.removeLayer(customMarkerLayers[idx])
  customMarkerLayers.splice(idx, 1)
  customMarkers.value.splice(idx, 1)
}

const getGdpTagType = (gdp: number) => {
  if (gdp >= 4) return 'danger'
  if (gdp >= 2.5) return 'warning'
  return 'success'
}

onMounted(() => {
  if (!mapContainer.value) return

  // Initialize map centered on China
  map = L.map(mapContainer.value, {
    center: [35.86, 104.195],
    zoom: 4,
    zoomControl: true
  })

  // Add default OSM layer
  currentTileLayer = tileLayers.osm
  currentTileLayer.addTo(map)

  // Add city markers
  cities.forEach(city => {
    const marker = L.marker([city.lat, city.lng]).addTo(map!)
    marker.bindPopup(`
      <div style="min-width:180px">
        <h4 style="margin:0 0 6px;font-size:1rem">${city.icon} ${city.name}</h4>
        <p style="margin:0 0 4px;font-size:0.82rem;color:#64748b">${city.desc}</p>
        <strong style="color:#6366f1">GDP: ¥${city.gdp} 万亿</strong>
      </div>
    `)
  })

  // Click to add custom marker
  map.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    const m = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<div style="background:#ef4444;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        className: ''
      })
    }).addTo(map!)
    m.bindPopup(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup()
    customMarkerLayers.push(m)
    customMarkers.value.push({ lat, lng })
  })
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

const leafletCode = `import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

onMounted(() => {
  const map = L.map('map-container', {
    center: [35.86, 104.195], zoom: 4
  })
  
  // 添加 OSM 图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)
  
  // 添加城市标记并绑定弹窗
  L.marker([39.9042, 116.4074])
    .addTo(map)
    .bindPopup('<b>北京</b><br/>GDP: ¥4.16 万亿')
    
  // 监听地图点击事件
  map.on('click', (e) => {
    L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
  })
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.map-viewport {
  height: 450px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  z-index: 0;
}

.city-list {
  .city-row {
    padding: 8px 4px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover { background: var(--bg-color-secondary); }
    &:last-child { border-bottom: none; }

    .city-name {
      font-size: 0.88rem;
      color: var(--text-primary);
    }
  }
}

.marker-list {
  .marker-row {
    padding: 4px 0;
    border-bottom: 1px solid var(--border-color);
    &:last-child { border-bottom: none; }
  }
}

.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.py-4 { padding: 16px 0; }
.font-bold { font-weight: 700; }
.font-mono { font-family: 'Fira Code', monospace; }
.text-xs { font-size: 0.75rem; }
.text-secondary { color: var(--text-secondary); }
.text-center { text-align: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
</style>
