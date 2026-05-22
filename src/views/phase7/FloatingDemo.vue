<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>计算与空间</el-breadcrumb-item>
      <el-breadcrumb-item>Floating UI 精准定位</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Floating UI — 轻量级高精度浮层定位引擎与右键虚拟菜单</h2>
      <p>学习使用 Floating UI (原 Popper.js) 编写自定义 Tooltip、下拉菜单与气泡弹出窗。演示视口边缘防溢出自动翻转 (Flip)、智能平移 (Shift) 以及通过虚拟锚点渲染极速响应的自定义右键上下文菜单。</p>
    </div>

    <el-row :gutter="20" class="mb-4">
      <!-- Feature Workspace -->
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="浮动定位与交互视差空间"
          description="点击或悬停下方参考元素，浮层会自动依附。右键点击下方整个灰黑区域可以唤起精确的虚拟上下文菜单。"
          :code="floatingExampleCode"
        >
          <!-- Tooltip placement interactive panel -->
          <div class="flex items-center gap-3 mb-4">
            <span class="font-bold text-xs">📐 改变附着方向 (Placement):</span>
            <el-select v-model="selectedPlacement" size="small" style="width: 140px;" @change="updateTooltipPosition">
              <el-option label="上方对齐 (top)" value="top" />
              <el-option label="下方对齐 (bottom)" value="bottom" />
              <el-option label="左侧对齐 (left)" value="left" />
              <el-option label="右侧对齐 (right)" value="right" />
              <el-option label="右上偏角 (top-end)" value="top-end" />
              <el-option label="左下偏角 (bottom-start)" value="bottom-start" />
            </el-select>
          </div>

          <!-- Sandbox Area -->
          <div 
            class="sandbox-container mb-4" 
            ref="sandboxRef"
            @contextmenu.prevent="showContextMenu"
          >
            <!-- Reference Element -->
            <button 
              ref="referenceRef" 
              class="anchor-btn cursor-pointer"
              @mouseenter="openTooltip"
              @mouseleave="closeTooltip"
            >
              🎯 悬停我弹出浮窗 (Hover Me)
            </button>

            <!-- Floating Tooltip Box -->
            <div 
              ref="floatingRef" 
              class="custom-tooltip-box" 
              :style="{ display: isTooltipVisible ? 'block' : 'none' }"
            >
              <strong>定位指示器</strong>
              <div class="text-xxs text-secondary mt-1">当前采用 {{ selectedPlacement }} 排列方式。支持自动检测边缘翻转。</div>
              <div ref="arrowRef" class="tooltip-arrow"></div>
            </div>

            <!-- Hint overlay inside sandbox -->
            <div class="sandbox-tip text-xxs text-secondary">
              🖱️ 在本沙箱区域内点击鼠标右键，体验基于虚拟 DOM 锚点定位的 ContextMenu 弹出层
            </div>
          </div>

          <!-- Context Menu Floating Element -->
          <div 
            ref="contextMenuRef" 
            class="custom-context-menu"
            :style="{ display: isMenuVisible ? 'block' : 'none' }"
          >
            <ul>
              <li @click="handleMenuAction('refresh')">🔄 刷新数据状态</li>
              <li @click="handleMenuAction('mock')">🧪 触发乐观同步更新</li>
              <li @click="handleMenuAction('clear')">🧹 擦除当前定位时间戳</li>
            </ul>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Info Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="font-bold">🔧 Floating UI 核心中间件</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2"><strong>1. offset(px)</strong><br/>设定浮动元素与目标参考元素之间的物理间距像素值，本实例中默认设置为 <code>8px</code>。</p>
            <p class="mb-2"><strong>2. flip()</strong><br/>自动翻转算法。当指定的 <code>placement</code>（例如上方）空间不足时，自动转为对面方向（下方），保证气泡不被截断。</p>
            <p class="mb-2"><strong>3. shift()</strong><br/>微调偏移。当浮动元素接近边缘时，小幅平移其 X/Y 坐标，防止贴边裁剪露出。</p>
            <p><strong>4. arrow()</strong><br/>高精度箭头偏移计算。会自动配合 <code>shift</code> 的偏移量让小三角精确指向参考元素中心。</p>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <span class="font-bold">🎯 虚拟锚点渲染技巧</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2"><strong>问：右键菜单如何定位？</strong><br/>我们不可能每次在右键点击处都创建一个真实的 DOM 参考节点。Floating UI 完美支持传入一个只含有 <code>getBoundingClientRect()</code> 的<strong>虚拟元素 (Virtual Element)</strong> 对象：</p>
            <pre class="bg-gray p-2 text-xxs rounded font-mono">
const virtualElement = {
  getBoundingClientRect: () => ({
    width: 0, height: 0,
    x: e.clientX, y: e.clientY,
    left: e.clientX, right: e.clientX,
    top: e.clientY, bottom: e.clientY
  })
}</pre>
            <p class="mt-2">只需将它代入 <code>computePosition</code>，即可将气泡完美锚定在鼠标点击的像素点！</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// Import Floating UI elements
import { computePosition, flip, shift, offset, arrow, autoUpdate } from '@floating-ui/dom'
import type { Placement } from '@floating-ui/dom'

// State elements
const selectedPlacement = ref<Placement>('top')
const isTooltipVisible = ref(false)
const isMenuVisible = ref(false)

// DOM Refs
const referenceRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)
const contextMenuRef = ref<HTMLElement | null>(null)
const sandboxRef = ref<HTMLElement | null>(null)

// Cleanup hooks
let tooltipCleanup: (() => void) | null = null

// Initialize Tooltip Auto Update
const openTooltip = () => {
  isTooltipVisible.value = true
  nextTick(() => {
    setupTooltipTracking()
  })
}

const closeTooltip = () => {
  isTooltipVisible.value = false
  if (tooltipCleanup) {
    tooltipCleanup()
    tooltipCleanup = null
  }
}

// Position calculating
const setupTooltipTracking = () => {
  if (!referenceRef.value || !floatingRef.value || !arrowRef.value) return

  // Release previous watcher if exists
  if (tooltipCleanup) tooltipCleanup()

  // Track position reactively on scroll and resize
  tooltipCleanup = autoUpdate(referenceRef.value, floatingRef.value, () => {
    if (!referenceRef.value || !floatingRef.value || !arrowRef.value) return
    
    computePosition(referenceRef.value, floatingRef.value, {
      placement: selectedPlacement.value,
      middleware: [
        offset(8),
        flip(),
        shift({ padding: 10 }),
        arrow({ element: arrowRef.value })
      ]
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(floatingRef.value!.style, {
        left: `${x}px`,
        top: `${y}px`
      })

      // Arrow alignment math
      if (middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right'
        }[placement.split('-')[0]] as string

        Object.assign(arrowRef.value!.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide]: '-4px' // align flush with bubble border
        })
      }
    })
  })
}

// Reactive update when dropdown placement changes
const updateTooltipPosition = () => {
  if (isTooltipVisible.value) {
    nextTick(() => {
      setupTooltipTracking()
    })
  }
}

// ─── Custom Context Menu using Virtual Element ─────────────────────────
const showContextMenu = (e: MouseEvent) => {
  if (!contextMenuRef.value || !sandboxRef.value) return

  isMenuVisible.value = true

  // Define virtual element bounding properties
  const virtualEl = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: e.clientX,
        y: e.clientY,
        top: e.clientY,
        left: e.clientX,
        right: e.clientX,
        bottom: e.clientY
      }
    }
  }

  nextTick(() => {
    computePosition(virtualEl, contextMenuRef.value!, {
      placement: 'bottom-start',
      middleware: [
        offset({ mainAxis: 4, crossAxis: 2 }),
        flip(),
        shift({ padding: 10 })
      ]
    }).then(({ x, y }) => {
      Object.assign(contextMenuRef.value!.style, {
        left: `${x}px`,
        top: `${y}px`
      })
    })
  })
}

// Global click to close Context Menu
const closeContextMenu = () => {
  isMenuVisible.value = false
}

// Menu choices actions
const handleMenuAction = (action: string) => {
  isMenuVisible.value = false
  if (action === 'refresh') {
    ElMessage.success('已刷新虚拟上下文菜单定位')
  } else if (action === 'mock') {
    ElMessage.info('触发乐观图层更新完成')
  } else {
    ElMessage.warning('重置位置偏移量成功')
  }
}

onMounted(() => {
  window.addEventListener('click', closeContextMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeContextMenu)
  if (tooltipCleanup) tooltipCleanup()
})

// Example Code
const floatingExampleCode = `<script setup>
import { ref, onMounted } from 'vue'
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom'

const refButton = ref(null)
const floatingBox = ref(null)
const arrowEl = ref(null)

const calculate = () => {
  computePosition(refButton.value, floatingBox.value, {
    placement: 'top',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 10 }),
      arrow({ element: arrowEl.value })
    ]
  }).then(({ x, y, placement, middlewareData }) => {
    Object.assign(floatingBox.value.style, {
      left: \`\${x}px\`,
      top: \`\${y}px\`
    })
  })
}
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

/* Sandbox block */
.sandbox-container {
  height: 280px;
  background: #1e1e2e;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .sandbox-tip {
    position: absolute;
    bottom: 12px;
    color: rgba(255,255,255,0.4);
  }
}

/* Custom Anchor Button */
.anchor-btn {
  background: linear-gradient(135deg, $primary-color 0%, #4f46e5 100%);
  border: none;
  padding: 10px 18px;
  color: #ffffff;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.82rem;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.95);
  }
}

/* Floating custom tooltip style */
.custom-tooltip-box {
  position: absolute;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.75rem;
  width: 220px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  pointer-events: none;
}

/* Arrow indicator element */
.tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--bg-color-secondary);
  transform: rotate(45deg);
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  z-index: -1;
}

/* Floating custom Context Menu */
.custom-context-menu {
  position: absolute;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.18);
  padding: 6px 0;
  width: 160px;
  z-index: 2000;
  
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    
    li {
      padding: 8px 14px;
      font-size: 0.75rem;
      cursor: pointer;
      color: var(--text-primary);
      transition: background 0.2s;
      
      &:hover {
        background: rgba(99, 102, 241, 0.1);
        color: $primary-color;
      }
    }
  }
}

.bg-gray {
  background: rgba(0,0,0,0.04);
}

.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
.cursor-pointer { cursor: pointer; }
</style>
