<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>移动与交互</el-breadcrumb-item>
      <el-breadcrumb-item>@vueuse/motion 动画</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>@vueuse/motion — 声明式手势与物理运动动画</h2>
      <p>体验基于 Motion One (Web Animations API) 开发的 Vue 3 动画库。直接通过模板指令实现手势拖拽、触控缩放、滚动触发以及弹性物理效果。</p>
    </div>

    <!-- Entrance & Micro Interactions -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="声明式微动效与手势拖拽"
          description="通过 v-motion 绑定的初始状态 (initial)、进场状态 (enter)、悬停 (hovered) 以及点击按压 (tapped) 动效。"
          :code="motionDirectivesCode"
        >
          <div class="flex justify-between items-center mb-4">
            <span class="font-bold">✨ 微交互与手势反馈</span>
            <el-button size="small" type="primary" plain @click="replayEntrance">🔁 重新播放入场动画</el-button>
          </div>

          <el-row :gutter="20" class="mb-4">
            <!-- Box 1: Hover & Tap -->
            <el-col :xs="24" :sm="8">
              <div
                v-if="renderKey"
                v-motion
                :initial="{ opacity: 0, scale: 0.7, y: 50 }"
                :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 15 } }"
                :hovered="{ scale: 1.05, y: -8, boxShadow: '0px 10px 20px rgba(99, 102, 241, 0.2)' }"
                :tapped="{ scale: 0.95 }"
                class="motion-box hover-box cursor-pointer"
              >
                <div class="emoji">🖱️</div>
                <h4>悬停与点击</h4>
                <p>鼠标移入上浮，点击微缩。纯指令驱动无需事件监听。</p>
              </div>
            </el-col>

            <!-- Box 2: Spring Bounce -->
            <el-col :xs="24" :sm="8">
              <div
                v-if="renderKey"
                v-motion
                :initial="{ opacity: 0, x: -100, rotate: -30 }"
                :enter="{ opacity: 1, x: 0, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 10 } }"
                class="motion-box spring-box"
              >
                <div class="emoji">💫</div>
                <h4>弹性回弹 (Spring)</h4>
                <p>配置极低阻尼 (damping: 10) 实现物理果冻反弹运动。</p>
              </div>
            </el-col>

            <!-- Box 3: Smooth Scroll Trigger -->
            <el-col :xs="24" :sm="8">
              <div
                v-motion
                :initial="{ opacity: 0, y: 80 }"
                :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
                class="motion-box visible-box"
              >
                <div class="emoji">👁️</div>
                <h4>进入视口触发</h4>
                <p>仅在滑动滚动到当前可视区域时触发一次动画入场。</p>
              </div>
            </el-col>
          </el-row>

          <!-- Interactive Drag Area -->
          <span class="font-bold block mb-2">⚽ 物理阻力手势拖动 (Drag & Constraints)</span>
          <div ref="dragArea" class="drag-boundary-container">
            <span class="text-xs text-secondary boundary-label">拖动限制区域 (Boundary)</span>
            
            <div
              v-motion
              :initial="{ x: 0, y: 0 }"
              :hovered="{ scale: 1.1 }"
              :drag="true"
              :drag-constraints="dragArea"
              :drag-elastic="0.4"
              class="drag-football cursor-grab active:cursor-grabbing"
              @dragstart="isDragging = true"
              @dragend="isDragging = false"
            >
              <div class="football-inner">🏃🏼</div>
            </div>
            
            <div class="drag-indicator text-xs text-secondary font-mono">
              状态: {{ isDragging ? '🟢 正在被物理拖拽' : '💤 处于静止/回弹' }}
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Info Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="font-bold">🎭 错落有致的 Stagger 队列</span>
          </template>
          
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-secondary">自动计算交错延迟进场：</span>
            <el-button size="small" link type="primary" @click="refreshList">重新加载队列</el-button>
          </div>

          <div class="stagger-list flex flex-col gap-2">
            <div
              v-for="(item, index) in listItems"
              :key="item.id + '-' + listKey"
              v-motion
              :initial="{ opacity: 0, x: 30 }"
              :enter="{ opacity: 1, x: 0, transition: { delay: index * 100, type: 'spring', damping: 12 } }"
              class="stagger-item flex items-center gap-3"
            >
              <div class="stagger-badge" :style="{ background: item.color }">{{ index + 1 }}</div>
              <div class="stagger-text">
                <div class="title font-bold text-xs">{{ item.title }}</div>
                <div class="desc text-secondary">{{ item.time }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <span class="font-bold">💡 动效引擎对比</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <table class="comparison-table w-full text-left">
              <thead>
                <tr>
                  <th>维度</th>
                  <th>GSAP</th>
                  <th>@vueuse/motion</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>原理</strong></td>
                  <td>JS 补间逐帧渲染</td>
                  <td>Web Animations API (GPU)</td>
                </tr>
                <tr>
                  <td><strong>声明方式</strong></td>
                  <td>编程式 (Timeline)</td>
                  <td>指令式 (v-motion)</td>
                </tr>
                <tr>
                  <td><strong>手势支持</strong></td>
                  <td>需 DragPlugin/手写</td>
                  <td>原生内置 <code>drag</code></td>
                </tr>
                <tr>
                  <td><strong>体积</strong></td>
                  <td>较大 (约 60kB)</td>
                  <td>极小 (约 15kB)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'

// Drag element state
const dragArea = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// Reset state key to reload entrance anims
const renderKey = ref(true)
const replayEntrance = () => {
  renderKey.value = false
  setTimeout(() => {
    renderKey.value = true
  }, 10)
}

// Stagger List configuration
const listKey = ref(0)
const listItems = ref([
  { id: 1, title: '用户注册接口 Schema 校验通过', time: '刚刚', color: '#10b981' },
  { id: 2, title: '中国主要城市 GDP 地图数据加载成功', time: '1分钟前', color: '#6366f1' },
  { id: 3, title: '服务端状态已进行乐观更新同步', time: '3分钟前', color: '#f43f5e' },
  { id: 4, title: 'Vitest 单元用例 7/7 断言全部通过', time: '5分钟前', color: '#eab308' },
  { id: 5, title: 'Markdown 编辑器导出 Shiki 高亮 HTML', time: '10分钟前', color: '#a855f7' }
])

const refreshList = () => {
  listKey.value++
}

// Code string for DemoCard
const motionDirectivesCode = `<template>
  <!-- 1. 悬停与点击按压微交互 -->
  <div
    v-motion
    :initial="{ opacity: 0, scale: 0.7, y: 50 }"
    :enter="{ opacity: 1, scale: 1, y: 0 }"
    :hovered="{ scale: 1.05, y: -8 }"
    :tapped="{ scale: 0.95 }"
  >
    微交互卡片
  </div>

  <!-- 2. 手势拖放限制 -->
  <div ref="dragArea" class="drag-boundary">
    <div
      v-motion
      :initial="{ x: 0, y: 0 }"
      :drag="true"
      :drag-constraints="dragArea"
      :drag-elastic="0.4"
      class="ball"
    />
  </div>

  <!-- 3. 滚动入场 (Visible Once) -->
  <div
    v-motion
    :initial="{ opacity: 0, y: 80 }"
    :visibleOnce="{ opacity: 1, y: 0 }"
  >
    滚动到此显示
  </div>
</template>

<script setup>
import { ref } from 'vue'
const dragArea = ref(null)
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.motion-box {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
  
  .emoji {
    font-size: 2.2rem;
    margin-bottom: 10px;
  }
  
  h4 {
    font-size: 0.9rem;
    font-weight: 700;
    margin: 0 0 6px 0;
    color: var(--text-primary);
  }
  
  p {
    font-size: 0.75rem;
    margin: 0;
    line-height: 1.5;
    color: var(--text-secondary);
  }
}

.drag-boundary-container {
  height: 220px;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  position: relative;
  background: rgba(0,0,0,0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .boundary-label {
    position: absolute;
    top: 10px;
    left: 12px;
  }
  
  .drag-indicator {
    position: absolute;
    bottom: 10px;
    right: 12px;
  }
}

.drag-football {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color 0%, #4f46e5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  touch-action: none;
  z-index: 10;
  
  .football-inner {
    font-size: 1.8rem;
    user-select: none;
  }
}

/* Stagger List */
.stagger-item {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.3s;
  
  .stagger-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 700;
  }
  
  .stagger-text {
    flex: 1;
    .desc {
      font-size: 0.7rem;
      margin-top: 2px;
    }
  }
}

.comparison-table {
  border-collapse: collapse;
  
  th, td {
    padding: 8px 6px;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.75rem;
  }
  th {
    font-weight: bold;
    color: var(--text-primary);
  }
  td {
    color: var(--text-secondary);
  }
}

.cursor-pointer { cursor: pointer; }
.cursor-grab { cursor: grab; }
.cursor-grabbing { cursor: grabbing; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.block { display: block; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
</style>
