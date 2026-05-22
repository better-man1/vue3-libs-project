<template>
  <div class="pinia-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Pinia 状态管理</el-breadcrumb-item>
      <el-breadcrumb-item>Todo 任务清单</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Pinia Todo 任务清单</h2>
      <p>进阶状态管理，结合 `watch` 实现本地存储的持久化数据同步。展示了响应式过滤数据的高级 Getter 写法。</p>
    </div>

    <el-row :gutter="20">
      <!-- Demo panel -->
      <el-col :xs="24" :lg="14">
        <DemoCard 
          title="任务管理清单" 
          description="添加、删除或勾选任务状态，状态直接同步到 LocalStorage 中"
          :code="todoCode"
        >
          <div class="todo-panel">
            <!-- Add Todo Input -->
            <div class="todo-input-row">
              <el-input
                v-model="newTodoText"
                placeholder="想要做点什么？按回车添加..."
                clearable
                @keyup.enter="handleAdd"
              >
                <template #append>
                  <el-button type="primary" @click="handleAdd">
                    <el-icon><Plus /></el-icon>
                    添加
                  </el-button>
                </template>
              </el-input>
            </div>

            <!-- Stats Header -->
            <div class="todo-stats" v-if="todoStore.totalCount > 0">
              <div class="stat-tags">
                <el-tag type="info">总数: {{ todoStore.totalCount }}</el-tag>
                <el-tag type="danger">待办: {{ todoStore.activeTodos.length }}</el-tag>
                <el-tag type="success">已完成: {{ todoStore.completedCount }}</el-tag>
              </div>
              <el-button 
                v-if="todoStore.completedCount > 0"
                type="danger" 
                link 
                size="small"
                @click="todoStore.clearCompleted"
              >
                清除已完成
              </el-button>
            </div>

            <!-- Completion Progress -->
            <div class="progress-section" v-if="todoStore.totalCount > 0">
              <span class="progress-label">完成进度:</span>
              <el-progress 
                :percentage="todoStore.completionRate" 
                :stroke-width="12" 
                status="success"
                striped 
                striped-flow
              />
            </div>

            <!-- Todo Filter Tabs -->
            <div class="filter-row">
              <el-radio-group v-model="currentFilter" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="active">待办</el-radio-button>
                <el-radio-button label="completed">已完成</el-radio-button>
              </el-radio-group>
            </div>

            <!-- Todo List -->
            <div class="todo-list">
              <el-empty 
                v-if="filteredTodos.length === 0" 
                description="暂无对应任务" 
                :image-size="80" 
              />
              <transition-group name="list" tag="div" v-else>
                <div 
                  v-for="todo in filteredTodos" 
                  :key="todo.id" 
                  class="todo-item"
                  :class="{ 'completed': todo.completed }"
                >
                  <el-checkbox 
                    :model-value="todo.completed"
                    @change="todoStore.toggleTodo(todo.id)"
                  >
                    <span class="todo-text">{{ todo.text }}</span>
                  </el-checkbox>
                  
                  <div class="todo-right">
                    <span class="todo-time">{{ todo.createdAt }}</span>
                    <el-button 
                      type="danger" 
                      link
                      @click="todoStore.removeTodo(todo.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Explanation side panel -->
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="explanation-card">
          <template #header>
            <div class="card-header">
              <span>💡 Todo Store 数据流动</span>
            </div>
          </template>
          <div class="explanation-content">
            <h4>1. 数据持久化 (LocalStorage)</h4>
            <p>在 Pinia 中通过 Vue 的 `watch` 监听 store 数据的变化，从而将数据序列化同步至 LocalStorage。初始化时，通过 `getItem` 回填默认值。</p>
            
            <h4>2. 派生状态的选择</h4>
            <p>Getter 可以像计算属性一样组合。例如：</p>
            <ul>
              <li>`activeTodos` = 过滤未完成项</li>
              <li>`completedTodos` = 过滤已完成项</li>
              <li>`completionRate` = 依赖以上计算得到比例</li>
            </ul>

            <h4>3. 组件状态 vs 全局状态</h4>
            <p>组件内部输入框的临时文本 `newTodoText` 属于组件本地状态（Ref），不需要存储在 Pinia 中。只有点击确定后，才存入全局 Store 中。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { Plus, Delete } from '@element-plus/icons-vue'
import DemoCard from '@/components/common/DemoCard.vue'

const todoStore = useTodoStore()
const newTodoText = ref('')
const currentFilter = ref<'all' | 'active' | 'completed'>('all')

const handleAdd = () => {
  if (newTodoText.value.trim()) {
    todoStore.addTodo(newTodoText.value)
    newTodoText.value = ''
  }
}

const filteredTodos = computed(() => {
  if (currentFilter.value === 'active') return todoStore.activeTodos
  if (currentFilter.value === 'completed') return todoStore.completedTodos
  return todoStore.todos
})

const todoCode = `// stores/todo.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<TodoItem[]>(
    JSON.parse(localStorage.getItem('pinia_todos') || '[]')
  )

  // 深度监听并持久化
  watch(
    todos,
    (newTodos) => {
      localStorage.setItem('pinia_todos', JSON.stringify(newTodos))
    },
    { deep: true }
  )

  // Getters
  const activeTodos = computed(() => todos.value.filter(t => !t.completed))
  const completedTodos = computed(() => todos.value.filter(t => t.completed))
  const totalCount = computed(() => todos.value.length)
  const completedCount = computed(() => completedTodos.value.length)
  const completionRate = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((completedCount.value / totalCount.value) * 100)
  })

  // Actions
  const addTodo = (text: string) => {
    todos.value.unshift({
      id: Math.random().toString(36).substring(2, 9),
      text,
      completed: false,
      createdAt: new Date().toLocaleString()
    })
  }
  const toggleTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.completed = !todo.completed
  }
  const removeTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
  }
  const clearCompleted = () => {
    todos.value = todos.value.filter(t => !t.completed)
  }

  return {
    todos, activeTodos, totalCount, completedCount, 
    completionRate, addTodo, toggleTodo, removeTodo, clearCompleted
  }
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.pinia-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.header-desc {
  margin-bottom: 24px;
  h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 6px;
  }
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
}

.todo-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.todo-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .stat-tags {
    display: flex;
    gap: 8px;
  }
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--bg-color-primary);
  padding: 12px 16px;
  border-radius: 8px;
  
  .progress-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
    white-space: nowrap;
  }
  
  .el-progress {
    flex: 1;
  }
}

.todo-list {
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 8px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  @include custom-scrollbar;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-color-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  margin-bottom: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: $primary-light;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  }

  &.completed {
    background-color: rgba(241, 245, 249, 0.5);
    
    .todo-text {
      text-decoration: line-through;
      color: var(--text-secondary);
    }
  }

  .todo-text {
    font-size: 0.95rem;
    color: var(--text-primary);
    transition: color 0.2s;
  }

  .todo-right {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .todo-time {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  }
}

// Fade animations for todo list items
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.explanation-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
  
  .explanation-content {
    h4 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      
      &:not(:first-child) {
        margin-top: 20px;
      }
    }
    
    p, ul {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
    
    ul {
      padding-left: 20px;
      margin-top: 8px;
    }
  }
}

.dark {
  .todo-item.completed {
    background-color: rgba(30, 30, 35, 0.3);
  }
}
</style>
