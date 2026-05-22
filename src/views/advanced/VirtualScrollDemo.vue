<template>
  <div class="advanced-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>高级功能</el-breadcrumb-item>
      <el-breadcrumb-item>虚拟滚动列表</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>手写高性能虚拟滚动列表 (Virtual Scroll)</h2>
      <p>学习如何应对海量数据的渲染优化。传统 <code>v-for</code> 渲染 100,000 条数据会产生数万个真实 DOM 节点致使浏览器完全卡死。而虚拟滚动仅渲染视口区域内的数十个 DOM 节点，使渲染时间降至常数级（O(1)）。</p>
    </div>

    <!-- Stats & Filters panel -->
    <el-card shadow="hover" class="mb-4 control-card">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <!-- Search and filters -->
        <div class="flex items-center gap-3">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索日志关键字..." 
            clearable 
            style="width: 250px"
          />
          <el-radio-group v-model="logFilter" size="default">
            <el-radio-button value="ALL">全部</el-radio-button>
            <el-radio-button value="INFO">INFO</el-radio-button>
            <el-radio-button value="WARN">WARN</el-radio-button>
            <el-radio-button value="ERROR">ERROR</el-radio-button>
          </el-radio-group>
        </div>

        <!-- Render Switcher -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-secondary">模式切换:</span>
          <el-switch 
            v-model="isVirtualMode" 
            active-text="虚拟滚动 (100,000条丝滑)" 
            inactive-text="传统列表 (渲染上限 3,000条)"
            @change="handleModeChange"
          />
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- Left Column: Virtual Viewport -->
      <el-col :xs="24" :lg="14">
        <DemoCard
          title="服务端事件日志监视器 (Event Log Monitor)"
          :description="`当前日志池数据量: ${totalDataCount} 条 | 已过滤结果: ${filteredLogs.length} 条`"
          :code="virtualScrollFormulaCode"
        >
          <div class="performance-hud flex justify-between items-center mb-3">
            <div class="hud-item flex items-center">
              <span>🚀 页面帧率:</span>
              <el-tag type="success" size="small" class="ml-2">60 FPS</el-tag>
            </div>
            <div class="hud-item flex items-center">
              <span>⌛ DOM 节点挂载数:</span>
              <el-tag type="warning" size="small" class="ml-2">
                {{ isVirtualMode ? visibleItems.length : Math.min(filteredLogs.length, 3000) }} 个
              </el-tag>
            </div>
            <div class="hud-item flex items-center">
              <span>📈 滚动速度 (Scroll Velocity):</span>
              <el-tag :type="scrollVelocity > 5 ? 'danger' : 'info'" size="small" class="ml-2 font-mono">
                {{ scrollVelocity }} px/ms
              </el-tag>
            </div>
          </div>

          <!-- The Scroll Viewport Container -->
          <div 
            v-if="isVirtualMode"
            class="virtual-viewport-container" 
            :style="{ height: viewportHeight + 'px' }"
            @scroll="onViewportScroll"
            ref="viewportRef"
          >
            <!-- Phantom spacer to create scrollbar height -->
            <div class="virtual-phantom" :style="{ height: totalPhantomHeight + 'px' }"></div>
            
            <!-- Real content list positioned inside view -->
            <div class="virtual-list-content" :style="{ transform: `translate3d(0, ${offsetY}px, 0)` }">
              <div 
                v-for="item in visibleItems" 
                :key="item.index" 
                class="log-item flex items-center"
                :style="{ height: itemHeight + 'px' }"
              >
                <span class="log-index font-mono">[{{ item.index + 1 }}]</span>
                <span class="log-time font-mono">{{ item.time }}</span>
                <el-tag :type="getLogLevelTagType(item.level)" size="small" class="mx-2">
                  {{ item.level }}
                </el-tag>
                <span class="log-message text-ellipsis">{{ item.message }}</span>
              </div>
            </div>

            <!-- Absolute zero-data view -->
            <div v-if="filteredLogs.length === 0" class="empty-list text-center py-20 text-secondary">
              🔍 未找到匹配该过滤规则的日志数据
            </div>
          </div>

          <!-- Traditional Render List -->
          <div 
            v-else 
            class="traditional-viewport-container"
            :style="{ height: viewportHeight + 'px' }"
          >
            <div class="traditional-warning p-4 mb-2 bg-danger-light rounded text-xs">
              ⚠️ 警告：当前处于传统渲染模式。为防浏览器标签页挂起卡死，已将 DOM 渲染上限截断至最多 3,000 条。
            </div>
            <div class="scroll-wrapper">
              <div 
                v-for="(item, idx) in traditionalItems" 
                :key="idx" 
                class="log-item flex items-center"
                :style="{ height: itemHeight + 'px' }"
              >
                <span class="log-index font-mono">[{{ item.index + 1 }}]</span>
                <span class="log-time font-mono">{{ item.time }}</span>
                <el-tag :type="getLogLevelTagType(item.level)" size="small" class="mx-2">
                  {{ item.level }}
                </el-tag>
                <span class="log-message text-ellipsis">{{ item.message }}</span>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right Column: Mathematical explanation -->
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span class="font-bold">📐 虚拟列表核心算法推导</span>
            </div>
          </template>

          <div class="math-content text-sm text-secondary">
            <p>虚拟滚动的核心在于通过滚动高度 <code>scrollTop</code> 计算出可视范围并仅渲染此区间的数据：</p>
            <div class="formula-box p-3 bg-secondary rounded font-mono text-xs mb-3">
              1. 滚动占位区高度 (Phantom Height)<br />
              &nbsp;&nbsp;&nbsp;<b>TotalHeight = totalCount * itemHeight</b><br />
              <br />
              2. 可视起始项索引 (Start Index)<br />
              &nbsp;&nbsp;&nbsp;<b>StartIndex = Math.floor(scrollTop / itemHeight)</b><br />
              <br />
              3. 可视末尾项索引 (End Index)<br />
              &nbsp;&nbsp;&nbsp;<b>EndIndex = StartIndex + Math.ceil(viewportHeight / itemHeight)</b><br />
              <br />
              4. 渲染平移偏移量 (Translate Y)<br />
              &nbsp;&nbsp;&nbsp;<b>OffsetY = StartIndex * itemHeight</b>
            </div>
            <p>我们在视窗内加上了 <code>buffer = 5</code> (前置和后置缓存数)，这样能防止用户极速滑动时因为浏览器渲染滞后而出现短暂的白屏块现象。</p>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <div class="card-header">
              <span class="font-bold">📝 滚动性能调优技巧</span>
            </div>
          </template>
          <div class="card-content text-sm text-secondary">
            <ul>
              <li><strong>防抖节流避坑</strong>：在虚拟滚动的 <code>scroll</code> 监听事件中，**千万不能使用节流函数**，否则会导致内容区容器的 OffsetY 发生位移偏斜，让卡片看起来剧烈闪烁抖动。</li>
              <li><strong>硬件加速</strong>：对列表移动容器 <code>virtual-list-content</code> 必须强制设置 <code>will-change: transform</code> 或 <code>transform: translate3d(0, Y, 0)</code>，可强制触发 GPU 合成渲染通道。</li>
              <li><strong>动态高度支持</strong>：如果每项高度不固定，需要先使用预估高度渲染，挂载 DOM 后通过 <code>getBoundingClientRect()</code> 动态测量并缓存对应索引的高度与位移坐标。</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// 1. Data Generation (Simulate 100,000 heavy logs)
interface LogRow {
  index: number
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

const totalDataCount = 100000
const logsPool = ref<LogRow[]>([])

const generateLogs = () => {
  const levels: ('INFO' | 'WARN' | 'ERROR')[] = ['INFO', 'WARN', 'ERROR']
  const endpoints = ['/api/v1/auth/login', '/api/v1/users/profile', '/api/v1/cart/add', '/api/v1/checkout', '/api/v1/analytics/sensor']
  const messages = [
    'User request processed successfully',
    'Database connection connection pool overflow, retrying',
    'Authentication token signature verification failed',
    'Rate limit exceeded for endpoint, blocking request',
    'GC cleanup completed. Transformed 2038 memory chunks',
    'Failed to read configuration file. Falling back to default'
  ]

  const tempLogs: LogRow[] = []
  const startTime = Date.now()

  for (let i = 0; i < totalDataCount; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    const baseMsg = messages[Math.floor(Math.random() * messages.length)]
    
    // Create timestamps
    const dateStr = new Date(startTime - i * 1200).toISOString().split('T')[1].substring(0, 8)

    tempLogs.push({
      index: i,
      time: dateStr,
      level,
      message: `${endpoint} - ${baseMsg} (hash: ${Math.random().toString(36).substring(7)})`
    })
  }
  logsPool.value = tempLogs
}

// 2. Filter criteria
const searchQuery = ref('')
const logFilter = ref<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')

const filteredLogs = computed(() => {
  return logsPool.value.filter(log => {
    // Level match
    if (logFilter.value !== 'ALL' && log.level !== logFilter.value) {
      return false
    }
    // Search match
    if (searchQuery.value && !log.message.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    return true
  })
})

// 3. Virtual scroll configuration
// 3. 核心虚拟滚动参数配置
const isVirtualMode = ref(true)     // 是否开启虚拟滚动模式
const itemHeight = 36               // 每一行日志项的固定物理高度 (单位: 像素 px)
const viewportHeight = 450          // 外部可视滚动窗口的固定物理高度 (单位: 像素 px)
const buffer = 5                    // 视口上下额外渲染的“缓存项”数量（缓冲带，可防止快速滑动时闪现白屏）

const scrollTop = ref(0)            // 视口当前的纵向物理滚动高度，由 scroll 事件高频更新
const viewportRef = ref<HTMLElement | null>(null) // 滚动容器 DOM 的引用

// 📐 虚拟列表四大核心算法推导

/**
 * A. 滚动占位总高度 (Phantom Height)
 * 用一个透明、无内容的空 div (即垫高器) 撑开容器。
 * 其高度为: 过滤后总条数 * 单项高度。
 * 作用：诱骗浏览器出现与真实十万条数据完全一致的真实滚动条。
 */
const totalPhantomHeight = computed(() => {
  return filteredLogs.value.length * itemHeight
})

/**
 * B. 渲染区起始切片索引 (Start Index)
 * 算法：向下滚动的高度 / 单项高度，再减去缓冲条数 buffer。
 * Math.max(0, ...) 用于防止向下越界。
 */
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer)
})

/**
 * C. 渲染区结束切片索引 (End Index)
 * 算法：起始索引 + 视口所能容纳的最大行数 + 缓冲条数 buffer。
 * Math.min(..., total) 用于防止向上越界。
 */
const endIndex = computed(() => {
  const visibleCount = Math.ceil(viewportHeight / itemHeight)
  return Math.min(filteredLogs.value.length, startIndex.value + visibleCount + 2 * buffer)
})

/**
 * D. 真实 DOM 挂载数据切片 (Visible Items)
 * 从 10 万条内存数据中，用原生高效的 slice() 截取出仅 20~30 条数据。
 * 无论数据池扩增到多大，参与 DOM 渲染渲染的节点数永远恒定不变，达成 O(1) 渲染性能。
 */
const visibleItems = computed(() => {
  return filteredLogs.value.slice(startIndex.value, endIndex.value)
})

/**
 * E. 容器纵向偏移平移量 (Translate Y Offset)
 * 原理：因为随着向下滚动，真实的 DOM 节点会跟着被推离视口外。
 * 我们需要使用 CSS 属性 `transform: translate3d(0, offsetY, 0)` 将列表渲染容器
 * 重新往下平移拉回到可视区内。拉回的距离正好是：起始项索引 * 单项高度。
 */
const offsetY = computed(() => {
  return startIndex.value * itemHeight
})

// 传统渲染模式下切片，强制截断前 3000 条，保护浏览器不挂起卡死
const traditionalItems = computed(() => {
  return filteredLogs.value.slice(0, 3000)
})

// 依据级别生成 element 标签配色样式
const getLogLevelTagType = (level: 'INFO' | 'WARN' | 'ERROR') => {
  if (level === 'INFO') return 'success'
  if (level === 'WARN') return 'warning'
  return 'danger'
}

// 滚速检测器 (Velocity Tracker)
const scrollVelocity = ref(0)
let lastScrollTop = 0
let lastScrollTime = Date.now()

// 高频滚动监听回调
const onViewportScroll = (e: Event) => {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop

  // 滚速计算公式：两帧之间的位移差 / 时间差
  const now = Date.now()
  const currentScrollTop = target.scrollTop
  const deltaY = Math.abs(currentScrollTop - lastScrollTop)
  const deltaTime = Math.max(1, now - lastScrollTime)
  
  // 换算为 像素/毫秒 并保留一位小数
  scrollVelocity.value = Math.round((deltaY / deltaTime) * 10) / 10

  lastScrollTop = currentScrollTop
  lastScrollTime = now
}

// 模式切换联动
const handleModeChange = (val: any) => {
  scrollTop.value = 0
  if (viewportRef.value) {
    viewportRef.value.scrollTop = 0
  }
  if (!val) {
    ElMessage.warning('切换至传统列表模式，数据展示将截断至 3,000 条以免崩溃。')
  } else {
    ElMessage.success('成功切换至高性能虚拟滚动模式！')
  }
}


// Reset speed tracker when idle
let speedResetInterval: any = null

onMounted(() => {
  generateLogs()
  
  speedResetInterval = setInterval(() => {
    scrollVelocity.value = 0
  }, 300)
})

onUnmounted(() => {
  if (speedResetInterval) clearInterval(speedResetInterval)
})

const virtualScrollFormulaCode = `<template>
  <div class="viewport" @scroll="onScroll" :style="{ height: viewportHeight }">
    <!-- 占位垫高器 -->
    <div :style="{ height: totalPhantomHeight }"></div>
    
    <!-- 真实移动渲染列表 -->
    <div :style="{ transform: 'translate3d(0,' + offsetY + 'px, 0)' }">
      <div v-for="item in visibleItems" :key="item.id" :style="{ height: itemHeight }">
        {{ item.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
const itemHeight = 36
const buffer = 5

// 依靠 scrollTop 动态求解渲染切片
const startIndex = computed(() => Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer))
const endIndex = computed(() => Math.min(totalCount, startIndex.value + Math.ceil(viewportHeight / itemHeight) + buffer))
const visibleItems = computed(() => dataList.value.slice(startIndex.value, endIndex.value))
const offsetY = computed(() => startIndex.value * itemHeight)
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.advanced-demo-container {
  padding-bottom: 24px;
}

.control-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(4px);
}

.performance-hud {
  background-color: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

// Viewport container (Virtual)
.virtual-viewport-container {
  position: relative;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: #0b0f19; // Term style dark log background
  @include custom-scrollbar;
  
  .virtual-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
  }
  
  .virtual-list-content {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    will-change: transform;
  }
}

// Traditional view container
.traditional-viewport-container {
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: #0b0f19;
  @include custom-scrollbar;
  
  .scroll-wrapper {
    height: 100%;
    overflow-y: auto;
  }
  
  .traditional-warning {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
}

// Single Log row template
.log-item {
  padding: 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  color: #a1a1aa;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
    color: #ffffff;
  }
  
  .log-index {
    color: #4f4f5a;
    width: 60px;
    flex-shrink: 0;
  }
  
  .log-time {
    color: #60a5fa;
    width: 70px;
    flex-shrink: 0;
  }
  
  .log-message {
    flex: 1;
    color: #e4e4e7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.formula-box {
  border-left: 4px solid $primary-color;
  line-height: 1.6;
}

.info-card {
  .card-header {
    font-weight: 600;
  }
  
  ul {
    padding-left: 18px;
    margin: 8px 0 0 0;
    line-height: 1.5;
    
    li {
      margin-bottom: 8px;
    }
  }
}

.mx-2 {
  margin-left: 8px;
  margin-right: 8px;
}
.ml-2 {
  margin-left: 8px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.py-20 {
  padding-top: 80px;
  padding-bottom: 80px;
}
.p-3 {
  padding: 12px;
}
.p-4 {
  padding: 16px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.flex {
  display: flex;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.font-mono {
  font-family: 'Fira Code', monospace;
}
.text-sm {
  font-size: 0.85rem;
}
.text-xs {
  font-size: 0.75rem;
}
.text-secondary {
  color: var(--text-secondary);
}
.text-primary {
  color: $primary-color;
}
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
