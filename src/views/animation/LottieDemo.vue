<template>
  <div class="animation-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>动画特效</el-breadcrumb-item>
      <el-breadcrumb-item>Lottie 矢量动画</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Lottie Web 矢量关键帧动画</h2>
      <p>Lottie 能够以 JSON 格式输出 After Effects 动画，在 Web 端通过 SVG 渲染，完美支持无损缩放和高帧率平滑过渡。支持本地 JSON 拖拽读取与各种播放节奏调控。</p>
    </div>

    <el-row :gutter="20">
      <!-- Player and Control -->
      <el-col :xs="24" :lg="14">
        <DemoCard
          title="Lottie 播放器 (Lottie Canvas)"
          description="使用 Lottie-web 引擎渲染的 SVG 矢量面板。支持鼠标滑动或按钮调节速率。"
          :code="lottieCode"
        >
          <div class="lottie-viewport">
            <div ref="lottieContainer" class="lottie-dom"></div>
            
            <!-- Loading indicator -->
            <div v-if="isLoading" class="loading-overlay">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在装载 JSON 动画...</span>
            </div>
          </div>

          <div class="frame-counter mt-2 text-center text-secondary">
            <span>当前帧: {{ Math.round(currentFrame) }} / {{ Math.round(totalFrames) }}</span>
          </div>

          <!-- Slider timeline seeking -->
          <div class="mt-2">
            <el-slider 
              v-model="frameProgress" 
              :max="100" 
              :step="0.1" 
              :format-tooltip="val => `${val.toFixed(1)}%`"
              @input="seekToProgress" 
            />
          </div>

          <!-- Controls -->
          <div class="flex justify-center gap-2 mt-4 flex-wrap">
            <el-button-group>
              <el-button type="primary" @click="play">▶️ 播放</el-button>
              <el-button type="warning" @click="pause">⏸️ 暂停</el-button>
              <el-button type="danger" @click="stop">⏹️ 停止</el-button>
            </el-button-group>

            <el-button :type="isLooping ? 'success' : 'info'" plain @click="toggleLoop">
              {{ isLooping ? '🔄 循环开启' : '➡️ 单次播放' }}
            </el-button>

            <el-button type="info" @click="reverseDirection">
              🔄 {{ direction === 1 ? '正向' : '反向' }}
            </el-button>
          </div>
        </DemoCard>
      </el-col>

      <!-- Configuration and Source Select -->
      <el-col :xs="24" :lg="10">
        <el-row :gutter="20">
          <!-- Animation Source Select -->
          <el-col :span="24">
            <el-card shadow="hover" class="control-card">
              <template #header>
                <div class="card-header">
                  <span>📥 数据源选择 (Animation Sources)</span>
                </div>
              </template>

              <div class="source-panels">
                <span class="label mb-2 block">1. 选择预设公共动画 (网络需联通):</span>
                <el-select v-model="selectedPreset" @change="loadPresetUrl" class="w-full mb-4" placeholder="选择预设 URL...">
                  <el-option 
                    v-for="p in presets" 
                    :key="p.value" 
                    :label="p.label" 
                    :value="p.value" 
                  />
                </el-select>

                <div class="url-input-group mb-4">
                  <span class="label mb-2 block">或者输入自定义 Lottie JSON 链接:</span>
                  <div class="flex gap-2">
                    <el-input v-model="customUrl" placeholder="https://..." />
                    <el-button type="primary" @click="loadCustomUrl">加载</el-button>
                  </div>
                </div>

                <!-- Drag and drop local json -->
                <span class="label mb-2 block">2. 上传/拖拽本地 Lottie JSON 文件 (支持完全离线):</span>
                <el-upload
                  drag
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".json"
                  :on-change="handleLocalFileUpload"
                  class="lottie-uploader"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">
                    拖拽 JSON 动画文件到此或 <em>点击上传</em>
                  </div>
                </el-upload>
              </div>
            </el-card>
          </el-col>

          <!-- Playback Speed -->
          <el-col :span="24" class="mt-4">
            <el-card shadow="hover" class="control-card">
              <template #header>
                <div class="card-header">
                  <span>⚡ 播放速度与渲染配置</span>
                </div>
              </template>

              <div class="playback-controls">
                <div class="control-item mb-4">
                  <span class="label">播放速度 (SpeedMultiplier): {{ playSpeed }}x</span>
                  <el-slider 
                    v-model="playSpeed" 
                    :min="0.25" 
                    :max="3" 
                    :step="0.25" 
                    show-stops
                    @change="updateSpeed" 
                  />
                </div>

                <div class="info-block">
                  <h5>📝 Lottie 技术小贴士</h5>
                  <ul>
                    <li>Lottie 基于 JSON 树，能够直接映射 AE 里的锚点、贝塞尔曲线。</li>
                    <li>完全矢量，高清晰度，文件大小仅为 GIF 的 1/10 左右。</li>
                    <li>支持动态修改图层颜色或进行事件监听（如 loopComplete, enterFrame 等）。</li>
                  </ul>
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
import { ref, onMounted, onUnmounted } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'
import { Loading, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// Minimal Rotating Square Lottie JSON (Fallback offline asset)
const fallbackAnimation = {
  v: '5.5.0',
  fr: 30,
  ip: 0,
  op: 60,
  w: 120,
  h: 120,
  nm: 'OfflineFallbackSquare',
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'RotatingShape',
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }], ix: 10 },
        p: { a: 0, k: [60, 60, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 1, k: [{ t: 0, s: [80, 80, 100] }, { t: 30, s: [110, 110, 100] }, { t: 60, s: [80, 80, 100] }], ix: 6 }
      },
      shapes: [
        {
          ty: 'rc',
          d: 1,
          s: { a: 0, k: [50, 50], ix: 2 },
          p: { a: 0, k: [0, 0], ix: 3 },
          r: { a: 0, k: 8, ix: 4 },
          nm: 'RoundedSquare',
          mn: 'ADBE Vector Shape - Rect'
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.388, 0.4, 0.945, 1], ix: 4 }, // color #6366f1
          o: { a: 0, k: 100, ix: 5 },
          r: 1,
          nm: 'FillColor',
          mn: 'ADBE Vector Graphic - Fill'
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
}

// Refs
const lottieContainer = ref<HTMLDivElement | null>(null)
const isLoading = ref(false)
const isLooping = ref(true)
const playSpeed = ref(1.0)
const direction = ref<1 | -1>(1) // 1 = forward, -1 = reverse

// Frame info
const currentFrame = ref(0)
const totalFrames = ref(60)
const frameProgress = ref(0)

// Source values
const selectedPreset = ref('fallback')
const customUrl = ref('')
const presets = [
  { label: '📦 本地离线圆角方块 (默认)', value: 'fallback' },
  { label: '🍉 Airbnb 西瓜演示 (在线)', value: 'https://raw.githubusercontent.com/airbnb/lottie-web/master/demo/watermelon/data.json' },
  { label: '⚙️ 简约 Loading 齿轮 (在线)', value: 'https://labs.nearpod.com/bodymovin/demo/alBoardman/me_denim.json' }
]

let lottieInstance: AnimationItem | null = null

// Destroys any existing lottie animations to prevent memory leaks
const destroyLottie = () => {
  if (lottieInstance) {
    lottieInstance.destroy()
    lottieInstance = null
  }
}

// Load Lottie from either data object or external URL path
const loadLottie = (source: { data?: any, path?: string }) => {
  if (!lottieContainer.value) return

  isLoading.value = true
  destroyLottie()

  try {
    const config: any = {
      container: lottieContainer.value,
      renderer: 'svg',
      loop: isLooping.value,
      autoplay: true,
    }

    if (source.data) {
      config.animationData = source.data
    } else if (source.path) {
      config.path = source.path
    }

    lottieInstance = lottie.loadAnimation(config)

    // Listen to load and enterFrame events
    lottieInstance.addEventListener('DOMLoaded', () => {
      isLoading.value = false
      if (lottieInstance) {
        totalFrames.value = lottieInstance.totalFrames
        lottieInstance.setSpeed(playSpeed.value)
      }
    })

    lottieInstance.addEventListener('enterFrame', () => {
      if (lottieInstance) {
        currentFrame.value = lottieInstance.currentFrame
        frameProgress.value = (lottieInstance.currentFrame / lottieInstance.totalFrames) * 100
      }
    })

    lottieInstance.addEventListener('data_failed', () => {
      isLoading.value = false
      ElMessage.error('加载 JSON 动画资源失败，请确认链接可正常跨域拉取！')
      loadOfflineFallback()
    })
  } catch (err) {
    isLoading.value = false
    ElMessage.error('初始化 Lottie 动画时发生错误。')
    console.error(err)
  }
}

// Load Offline Fallback
const loadOfflineFallback = () => {
  selectedPreset.value = 'fallback'
  loadLottie({ data: fallbackAnimation })
}

// Preset url selector trigger
const loadPresetUrl = (val: string) => {
  if (val === 'fallback') {
    loadOfflineFallback()
  } else {
    loadLottie({ path: val })
  }
}

// Custom URL input trigger
const loadCustomUrl = () => {
  if (!customUrl.value.trim()) {
    ElMessage.warning('请输入有效的 JSON 动画 URL 地址！')
    return
  }
  selectedPreset.value = ''
  loadLottie({ path: customUrl.value.trim() })
}

// Local JSON drag upload reading
const handleLocalFileUpload = (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return

  const reader = new FileReader()
  isLoading.value = true
  
  reader.onload = (e) => {
    try {
      const parsedData = JSON.parse(e.target?.result as string)
      selectedPreset.value = ''
      loadLottie({ data: parsedData })
      ElMessage.success('成功加载本地离线 Lottie JSON 文件！')
    } catch (err) {
      ElMessage.error('解析 JSON 失败，请上传标准的 Lottie 格式 JSON 动画文件。')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  reader.onerror = () => {
    ElMessage.error('读取本地文件失败。')
    isLoading.value = false
  }

  reader.readAsText(rawFile)
}

// Playback operations
const play = () => lottieInstance?.play()
const pause = () => lottieInstance?.pause()
const stop = () => lottieInstance?.stop()

const toggleLoop = () => {
  isLooping.value = !isLooping.value
  if (lottieInstance) {
    lottieInstance.loop = isLooping.value
  }
}

const reverseDirection = () => {
  direction.value = direction.value === 1 ? -1 : 1
  lottieInstance?.setDirection(direction.value)
}

const updateSpeed = () => {
  lottieInstance?.setSpeed(playSpeed.value)
}

// Seek to timeline slider progress
const seekToProgress = (progress: number | number[]) => {
  if (!lottieInstance) return
  const val = Array.isArray(progress) ? progress[0] : progress
  const frame = (val / 100) * lottieInstance.totalFrames
  // Pause on seek so it is controllable
  lottieInstance.goToAndStop(frame, true)
}

onMounted(() => {
  loadOfflineFallback()
})

onUnmounted(() => {
  destroyLottie()
})

const lottieCode = `// Lottie-web 容器挂载与动画加载
import lottie from 'lottie-web'

const lottieInstance = lottie.loadAnimation({
  container: lottieContainer.value, // DOM 挂载节点
  renderer: 'svg',                 // 渲染器: 'svg' / 'canvas' / 'html'
  loop: true,                      // 是否循环
  autoplay: true,                  // 自动播放
  animationData: fallbackJson,     // 直接绑定本地 JSON 对象
  // path: 'https://...'          // 或者传入远程 HTTP JSON 链接
})

// 播放/控制函数
lottieInstance.play()
lottieInstance.pause()
lottieInstance.stop()
lottieInstance.setSpeed(1.5)       // 设置播放速率为 1.5x
lottieInstance.setDirection(-1)    // 倒流播放`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.animation-demo-container {
  padding-bottom: 24px;
}

.lottie-viewport {
  width: 100%;
  height: 280px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  .lottie-dom {
    width: 240px;
    height: 240px;
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #ffffff;
    font-size: 0.9rem;
    z-index: 10;
    
    .is-loading {
      font-size: 2rem;
    }
  }
}

.frame-counter {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.control-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
}

.source-panels {
  display: flex;
  flex-direction: column;
  
  .label {
    font-size: 0.82rem;
    color: var(--text-secondary);
  }
}

.lottie-uploader {
  :deep(.el-upload-dragger) {
    background-color: var(--bg-color-primary);
    border: 1px dashed var(--border-color);
    padding: 16px;
    
    &:hover {
      border-color: $primary-color;
    }
  }
  
  .el-upload__text {
    font-size: 0.8rem;
    color: var(--text-secondary);
    
    em {
      color: $primary-color;
      font-style: normal;
    }
  }
}

.info-block {
  padding: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  margin-top: 12px;
  
  h5 {
    margin-top: 0;
    margin-bottom: 6px;
    font-size: 0.85rem;
    color: var(--text-primary);
  }
  
  ul {
    margin: 0;
    padding-left: 18px;
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.5;
    
    li {
      margin-bottom: 4px;
    }
  }
}

.text-center {
  text-align: center;
}
.text-secondary {
  color: var(--text-secondary);
}
.block {
  display: block;
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
.mt-2 {
  margin-top: 8px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.w-full {
  width: 100%;
}
.flex-wrap {
  flex-wrap: wrap;
}
</style>
