<template>
  <div class="nprogress-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实用工具扩展</el-breadcrumb-item>
      <el-breadcrumb-item>NProgress 路由进度条</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>NProgress 路由加载进度条</h2>
      <p>
        NProgress 是一个轻量级的进度条库，常用于 SPA（单页应用）中模拟页面加载进度，
        提升用户体验。通过在 Vue Router 的 <code>beforeEach</code> / <code>afterEach</code>
        钩子中调用 <code>start()</code> 和 <code>done()</code>，即可在每次路由跳转时自动触发顶部进度条动画。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Left: Interactive Demo -->
      <el-col :lg="16" :md="24">
        <DemoCard
          title="交互演示"
          description="手动调用 NProgress API，模拟路由跳转时的进度条效果，并体验自定义配置。"
          :code="demoCode"
        >
          <div class="demo-content">
            <!-- Global Integration Notice -->
            <div class="integration-notice">
              <el-icon class="notice-icon"><InfoFilled /></el-icon>
              <span>
                <strong>全局已集成：</strong>本项目已在 <code>router/index.ts</code> 中配置 NProgress，
                每次路由跳转顶部均会自动触发进度条。下方为手动调用演示。
              </span>
            </div>

            <!-- Config Controls -->
            <div class="config-section">
              <h4 class="section-title">⚙️ 配置参数</h4>
              <div class="config-grid">
                <div class="config-item">
                  <label>动画速度 (speed)</label>
                  <div class="slider-row">
                    <el-slider v-model="speed" :min="100" :max="1000" :step="50" class="config-slider" />
                    <span class="slider-value">{{ speed }}ms</span>
                  </div>
                </div>
                <div class="config-item">
                  <label>涓流速度 (trickleSpeed)</label>
                  <div class="slider-row">
                    <el-slider v-model="trickleSpeed" :min="50" :max="500" :step="50" class="config-slider" />
                    <span class="slider-value">{{ trickleSpeed }}ms</span>
                  </div>
                </div>
                <div class="config-item">
                  <label>最小进度 (minimum)</label>
                  <div class="slider-row">
                    <el-slider v-model="minimum" :min="1" :max="50" :step="1" class="config-slider" />
                    <span class="slider-value">{{ minimum }}%</span>
                  </div>
                </div>
                <div class="config-item config-item--color">
                  <label>进度条颜色</label>
                  <div class="color-row">
                    <div
                      v-for="c in presetColors"
                      :key="c"
                      class="color-dot"
                      :class="{ active: barColor === c }"
                      :style="{ background: c }"
                      @click="barColor = c"
                    />
                    <input v-model="barColor" type="color" class="color-picker-native" title="自定义颜色" />
                  </div>
                </div>
                <div class="config-item config-item--switches">
                  <label>显示转圈 (showSpinner)</label>
                  <el-switch v-model="showSpinner" @change="applyConfig" />
                </div>
                <div class="config-item config-item--switches">
                  <label>自动涓流 (trickle)</label>
                  <el-switch v-model="trickle" @change="applyConfig" />
                </div>
              </div>
              <el-button size="small" type="primary" plain @click="applyConfig" class="apply-btn">
                <el-icon><Refresh /></el-icon>应用配置
              </el-button>
            </div>

            <!-- Action Buttons -->
            <div class="action-section">
              <h4 class="section-title">🎮 操作控制</h4>
              <div class="btn-row">
                <el-button type="primary" @click="simulateNavigation" :loading="isRunning">
                  <el-icon><Promotion /></el-icon>模拟页面跳转
                </el-button>
                <el-button type="warning" @click="simulateLongLoad" :loading="isRunning">
                  <el-icon><Loading /></el-icon>模拟长耗时加载
                </el-button>
                <el-button type="success" @click="finishNow" :disabled="!isRunning">
                  <el-icon><CircleCheck /></el-icon>立即完成
                </el-button>
                <el-button @click="resetProgress" :disabled="isRunning">
                  <el-icon><RefreshLeft /></el-icon>重置
                </el-button>
              </div>
            </div>

            <!-- Set Progress Manually -->
            <div class="manual-section">
              <h4 class="section-title">🎯 手动设置进度值</h4>
              <div class="slider-row">
                <el-slider
                  v-model="manualProgress"
                  :min="0"
                  :max="100"
                  :step="5"
                  :format-tooltip="(v: number) => v + '%'"
                  class="manual-slider"
                  @change="setManualProgress"
                />
                <span class="slider-value">{{ manualProgress }}%</span>
              </div>
              <p class="hint-text">拖动滑块调用 <code>NProgress.set(n)</code></p>
            </div>

            <!-- Status Display -->
            <div class="status-row">
              <div class="status-indicator" :class="{ running: isRunning }">
                <span class="dot" />
                <span class="label">{{ isRunning ? '进度条运行中...' : '进度条空闲' }}</span>
              </div>
              <div class="status-badge">
                <el-tag :type="isRunning ? 'warning' : 'success'" effect="dark">
                  {{ isRunning ? 'NProgress.start()' : 'NProgress.done()' }}
                </el-tag>
              </div>
            </div>

            <!-- Skeleton Loading Simulation -->
            <div class="skeleton-section">
              <h4 class="section-title">📄 模拟页面内容骨架屏</h4>
              <transition name="fade" mode="out-in">
                <div v-if="showSkeleton" key="skeleton" class="skeleton-wrapper">
                  <div class="skeleton-header">
                    <div class="skeleton-avatar shimmer" />
                    <div class="skeleton-title-group">
                      <div class="skeleton-line shimmer" style="width: 60%" />
                      <div class="skeleton-line shimmer" style="width: 40%" />
                    </div>
                  </div>
                  <div class="skeleton-line shimmer" style="width: 100%; margin-top: 16px" />
                  <div class="skeleton-line shimmer" style="width: 90%" />
                  <div class="skeleton-line shimmer" style="width: 80%" />
                  <div class="skeleton-line shimmer" style="width: 95%" />
                  <div class="skeleton-cards">
                    <div class="skeleton-card shimmer" />
                    <div class="skeleton-card shimmer" />
                    <div class="skeleton-card shimmer" />
                  </div>
                </div>
                <div v-else key="content" class="loaded-content">
                  <div class="content-header">
                    <div class="content-avatar">🚀</div>
                    <div>
                      <div class="content-title">页面加载完成！</div>
                      <div class="content-sub">Vue 3 + NProgress 路由集成</div>
                    </div>
                  </div>
                  <p class="content-text">
                    NProgress 为您的 SPA 带来流畅的页面切换体验，用户可以清晰地感知到页面正在加载，
                    而不是面对空白屏幕。结合骨架屏使用效果更佳！
                  </p>
                  <div class="content-tags">
                    <el-tag v-for="tag in ['NProgress', 'Vue Router', 'SPA', '用户体验']" :key="tag" class="content-tag">
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right: Info Cards -->
      <el-col :lg="8" :md="24">
        <!-- Router Integration Code -->
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Connection /></el-icon>
              <span>Router 集成代码</span>
            </div>
          </template>
          <pre class="code-block"><code><span class="code-comment">// router/index.ts</span>
<span class="code-keyword">import</span> NProgress <span class="code-keyword">from</span> <span class="code-string">'nprogress'</span>
<span class="code-keyword">import</span> <span class="code-string">'nprogress/nprogress.css'</span>

<span class="code-comment">// 配置 NProgress</span>
NProgress.<span class="code-fn">configure</span>({
  showSpinner: <span class="code-bool">false</span>,
  trickleSpeed: <span class="code-num">200</span>,
  minimum: <span class="code-num">0.08</span>,
  easing: <span class="code-string">'ease'</span>,
  speed: <span class="code-num">400</span>
})

router.<span class="code-fn">beforeEach</span>((_to, _from, next) => {
  NProgress.<span class="code-fn">start</span>()
  <span class="code-fn">next</span>()
})

router.<span class="code-fn">afterEach</span>(() => {
  NProgress.<span class="code-fn">done</span>()
})</code></pre>
        </el-card>

        <!-- API Reference -->
        <el-card class="info-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Document /></el-icon>
              <span>NProgress API 参考</span>
            </div>
          </template>
          <div class="api-list">
            <div v-for="api in apiList" :key="api.name" class="api-item">
              <code class="api-name">{{ api.name }}</code>
              <span class="api-desc">{{ api.desc }}</span>
            </div>
          </div>
        </el-card>

        <!-- Tips Card -->
        <el-card class="info-card tips-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Star /></el-icon>
              <span>使用技巧</span>
            </div>
          </template>
          <ul class="tips-list">
            <li v-for="tip in tips" :key="tip">{{ tip }}</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import DemoCard from '@/components/common/DemoCard.vue'
import {
  InfoFilled, Refresh, Promotion, Loading,
  CircleCheck, RefreshLeft, Connection, Document, Star
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ─── State ───────────────────────────────────────────────────────────────────
const speed = ref(400)
const trickleSpeed = ref(200)
const minimum = ref(8)
const barColor = ref('#6366f1')
const showSpinner = ref(false)
const trickle = ref(true)
const isRunning = ref(false)
const showSkeleton = ref(false)
const manualProgress = ref(0)

const presetColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']

let navTimer: ReturnType<typeof setTimeout> | null = null
let longLoadTimer: ReturnType<typeof setTimeout> | null = null

// ─── NProgress Config ─────────────────────────────────────────────────────────
const applyConfig = () => {
  NProgress.configure({
    showSpinner: showSpinner.value,
    trickle: trickle.value,
    trickleSpeed: trickleSpeed.value,
    minimum: minimum.value / 100,
    easing: 'ease',
    speed: speed.value
  })
  updateBarColor()
  ElMessage.success('配置已应用！')
}

const updateBarColor = () => {
  let styleEl = document.getElementById('nprogress-custom-style')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'nprogress-custom-style'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = `
    #nprogress .bar { background: ${barColor.value} !important; height: 3px; }
    #nprogress .peg { box-shadow: 0 0 10px ${barColor.value}, 0 0 5px ${barColor.value} !important; }
    #nprogress .spinner-icon { border-top-color: ${barColor.value} !important; border-left-color: ${barColor.value} !important; }
  `
}

// Apply initial config & color on load
applyConfig()

watch(barColor, updateBarColor)

// ─── Actions ──────────────────────────────────────────────────────────────────
const simulateNavigation = () => {
  if (isRunning.value) return
  isRunning.value = true
  showSkeleton.value = true
  NProgress.start()

  navTimer = setTimeout(() => {
    NProgress.done()
    isRunning.value = false
    showSkeleton.value = false
    ElMessage.success('页面跳转完成！')
  }, 1800)
}

const simulateLongLoad = () => {
  if (isRunning.value) return
  isRunning.value = true
  showSkeleton.value = true
  NProgress.start()

  // Increment slowly to simulate long load
  let progress = 0.1
  const tick = () => {
    progress = Math.min(progress + Math.random() * 0.06, 0.9)
    NProgress.set(progress)
    if (progress < 0.9) {
      longLoadTimer = setTimeout(tick, 600)
    }
  }
  tick()
  ElMessage.info('模拟长耗时加载中，点击"立即完成"可提前结束')
}

const finishNow = () => {
  if (navTimer) clearTimeout(navTimer)
  if (longLoadTimer) clearTimeout(longLoadTimer)
  NProgress.done()
  isRunning.value = false
  showSkeleton.value = false
  ElMessage.success('进度条已完成！')
}

const resetProgress = () => {
  NProgress.done()
  manualProgress.value = 0
  isRunning.value = false
  showSkeleton.value = false
}

const setManualProgress = (val: any) => {
  const numVal = Array.isArray(val) ? val[0] : val
  NProgress.set(numVal / 100)
  if (numVal === 100) {
    setTimeout(() => {
      manualProgress.value = 0
    }, 600)
  }
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
onUnmounted(() => {
  if (navTimer) clearTimeout(navTimer)
  if (longLoadTimer) clearTimeout(longLoadTimer)
  NProgress.done()
  const styleEl = document.getElementById('nprogress-custom-style')
  if (styleEl) styleEl.remove()
})

// ─── Static Data ──────────────────────────────────────────────────────────────
const apiList = [
  { name: 'NProgress.start()', desc: '启动进度条，开始自动涓流' },
  { name: 'NProgress.done()', desc: '完成进度条并淡出' },
  { name: 'NProgress.set(n)', desc: '设置进度值 (0.0 ~ 1.0)' },
  { name: 'NProgress.inc()', desc: '以随机量递增进度' },
  { name: 'NProgress.configure({})', desc: '设置全局配置选项' },
  { name: 'NProgress.remove()', desc: '从 DOM 中移除进度条' },
]

const tips = [
  '设置 showSpinner: false 可关闭右上角转圈图标，更简洁',
  '结合骨架屏使用，让用户感知内容正在加载',
  '通过 CSS 自定义进度条颜色，保持品牌一致性',
  'minimum 控制起始进度，避免进度条瞬间消失',
  '在 axios 拦截器中使用可实现请求级别的进度展示',
]

const demoCode = `// router/index.ts
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

router.beforeEach((_to, _from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

// ─── Override NProgress bar color ─────────────────────────────────────────────
:global(#nprogress .bar) {
  background: $primary-color !important;
  height: 3px;
}
:global(#nprogress .peg) {
  box-shadow: 0 0 10px $primary-color, 0 0 5px $primary-color !important;
}

// ─── Layout ───────────────────────────────────────────────────────────────────
.nprogress-demo {
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
    max-width: 700px;

    code {
      background: var(--bg-color-secondary);
      color: $primary-color;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.88em;
    }
  }
}

// ─── Demo Content ─────────────────────────────────────────────────────────────
.demo-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.integration-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: rgba($primary-color, 0.08);
  border: 1px solid rgba($primary-color, 0.2);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.6;

  .notice-icon {
    color: $primary-color;
    font-size: 1.1rem;
    margin-top: 2px;
    flex-shrink: 0;
  }

  code {
    background: rgba($primary-color, 0.15);
    color: $primary-color;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 0.85em;
  }
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 14px;
}

// ─── Config Section ───────────────────────────────────────────────────────────
.config-section {
  background: var(--bg-color-secondary);
  border-radius: 10px;
  padding: 18px;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.82rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  &--color, &--switches {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-slider {
  flex: 1;
}

.slider-value {
  font-size: 0.8rem;
  color: $primary-color;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;

  &:hover { transform: scale(1.2); }
  &.active {
    border-color: var(--text-primary);
    box-shadow: 0 0 0 2px var(--bg-color-primary);
  }
}

.color-picker-native {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  background: none;
  outline: none;
}

.apply-btn {
  margin-top: 14px;
}

// ─── Action Section ───────────────────────────────────────────────────────────
.action-section {
  background: var(--bg-color-secondary);
  border-radius: 10px;
  padding: 18px;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

// ─── Manual Section ───────────────────────────────────────────────────────────
.manual-section {
  background: var(--bg-color-secondary);
  border-radius: 10px;
  padding: 18px;
}

.manual-slider {
  flex: 1;
}

.hint-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 6px 0 0;

  code {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    padding: 1px 5px;
    border-radius: 4px;
  }
}

// ─── Status Display ───────────────────────────────────────────────────────────
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-color-secondary);
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--text-secondary);
    transition: background 0.3s;
  }

  .label {
    font-size: 0.88rem;
    color: var(--text-secondary);
    transition: color 0.3s;
  }

  &.running {
    .dot {
      background: #f59e0b;
      animation: pulse 1s infinite;
    }
    .label { color: #f59e0b; }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

// ─── Skeleton Screen ──────────────────────────────────────────────────────────
.skeleton-section {
  background: var(--bg-color-secondary);
  border-radius: 10px;
  padding: 18px;
}

.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-title-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
}

.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.skeleton-card {
  height: 80px;
  border-radius: 8px;
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-color-card) 25%,
    rgba(255,255,255,0.06) 50%,
    var(--bg-color-card) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.loaded-content {
  .content-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;

    .content-avatar {
      font-size: 2rem;
    }

    .content-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .content-sub {
      font-size: 0.82rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
  }

  .content-text {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0 0 12px;
  }

  .content-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .content-tag {
    font-size: 0.78rem;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

// ─── Right Info Cards ─────────────────────────────────────────────────────────
.info-card {
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-color);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);

  .header-icon {
    color: $primary-color;
    font-size: 1.1rem;
  }
}

.code-block {
  background: #0d1117;
  border-radius: 8px;
  padding: 16px;
  font-size: 0.8rem;
  line-height: 1.7;
  overflow-x: auto;
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;

  code {
    color: #c9d1d9;
  }

  .code-comment { color: #8b949e; }
  .code-keyword { color: #ff7b72; }
  .code-string  { color: #a5d6ff; }
  .code-fn      { color: #d2a8ff; }
  .code-num     { color: #79c0ff; }
  .code-bool    { color: #79c0ff; }
}

.api-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.api-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px;
  background: var(--bg-color-secondary);
  border-radius: 8px;

  .api-name {
    font-size: 0.82rem;
    color: $primary-color;
    font-family: 'JetBrains Mono', monospace;
  }

  .api-desc {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
}

.tips-card .el-card__body {
  padding: 14px 18px;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }
}
</style>
