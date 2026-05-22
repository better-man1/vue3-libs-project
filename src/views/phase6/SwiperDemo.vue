<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>移动与交互</el-breadcrumb-item>
      <el-breadcrumb-item>Swiper 轮播图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Swiper.js — 移动端多功能轮播与视差交互</h2>
      <p>学习使用行业标准轮播图库 Swiper.js。在 Vue 3 中展示 3D Coverflow、渐变淡入淡出以及 Parallax 视差层级滚动的极致视觉动效。</p>
    </div>

    <!-- Active Configurations -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="Swiper.js 多场景演示效果"
          description="使用不同模块和配置参数初始化的轮播演示。支持鼠标拖动及移动端触控滑动。"
          :code="swiperExampleCode"
        >
          <el-tabs v-model="activeTab" class="swiper-demo-tabs" @tab-change="resetSwiper">
            <!-- Tab 1: 3D Coverflow -->
            <el-tab-pane label="🌑 3D Coverflow" name="coverflow">
              <div class="swiper-wrapper-box coverflow-bg">
                <swiper
                  v-if="activeTab === 'coverflow'"
                  :modules="[EffectCoverflow, Pagination, Navigation, Autoplay]"
                  :effect="'coverflow'"
                  :grab-cursor="true"
                  :centered-slides="true"
                  :slides-per-view="'auto'"
                  :loop="loop"
                  :autoplay="autoplayConfig"
                  :speed="speed"
                  :coverflow-effect="{
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                  }"
                  :pagination="{ clickable: true }"
                  :navigation="true"
                  class="coverflow-swiper"
                >
                  <swiper-slide v-for="(slide, index) in slides" :key="index" class="coverflow-slide" :style="{ background: slide.color }">
                    <div class="slide-card-content">
                      <span class="slide-emoji">{{ slide.emoji }}</span>
                      <h3>{{ slide.title }}</h3>
                      <p>{{ slide.desc }}</p>
                    </div>
                  </swiper-slide>
                </swiper>
              </div>
            </el-tab-pane>

            <!-- Tab 2: Fade Effect -->
            <el-tab-pane label="🌊 Fade Effect" name="fade">
              <div class="swiper-wrapper-box">
                <swiper
                  v-if="activeTab === 'fade'"
                  :modules="[EffectFade, Pagination, Navigation, Autoplay]"
                  :effect="'fade'"
                  :loop="loop"
                  :autoplay="autoplayConfig"
                  :speed="speed"
                  :pagination="{ clickable: true, type: 'progressbar' }"
                  :navigation="true"
                  class="fade-swiper"
                >
                  <swiper-slide v-for="(slide, index) in slides" :key="index" :style="{ background: slide.color }">
                    <div class="fade-slide-content">
                      <div class="text-content">
                        <h2>{{ slide.title }}</h2>
                        <p class="subtitle">{{ slide.desc }}</p>
                        <el-button type="primary" plain round>探索更多 {{ slide.emoji }}</el-button>
                      </div>
                    </div>
                  </swiper-slide>
                </swiper>
              </div>
            </el-tab-pane>

            <!-- Tab 3: Parallax -->
            <el-tab-pane label="🌌 Parallax 视差" name="parallax">
              <div class="swiper-wrapper-box parallax-bg">
                <swiper
                  v-if="activeTab === 'parallax'"
                  :modules="[Parallax, Pagination, Navigation, Autoplay]"
                  :speed="1000"
                  :parallax="true"
                  :pagination="{ clickable: true }"
                  :navigation="true"
                  :loop="loop"
                  :autoplay="autoplayConfig"
                  class="parallax-swiper"
                >
                  <!-- Background element with parallax speed -->
                  <div
                    class="parallax-bg-layer"
                    data-swiper-parallax="-23%"
                  />
                  
                  <swiper-slide v-for="(slide, index) in slides" :key="index">
                    <div class="parallax-slide-content">
                      <div class="title" data-swiper-parallax="-300">
                        {{ slide.title }}
                      </div>
                      <div class="subtitle" data-swiper-parallax="-200">
                        {{ slide.emoji }} {{ slide.desc }}
                      </div>
                      <div class="text" data-swiper-parallax="-100">
                        <p>视差滚动允许我们将背景层、标题文字与辅助描述分别设置不同的视差速度位移比例（如：-300 / -200 / -100 px），从而在横向滑动切换过程中呈现出极具空间感的 3D 纵深过渡视觉享受。</p>
                      </div>
                    </div>
                  </swiper-slide>
                </swiper>
              </div>
            </el-tab-pane>
          </el-tabs>
        </DemoCard>
      </el-col>

      <!-- Right side: Parameters Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="param-card">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="font-bold">⚙️ 实时参数调试</span>
            </div>
          </template>

          <el-form label-position="top">
            <el-form-item label="过渡速度 (Speed: ms)">
              <el-slider v-model="speed" :min="200" :max="2000" :step="100" show-input />
            </el-form-item>

            <el-form-item label="循环滚动 (Loop)">
              <el-switch v-model="loop" active-text="开启" inactive-text="关闭" />
            </el-form-item>

            <el-divider />

            <el-form-item label="自动播放 (Autoplay)">
              <el-switch v-model="autoplay" active-text="开启" inactive-text="关闭" />
            </el-form-item>

            <el-form-item v-if="autoplay" label="播放停留间隔 (Delay: ms)">
              <el-slider v-model="autoplayDelay" :min="1000" :max="8000" :step="500" show-input />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <span class="font-bold">💡 响应式 Swiper 最佳实践</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2"><strong>1. 模块化引入 (Tree-shaking)</strong><br/>在 Swiper v11 中，除了核心的 <code>swiper</code> 组件外，所有附加效果 (Pagination, Navigation, EffectCoverflow 等) 必须在 <code>swiper/modules</code> 中显式导入，并在 <code>:modules="[...]`</code> 中声明，否则不会生效。</p>
            <p class="mb-2"><strong>2. 重新初始化 (Key Key)</strong><br/>当动态修改 Swiper 某些高阶参数（如 loop 或 effect）时，由于 Swiper 底层是基于非 Vue 原生 DOM 实例运行的，因此最稳定可靠的方式是通过改变 <code>key</code> 值或使用 <code>v-if</code> 重新载入组件。</p>
            <p><strong>3. 移动端体验</strong><br/>Swiper 对惯性拖拽、滑动手势提供了硬件加速 (GPU acceleration) 的 transition 变换，因此在流畅度上优于常规的 JS 补间动画。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'

// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-fade'

// Import Swiper modules
import { EffectCoverflow, EffectFade, Parallax, Pagination, Navigation, Autoplay } from 'swiper/modules'

// ─── Swiper slides mock data ──────────────────────────────────────────
const slides = [
  {
    title: 'Vue 3 Composition API',
    desc: '使用 Setup 语法糖与 Composition 组合式函数构建声明式、组件化的现代前端。',
    emoji: '🟢',
    color: 'linear-gradient(135deg, #1f2937 0%, #10b981 100%)'
  },
  {
    title: 'Three.js 3D Engine',
    desc: '利用 WebGL 图形库实现高性能 3D 渲染，包括网格几何、光照阴影及着色器特效。',
    emoji: '🔵',
    color: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 100%)'
  },
  {
    title: 'D3.js Data Driven SVG',
    desc: '直接操作数据进行 DOM 绑定与 SVG 路径计算，绘制定制化的关系力导向与层级嵌套树图。',
    emoji: '🟠',
    color: 'linear-gradient(135deg, #311b92 0%, #d84315 100%)'
  },
  {
    title: 'TanStack Vue Query',
    desc: '零配置缓存服务端异步数据请求，支持乐观更新、轮询失效与无限滚动列表。',
    emoji: '🔴',
    color: 'linear-gradient(135deg, #0f172a 0%, #f43f5e 100%)'
  },
  {
    title: 'Vitest Unit Testing',
    desc: '基于 Vite 零配置极速启动的单元测试套件，在 JSDOM 虚拟浏览器中运行断言。',
    emoji: '🟡',
    color: 'linear-gradient(135deg, #1c1917 0%, #eab308 100%)'
  }
]

// ─── Swiper configs ──────────────────────────────────────────────────
const activeTab = ref('coverflow')
const speed = ref(600)
const loop = ref(true)
const autoplay = ref(true)
const autoplayDelay = ref(3000)

const autoplayConfig = computed(() => {
  if (!autoplay.value) return false
  return {
    delay: autoplayDelay.value,
    disableOnInteraction: false
  }
})

// Quick force re-render on tab change to resolve rendering bugs
const forceResetCounter = ref(0)
const resetSwiper = () => {
  forceResetCounter.value++
}

// ─── Swiper Example Code ──────────────────────────────────────────────
const swiperExampleCode = `<template>
  <swiper
    :modules="[EffectCoverflow, Pagination, Navigation, Autoplay]"
    effect="coverflow"
    :grab-cursor="true"
    :centered-slides="true"
    :slides-per-view="'auto'"
    :loop="true"
    :autoplay="{ delay: 3000, disableOnInteraction: false }"
    :coverflow-effect="{
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    }"
    :pagination="{ clickable: true }"
    :navigation="true"
  >
    <swiper-slide v-for="slide in slides" :style="{ background: slide.color }">
      <div class="slide-content">
        <h3>{{ slide.title }}</h3>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.swiper-demo-tabs {
  :deep(.el-tabs__item) {
    font-weight: 600;
  }
}

.swiper-wrapper-box {
  width: 100%;
  height: 380px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
  
  &.coverflow-bg {
    background: #0f172a;
  }
  
  &.parallax-bg {
    background: #090d16;
  }
}

/* 3D Coverflow Swiper */
.coverflow-swiper {
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
  height: 100%;
}

.coverflow-slide {
  background-position: center;
  background-size: cover;
  width: 250px;
  height: 250px;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  overflow: hidden;
  
  .slide-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    height: 100%;
    color: #ffffff;
    
    .slide-emoji {
      font-size: 2.8rem;
      margin-bottom: 16px;
    }
    
    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 10px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    p {
      font-size: 0.78rem;
      line-height: 1.5;
      margin: 0;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
  }
}

/* Fade Swiper */
.fade-swiper {
  width: 100%;
  height: 100%;
}

.fade-slide-content {
  display: flex;
  align-items: center;
  padding: 60px;
  height: 100%;
  color: #ffffff;
  
  .text-content {
    max-width: 480px;
    
    h2 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 16px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .subtitle {
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 24px;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  }
}

/* Parallax Swiper */
.parallax-swiper {
  width: 100%;
  height: 100%;
  color: #ffffff;
}

.parallax-bg-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 130%;
  height: 100%;
  background-image: radial-gradient(circle at 30% 30%, #312e81 0%, #030712 100%);
  background-size: cover;
  background-position: center;
}

.parallax-slide-content {
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  
  .title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 12px;
  }
  
  .subtitle {
    font-size: 1.1rem;
    font-weight: 600;
    color: #818cf8;
    margin-bottom: 20px;
  }
  
  .text {
    max-width: 520px;
    font-size: 0.85rem;
    line-height: 1.7;
    opacity: 0.8;
  }
}

/* Custom Navigation design overrides */
:deep(.swiper-button-next), :deep(.swiper-button-prev) {
  color: #ffffff;
  background: rgba(0, 0, 0, 0.35);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  
  &::after {
    font-size: 18px;
    font-weight: bold;
  }
  
  &:hover {
    background: $primary-color;
    border-color: transparent;
  }
}

:deep(.swiper-button-prev) { left: 16px; }
:deep(.swiper-button-next) { right: 16px; }

:deep(.swiper-pagination-bullet) {
  background: #ffffff;
  opacity: 0.4;
  &.swiper-pagination-bullet-active {
    background: $primary-color;
    opacity: 1;
    width: 18px;
    border-radius: 4px;
    transition: all 0.3s;
  }
}

:deep(.swiper-pagination-progressbar) {
  background: rgba(255, 255, 255, 0.2);
  .swiper-pagination-progressbar-fill {
    background: $primary-color;
  }
}

.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.font-bold { font-weight: 700; }
</style>
