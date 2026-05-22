<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工程进阶</el-breadcrumb-item>
      <el-breadcrumb-item>VueUse 高阶扩展</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>VueUse 高阶扩展 — 未曾实践的核心 Hooks</h2>
      <p>在前三阶段之外，进一步探索 VueUse 中的高频场景：视口感知懒加载、剪贴板、帧率监控、WebSocket 实时通信与地理位置获取。</p>
    </div>

    <el-row :gutter="20">
      <!-- IntersectionObserver Lazy Load -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="① useIntersectionObserver — 元素进入视口"
          description="图片从 placeholder 变为真实资源，只在滚动至可视区域时才触发加载，节省带宽。"
          :code="intersectionCode"
        >
          <div class="lazy-scroll-area">
            <p class="text-xs text-secondary mb-2">⬇️ 向下滚动以触发懒加载</p>
            <div
              v-for="item in lazyItems"
              :key="item.id"
              :ref="(el) => setLazyRef(el as HTMLElement, item.id)"
              class="lazy-card"
            >
              <div v-if="!item.loaded" class="lazy-placeholder">
                <span class="text-xs">{{ item.loaded ? '✅' : '⏳ 等待进入视口...' }}</span>
              </div>
              <div v-else class="lazy-content flex items-center gap-3">
                <div class="fake-img" :style="{ backgroundColor: item.color }">{{ item.emoji }}</div>
                <div>
                  <p class="font-bold text-sm">{{ item.title }}</p>
                  <p class="text-xs text-secondary">懒加载于 {{ item.loadedAt }}ms 时触发</p>
                </div>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Clipboard + FPS -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="② useClipboard + useFps — 剪贴板与帧率监控"
          description="一键复制文字到剪贴板，同时使用 useFps 监控当前浏览器实时渲染帧率。"
          :code="clipboardFpsCode"
        >
          <!-- Clipboard -->
          <el-card shadow="never" class="sub-card mb-4">
            <template #header><span class="sub-title">📋 useClipboard</span></template>
            <div class="flex flex-col gap-2">
              <el-input v-model="clipText" placeholder="输入要复制的内容..." size="small" />
              <el-button :type="copied ? 'success' : 'primary'" size="small" @click="copyToClipboard">
                {{ copied ? '✅ 已复制!' : '📋 复制到剪贴板' }}
              </el-button>
              <div v-if="clipboardText" class="clipboard-preview">
                剪贴板内容: <code>{{ clipboardText }}</code>
              </div>
            </div>
          </el-card>

          <!-- FPS Monitor -->
          <el-card shadow="never" class="sub-card">
            <template #header><span class="sub-title">📈 useFps — 实时帧率监控</span></template>
            <div class="fps-gauge flex items-center gap-4">
              <div class="fps-number" :class="getFpsClass()">{{ fps }}</div>
              <div class="fps-info flex-1">
                <el-progress
                  :percentage="Math.min(fps / 60 * 100, 100)"
                  :color="getFpsColor()"
                  :stroke-width="10"
                  :show-text="false"
                />
                <p class="text-xs text-secondary mt-2">
                  {{ fps >= 55 ? '🟢 流畅 (Smooth)' : fps >= 30 ? '🟡 一般 (Moderate)' : '🔴 卡顿 (Lagging)' }}
                </p>
              </div>
            </div>
          </el-card>
        </DemoCard>
      </el-col>

      <!-- Geolocation -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="③ useGeolocation — 地理坐标定位"
          description="调用浏览器 GPS API 获取当前所在位置的经纬度坐标与定位精度。"
          :code="geoCode"
        >
          <div class="geo-display flex flex-col gap-3">
            <el-button type="primary" @click="fetchLocation" :loading="geoLocating">
              📍 {{ geoLocating ? '定位中...' : '获取当前位置' }}
            </el-button>

            <div v-if="geoError" class="geo-error text-sm">
              ⚠️ {{ geoError }}（浏览器已授权？请检查权限设置）
            </div>

            <el-descriptions v-if="geoData" :column="1" border size="small">
              <el-descriptions-item label="纬度 (Latitude)">
                <span class="font-mono">{{ geoData.latitude?.toFixed(6) }}°</span>
              </el-descriptions-item>
              <el-descriptions-item label="经度 (Longitude)">
                <span class="font-mono">{{ geoData.longitude?.toFixed(6) }}°</span>
              </el-descriptions-item>
              <el-descriptions-item label="精度 (Accuracy)">
                <el-tag size="small" :type="(geoData.accuracy ?? 0) < 100 ? 'success' : 'warning'">
                  ± {{ geoData.accuracy?.toFixed(0) }} 米
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <el-alert v-if="!geoData && !geoError" type="info" :closable="false" class="text-xs">
              点击按钮后需要在浏览器权限弹窗中允许访问位置权限
            </el-alert>
          </div>
        </DemoCard>
      </el-col>

      <!-- WebSocket -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="④ useWebSocket — 实时双向通信"
          description="连接公共 WebSocket Echo 服务，发送任意消息并接收服务端原样回显，演示实时通信生命周期。"
          :code="wsCode"
        >
          <div class="flex items-center gap-2 mb-3">
            <el-tag :type="wsStatusType" size="large">{{ wsStatusText }}</el-tag>
            <el-button v-if="wsStatus !== 'OPEN'" type="success" size="small" @click="connectWs">连接</el-button>
            <el-button v-else type="danger" size="small" @click="disconnectWs">断开</el-button>
          </div>

          <div class="ws-message-list mb-3">
            <div v-if="wsMessages.length === 0" class="text-center text-xs text-secondary py-4">
              连接后发送消息...
            </div>
            <div
              v-for="(msg, idx) in wsMessages"
              :key="idx"
              class="ws-msg"
              :class="msg.direction"
            >
              <span class="msg-label">{{ msg.direction === 'sent' ? '→ 发送' : '← 接收' }}</span>
              <span class="msg-body">{{ msg.text }}</span>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <el-input v-model="wsMsgInput" size="small" :disabled="wsStatus !== 'OPEN'" placeholder="输入要发送的消息..." @keyup.enter="sendWsMessage" class="flex-1" />
            <el-button :disabled="wsStatus !== 'OPEN'" size="small" type="primary" @click="sendWsMessage">发送</el-button>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useClipboard, useIntersectionObserver, useFps } from '@vueuse/core'
import DemoCard from '@/components/common/DemoCard.vue'
import { ElMessage } from 'element-plus'

// ─── 1. useIntersectionObserver ───────────────────────────────────────
const lazyItems = ref([
  { id: 1, title: 'Vue 3 Composition API', emoji: '🚀', color: '#6366f1', loaded: false, loadedAt: 0 },
  { id: 2, title: 'Pinia 状态管理', emoji: '🍍', color: '#f59e0b', loaded: false, loadedAt: 0 },
  { id: 3, title: 'TanStack Query', emoji: '⚡', color: '#10b981', loaded: false, loadedAt: 0 },
  { id: 4, title: 'VeeValidate + Zod', emoji: '✅', color: '#ef4444', loaded: false, loadedAt: 0 },
  { id: 5, title: 'Shiki 语法高亮', emoji: '🎨', color: '#8b5cf6', loaded: false, loadedAt: 0 },
])

const startTime = Date.now()
const observerMap = new Map<number, ReturnType<typeof useIntersectionObserver>>()

const setLazyRef = (el: HTMLElement | null, id: number) => {
  if (!el || observerMap.has(id)) return
  const target = ref<HTMLElement | null>(el)

  const obs = useIntersectionObserver(target, ([{ isIntersecting }]) => {
    if (isIntersecting) {
      const item = lazyItems.value.find(i => i.id === id)
      if (item && !item.loaded) {
        setTimeout(() => {
          item.loaded = true
          item.loadedAt = Date.now() - startTime
        }, 300)
      }
    }
  }, { threshold: 0.3 })

  observerMap.set(id, obs)
}

// ─── 2. useClipboard ─────────────────────────────────────────────────
const clipText = ref('Hello, VueUse clipboard! 📋 复制此文字测试剪贴板 API')
const clipboardText = ref('')
const { copy, copied } = useClipboard({ read: true })

const copyToClipboard = async () => {
  await copy(clipText.value)
  clipboardText.value = clipText.value
  ElMessage.success('文字已复制到剪贴板！')
}

// ─── 3. useFps ────────────────────────────────────────────────────────
const fps = useFps()

const getFpsClass = () => {
  const f = fps.value
  if (f >= 55) return 'fps-high'
  if (f >= 30) return 'fps-mid'
  return 'fps-low'
}

const getFpsColor = () => {
  const f = fps.value
  if (f >= 55) return '#10b981'
  if (f >= 30) return '#f59e0b'
  return '#ef4444'
}

// ─── 4. useGeolocation ───────────────────────────────────────────────
const geoLocating = ref(false)
const geoData = ref<{ latitude?: number; longitude?: number; accuracy?: number } | null>(null)
const geoError = ref('')

const fetchLocation = () => {
  if (!navigator.geolocation) {
    geoError.value = '浏览器不支持 Geolocation API'
    return
  }
  geoLocating.value = true
  geoError.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      geoData.value = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }
      geoLocating.value = false
      ElMessage.success('成功获取位置坐标！')
    },
    (err) => {
      geoError.value = err.message
      geoLocating.value = false
    },
    { timeout: 10000 }
  )
}

// ─── 5. WebSocket ─────────────────────────────────────────────────────
const wsStatus = ref<'CONNECTING' | 'OPEN' | 'CLOSED'>('CLOSED')
const wsMessages = ref<{ direction: 'sent' | 'received'; text: string; time: string }[]>([])
const wsMsgInput = ref('你好，WebSocket Echo 服务器!')
let wsInstance: WebSocket | null = null

const wsStatusText = computed(() => {
  return { CONNECTING: '连接中...', OPEN: '已连接 ✅', CLOSED: '未连接' }[wsStatus.value]
})
const wsStatusType = computed(() => {
  return { CONNECTING: 'warning', OPEN: 'success', CLOSED: 'info' }[wsStatus.value] as any
})

const now = () => new Date().toLocaleTimeString('zh-CN')

const connectWs = () => {
  wsStatus.value = 'CONNECTING'
  wsInstance = new WebSocket('wss://echo.websocket.events')

  wsInstance.onopen = () => {
    wsStatus.value = 'OPEN'
    wsMessages.value.push({ direction: 'received', text: '✅ 已连接到 echo.websocket.events', time: now() })
  }
  wsInstance.onmessage = (e) => {
    wsMessages.value.push({ direction: 'received', text: e.data, time: now() })
  }
  wsInstance.onerror = () => {
    wsMessages.value.push({ direction: 'received', text: '❌ 连接出错，请检查网络', time: now() })
  }
  wsInstance.onclose = () => {
    wsStatus.value = 'CLOSED'
    wsMessages.value.push({ direction: 'received', text: '🔌 连接已断开', time: now() })
  }
}

const disconnectWs = () => {
  wsInstance?.close()
}

const sendWsMessage = () => {
  if (!wsMsgInput.value.trim() || !wsInstance) return
  wsInstance.send(wsMsgInput.value)
  wsMessages.value.push({ direction: 'sent', text: wsMsgInput.value, time: now() })
}

onUnmounted(() => { wsInstance?.close() })

// Code snippets
const intersectionCode = `import { useIntersectionObserver } from '@vueuse/core'

const target = ref(null)

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    item.loaded = true   // 元素进入视口，触发加载
    obs.stop()           // 加载一次后停止观察
  }
}, { threshold: 0.3 })`

const clipboardFpsCode = `import { useClipboard, useFps } from '@vueuse/core'

// 剪贴板
const { copy, copied } = useClipboard()
await copy('要复制的文字')
console.log(copied.value) // true（2秒后自动重置）

// 帧率监控
const fps = useFps()
console.log(fps.value)  // 60`

const geoCode = `import { useGeolocation } from '@vueuse/core'

const { coords, locatedAt, error } = useGeolocation()
// coords.value.latitude / longitude / accuracy`

const wsCode = `import { useWebSocket } from '@vueuse/core'

const { status, data, send, open, close } = useWebSocket(
  'wss://echo.websocket.events',
  {
    autoReconnect: { retries: 3, delay: 1000 },
    onConnected: () => console.log('已连接'),
    onMessage: (ws, event) => console.log('收到:', event.data)
  }
)
send('Hello WebSocket!')`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.lazy-scroll-area {
  height: 280px;
  overflow-y: auto;
  padding: 4px;
  
  .lazy-card {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 10px;
    background: var(--bg-color-primary);
    transition: all 0.3s;
    
    .lazy-placeholder {
      height: 40px;
      background: var(--bg-color-secondary);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }
    
    .lazy-content .fake-img {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }
  }
}

.sub-card {
  :deep(.el-card__header) { padding: 10px 16px; }
  .sub-title { font-weight: 600; font-size: 0.88rem; }
}

.fps-gauge {
  .fps-number {
    font-size: 2.5rem;
    font-weight: 900;
    font-family: monospace;
    width: 70px;
    text-align: center;
    &.fps-high { color: #10b981; }
    &.fps-mid { color: #f59e0b; }
    &.fps-low { color: #ef4444; }
  }
}

.geo-error { color: #ef4444; }
.clipboard-preview {
  font-size: 0.78rem;
  color: var(--text-secondary);
  code { background: var(--bg-color-secondary); padding: 2px 6px; border-radius: 4px; }
}

.ws-message-list {
  height: 180px;
  overflow-y: auto;
  background: #0b0f19;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  padding: 8px;

  .ws-msg {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: monospace;
    font-size: 0.78rem;
    padding: 3px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);

    &.sent { color: #a5f3fc; }
    &.received { color: #bbf7d0; }

    .msg-label { color: #6b7280; min-width: 48px; font-size: 0.7rem; }
    .msg-body { flex: 1; }
    .msg-time { color: #374151; font-size: 0.7rem; }
  }
}

.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.py-4 { padding: 16px 0; }
.font-bold { font-weight: 700; }
.font-mono { font-family: 'Fira Code', monospace; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.85rem; }
.text-secondary { color: var(--text-secondary); }
.text-center { text-align: center; }
.justify-center { justify-content: center; }
</style>
