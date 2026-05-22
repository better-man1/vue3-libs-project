<template>
  <div class="three-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Three.js 3D 渲染</el-breadcrumb-item>
      <el-breadcrumb-item>3D 炫酷地球</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Three.js 3D 炫酷地球仪</h2>
      <p>完全使用数学程序生成的高解析度科技地球。包含了 Custom Shader（自定义着色器）渲染的大气层发光圈、3D 空间飞线以及经纬网络。</p>
    </div>

    <el-row :gutter="20">
      <!-- WebGL Render Window -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="3D Holographic Earth" 
          description="拖拽旋转地球，鼠标悬停在城市节点上查看交互标注。双击飞线可刷新光子传输轨迹。"
          :code="earthCode"
        >
          <div class="canvas-wrapper">
            <div ref="canvasContainer" class="webgl-container"></div>
            <div class="canvas-overlay">
              <span class="info-tag">核心技术: CanvasTexture + Custom Shader + BezierCurve3</span>
            </div>
            
            <!-- Tooltip popup overlay for selected city -->
            <div 
              v-if="hoveredCity" 
              class="city-tooltip"
              :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
            >
              <div class="tooltip-header">
                <span class="city-emoji">{{ hoveredCity.emoji }}</span>
                <strong>{{ hoveredCity.name }}</strong>
              </div>
              <div class="tooltip-body">
                <p>经纬度: {{ hoveredCity.lat }}°N, {{ hoveredCity.lng }}°E</p>
                <p>状态: {{ hoveredCity.status }}</p>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Panel Controls -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 地球仪控制中心</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">自转与大气控制</h4>
            <div class="control-item">
              <span class="label">自转开启:</span>
              <el-switch v-model="autoRotate" />
            </div>
            <div class="control-item">
              <span class="label">自转速度:</span>
              <el-slider v-model="rotateSpeed" :min="0.1" :max="3" :step="0.1" class="flex-1 ml-4" />
            </div>
            <div class="control-item">
              <span class="label">大气辉光 (Atmosphere):</span>
              <el-switch v-model="showAtmosphere" @change="toggleAtmosphere" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">网络飞线 (Arcs)</h4>
            <div class="control-item">
              <span class="label">展示数据飞线:</span>
              <el-switch v-model="showArcs" @change="toggleArcs" />
            </div>
            <div class="control-item">
              <span class="label">飞线传输速度:</span>
              <el-slider v-model="arcSpeed" :min="0.5" :max="4" :step="0.1" class="flex-1 ml-4" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">城市观测节点</h4>
            <div class="city-list">
              <div 
                v-for="city in cities" 
                :key="city.name" 
                class="city-item"
                @click="focusOnCity(city)"
              >
                <span class="city-bullet" :style="{ backgroundColor: city.color }"></span>
                <span class="city-name">{{ city.name }}</span>
                <span class="city-latlng">({{ city.lat }}°, {{ city.lng }}°)</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import DemoCard from '@/components/common/DemoCard.vue'

// DOM Ref
const canvasContainer = ref<HTMLDivElement | null>(null)

// Control state
const autoRotate = ref(true)
const rotateSpeed = ref(0.6)
const showAtmosphere = ref(true)
const showArcs = ref(true)
const arcSpeed = ref(1.8)

// Tooltip positioning
interface City {
  name: string
  lat: number
  lng: number
  emoji: string
  status: string
  color: string
  x?: number
  y?: number
  z?: number
}
const hoveredCity = ref<City | null>(null)
const tooltipPos = reactive({ x: 0, y: 0 })

// Predefined City Coordinates (Latitude, Longitude)
const cities = ref<City[]>([
  { name: '北京 (Beijing)', lat: 39.9, lng: 116.4, emoji: '🇨🇳', status: '数据网卡: 正常', color: '#f59e0b' },
  { name: '东京 (Tokyo)', lat: 35.6, lng: 139.6, emoji: '🇯🇵', status: '数据网卡: 正常', color: '#10b981' },
  { name: '伦敦 (London)', lat: 51.5, lng: -0.1, emoji: '🇬🇧', status: '延迟: 120ms', color: '#3b82f6' },
  { name: '纽约 (New York)', lat: 40.7, lng: -74.0, emoji: '🇺🇸', status: '延迟: 95ms', color: '#ec4899' },
  { name: '悉尼 (Sydney)', lat: -33.8, lng: 151.2, emoji: '🇦🇺', status: '数据网卡: 正常', color: '#14b8a6' }
])

// Three.js Core elements
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let earthGroup: THREE.Group // Contains Earth, grids, cities, and arcs to rotate them together
let earthSphere: THREE.Mesh
let atmosphereMesh: THREE.Mesh
let animationId: number = 0

// Curves/Arcs meshes
const arcGroup = new THREE.Group()

// City markers list for raycasting
const cityMeshList: THREE.Mesh[] = []
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2

// Initialize ThreeJS
const initThree = () => {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = 480

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0f1d)

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 5)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 8
  controls.minDistance = 2.2

  // Raycaster for hover interactions
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2(-9999, -9999)

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2)
  dirLight1.position.set(5, 5, 5)
  scene.add(dirLight1)

  const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.8)
  dirLight2.position.set(-5, -5, -5)
  scene.add(dirLight2)

  // Create rotating group
  earthGroup = new THREE.Group()
  scene.add(earthGroup)

  // 1. Create procedural earth texture via Canvas
  const earthTexture = createProceduralEarthTexture()

  // 2. Create Earth sphere Mesh
  const earthGeom = new THREE.SphereGeometry(1.2, 64, 64)
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.7,
    metalness: 0.1,
    bumpMap: earthTexture,
    bumpScale: 0.02
  })
  earthSphere = new THREE.Mesh(earthGeom, earthMat)
  earthGroup.add(earthSphere)

  // 3. Create atmosphere glow sphere using Custom Shader
  const atmosphereGeom = new THREE.SphereGeometry(1.2 * 1.12, 32, 32)
  const atmosphereMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        // Compute glow intensity based on view vector dot product
        float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
        gl_FragColor = vec4(0.22, 0.58, 0.97, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  })
  atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat)
  scene.add(atmosphereMesh) // Add to scene directly so it doesn't rotate with Earth

  // 4. Render City Coordinates and Arc Lines
  renderCitiesAndArcs()

  // 5. Animation loop
  const clock = new THREE.Clock()
  
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    controls.update()

    // Base Group Rotation
    if (autoRotate.value) {
      earthGroup.rotation.y += 0.002 * rotateSpeed.value
    }

    // Raycast hover check
    checkCityHover()

    // Move flyline photons
    animateFlylines(clock.getElapsedTime())

    renderer.render(scene, camera)
  }

  animate()

  // Bind mouse move for hover check
  renderer.domElement.addEventListener('mousemove', handleMouseMove)
}

// Map latitude and longitude to 3D Cartesian coordinates on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.sin(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.cos(theta)

  return new THREE.Vector3(x, y, z)
}

// Procedurally paint Earth map onto Canvas
const createProceduralEarthTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')

  if (!ctx) return new THREE.CanvasTexture(canvas)

  // 1. Fill base space background color
  ctx.fillStyle = '#060b13'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 2. Draw latitude and longitude grids
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)'
  ctx.lineWidth = 1
  const gridSpacing = 30
  for (let x = 0; x < canvas.width; x += gridSpacing) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  for (let y = 0; y < canvas.height; y += gridSpacing) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  // 3. Draw Dotted holographic continent landmasses procedurally
  // We specify rectangles bounding the approximate world landmasses
  const landmasses = [
    // Eurasia & Africa
    { x: 750, y: 150, w: 900, h: 600, density: 0.65 },
    // North America
    { x: 150, y: 150, w: 450, h: 400, density: 0.55 },
    // South America
    { x: 300, y: 550, w: 250, h: 400, density: 0.50 },
    // Australia
    { x: 1450, y: 650, w: 300, h: 250, density: 0.55 },
    // Greenland
    { x: 450, y: 50, w: 200, h: 100, density: 0.60 }
  ]

  // Paint land masses as thousands of tiny glowing microdots
  ctx.fillStyle = '#1e3a8a' // Dark Navy core
  landmasses.forEach((land) => {
    // Generate dots grid inside bounds
    const dotSpacing = 8
    for (let lx = land.x; lx < land.x + land.w; lx += dotSpacing) {
      for (let ly = land.y; ly < land.y + land.h; ly += dotSpacing) {
        // Procedurally skip border/edges to shape organic continents
        const noise = Math.sin(lx * 0.02) * Math.cos(ly * 0.02)
        const centerDistance = Math.sqrt(
          Math.pow((lx - (land.x + land.w/2)) / (land.w/2), 2) +
          Math.pow((ly - (land.y + land.h/2)) / (land.h/2), 2)
        )
        
        if (centerDistance < 0.95 && Math.random() < land.density + noise * 0.4) {
          // Inner core color
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)' // Cyan
          ctx.beginPath()
          ctx.arc(lx, ly, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  })

  // Create texture object
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// Generate city nodes and connecting flight arcs
const renderCitiesAndArcs = () => {
  const earthRadius = 1.2

  // 1. Put cities on globe
  cities.value.forEach((city) => {
    const pos = latLngToVector3(city.lat, city.lng, earthRadius)
    city.x = pos.x
    city.y = pos.y
    city.z = pos.z

    // Draw City Group
    const cityGroup = new THREE.Group()
    cityGroup.position.copy(pos)

    // Inner glowing core sphere
    const coreGeom = new THREE.SphereGeometry(0.025, 8, 8)
    const coreMat = new THREE.MeshBasicMaterial({ color: city.color })
    const coreMesh = new THREE.Mesh(coreGeom, coreMat)
    cityGroup.add(coreMesh)

    // Outer radar ring
    const ringGeom = new THREE.RingGeometry(0.03, 0.05, 16)
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: city.color, 
      side: THREE.DoubleSide, 
      transparent: true,
      opacity: 0.6
    })
    const ringMesh = new THREE.Mesh(ringGeom, ringMat)
    ringMesh.lookAt(new THREE.Vector3(0, 0, 0)) // Orient tangent to Earth surface
    cityGroup.add(ringMesh)

    // Save coreMesh to raycast list
    coreMesh.userData = { city }
    cityMeshList.push(coreMesh)

    earthGroup.add(cityGroup)
  })

  // 2. Generate Connecting Flight Arcs
  earthGroup.add(arcGroup)
  createNetworkArcs()
}

// Generate flyline Bezier curves connecting cities
interface FlyLine {
  curve: THREE.CatmullRomCurve3
  mesh: THREE.Line
  photon: THREE.Mesh
  speed: number
}
const flyLinesList: FlyLine[] = []

const createNetworkArcs = () => {
  const earthRadius = 1.2
  
  // Clean old curves if any
  while(arcGroup.children.length > 0){
    arcGroup.remove(arcGroup.children[0])
  }
  flyLinesList.length = 0

  if (!showArcs.value) return

  // Connect pairs of cities (e.g. Beijing to New York, Tokyo to London, etc.)
  const connections = [
    { from: cities.value[0], to: cities.value[3], color: '#f59e0b' }, // Beijing - NY
    { from: cities.value[0], to: cities.value[2], color: '#3b82f6' }, // Beijing - London
    { from: cities.value[1], to: cities.value[4], color: '#10b981' }, // Tokyo - Sydney
    { from: cities.value[2], to: cities.value[3], color: '#ec4899' }, // London - NY
    { from: cities.value[3], to: cities.value[4], color: '#14b8a6' }  // NY - Sydney
  ]

  connections.forEach((conn) => {
    const p1 = latLngToVector3(conn.from.lat, conn.from.lng, earthRadius)
    const p2 = latLngToVector3(conn.to.lat, conn.to.lng, earthRadius)

    // Calculate halfway point lifted high above surface to create arc
    const halfPos = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
    const distance = p1.distanceTo(p2)
    const arcHeight = earthRadius + distance * 0.35
    halfPos.normalize().multiplyScalar(arcHeight)

    // Generate smooth curve
    const curve = new THREE.CatmullRomCurve3([p1, halfPos, p2])

    // Draw static curve line
    const points = curve.getPoints(50)
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points)
    const lineMat = new THREE.LineBasicMaterial({
      color: conn.color,
      transparent: true,
      opacity: 0.25
    })
    const line = new THREE.Line(lineGeom, lineMat)
    arcGroup.add(line)

    // Create moving glowing photon dot
    const photonGeom = new THREE.SphereGeometry(0.015, 8, 8)
    const photonMat = new THREE.MeshBasicMaterial({ color: conn.color })
    const photon = new THREE.Mesh(photonGeom, photonMat)
    arcGroup.add(photon)

    // Save tracking details
    flyLinesList.push({
      curve,
      mesh: line,
      photon,
      speed: (0.2 + Math.random() * 0.3)
    })
  })
}

// Animate moving photons along curves
const animateFlylines = (time: number) => {
  flyLinesList.forEach((line) => {
    // Determine curve progress (0.0 to 1.0)
    const progress = (time * line.speed * arcSpeed.value) % 1.0
    const point = line.curve.getPointAt(progress)
    if (line.photon) {
      line.photon.position.copy(point)
    }
  })
}

// Watch mouse moves to raycast target cities
const handleMouseMove = (event: MouseEvent) => {
  if (!canvasContainer.value || !renderer) return
  const rect = renderer.domElement.getBoundingClientRect()
  
  // Calculate relative normalized coordinates (-1 to 1)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

// Raycast check
const checkCityHover = () => {
  if (!raycaster || !camera) return

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(cityMeshList)

  if (intersects.length > 0) {
    const coreMesh = intersects[0].object as THREE.Mesh
    const city = coreMesh.userData.city as City
    
    hoveredCity.value = city
    
    // Position tooltip popup in 2D space above canvas
    if (renderer && canvasContainer.value) {
      const pos3d = new THREE.Vector3(city.x, city.y, city.z)
      // Apply earth group rotation transformations
      pos3d.applyMatrix4(earthGroup.matrixWorld)
      // Project 3D vector coordinates to 2D view screen space
      pos3d.project(camera)

      const rect = renderer.domElement.getBoundingClientRect()
      tooltipPos.x = (pos3d.x + 1) * (rect.width / 2) + 12
      tooltipPos.y = -(pos3d.y - 1) * (rect.height / 2) - 50
    }
  } else {
    hoveredCity.value = null
  }
}

// Smoothly transition camera to focus on clicked city node
const focusOnCity = (city: City) => {
  if (!camera || !controls) return

  // Convert city lat/lng directly to Vector3
  const targetPos = latLngToVector3(city.lat, city.lng, 1.2 + 1.2) // Lift camera above city

  // Slowly rotate earthGroup to face camera, or rotate camera to face city
  // For simplicity, we interpolate camera coordinates to city pos relative to earthGroup rotation
  const worldPos = targetPos.clone().applyMatrix4(earthGroup.matrixWorld)

  // Reposition Camera
  camera.position.copy(worldPos.multiplyScalar(1.5))
  controls.target.copy(new THREE.Vector3(0,0,0))
  controls.update()
}

// Switches atmosphere layer visibility
const toggleAtmosphere = (val: string | number | boolean) => {
  if (atmosphereMesh) {
    atmosphereMesh.visible = !!val
  }
}

// Turn arcs on / off
const toggleArcs = () => {
  createNetworkArcs()
}

const handleResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return
  const width = canvasContainer.value.clientWidth
  const height = 480

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  initThree()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (renderer) {
    renderer.domElement.removeEventListener('mousemove', handleMouseMove)
    renderer.dispose()
    renderer.forceContextLoss()
  }

  if (controls) {
    controls.dispose()
  }

  scene?.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose())
      } else {
        obj.material.dispose()
      }
    }
  })
})

const earthCode = `// 3D 科技飞线地球仪核心逻辑
import * as THREE from 'three'

// 1. 经纬度转三维笛卡尔坐标
const latLngToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.sin(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.cos(theta)
  return new THREE.Vector3(x, y, z)
}

// 2. 利用 CanvasTexture 动态绘制世界轮廓贴图
const canvas = document.createElement('canvas')
// ... 使用 ctx.fillRect/ctx.arc 渲染数千个发光像素点模拟陆地
const texture = new THREE.CanvasTexture(canvas)

// 3. 构建大气边缘发光 (Atmosphere Glow Shader)
const atmosphereMat = new THREE.ShaderMaterial({
  vertexShader: \`
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \`,
  fragmentShader: \`
    varying vec3 vNormal;
    void main() {
      // 基于法线夹角强弱，向外衰减渲染发光半透明圆环
      float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1.0)), 2.5);
      gl_FragColor = vec4(0.22, 0.58, 0.97, 1.0) * intensity;
    }
  \`,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.three-demo-container {
  padding-bottom: 24px;
}

.canvas-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.webgl-container {
  width: 100%;
  height: 480px;
  background-color: #0a0f1d;
}

.canvas-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  
  .info-tag {
    background-color: rgba(10, 15, 29, 0.85);
    color: #60a5fa;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    border: 1px solid rgba(96, 165, 250, 0.25);
  }
}

.city-tooltip {
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 14px;
  z-index: 100;
  pointer-events: none;
  width: 160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  
  .tooltip-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 0.88rem;
    color: var(--text-primary);
  }
  
  .tooltip-body {
    p {
      margin: 2px 0;
      font-size: 0.78rem;
      color: var(--text-secondary);
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
  
  .flex-1 {
    flex: 1;
  }
  
  .ml-4 {
    margin-left: 16px;
  }
}

.city-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .city-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--bg-color-primary);
    border-radius: 6px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: $primary-color;
      background-color: rgba(99, 102, 241, 0.04);
    }
    
    .city-bullet {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 10px;
    }
    
    .city-name {
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 500;
      flex: 1;
    }
    
    .city-latlng {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-family: monospace;
    }
  }
}
</style>
