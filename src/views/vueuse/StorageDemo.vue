<template>
  <div class="vueuse-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>VueUse 常用库</el-breadcrumb-item>
      <el-breadcrumb-item>本地响应式缓存</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>VueUse: 浏览器存储与系统剪贴板</h2>
      <p>学习如何使用 `useLocalStorage` 建立随动响应的本地存储机制，以及利用 `useClipboard` 无痛对接系统剪贴板，提供无延迟的复制反馈微交互。</p>
    </div>

    <el-row :gutter="20">
      <!-- Local Storage Demo -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="响应式 LocalStorage (useLocalStorage)"
          description="修改下方表单。绑定的存储字段在更新时会自动序列化保存，同时支持多窗口/跨标签页数据秒级双向同步。"
          :code="localStorageCode"
        >
          <div class="form-container">
            <el-form label-position="top">
              <el-form-item label="学习学者姓名:">
                <el-input v-model="userProfile.username" placeholder="请输入姓名..." />
              </el-form-item>
              
              <el-form-item label="当前学习阶段:">
                <el-select v-model="userProfile.phase" class="w-full">
                  <el-option label="第一阶段: Vue 3 + Pinia + ECharts" value="Phase 1" />
                  <el-option label="第二阶段: Three.js + D3.js" value="Phase 2" />
                  <el-option label="第三阶段: Animations + Tools" value="Phase 3" />
                </el-select>
              </el-form-item>

              <el-form-item label="每日打卡开关 (Auto Save):">
                <div class="flex justify-between items-center w-full">
                  <span class="text-secondary text-sm">激活后记录最后修改时间</span>
                  <el-switch v-model="userProfile.checkIn" />
                </div>
              </el-form-item>
            </el-form>

            <div class="storage-output">
              <h5>💾 当前 localStorage 物理存储的 JSON:</h5>
              <pre><code>{{ JSON.stringify(userProfile, null, 2) }}</code></pre>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <el-button type="danger" plain @click="resetStorage">🔄 重置缓存</el-button>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Clipboard Copy Demo -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="系统剪贴板复制 (useClipboard)"
          description="输入需要拷贝的内容，点击复制按钮。VueUse 将自动调用 Clipboard API 并触发响应式反馈。"
          :code="clipboardCode"
        >
          <div class="clipboard-box">
            <div class="mb-4">
              <span class="label mb-2 block">1. 输入要复制的文本:</span>
              <el-input 
                type="textarea" 
                v-model="copyInput" 
                :rows="3" 
                placeholder="在此处输入任意字符，准备拷贝到您的电脑剪贴板..." 
              />
            </div>

            <div class="flex items-center gap-2 mb-4">
              <el-button 
                type="primary" 
                :disabled="!isSupported" 
                @click="copyText"
              >
                📋 复制到剪贴板
              </el-button>
              
              <transition name="fade">
                <span v-if="copied" class="copied-badge">
                  ✓ 复制成功！已经载入系统
                </span>
              </transition>
            </div>

            <div class="clipboard-preview">
              <h5>📋 剪贴板中检测到的文本 (实时展示):</h5>
              <div class="preview-box">
                <span v-if="!text" class="text-placeholder">系统剪贴板当前为空，或未获得读取授权</span>
                <span v-else class="text-content">{{ text }}</span>
              </div>
              <span class="tip text-xs text-secondary mt-1 block">提示: 某些浏览器出于隐私保护，可能需要点击页面授权后才能读取系统剪贴板。</span>
            </div>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocalStorage, useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// 1. Local Storage Setup
const defaultProfile = {
  username: '小明同学',
  phase: 'Phase 3',
  checkIn: true,
  updatedAt: new Date().toLocaleDateString()
}

// useLocalStorage dynamically binds a reactive reference to localStorage
const userProfile = useLocalStorage('learning-profile', defaultProfile)

const resetStorage = () => {
  userProfile.value = { ...defaultProfile }
  ElMessage.success('LocalStorage 本地缓存已重置！')
}

// 2. Clipboard Setup
const copyInput = ref('发现一个超赞的 Vue 3 学习平台，包含了 Pinia, Element Plus, ECharts, Three.js, D3.js 还有 VueUse 各种硬核工具！🚀')
const { 
  text, 
  copy, 
  copied, 
  isSupported 
} = useClipboard()

const copyText = () => {
  copy(copyInput.value)
  ElMessage({
    message: '文本已成功复制到系统剪贴板！',
    type: 'success',
    duration: 1500
  })
}

const localStorageCode = `// VueUse: useLocalStorage 本地反应式自动缓存
import { useLocalStorage } from '@vueuse/core'

const defaultProfile = { username: '小明同学', phase: 'Phase 3' }

// 一行代码，声明一个自动同步 localStorage 的响应式变量
// 第一个参数是键名，第二个参数是默认值（如不存在该键时写入）
const userProfile = useLocalStorage('learning-profile', defaultProfile)

// 当 userProfile.value 属性变化时，底层会自动同步至 localStorage
userProfile.value.username = '新名字'`

const clipboardCode = `// VueUse: useClipboard 系统剪贴板交互
import { useClipboard } from '@vueuse/core'

const { 
  text,        // 剪贴板当前的最新文本内容
  copy,        // 执行写入的复制函数
  copied,      // 布尔型响应式变量，复制后短暂变为 true
  isSupported  // 浏览器是否支持 Clipboard API
} = useClipboard()

// 调用复制方法
copy('Hello World')`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.vueuse-demo-container {
  padding-bottom: 24px;
}

.form-container {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
}

.storage-output {
  margin-top: 16px;
  
  h5 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 0.82rem;
    color: var(--text-primary);
  }
  
  pre {
    margin: 0;
    padding: 12px;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.8rem;
    color: var(--text-secondary);
    overflow-x: auto;
    font-family: 'Courier New', Courier, monospace;
  }
}

.clipboard-box {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.copied-badge {
  font-size: 0.8rem;
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 6px 12px;
  border-radius: 4px;
}

.clipboard-preview {
  margin-top: 16px;
  
  h5 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 0.82rem;
    color: var(--text-primary);
  }
  
  .preview-box {
    min-height: 50px;
    padding: 12px;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    
    .text-placeholder {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-style: italic;
    }
    
    .text-content {
      font-size: 0.85rem;
      color: var(--text-primary);
      line-height: 1.4;
      word-break: break-all;
    }
  }
}

// Fade transition
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
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
.justify-end {
  justify-content: flex-end;
}
.gap-2 {
  gap: 8px;
}
.mt-1 {
  margin-top: 4px;
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
.block {
  display: block;
}
.w-full {
  width: 100%;
}
.text-xs {
  font-size: 0.75rem;
}
.text-sm {
  font-size: 0.85rem;
}
.text-secondary {
  color: var(--text-secondary);
}
</style>
