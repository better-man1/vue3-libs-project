<template>
  <div class="vue-flow-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>专业场景集成</el-breadcrumb-item>
      <el-breadcrumb-item>VueFlow 流程图编辑器</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>VueFlow 可视化流程图编辑器</h2>
      <p>
        Vue Flow 是一个高度可定制的 Vue 3 流程图组件，常用于构建工作流编辑器、可视化低代码平台、
        逻辑规则配置器和拓扑图。它支持拖拽交互、自定义节点/连线、缩放平移以及丰富的控制面板扩展。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Node Palette Panel (Left) -->
      <el-col :lg="6" :md="24">
        <el-card class="palette-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🟢 节点传送面板</span>
            </div>
          </template>
          <div class="palette-desc">
            请长按下方节点类型并<strong>拖拽</strong>到右侧画布中：
          </div>
          <div class="palette-nodes">
            <div
              v-for="node in paletteNodes"
              :key="node.type"
              class="palette-node"
              :class="node.type"
              draggable="true"
              @dragstart="onDragStart($event, node)"
            >
              <span class="node-icon">{{ node.icon }}</span>
              <span class="node-label">{{ node.label }}</span>
            </div>
          </div>

          <div class="palette-tips">
            <h5>💡 连线操作</h5>
            <p>从一个节点的右侧/底部圆点拖拽虚线，连接到另一个节点的左侧/顶部圆点即可建立逻辑关联。</p>
          </div>
        </el-card>
      </el-col>

      <!-- Flow Canvas Area (Right) -->
      <el-col :lg="18" :md="24">
        <DemoCard
          title="可视化工作流设计区"
          description="支持拖拽添加新节点、点击选中删除、连线动画以及缩放适配。底端提供数据导入导出服务。"
          :code="demoCode"
        >
          <div class="flow-container">
            <div class="flow-canvas-wrapper" @drop="onDrop" @dragover="onDragOver">
              <VueFlow
                v-model:nodes="nodes"
                v-model:edges="edges"
                :default-edge-options="{ animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }"
                :fit-view-on-init="true"
                class="playground-flow"
              >
                <!-- Background grid -->
                <Background pattern-color="#aaa" :gap="16" />
                
                <!-- Helper Controls -->
                <Controls position="top-right" />
                
                <!-- MiniMap -->
                <MiniMap />
              </VueFlow>
            </div>

            <!-- Flow Actions -->
            <div class="flow-actions-bar">
              <div class="info">
                <span>节点数: <el-tag size="small">{{ nodes.length }}</el-tag></span>
                <span class="ml-2">连线数: <el-tag size="small" type="warning">{{ edges.length }}</el-tag></span>
              </div>
              <div class="buttons">
                <el-button type="primary" plain @click="exportJSON">
                  📤 导出 JSON
                </el-button>
                <el-button type="success" plain @click="loadExample">
                  📥 重置为示例
                </el-button>
                <el-button type="danger" plain @click="clearCanvas">
                  🗑️ 清空画布
                </el-button>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'
import { ElMessage } from 'element-plus'
import { VueFlow } from '@vue-flow/core'
// @ts-ignore
import { Background } from '@vue-flow/background'
// @ts-ignore
import { Controls } from '@vue-flow/controls'
// @ts-ignore
import { MiniMap } from '@vue-flow/minimap'

// Styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'


// ─── Initial Data Setup ───────────────────────────────────────────────────────
const initialNodes = [
  { id: '1', type: 'input', label: '🟢 开始：用户触发注册', position: { x: 250, y: 30 }, style: { background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '10px' } },
  { id: '2', type: 'default', label: '📝 提交注册信息表单', position: { x: 250, y: 130 }, style: { background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px' } },
  { id: '3', type: 'default', label: '❓ 校验邮箱格式是否正确', position: { x: 230, y: 230 }, style: { background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px' } },
  { id: '4', type: 'default', label: '📧 发送确认激活邮件', position: { x: 80, y: 340 }, style: { background: '#f5f3ff', border: '1px solid #8b5cf6', borderRadius: '8px', padding: '10px' } },
  { id: '5', type: 'default', label: '❌ 提示格式错误并拦截', position: { x: 420, y: 340 }, style: { background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px' } },
  { id: '6', type: 'default', label: '💾 写入用户数据库', position: { x: 80, y: 450 }, style: { background: '#f0fdfa', border: '1px solid #14b8a6', borderRadius: '8px', padding: '10px' } },
  { id: '7', type: 'output', label: '🏁 结束：注册激活流程完成', position: { x: 80, y: 550 }, style: { background: '#f8fafc', border: '1px solid #64748b', borderRadius: '8px', padding: '10px' } }
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', label: '合法', labelStyle: { fill: '#8b5cf6', fontWeight: 700 } },
  { id: 'e3-5', source: '3', target: '5', label: '非法', labelStyle: { fill: '#ef4444', fontWeight: 700 } },
  { id: 'e4-6', source: '4', target: '6', animated: true },
  { id: 'e6-7', source: '6', target: '7', animated: true }
]

const nodes = ref(initialNodes)
const edges = ref(initialEdges)

// ─── Drag and Drop Nodes Palette ──────────────────────────────────────────────
interface PaletteNode {
  type: string
  label: string
  icon: string
  bg: string
  border: string
}

const paletteNodes = ref<PaletteNode[]>([
  { type: 'input', label: '开始节点', icon: '🟢', bg: '#ecfdf5', border: '#10b981' },
  { type: 'process', label: '数据处理', icon: '⚡', bg: '#eff6ff', border: '#3b82f6' },
  { type: 'condition', label: '条件分支', icon: '❓', bg: '#fffbeb', border: '#f59e0b' },
  { type: 'email', label: '发送通知', icon: '📧', bg: '#f5f3ff', border: '#8b5cf6' },
  { type: 'database', label: '写入库表', icon: '💾', bg: '#f0fdfa', border: '#14b8a6' },
  { type: 'output', label: '结束归档', icon: '🏁', bg: '#f8fafc', border: '#64748b' }
])

const onDragStart = (event: DragEvent, node: PaletteNode) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow-type', node.type)
    event.dataTransfer.setData('application/vueflow-label', node.label)
    event.dataTransfer.setData('application/vueflow-bg', node.bg)
    event.dataTransfer.setData('application/vueflow-border', node.border)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const type = event.dataTransfer?.getData('application/vueflow-type') || 'default'
  const label = event.dataTransfer?.getData('application/vueflow-label') || '新建节点'
  const bg = event.dataTransfer?.getData('application/vueflow-bg') || '#ffffff'
  const border = event.dataTransfer?.getData('application/vueflow-border') || '#6366f1'

  // Position detection
  const canvasElement = document.querySelector('.flow-canvas-wrapper')
  if (!canvasElement) return
  const bounds = canvasElement.getBoundingClientRect()
  const x = event.clientX - bounds.left - 75
  const y = event.clientY - bounds.top - 20

  const newNode = {
    id: `node-${Date.now()}`,
    type: type === 'input' || type === 'output' ? type : 'default',
    label,
    position: { x, y },
    style: {
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      padding: '10px'
    }
  }

  nodes.value.push(newNode)
  ElMessage.success(`添加了新节点: ${label}`)
}

// ─── Actions ──────────────────────────────────────────────────────────────────
const exportJSON = () => {
  const data = {
    nodes: nodes.value,
    edges: edges.value
  }
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `workflow-${Date.now()}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
  ElMessage.success('工作流配置 JSON 导出成功！')
}

const loadExample = () => {
  nodes.value = JSON.parse(JSON.stringify(initialNodes))
  edges.value = JSON.parse(JSON.stringify(initialEdges))
  ElMessage.success('画布已重置为系统示例流程')
}

const clearCanvas = () => {
  nodes.value = []
  edges.value = []
  ElMessage.warning('画布已清空，请自行拖拽节点重新设计')
}

const demoCode = `<template>
  <div class="flow-canvas-wrapper" @drop="onDrop" @dragover="onDragOver">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-edge-options="{ animated: true }"
    >
      <Background pattern-color="#aaa" :gap="16" />
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

// 引入依赖样式文件
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const nodes = ref([
  { id: '1', type: 'input', label: '开始', position: { x: 100, y: 100 } }
])
const edges = ref([])
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.vue-flow-demo {
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

.palette-card {
  border-radius: 12px;
  margin-bottom: 20px;

  .palette-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .palette-nodes {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .palette-node {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 8px;
    cursor: grab;
    user-select: none;
    font-size: 0.88rem;
    font-weight: 500;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px dashed transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.06);
    }
    &:active {
      cursor: grabbing;
    }

    &.input {
      background-color: #ecfdf5;
      border-color: #10b981;
      color: #065f46;
    }
    &.process {
      background-color: #eff6ff;
      border-color: #3b82f6;
      color: #1e40af;
    }
    &.condition {
      background-color: #fffbeb;
      border-color: #f59e0b;
      color: #92400e;
    }
    &.email {
      background-color: #f5f3ff;
      border-color: #8b5cf6;
      color: #5b21b6;
    }
    &.database {
      background-color: #f0fdfa;
      border-color: #14b8a6;
      color: #0f766e;
    }
    &.output {
      background-color: #f8fafc;
      border-color: #64748b;
      color: #334155;
    }
  }

  .palette-tips {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px dashed var(--border-color);

    h5 {
      margin: 0 0 8px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  }
}

.flow-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flow-canvas-wrapper {
  height: 600px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-color-secondary);
  position: relative;

  .playground-flow {
    width: 100%;
    height: 100%;
  }
}

.flow-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-color-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 12px;

  .info {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.info-card {
  border-radius: 12px;
  height: 100%;
}

.ml-2 {
  margin-left: 8px;
}
</style>
