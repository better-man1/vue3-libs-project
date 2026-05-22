<template>
  <div class="three-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Three.js 3D 渲染</el-breadcrumb-item>
      <el-breadcrumb-item>粒子星空动画</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Three.js 粒子星空数学波形</h2>
      <p>高性能三维粒子系统 (Points)。通过在每一帧动态更新几何顶点属性，呈现由数学正弦/余弦函数驱动的波动星空大幕。</p>
    </div>

    <el-row :gutter="20">
      <!-- WebGL Render Window -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="3D Particle Render Window" 
          description="使用鼠标拖拽翻转星云，观察粒子排列的深度空间差感"
          :code="particleCode"
        >
          <div class="canvas-wrapper">
            <div ref="canvasContainer" class="webgl-container"></div>
            <div class="canvas-overlay">
              <span class="particle-status">当前粒子数: {{ particleCount }} 个</span>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Panel Control Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 粒子波动控制器</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">粒子属性</h4>
            <div class="control-item-vertical">
              <span class="label">粒子数量 (Count): {{ particleCount }}</span>
              <el-slider v-model="particleCount" :min="1000" :max="15000" :step="500" @input="rebuildParticles" />
            </div>
            <div class="control-item-vertical">
              <span class="label">粒子大小 (Size): {{ particleSize }}</span>
              <el-slider v-model="particleSize" :min="0.01" :max="0.2" :step="0.01" @input="updateParticleStyle" />
            </div>
            <div class="control-item">
              <span class="label">粒子色相:</span>
              <el-color-picker v-model="particleColor" @change="updateParticleStyle" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">波动参数 (Sine Wave)</h4>
            <div class="control-item-vertical">
              <span class="label">波动频率 (Frequency): {{ waveParams.frequency }}</span>
              <el-slider v-model="waveParams.frequency" :min="0.1" :max="2" :step="0.1" />
            </div>
            <div class="control-item-vertical">
              <span class="label">波动振幅 (Amplitude): {{ waveParams.amplitude }}</span>
              <el-slider v-model="waveParams.amplitude" :min="0.1" :max="1.5" :step="0.05" />
            </div>
            <div class="control-item-vertical">
              <span class="label">传播速度 (Speed): {{ waveParams.speed }}</span>
              <el-slider v-model="waveParams.speed" :min="0.2" :max="4" :step="0.1" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">互动模式</h4>
            <div class="control-item">
              <span class="label">镜头自动摇移:</span>
              <el-switch v-model="cameraOrbit" />
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

// Reactive Control State
const particleCount = ref(8000)
const particleSize = ref(0.04)
const particleColor = ref('#38bdf8')
const cameraOrbit = ref(true)
const waveParams = reactive({
  frequency: 0.8,
  amplitude: 0.4,
  speed: 1.5
})

// ThreeJS Core setup
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let particleSystem: THREE.Points
let particleGeom: THREE.BufferGeometry
let animationId: number = 0

// Track original grid positions
let originalPositions: Float32Array

// Init
const initThree = () => {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = 480

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05050a)

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 3, 6)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 15
  controls.minDistance = 2

  // Build Particles
  buildParticles()

  // Animate
  const clock = new THREE.Clock()
  
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    controls.update()

    const elapsedTime = clock.getElapsedTime()
    const time = elapsedTime * waveParams.speed

    // Dynamic wave animation logic: recalculate Y values for all particles
    if (particleSystem && particleGeom) {
      const positions = particleGeom.attributes.position.array as Float32Array
      const count = particleCount.value

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const x = originalPositions[i3]
        const z = originalPositions[i3 + 2]

        // Formula for concentric wave propagation from center
        const distance = Math.sqrt(x*x + z*z)
        positions[i3 + 1] = Math.sin(distance * waveParams.frequency - time) * waveParams.amplitude
      }
      
      // Tell WebGL to upload changed positions array buffer to GPU
      particleGeom.attributes.position.needsUpdate = true
    }

    // Camera Orbit sway
    if (cameraOrbit.value) {
      camera.position.x = Math.sin(elapsedTime * 0.1) * 6
      camera.position.z = Math.cos(elapsedTime * 0.1) * 6
      camera.lookAt(0, 0, 0)
    }

    renderer.render(scene, camera)
  }

  animate()
}

// Build and assign particles system
const buildParticles = () => {
  const count = particleCount.value
  
  particleGeom = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  
  // Arrange particles in a 2D plane grid system in 3D space
  const cols = Math.floor(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const spacing = 0.08

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const col = i % cols
    const row = Math.floor(i / cols)

    // Center the plane coordinates at (0, 0)
    positions[i3] = (col - cols / 2) * spacing
    positions[i3 + 1] = 0 // Initial flat height
    positions[i3 + 2] = (row - rows / 2) * spacing
  }

  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  
  // Save reference copy of original static coordinates
  originalPositions = new Float32Array(positions)

  // Generate glowing dot texture procedurally
  const pTexture = createCircularTexture()

  // Material with transparent additive blending
  const pMat = new THREE.PointsMaterial({
    color: particleColor.value,
    size: particleSize.value,
    transparent: true,
    opacity: 0.8,
    map: pTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  particleSystem = new THREE.Points(particleGeom, pMat)
  scene.add(particleSystem)
}

// Rebuild particles grid (when count changes)
const rebuildParticles = () => {
  if (!particleSystem) return

  scene.remove(particleSystem)
  particleGeom.dispose()
  const mat = particleSystem.material as THREE.PointsMaterial
  mat.dispose()

  buildParticles()
}

// Update color/size styles dynamically without rebuild
const updateParticleStyle = () => {
  if (!particleSystem) return
  const mat = particleSystem.material as THREE.PointsMaterial
  mat.color.set(particleColor.value)
  mat.size = particleSize.value
}

// Paint glowing circular dot texture on dynamic canvas
const createCircularTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Outer radial gradient for neon glow fadeout
    const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
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
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
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

const particleCode = `// 粒子系统创建与动态波动逻辑
import * as THREE from 'three'

// 1. 创建粒子几何体
const geom = new THREE.BufferGeometry()
const positions = new Float32Array(count * 3)
// 填充网格顶点平面数据...
geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// 2. 粒子材质 (融合发光模式)
const mat = new THREE.PointsMaterial({
  color: 0x38bdf8,
  size: 0.04,
  transparent: true,
  map: circularTexture,             // 渐变圆圈纹理
  blending: THREE.AdditiveBlending, // 加法混合模式，重叠处更亮
  depthWrite: false                 // 避免遮挡边缘锯齿
})
const points = new THREE.Points(geom, mat)
scene.add(points)

// 3. 在每一帧渲染中根据波形公式计算 Y 高度
const positions = geom.attributes.position.array
for (let i = 0; i < count; i++) {
  const i3 = i * 3
  const x = originalPositions[i3]
  const z = originalPositions[i3 + 2]
  
  // 经典同心圆正弦波扩散公式
  const dist = Math.sqrt(x*x + z*z)
  positions[i3 + 1] = Math.sin(dist * freq - time) * amp
}
geom.attributes.position.needsUpdate = true // 通知GPU刷新数据`
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
  background-color: #05050a;
}

.canvas-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  
  .particle-status {
    background-color: rgba(5, 5, 10, 0.8);
    color: #34d399;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    border: 1px solid rgba(52, 211, 153, 0.2);
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
</style>
