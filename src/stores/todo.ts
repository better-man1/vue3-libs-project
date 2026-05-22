import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

/**
 * 待办事项的数据类型契约 (Type Interface)
 */
export interface TodoItem {
  id: string        // 唯一标识符
  text: string      // 待办事项内容
  completed: boolean // 是否已完成
  createdAt: string // 创建时间字符串
}

/**
 * 使用 Pinia Setup API 定义的 Todo 状态仓库 (Setup Store)
 * 这种模式下：
 * - ref() 代表 State 状态
 * - computed() 代表 Getters 派生计算属性
 * - function() 代表 Actions 行为函数
 */
export const useTodoStore = defineStore('todo', () => {
  // 1. 初始化 State 状态
  // 优先从浏览器的本地缓存 (localStorage) 中解析出以往的待办数据，如果不存在则赋予空数组
  const todos = ref<TodoItem[]>(
    JSON.parse(localStorage.getItem('pinia_todos') || '[]')
  )

  // 2. 深度监听器 (Watcher)
  // 当 todos 内部的任何项发生增删、或是某一项的 completed 属性变化时，
  // deep: true 会深度扫描，并将最新数据序列化为 JSON 字符串写入 LocalStorage 中实现持久化
  watch(
    todos,
    (newTodos) => {
      localStorage.setItem('pinia_todos', JSON.stringify(newTodos))
    },
    { deep: true }
  )

  // 3. 派生 Getters (使用 computed 计算属性，具有高效的缓存机制)
  // 获取所有“未完成”的待办项列表
  const activeTodos = computed(() => todos.value.filter(t => !t.completed))
  // 获取所有“已完成”的待办项列表
  const completedTodos = computed(() => todos.value.filter(t => t.completed))
  
  // 总待办数量
  const totalCount = computed(() => todos.value.length)
  // 已完成待办数量
  const completedCount = computed(() => completedTodos.value.length)
  // 计算完成比例（防抖保护：如果没有任何待办项，则比例直接返回 0%）
  const completionRate = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((completedCount.value / totalCount.value) * 100)
  })

  // 4. Actions (用于修改状态的普通业务方法)
  // 新增一条待办记录
  const addTodo = (text: string) => {
    if (!text.trim()) return // 防空过滤
    // 使用 unshift 挂载到列表最前端，保证新鲜度
    todos.value.unshift({
      id: Math.random().toString(36).substring(2, 9), // 采用 36 进制随机生成一串 7 位字符的伪 ID
      text,
      completed: false, // 默认未完成
      createdAt: new Date().toLocaleString() // 设置当前格式化时间
    })
  }

  // 切换指定 ID 待办项的完成状态
  const toggleTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  // 根据 ID 删除特定待办项
  const removeTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  // 一键清除所有已完成的待办项 (批量物理删除)
  const clearCompleted = () => {
    todos.value = todos.value.filter(t => !t.completed)
  }

  // 5. 导出公共 API
  // 必须将要在外部（Vue组件中）用到的状态、计算属性及方法导出，否则在组件中无法访问
  return {
    todos,
    activeTodos,
    completedTodos,
    totalCount,
    completedCount,
    completionRate,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted
  }
})

