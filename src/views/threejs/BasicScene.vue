<template>
  <div class="three-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Three.js 3D 渲染</el-breadcrumb-item>
      <el-breadcrumb-item>基础三维场景</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Three.js 基础三维场景</h2>
      <p>认识 WebGL 3D 渲染的核心要素：场景 (Scene)、相机 (Camera)、渲染器 (Renderer) 以及鼠标轨道控制器 (OrbitControls)。</p>
    </div>

    <el-row :gutter="20">
      <!-- 3D Canvas Panel -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="3D 实时渲染视口" 
          description="使用鼠标左键拖拽旋转、右键平移、滚轮缩放场景中的立方体"
          :code="sceneCode"
        >
          <div class="canvas-wrapper">
            <div ref="canvasContainer" class="webgl-container"></div>
            <div class="canvas-overlay">
              <span class="fps-counter">渲染状态: Active (60fps)</span>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Interactive Controls Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 场景控制台</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">立方体样式</h4>
            <div class="control-item">
              <span class="label">网格颜色:</span>
              <el-color-picker v-model="cubeColor" @change="updateCubeColor" />
            </div>
            <div class="control-item">
              <span class="label">网格线框:</span>
              <el-switch v-model="isWireframe" @change="updateWireframe" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">旋转控制</h4>
            <div class="control-item">
              <span class="label">自动旋转:</span>
              <el-switch v-model="autoRotate" />
            </div>
            <div class="control-item-vertical">
              <span class="label">旋转速度 (X / Y轴):</span>
              <el-slider v-model="rotateSpeed" :min="0" :max="5" :step="0.1" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">网格大小</h4>
            <div class="control-item-vertical">
              <span class="label">宽度 (Width):</span>
              <el-slider v-model="cubeSize.width" :min="0.5" :max="3" :step="0.1" @input="rebuildGeometry" />
            </div>
            <div class="control-item-vertical">
              <span class="label">高度 (Height):</span>
              <el-slider v-model="cubeSize.height" :min="0.5" :max="3" :step="0.1" @input="rebuildGeometry" />
            </div>
            <div class="control-item-vertical">
              <span class="label">深度 (Depth):</span>
              <el-slider v-model="cubeSize.depth" :min="0.5" :max="3" :step="0.1" @input="rebuildGeometry" />
            </div>
          </div>

          <el-button type="warning" class="w-full mt-4" @click="resetCamera">
            重置相机视口
          </el-button>
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

// Control Reactive State
const cubeColor = ref('#6366f1')
const isWireframe = ref(false)
const autoRotate = ref(true)
const rotateSpeed = ref(1.5)
const cubeSize = reactive({
  width: 1.5,
  height: 1.5,
  depth: 1.5
})

// Three.js Core Objects
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let cubeMesh: THREE.Mesh
let animationId: number = 0

// Initialize Three.js Scene
const initThree = () => {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = 480

  // 1. Create Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a) // Slate 900 暗色背景

  // 2. Create Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(3, 3, 5)

  // 3. Create Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // 4. Create OrbitControls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 15
  controls.minDistance = 2

  // 5. Add Grid Helper & Axes Helper
  const gridHelper = new THREE.GridHelper(10, 10, 0x475569, 0x334155)
  gridHelper.position.y = -1
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(1.5)
  scene.add(axesHelper)

  // 6. Create Box Geometry & MeshStandardMaterial
  const geometry = new THREE.BoxGeometry(cubeSize.width, cubeSize.height, cubeSize.depth)
  const material = new THREE.MeshStandardMaterial({
    color: cubeColor.value,
    wireframe: isWireframe.value,
    roughness: 0.4,
    metalness: 0.1
  })
  cubeMesh = new THREE.Mesh(geometry, material)
  scene.add(cubeMesh)

  // 7. Add Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 8, 5)
  scene.add(directionalLight)

  // 8. Animation Loop
  const clock = new THREE.Clock()
  
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    // Orbit controls update
    controls.update()

    // Cube rotation logic
    if (autoRotate.value && cubeMesh) {
      const delta = clock.getDelta()
      cubeMesh.rotation.x += delta * (rotateSpeed.value * 0.3)
      cubeMesh.rotation.y += delta * (rotateSpeed.value * 0.5)
    }

    // Render Scene
    renderer.render(scene, camera)
  }

  animate()
}

// Rebuild Geometry when size sliders change
const rebuildGeometry = () => {
  if (!cubeMesh) return
  
  // Dispose old geometry to prevent memory leak
  cubeMesh.geometry.dispose()
  
  // Create and set new geometry
  cubeMesh.geometry = new THREE.BoxGeometry(
    cubeSize.width,
    cubeSize.height,
    cubeSize.depth
  )
}

// Update mesh color
const updateCubeColor = (color: string | null) => {
  if (!cubeMesh || !color) return
  const mat = cubeMesh.material as THREE.MeshStandardMaterial
  mat.color.set(color)
}

// Update wireframe mode
const updateWireframe = (val: string | number | boolean) => {
  if (!cubeMesh) return
  const mat = cubeMesh.material as THREE.MeshStandardMaterial
  mat.wireframe = !!val
}

// Reset camera view angle
const resetCamera = () => {
  if (camera && controls) {
    camera.position.set(3, 3, 5)
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

// Handle window resize
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
  // Cancel animation frame to stop render loops
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // Remove resize listeners
  window.removeEventListener('resize', handleResize)

  // Dispose orbit controls
  if (controls) {
    controls.dispose()
  }

  // Dispose of all scene assets (Geometries, Materials, Renderer)
  scene?.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => mat.dispose())
      } else {
        object.material.dispose()
      }
    }
  })

  // Dispose WebGL context
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }
})

const sceneCode = `// 核心场景初始化逻辑
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 1. 创建场景
const scene = new THREE.Scene()

// 2. 创建透视相机
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
camera.position.set(3, 3, 5)

// 3. 创建WebGL渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
container.appendChild(renderer.domElement)

// 4. 引入轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// 5. 渲染循环
const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  
  if (autoRotate) {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
  }
  
  renderer.render(scene, camera)
}
animate()`
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
  
  .fps-counter {
    background-color: rgba(15, 23, 42, 0.7);
    color: #38bdf8;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    border: 1px solid rgba(56, 189, 248, 0.2);
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

.mt-4 {
  margin-top: 16px;
}
</style>
