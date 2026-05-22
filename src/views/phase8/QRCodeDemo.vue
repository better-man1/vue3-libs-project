<template>
  <div class="qrcode-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实用工具扩展</el-breadcrumb-item>
      <el-breadcrumb-item>QRCode 二维码生成</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>QRCode 二维码生成</h2>
      <p>
        基于 <code>qrcode</code> 库在浏览器端实时生成二维码，无需后端支持。支持自定义颜色、尺寸、
        纠错级别等参数，可将任意文本、URL、JSON 数据编码为二维码图像，并支持一键下载 PNG 文件。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Left: Interactive Demo -->
      <el-col :lg="14" :md="24">
        <DemoCard
          title="实时二维码生成器"
          description="修改下方参数，二维码将实时更新。支持 URL、文本、JSON 等任意内容。"
          :code="demoCode"
        >
          <div class="demo-content">
            <!-- Input Area -->
            <div class="input-section">
              <label class="field-label">编码内容</label>
              <el-input
                v-model="text"
                type="textarea"
                :rows="3"
                placeholder="输入要编码的内容，支持 URL、文本、JSON 等..."
                resize="none"
                class="content-input"
              />
              <div class="preset-row">
                <span class="preset-label">快速填入：</span>
                <el-button
                  v-for="preset in presets"
                  :key="preset.label"
                  size="small"
                  plain
                  @click="text = preset.value"
                >
                  {{ preset.label }}
                </el-button>
              </div>
            </div>

            <!-- Controls Grid -->
            <div class="controls-grid">
              <!-- Color: Dark -->
              <div class="control-item">
                <label class="field-label">前景色（深色）</label>
                <div class="color-control">
                  <el-color-picker v-model="darkColor" show-alpha size="default" @change="generateQR" />
                  <span class="color-val">{{ darkColor }}</span>
                </div>
              </div>

              <!-- Color: Light -->
              <div class="control-item">
                <label class="field-label">背景色（浅色）</label>
                <div class="color-control">
                  <el-color-picker v-model="lightColor" show-alpha size="default" @change="generateQR" />
                  <span class="color-val">{{ lightColor }}</span>
                </div>
              </div>

              <!-- Error Correction -->
              <div class="control-item">
                <label class="field-label">纠错级别</label>
                <el-select v-model="errorLevel" size="default" @change="generateQR" style="width: 100%">
                  <el-option label="L — 低 (7%)" value="L" />
                  <el-option label="M — 中 (15%)" value="M" />
                  <el-option label="Q — 较高 (25%)" value="Q" />
                  <el-option label="H — 高 (30%)" value="H" />
                </el-select>
              </div>

              <!-- Margin -->
              <div class="control-item">
                <label class="field-label">边距 (margin)</label>
                <div class="slider-row">
                  <el-slider v-model="margin" :min="0" :max="10" :step="1" @change="generateQR" class="ctrl-slider" />
                  <span class="slider-val">{{ margin }}</span>
                </div>
              </div>

              <!-- Size -->
              <div class="control-item control-item--full">
                <label class="field-label">尺寸 — {{ qrSize }}px</label>
                <el-slider
                  v-model="qrSize"
                  :min="100"
                  :max="400"
                  :step="20"
                  :marks="sizeMark"
                  @change="generateQR"
                />
              </div>
            </div>

            <!-- QR Display -->
            <div class="qr-display-wrapper">
              <div class="qr-card" :class="{ generating: isGenerating }">
                <div v-if="isGenerating" class="qr-loading">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  <span>生成中...</span>
                </div>
                <canvas ref="canvasRef" class="qr-canvas" :class="{ hidden: isGenerating }" />
                <div v-if="hasError" class="qr-error">
                  <el-icon><Warning /></el-icon>
                  <span>内容格式错误</span>
                </div>
              </div>
              <div class="qr-meta">
                <el-tag type="info" effect="plain" class="meta-tag">
                  {{ qrSize }} × {{ qrSize }} px
                </el-tag>
                <el-tag type="info" effect="plain" class="meta-tag">
                  纠错：{{ errorLevel }}
                </el-tag>
                <el-tag :type="contentType.type as any" effect="plain" class="meta-tag">
                  {{ contentType.label }}
                </el-tag>
              </div>
            </div>

            <!-- Download Button -->
            <div class="action-row">
              <el-button type="primary" size="large" :disabled="!dataUrl || hasError" @click="downloadQR">
                <el-icon><Download /></el-icon>下载 PNG 文件
              </el-button>
              <el-button size="large" @click="copyDataUrl" :disabled="!dataUrl">
                <el-icon><CopyDocument /></el-icon>复制 Data URL
              </el-button>
              <el-button size="large" type="danger" plain @click="resetAll">
                <el-icon><RefreshLeft /></el-icon>重置
              </el-button>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right: Info Cards -->
      <el-col :lg="10" :md="24">
        <!-- Code Snippet -->
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Document /></el-icon>
              <span>核心代码示例</span>
            </div>
          </template>
          <pre class="code-block"><code><span class="code-keyword">import</span> QRCode <span class="code-keyword">from</span> <span class="code-string">'qrcode'</span>

<span class="code-comment">// 渲染到 Canvas</span>
<span class="code-keyword">await</span> QRCode.<span class="code-fn">toCanvas</span>(canvasEl, text, {
  width: <span class="code-num">280</span>,
  margin: <span class="code-num">2</span>,
  color: {
    dark:  <span class="code-string">'#6366f1'</span>,
    light: <span class="code-string">'#ffffff'</span>
  },
  errorCorrectionLevel: <span class="code-string">'H'</span>
})

<span class="code-comment">// 生成 Data URL (用于下载/img标签)</span>
<span class="code-keyword">const</span> url = <span class="code-keyword">await</span> QRCode.<span class="code-fn">toDataURL</span>(text, {
  width: <span class="code-num">400</span>,
  type: <span class="code-string">'image/png'</span>
})

<span class="code-comment">// 生成 SVG 字符串</span>
<span class="code-keyword">const</span> svg = <span class="code-keyword">await</span> QRCode.<span class="code-fn">toString</span>(text, {
  type: <span class="code-string">'svg'</span>
})</code></pre>
        </el-card>

        <!-- Error Correction Levels -->
        <el-card class="info-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Lock /></el-icon>
              <span>纠错级别说明</span>
            </div>
          </template>
          <div class="error-levels">
            <div v-for="level in errorLevels" :key="level.code" class="level-item">
              <div class="level-badge" :style="{ background: level.color }">{{ level.code }}</div>
              <div class="level-info">
                <div class="level-name">{{ level.name }}</div>
                <div class="level-desc">{{ level.desc }}</div>
              </div>
              <div class="level-bar-wrap">
                <div class="level-bar" :style="{ width: level.pct + '%', background: level.color }" />
                <span class="level-pct">{{ level.pct }}%</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Use Cases -->
        <el-card class="info-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Star /></el-icon>
              <span>典型应用场景</span>
            </div>
          </template>
          <div class="use-cases">
            <div v-for="uc in useCases" :key="uc.title" class="use-case-item">
              <span class="uc-icon">{{ uc.icon }}</span>
              <div>
                <div class="uc-title">{{ uc.title }}</div>
                <div class="uc-desc">{{ uc.desc }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import DemoCard from '@/components/common/DemoCard.vue'
import {
  Download, CopyDocument, RefreshLeft, Document,
  Warning, Loading, Lock, Star
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ─── State ───────────────────────────────────────────────────────────────────
const text       = ref('https://vue3-libs-playground.dev')
const darkColor  = ref('#6366f1')
const lightColor = ref('#ffffff')
const qrSize     = ref(280)
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('H')
const margin     = ref(2)

const canvasRef    = ref<HTMLCanvasElement | null>(null)
const dataUrl      = ref('')
const isGenerating = ref(false)
const hasError     = ref(false)

const sizeMark = { 100: '100', 200: '200', 300: '300', 400: '400' }

// ─── Content Type Detection ───────────────────────────────────────────────────
const contentType = computed(() => {
  const t = text.value.trim()
  if (/^https?:\/\//i.test(t)) return { label: 'URL', type: 'primary' }
  if (/^\{.*\}$/s.test(t))     return { label: 'JSON', type: 'warning' }
  if (/^tel:/i.test(t))        return { label: '电话', type: 'success' }
  if (/^mailto:/i.test(t))     return { label: '邮件', type: 'info' }
  return { label: '文本', type: '' }
})

// ─── QR Generation ───────────────────────────────────────────────────────────
const generateQR = async () => {
  if (!text.value.trim()) {
    hasError.value = false
    return
  }
  isGenerating.value = true
  hasError.value = false

  try {
    const opts = {
      width: qrSize.value,
      margin: margin.value,
      color: { dark: darkColor.value, light: lightColor.value },
      errorCorrectionLevel: errorLevel.value
    }

    if (canvasRef.value) {
      await QRCode.toCanvas(canvasRef.value, text.value, opts)
    }

    dataUrl.value = await QRCode.toDataURL(text.value, {
      ...opts,
      type: 'image/png'
    })
  } catch {
    hasError.value = true
    dataUrl.value = ''
    ElMessage.error('生成失败：内容格式不正确')
  } finally {
    isGenerating.value = false
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────
const downloadQR = () => {
  if (!dataUrl.value) return
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = `qrcode-${Date.now()}.png`
  a.click()
  ElMessage.success('二维码已下载！')
}

const copyDataUrl = async () => {
  if (!dataUrl.value) return
  try {
    await navigator.clipboard.writeText(dataUrl.value)
    ElMessage.success('Data URL 已复制到剪贴板！')
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}

const resetAll = () => {
  text.value      = 'https://vue3-libs-playground.dev'
  darkColor.value = '#6366f1'
  lightColor.value= '#ffffff'
  qrSize.value    = 280
  errorLevel.value= 'H'
  margin.value    = 2
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(text, generateQR, { debounce: 300 } as any)

onMounted(generateQR)

// ─── Static Data ──────────────────────────────────────────────────────────────
const presets = [
  { label: '网址', value: 'https://vue3-libs-playground.dev' },
  { label: '文本', value: 'Hello, Vue 3! 这是一段测试文本 🚀' },
  { label: 'JSON', value: '{"name":"Vue3","version":"3.4","author":"Evan You"}' },
  { label: '电话', value: 'tel:+8618888888888' },
]

const errorLevels = [
  { code: 'L', name: '低纠错 (Low)',      pct: 7,  color: '#10b981', desc: '数据量最小，适合干净环境展示' },
  { code: 'M', name: '中纠错 (Medium)',   pct: 15, color: '#3b82f6', desc: '一般场景推荐，平衡密度与纠错' },
  { code: 'Q', name: '较高纠错 (Quartile)', pct: 25, color: '#f59e0b', desc: '工业/打印场景，可修复部分污损' },
  { code: 'H', name: '高纠错 (High)',     pct: 30, color: '#6366f1', desc: '最强纠错，适合嵌入 Logo 遮挡' },
]

const useCases = [
  { icon: '🔗', title: '分享链接',    desc: '将网页 URL 编码为二维码，扫码即访问' },
  { icon: '💳', title: '名片/联系人', desc: '编码 vCard 格式，扫码添加联系人' },
  { icon: '📦', title: '商品溯源',    desc: '将产品 ID/批次信息编码，供追溯查询' },
  { icon: '🔐', title: 'WiFi 连接',   desc: '编码 WIFI:S:ssid;T:WPA;P:password;; 格式' },
  { icon: '💰', title: '支付收款',    desc: '编码支付链接，生成收款二维码' },
]

const demoCode = `import QRCode from 'qrcode'

// 渲染到 Canvas 元素
await QRCode.toCanvas(canvasRef.value, text, {
  width: 280,
  margin: 2,
  color: { dark: '#6366f1', light: '#ffffff' },
  errorCorrectionLevel: 'H'
})

// 生成 Data URL 用于下载
const url = await QRCode.toDataURL(text, { width: 400 })
const a = document.createElement('a')
a.href = url; a.download = 'qrcode.png'; a.click()`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

// ─── Layout ───────────────────────────────────────────────────────────────────
.qrcode-demo {
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
  gap: 22px;
}

.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// ─── Input Section ────────────────────────────────────────────────────────────
.input-section {
  display: flex;
  flex-direction: column;
}

.content-input {
  :deep(.el-textarea__inner) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    border-radius: 8px;
  }
}

.preset-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;

  .preset-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
}

// ─── Controls Grid ────────────────────────────────────────────────────────────
.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 18px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.control-item {
  display: flex;
  flex-direction: column;

  &--full {
    grid-column: 1 / -1;
  }
}

.color-control {
  display: flex;
  align-items: center;
  gap: 10px;

  .color-val {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-family: monospace;
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

.slider-val {
  font-size: 0.82rem;
  color: $primary-color;
  font-weight: 600;
  min-width: 24px;
  text-align: right;
}

// ─── QR Display ───────────────────────────────────────────────────────────────
.qr-display-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.qr-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-secondary);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  min-width: 200px;
  min-height: 200px;
  transition: border-color 0.3s, box-shadow 0.3s;

  &.generating {
    border-color: rgba($primary-color, 0.4);
    box-shadow: 0 0 20px rgba($primary-color, 0.15);
  }

  &:hover {
    border-color: rgba($primary-color, 0.5);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: absolute;
  color: var(--text-secondary);
  font-size: 0.9rem;

  .loading-icon {
    font-size: 2rem;
    color: $primary-color;
    animation: spin 1s linear infinite;
  }
}

.qr-canvas {
  border-radius: 8px;
  display: block;
  max-width: 100%;
  transition: opacity 0.3s;

  &.hidden {
    opacity: 0;
  }
}

.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 0.9rem;
  position: absolute;

  :deep(.el-icon) {
    font-size: 2rem;
  }
}

.qr-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.meta-tag {
  font-size: 0.78rem;
}

// ─── Action Row ───────────────────────────────────────────────────────────────
.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

// ─── Right Cards ──────────────────────────────────────────────────────────────
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
}

// ─── Error Levels ─────────────────────────────────────────────────────────────
.error-levels {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.level-item {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 12px;
}

.level-badge {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.level-info {
  .level-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .level-desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }
}

.level-bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80px;
}

.level-bar {
  height: 6px;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.level-pct {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

// ─── Use Cases ────────────────────────────────────────────────────────────────
.use-cases {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.use-case-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-color-secondary);
  border-radius: 8px;

  .uc-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .uc-title {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .uc-desc {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
