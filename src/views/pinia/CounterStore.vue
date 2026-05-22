<template>
  <div class="pinia-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Pinia 状态管理</el-breadcrumb-item>
      <el-breadcrumb-item>计数器示例</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Pinia 计数器</h2>
      <p>基础的 Pinia 状态管理实践，展示了 `state`、`getters`（派生状态）以及 `actions`（同步/异步状态修改）的核心用法。</p>
    </div>

    <el-row :gutter="20">
      <!-- Demo Section -->
      <el-col :xs="24" :lg="12">
        <DemoCard 
          title="计数器面板" 
          description="点击按钮触发 Action 修改全局共享的 Count 状态"
          :code="storeCode"
        >
          <div class="counter-panel">
            <div class="display-box">
              <div class="val-item">
                <span class="label">Count (State)</span>
                <span class="val">{{ counterStore.count }}</span>
              </div>
              <div class="divider"></div>
              <div class="val-item">
                <span class="label">Double Count (Getter)</span>
                <span class="val secondary">{{ counterStore.doubleCount }}</span>
              </div>
            </div>

            <div class="control-box">
              <el-button-group>
                <el-button type="primary" @click="counterStore.increment">
                  <el-icon class="mr-1"><Plus /></el-icon>
                  加 1
                </el-button>
                <el-button type="primary" @click="counterStore.decrement">
                  <el-icon class="mr-1"><Minus /></el-icon>
                  减 1
                </el-button>
              </el-button-group>

              <el-button type="success" :loading="isAsyncLoading" @click="handleAsyncIncrement">
                <el-icon class="mr-1"><Timer /></el-icon>
                延迟加 1 (异步 Action)
              </el-button>

              <el-button type="danger" plain @click="counterStore.reset">
                重置计数
              </el-button>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Explanation Card -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="explanation-card">
          <template #header>
            <div class="card-header">
              <span>💡 Pinia 核心要点</span>
            </div>
          </template>
          <div class="explanation-content">
            <h4>1. 定义 Store (`defineStore`)</h4>
            <p>通过 `defineStore` 函数创建，首个参数为 Store 的唯一 ID。建议使用 Composition API 风格（Setup Store），即传入函数以定义响应式状态和方法。</p>
            
            <h4>2. State 与 Getters</h4>
            <p>`state` 相当于组件的 `data`，`getters` 使用 `computed()` 包装，实现派生状态的自动更新，如 `doubleCount`。</p>

            <h4>3. Actions</h4>
            <p>类似于组件的 `methods`，支持同步或异步行为。可以直接在 actions 内发起 Axios 请求，获取网络数据并更新 state。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '@/stores/counter'
import { Plus, Minus, Timer } from '@element-plus/icons-vue'
import DemoCard from '@/components/common/DemoCard.vue'

const counterStore = useCounterStore()
const isAsyncLoading = ref(false)

const handleAsyncIncrement = async () => {
  isAsyncLoading.value = true
  await counterStore.incrementAsync()
  isAsyncLoading.value = false
}

const storeCode = `// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  
  // getters
  const doubleCount = computed(() => count.value * 2)
  
  // actions (sync)
  const increment = () => {
    count.value++
  }
  const decrement = () => {
    count.value--
  }
  
  // actions (async)
  const incrementAsync = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    count.value++
  }

  const reset = () => {
    count.value = 0
  }

  return { count, doubleCount, increment, decrement, incrementAsync, reset }
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

.counter-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 0;
}

.display-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: var(--bg-color-primary);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  
  .val-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .val {
      font-size: 2.2rem;
      font-weight: 700;
      color: $primary-color;
      
      &.secondary {
        color: $secondary-color;
      }
    }
  }

  .divider {
    width: 1px;
    height: 50px;
    background-color: var(--border-color);
  }
}

.control-box {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

.mr-1 {
  margin-right: 4px;
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
    
    p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
  }
}
</style>
