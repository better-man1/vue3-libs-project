<template>
  <div class="three-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Three.js 3D 渲染</el-breadcrumb-item>
      <el-breadcrumb-item>几何体展示</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Three.js 几何体展示</h2>
      <p>探索各种内置三维拓扑结构。调整细分数 (Segments) 探索多面体结构密度与显卡顶点渲染负荷之间的权衡。</p>
    </div>

    <el-row :gutter="20">
      <!-- 3D Canvas Panel -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="几何体渲染网格" 
          description="使用法线材质 (NormalMaterial) 渲染几何体表面，不同朝向的面展现不同颜色"
          :code="geometryCode"
        >
          <div class="canvas-wrapper">
            <div ref="canvasContainer" class="webgl-container"></div>
            <div class="canvas-overlay">
              <span class="info-tag">顶点数: {{ vertexCount }}</span>
              <span class="info-tag ml-2">三角面数: {{ faceCount }}</span>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Interactive Controls Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 几何体控制器</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">选择预设几何体</h4>
            <el-select v-model="selectedGeometry" @change="rebuildMesh" class="w-full">
              <el-option label="📦 立方体 (Box)" value="box" />
              <el-option label="⚽ 球体 (Sphere)" value="sphere" />
              <el-option label="🧪 圆柱体 (Cylinder)" value="cylinder" />
              <el-option label="🍩 圆环面 (Torus)" value="torus" />
              <el-option label="📐 圆锥体 (Cone)" value="cone" />
              <el-option label="🥨 扭结环 (TorusKnot)" value="torusknot" />
            </el-select>
          </div>

          <div class="control-group">
            <h4 class="group-title">网格显示属性</h4>
            <div class="control-item">
              <span class="label">渲染线框 (Wireframe):</span>
              <el-switch v-model="isWireframe" @change="updateWireframe" />
            </div>
            <div class="control-item">
              <span class="label">自动自转:</span>
              <el-switch v-model="autoRotate" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">网格精度控制</h4>
            
            <!-- Box segments -->
            <template v-if="selectedGeometry === 'box'">
              <div class="control-item-vertical">
                <span class="label">宽度段数 (Width Segments): {{ segments.boxSegments }}</span>
                <el-slider v-model="segments.boxSegments" :min="1" :max="20" @input="rebuildMesh" />
              </div>
            </template>

            <!-- Sphere segments -->
            <template v-if="selectedGeometry === 'sphere'">
              <div class="control-item-vertical">
                <span class="label">经度段数 (Width Segments): {{ segments.sphereW }}</span>
                <el-slider v-model="segments.sphereW" :min="3" :max="64" @input="rebuildMesh" />
              </div>
              <div class="control-item-vertical">
                <span class="label">纬度段数 (Height Segments): {{ segments.sphereH }}</span>
                <el-slider v-model="segments.sphereH" :min="2" :max="64" @input="rebuildMesh" />
              </div>
            </template>

            <!-- Cylinder segments -->
            <template v-if="selectedGeometry === 'cylinder'">
              <div class="control-item-vertical">
                <span class="label">圆周分段 (Radial Segments): {{ segments.cylinderRadial }}</span>
                <el-slider v-model="segments.cylinderRadial" :min="3" :max="64" @input="rebuildMesh" />
              </div>
              <div class="control-item-vertical">
                <span class="label">高度分段 (Height Segments): {{ segments.cylinderHeight }}</span>
                <el-slider v-model="segments.cylinderHeight" :min="1" :max="20" @input="rebuildMesh" />
              </div>
            </template>

            <!-- Torus segments -->
            <template v-if="selectedGeometry === 'torus'">
              <div class="control-item-vertical">
                <span class="label">环管段数 (Radial Segments): {{ segments.torusRadial }}</span>
                <el-slider v-model="segments.torusRadial" :min="3" :max="30" @input="rebuildMesh" />
              </div>
              <div class="control-item-vertical">
                <span class="label">环径段数 (Tubular Segments): {{ segments.torusTubular }}</span>
                <el-slider v-model="segments.torusTubular" :min="4" :max="100" @input="rebuildMesh" />
              </div>
            </template>

            <!-- TorusKnot segments -->
            <template v-if="selectedGeometry === 'torusknot'">
              <div class="control-item-vertical">
                <span class="label">环管段数 (Tubular Segments): {{ segments.knotTubular }}</span>
                <el-slider v-model="segments.knotTubular" :min="20" :max="200" @input="rebuildMesh" />
              </div>
              <div class="control-item-vertical">
                <span class="label">环径段数 (Radial Segments): {{ segments.knotRadial }}</span>
                <el-slider v-model="segments.knotRadial" :min="3" :max="30" @input="rebuildMesh" />
              </div>
            </template>
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

// Selection & Display Status
const selectedGeometry = ref('box')
const isWireframe = ref(false)
const autoRotate = ref(true)
const vertexCount = ref(0)
const faceCount = ref(0)

// Detailed Subdivision Segments
const segments = reactive({
  boxSegments: 1,
  sphereW: 32,
  sphereH: 16,
  cylinderRadial: 16,
  cylinderHeight: 1,
  torusRadial: 8,
  torusTubular: 48,
  knotTubular: 64,
  knotRadial: 8
})

// Three.js Core Setup
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let currentMesh: THREE.Mesh
let animationId: number = 0

// Initialize
const initThree = () => {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = 480

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 4)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 10
  controls.minDistance = 1.5

  // Lights (Even though MeshNormalMaterial doesn't require lights, adding for scene completion or expansions)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  // Create Mesh
  createMesh()

  // Animate
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    controls.update()

    if (autoRotate.value && currentMesh) {
      currentMesh.rotation.x += 0.005
      currentMesh.rotation.y += 0.01
    }

    renderer.render(scene, camera)
  }

  animate()
}

// Generate geometry based on selection and parameters
const getGeometry = (): THREE.BufferGeometry => {
  switch (selectedGeometry.value) {
    case 'box':
      return new THREE.BoxGeometry(
        1.5, 1.5, 1.5,
        segments.boxSegments, segments.boxSegments, segments.boxSegments
      )
    case 'sphere':
      return new THREE.SphereGeometry(
        1,
        segments.sphereW,
        segments.sphereH
      )
    case 'cylinder':
      return new THREE.CylinderGeometry(
        0.6, 0.6, 1.8,
        segments.cylinderRadial,
        segments.cylinderHeight
      )
    case 'torus':
      return new THREE.TorusGeometry(
        0.8, 0.3,
        segments.torusRadial,
        segments.torusTubular
      )
    case 'cone':
      return new THREE.ConeGeometry(
        0.8, 1.6,
        16, 1
      )
    case 'torusknot':
      return new THREE.TorusKnotGeometry(
        0.6, 0.2,
        segments.knotTubular,
        segments.knotRadial
      )
    default:
      return new THREE.BoxGeometry(1.5, 1.5, 1.5)
  }
}

// Instantiate/rebuild mesh
const createMesh = () => {
  const geom = getGeometry()
  
  // Use MeshNormalMaterial to visualize face normals nicely
  const mat = new THREE.MeshNormalMaterial({
    wireframe: isWireframe.value,
    side: THREE.DoubleSide
  })

  currentMesh = new THREE.Mesh(geom, mat)
  scene.add(currentMesh)

  updateCounts(geom)
}

// Update mesh when selection or segments change
const rebuildMesh = () => {
  if (!currentMesh) return

  // Dispose old assets to prevent memory leaks
  scene.remove(currentMesh)
  currentMesh.geometry.dispose()
  if (Array.isArray(currentMesh.material)) {
    currentMesh.material.forEach((m) => m.dispose())
  } else {
    currentMesh.material.dispose()
  }

  // Re-create
  createMesh()
}

// Update vertex count and face count details
const updateCounts = (geom: THREE.BufferGeometry) => {
  if (geom.index) {
    faceCount.value = geom.index.count / 3
  } else if (geom.attributes.position) {
    faceCount.value = geom.attributes.position.count / 3
  }
  vertexCount.value = geom.attributes.position ? geom.attributes.position.count : 0
}

// Toggle wireframe Mode
const updateWireframe = (val: string | number | boolean) => {
  if (!currentMesh) return
  const mat = currentMesh.material as THREE.MeshNormalMaterial
  mat.wireframe = !!val
}

// Handle window size changes
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

const geometryCode = `// 动态创建并销毁 Geometry 逻辑
import * as THREE from 'three'

// 1. 声明几何体获取函数
const getGeometryType = (type, params) => {
  switch(type) {
    case 'sphere':
      return new THREE.SphereGeometry(1, params.widthSeg, params.heightSeg)
    case 'torusknot':
      return new THREE.TorusKnotGeometry(0.6, 0.2, params.tubular, params.radial)
    // ...
  }
}

// 2. 切换时销毁并重建网格
const rebuildMesh = () => {
  if (currentMesh) {
    scene.remove(currentMesh)
    currentMesh.geometry.dispose() // 释放几何体内存
    currentMesh.material.dispose() // 释放材质内存
  }
  
  const geom = getGeometryType(selectedType, params)
  const mat = new THREE.MeshNormalMaterial({ wireframe: isWireframe })
  currentMesh = new THREE.Mesh(geom, mat)
  scene.add(currentMesh)
}`
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
  display: flex;
  
  .info-tag {
    background-color: rgba(15, 23, 42, 0.75);
    color: #fb7185;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    border: 1px solid rgba(251, 113, 133, 0.2);
  }
  
  .ml-2 {
    margin-left: 8px;
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

.control-item-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .el-slider {
    padding: 0 8px;
  }
}

.w-full {
  width: 100%;
}
</style>
