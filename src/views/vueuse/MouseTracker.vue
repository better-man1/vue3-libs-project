<template>
  <div class="vueuse-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>VueUse 常用库</el-breadcrumb-item>
      <el-breadcrumb-item>鼠标轨迹追踪</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>VueUse: 鼠标与手势追踪 Hooks</h2>
      <p>体验 VueUse 的 `useMouse` 和 `useMouseInElement` 组合式函数。通过高反应率的反应式坐标，可以实现鼠标聚光灯追踪、悬浮悬窗及 2.5D 平移交互效果。</p>
    </div>

    <el-row :gutter="20">
      <!-- Spotlight Glowing Card -->
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="探照灯鼠标追踪卡片 (Spotlight Card)"
          description="将鼠标悬浮并划过卡片。利用 useMouseInElement 获取的相对坐标，计算渐变原点，可生成实时跟随鼠标的发光光斑特效。"
          :code="mouseTrackerCode"
        >
          <div 
            ref="spotlightCard" 
            class="spotlight-card"
            :style="{
              '--x': `${elementX}px`,
              '--y': `${elementY}px`,
            }"
          >
            <div class="card-inner">
              <div class="hover-coordinates" v-if="isOutside">
                <span class="status-badge outside">⏸️ 鼠标未进入卡片</span>
              </div>
              <div class="hover-coordinates" v-else>
                <span class="status-badge inside">⚡ 追踪中: X: {{ elementX }}px | Y: {{ elementY }}px</span>
              </div>

              <h4>玻璃拟态材质与探照灯渐变</h4>
              <p>这个容器由 CSS 自定义变量 `--x` 和 `--y` 驱动。当鼠标在卡片上方移动时，JS 会实时修改这两个变量，而 CSS 的 `radial-gradient` 会使用该属性更新径向渐变的发光中心：</p>
              <code>background: radial-gradient(circle at var(--x) var(--y), rgba(99,102,241,0.15) 0%, transparent 80%)</code>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Global Coordinates Card -->
      <el-col :xs="24" :lg="8">
        <el-row :gutter="20">
          <!-- Coordinates Visualizer -->
          <el-col :span="24">
            <el-card shadow="hover" class="coords-card">
              <template #header>
                <div class="card-header">
                  <span>🌍 全局屏幕坐标 (useMouse)</span>
                </div>
              </template>
              
              <div class="coordinate-board">
                <div class="coord-item">
                  <div class="label">Client X</div>
                  <div class="val">{{ x }}<span class="unit">px</span></div>
                </div>
                <div class="coord-item">
                  <div class="label">Client Y</div>
                  <div class="val">{{ y }}<span class="unit">px</span></div>
                </div>
              </div>

              <div class="info-block mt-4">
                <h5>📐 渲染原理</h5>
                <p class="desc-text">
                  `useMouse` 会在 `window` 上自动绑定 `mousemove` 事件，并在组件销毁（onUnmounted）时自动卸载事件监听。
                </p>
              </div>
            </el-card>
          </el-col>

          <!-- Follower Sandbox -->
          <el-col :span="24" class="mt-4">
            <el-card shadow="hover" class="follower-card">
              <template #header>
                <div class="card-header">
                  <span>🎒 延迟跟随光点</span>
                </div>
              </template>
              
              <div class="follower-sandbox" ref="sandboxRef">
                <div class="helper-text">在此区域移动，观察绿色跟踪环的物理缓动</div>
                <div 
                  class="follower-ring"
                  :style="{
                    left: `${smoothX}px`,
                    top: `${smoothY}px`,
                    opacity: isSandboxOutside ? 0 : 1
                  }"
                ></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMouse, useMouseInElement } from '@vueuse/core'
import DemoCard from '@/components/common/DemoCard.vue'

// 1. Global coordinates using useMouse
const { x, y } = useMouse()

// 2. Element relative coordinates using useMouseInElement
const spotlightCard = ref<HTMLDivElement | null>(null)
const { 
  elementX, 
  elementY, 
  isOutside 
} = useMouseInElement(spotlightCard)

// 3. Follower ring inside a sandbox using useMouseInElement
const sandboxRef = ref<HTMLDivElement | null>(null)
const {
  elementX: sandX,
  elementY: sandY,
  isOutside: isSandboxOutside
} = useMouseInElement(sandboxRef)

// Smooth damping logic for the follower ring
const smoothX = ref(0)
const smoothY = ref(0)

// Standard interpolation animation frame
const updateFollower = () => {
  if (isSandboxOutside.value) return
  // Target position minus 15px to center the 30px ring
  const targetX = sandX.value - 15
  const targetY = sandY.value - 15
  
  // Damping formula: current + (target - current) * factor
  smoothX.value += (targetX - smoothX.value) * 0.15
  smoothY.value += (targetY - smoothY.value) * 0.15

  requestAnimationFrame(updateFollower)
}

// Watch mouse entry to spark animation loop
watch(isSandboxOutside, (outside) => {
  if (!outside) {
    // Reset to start coordinates instantly to avoid long travel line
    smoothX.value = sandX.value - 15
    smoothY.value = sandY.value - 15
    updateFollower()
  }
})

const mouseTrackerCode = `// VueUse: useMouse 与 useMouseInElement 的配合用法
import { ref } from 'vue'
import { useMouse, useMouseInElement } from '@vueuse/core'

// 1. 全局鼠标事件监听追踪
const { x, y } = useMouse()

// 2. 元素相对内部坐标监听追踪（自带进入/离开检测）
const elementRef = ref<HTMLElement | null>(null)
const { 
  elementX,     // 相对该元素的 X 轴像素位置
  elementY,     // 相对该元素的 Y 轴像素位置
  isOutside     // 鼠标是否不在该元素边界内
} = useMouseInElement(elementRef)`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.vueuse-demo-container {
  padding-bottom: 24px;
}

// Spotlight CSS variable styling
.spotlight-card {
  width: 100%;
  border-radius: 12px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  padding: 1px; /* Required to let gradient act as a border border glowing */
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  
  // Glowing spotlight gradient overlay
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle 250px at var(--x) var(--y), 
      rgba(99, 102, 241, 0.15), 
      transparent 80%
    );
    z-index: 1;
    pointer-events: none;
  }
  
  // Thin border spotlight glow
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle 120px at var(--x) var(--y), 
      rgba(99, 102, 241, 0.35), 
      transparent 80%
    );
    z-index: 0;
    pointer-events: none;
  }

  .card-inner {
    background-color: var(--bg-color-secondary);
    border-radius: 11px;
    padding: 30px;
    position: relative;
    z-index: 2;
    height: 100%;
    
    h4 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 1.15rem;
      color: var(--text-primary);
    }
    
    p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    code {
      display: block;
      padding: 12px;
      background-color: var(--bg-color-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.8rem;
      color: $primary-color;
      word-break: break-all;
    }
  }
}

.hover-coordinates {
  position: absolute;
  top: 16px;
  right: 16px;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  
  &.outside {
    background-color: var(--bg-color-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }
  
  &.inside {
    background-color: rgba(99, 102, 241, 0.12);
    color: $primary-color;
    border: 1px solid rgba(99, 102, 241, 0.2);
  }
}

.coords-card {
  .card-header {
    font-weight: 600;
  }
}

.coordinate-board {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .coord-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--bg-color-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    
    .label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .val {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
      font-family: 'Outfit', sans-serif;
      
      .unit {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-weight: 400;
        margin-left: 2px;
      }
    }
  }
}

.desc-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.follower-card {
  .card-header {
    font-weight: 600;
  }
}

.follower-sandbox {
  width: 100%;
  height: 180px;
  background-color: var(--bg-color-primary);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  cursor: crosshair;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .helper-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    user-select: none;
    pointer-events: none;
    text-align: center;
    z-index: 0;
  }
  
  .follower-ring {
    width: 30px;
    height: 30px;
    border: 2px solid #10b981;
    border-radius: 50%;
    position: absolute;
    pointer-events: none;
    z-index: 1;
    transform: translate3d(0, 0, 0); /* Force GPU acceleration */
    transition: opacity 0.2s;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

.flex {
  display: flex;
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
.mb-2 {
  margin-bottom: 8px;
}
.block {
  display: block;
}
.w-full {
  width: 100%;
}
</style>
