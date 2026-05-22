<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工程进阶</el-breadcrumb-item>
      <el-breadcrumb-item>Vitest 单元测试</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Vitest + Vue Test Utils — 单元测试与结果可视化</h2>
      <p>体验极速的 Vite 原生测试框架 Vitest。在主线程之外，为业务逻辑 (Pinia Store) 和 UI 组件编写高质量单元测试。</p>
    </div>

    <!-- Overview Statistics -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <span class="stat-label">测试套件 (Suites)</span>
            <span class="stat-value">2</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <span class="stat-label">测试用例总数 (Tests)</span>
            <span class="stat-value">7</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <span class="stat-label">代码覆盖率 (Coverage)</span>
            <span class="stat-value green">92.4%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Main Workspace -->
    <el-row :gutter="20">
      <!-- Left side: Interactive Runner Simulator -->
      <el-col :xs="24" :lg="13">
        <DemoCard
          title="Interactive Test Runner 模拟运行器"
          description="点击「运行测试」按钮模拟 Vitest 监听热更新及断言执行的过程。"
          :code="vitestConfigCode"
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-2">
              <el-button
                type="primary"
                :loading="isRunning"
                @click="runMockTests"
              >
                {{ isRunning ? '测试执行中...' : '▶️ 运行单元测试' }}
              </el-button>
              <el-tag v-if="testResult" :type="testResult.success ? 'success' : 'danger'">
                {{ testResult.text }}
              </el-tag>
            </div>
            <span class="text-xs text-secondary">环境: jsdom | 引擎: Vitest 4.1.7</span>
          </div>

          <!-- Interactive Test Suite Progress -->
          <div class="test-suites-container">
            <!-- Suite 1: Counter Store -->
            <div class="suite-box mb-4" :class="{ 'active': isRunning }">
              <div class="suite-header flex justify-between items-center">
                <span class="suite-name font-bold">📄 src/__tests__/counter.spec.ts</span>
                <el-icon v-if="suite1Status === 'pending'" class="is-loading"><Loading /></el-icon>
                <el-tag v-else-if="suite1Status === 'success'" size="small" type="success">✓ PASS</el-tag>
                <span v-else class="text-xs text-secondary">等待运行</span>
              </div>
              <div class="suite-tests mt-2 pl-4">
                <div v-for="test in suite1Tests" :key="test.name" class="test-item flex items-center justify-between py-1 text-xs">
                  <span class="flex items-center gap-2">
                    <span :class="getTestStatusClass(test.status)">{{ test.status === 'success' ? '✓' : test.status === 'pending' ? '⏳' : '○' }}</span>
                    <span :class="{ 'line-through-dim': test.status === 'idle' }">{{ test.name }}</span>
                  </span>
                  <span class="font-mono text-secondary">{{ test.duration }}</span>
                </div>
              </div>
            </div>

            <!-- Suite 2: DemoCard Component -->
            <div class="suite-box" :class="{ 'active': isRunning }">
              <div class="suite-header flex justify-between items-center">
                <span class="suite-name font-bold">📄 src/__tests__/DemoCard.spec.ts</span>
                <el-icon v-if="suite2Status === 'pending'" class="is-loading"><Loading /></el-icon>
                <el-tag v-else-if="suite2Status === 'success'" size="small" type="success">✓ PASS</el-tag>
                <span v-else class="text-xs text-secondary">等待运行</span>
              </div>
              <div class="suite-tests mt-2 pl-4">
                <div v-for="test in suite2Tests" :key="test.name" class="test-item flex items-center justify-between py-1 text-xs">
                  <span class="flex items-center gap-2">
                    <span :class="getTestStatusClass(test.status)">{{ test.status === 'success' ? '✓' : test.status === 'pending' ? '⏳' : '○' }}</span>
                    <span :class="{ 'line-through-dim': test.status === 'idle' }">{{ test.name }}</span>
                  </span>
                  <span class="font-mono text-secondary">{{ test.duration }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Virtual Terminal Console -->
          <div class="terminal-console mt-4">
            <div class="terminal-header">Terminal Console Output</div>
            <pre class="terminal-body"><code>{{ terminalOutput }}</code></pre>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Source Code Viewers -->
      <el-col :xs="24" :lg="11">
        <el-card shadow="hover" class="code-viewer-card">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">🔍 真实测试代码展示</span>
              <el-radio-group v-model="activeCodeTab" size="small">
                <el-radio-button value="counter">Counter Store 测试</el-radio-button>
                <el-radio-button value="democard">DemoCard 组件测试</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div class="code-box">
            <pre v-if="activeCodeTab === 'counter'" class="code-block"><code>{{ counterSpecCode }}</code></pre>
            <pre v-else class="code-block"><code>{{ demoCardSpecCode }}</code></pre>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <span class="font-bold">💡 单元测试的核心原则</span>
          </template>
          <div class="text-sm text-secondary">
            <div class="principle-item mb-3">
              <strong class="text-primary block mb-1">1. AAA 模式 (Arrange, Act, Assert)</strong>
              <p class="m-0">测试编写的核心步骤：准备测试数据与环境（Arrange）➡️ 执行目标操作（Act）➡️ 验证结果是否符合预期（Assert）。</p>
            </div>
            <div class="principle-item mb-3">
              <strong class="text-primary block mb-1">2. 业务与 UI 隔离测试</strong>
              <p class="m-0">优先为 Pinia Store 或工具函数编写测试，这类纯 JS/TS 逻辑测试速度快、回报率极高。对于复杂 UI 组件使用 <code>@vue/test-utils</code> 挂载交互测试。</p>
            </div>
            <div class="principle-item">
              <strong class="text-primary block mb-1">3. 快照测试与行为测试</strong>
              <p class="m-0">快照测试验证 HTML 结构的稳定性；行为测试验证用户交互（如点击、输入）后的响应式 DOM 变化。</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import DemoCard from '@/components/common/DemoCard.vue'

// ─── Interactive Runner Simulator State ──────────────────────────────
const isRunning = ref(false)
const testResult = ref<{ success: boolean; text: string } | null>(null)
const terminalOutput = ref('Click "运行单元测试" to start...')
const activeCodeTab = ref<'counter' | 'democard'>('counter')

const suite1Status = ref<'idle' | 'pending' | 'success'>('idle')
const suite2Status = ref<'idle' | 'pending' | 'success'>('idle')

const suite1Tests = ref([
  { name: 'initial state should be 0', status: 'idle', duration: '' },
  { name: 'increments the count', status: 'idle', duration: '' },
  { name: 'decrements the count', status: 'idle', duration: '' },
  { name: 'resets the count', status: 'idle', duration: '' },
  { name: 'increments asynchronously', status: 'idle', duration: '' }
])

const suite2Tests = ref([
  { name: 'renders title and description when passed', status: 'idle', duration: '' },
  { name: 'toggles code preview visibility when click on show code button', status: 'idle', duration: '' }
])

const getTestStatusClass = (status: string) => {
  if (status === 'success') return 'test-status success'
  if (status === 'pending') return 'test-status pending'
  return 'test-status idle'
}

const runMockTests = async () => {
  if (isRunning.value) return

  isRunning.value = true
  testResult.value = null
  terminalOutput.value = '> vitest run\n\n RUN  v4.1.7 D:/Projects/ClaudeCodeProject/FrontendStudy/vue3-libs-playground\n'
  
  // Reset test items
  suite1Status.value = 'pending'
  suite2Status.value = 'idle'
  suite1Tests.value.forEach(t => { t.status = 'idle'; t.duration = '' })
  suite2Tests.value.forEach(t => { t.status = 'idle'; t.duration = '' })

  // Simulate Suite 1: Counter Store
  await new Promise(r => setTimeout(r, 600))
  terminalOutput.value += '\n ❯ src/__tests__/counter.spec.ts (running...)'
  
  for (let i = 0; i < suite1Tests.value.length; i++) {
    suite1Tests.value[i].status = 'pending'
    await new Promise(r => setTimeout(r, i === 4 ? 300 : 150)) // Async test takes longer
    suite1Tests.value[i].status = 'success'
    suite1Tests.value[i].duration = i === 4 ? '1013ms' : '4ms'
  }
  suite1Status.value = 'success'
  terminalOutput.value += '\n ✓ src/__tests__/counter.spec.ts (5 tests) 1029ms'

  // Simulate Suite 2: DemoCard Component
  suite2Status.value = 'pending'
  await new Promise(r => setTimeout(r, 400))
  terminalOutput.value += '\n ❯ src/__tests__/DemoCard.spec.ts (running...)'
  
  for (let i = 0; i < suite2Tests.value.length; i++) {
    suite2Tests.value[i].status = 'pending'
    await new Promise(r => setTimeout(r, 200))
    suite2Tests.value[i].status = 'success'
    suite2Tests.value[i].duration = i === 1 ? '45ms' : '12ms'
  }
  suite2Status.value = 'success'
  terminalOutput.value += '\n ✓ src/__tests__/DemoCard.spec.ts (2 tests) 57ms'

  // Done
  await new Promise(r => setTimeout(r, 300))
  isRunning.value = false
  testResult.value = { success: true, text: '✓ 7/7 Tests Passed' }
  terminalOutput.value += `\n\n Test Files  2 passed (2)
      Tests  7 passed (7)
   Start at  ${new Date().toLocaleTimeString()}
   Duration  2.41s

✓ Test run completed successfully!`
}

// ─── Code Snippets ───────────────────────────────────────────────────
const vitestConfigCode = `// vitest.config.ts
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      server: {
        deps: {
          inline: ['element-plus']
        }
      }
    }
  })
)`

const counterSpecCode = `// src/__tests__/counter.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia()) // 初始化 Pinia 干净实例
  })

  it('initial state should be 0', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
    expect(store.doubleCount).toBe(0)
  })

  it('increments the count', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
  })

  it('increments asynchronously', async () => {
    const store = useCounterStore()
    const promise = store.incrementAsync()
    expect(store.count).toBe(0) // 此时还未自增
    await promise               // 等待异步定时器完成
    expect(store.count).toBe(1)
  })
})`

const demoCardSpecCode = `// src/__tests__/DemoCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DemoCard from '@/components/common/DemoCard.vue'

describe('DemoCard.vue', () => {
  it('renders title and description when passed', () => {
    const title = '测试卡片'
    const description = '这是描述'
    const wrapper = mount(DemoCard, {
      props: { title, description },
      global: {
        stubs: { ElCard: true, ElButton: true, ElIcon: true }
      }
    })
    expect(wrapper.text()).toContain(title)
    expect(wrapper.text()).toContain(description)
  })

  it('toggles code preview when button clicked', async () => {
    const code = 'const a = 123;'
    const wrapper = mount(DemoCard, {
      props: { title: '测试', code },
      global: {
        stubs: {
          ElCard: true,
          ElIcon: true,
          ElButton: {
            template: '<button @click="$emit(\\'click\\')"><slot /></button>'
          }
        }
      }
    })
    expect(wrapper.find('.code-preview-section').exists()).toBe(false)
    await wrapper.find('.code-toggle-btn').trigger('click')
    expect(wrapper.find('.code-preview-section').exists()).toBe(true)
  })
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.stat-card {
  .stat-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
    
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-primary);
      &.green { color: #10b981; }
    }
  }
}

.test-suites-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suite-box {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  transition: all 0.3s;
  
  &.active {
    border-color: rgba(99, 102, 241, 0.4);
  }
  
  .suite-header {
    .suite-name {
      font-size: 0.88rem;
      color: var(--text-primary);
    }
  }
}

.test-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  &:last-child { border-bottom: none; }
  
  .test-status {
    font-weight: bold;
    display: inline-block;
    width: 14px;
    text-align: center;
    
    &.success { color: #10b981; }
    &.pending { color: #f59e0b; }
    &.idle { color: var(--text-secondary); }
  }
  
  .line-through-dim {
    color: var(--text-secondary);
    opacity: 0.7;
  }
}

.terminal-console {
  background: #0b0f19;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  
  .terminal-header {
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.72rem;
    padding: 6px 12px;
    font-family: monospace;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .terminal-body {
    margin: 0;
    padding: 12px;
    
    code {
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.78rem;
      color: #38bdf8;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }
}

.code-viewer-card {
  :deep(.el-card__header) { padding: 10px 16px; }
  
  .code-box {
    .code-block {
      background: var(--bg-color-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      margin: 0;
      height: 380px;
      overflow-y: auto;
      @include custom-scrollbar;
      
      code {
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 0.78rem;
        color: var(--text-secondary);
        line-height: 1.6;
      }
    }
  }
}

.principle-item {
  .block { font-weight: 600; }
  p { line-height: 1.5; color: var(--text-secondary); }
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.pl-4 { padding-left: 16px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.m-0 { margin: 0; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.85rem; }
.text-secondary { color: var(--text-secondary); }
.text-primary { color: $primary-color; }
.block { display: block; }
.mb-1 { margin-bottom: 4px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
</style>
