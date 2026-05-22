<template>
  <div class="animation-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>动画特效</el-breadcrumb-item>
      <el-breadcrumb-item>Anime.js 描边</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Anime.js 轻量级 JavaScript 动画库</h2>
      <p>体验 Anime.js 的核心特性：对 CSS 属性、SVG 矢量路径描边（Stroke Dashoffset）、JavaScript 对象参数以及复杂的关键帧序列（Keyframes）动画的极致操控。</p>
    </div>

    <el-row :gutter="20">
      <!-- Left Column: SVG drawing and Keyframes -->
      <el-col :xs="24" :lg="16">
        <el-row :gutter="20">
          <!-- SVG Line Drawing -->
          <el-col :span="24">
            <DemoCard
              title="SVG 描边描线动画 (SVG Path Drawing)"
              description="点击按钮利用 anime.setDashoffset 自动计算路径长度，并绘制线条与几何轮廓"
              :code="animeSvgCode"
            >
              <div class="svg-drawing-container">
                <svg viewBox="0 0 400 160" class="drawing-svg">
                  <!-- Hexagon -->
                  <polygon 
                    points="80,80 110,30 170,30 200,80 170,130 110,130"
                    class="draw-path"
                    ref="svgPolygon"
                  />
                  <!-- Inner Star -->
                  <polygon 
                    points="140,45 148,65 170,65 152,78 158,100 140,85 122,100 128,78 110,65 132,65" 
                    class="draw-path-accent"
                    ref="svgStar"
                  />
                  <!-- Futuristic Waves -->
                  <path 
                    d="M 230,80 Q 260,30 290,80 T 350,80" 
                    class="draw-path-wave"
                    ref="svgWave"
                  />
                </svg>
              </div>
              <div class="flex justify-center gap-2 mt-4">
                <el-button type="primary" @click="animateSvgDrawing">✍️ 绘制 SVG 轮廓</el-button>
                <el-button type="danger" plain @click="resetSvgDrawing">🔄 清除重置</el-button>
              </div>
            </DemoCard>
          </el-col>

          <!-- Keyframe Bounce -->
          <el-col :span="24" class="mt-4">
            <DemoCard
              title="关键帧连贯路径 (Keyframe Sequences)"
              description="通过数组形式的 Keyframes 分段控制小球，实现类似于路径轨迹与多维动作的复合运动"
              :code="animeKeyframesCode"
            >
              <div class="keyframes-viewport">
                <div class="grid-lane">
                  <div class="bouncing-cube cube-1" ref="cubeRef">✨</div>
                </div>
              </div>
              <div class="flex justify-center gap-2 mt-4">
                <el-button type="primary" @click="triggerKeyframes">⚡ 触发关键帧路线</el-button>
              </div>
            </DemoCard>
          </el-col>
        </el-row>
      </el-col>

      <!-- Right Column: Object counters & Stagger Options -->
      <el-col :xs="24" :lg="8">
        <el-row :gutter="20">
          <!-- JS Object Value Tween -->
          <el-col :span="24">
            <el-card shadow="hover" class="control-card">
              <template #header>
                <div class="card-header">
                  <span>🔢 JS 纯对象数值滚动 (Number Roll)</span>
                </div>
              </template>
              
              <p class="desc-text">Anime.js 不仅能操作 DOM 元素，还可以直接补间任意 JS 对象的数值，适用于数据大屏滚动计数器。</p>
              
              <div class="counter-display mb-4">
                <div class="counter-value">{{ currentCount.value.toFixed(0) }}</div>
                <div class="counter-label">注册活跃度 / 积分</div>
              </div>

              <div class="flex flex-col gap-2">
                <el-button type="primary" @click="rollNumber(5000)">📈 滚动至 5000</el-button>
                <el-button type="success" @click="rollNumber(9999)">🔥 冲击最高分 9999</el-button>
                <el-button type="info" plain @click="rollNumber(0)">🔄 归零</el-button>
              </div>
            </el-card>
          </el-col>

          <!-- Dom Property Grid Stagger -->
          <el-col :span="24" class="mt-4">
            <el-card shadow="hover" class="control-card">
              <template #header>
                <div class="card-header">
                  <span>🧩 弹性阶梯属性 (Stagger Grid)</span>
                </div>
              </template>

              <div class="stagger-boxes-row mb-4" ref="boxesContainer">
                <div v-for="i in 8" :key="i" class="mini-bar"></div>
              </div>

              <el-button type="primary" plain class="w-full" @click="triggerStaggerBars">
                🧬 激活多维度弹性交错
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { animate, createTimeline, stagger, createDrawable } from 'animejs'
import DemoCard from '@/components/common/DemoCard.vue'

// Refs for SVG Paths
const svgPolygon = ref<SVGPolygonElement | null>(null)
const svgStar = ref<SVGPolygonElement | null>(null)
const svgWave = ref<SVGPathElement | null>(null)

// Cube for Keyframes
const cubeRef = ref<HTMLDivElement | null>(null)

// Containers for mini bars
const boxesContainer = ref<HTMLDivElement | null>(null)

// Raw JS object for counter tween
const currentCount = reactive({ value: 0 })

// Reset state
const resetSvgDrawing = () => {
  if (!svgPolygon.value || !svgStar.value || !svgWave.value) return

  animate([
    createDrawable(svgPolygon.value),
    createDrawable(svgStar.value),
    createDrawable(svgWave.value)
  ], {
    draw: '0 0',
    duration: 500,
    ease: 'inOutQuad'
  })
}

// Animate SVG Line Tracing
const animateSvgDrawing = () => {
  if (!svgPolygon.value || !svgStar.value || !svgWave.value) return

  // Trace borders sequentially using anime timeline
  const tl = createTimeline({
    defaults: {
      ease: 'outQuad',
      duration: 1000
    }
  })

  tl.add(createDrawable(svgPolygon.value), {
    draw: '0 1',
    duration: 1200
  })
  .add(createDrawable(svgStar.value), {
    draw: '0 1',
    duration: 800
  }, '-=400')
  .add(createDrawable(svgWave.value), {
    draw: '0 1',
    duration: 600
  }, '-=200')
}

// Trigger multi-step Keyframe animation on Cube
const triggerKeyframes = () => {
  if (!cubeRef.value) return

  animate(cubeRef.value, {
    keyframes: [
      { translateY: -60, scaleY: 0.8, scaleX: 1.2, duration: 300, ease: 'outQuad' },
      { translateX: '200px', translateY: -60, rotation: 180, duration: 400, ease: 'linear' },
      { translateY: 0, scaleY: 1.2, scaleX: 0.8, duration: 300, ease: 'inQuad' },
      { translateX: 0, rotation: 360, scaleY: 1, scaleX: 1, duration: 500, ease: 'outBounce' }
    ]
  })
}

// Animate JS Object values
const rollNumber = (targetVal: number) => {
  animate(currentCount, {
    value: targetVal,
    round: 1, // Round values to integer during tween
    ease: 'outExpo',
    duration: 1800
  })
}

// Trigger stagger animation on vertical bars
const triggerStaggerBars = () => {
  if (!boxesContainer.value) return
  const bars = boxesContainer.value.querySelectorAll('.mini-bar')

  animate(bars, {
    scaleY: [
      { value: 2.5, duration: 300, ease: 'outQuad' },
      { value: 1.0, duration: 600, ease: 'outElastic(1, 0.4)' }
    ],
    backgroundColor: [
      { value: '#f43f5e', duration: 300 },
      { value: '#6366f1', duration: 600 }
    ],
    delay: stagger(100) // Stagger delay of 100ms per bar
  })
}

onMounted(() => {
  // Initialize SVG lines to be hidden (dashed out)
  if (svgPolygon.value && svgStar.value && svgWave.value) {
    animate([
      createDrawable(svgPolygon.value),
      createDrawable(svgStar.value),
      createDrawable(svgWave.value)
    ], {
      draw: '0 0',
      duration: 0
    })
  }
  // Run draw demo on load
  setTimeout(animateSvgDrawing, 500)
})

const animeSvgCode = `// Anime.js v4 SVG Path 线条手写描绘效果
import { animate, createDrawable } from 'animejs'

// 使用 createDrawable 包裹 SVG 元素，生成可供动画的代理对象
animate(createDrawable(svgPathElement), {
  draw: '0 1', // 绘制进度：从 0% 绘制到 100%
  duration: 1200,
  ease: 'outQuad'
})`

const animeKeyframesCode = `// Anime.js v4 关键帧分段轨迹动画
import { animate } from 'animejs'

animate(cubeRef, {
  keyframes: [
    { translateY: -60, scaleY: 0.8, scaleX: 1.2, duration: 300, ease: 'outQuad' },
    { translateX: '200px', translateY: -60, rotation: 180, duration: 400, ease: 'linear' },
    { translateY: 0, scaleY: 1.2, scaleX: 0.8, duration: 300, ease: 'inQuad' },
    { translateX: 0, rotation: 360, scaleY: 1, scaleX: 1, duration: 500, ease: 'outBounce' }
  ]
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.animation-demo-container {
  padding-bottom: 24px;
}

.svg-drawing-container {
  width: 100%;
  height: 180px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .drawing-svg {
    width: 100%;
    height: 100%;
    max-width: 400px;
  }
}

// SVG styles
.draw-path {
  fill: none;
  stroke: var(--text-secondary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.draw-path-accent {
  fill: none;
  stroke: $primary-color;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.draw-path-wave {
  fill: none;
  stroke: #10b981;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 4, 4; /* Dashed style */
}

.keyframes-viewport {
  width: 100%;
  height: 120px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  padding: 20px 40px;
  overflow: hidden;
  position: relative;
  
  .grid-lane {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .bouncing-cube {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #a7f3d0, #059669);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #ffffff;
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
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

.counter-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  
  .counter-value {
    font-size: 2.8rem;
    font-weight: 800;
    color: $primary-color;
    font-family: 'Outfit', sans-serif;
    letter-spacing: -1px;
    text-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }
  
  .counter-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 6px;
  }
}

.stagger-boxes-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0 20px;
  
  .mini-bar {
    width: 12px;
    height: 30px;
    background-color: var(--text-secondary);
    border-radius: 6px;
    transform-origin: bottom;
  }
}

.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
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
.mb-4 {
  margin-bottom: 16px;
}
.w-full {
  width: 100%;
}
</style>
