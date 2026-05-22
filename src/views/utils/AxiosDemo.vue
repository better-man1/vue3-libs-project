<template>
  <div class="utils-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工具方法实践</el-breadcrumb-item>
      <el-breadcrumb-item>Axios 网络请求</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Axios: 基于 Promise 的 HTTP 请求客户端</h2>
      <p>学习如何使用 Axios 发送异步请求、捕获异常，以及配合 `AbortController` 机制实现正在发起的请求撤销 (Cancel Request)，应对重复提交或快速切换路由页面导致的宽带浪费。</p>
    </div>

    <!-- Simulation Config Card -->
    <el-card shadow="hover" class="mb-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <span class="font-bold">📡 网络模拟器:</span>
          <el-radio-group v-model="networkMode" size="small">
            <el-radio-button label="live">🟢 真实公网 API</el-radio-button>
            <el-radio-button label="mock">🟡 本地模拟 API (支持离线)</el-radio-button>
          </el-radio-group>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-secondary text-sm">人工模拟延迟:</span>
            <el-select v-model="requestDelay" size="small" style="width: 100px;">
              <el-option label="无延迟" :value="0" />
              <el-option label="1.0s 延迟" :value="1000" />
              <el-option label="2.0s 延迟" :value="2000" />
              <el-option label="4.0s 延迟" :value="4000" />
            </el-select>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- Request Trigger & Console -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="请求调度器 (Request Scheduler)"
          description="点击请求触发网络拉取。当处于 Pending 态时，点击“撤销请求”按钮，即可立即中止未返回的网络请求。"
          :code="axiosCancelCode"
        >
          <div class="request-ops">
            <div class="flex gap-2 mb-4">
              <el-button type="primary" @click="fetchData" :loading="isLoading">
                🚀 发送 GET 请求
              </el-button>
              <el-button type="danger" :disabled="!isLoading" @click="cancelCurrentRequest">
                🚫 中断/撤销当前请求
              </el-button>
            </div>

            <!-- Response Status Panel -->
            <div class="response-status-panel">
              <div class="status-row">
                <span class="label">请求状态 (Status):</span>
                <el-tag :type="getStatusTagType(requestStatus)">
                  {{ requestStatus }}
                </el-tag>
              </div>
              <div class="status-row mt-2" v-if="httpCode">
                <span class="label">HTTP 状态码:</span>
                <strong :class="httpCode >= 400 ? 'text-danger' : 'text-success'">
                  {{ httpCode }}
                </strong>
              </div>
            </div>

            <!-- Tech Tip -->
            <div class="info-block mt-4">
              <h5>📝 请求撤销原理解析</h5>
              <p class="desc-text text-xs">
                在 Axios v0.22+ 中，推荐使用原生 Web API `AbortController`。
                创建一个 controller 实例后，将 `controller.signal` 传入 Axios 请求的 config 中。
                执行 `controller.abort()` 即可触发取消。捕获错误时用 `axios.isCancel(err)` 进行拦截判断。
              </p>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Response Panel -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="response-card">
          <template #header>
            <div class="card-header font-bold flex justify-between items-center">
              <span>📦 返回数据与日志 (Console Log)</span>
              <el-button size="small" type="info" plain @click="clearLog">清除面板</el-button>
            </div>
          </template>

          <div class="response-viewport">
            <div v-if="isLoading" class="flex-col items-center justify-center h-full">
              <el-icon class="is-loading text-2xl text-primary"><Loading /></el-icon>
              <span class="text-xs text-secondary mt-2">拉取数据中...</span>
            </div>
            
            <pre v-else-if="responseData" class="json-content"><code>{{ JSON.stringify(responseData, null, 2) }}</code></pre>
            
            <div v-else class="empty-state">
              <span class="emoji">💡</span>
              <span class="text">等待发起请求，数据将在这里展开</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// Simulated states
const networkMode = ref<'live' | 'mock'>('mock')
const requestDelay = ref(1000)

// Request status
const isLoading = ref(false)
const requestStatus = ref<'idle' | 'pending' | 'success' | 'canceled' | 'error'>('idle')
const httpCode = ref<number | null>(null)
const responseData = ref<any>(null)

// AbortController reference
let abortController: AbortController | null = null

// Helper for status tag styling
const getStatusTagType = (status: typeof requestStatus.value) => {
  switch (status) {
    case 'idle': return 'info'
    case 'pending': return 'warning'
    case 'success': return 'success'
    case 'canceled': return 'danger'
    case 'error': return 'danger'
  }
}

// Fetch handler
const fetchData = async () => {
  isLoading.value = true
  requestStatus.value = 'pending'
  httpCode.value = null
  responseData.value = null

  // 1. Setup AbortController
  abortController = new AbortController()

  // 2. Mock delay function
  const delayPromise = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  try {
    if (networkMode.value === 'live') {
      // Send real HTTP request to jsonplaceholder
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1', {
        signal: abortController.signal,
        // Wait delay inside interceptor or trigger manually
      })
      
      if (requestDelay.value > 0) {
        await delayPromise(requestDelay.value)
      }

      responseData.value = response.data
      httpCode.value = response.status
      requestStatus.value = 'success'
      ElMessage.success('成功从公网获取资源数据！')
    } else {
      // Mock client simulation (100% offline proof)
      if (requestDelay.value > 0) {
        // Use a loop check or a delay that responds to AbortController signal
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            resolve(true)
          }, requestDelay.value)

          // If controller is aborted, reject immediately
          abortController?.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new DOMException('Aborted', 'AbortError'))
          })
        })
      }

      responseData.value = {
        id: 100,
        title: 'Vue 3 三方库学习成果汇报 (离线模拟)',
        author: 'Antigravity AI Agent',
        topic: 'Axios AbortController 与 Mock 协同响应',
        timestamp: new Date().toISOString(),
        note: '本数据由前端 Mock 模拟器输出，网络极速，测试无障碍！'
      }
      httpCode.value = 200
      requestStatus.value = 'success'
      ElMessage.success('成功加载本地离线 Mock 资源数据！')
    }
  } catch (err: any) {
    // 3. Catch Abort Error
    if (axios.isCancel(err) || err.name === 'AbortError') {
      requestStatus.value = 'canceled'
      httpCode.value = null
      responseData.value = {
        error: 'Canceled',
        message: '用户已手动取消了当前 Axios HTTP 网络连接，通信已提前终结。'
      }
      ElMessage.warning('网络请求已被用户手动撤销！')
    } else {
      requestStatus.value = 'error'
      httpCode.value = err.response?.status || 500
      responseData.value = {
        error: err.name || 'Request Error',
        message: err.message || '网络连接发生异常错误。'
      }
      ElMessage.error(`请求失败: ${err.message}`)
    }
  } finally {
    isLoading.value = false
    abortController = null
  }
}

// Abort request execution
const cancelCurrentRequest = () => {
  if (abortController) {
    abortController.abort()
  }
}

const clearLog = () => {
  responseData.value = null
  requestStatus.value = 'idle'
  httpCode.value = null
}

const axiosCancelCode = `// Axios: 使用 AbortController 拦截并取消请求
import axios from 'axios'

// 1. 建立 AbortController 实例
let controller = new AbortController()

try {
  const res = await axios.get('/api/resource', {
    // 2. 注入 signal 信号体
    signal: controller.signal
  })
} catch (err) {
  // 3. 判断是否为手动取消错误
  if (axios.isCancel(err)) {
    console.log('请求被手动撤销啦！')
  }
}

// 在需要的时候（例如组件销毁、连击拦截时）执行取消
controller.abort()`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.utils-demo-container {
  padding-bottom: 24px;
}

.request-ops {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
}

.response-status-panel {
  padding: 16px;
  background-color: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  
  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    
    .label {
      color: var(--text-secondary);
    }
  }
}

.response-card {
  height: 100%;
  
  .response-viewport {
    height: 300px;
    background-color: var(--bg-color-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    overflow: auto;
    @include custom-scrollbar;
  }
}

.json-content {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-secondary);
  
  .emoji {
    font-size: 2.2rem;
  }
  
  .text {
    font-size: 0.82rem;
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
  
  p {
    margin: 0;
    line-height: 1.5;
  }
}

.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.justify-center {
  justify-content: center;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
.w-full {
  width: 100%;
}
.flex-wrap {
  flex-wrap: wrap;
}
.font-bold {
  font-weight: 700;
}
.text-xs {
  font-size: 0.75rem;
}
.text-sm {
  font-size: 0.85rem;
}
.text-2xl {
  font-size: 1.5rem;
}
.text-secondary {
  color: var(--text-secondary);
}
.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}
.text-primary {
  color: $primary-color;
}
.h-full {
  height: 100%;
}
</style>
