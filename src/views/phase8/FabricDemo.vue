<template>
  <div class="fabric-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实用工具扩展</el-breadcrumb-item>
      <el-breadcrumb-item>Fabric.js 在线画板</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>Fabric.js 交互式 Canvas 画板</h2>
      <p>
        Fabric.js 是一个强大且简单的 HTML5 Canvas 上层库。它提供了一个互动式的对象模型，
        使你能够轻松地在画布上创建、操纵、旋转和缩放各种图形对象（如矩形、圆形、线条、文本和自定义图像）。
        广泛应用于在线白板、图片编辑器、海报生成器等专业场景。
      </p>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <DemoCard
          title="在线交互式画板"
          description="点击工具栏选择画笔、几何图形或文字，在下方画布上直接拖拽绘制。支持对象选择、拖拽、缩放、撤销清空与导出。"
          :code="demoCode"
        >
          <div class="canvas-playground">
            <!-- Toolbar -->
            <div class="board-toolbar">
              <el-button-group class="tool-group">
                <el-button
                  :type="currentTool === 'select' ? 'primary' : 'default'"
                  @click="changeTool('select')"
                  title="选择与编辑"
                >
                  🖱️ 选择
                </el-button>
                <el-button
                  :type="currentTool === 'pen' ? 'primary' : 'default'"
                  @click="changeTool('pen')"
                  title="自由画笔"
                >
                  🖊️ 画笔
                </el-button>
                <el-button
                  :type="currentTool === 'rect' ? 'primary' : 'default'"
                  @click="changeTool('rect')"
                  title="绘制矩形"
                >
                  ⬛ 矩形
                </el-button>
                <el-button
                  :type="currentTool === 'circle' ? 'primary' : 'default'"
                  @click="changeTool('circle')"
                  title="绘制圆形"
                >
                  ⭕ 圆形
                </el-button>
                <el-button
                  :type="currentTool === 'line' ? 'primary' : 'default'"
                  @click="changeTool('line')"
                  title="绘制直线"
                >
                  ╱ 直线
                </el-button>
              </el-button-group>

              <el-button type="success" plain @click="addText" class="ml-2">
                ✍️ 添加文本
              </el-button>

              <div class="divider" />

              <!-- Style controls -->
              <div class="toolbar-item">
                <span class="label">线条颜色:</span>
                <el-color-picker v-model="strokeColor" size="default" @change="updateBrush" />
              </div>

              <div class="toolbar-item">
                <span class="label">粗细:</span>
                <el-slider
                  v-model="strokeWidth"
                  :min="1"
                  :max="20"
                  style="width: 100px"
                  @input="updateBrush"
                />
              </div>

              <div class="toolbar-item">
                <el-checkbox v-model="fillEnabled">填充</el-checkbox>
                <el-color-picker
                  v-model="fillColor"
                  size="default"
                  :disabled="!fillEnabled"
                  class="ml-1"
                />
              </div>

              <div class="divider" />

              <!-- Operations -->
              <el-button-group>
                <el-button @click="undo" :disabled="historyIndex <= 0" title="撤销">
                  ↩️ 撤销
                </el-button>
                <el-button @click="redo" :disabled="historyIndex >= history.length - 1" title="重做">
                  ↪️ 重做
                </el-button>
                <el-button type="danger" plain @click="clearAll">
                  🗑️ 清空
                </el-button>
              </el-button-group>

              <el-button type="primary" @click="exportPNG" class="ml-2">
                💾 导出图片
              </el-button>
            </div>

            <!-- Canvas Wrapper -->
            <div class="canvas-wrapper">
              <canvas ref="canvasRef" width="900" height="460" />
            </div>

            <!-- Status bar -->
            <div class="board-status">
              <span>当前模式: <strong>{{ toolText }}</strong></span>
              <span>画布对象数: <strong>{{ objectCount }}</strong></span>
              <span class="tip">提示: 选中元素按 <code>Delete</code> 键可删除。双击文本框可编辑内容。</span>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Explanation Cards -->
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :md="12" :sm="24">
            <el-card class="info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>💡 Fabric.js 技术解析</span>
                </div>
              </template>
              <div class="card-body">
                <p>
                  传统的 Canvas 只是一个位图画布，一旦画上去就无法追踪和修改。而 <strong>Fabric.js</strong> 
                  将 Canvas 对象化，它会在内部维护一个对象列表，并接管交互事件。
                </p>
                <ul>
                  <li><strong>交互式对象：</strong>每个在 Canvas 上添加的图形，都可以被自动选中、缩放、移动和旋转，而不需要开发者编写复杂的坐标碰撞检测算法。</li>
                  <li><strong>自由绘图系统：</strong>通过设置 <code>isDrawingMode = true</code> 并指定 <code>freeDrawingBrush</code> 即可开启细腻流畅的手写画笔。</li>
                  <li><strong>序列化与反序列化：</strong>支持通过 <code>toJSON()</code> 将整个画布状态序列化为 JSON 字符串保存到数据库中，并通过 <code>loadFromJSON()</code> 重新渲染还原。</li>
                </ul>
              </div>
            </el-card>
          </el-col>

          <el-col :md="12" :sm="24">
            <el-card class="info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>🛠️ 本示例功能实现逻辑</span>
                </div>
              </template>
              <div class="card-body">
                <ul>
                  <li><strong>手写/图形切换：</strong>在 <code>pen</code> 模式下，开启 Fabric.js 原生的 <code>isDrawingMode</code>。而在矩形、圆形、直线等模式下，通过监听 Canvas 上的鼠标按下、移动和抬起事件，动态生成并修改对应的图形宽高属性。</li>
                  <li><strong>历史记录撤销 (Undo/Redo)：</strong>我们在画布的 <code>object:added</code>、<code>object:modified</code> 和 <code>object:removed</code> 事件中，把 Canvas 的 JSON 快照推入历史队列中，以实现高保真的撤销/重做。</li>
                  <li><strong>键盘删除操作：</strong>全局绑定了 <code>keydown</code> 事件，当检测到 <code>Delete</code> 或 <code>Backspace</code> 键被触发，且画布上有处于激活态的对象时，调用 <code>canvas.remove()</code> 将其移除。</li>
                </ul>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'
import { ElMessage } from 'element-plus'
import { Canvas, Rect, Circle, Line, Textbox, PencilBrush, type FabricObject } from 'fabric'

// ─── State ───────────────────────────────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null)
let canvas: Canvas | null = null

const currentTool = ref<'select' | 'pen' | 'rect' | 'circle' | 'line'>('select')
const strokeColor = ref('#6366f1')
const strokeWidth = ref(3)
const fillEnabled = ref(false)
const fillColor = ref('#c7d2fe')
const objectCount = ref(0)

// History queue for Undo/Redo
const history = ref<string[]>([])
const historyIndex = ref(-1)
let isUpdatingHistory = false

const toolText = computed(() => {
  switch (currentTool.value) {
    case 'pen': return '🖊️ 自由画笔'
    case 'rect': return '⬛ 绘制矩形'
    case 'circle': return '⭕ 绘制圆形'
    case 'line': return '╱ 绘制直线'
    case 'select':
    default: return '🖱️ 选择与编辑'
  }
})

// ─── Drawing States ───────────────────────────────────────────────────────────
let isDrawingShape = false
let startPoint = { x: 0, y: 0 }
let tempShape: Rect | Circle | Line | null = null

// ─── Initialize ───────────────────────────────────────────────────────────────
const initCanvas = () => {
  if (!canvasRef.value) return

  canvas = new Canvas(canvasRef.value, {
    backgroundColor: '#ffffff',
    selection: true,
  })

  // Event listners
  canvas.on('object:added', () => {
    updateCount()
    saveHistoryState()
  })
  canvas.on('object:modified', () => {
    saveHistoryState()
  })
  canvas.on('object:removed', () => {
    updateCount()
    saveHistoryState()
  })

  // Setup initial brush
  updateBrush()

  // Setup drawing events for custom shapes
  setupDrawingEvents()

  // Save initial state
  saveHistoryState()
  
  window.addEventListener('keydown', handleKeyDown)
}

const updateCount = () => {
  if (canvas) {
    objectCount.value = canvas.getObjects().length
  }
}

// ─── Custom Shape Drawing Setup ────────────────────────────────────────────────
const setupDrawingEvents = () => {
  if (!canvas) return

  canvas.on('mouse:down', (options) => {
    if (currentTool.value === 'select' || currentTool.value === 'pen' || !canvas) return
    
    isDrawingShape = true
    const pointer = canvas.getScenePoint(options.e)
    startPoint = { x: pointer.x, y: pointer.y }

    const stroke = strokeColor.value
    const width = strokeWidth.value
    const fill = fillEnabled.value ? fillColor.value : 'transparent'

    if (currentTool.value === 'rect') {
      tempShape = new Rect({
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
        stroke,
        strokeWidth: width,
        fill,
        selectable: false,
      })
      canvas.add(tempShape)
    } else if (currentTool.value === 'circle') {
      tempShape = new Circle({
        left: startPoint.x,
        top: startPoint.y,
        radius: 0,
        stroke,
        strokeWidth: width,
        fill,
        selectable: false,
      })
      canvas.add(tempShape)
    } else if (currentTool.value === 'line') {
      tempShape = new Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
        stroke,
        strokeWidth: width,
        selectable: false,
      })
      canvas.add(tempShape)
    }
    
    canvas.setActiveObject(tempShape as FabricObject)
    canvas.renderAll()
  })

  canvas.on('mouse:move', (options) => {
    if (!isDrawingShape || !tempShape || !canvas) return
    
    const pointer = canvas.getScenePoint(options.e)
    const dx = pointer.x - startPoint.x
    const dy = pointer.y - startPoint.y

    if (currentTool.value === 'rect') {
      tempShape.set({
        left: dx < 0 ? pointer.x : startPoint.x,
        top: dy < 0 ? pointer.y : startPoint.y,
        width: Math.abs(dx),
        height: Math.abs(dy),
      })
    } else if (currentTool.value === 'circle') {
      const radius = Math.sqrt(dx * dx + dy * dy) / 2
      tempShape.set({
        left: dx < 0 ? pointer.x : startPoint.x,
        top: dy < 0 ? pointer.y : startPoint.y,
        radius,
      })
    } else if (currentTool.value === 'line') {
      ;(tempShape as Line).set({
        x2: pointer.x,
        y2: pointer.y,
      })
    }

    canvas.renderAll()
  })

  canvas.on('mouse:up', () => {
    if (!isDrawingShape || !tempShape) return
    isDrawingShape = false
    
    tempShape.set({ selectable: true })
    tempShape.setCoords()
    
    tempShape = null
    
    // Auto switch to select tool after drawing shape
    changeTool('select')
  })
}

// ─── Toolbar Commands ────────────────────────────────────────────────────────
const changeTool = (tool: typeof currentTool.value) => {
  currentTool.value = tool
  if (!canvas) return

  // Disable free drawing mode by default
  canvas.isDrawingMode = false
  canvas.selection = false

  if (tool === 'select') {
    canvas.selection = true
    // Enable selection for all objects
    canvas.forEachObject((obj) => {
      obj.selectable = true
    })
  } else if (tool === 'pen') {
    canvas.isDrawingMode = true
    updateBrush()
  } else {
    // Disable selectability while drawing shapes
    canvas.forEachObject((obj) => {
      obj.selectable = false
    })
  }
}

const updateBrush = () => {
  if (!canvas) return
  if (canvas.isDrawingMode) {
    const brush = new PencilBrush(canvas)
    brush.color = strokeColor.value
    brush.width = strokeWidth.value
    canvas.freeDrawingBrush = brush
  }
}

const addText = () => {
  if (!canvas) return
  
  changeTool('select')
  const text = new Textbox('双击我修改文字', {
    left: 200,
    top: 150,
    width: 250,
    fontSize: 24,
    fill: strokeColor.value,
    fontFamily: 'Outfit, sans-serif',
  })
  
  canvas.add(text)
  canvas.setActiveObject(text)
  canvas.renderAll()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (!canvas) return
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      // If we are editing text, don't delete the object
      const isEditingText = activeObjects.some(obj => (obj as any).isEditing)
      if (isEditingText) return

      activeObjects.forEach((obj) => {
        canvas?.remove(obj)
      })
      canvas.discardActiveObject()
      canvas.renderAll()
      ElMessage.success('已删除选中对象')
    }
  }
}

// ─── History (Undo/Redo) ──────────────────────────────────────────────────────
const saveHistoryState = () => {
  if (!canvas || isUpdatingHistory) return
  
  const jsonStr = JSON.stringify(canvas.toJSON())
  
  // Cut future history if we were in the middle of undo stack
  if (historyIndex.value < history.value.length - 1) {
    history.value.splice(historyIndex.value + 1)
  }
  
  history.value.push(jsonStr)
  
  // Keep max history length
  if (history.value.length > 30) {
    history.value.shift()
  }
  
  historyIndex.value = history.value.length - 1
}

const undo = async () => {
  if (!canvas || historyIndex.value <= 0) return
  
  isUpdatingHistory = true
  historyIndex.value--
  const state = JSON.parse(history.value[historyIndex.value])
  
  await canvas.loadFromJSON(state)
  canvas.renderAll()
  updateCount()
  isUpdatingHistory = false
  ElMessage.info('已撤销')
}

const redo = async () => {
  if (!canvas || historyIndex.value >= history.value.length - 1) return
  
  isUpdatingHistory = true
  historyIndex.value++
  const state = JSON.parse(history.value[historyIndex.value])
  
  await canvas.loadFromJSON(state)
  canvas.renderAll()
  updateCount()
  isUpdatingHistory = false
  ElMessage.info('已重做')
}

const clearAll = () => {
  if (!canvas) return
  canvas.clear()
  canvas.backgroundColor = '#ffffff'
  canvas.renderAll()
  updateCount()
  ElMessage.warning('画板已清空')
}

const exportPNG = () => {
  if (!canvas) return
  
  canvas.discardActiveObject()
  canvas.renderAll()
  
  const dataURL = canvas.toDataURL({
    format: 'png',
    multiplier: 1.5,
  })
  
  const link = document.createElement('a')
  link.download = `whiteboard-${Date.now()}.png`
  link.href = dataURL
  link.click()
  ElMessage.success('画板已导出为图片')
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (canvas) {
    canvas.dispose()
    canvas = null
  }
})

// ─── Static Code Snippet ──────────────────────────────────────────────────────
const demoCode = `import { Canvas, Rect, Circle, Line, Textbox, PencilBrush } from 'fabric'

// 1. 初始化 Canvas
const canvas = new Canvas(canvasRef.value, {
  backgroundColor: '#ffffff',
  selection: true
})

// 2. 添加文本
const text = new Textbox('点击可编辑', {
  left: 100,
  top: 100,
  fontSize: 24,
  fill: '#6366f1'
})
canvas.add(text)

// 3. 开启自由绘图
canvas.isDrawingMode = true
const brush = new PencilBrush(canvas)
brush.color = '#6366f1'
brush.width = 4
canvas.freeDrawingBrush = brush

// 4. 导出为图片
const dataURL = canvas.toDataURL({ format: 'png' })`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.fabric-demo {
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

.canvas-playground {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.board-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--bg-color-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);

  .divider {
    width: 1px;
    height: 24px;
    background-color: var(--border-color);
  }

  .toolbar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--text-secondary);

    .label {
      font-weight: 500;
    }
  }
}

.canvas-wrapper {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: #f1f5f9; // Canvas wrapper has slightly different background
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);

  canvas {
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}

.board-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 6px 12px;
  background: var(--bg-color-secondary);
  border-radius: 6px;
  flex-wrap: wrap;
  gap: 8px;

  strong {
    color: $primary-color;
  }

  .tip {
    font-style: italic;
    color: var(--text-placeholder);
  }
}

.info-card {
  border-radius: 12px;
  margin-bottom: 20px;
  height: 100%;

  .card-body {
    font-size: 0.88rem;
    line-height: 1.8;
    color: var(--text-secondary);

    p {
      margin: 0 0 10px;
    }

    ul {
      margin: 0;
      padding-left: 18px;

      li {
        margin-bottom: 6px;
      }
    }
  }
}

.ml-1 {
  margin-left: 4px;
}
.ml-2 {
  margin-left: 8px;
}
</style>
