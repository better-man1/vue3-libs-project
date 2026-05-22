<template>
  <div class="three-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Three.js 3D 渲染</el-breadcrumb-item>
      <el-breadcrumb-item>材质与光照</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Three.js 材质与光源</h2>
      <p>探索各种物理与非物理材质，配合平行光 (Directional)、环境光 (Ambient)、点光源 (Point)、聚光灯 (Spot) 观察逼真的投影与阴影映射。</p>
    </div>

    <el-row :gutter="20">
      <!-- 3D Canvas -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="光影交互视口" 
          description="调节右侧面板控制光源亮度和材质类型，拖动鼠标旋转观察反射高光"
          :code="lightCode"
        >
          <div class="canvas-wrapper">
            <div ref="canvasContainer" class="webgl-container"></div>
            <div class="canvas-overlay">
              <span class="active-light">活跃光源: Ambient + Directional + Point + Spot</span>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Controls Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 光影参数调节</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">网格材质类型</h4>
            <el-select v-model="selectedMaterial" @change="updateMaterial" class="w-full">
              <el-option label="🎨 基础材质 (MeshBasicMaterial — 无光照)" value="basic" />
              <el-option label="🪵 兰伯特 (MeshLambertMaterial — 漫反射)" value="lambert" />
              <el-option label="💎 冯氏材质 (MeshPhongMaterial — 镜面高光)" value="phong" />
              <el-option label="🦾 标准材质 (MeshStandardMaterial — PBR)" value="standard" />
            </el-select>
          </div>

          <div class="control-group" v-if="selectedMaterial === 'standard'">
            <h4 class="group-title">PBR 材质微调</h4>
            <div class="control-item-vertical">
              <span class="label">金属度 (Metalness): {{ pbrProps.metalness }}</span>
              <el-slider v-model="pbrProps.metalness" :min="0" :max="1" :step="0.05" @input="updatePbr" />
            </div>
            <div class="control-item-vertical">
              <span class="label">粗糙度 (Roughness): {{ pbrProps.roughness }}</span>
              <el-slider v-model="pbrProps.roughness" :min="0" :max="1" :step="0.05" @input="updatePbr" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">光源控制</h4>
            
            <!-- Ambient -->
            <div class="light-control-block">
              <div class="light-title">
                <span class="dot ambient-dot"></span>
                <span>环境光 (AmbientLight)</span>
              </div>
              <div class="control-item">
                <span class="label">强度 (Intensity):</span>
                <el-slider v-model="lights.ambient" :min="0" :max="2" :step="0.1" @input="updateLights" class="flex-1 ml-4" />
              </div>
            </div>

            <!-- Directional -->
            <div class="light-control-block">
              <div class="light-title">
                <span class="dot directional-dot"></span>
                <span>平行太阳光 (DirectionalLight)</span>
              </div>
              <div class="control-item">
                <span class="label">强度 (Intensity):</span>
                <el-slider v-model="lights.directional" :min="0" :max="3" :step="0.1" @input="updateLights" class="flex-1 ml-4" />
              </div>
            </div>

            <!-- Point Light -->
            <div class="light-control-block">
              <div class="light-title">
                <span class="dot point-dot"></span>
                <span>动态点光源 (PointLight — 旋转)</span>
              </div>
              <div class="control-item">
                <span class="label">强度 (Intensity):</span>
                <el-slider v-model="lights.point" :min="0" :max="5" :step="0.1" @input="updateLights" class="flex-1 ml-4" />
              </div>
            </div>

            <!-- Spot Light -->
            <div class="light-control-block">
              <div class="light-title">
                <span class="dot spot-dot"></span>
                <span>聚光灯 (SpotLight — 束光)</span>
              </div>
              <div class="control-item">
                <span class="label">强度 (Intensity):</span>
                <el-slider v-model="lights.spot" :min="0" :max="8" :step="0.1" @input="updateLights" class="flex-1 ml-4" />
              </div>
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">辅助指示器</h4>
            <div class="control-item">
              <span class="label">显示光源网格辅助线:</span>
              <el-switch v-model="showHelpers" @change="toggleHelpers" />
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

// DOM Reference
const canvasContainer = ref<HTMLDivElement | null>(null)

// Control values
const selectedMaterial = ref('standard')
const showHelpers = ref(false)
const pbrProps = reactive({
  metalness: 0.6,
  roughness: 0.2
})
const lights = reactive({
  ambient: 0.4,
  directional: 1.5,
  point: 2.0,
  spot: 4.0
})

// Three.js Core Setup
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number = 0

// Mesh items
let sphereMesh: THREE.Mesh
let cubeMesh: THREE.Mesh
let torusMesh: THREE.Mesh
let floorMesh: THREE.Mesh

// Light items & Helpers
let ambientLight: THREE.AmbientLight
let dirLight: THREE.DirectionalLight
let pointLight: THREE.PointLight
let spotLight: THREE.SpotLight

let dirHelper: THREE.DirectionalLightHelper
let pointHelper: THREE.PointLightHelper
let spotHelper: THREE.SpotLightHelper

const initThree = () => {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = 480

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 4, 8)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // Enable shadows
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasContainer.value.appendChild(renderer.domElement)

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 15
  controls.minDistance = 3

  // Initialize objects with Standard Material
  const mat = getSelectedMaterial()

  // Torus
  const torusGeom = new THREE.TorusGeometry(0.5, 0.2, 16, 48)
  torusMesh = new THREE.Mesh(torusGeom, mat)
  torusMesh.position.set(-1.8, 0.7, 0)
  torusMesh.castShadow = true
  torusMesh.receiveShadow = true
  scene.add(torusMesh)

  // Sphere
  const sphereGeom = new THREE.SphereGeometry(0.7, 32, 32)
  sphereMesh = new THREE.Mesh(sphereGeom, mat)
  sphereMesh.position.set(0, 0.7, 0)
  sphereMesh.castShadow = true
  sphereMesh.receiveShadow = true
  scene.add(sphereMesh)

  // Cube
  const cubeGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2)
  cubeMesh = new THREE.Mesh(cubeGeom, mat)
  cubeMesh.position.set(1.8, 0.6, 0)
  cubeMesh.castShadow = true
  cubeMesh.receiveShadow = true
  scene.add(cubeMesh)

  // Ground Floor
  const floorGeom = new THREE.PlaneGeometry(15, 15)
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 0.8,
    metalness: 0.1
  })
  floorMesh = new THREE.Mesh(floorGeom, floorMat)
  floorMesh.rotation.x = -Math.PI / 2
  floorMesh.position.y = 0
  floorMesh.receiveShadow = true
  scene.add(floorMesh)

  // 1. Ambient Light
  ambientLight = new THREE.AmbientLight(0xffffff, lights.ambient)
  scene.add(ambientLight)

  // 2. Directional Sun Light
  dirLight = new THREE.DirectionalLight(0xffffff, lights.directional)
  dirLight.position.set(3, 6, 3)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  dirLight.shadow.bias = -0.001
  scene.add(dirLight)

  dirHelper = new THREE.DirectionalLightHelper(dirLight, 0.5, 0x38bdf8)
  dirHelper.visible = showHelpers.value
  scene.add(dirHelper)

  // 3. Point Light (Orange-Red glowing ball)
  pointLight = new THREE.PointLight(0xf97316, lights.point, 10)
  pointLight.position.set(0, 2.5, 2)
  pointLight.castShadow = true
  scene.add(pointLight)

  // Point light indicator mesh (tiny sphere inside bulb)
  const pointIndicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xf97316 })
  )
  pointLight.add(pointIndicator)

  pointHelper = new THREE.PointLightHelper(pointLight, 0.15, 0xf97316)
  pointHelper.visible = showHelpers.value
  scene.add(pointHelper)

  // 4. Spot Light (Purple-Indigo beam)
  spotLight = new THREE.SpotLight(0x6366f1, lights.spot, 12, Math.PI / 6, 0.5, 1)
  spotLight.position.set(0, 5, 0)
  spotLight.target = sphereMesh
  spotLight.castShadow = true
  spotLight.shadow.mapSize.width = 1024
  spotLight.shadow.mapSize.height = 1024
  scene.add(spotLight)

  spotHelper = new THREE.SpotLightHelper(spotLight, 0x6366f1)
  spotHelper.visible = showHelpers.value
  scene.add(spotHelper)

  // Clock for point light rotation animation
  const clock = new THREE.Clock()

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    controls.update()

    // Rotate Meshes
    if (sphereMesh) sphereMesh.rotation.y += 0.002
    if (cubeMesh) {
      cubeMesh.rotation.y += 0.005
      cubeMesh.rotation.x += 0.003
    }
    if (torusMesh) {
      torusMesh.rotation.x += 0.005
      torusMesh.rotation.y += 0.005
    }

    // Dynamic point light orbit path rotation
    const elapsed = clock.getElapsedTime()
    pointLight.position.x = Math.sin(elapsed * 1.2) * 2.5
    pointLight.position.z = Math.cos(elapsed * 1.2) * 2.5
    pointLight.position.y = 1.2 + Math.abs(Math.sin(elapsed * 2)) * 1.5

    // Helper updates
    if (showHelpers.value) {
      dirHelper.update()
      pointHelper.update()
      spotHelper.update()
    }

    renderer.render(scene, camera)
  }

  animate()
}

// Map key to Material class
const getSelectedMaterial = (): THREE.Material => {
  const baseColor = 0x6366f1 // Indigo 500
  
  switch (selectedMaterial.value) {
    case 'basic':
      return new THREE.MeshBasicMaterial({ color: baseColor })
    case 'lambert':
      return new THREE.MeshLambertMaterial({ color: baseColor })
    case 'phong':
      return new THREE.MeshPhongMaterial({ 
        color: baseColor, 
        shininess: 80, 
        specular: 0xffffff 
      })
    case 'standard':
    default:
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: pbrProps.metalness,
        roughness: pbrProps.roughness
      })
  }
}

// Update mesh materials
const updateMaterial = () => {
  const mat = getSelectedMaterial()

  // Replace meshes' materials and dispose old ones
  const updateMeshMat = (mesh: THREE.Mesh) => {
    if (!mesh) return
    const oldMat = mesh.material as THREE.Material
    oldMat.dispose()
    mesh.material = mat
  }

  updateMeshMat(sphereMesh)
  updateMeshMat(cubeMesh)
  updateMeshMat(torusMesh)
}

// Apply reactive PBR sliders
const updatePbr = () => {
  if (selectedMaterial.value !== 'standard') return
  
  const updateMeshPbr = (mesh: THREE.Mesh) => {
    if (!mesh) return
    const mat = mesh.material as THREE.MeshStandardMaterial
    mat.metalness = pbrProps.metalness
    mat.roughness = pbrProps.roughness
  }

  updateMeshPbr(sphereMesh)
  updateMeshPbr(cubeMesh)
  updateMeshPbr(torusMesh)
}

// Sync lighting intensity values
const updateLights = () => {
  if (ambientLight) ambientLight.intensity = lights.ambient
  if (dirLight) dirLight.intensity = lights.directional
  if (pointLight) pointLight.intensity = lights.point
  if (spotLight) spotLight.intensity = lights.spot
}

// Turn helpers on / off
const toggleHelpers = (val: string | number | boolean) => {
  const visible = !!val
  if (dirHelper) dirHelper.visible = visible
  if (pointHelper) pointHelper.visible = visible
  if (spotHelper) spotHelper.visible = visible
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

  window.removeEventListener('resize', handleResize)

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

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }
})

const lightCode = `// 光源与阴影的核心配置
import * as THREE from 'three'

// 1. 开启渲染器阴影映射
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// 2. 添加产生投影的平行光源
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
dirLight.position.set(3, 6, 3)
dirLight.castShadow = true // 投射阴影
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
scene.add(dirLight)

// 3. 配置几何体接收/投射阴影
mesh.castShadow = true     // 自身投影
mesh.receiveShadow = true  // 接收投影

// 4. 创建接收投影的地面
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0x1e293b })
)
floor.receiveShadow = true
scene.add(floor)

// 5. 添加指示器以方便调试
const helper = new THREE.DirectionalLightHelper(dirLight, 0.5)
scene.add(helper)`
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
  background-color: #0f172a;
}

.canvas-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  
  .active-light {
    background-color: rgba(15, 23, 42, 0.75);
    color: #a78bfa;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    border: 1px solid rgba(167, 139, 250, 0.2);
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

.control-item-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .el-slider {
    padding: 0 8px;
  }
}

.light-control-block {
  background-color: var(--bg-color-primary);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  border: 1px solid var(--border-color);
  
  .light-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--text-primary);
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .ambient-dot { background-color: #e2e8f0; }
    .directional-dot { background-color: #eab308; }
    .point-dot { background-color: #f97316; }
    .spot-dot { background-color: #6366f1; }
  }
}

.w-full {
  width: 100%;
}
</style>
