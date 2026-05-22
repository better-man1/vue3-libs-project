<template>
  <div class="particles-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实用工具扩展</el-breadcrumb-item>
      <el-breadcrumb-item>tsParticles 粒子特效</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>tsParticles 交互式粒子特效系统</h2>
      <p>
        tsParticles 是一个非常强大且高性能的粒子特效库。它继承自 particles.js，提供了更丰富的渲染器、
        更好的性能以及高度可定制的选项。适用于网站背景、登录页装饰、节日特效或用户交互场景。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Main Demo Area -->
      <el-col :span="24">
        <DemoCard
          title="粒子画布与参数调节"
          description="切换不同粒子预设，并实时微调粒子数量、移动速度和交互行为。"
          :code="demoCode"
        >
          <div class="demo-content">
            <!-- Preset Selector -->
            <div class="preset-selector">
              <el-radio-group v-model="selectedPreset" @change="resetOptions">
                <el-radio-button label="stars">🌌 星空连线 (Stars)</el-radio-button>
                <el-radio-button label="snow">❄️ 雪花飘落 (Snow)</el-radio-button>
                <el-radio-button label="bubbles">🫧 彩色气泡 (Bubbles)</el-radio-button>
                <el-radio-button label="space">🚀 太空星尘 (Space)</el-radio-button>
              </el-radio-group>
            </div>

            <!-- Particles Canvas Container -->
            <div class="canvas-container">
              <vue-particles
                v-if="renderCanvas"
                id="tsparticles-canvas"
                :options="currentOptions"
              />
              <div class="canvas-overlay">
                <div class="overlay-info">
                  <el-tag type="info" effect="dark">
                    预设: {{ selectedPreset.toUpperCase() }}
                  </el-tag>
                  <el-tag type="success" effect="dark" class="ml-2">
                    粒子数: {{ particleCount }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- Controls Panel -->
            <div class="controls-panel">
              <h4 class="panel-title">🛠️ 实时参数调整</h4>
              <div class="controls-grid">
                <div class="control-item">
                  <span class="label">粒子数量</span>
                  <div class="slider-row">
                    <el-slider v-model="particleCount" :min="10" :max="250" :step="5" />
                    <span class="value">{{ particleCount }}</span>
                  </div>
                </div>

                <div class="control-item">
                  <span class="label">移动速度</span>
                  <div class="slider-row">
                    <el-slider v-model="particleSpeed" :min="0.1" :max="8" :step="0.1" />
                    <span class="value">{{ particleSpeed.toFixed(1) }}</span>
                  </div>
                </div>

                <div class="control-item">
                  <span class="label">粒子最大尺寸</span>
                  <div class="slider-row">
                    <el-slider v-model="particleSize" :min="1" :max="15" :step="0.5" />
                    <span class="value">{{ particleSize }}px</span>
                  </div>
                </div>

                <div class="control-item control-item--switch">
                  <span class="label">鼠标交互 (悬浮 Grab / 点击 Push)</span>
                  <el-switch v-model="enableInteractivity" />
                </div>
              </div>

              <div class="apply-actions">
                <el-button type="primary" @click="applyChanges">
                  <el-icon class="mr-1"><Refresh /></el-icon>
                  更新粒子效果
                </el-button>
                <el-button @click="resetOptions">
                  <el-icon class="mr-1"><RefreshLeft /></el-icon>
                  重置预设
                </el-button>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Info/Explanations -->
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :md="12" :sm="24">
            <el-card class="info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>💡 核心原理与最佳实践</span>
                </div>
              </template>
              <ul class="principles-list">
                <li><strong>高性能 DOM 逃逸：</strong>tsParticles 采用 HTML5 Canvas 渲染，不创建真实的 DOM 节点，这让它能够在屏幕上顺畅流动数百个独立粒子。</li>
                <li><strong>模块化包（Slim）：</strong>本项目集成了 <code>@tsparticles/slim</code>。它排除了复杂的 emitter、polygon 等功能，打包体积更小，包含最常用的连线、飘落、漂浮等基本功能。</li>
                <li><strong>性能优化技巧：</strong>
                  <ul>
                    <li>粒子数量不要超过 200，以确保低端移动端设备流畅运行。</li>
                    <li>尽量不要开启粒子阴影效果，它非常消耗 GPU 资源。</li>
                    <li>在页面销毁时务必自动调用 <code>destroy()</code>（组件已内置此生命周期销毁逻辑）。</li>
                  </ul>
                </li>
              </ul>
            </el-card>
          </el-col>

          <el-col :md="12" :sm="24">
            <el-card class="info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>🚀 常见应用场景</span>
                </div>
              </template>
              <div class="scenarios-grid">
                <div class="scenario-item">
                  <div class="icon">✨</div>
                  <div>
                    <h5>登录/注册背景</h5>
                    <p>使用星空连线预设，搭配玻璃拟态表单，瞬间提升产品的高级感与科技感。</p>
                  </div>
                </div>
                <div class="scenario-item">
                  <div class="icon">❄️</div>
                  <div>
                    <h5>节日主题氛围</h5>
                    <p>在冬日或特定节日配置雪花飘落、樱花飞舞等，为站点增添趣味人情味。</p>
                  </div>
                </div>
                <div class="scenario-item">
                  <div class="icon">🪩</div>
                  <div>
                    <h5>大屏看板动效</h5>
                    <p>粒子在后台微弱浮动或根据鼠标产生涟漪交互，避免静态大屏的单调枯燥。</p>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'
import { Refresh, RefreshLeft } from '@element-plus/icons-vue'
import type { ISourceOptions } from '@tsparticles/engine'

// ─── State ───────────────────────────────────────────────────────────────────
const selectedPreset = ref<'stars' | 'snow' | 'bubbles' | 'space'>('stars')
const renderCanvas = ref(true)

const particleCount = ref(80)
const particleSpeed = ref(2)
const particleSize = ref(3)
const enableInteractivity = ref(true)

// ─── Preset Option Generators ─────────────────────────────────────────────────
const getStarsOptions = (): ISourceOptions => ({
  background: { color: { value: '#080d1a' } },
  fpsLimit: 60,
  particles: {
    number: { value: particleCount.value, density: { enable: true, width: 800, height: 800 } },
    color: { value: ['#6366f1', '#818cf8', '#a5b4fc', '#ec4899'] },
    links: { enable: true, color: '#6366f1', opacity: 0.3, distance: 130 },
    move: { enable: true, speed: particleSpeed.value, direction: 'none', outModes: 'bounce' },
    size: { value: { min: 1, max: particleSize.value } },
    opacity: { value: { min: 0.3, max: 0.8 } }
  },
  interactivity: {
    events: {
      onHover: { enable: enableInteractivity.value, mode: 'grab' },
      onClick: { enable: enableInteractivity.value, mode: 'push' }
    },
    modes: {
      grab: { distance: 180, links: { opacity: 0.5 } },
      push: { quantity: 4 }
    }
  }
})

const getSnowOptions = (): ISourceOptions => ({
  background: { color: { value: '#0f172a' } },
  fpsLimit: 60,
  particles: {
    number: { value: particleCount.value, density: { enable: true, width: 800, height: 800 } },
    color: { value: '#ffffff' },
    move: {
      enable: true,
      direction: 'bottom',
      speed: particleSpeed.value,
      straight: false,
      outModes: 'out'
    },
    size: { value: { min: 1, max: particleSize.value + 2 } },
    opacity: { value: { min: 0.2, max: 0.8 } }
  },
  interactivity: {
    events: {
      onHover: { enable: enableInteractivity.value, mode: 'bubble' }
    },
    modes: {
      bubble: { size: 10, distance: 150, duration: 2, opacity: 0.8 }
    }
  }
})

const getBubblesOptions = (): ISourceOptions => ({
  background: { color: { value: '#020617' } },
  fpsLimit: 60,
  particles: {
    number: { value: particleCount.value, density: { enable: true, width: 800, height: 800 } },
    color: { value: ['#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#eab308'] },
    move: {
      enable: true,
      direction: 'top',
      speed: particleSpeed.value,
      random: true,
      straight: false,
      outModes: 'out'
    },
    size: { value: { min: 3, max: particleSize.value + 6 } },
    opacity: { value: { min: 0.1, max: 0.6 } }
  },
  interactivity: {
    events: {
      onHover: { enable: enableInteractivity.value, mode: 'bubble' },
      onClick: { enable: enableInteractivity.value, mode: 'repulse' }
    },
    modes: {
      bubble: { size: particleSize.value + 12, distance: 120, duration: 1, opacity: 0.8 },
      repulse: { distance: 150, duration: 0.4 }
    }
  }
})

const getSpaceOptions = (): ISourceOptions => ({
  background: { color: { value: '#020205' } },
  fpsLimit: 60,
  particles: {
    number: { value: particleCount.value, density: { enable: true, width: 800, height: 800 } },
    color: { value: '#ffffff' },
    move: {
      enable: true,
      speed: particleSpeed.value * 0.5,
      direction: 'none',
      random: true,
      straight: false,
      outModes: 'out'
    },
    size: { value: { min: 0.5, max: particleSize.value } },
    opacity: { value: { min: 0.1, max: 1 } }
  },
  interactivity: {
    events: {
      onHover: { enable: enableInteractivity.value, mode: 'repulse' }
    },
    modes: {
      repulse: { distance: 100, duration: 0.4 }
    }
  }
})

// Current Options computation
const currentOptions = computed<ISourceOptions>(() => {
  switch (selectedPreset.value) {
    case 'snow':
      return getSnowOptions()
    case 'bubbles':
      return getBubblesOptions()
    case 'space':
      return getSpaceOptions()
    case 'stars':
    default:
      return getStarsOptions()
  }
})

// ─── Actions ──────────────────────────────────────────────────────────────────
const applyChanges = () => {
  renderCanvas.value = false
  nextTick(() => {
    renderCanvas.value = true
  })
}

const resetOptions = () => {
  // Set default parameters per preset
  if (selectedPreset.value === 'stars') {
    particleCount.value = 80
    particleSpeed.value = 2
    particleSize.value = 3
  } else if (selectedPreset.value === 'snow') {
    particleCount.value = 100
    particleSpeed.value = 1.5
    particleSize.value = 2
  } else if (selectedPreset.value === 'bubbles') {
    particleCount.value = 60
    particleSpeed.value = 2.5
    particleSize.value = 4
  } else if (selectedPreset.value === 'space') {
    particleCount.value = 120
    particleSpeed.value = 0.8
    particleSize.value = 2
  }
  applyChanges()
}

onMounted(() => {
  resetOptions()
})

// ─── Code Snippet for UI ──────────────────────────────────────────────────────
const demoCode = `// main.ts 全局注册插件
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'

app.use(Particles, {
  init: async (engine) => {
    await loadSlim(engine)
  }
})

// Component.vue 使用
<template>
  <div class="canvas-container">
    <vue-particles id="particles-id" :options="currentOptions" />
  </div>
</template>

<script setup>
const currentOptions = {
  background: { color: { value: '#080d1a' } },
  particles: {
    number: { value: 80 },
    links: { enable: true, color: '#6366f1', distance: 130 },
    move: { enable: true, speed: 2 }
  }
}
<\/script>`

if (false as any) {
  console.log(DemoCard, Refresh, RefreshLeft, currentOptions.value)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.particles-demo {
  padding: 0 0 40px;
}

.el-breadcrumb {
  margin-bottom: 20px;
}

.header-desc {
  margin-bottom: 28px;
  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 10px;
  }
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.7;
    max-width: 800px;
  }
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preset-selector {
  display: flex;
  justify-content: flex-start;
}

.canvas-container {
  height: 450px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-color);
  background-color: #020205;

  #tsparticles-canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}

.canvas-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  z-index: 10;
}

.overlay-info {
  display: flex;
  gap: 8px;
}

.controls-panel {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);

  .panel-title {
    margin: 0 0 16px;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 16px;
    .el-slider {
      flex: 1;
    }
    .value {
      min-width: 45px;
      text-align: right;
      font-size: 0.85rem;
      color: $primary-color;
      font-weight: 600;
    }
  }

  &--switch {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.apply-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.info-card {
  border-radius: 12px;
  margin-bottom: 20px;
  height: 100%;

  .principles-list {
    padding-left: 18px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.88rem;
    line-height: 1.8;

    li {
      margin-bottom: 8px;
    }

    ul {
      padding-left: 16px;
      margin-top: 4px;
      list-style-type: circle;
    }
  }
}

.scenarios-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scenario-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;

  .icon {
    font-size: 1.4rem;
    background: var(--bg-color-secondary);
    padding: 6px;
    border-radius: 8px;
    line-height: 1;
    border: 1px solid var(--border-color);
  }

  h5 {
    margin: 0 0 4px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }
}

.ml-2 {
  margin-left: 8px;
}
.mr-1 {
  margin-right: 4px;
}
</style>
