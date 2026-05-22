<template>
  <div class="advanced-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>高级功能</el-breadcrumb-item>
      <el-breadcrumb-item>拖拽排序看板</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>SortableJS 交互式拖拽排序看板</h2>
      <p>学习如何使用 SortableJS 实现跨容器拖放。我们构建了一个敏捷看板，包含“待处理”、“开发中”和“已完成”三列，支持卡片在列内排序及跨列流转，并实时同步 Vue 状态。</p>
    </div>

    <el-row :gutter="20">
      <!-- Left Column: Kanban Board Workspace -->
      <el-col :xs="24" :lg="18">
        <DemoCard
          title="敏捷任务看板 (Kanban Board)"
          description="按住卡片并随意拖动。支持跨栏目分配以及垂直方向调整重要性排序。"
          :code="sortableJsCode"
        >
          <div class="kanban-container flex gap-4">
            <!-- Loop through columns -->
            <div 
              v-for="col in columns" 
              :key="col.id" 
              class="kanban-column flex-col flex-1"
            >
              <div class="column-header flex justify-between items-center mb-3">
                <div class="flex items-center">
                  <span class="column-badge" :style="{ backgroundColor: col.color }"></span>
                  <span class="column-title font-bold">{{ col.title }}</span>
                  <span class="task-count ml-2">{{ col.tasks.length }}</span>
                </div>
                <el-button type="primary" link size="small" @click="addTask(col.id)">➕</el-button>
              </div>

              <!-- Draggable Card List Container -->
              <div 
                :ref="(el) => setListRef(el, col.id)"
                :data-column-id="col.id"
                class="task-list-container flex-1"
              >
                <!-- Task Card -->
                <div 
                  v-for="task in col.tasks" 
                  :key="task.id" 
                  :data-task-id="task.id"
                  class="task-card p-3 mb-2"
                >
                  <div class="card-tag flex justify-between items-center mb-2">
                    <el-tag :type="getTagType(task.priority)" size="small">
                      {{ task.priority }}
                    </el-tag>
                    <span class="task-id text-xs font-mono">#{{ task.id }}</span>
                  </div>
                  <h4 class="task-title font-bold mb-1">{{ task.title }}</h4>
                  <p class="task-desc text-xs text-secondary mb-3">{{ task.desc }}</p>
                  
                  <div class="card-footer flex justify-between items-center">
                    <span class="assignee flex items-center gap-1">
                      <span class="avatar-emoji">👤</span>
                      <span class="name text-xs text-secondary">{{ task.assignee }}</span>
                    </span>
                    <el-button type="danger" link size="small" @click="deleteTask(col.id, task.id)">
                      删除
                    </el-button>
                  </div>
                </div>

                <!-- Empty list placeholder -->
                <div v-if="col.tasks.length === 0" class="empty-list-placeholder text-center text-xs py-8">
                  📥 拖拽任务卡片到此
                </div>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right Column: Info and Control -->
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span class="font-bold">🖥️ 实时响应式状态</span>
            </div>
          </template>
          <div class="state-monitor-viewport">
            <pre class="state-json"><code>{{ stateJson }}</code></pre>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <div class="card-header">
              <span class="font-bold">💡 排序与数据同步</span>
            </div>
          </template>
          <div class="card-content text-sm text-secondary">
            <ul>
              <li><strong>SortableJS 核心参数</strong>：配置 <code>group: 'shared'</code> 可开启多容器自由流转拖放，配置 <code>animation: 180</code> 可提供物理阻尼般的滑动特效。</li>
              <li><strong>状态丢失预防</strong>：必须在拖放结束 <code>onEnd</code> 钩子内，根据拖出和拖入的 DOM 元素自定义属性 <code>data-column-id</code> 进行数据数组的 <code>splice</code> 同步，保持真实数据与渲染一致。</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Sortable from 'sortablejs'
import DemoCard from '@/components/common/DemoCard.vue'

// Define Columns and Tasks
interface Task {
  id: string
  title: string
  desc: string
  priority: 'High' | 'Medium' | 'Low'
  assignee: string
}

interface Column {
  id: string
  title: string
  color: string
  tasks: Task[]
}

const columns = ref<Column[]>([
  {
    id: 'todo',
    title: '待处理 (To Do)',
    color: '#3b82f6',
    tasks: [
      { id: '101', title: '搭建 Pinia 购物车核心模块', desc: '实现并发商品数扣减与深层状态修改', priority: 'High', assignee: '张明' },
      { id: '102', title: '编写 ECharts 数据渐变折线图', desc: '使用 linear gradient 配置性能大屏折线图面积填充', priority: 'Medium', assignee: '李红' },
      { id: '103', title: '配置 Axios 拦截器与请求防抖', desc: '利用 AbortController 重构取消重复网络连接', priority: 'Low', assignee: '王刚' }
    ]
  },
  {
    id: 'progress',
    title: '开发中 (In Progress)',
    color: '#f59e0b',
    tasks: [
      { id: '201', title: '升级 Anime.js v4 描边动画', desc: '结合 svg.createDrawable 接口重写手写文字动画', priority: 'High', assignee: '赵玲' },
      { id: '202', title: '集成 cesium 地球宏观场景', desc: '引入 cesium 地标热力分布与相机平滑环绕', priority: 'Medium', assignee: '李红' }
    ]
  },
  {
    id: 'done',
    title: '已完成 (Done)',
    color: '#10b981',
    tasks: [
      { id: '301', title: '集成 Element Plus 核心库', desc: '配置 Scss 亮暗色变量，注入秒级换肤逻辑', priority: 'Low', assignee: '架构师' }
    ]
  }
])

// References to List Elements
const listRefs = ref<Record<string, HTMLElement>>({})

const setListRef = (el: any, key: string) => {
  if (el) {
    listRefs.value[key] = el
  }
}

// Watch state in real-time
const stateJson = computed(() => {
  return JSON.stringify(
    columns.value.map(col => ({
      id: col.id,
      count: col.tasks.length,
      tasks: col.tasks.map(t => ({ id: t.id, title: t.title }))
    })),
    null,
    2
  )
})

// Priority Tag color matcher
const getTagType = (priority: 'High' | 'Medium' | 'Low') => {
  if (priority === 'High') return 'danger'
  if (priority === 'Medium') return 'warning'
  return 'info'
}

// Add task mock
const addTask = (columnId: string) => {
  ElMessageBox.prompt('请输入任务名称:', '新建任务', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '任务名称不能为空'
  }).then(({ value }) => {
    const col = columns.value.find(c => c.id === columnId)
    if (col) {
      col.tasks.unshift({
        id: String(Math.floor(100 + Math.random() * 900)),
        title: value,
        desc: '双击或在侧边栏编辑以修改任务详情文案。',
        priority: 'Medium',
        assignee: '未分配'
      })
      ElMessage.success('成功新建任务卡片！')
    }
  }).catch(() => {})
}

// Delete task
const deleteTask = (columnId: string, taskId: string) => {
  const col = columns.value.find(c => c.id === columnId)
  if (col) {
    col.tasks = col.tasks.filter(t => t.id !== taskId)
    ElMessage.warning('卡片已被移除。')
  }
}

// Storage of sortable instances to destroy later
const sortableInstances: Sortable[] = []

onMounted(() => {
  // Initialize SortableJS on each column container
  Object.keys(listRefs.value).forEach(columnId => {
    const el = listRefs.value[columnId]
    if (!el) return

    const sortable = new Sortable(el, {
      group: 'shared-kanban', // Allows dragging between columns
      animation: 180, // Drag transition animation speed
      ghostClass: 'task-card-ghost', // Styling class of the dragged ghost element
      dragClass: 'task-card-drag',
      onEnd: (evt) => {
        // Source column index info
        const fromColId = evt.from.getAttribute('data-column-id')!
        const toColId = evt.to.getAttribute('data-column-id')!
        
        const oldIndex = evt.oldIndex!
        const newIndex = evt.newIndex!

        // Find the source and target columns in Vue array
        const fromCol = columns.value.find(c => c.id === fromColId)!
        const toCol = columns.value.find(c => c.id === toColId)!

        // Remove item from source array
        const [movedTask] = fromCol.tasks.splice(oldIndex, 1)
        
        // Insert item into target array
        toCol.tasks.splice(newIndex, 0, movedTask)

        // Force reactively notify layout refresh
        columns.value = [...columns.value]
        ElMessage.success(`任务 #${movedTask.id} 流转成功: ${fromCol.title} ➔ ${toCol.title}`)
      }
    })
    
    sortableInstances.push(sortable)
  })
})

onBeforeUnmount(() => {
  sortableInstances.forEach(instance => instance.destroy())
})

const sortableJsCode = `// SortableJS 跨栏目拖拽与响应式同步
import Sortable from 'sortablejs'

const initDragDrop = (containerElement) => {
  new Sortable(containerElement, {
    group: 'shared-kanban', // 共享分组实现跨容器
    animation: 180,         // 物理阻尼动画毫秒数
    onEnd: (evt) => {
      const fromId = evt.from.dataset.columnId
      const toId = evt.to.dataset.columnId
      
      // 提取被拖动的数组元素并转移
      const [item] = list[fromId].splice(evt.oldIndex, 1)
      list[toId].splice(evt.newIndex, 0, item)
    }
  })
}`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.advanced-demo-container {
  padding-bottom: 24px;
}

.kanban-container {
  overflow-x: auto;
  align-items: stretch;
  min-height: 480px;
}

.kanban-column {
  background-color: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
  min-width: 250px;
  display: flex;
  flex-direction: column;

  .column-badge {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
  }
  
  .column-title {
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .task-count {
    background-color: var(--bg-color-primary);
    color: var(--text-secondary);
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
  }
}

.task-list-container {
  min-height: 400px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

// Drag & drop Card style
.task-card {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: $primary-color;
  }

  &:active {
    cursor: grabbing;
  }
  
  .task-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.88rem;
  }
  
  .task-desc {
    color: var(--text-secondary);
    line-height: 1.4;
  }
  
  .task-id {
    color: var(--text-secondary);
  }
}

// Ghost card style (while dragging)
.task-card-ghost {
  opacity: 0.4;
  border: 2px dashed $primary-color !important;
  background-color: rgba(99, 102, 241, 0.05) !important;
  box-shadow: none !important;
}

.task-card-drag {
  transform: rotate(2deg);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
}

.empty-list-placeholder {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
}

.info-card {
  .card-header {
    font-weight: 600;
  }
}

.state-monitor-viewport {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px;
  height: 200px;
  overflow-y: auto;
  
  .state-json {
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.78rem;
    color: var(--text-secondary);
  }
}

.info-card {
  ul {
    padding-left: 18px;
    margin: 8px 0 0 0;
    line-height: 1.5;
    
    li {
      margin-bottom: 8px;
    }
  }
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-1 { gap: 4px; }
.gap-4 { gap: 16px; }
.ml-2 { margin-left: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.p-3 { padding: 12px; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.font-mono { font-family: 'Fira Code', monospace; }
</style>
