<template>
  <div class="typed-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实用工具扩展</el-breadcrumb-item>
      <el-breadcrumb-item>Typed.js 打字机动画</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>Typed.js 打字机动画效果</h2>
      <p>
        Typed.js 是一个零依赖的轻量级打字机动画库，支持自动打字、删除、循环等效果。
        常用于落地页英雄区域、CLI 模拟、代码展示等场景，能有效提升页面的视觉吸引力与动态感。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Left: Demo Panel -->
      <el-col :lg="16" :md="24">
        <DemoCard
          title="交互演示"
          description="两个示例展示 Typed.js 的不同使用场景：终端命令模拟 和 Hero 区域打字效果。"
          :code="demoCode"
        >
          <div class="demo-content">
            <!-- Demo 1: Terminal -->
            <div class="demo-block">
              <h4 class="demo-block-title">🖥️ 终端命令模拟</h4>
              <div class="terminal-window">
                <div class="terminal-titlebar">
                  <span class="dot dot-red" />
                  <span class="dot dot-yellow" />
                  <span class="dot dot-green" />
                  <span class="terminal-title">bash — vue-project</span>
                </div>
                <div class="terminal-body">
                  <div class="terminal-line">
                    <span class="prompt">user@macbook ~/vue-project</span>
                    <span class="prompt-symbol"> $ </span>
                    <span ref="terminalRef" class="typed-text" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Demo 2: Hero Section -->
            <div class="demo-block">
              <h4 class="demo-block-title">🎨 Hero 区域效果</h4>
              <div class="hero-section">
                <div class="hero-content">
                  <div class="hero-badge">✨ 极致体验</div>
                  <h3 class="hero-title">
                    Vue 3 是
                    <span class="hero-typed-wrap">
                      <span ref="heroRef" class="hero-typed" />
                    </span>
                  </h3>
                  <p class="hero-subtitle">
                    构建现代 Web 应用的最佳选择，组合式 API 让开发更优雅
                  </p>
                  <div class="hero-btns">
                    <el-button type="primary" size="large" class="hero-btn-primary">开始探索</el-button>
                    <el-button size="large" class="hero-btn-ghost">查看文档</el-button>
                  </div>
                </div>
                <div class="hero-decoration">
                  <div class="deco-circle deco-1" />
                  <div class="deco-circle deco-2" />
                  <div class="deco-circle deco-3" />
                  <span class="deco-emoji">🚀</span>
                </div>
              </div>
            </div>

            <!-- Control Panel -->
            <div class="control-panel">
              <h4 class="section-title">⚙️ 终端动画控制参数</h4>
              <div class="controls-grid">
                <div class="ctrl-item">
                  <label>打字速度 (typeSpeed)</label>
                  <div class="slider-row">
                    <el-slider v-model="typeSpeed" :min="10" :max="200" :step="5" class="ctrl-slider" />
                    <span class="ctrl-val">{{ typeSpeed }}ms</span>
                  </div>
                </div>
                <div class="ctrl-item">
                  <label>删除速度 (backSpeed)</label>
                  <div class="slider-row">
                    <el-slider v-model="backSpeed" :min="10" :max="150" :step="5" class="ctrl-slider" />
                    <span class="ctrl-val">{{ backSpeed }}ms</span>
                  </div>
                </div>
                <div class="ctrl-item">
                  <label>启动延迟 (startDelay)</label>
                  <div class="slider-row">
                    <el-slider v-model="startDelay" :min="0" :max="2000" :step="100" class="ctrl-slider" />
                    <span class="ctrl-val">{{ startDelay }}ms</span>
                  </div>
                </div>
                <div class="ctrl-item">
                  <label>光标字符 (cursorChar)</label>
                  <el-input v-model="cursorChar" maxlength="3" show-word-limit style="width: 100%" />
                </div>

                <div class="ctrl-item ctrl-item--switch">
                  <label>循环播放 (loop)</label>
                  <el-switch v-model="loop" />
                </div>
                <div class="ctrl-item ctrl-item--switch">
                  <label>显示光标 (showCursor)</label>
                  <el-switch v-model="showCursor" />
                </div>
                <div class="ctrl-item ctrl-item--switch">
                  <label>智能退格 (smartBackspace)</label>
                  <el-switch v-model="smartBackspace" />
                </div>
                <div class="ctrl-item ctrl-item--switch">
                  <label>随机顺序 (shuffle)</label>
                  <el-switch v-model="shuffle" />
                </div>
              </div>

              <!-- Custom Strings Editor -->
              <div class="strings-editor">
                <h4 class="section-title" style="margin-bottom: 10px">📝 自定义打字内容</h4>
                <div v-for="(_, idx) in customStrings" :key="idx" class="string-row">
                  <el-input v-model="customStrings[idx]" size="small" :placeholder="`第 ${idx + 1} 条内容`" />
                  <el-button size="small" type="danger" plain circle @click="removeString(idx)" :disabled="customStrings.length <= 1">
                    <el-icon><Minus /></el-icon>
                  </el-button>
                </div>
                <el-button size="small" type="primary" plain @click="addString" :disabled="customStrings.length >= 8">
                  <el-icon><Plus /></el-icon>添加一条
                </el-button>
              </div>

              <!-- Action Buttons -->
              <div class="action-row">
                <el-button type="primary" @click="restartTyped">
                  <el-icon><Refresh /></el-icon>重新开始
                </el-button>
                <el-button :type="isPaused ? 'success' : 'warning'" @click="togglePause">
                  <el-icon>
                    <component :is="isPaused ? VideoPlay : VideoPause" />
                  </el-icon>
                  {{ isPaused ? '继续' : '暂停' }}
                </el-button>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right Panel -->
      <el-col :lg="8" :md="24">
        <!-- Code Snippet -->
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Document /></el-icon>
              <span>核心代码</span>
            </div>
          </template>
          <pre class="code-block"><code><span class="code-keyword">import</span> Typed <span class="code-keyword">from</span> <span class="code-string">'typed.js'</span>

<span class="code-keyword">const</span> typed = <span class="code-keyword">new</span> <span class="code-fn">Typed</span>(element, {
  strings: [
    <span class="code-string">'Hello, World!'</span>,
    <span class="code-string">'Vue 3 + Typed.js'</span>,
  ],
  typeSpeed: <span class="code-num">55</span>,
  backSpeed: <span class="code-num">30</span>,
  startDelay: <span class="code-num">500</span>,
  backDelay: <span class="code-num">1500</span>,
  loop: <span class="code-bool">true</span>,
  showCursor: <span class="code-bool">true</span>,
  cursorChar: <span class="code-string">'|'</span>,
  smartBackspace: <span class="code-bool">true</span>,
})

<span class="code-comment">// 生命周期钩子</span>
onUnmounted(() => {
  typed.<span class="code-fn">destroy</span>()
})</code></pre>
        </el-card>

        <!-- Use Cases -->
        <el-card class="info-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Star /></el-icon>
              <span>典型使用场景</span>
            </div>
          </template>
          <div class="use-cases-list">
            <div v-for="uc in useCases" :key="uc.title" class="uc-item">
              <div class="uc-icon-wrap" :style="{ background: uc.bg }">
                {{ uc.icon }}
              </div>
              <div>
                <div class="uc-title">{{ uc.title }}</div>
                <div class="uc-desc">{{ uc.desc }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Options Reference -->
        <el-card class="info-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Setting /></el-icon>
              <span>常用配置项</span>
            </div>
          </template>
          <div class="opts-table">
            <div v-for="opt in optsList" :key="opt.prop" class="opt-row">
              <code class="opt-prop">{{ opt.prop }}</code>
              <span class="opt-default">{{ opt.default }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Typed from 'typed.js'
import DemoCard from '@/components/common/DemoCard.vue'
import {
  Refresh, Plus, Minus, Document, Star, Setting,
  VideoPlay, VideoPause
} from '@element-plus/icons-vue'

// ─── Refs ─────────────────────────────────────────────────────────────────────
const terminalRef = ref<HTMLElement | null>(null)
const heroRef     = ref<HTMLElement | null>(null)

let typedTerminal: Typed | null = null
let typedHero: Typed | null = null

// ─── Controls ─────────────────────────────────────────────────────────────────
const typeSpeed     = ref(55)
const backSpeed     = ref(30)
const startDelay    = ref(500)
const cursorChar    = ref('▋')
const loop          = ref(true)
const showCursor    = ref(true)
const smartBackspace = ref(true)
const shuffle       = ref(false)
const isPaused      = ref(false)

const customStrings = ref([
  'vue create my-awesome-app',
  'npm install @vue-flow/core typed.js',
  'const { t, locale } = useI18n()',
  'import { ref, computed, watch } from "vue"',
  'git commit -m "feat: add Phase 8 libraries"',
])

// ─── Init Typed Instances ─────────────────────────────────────────────────────
const initTyped = () => {
  typedTerminal?.destroy()
  typedHero?.destroy()
  isPaused.value = false

  if (terminalRef.value) {
    // Clear previous content
    terminalRef.value.innerHTML = ''
    typedTerminal = new Typed(terminalRef.value, {
      strings: customStrings.value.filter(s => s.trim()),
      typeSpeed: typeSpeed.value,
      backSpeed: backSpeed.value,
      startDelay: startDelay.value,
      backDelay: 1500,
      loop: loop.value,
      showCursor: showCursor.value,
      cursorChar: cursorChar.value,
      smartBackspace: smartBackspace.value,
      shuffle: shuffle.value,
    })
  }

  if (heroRef.value) {
    heroRef.value.innerHTML = ''
    typedHero = new Typed(heroRef.value, {
      strings: ['快速的', '现代的', '响应式的', '组合式的', '强大的', '优雅的'],
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 1200,
      loop: true,
      showCursor: true,
      cursorChar: '_',
    })
  }
}

const restartTyped = () => initTyped()

const togglePause = () => {
  if (!typedTerminal) return
  if (isPaused.value) {
    typedTerminal.start()
  } else {
    typedTerminal.stop()
  }
  isPaused.value = !isPaused.value
}

const addString = () => {
  if (customStrings.value.length < 8) {
    customStrings.value.push('')
  }
}

const removeString = (idx: number) => {
  if (customStrings.value.length > 1) {
    customStrings.value.splice(idx, 1)
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(initTyped)

onUnmounted(() => {
  typedTerminal?.destroy()
  typedHero?.destroy()
})

// ─── Static Data ──────────────────────────────────────────────────────────────
const useCases = [
  { icon: '🏠', title: '落地页英雄区域',  desc: '动态展示产品卖点，吸引访客注意', bg: 'rgba(99,102,241,0.15)' },
  { icon: '💻', title: 'CLI 命令模拟',    desc: '在文档中生动演示命令行操作流程', bg: 'rgba(16,185,129,0.15)' },
  { icon: '📖', title: '代码教学展示',    desc: '逐字演示代码输入，辅助讲解', bg: 'rgba(236,72,153,0.15)' },
  { icon: '⏳', title: '加载等待页面',    desc: '加载时展示有趣文字，减少等待焦虑', bg: 'rgba(245,158,11,0.15)' },
]

const optsList = [
  { prop: 'strings',      default: '[]',    desc: '待打字的字符串数组' },
  { prop: 'typeSpeed',    default: '30',    desc: '打字速度 (ms/字符)' },
  { prop: 'backSpeed',    default: '0',     desc: '删除速度' },
  { prop: 'backDelay',    default: '700',   desc: '删除前等待时间' },
  { prop: 'loop',         default: 'false', desc: '是否循环播放' },
  { prop: 'cursorChar',   default: "'|'",   desc: '光标字符' },
  { prop: 'onComplete',   default: '—',     desc: '完成时的回调函数' },
]

const demoCode = `import Typed from 'typed.js'
import { ref, onMounted, onUnmounted } from 'vue'

const el = ref<HTMLElement | null>(null)
let typed: Typed | null = null

onMounted(() => {
  typed = new Typed(el.value!, {
    strings: ['Hello!', 'Vue 3 is awesome!'],
    typeSpeed: 55,
    backSpeed: 30,
    loop: true,
    showCursor: true,
    cursorChar: '|',
  })
})

onUnmounted(() => typed?.destroy())`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

// ─── Layout ───────────────────────────────────────────────────────────────────
.typed-demo {
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
  }
}

// ─── Demo Content ─────────────────────────────────────────────────────────────
.demo-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.demo-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-block-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

// ─── Terminal Window ──────────────────────────────────────────────────────────
.terminal-window {
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.terminal-titlebar {
  background: #161b22;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #30363d;

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot-red    { background: #ff5f57; }
  .dot-yellow { background: #febc2e; }
  .dot-green  { background: #28c840; }

  .terminal-title {
    font-size: 0.78rem;
    color: #8b949e;
    margin-left: 8px;
    font-family: 'JetBrains Mono', monospace;
  }
}

.terminal-body {
  padding: 20px 20px 24px;
  min-height: 80px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.92rem;
  color: #c9d1d9;
  line-height: 1.6;
}

.terminal-line {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0;
}

.prompt {
  color: #3fb950;
  font-size: 0.85rem;
}

.prompt-symbol {
  color: #3fb950;
  margin: 0 2px;
}

.typed-text {
  color: #e6edf3;
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
.hero-section {
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 40px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  position: relative;
  overflow: hidden;

  @media (max-width: 600px) {
    flex-direction: column;
    padding: 28px 20px;
  }
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba($primary-color, 0.15);
  border: 1px solid rgba($primary-color, 0.3);
  color: lighten($primary-color, 20%);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  width: fit-content;
  font-weight: 600;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: #e6edf3;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
}

.hero-typed-wrap {
  display: inline-block;
  min-width: 120px;
}

.hero-typed {
  color: $primary-color;
  font-weight: 800;
}

.hero-subtitle {
  font-size: 0.9rem;
  color: #8b949e;
  margin: 0;
  line-height: 1.6;
  max-width: 360px;
}

.hero-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;

  .hero-btn-primary {
    background: $primary-color;
    border-color: $primary-color;
  }

  .hero-btn-ghost {
    background: rgba(255,255,255,0.04);
    border-color: #30363d;
    color: #c9d1d9;

    &:hover {
      background: rgba(255,255,255,0.08);
      border-color: $primary-color;
      color: $primary-color;
    }
  }
}

.hero-decoration {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    display: none;
  }
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}

.deco-1 {
  width: 100px;
  height: 100px;
  background: radial-gradient($primary-color, transparent);
  top: 10px;
  left: 10px;
  animation: float 4s ease-in-out infinite;
}

.deco-2 {
  width: 60px;
  height: 60px;
  background: radial-gradient($secondary-color, transparent);
  bottom: 0;
  right: 0;
  animation: float 4s ease-in-out infinite 1s;
}

.deco-3 {
  width: 40px;
  height: 40px;
  background: radial-gradient($accent-color, transparent);
  top: 0;
  right: 20px;
  animation: float 4s ease-in-out infinite 2s;
}

.deco-emoji {
  position: absolute;
  font-size: 2.5rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 4s ease-in-out infinite 0.5s;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.deco-emoji {
  @keyframes float-emoji {
    0%, 100% { transform: translate(-50%, -50%); }
    50% { transform: translate(-50%, calc(-50% - 10px)); }
  }
  animation: float-emoji 4s ease-in-out infinite 0.5s;
}

// ─── Control Panel ────────────────────────────────────────────────────────────
.control-panel {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.ctrl-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  &--switch {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-color-card);
    border-radius: 8px;
  }
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctrl-slider {
  flex: 1;
}

.ctrl-val {
  font-size: 0.78rem;
  color: $primary-color;
  font-weight: 600;
  min-width: 48px;
  text-align: right;
}

// ─── Strings Editor ───────────────────────────────────────────────────────────
.strings-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--bg-color-card);
  border-radius: 10px;
}

.string-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

// ─── Action Row ───────────────────────────────────────────────────────────────
.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  font-size: 0.78rem;
  line-height: 1.75;
  overflow-x: auto;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;

  code { color: #c9d1d9; }
  .code-comment { color: #8b949e; }
  .code-keyword { color: #ff7b72; }
  .code-string  { color: #a5d6ff; }
  .code-fn      { color: #d2a8ff; }
  .code-num     { color: #79c0ff; }
  .code-bool    { color: #79c0ff; }
}

// ─── Use Cases ────────────────────────────────────────────────────────────────
.use-cases-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.uc-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: var(--bg-color-secondary);

  .uc-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .uc-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .uc-desc {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }
}

// ─── Options Table ────────────────────────────────────────────────────────────
.opts-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.opt-row {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px 6px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.78rem;

  &:last-child {
    border-bottom: none;
  }

  .opt-prop {
    color: $primary-color;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.76rem;
    white-space: nowrap;
  }

  .opt-default {
    color: $accent-color;
    font-family: monospace;
    font-size: 0.75rem;
    white-space: nowrap;
    background: rgba($accent-color, 0.08);
    padding: 1px 5px;
    border-radius: 4px;
  }

  .opt-desc {
    color: var(--text-secondary);
    font-size: 0.76rem;
    line-height: 1.4;
  }
}
</style>
