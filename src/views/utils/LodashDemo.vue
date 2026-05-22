<template>
  <div class="utils-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工具方法实践</el-breadcrumb-item>
      <el-breadcrumb-item>Lodash 实用函数</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Lodash-es 实用工具函数库</h2>
      <p>学习如何使用 Lodash-es 的核心方法。包括在高频交互中必不可少的防抖 (Debounce) 和节流 (Throttle) 优化，以及解决多层级引用类型覆盖的深拷贝 (CloneDeep)。</p>
    </div>

    <el-row :gutter="20">
      <!-- Debounce and Throttle -->
      <el-col :xs="24" :lg="12">
        <el-row :gutter="20">
          <!-- Debounce Card -->
          <el-col :span="24">
            <DemoCard
              title="防抖搜索模拟 (lodash.debounce)"
              description="连续快速敲击键盘输入字符。防抖保证在停止输入 400ms 后才执行搜索回调，从而大幅降低服务器请求负担。"
              :code="debounceCode"
            >
              <div class="demo-viewport">
                <el-input 
                  v-model="debounceInput" 
                  placeholder="在此连续快速打字测试防抖效果..." 
                  @input="handleKeypress"
                />

                <div class="counter-display mt-4">
                  <div class="stat-box">
                    <span class="num text-warning">{{ keypressCount }}</span>
                    <span class="label">键盘输入总次数</span>
                  </div>
                  <div class="stat-box border-l">
                    <span class="num text-success">{{ searchCount }}</span>
                    <span class="label">实际触发 API 搜索次数</span>
                  </div>
                </div>

                <div class="status-indicator mt-3" :class="{ 'active': isTyping }">
                  <span class="dot"></span>
                  <span class="text">{{ isTyping ? '正在录入键盘流... ⏳' : '等待输入...' }}</span>
                </div>
              </div>
            </DemoCard>
          </el-col>

          <!-- Throttle Card -->
          <el-col :span="24" class="mt-4">
            <DemoCard
              title="滚动监听节流 (lodash.throttle)"
              description="滑动下方容器的滚动条。节流强制在滚动中每 200ms 最多执行一次处理，而不是每次滚动都频繁触发。"
              :code="throttleCode"
            >
              <div class="demo-viewport">
                <div class="scroll-container" @scroll="handleScroll">
                  <div class="scroll-content">
                    <p v-for="i in 15" :key="i">滚动测试行 {{ i }} — 向上滑动观察计数器差异</p>
                  </div>
                </div>

                <div class="counter-display mt-4">
                  <div class="stat-box">
                    <span class="num text-danger">{{ rawScrollCount }}</span>
                    <span class="label">浏览器原始 Scroll 触发</span>
                  </div>
                  <div class="stat-box border-l">
                    <span class="num text-success">{{ throttledScrollCount }}</span>
                    <span class="label">节流后实际计算触发</span>
                  </div>
                </div>
              </div>
            </DemoCard>
          </el-col>
        </el-row>
      </el-col>

      <!-- Deep Clone Card -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="深度拷贝与浅拷贝对比 (lodash.cloneDeep)"
          description="修改拷贝出来的副本对象的嵌套属性。观察浅拷贝与深拷贝对原对象（Original Object）的污染差异。"
          :code="cloneDeepCode"
        >
          <div class="clone-sandbox">
            <!-- Source Display -->
            <div class="object-panels">
              <div class="panel">
                <span class="title">源对象 (Original):</span>
                <pre><code>{{ JSON.stringify(sourceObj, null, 2) }}</code></pre>
              </div>

              <div class="panel highlight">
                <span class="title">当前操作副本 (Current Copy):</span>
                <div class="flex items-center gap-2 mb-2">
                  <el-button size="small" type="primary" @click="modifyCopy('shallow')">
                    修改浅拷贝 (Shadow)
                  </el-button>
                  <el-button size="small" type="success" @click="modifyCopy('deep')">
                    修改深拷贝 (Deep)
                  </el-button>
                </div>
                <pre><code>{{ JSON.stringify(copiedObj, null, 2) }}</code></pre>
              </div>
            </div>

            <!-- Explain -->
            <div class="info-block mt-4">
              <h5>🧬 核心原理总结</h5>
              <ul>
                <li><strong>浅拷贝:</strong> 仅复制第一层属性。嵌套属性 `skills` 指向同一个内存地址。修改浅拷贝副本的 `skills.d3` 会直接修改源对象的对应属性！</li>
                <li><strong>深拷贝 (cloneDeep):</strong> 递归复制所有层级。副本和源对象彻底解耦，互不影响。</li>
              </ul>
              <el-button type="info" plain size="small" class="w-full mt-2" @click="resetCloneDemo">
                🔄 还原原始数据状态
              </el-button>
            </div>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { debounce, throttle, cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// 1. Debounce state
const debounceInput = ref('')
const keypressCount = ref(0)
const searchCount = ref(0)
const isTyping = ref(false)

let typingTimer: any = null

// Debounced function: only executes search after 400ms of inactivity
const executeSearch = debounce(() => {
  searchCount.value++
  isTyping.value = false
  ElMessage.success({
    message: `Debounce 触发搜索 API! 搜索词: "${debounceInput.value}"`,
    duration: 1000
  })
}, 400)

const handleKeypress = () => {
  keypressCount.value++
  isTyping.value = true

  // Clear typing timeout logic (just for status UI glow)
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    isTyping.value = false
  }, 400)

  // Call the debounced search function
  executeSearch()
}

// 2. Throttle state
const rawScrollCount = ref(0)
const throttledScrollCount = ref(0)

// Throttled handler: restricts executions to once every 200ms
const executeThrottledScroll = throttle(() => {
  throttledScrollCount.value++
}, 200)

const handleScroll = () => {
  rawScrollCount.value++
  executeThrottledScroll()
}

// 3. Deep Clone state
const initialObject = {
  name: '李华',
  profile: {
    age: 24,
    city: '北京'
  },
  skills: {
    vue: '精通',
    d3: '初学'
  }
}

const sourceObj = ref(cloneDeep(initialObject))
const copiedObj = ref<any>({ ...initialObject }) // Start as simple shallow copy copy

const modifyCopy = (mode: 'shallow' | 'deep') => {
  if (mode === 'shallow') {
    // Perform simple shallow copy
    copiedObj.value = { ...sourceObj.value }
    // Modify a nested property
    copiedObj.value.skills.d3 = '精通 (浅拷贝污染)'
    ElMessage.warning('修改了浅拷贝！观察源对象的 skills.d3 是否同步变化。')
  } else {
    // Perform deep clone using lodash cloneDeep
    copiedObj.value = cloneDeep(sourceObj.value)
    // Modify nested property
    copiedObj.value.skills.d3 = '无污染 (深拷贝安全)'
    ElMessage.success('修改了深拷贝！源对象得到彻底保护，未受任何影响。')
  }
}

const resetCloneDemo = () => {
  sourceObj.value = cloneDeep(initialObject)
  copiedObj.value = { ...initialObject }
  ElMessage.success('对象数据均已还原！')
}

const debounceCode = `// Lodash: debounce 输入防抖优化
import { debounce } from 'lodash-es'

// 创建防抖包装函数。当且仅当停止调用超过 400ms 后才会被触发
const executeSearch = debounce((query) => {
  // 发起 API 请求
  fetchSearchApi(query)
}, 400)

// 绑定在 Input 键盘按键事件中
const handleInput = (val) => {
  executeSearch(val)
}`

const throttleCode = `// Lodash: throttle 高频事件节流优化
import { throttle } from 'lodash-es'

// 创建节流包装函数。在连续滚动或调整大小过程中，每 200ms 最多执行一次
const handleScroll = throttle(() => {
  // 执行复杂的位置/重排计算
  recalculateLayout()
}, 200)

// 挂载到容器滚动监听中
element.addEventListener('scroll', handleScroll)`

const cloneDeepCode = `// Lodash: cloneDeep 深度复制解耦
import { cloneDeep } from 'lodash-es'

const original = { name: 'A', nested: { age: 18 } }

// 1. 浅拷贝：底层只复制第一层属性的引用
const shallow = { ...original }
shallow.nested.age = 20 // 此时 original.nested.age 也变成了 20

// 2. 深拷贝：递归构建全部子级属性
const deep = cloneDeep(original)
deep.nested.age = 30    // 彻底解耦，original 依旧保持原样`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.utils-demo-container {
  padding-bottom: 24px;
}

.demo-viewport {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.counter-display {
  display: flex;
  background-color: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  
  .stat-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 6px;
    
    &.border-l {
      border-left: 1px solid var(--border-color);
    }
    
    .num {
      font-size: 1.8rem;
      font-weight: 800;
      font-family: 'Outfit', sans-serif;
    }
    
    .label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 4px;
      text-align: center;
    }
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  padding-left: 4px;
  
  .dot {
    width: 6px;
    height: 6px;
    background-color: var(--text-secondary);
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  &.active {
    color: var(--text-primary);
    
    .dot {
      background-color: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
      animation: blink 0.8s infinite;
    }
  }
}

.scroll-container {
  width: 100%;
  height: 120px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-color-secondary);
  overflow-y: scroll;
  padding: 10px;
  @include custom-scrollbar;
  
  .scroll-content {
    height: 350px; /* Force overflow */
    
    p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0;
      padding: 6px 0;
      border-bottom: 1px dashed var(--border-color);
    }
  }
}

.clone-sandbox {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.object-panels {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .panel {
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    
    &.highlight {
      border-color: rgba(99, 102, 241, 0.4);
      background-color: rgba(99, 102, 241, 0.02);
    }
    
    .title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    pre {
      margin: 0;
      padding: 8px;
      background-color: var(--bg-color-primary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      overflow-x: auto;
      font-family: 'Courier New', Courier, monospace;
    }
  }
}

.info-block {
  padding: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  
  h5 {
    margin-top: 0;
    margin-bottom: 6px;
    font-size: 0.82rem;
    color: var(--text-primary);
  }
  
  ul {
    margin: 0;
    padding-left: 18px;
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.5;
    
    li {
      margin-bottom: 4px;
    }
  }
}

.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-2 {
  gap: 8px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.w-full {
  width: 100%;
}
.text-warning {
  color: #f59e0b;
}
.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}

@keyframes blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
