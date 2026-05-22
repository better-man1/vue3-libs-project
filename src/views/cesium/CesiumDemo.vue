<template>
  <div class="cesium-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>3D & 地理</el-breadcrumb-item>
      <el-breadcrumb-item>CesiumJS 3D地球</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>CesiumJS — 工业级 WebGL 3D 地理空间可视化平台</h2>
      <p>
        CesiumJS 是一款开源的地理空间 3D 可视化引擎。它支持渲染全球级别的高精度 3D 椭球体、高程地形起伏、矢量图层切片以及大规模三方 3D Tiles 倾斜摄影模型，
        广泛应用于智慧城市、数字孪生、无人机航线仿真、气象监控以及军事测绘等高精尖领域。
      </p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="17" class="mb-4">
        <DemoCard
          title="WebGL 3D 三维虚拟数字地球"
          description="使用滚轮缩放地球，按住鼠标左键拖拽平移，按住鼠标右键/中键上下拖拽可调节倾斜角度与旋转方向。"
          :code="cesiumExampleCode"
        >
          <!-- Controls Panel -->
          <div class="cesium-toolbar flex flex-wrap justify-between items-center gap-2 mb-3">
            <div class="flex flex-wrap gap-2">
              <el-button-group size="small">
                <el-button type="primary" @click="flyToDestination('beijing')">📍 飞往北京</el-button>
                <el-button type="primary" @click="flyToDestination('everest')">🏔️ 珠穆朗玛峰</el-button>
                <el-button type="primary" @click="flyToDestination('manhattan')">🏙️ 纽约曼哈顿</el-button>
                <el-button type="primary" @click="flyToDestination('grand_canyon')">🏜️ 科罗拉多大峡谷</el-button>
              </el-button-group>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-secondary font-bold">图层底图:</span>
              <el-select v-model="currentImagery" size="small" style="width: 130px;" @change="updateImageryProvider">
                <el-option label="🌑 科技暗黑" value="dark" />
                <el-option label="🗺️ 卫星地图" value="satellite" />
                <el-option label="🎨 街道地图" value="street" />
              </el-select>

              <el-button size="small" type="success" plain @click="startOrbiting">
                {{ isOrbiting ? '⏸️ 停止自转' : '🔄 地球巡航自转' }}
              </el-button>
            </div>
          </div>

          <div class="cesium-wrapper">
            <!-- Loading Indicator -->
            <div v-if="loading" class="cesium-loading-overlay flex flex-col justify-center items-center">
              <el-icon class="is-loading text-primary" :size="40"><Loading /></el-icon>
              <span class="text-xs text-primary mt-2">正在初始化 WebGL 三维地球...</span>
            </div>

            <!-- Cesium Container -->
            <div id="cesium-container" class="cesium-container-instance"></div>

            <!-- Real-time Camera Data Floating Overlay -->
            <div class="cesium-camera-hud" v-if="cameraInfo && !loading">
              <div class="hud-title">📡 卫星遥测相机数据</div>
              <div class="hud-item"><span class="hud-label">经度:</span> <span class="hud-value">{{ cameraInfo.longitude.toFixed(5) }}°</span></div>
              <div class="hud-item"><span class="hud-label">纬度:</span> <span class="hud-value">{{ cameraInfo.latitude.toFixed(5) }}°</span></div>
              <div class="hud-item"><span class="hud-label">高度:</span> <span class="hud-value">{{ formatHeight(cameraInfo.height) }}</span></div>
              <div class="hud-item"><span class="hud-label">朝向 (Heading):</span> <span class="hud-value">{{ cameraInfo.heading.toFixed(1) }}°</span></div>
              <div class="hud-item"><span class="hud-label">俯仰 (Pitch):</span> <span class="hud-value">{{ cameraInfo.pitch.toFixed(1) }}°</span></div>
            </div>

            <!-- Feature Panel Overlay -->
            <div class="cesium-features-hud" v-if="!loading">
              <div class="hud-title">🛸 三维空间要素实体</div>
              <div class="flex flex-col gap-2 mt-2">
                <el-checkbox v-model="features.markers" @change="toggleFeatures('markers')">📌 城市科技地标</el-checkbox>
                <el-checkbox v-model="features.polyline" @change="toggleFeatures('polyline')">📏 卫星赤道轨道</el-checkbox>
                <el-checkbox v-model="features.polygon" @change="toggleFeatures('polygon')">🛡️ 电磁防御穹顶 (Polygon)</el-checkbox>
                <el-checkbox v-model="features.satellite" @change="toggleFeatures('satellite')">🛰️ 实时变轨卫星 (Path)</el-checkbox>
              </div>
            </div>

            <div class="cesium-tips">
              💡 鼠标滚轮缩放，按住鼠标中键或右键拖拽调整 3D 倾斜相机视角
            </div>
          </div>
        </DemoCard>
      </el-col>

      <el-col :xs="24" :lg="7" class="mb-4">
        <!-- Environmental Settings Card -->
        <el-card shadow="hover" class="cesium-control-card mb-4">
          <template #header>
            <div class="font-bold flex items-center gap-2">
              <span>⚙️ 3D 地理空间环境配置</span>
            </div>
          </template>
          <div class="flex flex-col gap-4 text-xs">
            <div class="control-item">
              <span class="control-label">日照与光影计算:</span>
              <el-switch v-model="envSettings.enableLighting" @change="updateEnvSetting('lighting')" />
            </div>

            <div class="control-item">
              <span class="control-label">日照投影 (Shadows):</span>
              <el-switch v-model="envSettings.enableShadows" @change="updateEnvSetting('shadows')" />
            </div>

            <div class="control-item">
              <span class="control-label">大气层晕影特效:</span>
              <el-switch v-model="envSettings.showAtmosphere" @change="updateEnvSetting('atmosphere')" />
            </div>

            <div class="control-item">
              <span class="control-label">深度碰撞检测 (地形遮挡):</span>
              <el-switch v-model="envSettings.depthTestAgainstTerrain" @change="updateEnvSetting('depthTest')" />
            </div>

            <el-divider class="my-2" />

            <div class="control-item">
              <span class="control-label">三维地形高度起伏:</span>
              <el-switch v-model="envSettings.useTerrain" @change="toggleTerrain" />
            </div>
            <div class="text-xxs text-secondary leading-relaxed mt-1">
              开启地形后，珠穆朗玛峰和科罗拉多大峡谷将能够呈现真实的海拔高度与纵深沟壑。
            </div>
          </div>
        </el-card>

        <!-- Technical Specs Card -->
        <el-card shadow="hover" class="cesium-tech-card">
          <template #header>
            <div class="font-bold">📚 Cesium 核心技术解析</div>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2">CesiumJS 基于 WebGL / WebGPU 提供了多层次的地理实体渲染接口：</p>
            <ul class="tech-spec-list mb-3">
              <li><strong>Ellipsoid 地球椭球</strong>: 默认采用 WGS84 国际大地测量基准，用于将地理坐标转为笛卡尔 3D 空间坐标。</li>
              <li><strong>ImageryProvider 底图</strong>: 支持通过 Web Map Service (WMS)、TMS、XYZ 或 ArcGIS 动态切片格式加载遥感底图。</li>
              <li><strong>Entities 实体模型</strong>: 提供了高度抽象的矢量图形接口（如广告牌 Billboard、文字 Label、多边形 Polygon、路径 Trajectory），包含丰富的材质属性。</li>
              <li><strong>Camera 相机模型</strong>: 具备 Heading (偏航角/朝向)、Pitch (俯仰角/倾斜)、Roll (翻滚角) 控制，能高度仿真低空航行和卫星变轨。</li>
            </ul>
            <el-divider class="my-2" />
            <p class="text-xxs text-warning mb-0">
              ⚠️ 生产环境建议通过 Cesium Ion 获取专用的 Access Token，以便在官方通道加载全球高精度地形与 3D Buildings 摄影模型。
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import {
  Viewer,
  Cartesian2,
  Cartesian3,
  Color,
  Math as CesiumMath,
  UrlTemplateImageryProvider,
  ImageryLayer,
  createWorldTerrainAsync,
  JulianDate,
  SampledPositionProperty,
  Entity,
  ClockRange,
  ClockStep,
  PinBuilder,
  VerticalOrigin
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Loading } from '@element-plus/icons-vue'

// 本地响应式状态定义
const loading = ref(true)          // 地球初始化加载指示器状态
const isOrbiting = ref(false)      // 地球是否处于自转巡航状态
const currentImagery = ref('dark')  // 当前激活的底图图层标识符
const cameraInfo = ref<any>(null)  // 相机 HUD 遥测数据的响应式载体

/**
 * 💡 关键设计避坑指南：
 * Cesium.Viewer 是一个持有复杂渲染上下文、WebGL 上下文以及海量内部状态的重度 class 对象。
 * 在 Vue 中，如果直接使用常规的 ref() 或是 reactive() 去包装它，Vue 会自动尝试进行递归式 Proxy 深度响应式拦截（收集依赖）。
 * 这会导致频繁的 CPU 运算开销，使渲染帧率急剧下降甚至引发严重的性能瓶颈崩溃。
 * 【推荐方案】：使用 shallowRef() 进行浅层响应式引用，或者在 setup 顶部声明非响应式的常规局部变量。
 * 这里保存 viewerInstance 仅用于在销毁时或事件回调中调用底层 API，切勿在大频发事件中对其进行复杂依赖收集。
 */
const viewerInstance = ref<any>(null)

// 要素图层开启/关闭状态（通过 reactive 绑定 el-checkbox 开关）
const features = reactive({
  markers: true,      // 城市地标标记 (Entities)
  polyline: true,     // 赤道轨道折线 (Polyline)
  polygon: true,      // 防御网络穹顶 (Ellipse/Polygon)
  satellite: true     // 变轨卫星模拟 (SampledPositionPath)
})

// 三维环境参数调节状态
const envSettings = reactive({
  enableLighting: false,           // 开启太阳光照（地表会根据太阳角度产生昼夜阴影交替效果）
  enableShadows: false,            // 启用日照三维投影阴影，渲染高耸山体/建筑阴影
  showAtmosphere: true,            // 展示外太空蓝色地球大气层晕影特效
  depthTestAgainstTerrain: true,   // 开启深度地形碰撞（山体能成功遮挡被挡在后面的标记点）
  useTerrain: false                // 是否加载全球高程地形网格
})

// 预设旅游景点坐标参数 (WGS84标准经度, 纬度, 高度, 朝向Heading, 俯仰Pitch)
interface LocationCoords {
  lon: number      // 经度
  lat: number      // 纬度
  height: number   // 相机海拔高度 (米)
  heading: number  // 相机航向角 (围绕 Z 轴偏航旋转，0 表示正北)
  pitch: number    // 相机俯仰角 (围绕 Y 轴上下旋转，-90 表示垂直向下俯视)
}

const locations: Record<string, LocationCoords> = {
  beijing: { lon: 116.3974, lat: 39.9093, height: 1500, heading: 0, pitch: -35 },
  everest: { lon: 86.9250, lat: 27.9881, height: 12000, heading: 180, pitch: -20 },
  manhattan: { lon: -74.0060, lat: 40.7128, height: 2500, heading: 45, pitch: -30 },
  grand_canyon: { lon: -112.1129, lat: 36.1069, height: 8000, heading: 90, pitch: -25 }
}

// 离线/免 Key 三方影像底图配置
// 采用 CartoDB 提供的街道、黑金色底图服务，卫星图使用公用的 ArcGIS 图层服务
const imageryConfigs = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  street: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
}

// 内部动画和帧调度句柄存储
let rotateTimer: number | null = null      // 保存 requestAnimationFrame 的数字 ID 句柄，用于停止自转
let satelliteEntity: Entity | null = null  // 保存卫星要素的引用，供外部图层控制切换显示

// 地球挂载初始化逻辑
onMounted(async () => {
  try {
    // 1. 创建黑金色底图图层提供者 (Imagery Provider)
    const darkImageryProvider = new UrlTemplateImageryProvider({
      url: imageryConfigs.dark,
      subdomains: ['a', 'b', 'c', 'd'] // XYZ 格式的二级多服务器负载均衡域名解析
    })
    const darkImageryLayer = new ImageryLayer(darkImageryProvider)

    // 2. 核心实例化：创建三维虚拟地球视图容器
    // 在此处将关闭一切非必要的原生 UI 浮层，如自带的播放条、搜寻框、版权标志，以获取更清爽、工业感的主题效果
    const viewer = new Viewer('cesium-container', {
      baseLayer: darkImageryLayer,       // 默认影像底图
      baseLayerPicker: false,           // 隐藏图层选择器按钮 (我们采用自定义的 el-select 控制)
      geocoder: false,                  // 隐藏地理搜索输入框
      homeButton: false,                // 隐藏视角复原主页按钮
      infoBox: true,                    // 允许展示要素点击时的官方详细信息卡片面板 (HTML InfoBox)
      sceneModePicker: false,           // 隐藏 2D/3D/2.5D 切换器
      selectionIndicator: true,         // 开启选定要素时的四角锁定动态框指示器
      navigationHelpButton: false,      // 隐藏导航帮助小助手
      timeline: false,                  // 隐藏底部精密时间轴（不播放复杂轨迹仿真时推荐关闭释放屏幕空间）
      animation: false,                 // 隐藏时间表盘
      fullscreenButton: false,          // 隐藏右下角全屏控制按钮
      vrButton: false                   // 隐藏虚拟现实 VR 护镜图标
    })

    // 将 shallowRef 形式的底层对象留存
    viewerInstance.value = viewer

    // 3. 规避 Cesium 原生底部的版权申明标志 (Credit Container)，使其视觉无瑕疵
    if ((viewer as any).creditContainer) {
      ;((viewer as any).creditContainer as HTMLElement).style.display = 'none'
    }

    // 4. 将初始化的三维物理环境参数写入 Cesium 全局 Scene 中
    viewer.scene.globe.showGroundAtmosphere = envSettings.showAtmosphere // 大气光圈环绕
    viewer.scene.globe.enableLighting = envSettings.enableLighting       // 太阳光线实时渲染
    viewer.shadows = envSettings.enableShadows                           // 投影阴影开启状态
    viewer.scene.globe.depthTestAgainstTerrain = envSettings.depthTestAgainstTerrain // 视线深度检测

    // 关闭帧率显示调试工具（需要性能调优时可手动设为 true）
    viewer.scene.debugShowFramesPerSecond = false

    // 5. 调用子方法在三维空间中挂载要素实体（包含北京标点、防御网、绕地卫星）
    init3DEntities(viewer)

    // 6. 注册相机参数监听器
    // 当用户滑动鼠标轮廓缩放、拖拽平移地球时，相机坐标高频更改，实时将弧度换算为角度投射给 HUD 遥测浮屏
    viewer.camera.changed.addEventListener(onCameraChange)
    onCameraChange() // 首次主动触发一次以补全初始值

    // 隐藏 WebGL loading 加载蒙层
    loading.value = false

    // 7. 平滑转场：飞往宏观的中国板块上方区域
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(105.0, 35.0, 15000000), // WGS84度数: 经度105°, 纬度35°, 高度1.5万千米
      duration: 1.5 // 飞行用时持续 1.5 秒
    })
  } catch (err) {
    console.error('Failed to initialize Cesium Viewer:', err)
    loading.value = false // 异常边界保护，防止动画常驻
  }
})

// 垃圾回收：卸载地球释放 WebGL 显存
// ⚠️ 极其关键！如果不主动解绑监听并 destroy，WebGL context 资源将无法回收，路由切换数次后会导致显存耗尽页面白屏
onUnmounted(() => {
  // A. 取消正在执行的旋转帧动画
  if (rotateTimer) {
    cancelAnimationFrame(rotateTimer)
  }
  // B. 解绑相机监听事件，调用原生销毁方法，释放 WebGL Canvas 控制器
  if (viewerInstance.value) {
    viewerInstance.value.camera.changed.removeEventListener(onCameraChange)
    viewerInstance.value.destroy()
    viewerInstance.value = null
  }
})

// 相机变动监听处理器：实时提取相机位姿数据
const onCameraChange = () => {
  if (!viewerInstance.value) return
  const camera = viewerInstance.value.camera
  const cartographic = camera.positionCartographic // 提取出相机的制图学弧度制数据

  // 将制图学弧度数据 (Radians) 转为人类可读的 WGS84 经纬度度数 (Degrees)
  cameraInfo.value = {
    longitude: CesiumMath.toDegrees(cartographic.longitude),
    latitude: CesiumMath.toDegrees(cartographic.latitude),
    height: cartographic.height,
    heading: CesiumMath.toDegrees(camera.heading),
    pitch: CesiumMath.toDegrees(camera.pitch)
  }
}


const formatHeight = (height: number) => {
  if (height >= 1000) {
    return `${(height / 1000).toFixed(2)} km`
  }
  return `${height.toFixed(0)} m`
}

// Update Base Imagery Provider
const updateImageryProvider = () => {
  const viewer = viewerInstance.value
  if (!viewer) return

  // Remove existing base imagery layer
  viewer.imageryLayers.removeAll()

  const providerUrl = imageryConfigs[currentImagery.value as keyof typeof imageryConfigs]
  const isArcgis = currentImagery.value === 'satellite'

  const provider = new UrlTemplateImageryProvider({
    url: providerUrl,
    subdomains: isArcgis ? undefined : ['a', 'b', 'c', 'd']
  })

  viewer.imageryLayers.addImageryProvider(provider)
}

// Fly to destination
const flyToDestination = (placeKey: string) => {
  const viewer = viewerInstance.value
  if (!viewer) return

  const loc = locations[placeKey]
  if (!loc) return

  if (isOrbiting.value) {
    startOrbiting() // Stop rotation when flying
  }

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(loc.lon, loc.lat, loc.height),
    orientation: {
      heading: CesiumMath.toRadians(loc.heading),
      pitch: CesiumMath.toRadians(loc.pitch),
      roll: 0.0
    },
    duration: 3.0
  })
}

// Toggle Terrain (Elevation modeling)
const toggleTerrain = async () => {
  const viewer = viewerInstance.value
  if (!viewer) return

  if (envSettings.useTerrain) {
    viewer.terrainProvider = await createWorldTerrainAsync()
  } else {
    // Reset to default flat ellipsoid
    viewer.terrainProvider = new (Viewer as any).defaultTerrainProvider()
  }
}

// Environment Setting Toggles
const updateEnvSetting = (type: string) => {
  const viewer = viewerInstance.value
  if (!viewer) return

  switch (type) {
    case 'lighting':
      viewer.scene.globe.enableLighting = envSettings.enableLighting
      break
    case 'shadows':
      viewer.shadows = envSettings.enableShadows
      break
    case 'atmosphere':
      viewer.scene.globe.showGroundAtmosphere = envSettings.showAtmosphere
      break
    case 'depthTest':
      viewer.scene.globe.depthTestAgainstTerrain = envSettings.depthTestAgainstTerrain
      break
  }
}

// Draw 3D Entities
const init3DEntities = (viewer: Viewer) => {
  // 1. City Pins (Markers)
  const pinBuilder = new PinBuilder()
  const customPin = pinBuilder.fromColor(Color.fromCssColorString('#6366f1'), 48).toDataURL()

  // Beijing Marker
  viewer.entities.add({
    id: 'marker-beijing',
    position: Cartesian3.fromDegrees(116.3974, 39.9093, 100),
    billboard: {
      image: customPin,
      verticalOrigin: VerticalOrigin.BOTTOM,
      width: 32,
      height: 32
    },
    label: {
      text: '中华人民共和国首都：北京',
      font: '14px Outfit, sans-serif',
      fillColor: Color.WHITE,
      outlineColor: Color.BLACK,
      outlineWidth: 2,
      style: 2, // Fill and Outline
      pixelOffset: new Cartesian2(0, -40),
      verticalOrigin: VerticalOrigin.BOTTOM
    },
    description: '北京，简称“京”，是中华人民共和国的首都、直辖市、国家中心城市、超大城市，全国政治中心、文化中心、国际交往中心、科技创新中心。'
  })

  // Mount Everest Marker
  viewer.entities.add({
    id: 'marker-everest',
    position: Cartesian3.fromDegrees(86.9250, 27.9881, 8848),
    billboard: {
      image: customPin,
      width: 32,
      height: 32
    },
    label: {
      text: '地球之巅：珠穆朗玛峰 (8848.86m)',
      font: '14px Outfit, sans-serif',
      fillColor: Color.fromCssColorString('#10b981'),
      outlineColor: Color.BLACK,
      outlineWidth: 2,
      style: 2,
      pixelOffset: new Cartesian2(0, -30)
    },
    description: '珠穆朗玛峰是喜马拉雅山脉的主峰，同时是世界海拔最高的山峰。'
  })

  // New York Marker
  viewer.entities.add({
    id: 'marker-manhattan',
    position: Cartesian3.fromDegrees(-74.0060, 40.7128, 50),
    billboard: {
      image: customPin,
      width: 32,
      height: 32
    },
    label: {
      text: '纽约曼哈顿',
      font: '14px Outfit, sans-serif',
      fillColor: Color.fromCssColorString('#f59e0b'),
      style: 2,
      pixelOffset: new Cartesian2(0, -30)
    },
    description: '曼哈顿是美国纽约市五个行政区中人口最稠密的一个，也是纽约的核心商业区。'
  })

  // 2. Global Equator Polyline
  const polylineCoords = []
  for (let i = 0; i <= 360; i += 5) {
    polylineCoords.push(Cartesian3.fromDegrees(i, 0, 500000)) // 500km altitude polyline
  }

  viewer.entities.add({
    id: 'equator-line',
    polyline: {
      positions: polylineCoords,
      width: 3.0,
      material: Color.fromCssColorString('#6366f1').withAlpha(0.7)
    }
  })

  // 3. Cyber Shield Polygon (around Shanghai)
  viewer.entities.add({
    id: 'cyber-dome',
    position: Cartesian3.fromDegrees(121.4737, 31.2304),
    ellipse: {
      semiMinorAxis: 150000.0, // 150km radius
      semiMajorAxis: 150000.0,
      height: 20000.0, // 20km dome altitude
      extrudedHeight: 0.0,
      material: Color.fromCssColorString('#10b981').withAlpha(0.25),
      outline: true,
      outlineColor: Color.fromCssColorString('#10b981'),
      outlineWidth: 2.0
    },
    description: '模拟覆盖长三角都市圈的高维信息电磁防护网。'
  })

  // 4. Moving Satellite (Path Trajectory Animation)
  const startTime = JulianDate.now()
  const stopTime = JulianDate.addSeconds(startTime, 360, new JulianDate())

  // Configure timeline range
  viewer.clock.startTime = startTime.clone()
  viewer.clock.stopTime = stopTime.clone()
  viewer.clock.currentTime = startTime.clone()
  viewer.clock.clockRange = ClockRange.LOOP_STOP
  viewer.clock.multiplier = 10 // Speeds up the time flow
  viewer.clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER

  const positionProperty = new SampledPositionProperty()

  // Generate orbit path points
  for (let i = 0; i <= 360; i += 10) {
    const time = JulianDate.addSeconds(startTime, i, new JulianDate())
    // Satellite circles the Earth on a diagonal orbit (altitude: 2000km)
    const pos = Cartesian3.fromDegrees(i * 2 - 180, i - 90, 2000000)
    positionProperty.addSample(time, pos)
  }

  satelliteEntity = viewer.entities.add({
    id: 'satellite',
    position: positionProperty,
    point: {
      pixelSize: 10,
      color: Color.RED,
      outlineColor: Color.WHITE,
      outlineWidth: 2
    },
    label: {
      text: 'ANTIGRAVITY-1 卫星探测器',
      font: '11px Outfit, sans-serif',
      fillColor: Color.RED,
      pixelOffset: new Cartesian2(0, -20)
    },
    path: {
      resolution: 1,
      material: Color.RED.withAlpha(0.6),
      width: 2,
      leadTime: 0,
      trailTime: 120
    }
  })
}

// Toggle features
const toggleFeatures = (type: keyof typeof features) => {
  const viewer = viewerInstance.value
  if (!viewer) return

  switch (type) {
    case 'markers':
      const list = ['marker-beijing', 'marker-everest', 'marker-manhattan']
      list.forEach(id => {
        const ent = viewer.entities.getById(id)
        if (ent) ent.show = features.markers
      })
      break
    case 'polyline':
      const poly = viewer.entities.getById('equator-line')
      if (poly) poly.show = features.polyline
      break
    case 'polygon':
      const dom = viewer.entities.getById('cyber-dome')
      if (dom) dom.show = features.polygon
      break
    case 'satellite':
      if (satelliteEntity) satelliteEntity.show = features.satellite
      break
  }
}

// Camera Cruise (Autospin globe)
const startOrbiting = () => {
  const viewer = viewerInstance.value
  if (!viewer) return

  isOrbiting.value = !isOrbiting.value

  const spin = () => {
    if (!isOrbiting.value || !viewer) return
    const camera = viewer.camera
    // Rotate camera around current center
    camera.rotate(Cartesian3.UNIT_Z, 0.002) // Incremental heading rotation angle in radians
    rotateTimer = requestAnimationFrame(spin)
  }

  if (isOrbiting.value) {
    spin()
  } else {
    if (rotateTimer) {
      cancelAnimationFrame(rotateTimer)
      rotateTimer = null
    }
  }
}

// Demo Code for preview
const cesiumExampleCode = `<template>
  <div id="cesium-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { Viewer, Cartesian3, Color, UrlTemplateImageryProvider } from 'cesium'

onMounted(() => {
  const viewer = new Viewer('cesium-container', {
    imageryProvider: new UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd']
    }),
    baseLayerPicker: false,
    timeline: false,
    animation: false
  })
  
  // Draw marker
  viewer.entities.add({
    position: Cartesian3.fromDegrees(116.3974, 39.9093, 100),
    billboard: {
      image: '/pin.png',
      width: 32,
      height: 32
    }
  })
})
<\/script>`
</script>

<style lang="scss" scoped>
.cesium-demo-container {
  padding: 10px;
}

.header-desc {
  margin-bottom: 20px;
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.cesium-wrapper {
  position: relative;
  width: 100%;
  height: 550px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background-color: #0c0f16;
}

.cesium-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background-color: rgba(12, 15, 22, 0.85);
  backdrop-filter: blur(4px);
}

.cesium-container-instance {
  width: 100%;
  height: 100%;
}

.cesium-tips {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 11px;
  pointer-events: none;
  z-index: 5;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// Camera Telemetry HUD
.cesium-camera-hud {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(10, 15, 28, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 8px;
  padding: 10px 14px;
  width: 200px;
  z-index: 5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  .hud-title {
    font-size: 11px;
    font-weight: bold;
    color: var(--el-color-primary);
    border-bottom: 1px dashed rgba(99, 102, 241, 0.2);
    padding-bottom: 4px;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }

  .hud-item {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    line-height: 1.6;

    .hud-label {
      color: var(--text-secondary);
    }
    .hud-value {
      font-family: 'JetBrains Mono', monospace;
      color: #fff;
      font-weight: 500;
    }
  }
}

// Feature Toggle HUD
.cesium-features-hud {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(10, 15, 28, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  width: 190px;
  z-index: 5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  .hud-title {
    font-size: 11px;
    font-weight: bold;
    color: var(--text-secondary);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 4px;
    margin-bottom: 6px;
  }

  :deep(.el-checkbox) {
    margin-right: 0;
    height: auto;
    padding: 2px 0;
    
    .el-checkbox__label {
      font-size: 11px;
      color: var(--text-secondary);
    }
  }
}

.cesium-control-card, .cesium-tech-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--border-color);
    padding: 12px 16px;
  }
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .control-label {
    font-weight: 500;
    color: var(--text-primary);
  }
}

.tech-spec-list {
  padding-left: 16px;
  list-style-type: disc;
  li {
    margin-bottom: 6px;
    line-height: 1.5;
    strong {
      color: var(--text-primary);
    }
  }
}
</style>
