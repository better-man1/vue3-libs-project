<template>
  <div class="wavesurfer-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>专业场景集成</el-breadcrumb-item>
      <el-breadcrumb-item>Wavesurfer.js 音频波形</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>Wavesurfer.js 音频波形可视化播放器</h2>
      <p>
        WaveSurfer.js 是一个高度自适应的 HTML5 音频可视化组件，它基于 Web Audio API 和 Canvas 渲染，
        能够在页面上实时渲染出精细的音频电平波形，并提供缩放、精确位置拖拽跳转、播放暂停控制等完备组件。
        多用于在线音频编辑器、播客播放器以及语音通话录音回放。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Player Area -->
      <el-col :lg="16" :md="24">
        <DemoCard
          title="波形可视化播放器"
          description="点击控制播放/暂停、调节音量或通过波形图直接跳转到指定时间。本示例音频为在内存中生成的合成和弦。"
          :code="demoCode"
        >
          <div class="player-wrapper">
            <!-- Loading Cover -->
            <div v-if="isLoading" class="loading-overlay">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在生成和弦并渲染音频波形...</span>
            </div>

            <!-- Waveform Render Target -->
            <div class="waveform-container">
              <div ref="waveformRef" />
            </div>

            <!-- Time Display -->
            <div class="time-display">
              <span>{{ formatTime(currentTime) }}</span>
              <span>/</span>
              <span>{{ formatTime(duration) }}</span>
            </div>

            <!-- Control Bar -->
            <div class="player-controls">
              <el-button type="primary" size="large" circle @click="togglePlay" :disabled="isLoading">
                <span v-if="isPlaying">⏸️</span>
                <span v-else>▶️</span>
              </el-button>

              <el-button size="default" circle @click="stopPlayback" :disabled="isLoading">
                ⏹️
              </el-button>

              <div class="divider" />

              <!-- Speed -->
              <div class="control-item">
                <span class="label">倍速:</span>
                <el-select v-model="playbackRate" style="width: 80px" size="small" @change="onSpeedChange">
                  <el-option label="0.5x" :value="0.5" />
                  <el-option label="1.0x" :value="1.0" />
                  <el-option label="1.5x" :value="1.5" />
                  <el-option label="2.0x" :value="2.0" />
                </el-select>
              </div>

              <!-- Volume -->
              <div class="control-item slider-item">
                <span class="label">🔊 音量:</span>
                <el-slider v-model="volume" :min="0" :max="1" :step="0.05" style="width: 100px" @input="onVolumeChange" />
              </div>

              <!-- Loop -->
              <el-checkbox v-model="isLooping">🔁 循环播放</el-checkbox>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right Styles config & explanation -->
      <el-col :lg="8" :md="24">
        <!-- Style config panel -->
        <el-card class="style-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🎨 波形外观样式配置</span>
            </div>
          </template>
          <div class="style-options">
            <div class="option-item">
              <label>波形未播放颜色</label>
              <el-color-picker v-model="waveColor" @change="recreateWaveSurfer" />
            </div>

            <div class="option-item">
              <label>波形已播放颜色</label>
              <el-color-picker v-model="progressColor" @change="recreateWaveSurfer" />
            </div>

            <div class="option-item">
              <label>条状波形宽度 (barWidth)</label>
              <div class="slider-row">
                <el-slider v-model="barWidth" :min="1" :max="6" :step="1" @change="recreateWaveSurfer" />
                <span class="value">{{ barWidth }}px</span>
              </div>
            </div>

            <div class="option-item">
              <label>条状间距 (barGap)</label>
              <div class="slider-row">
                <el-slider v-model="barGap" :min="1" :max="6" :step="1" @change="recreateWaveSurfer" />
                <span class="value">{{ barGap }}px</span>
              </div>
            </div>

            <div class="option-item">
              <label>圆角大小 (barRadius)</label>
              <div class="slider-row">
                <el-slider v-model="barRadius" :min="0" :max="6" :step="1" @change="recreateWaveSurfer" />
                <span class="value">{{ barRadius }}px</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Explanations -->
        <el-card class="info-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>💡 Web Audio API 原理</span>
            </div>
          </template>
          <div class="card-body">
            <p>
              传统 HTML5 <code>&lt;audio&gt;</code> 标签只能播放声音，而无法获取音频的频谱或者波形电平数据。
            </p>
            <p>
              <strong>WaveSurfer.js</strong> 使用 Web Audio API 获取音频源的 <code>AudioBuffer</code> 
              数据，通过快速傅里叶变换或直接提取分贝振幅，转换成像素高度，最后使用 Canvas 2D 渲染引擎将精美的波形图呈现给用户。
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'
import { Loading } from '@element-plus/icons-vue'
import WaveSurfer from 'wavesurfer.js'

// ─── State ───────────────────────────────────────────────────────────────────
const waveformRef = ref<HTMLDivElement | null>(null)
let wavesurfer: WaveSurfer | null = null

const isPlaying = ref(false)
const isLoading = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const playbackRate = ref(1.0)
const isLooping = ref(false)

// Waveform Style Config
const waveColor = ref('#818cf8')
const progressColor = ref('#6366f1')
const barWidth = ref(3)
const barGap = ref(2)
const barRadius = ref(2)

let audioBlobUrl = ''

// ─── Programmatic Audio generation (8s WAV file) ─────────────────────────────
const createDemoAudioBlob = (): string => {
  const sampleRate = 44100
  const fileDuration = 8
  const samples = sampleRate * fileDuration
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  
  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  
  // WAV Header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, samples * 2, true)
  
  // Create synth melody (C major key)
  const notes = [261.63, 329.63, 392.00, 523.25] // C4, E4, G4, C5
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate
    let sample = 0
    notes.forEach((freq, idx) => {
      const phase = t * freq * 2 * Math.PI
      // Soft envelope decay
      const envelope = Math.exp(-t * 0.4) * Math.pow(Math.sin(Math.PI * Math.min(t * 4, 1)), 2)
      sample += Math.sin(phase) * envelope * (0.3 - idx * 0.05)
    })
    
    // Waveform shape limiter
    const intSample = Math.max(-1, Math.min(1, sample)) * 32767
    view.setInt16(44 + i * 2, intSample, true)
  }
  
  const blob = new Blob([buffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

// ─── Wavesurfer Operations ────────────────────────────────────────────────────
const createWaveSurferInstance = () => {
  if (!waveformRef.value) return

  wavesurfer = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: waveColor.value,
    progressColor: progressColor.value,
    cursorColor: '#ea4335',
    cursorWidth: 2,
    barWidth: barWidth.value || undefined,
    barGap: barGap.value || undefined,
    barRadius: barRadius.value,
    height: 120,
    normalize: true,
  })

  wavesurfer.on('ready', () => {
    isLoading.value = false
    duration.value = wavesurfer?.getDuration() ?? 0
    wavesurfer?.setVolume(volume.value)
    wavesurfer?.setPlaybackRate(playbackRate.value)
  })

  wavesurfer.on('play', () => {
    isPlaying.value = true
  })

  wavesurfer.on('pause', () => {
    isPlaying.value = false
  })

  wavesurfer.on('timeupdate', (time) => {
    currentTime.value = time
  })

  wavesurfer.on('finish', () => {
    isPlaying.value = false
    if (isLooping.value) {
      wavesurfer?.play()
    }
  })

  // Load the Blob audio file
  if (!audioBlobUrl) {
    audioBlobUrl = createDemoAudioBlob()
  }
  wavesurfer.load(audioBlobUrl)
}

const recreateWaveSurfer = () => {
  const currentPos = wavesurfer?.getCurrentTime() || 0
  const playing = isPlaying.value

  if (wavesurfer) {
    wavesurfer.destroy()
  }
  
  createWaveSurferInstance()

  // Wait for load and restore state
  wavesurfer?.once('ready', () => {
    wavesurfer?.setTime(currentPos)
    if (playing) {
      wavesurfer?.play()
    }
  })
}

const togglePlay = () => {
  if (wavesurfer) {
    wavesurfer.playPause()
  }
}

const stopPlayback = () => {
  if (wavesurfer) {
    wavesurfer.stop()
    isPlaying.value = false
    currentTime.value = 0
  }
}

const onVolumeChange = () => {
  wavesurfer?.setVolume(volume.value)
}

const onSpeedChange = () => {
  wavesurfer?.setPlaybackRate(playbackRate.value)
}

const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = Math.floor(secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  createWaveSurferInstance()
})

onUnmounted(() => {
  if (wavesurfer) {
    wavesurfer.destroy()
    wavesurfer = null
  }
  if (audioBlobUrl) {
    URL.revokeObjectURL(audioBlobUrl)
  }
})

// ─── Static Code Snippet ──────────────────────────────────────────────────────
const demoCode = `import WaveSurfer from 'wavesurfer.js'

// 1. 初始化播放器实例
const wavesurfer = WaveSurfer.create({
  container: waveformContainerRef.value,
  waveColor: '#818cf8',
  progressColor: '#6366f1',
  barWidth: 3,
  barGap: 2,
  barRadius: 2,
  height: 120
})

// 2. 加载音频并设置音量
wavesurfer.load('path/to/audio.mp3')
wavesurfer.setVolume(0.8)

// 3. 各种播放事件监听
wavesurfer.on('ready', () => {
  console.log('Audio is ready to play!')
})
wavesurfer.on('timeupdate', (time) => {
  currentTime.value = time
})

// 4. 播放控制
wavesurfer.playPause()`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.wavesurfer-demo {
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

.player-wrapper {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #fff;
  border-radius: 12px;
  font-size: 0.9rem;

  .el-icon {
    font-size: 2.2rem;
  }
}

.waveform-container {
  background: #0f172a;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #1e293b;
  margin-bottom: 12px;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
}

.time-display {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9rem;
  font-family: monospace;
  color: var(--text-secondary);
  margin-bottom: 20px;
  gap: 6px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .divider {
    width: 1px;
    height: 24px;
    background-color: var(--border-color);
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--text-secondary);

    .label {
      font-weight: 600;
    }
  }

  .slider-item {
    flex-grow: 0.1;
    min-width: 130px;
  }
}

.style-card {
  border-radius: 12px;
}

.style-options {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .option-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      .el-slider { flex: 1; }
      .value { font-size: 0.8rem; font-weight: 700; color: $primary-color; }
    }
  }
}

.info-card {
  border-radius: 12px;
  
  .card-body {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.6;
    
    p {
      margin: 0 0 10px;
      &:last-child { margin: 0; }
    }
  }
}

.ml-2 {
  margin-left: 8px;
}
</style>
