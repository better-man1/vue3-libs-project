<template>
  <div class="three-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Three.js 3D 渲染</el-breadcrumb-item>
      <el-breadcrumb-item>进阶 3D 场景</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Three.js 进阶：骨骼蒙皮与电影级后期辉光</h2>
      <p>探索程序化顶点 Rigging 蒙皮骨架结构，并应用 UnrealBloomPass 后期通道合成炫丽的霓虹发光与氛围渲染。</p>
    </div>

    <el-row :gutter="20">
      <!-- 3D WebGL Canvas Panel -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="进阶 3D 后期渲染视口" 
          description="程序化装配的蒙皮机械触手，由数学公式实时驱动骨骼链运动，配合后期 Bloom 辉光效果呈现科幻质感。"
          :code="advancedCode"
        >
          <div class="canvas-wrapper">
            <div ref="canvasContainer" class="webgl-container"></div>
            <div class="canvas-overlay">
              <span class="fps-counter">特效通道: {{ enableBloom ? 'UnrealBloom 电影级滤镜 (Active)' : '常规渲染 (Standard)' }}</span>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Interactive Controls Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 特效与控制台</span>
            </div>
          </template>

          <!-- 1. Post Processing Bloom Controls -->
          <div class="control-group">
            <h4 class="group-title">电影级后期特效 (Post-Processing)</h4>
            <div class="control-item">
              <span class="label">启用 Bloom 辉光:</span>
              <el-switch v-model="enableBloom" />
            </div>
            <div class="control-item-vertical" :class="{ 'disabled-control': !enableBloom }">
              <span class="label">辉光强度 (Glow Strength): {{ bloomParams.strength.toFixed(2) }}</span>
              <el-slider 
                v-model="bloomParams.strength" 
                :min="0" 
                :max="3" 
                :step="0.1" 
                :disabled="!enableBloom"
                @input="updateBloomParams"
              />
            </div>
            <div class="control-item-vertical" :class="{ 'disabled-control': !enableBloom }">
              <span class="label">辉光半径 (Glow Radius): {{ bloomParams.radius.toFixed(2) }}</span>
              <el-slider 
                v-model="bloomParams.radius" 
                :min="0" 
                :max="2" 
                :step="0.05" 
                :disabled="!enableBloom"
                @input="updateBloomParams"
              />
            </div>
            <div class="control-item-vertical" :class="{ 'disabled-control': !enableBloom }">
              <span class="label">辉光阈值 (Glow Threshold): {{ bloomParams.threshold.toFixed(2) }}</span>
              <el-slider 
                v-model="bloomParams.threshold" 
                :min="0" 
                :max="1" 
                :step="0.05" 
                :disabled="!enableBloom"
                @input="updateBloomParams"
              />
            </div>
          </div>

          <!-- 2. Skeletal Mesh Controls -->
          <div class="control-group">
            <h4 class="group-title">骨骼机械手臂参数</h4>
            <div class="control-item">
              <span class="label">触手颜色:</span>
              <el-color-picker v-model="armColor" @change="updateArmColor" />
            </div>
            <div class="control-item">
              <span class="label">自发光强度:</span>
              <el-slider v-model="emissiveIntensity" :min="0" :max="2" :step="0.1" @input="updateEmissiveIntensity" class="flex-1 ml-4" />
            </div>
            <div class="control-item">
              <span class="label">显示网格骨架:</span>
              <el-switch v-model="showSkeleton" @change="toggleSkeletonHelper" />
            </div>
          </div>

          <!-- 3. Bone Motion Controls -->
          <div class="control-group">
            <h4 class="group-title">动力学动画控制</h4>
            <div class="control-item">
              <span class="label">动画预设动作:</span>
              <el-select v-model="animationMode" placeholder="选择动作模式">
                <el-option label="波浪起伏" value="wave" />
                <el-option label="螺旋卷曲" value="spiral" />
                <el-option label="平滑收缩" value="contract" />
              </el-select>
            </div>
            <div class="control-item-vertical">
              <span class="label">运动速率 (Speed): {{ animationSpeed.toFixed(1) }}x</span>
              <el-slider v-model="animationSpeed" :min="0.2" :max="3" :step="0.1" />
            </div>
          </div>

          <div class="btn-group">
            <el-button type="primary" class="w-full" @click="resetCamera">
              重置视角
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 引入后期处理合成器和通道
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import DemoCard from '@/components/common/DemoCard.vue'

// DOM 挂载容器
const canvasContainer = ref<HTMLDivElement | null>(null)

// 响应式交互状态
const enableBloom = ref(true)
const bloomParams = reactive({
  strength: 1.5,
  radius: 0.6,
  threshold: 0.15
})
const armColor = ref('#00ffcc')
const emissiveIntensity = ref(0.8)
const showSkeleton = ref(false)
const animationMode = ref<'wave' | 'spiral' | 'contract'>('wave')
const animationSpeed = ref(1.0)

// Three.js 核心对象管理
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let clock: THREE.Clock
let animationId: number = 0

// 骨骼及骨架对象
let skinnedMesh: THREE.SkinnedMesh
let bones: THREE.Bone[] = []
let skeletonHelper: THREE.SkeletonHelper | null = null

// 后期处理合成器
let composer: EffectComposer
let bloomPass: UnrealBloomPass

// 背景发光柱子数组
interface NeonTower {
  mesh: THREE.Mesh
  baseIntensity: number
  color: number
}
let neonTowers: NeonTower[] = []

// 初始化场景与渲染器
const initThree = () => {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = 520

  // 1. 创建场景 (暗黑色科技风格)
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0f1d)
  scene.fog = new THREE.FogExp2(0x0a0f1d, 0.04) // 增加薄雾使远景更有深度感

  // 2. 创建透视相机
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(5, 5, 8)

  // 3. 创建 WebGL 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasContainer.value.appendChild(renderer.domElement)

  // 4. 初始化轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 20
  controls.minDistance = 3
  controls.target.set(0, 0.5, 0)

  clock = new THREE.Clock()

  // 5. 环境氛围构建 (地面网格辅助器)
  const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a)
  gridHelper.position.y = -2
  scene.add(gridHelper)

  // 6. 添加光影
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(5, 10, 5)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  scene.add(dirLight)

  // 点光源 (为底座增加霓虹氛围)
  const pointLight = new THREE.PointLight(0x00f0ff, 1.5, 10)
  pointLight.position.set(0, -1.8, 0)
  scene.add(pointLight)

  // 7. 渲染背景发光科幻霓虹柱
  createNeonEnvironment()

  // 8. 核心：创建蒙皮骨骼机械触手/手臂
  createSkinnedArm()

  // 9. 构建后期处理通道 (EffectComposer)
  initPostProcessing(width, height)

  // 10. 启动渲染循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    // 更新轨道控制器
    controls.update()

    const elapsedTime = clock.getElapsedTime()
    const time = elapsedTime * animationSpeed.value

    // 驱动骨骼链运动
    animateBones(time)

    // 驱动背景柱子光斑脉冲闪烁
    animateNeonTowers(time)

    // 渲染输出选择
    if (enableBloom.value && composer) {
      composer.render()
    } else {
      renderer.render(scene, camera)
    }
  }

  animate()
}

// 渲染科幻霓虹背景柱体
const createNeonEnvironment = () => {
  const towerGeom = new THREE.CylinderGeometry(0.12, 0.12, 4, 8)
  const towerColors = [0xff007f, 0x00f0ff, 0x7f00ff, 0x00ff7f]
  const positions = [
    { x: -4, z: -4 },
    { x: 4, z: -4 },
    { x: -4, z: 4 },
    { x: 4, z: 4 }
  ]

  for (let i = 0; i < 4; i++) {
    const towerMat = new THREE.MeshStandardMaterial({
      color: towerColors[i],
      emissive: towerColors[i],
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9
    })
    const mesh = new THREE.Mesh(towerGeom, towerMat)
    mesh.position.set(positions[i].x, 0, positions[i].z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    neonTowers.push({
      mesh,
      baseIntensity: 1.2,
      color: towerColors[i]
    })
  }
}

// 核心：创建程序化骨骼蒙皮触手
const createSkinnedArm = () => {
  const segmentHeight = 0.8
  const segmentCount = 5
  const height = segmentHeight * segmentCount
  const halfHeight = height / 2

  // 1. 创建圆柱几何体：圆柱段数设高，以便产生丝滑弯曲
  const radialSegments = 16
  const heightSegments = 30
  const geometry = new THREE.CylinderGeometry(
    0.15, // 顶端半径
    0.3,  // 底端半径
    height,
    radialSegments,
    heightSegments,
    false
  )

  // 2. 对几何体进行程序化 Rigging (顶点与骨骼权重绑定)
  const position = geometry.attributes.position
  const skinIndices: number[] = []
  const skinWeights: number[] = []

  for (let i = 0; i < position.count; i++) {
    // 获取当前顶点的 Y 坐标，并映射为 0 至 height 范围
    const y = position.getY(i) + halfHeight

    // 计算当前顶点所属的骨骼段位置
    const skinIndex = Math.min(segmentCount - 1, Math.floor(y / segmentHeight))
    // 相对该段骨骼的偏移，用于线性插值权重
    const skinWeight = (y % segmentHeight) / segmentHeight

    // 顶点权重绑定到相邻的两个骨骼
    skinIndices.push(skinIndex, Math.min(segmentCount - 1, skinIndex + 1), 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }

  // 写入顶点属性绑定到 GPU 渲染管线
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))

  // 3. 构建骨骼节点链路 (Bones Chain)
  bones = []
  let prevBone = new THREE.Bone()
  prevBone.position.y = -halfHeight // 起点在触手底部
  bones.push(prevBone)

  for (let i = 0; i < segmentCount; i++) {
    const bone = new THREE.Bone()
    bone.position.y = segmentHeight
    prevBone.add(bone)
    bones.push(bone)
    prevBone = bone
  }

  // 4. 创建蒙皮材质 (Skinned Material)
  const material = new THREE.MeshStandardMaterial({
    color: armColor.value,
    emissive: armColor.value,
    emissiveIntensity: emissiveIntensity.value,
    roughness: 0.2,
    metalness: 0.8,
    bumpScale: 0.05
  })

  // 5. 组装 SkinnedMesh
  skinnedMesh = new THREE.SkinnedMesh(geometry, material)
  skinnedMesh.position.y = 0.5 // 稍抬高使结构居中
  skinnedMesh.castShadow = true
  skinnedMesh.receiveShadow = true

  // 绑定骨架 (Skeleton)
  const skeleton = new THREE.Skeleton(bones)
  skinnedMesh.add(bones[0]) // 将根骨骼添加至网格容器中
  skinnedMesh.bind(skeleton)

  scene.add(skinnedMesh)

  // 6. 添加底座，增加整体机械结构的美感
  const baseGeom = new THREE.CylinderGeometry(0.5, 0.6, 0.4, 32)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.8 })
  const baseMesh = new THREE.Mesh(baseGeom, baseMat)
  baseMesh.position.y = -halfHeight + 0.3
  baseMesh.receiveShadow = true
  scene.add(baseMesh)
}

// 驱动骨骼链产生波浪/螺旋动画
const animateBones = (time: number) => {
  if (bones.length === 0) return

  for (let i = 0; i < bones.length; i++) {
    const bone = bones[i]

    if (animationMode.value === 'wave') {
      // 波浪正弦震荡：沿骨骼向上产生相位偏移，导致流畅的触手摆动
      bone.rotation.z = Math.sin(time * 2.5 + i * 0.7) * 0.16
      bone.rotation.x = Math.cos(time * 1.5 + i * 0.5) * 0.08
      bone.rotation.y = 0
    } else if (animationMode.value === 'spiral') {
      // 螺旋盘卷：叠加角度偏转，使其呈螺旋状回缩
      bone.rotation.z = (Math.sin(time * 1.8) * 0.12) + 0.18
      bone.rotation.y = Math.cos(time * 1.2) * 0.15
      bone.rotation.x = 0.08
    } else if (animationMode.value === 'contract') {
      // 收缩状态：平滑归位
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, 0, 0.05)
      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, 0, 0.05)
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, 0, 0.05)
    }
  }
}

// 驱动背景霓虹柱自发光脉冲发光
const animateNeonTowers = (time: number) => {
  neonTowers.forEach((tower, i) => {
    const mat = tower.mesh.material as THREE.MeshStandardMaterial
    // 通过正弦脉冲动态控制 emissiveIntensity
    const pulse = tower.baseIntensity + Math.sin(time * 3 + i) * 0.6
    mat.emissiveIntensity = pulse
  })
}

// 配置后期合成通道 (EffectComposer + UnrealBloomPass)
const initPostProcessing = (width: number, height: number) => {
  // 1. 创建效果合成器，替换原生 WebGLRenderer.render 通道
  composer = new EffectComposer(renderer)

  // 2. 加载基础渲染场景通道
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  // 3. 构建发光通道：分辨率、强度、发光半径、亮度过滤阈值
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    bloomParams.strength,
    bloomParams.radius,
    bloomParams.threshold
  )
  composer.addPass(bloomPass)

  // 4. 添加输出校色通道 (伽马与色调映射修正)
  const outputPass = new OutputPass()
  composer.addPass(outputPass)
}

// 实时响应 Element Plus 控制面板属性更新
const updateBloomParams = () => {
  if (bloomPass) {
    bloomPass.strength = bloomParams.strength
    bloomPass.radius = bloomParams.radius
    bloomPass.threshold = bloomParams.threshold
  }
}

const updateArmColor = (color: string | null) => {
  if (skinnedMesh && color) {
    const mat = skinnedMesh.material as THREE.MeshStandardMaterial
    mat.color.set(color)
    mat.emissive.set(color)
  }
}

const updateEmissiveIntensity = (val: number | number[]) => {
  if (skinnedMesh) {
    const mat = skinnedMesh.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = Array.isArray(val) ? val[0] : val
  }
}

// 骨架辅助器渲染控制
const toggleSkeletonHelper = (val: string | number | boolean) => {
  if (!skinnedMesh) return
  if (val) {
    skeletonHelper = new THREE.SkeletonHelper(skinnedMesh)
    // @ts-ignore
    skeletonHelper.material.linewidth = 2
    scene.add(skeletonHelper)
  } else {
    if (skeletonHelper) {
      scene.remove(skeletonHelper)
      skeletonHelper = null
    }
  }
}

// 重置相机焦距和视角
const resetCamera = () => {
  if (camera && controls) {
    camera.position.set(5, 5, 8)
    controls.target.set(0, 0.5, 0)
    controls.update()
  }
}

// 响应窗口 resize
const handleResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return
  const width = canvasContainer.value.clientWidth
  const height = 520

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  
  renderer.setSize(width, height)
  if (composer) {
    composer.setSize(width, height)
  }
}

onMounted(() => {
  // nextTick 保证容器 DOM 的 clientWidth 精准读取
  nextTick(() => {
    initThree()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  // 停止 requestAnimationFrame 渲染轴循环，杜绝后台 CPU 持续空转
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  window.removeEventListener('resize', handleResize)

  // 释放轨道控制器
  if (controls) {
    controls.dispose()
  }

  // 遍历并手动销毁场景中的全部 Mesh (防止 GPU 显存泄漏)
  scene?.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat) => mat.dispose())
      } else {
        obj.material.dispose()
      }
    }
  })

  // 注销发光后期通道
  if (composer) {
    composer.dispose()
  }

  // 强制 WebGL 上下文释放
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }
})

// 展示在大屏右侧的完整源码案例
const advancedCode = `// 骨骼绑定 (Rigging) 与 UnrealBloom 后期通道核心代码
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// 1. 创建高度分段圆柱体并装配顶点权重
const geometry = new THREE.CylinderGeometry(0.15, 0.3, 4, 16, 30)
const position = geometry.attributes.position
const skinIndices = [], skinWeights = []
const segmentHeight = 0.8

for (let i = 0; i < position.count; i++) {
  const y = position.getY(i) + 2 // 归一化至 Y 轴正轴段
  const skinIndex = Math.min(4, Math.floor(y / segmentHeight))
  const skinWeight = (y % segmentHeight) / segmentHeight

  skinIndices.push(skinIndex, Math.min(4, skinIndex + 1), 0, 0)
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
}
geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))

// 2. 建立父子相扣的骨骼链 (Bones Chain)
const bones = []
let rootBone = new THREE.Bone()
rootBone.position.y = -2
bones.push(rootBone)

for (let i = 0; i < 5; i++) {
  const bone = new THREE.Bone()
  bone.position.y = segmentHeight
  bones[bones.length - 1].add(bone)
  bones.push(bone)
}

// 3. 构建 SkinnedMesh 蒙皮绑定
const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00ffcc })
const skinnedMesh = new THREE.SkinnedMesh(geometry, material)
const skeleton = new THREE.Skeleton(bones)
skinnedMesh.add(bones[0])
skinnedMesh.bind(skeleton)
scene.add(skinnedMesh)

// 4. 后期处理 (Bloom 辉光通道) 配置
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(width, height),
  1.5, // 强度
  0.6, // 半径
  0.15 // 亮度过滤阈值
)
composer.addPass(bloomPass)

// 5. 渲染循环中利用 Math.sin 驱动骨骼摆动
const animate = () => {
  requestAnimationFrame(animate)
  const time = clock.getElapsedTime()
  
  bones.forEach((bone, index) => {
    // 渐进波形摆动
    bone.rotation.z = Math.sin(time * 2.5 + index * 0.7) * 0.16
  })
  
  composer.render()
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
  height: 520px;
  background-color: #0a0f1d;
}

.canvas-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  
  .fps-counter {
    background-color: rgba(10, 15, 29, 0.85);
    color: #00ffcc;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    border: 1px solid rgba(0, 255, 204, 0.3);
    box-shadow: 0 4px 12px rgba(0, 255, 204, 0.1);
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
  margin-bottom: 12px;
  
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
  transition: opacity 0.2s;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .el-slider {
    padding: 0 8px;
  }
  
  &.disabled-control {
    opacity: 0.4;
    pointer-events: none;
  }
}

.flex-1 {
  flex: 1;
}

.ml-4 {
  margin-left: 16px;
}

.w-full {
  width: 100%;
}
</style>
