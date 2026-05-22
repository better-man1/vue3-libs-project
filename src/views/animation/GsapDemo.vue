<template>
  <div class="animation-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>动画特效</el-breadcrumb-item>
      <el-breadcrumb-item>GSAP 时间轴</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>GSAP 专业级 Web 动画引擎</h2>
      <p>探索 GreenSock Animation Platform (GSAP)。通过其高性能渲染核心，体验缓动过渡、时间线 (Timeline) 编排、多元素错落 (Stagger) 以及精细的播放控制。</p>
    </div>

    <el-row :gutter="20">
      <!-- Tween Controls & Canvas -->
      <el-col :xs="24" :lg="16">
        <el-row :gutter="20">
          <!-- Tween Control Card -->
          <el-col :span="24">
            <DemoCard 
              title="基础补间与控制 (Tween Control)" 
              description="通过控制按钮暂停、播放、反转和重置当前小球的平移路径"
              :code="gsapTweenCode"
            >
              <div class="animation-viewport">
                <div class="target-ball" ref="targetBall">🚀</div>
              </div>
              <div class="flex justify-center gap-2 mt-4 flex-wrap">
                <el-button type="primary" @click="controlTween('play')">▶️ 播放</el-button>
                <el-button type="warning" @click="controlTween('pause')">⏸️ 暂停</el-button>
                <el-button type="success" @click="controlTween('reverse')">◀️ 倒放</el-button>
                <el-button type="danger" @click="controlTween('restart')">🔄 重启</el-button>
              </div>
            </DemoCard>
          </el-col>

          <!-- Stagger Card -->
          <el-col :span="24" class="mt-4">
            <DemoCard 
              title="交错错落特效 (Stagger Grid)" 
              description="点击下方按钮，观察卡片以对角线或中心错落的优雅进入动画"
              :code="gsapStaggerCode"
            >
              <div class="stagger-grid">
                <div 
                  v-for="i in 15" 
                  :key="i" 
                  class="stagger-box"
                  ref="staggerBoxes"
                >
                  {{ i }}
                </div>
              </div>
              <div class="flex justify-center gap-2 mt-4">
                <el-button type="primary" @click="triggerStagger('center')">🎯 中心扩散</el-button>
                <el-button type="primary" @click="triggerStagger('edges')">↔️ 两侧往内</el-button>
                <el-button type="success" plain @click="triggerStagger('random')">🎲 随机闪烁</el-button>
              </div>
            </DemoCard>
          </el-col>
        </el-row>
      </el-col>

      <!-- Panel Controls -->
      <el-col :xs="24" :lg="8">
        <el-row :gutter="20">
          <!-- Timeline Control Card -->
          <el-col :span="24">
            <el-card shadow="hover" class="control-card">
              <template #header>
                <div class="card-header">
                  <span>🎬 编排时间轴 (GSAP Timeline)</span>
                </div>
              </template>

              <p class="desc-text">时间轴允许您把多个补间动画串联，制作连续剧般复杂的交互流程。</p>
              
              <div class="timeline-visualizer mb-4">
                <div class="timeline-step step-1" ref="step1">Step 1: 标题浮现</div>
                <div class="timeline-step step-2" ref="step2">Step 2: 边框拉伸</div>
                <div class="timeline-step step-3" ref="step3">Step 3: 图案旋转</div>
              </div>

              <div class="flex flex-col gap-2">
                <el-button type="primary" class="w-full" @click="playTimeline">
                  🚀 播放完整 Timeline 剧本
                </el-button>
                
                <div class="control-item-vertical mt-2">
                  <span class="label">全局动画速度: {{ timeScale }}x</span>
                  <el-slider 
                    v-model="timeScale" 
                    :min="0.2" 
                    :max="3" 
                    :step="0.1" 
                    @input="updateTimelineSpeed" 
                  />
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- Micro-interactions Card -->
          <el-col :span="24" class="mt-4">
            <el-card shadow="hover" class="control-card">
              <template #header>
                <div class="card-header">
                  <span>✨ 缓动效果探索 (Eases)</span>
                </div>
              </template>

              <div class="ease-selector">
                <el-select v-model="selectedEase" placeholder="选择缓动曲线..." class="w-full mb-4">
                  <el-option label="Linear (线性)" value="none" />
                  <el-option label="Power2.out (渐快渐慢)" value="power2.out" />
                  <el-option label="Elastic.out (回弹橡胶)" value="elastic.out(1, 0.3)" />
                  <el-option label="Bounce.out (重力弹跳)" value="bounce.out" />
                  <el-option label="Back.out (超出回弹)" value="back.out(1.7)" />
                </el-select>

                <div class="ease-test-lane">
                  <div class="ease-block" ref="easeBall">🔮</div>
                </div>

                <el-button type="primary" plain class="w-full mt-4" @click="triggerEaseDemo">
                  ⚡ 体验该缓动曲线
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import DemoCard from '@/components/common/DemoCard.vue'

// DOM elements
const targetBall = ref<HTMLDivElement | null>(null)
const staggerBoxes = ref<HTMLDivElement[]>([])
const step1 = ref<HTMLDivElement | null>(null)
const step2 = ref<HTMLDivElement | null>(null)
const step3 = ref<HTMLDivElement | null>(null)
const easeBall = ref<HTMLDivElement | null>(null)

// Parametric states
const timeScale = ref(1.0)
const selectedEase = ref('power2.out')

// Keep reference to GSAP animations
let tween: gsap.core.Tween
let timeline: gsap.core.Timeline

const initAnimations = () => {
  if (!targetBall.value) return

  // 1. Create a basic looping bounce tween
  tween = gsap.to(targetBall.value, {
    x: '250%',
    rotation: 360,
    duration: 2.5,
    ease: 'power1.inOut',
    repeat: -1,
    yoyo: true,
    paused: true
  })
  
  // Start playing by default
  tween.play()
}

// Tween control actions
const controlTween = (action: 'play' | 'pause' | 'reverse' | 'restart') => {
  if (!tween) return
  switch (action) {
    case 'play':
      tween.play()
      break
    case 'pause':
      tween.pause()
      break
    case 'reverse':
      tween.reverse()
      break
    case 'restart':
      tween.restart()
      break
  }
}

// Trigger stagger animation grid
const triggerStagger = (fromMode: 'center' | 'edges' | 'random' | number) => {
  if (staggerBoxes.value.length === 0) return

  gsap.fromTo(staggerBoxes.value, 
    { scale: 0.3, opacity: 0.1 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      stagger: {
        amount: 0.6,
        from: fromMode
      },
      ease: 'back.out(2)'
    }
  )
}

// Timeline Sequence
const playTimeline = () => {
  if (!step1.value || !step2.value || !step3.value) return

  // Kill previous active timeline if playing
  if (timeline) timeline.kill()

  timeline = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out' } })
  timeline.timeScale(timeScale.value)

  timeline
    .fromTo(step1.value, { opacity: 0, y: -20 }, { opacity: 1, y: 0 })
    .fromTo(step2.value, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1 }, '+=0.1')
    .fromTo(step3.value, { rotation: -180, opacity: 0, scale: 0.5 }, { rotation: 0, opacity: 1, scale: 1 }, '-=0.2')
}

// Update Timeline Speed scale
const updateTimelineSpeed = () => {
  if (timeline) {
    timeline.timeScale(timeScale.value)
  }
}

// Test Ease Curve
const triggerEaseDemo = () => {
  if (!easeBall.value) return

  gsap.fromTo(easeBall.value,
    { x: 0 },
    {
      x: '250%',
      duration: 1.5,
      ease: selectedEase.value,
      yoyo: true,
      repeat: 1
    }
  )
}

onMounted(() => {
  initAnimations()
  // Stagger entry by default on grid
  triggerStagger('center')
})

const gsapTweenCode = `// GSAP 基础补间动画声明与控制
import gsap from 'gsap'

// 创建补间动画引用
const tween = gsap.to(targetBall, {
  x: '250%',
  rotation: 360,
  duration: 2.5,
  ease: 'power1.inOut',
  repeat: -1,     // 无限循环
  yoyo: true,      // 往返播放
  paused: true
})

// 按需操纵播放器控制钩子
tween.play()
tween.pause()
tween.reverse()
tween.restart()`

const gsapStaggerCode = `// GSAP Stagger 网格交错错落进入特效
import gsap from 'gsap'

gsap.fromTo(staggerBoxes, 
  { scale: 0.3, opacity: 0.1 },
  {
    scale: 1,
    opacity: 1,
    duration: 0.8,
    stagger: {
      amount: 0.6,   // 动画分散在 0.6 秒内错落执行
      from: 'center' // 错落起点，可选: 'center', 'edges', 'random' 等
    },
    ease: 'back.out(2)'
  }
)`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.animation-demo-container {
  padding-bottom: 24px;
}

.animation-viewport {
  width: 100%;
  height: 120px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 40px;
  overflow: hidden;
  position: relative;
  
  .target-ball {
    width: 50px;
    height: 50px;
    background: radial-gradient(circle at 30% 30%, #a5b4fc, #4f46e5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.stagger-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  
  .stagger-box {
    aspect-ratio: 1;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary);
    backdrop-filter: blur(4px);
    transition: background-color 0.2s;
    user-select: none;
    
    &:hover {
      background-color: rgba(99, 102, 241, 0.15);
      color: $primary-color;
      border-color: rgba(99, 102, 241, 0.5);
    }
  }
}

.control-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
}

.desc-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: 16px;
}

.timeline-visualizer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .timeline-step {
    padding: 12px;
    background-color: var(--bg-color-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
    opacity: 0.2; /* Initialized as hidden/low opacity */
    
    &.step-1 {
      border-left: 4px solid #3b82f6;
    }
    &.step-2 {
      border-left: 4px solid #10b981;
      transform-origin: left;
    }
    &.step-3 {
      border-left: 4px solid #ec4899;
    }
  }
}

.control-item-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  .label {
    font-size: 0.82rem;
    color: var(--text-secondary);
  }
}

.ease-test-lane {
  width: 100%;
  height: 80px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  overflow: hidden;
  
  .ease-block {
    width: 40px;
    height: 40px;
    background: radial-gradient(circle at 30% 30%, #f472b6, #db2777);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
    user-select: none;
  }
}

.flex {
  display: flex;
}
.justify-center {
  justify-content: center;
}
.gap-2 {
  gap: 8px;
}
.mt-4 {
  margin-top: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.flex-wrap {
  flex-wrap: wrap;
}
.w-full {
  width: 100%;
}
</style>
