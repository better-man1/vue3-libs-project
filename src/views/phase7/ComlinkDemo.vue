<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>计算与空间</el-breadcrumb-item>
      <el-breadcrumb-item>Comlink 多线程计算</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Web Workers & Comlink — 浏览器后台多线程 RPC 计算与防阻塞优化</h2>
      <p>对比传统单线程主进程计算与多线程 Web Worker 计算。在大规模数组排序及数学公式循环计算中，展示主进程卡顿冻结与 Comlink RPC 后台处理的帧率差异。</p>
    </div>

    <el-row :gutter="20" class="mb-4">
      <!-- Benchmark Panel -->
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="多线程计算基准对比测试"
          description="选择计算负载类型，分别点击「主线程计算」和「Worker 线程计算」，并观察右上角运行小齿轮是否停止卡住。"
          :code="comlinkExampleCode"
        >
          <!-- Controls -->
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-2">
              <span class="font-bold text-xs">🛠️ 任务负载类型:</span>
              <el-radio-group v-model="taskType" size="small">
                <el-radio-button value="sort">大数组排序 (1.5M 随机浮点数)</el-radio-button>
                <el-radio-button value="math">数学迭代循环 (25M 正弦累加)</el-radio-button>
              </el-radio-group>
            </div>
            
            <!-- Real-time dynamic CSS spinner showing UI blocking -->
            <div class="spinner-display flex items-center gap-2">
              <span class="text-xs text-secondary font-bold">主线程动画渲染:</span>
              <div class="gear-spinner">⚙️</div>
            </div>
          </div>

          <!-- Benchmark Actions -->
          <el-row :gutter="20" class="mb-4">
            <el-col :span="12">
              <div class="bench-box main-thread-box">
                <h4>🔴 主线程计算 (Blocking)</h4>
                <p class="text-secondary text-xxs my-2">在主线程 (Main Thread) 运行计算，将导致整个页面事件循环 (Event Loop) 暂停，转动的齿轮会卡死，无法做任何滚动或交互。</p>
                <el-button type="danger" :loading="isMainRunning" class="w-full" @click="runOnMainThread">
                  💥 启动主线程阻塞计算
                </el-button>
              </div>
            </el-col>

            <el-col :span="12">
              <div class="bench-box worker-thread-box">
                <h4>🟢 Worker 线程计算 (Non-blocking)</h4>
                <p class="text-secondary text-xxs my-2">通过 Comlink RPC 将任务代理给后台 Web Worker 线程。计算在独立的线程执行，主进程齿轮始终丝滑转动，交互不受影响。</p>
                <el-button type="success" :loading="isWorkerRunning" class="w-full" @click="runOnWorkerThread">
                  🚀 启动 Worker 线程计算
                </el-button>
              </div>
            </el-col>
          </el-row>

          <!-- Result output -->
          <div class="result-panel">
            <div class="font-bold text-xs mb-2">📊 运行结果与耗时对比：</div>
            <div class="result-details font-mono text-xs p-3">
              <div class="flex justify-between border-b pb-2 mb-2">
                <span>运行负载：</span>
                <span class="text-primary">{{ taskType === 'sort' ? '1,500,000 随机数排序' : '25,000,000 次三角函数复合累加' }}</span>
              </div>
              
              <div class="flex justify-between mb-2">
                <span>主线程执行时间：</span>
                <span :class="mainTime ? 'text-danger font-bold' : 'text-secondary'">
                  {{ mainTime ? mainTime + ' ms (转轮发生卡死)' : '等待测试...' }}
                </span>
              </div>

              <div class="flex justify-between">
                <span>Worker 线程执行时间：</span>
                <span :class="workerTime ? 'text-success font-bold' : 'text-secondary'">
                  {{ workerTime ? workerTime + ' ms (转轮丝滑转动)' : '等待测试...' }}
                </span>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Info Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="font-bold">🧬 Comlink 优势与运行机制</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2"><strong>1. RPC 接口代理</strong><br/>传统 Web Worker 需要编写繁琐的 <code>postMessage()</code> 与 <code>onmessage</code> 监听器，数据通信如同黑盒。Comlink 通过 ES6 Proxy 拦截调用，使调用 Worker 就像调用普通异步 Promise 函数一样简单。</p>
            <p class="mb-2"><strong>2. 数据传输瓶颈</strong><br/>Web Worker 与主线程的数据通过结构化克隆（Structured Clone）进行传递，大数据传递会有序列化耗时。本 Demo 中大数组排序后，在 Worker 内部截取前 10 位返回，避免了大量数据传递的开销。</p>
            <p><strong>3. DOM 与 Window 隔离</strong><br/>Worker 运行在独立的全局上下文 <code>Self</code> 中，无法访问 DOM、<code>window</code> 或 <code>document</code>，因此它们最适合用于纯数学计算、哈希散列计算、图像灰度转换等纯数据操作。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// Import Comlink helper and types
import { wrap, releaseProxy } from 'comlink'
import type { CalcWorker } from './calc.worker'

// States
const taskType = ref<'sort' | 'math'>('sort')
const isMainRunning = ref(false)
const isWorkerRunning = ref(false)

const mainTime = ref<number | null>(null)
const workerTime = ref<number | null>(null)

// ─── 核心多线程初始化：实例化 Web Worker 与 Comlink 包装 ──────────────────
/**
 * 1. 实例化 Web Worker
 * - import.meta.url: 获取当前 Vue 文件的绝对 URL 路径。
 * - new URL('./calc.worker.ts', ...): 编译时 Vite 会识别这一语法，自动对 worker 进行打包，生成独立的 chunk。
 * - { type: 'module' }: 指示浏览器使用 ES Modules (ESM) 的规范去加载和运行 Worker 脚本（允许在 Worker 中使用 import 导入模块）。
 */
const workerInstance = new Worker(new URL('./calc.worker.ts', import.meta.url), {
  type: 'module'
})

/**
 * 2. 使用 Comlink 拦截包装
 * Comlink 能够在底层通过 ES6 Proxy 拦截我们在外部对对象的“属性调用、函数调用”，并自动序列化为 Message 传递。
 * 传入泛型 CalcWorker 后，整个 workerApi 将在 TypeScript 中完全类型安全，支持方法智能补全和强类型校验。
 */
const workerApi = wrap<CalcWorker>(workerInstance)

// 3. 卸载前垃圾回收
onBeforeUnmount(() => {
  // A. 释放 Comlink 建立的 Proxy 代理管道资源
  workerApi[releaseProxy]()
  // B. 强制终结 Web Worker 线程。操作系统会直接回收该辅助线程对应的全部 CPU 与内存资源
  workerInstance.terminate()
})

// ─── 实验 A：主线程直接计算 (同步阻塞) ──────────────────────────────
const runOnMainThread = () => {
  isMainRunning.value = true
  
  /**
   * 💡 经典设计细节：
   * 为什么要将计算放进 setTimeout 50ms 延迟中触发？
   * 因为 JS 是单线程的。如果我们立刻执行千万级大计算，主线程瞬间被完全强占，Vue 状态 `isMainRunning = true`
   * 引起的 DOM 界面更新（渲染 Loading 菊花转轮）根本没有机会被浏览器排入帧重绘，视觉上按钮的 loading 不会生效。
   * 通过 50ms 的延迟，可以先将重绘任务交回给浏览器完成 UI 绘制，随后主进程再执行耗时计算。
   */
  setTimeout(() => {
    const start = performance.now()
    
    if (taskType.value === 'sort') {
      // 1. 在主线程进行 150 万长度 of 浮点数生成与原地排序
      const arr = Array.from({ length: 1500000 }, () => Math.random() * 1000000)
      arr.sort((a, b) => a - b) // 此处会使浏览器处于 100% CPU 占用，事件轮询卡住
    } else {
      // 2. 在主线程进行 2500 万次浮点运算数累加
      let sum = 0
      for (let i = 0; i < 25000000; i++) {
        sum += Math.sin(i) * Math.cos(i) + Math.tan(i % 45)
      }
    }
    
    const end = performance.now()
    mainTime.value = Math.round(end - start)
    isMainRunning.value = false
    ElMessage.error(`主线程计算完毕。耗时: ${mainTime.value}ms，期间页面完全冻结卡死！`)
  }, 50)
}

// ─── 实验 B：Worker 辅助线程计算 (异步非阻塞) ────────────────
const runOnWorkerThread = async () => {
  isWorkerRunning.value = true
  const start = performance.now()
  
  try {
    // 像调用本地普通方法一样去调用后台 Worker 线程中的业务函数。
    // Comlink 底层自动返回 Promise 对象，并在计算完毕时通过消息通道 resolve 结果回来。
    // 此时，浏览器主线程完好如初，页面上的 CSS 动效（旋转的齿轮）依旧保持 60 帧极速渲染。
    if (taskType.value === 'sort') {
      await workerApi.sortLargeArray(1500000)
    } else {
      await workerApi.runHeavyComputation(25000000)
    }
    
    const end = performance.now()
    workerTime.value = Math.round(end - start)
    ElMessage.success(`Worker 线程计算完毕。耗时: ${workerTime.value}ms，页面没有发生任何停滞！`)
  } catch (err) {
    console.error(err)
    ElMessage.error('Worker 后台计算发生故障')
  } finally {
    isWorkerRunning.value = false
  }
}


// Example Code
const comlinkExampleCode = `<script setup>
import { ref } from 'vue'
import { wrap } from 'comlink'

// 1. 初始化 Worker 并用 Comlink 包装
const workerInstance = new Worker(
  new URL('./calc.worker.ts', import.meta.url),
  { type: 'module' }
)
const workerApi = wrap(workerInstance)

const runCalculations = async () => {
  // 2. 像调用普通 API 一样异步调用 Worker 方法
  const result = await workerApi.sortLargeArray(1500000)
  console.log('计算完成并且未阻塞主线程！', result)
}
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

/* Rotating gear animation */
.gear-spinner {
  font-size: 1.4rem;
  display: inline-block;
  animation: spin 2s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.bench-box {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 0.95rem;
    font-weight: 700;
  }
  
  p {
    flex: 1;
    line-height: 1.5;
  }
}

.result-panel {
  background: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  margin-top: 16px;
}

.result-details {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  
  .border-b {
    border-bottom: 1px dashed var(--border-color);
  }
}

.text-danger { color: #f43f5e; }
.text-success { color: #10b981; }
.w-full { width: 100%; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.my-2 { margin-top: 8px; margin-bottom: 8px; }
.pb-2 { padding-bottom: 8px; }
.p-3 { padding: 12px; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
</style>
