<template>
  <el-card class="demo-card" shadow="hover">
    <template #header>
      <div class="card-header-content">
        <div class="title-section">
          <h3>{{ title }}</h3>
          <p v-if="description" class="description">{{ description }}</p>
        </div>
        <div class="action-section">
          <slot name="actions"></slot>
          <el-button 
            type="primary" 
            link 
            @click="showCode = !showCode"
            class="code-toggle-btn"
          >
            <el-icon class="mr-1"><View /></el-icon>
            {{ showCode ? '隐藏代码' : '查看代码' }}
          </el-button>
        </div>
      </div>
    </template>

    <div class="demo-content">
      <slot></slot>
    </div>

    <div v-if="showCode && code" class="code-preview-section">
      <div class="code-header">
        <span>示例代码</span>
        <el-button link type="primary" size="small" @click="copyCode">
          <el-icon class="mr-1"><CopyDocument /></el-icon>
          复制
        </el-button>
      </div>
      <pre><code>{{ code }}</code></pre>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { View, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  title: string
  description?: string
  code?: string
}>()

const showCode = ref(false)

const copyCode = async () => {
  if (!props.code) return
  try {
    await navigator.clipboard.writeText(props.code)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped lang="scss">
.demo-card {
  margin-bottom: 24px;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.title-section {
  h3 {
    margin: 0 0 4px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .description {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.action-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mr-1 {
  margin-right: 4px;
}

.demo-content {
  padding: 8px 0;
}

.code-preview-section {
  margin-top: 16px;
  border-top: 1px dashed var(--border-color);
  padding-top: 16px;
  
  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  pre {
    background-color: var(--bg-color-primary);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid var(--border-color);
    margin: 0;
    
    code {
      font-size: 0.85rem;
      color: #e11d48;
      line-height: 1.5;
    }
  }
}

.dark {
  .code-preview-section pre code {
    color: #fb7185;
  }
}
</style>
