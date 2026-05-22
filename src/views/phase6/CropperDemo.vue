<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>移动与交互</el-breadcrumb-item>
      <el-breadcrumb-item>图片裁剪工具</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>vue-advanced-cropper — 专业响应式图片与头像裁剪</h2>
      <p>学习集成 Vue 3 专业级图片裁剪组件。支持锁定 1:1 头像比例、圆形或矩形模板切换、图像 90° 旋转/翻转、缩放以及本地图片读取导出。</p>
    </div>

    <!-- Cropper Container -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="图片/头像裁剪编辑器"
          description="支持通过上方控制条执行旋转、翻转及缩放，并实时在右侧输出预览及裁剪结果。"
          :code="cropperExampleCode"
        >
          <!-- Toolbar controls -->
          <div class="cropper-toolbar mb-3 flex flex-wrap justify-between items-center gap-2">
            <div class="flex gap-2">
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleImageUpload"
                accept="image/*"
              >
                <el-button type="primary" size="small">📂 选择本地图片</el-button>
              </el-upload>
              <el-button type="info" size="small" @click="resetToDefault">🔄 重置默认图</el-button>
            </div>

            <div class="flex gap-2">
              <el-button-group size="small">
                <el-button type="default" @click="rotate(90)">↪️ 顺时针旋转 90°</el-button>
                <el-button type="default" @click="flip(true, false)">↔️ 水平翻转</el-button>
                <el-button type="default" @click="flip(false, true)">↕️ 垂直翻转</el-button>
              </el-button-group>

              <el-button-group size="small">
                <el-button type="default" @click="zoom(1.2)">➕ 放大</el-button>
                <el-button type="default" @click="zoom(0.8)">➖ 缩小</el-button>
              </el-button-group>
            </div>
          </div>

          <!-- Main cropper workspace -->
          <div class="cropper-workspace">
            <cropper
              ref="cropperRef"
              class="cropper-instance"
              :src="imageSrc"
              :stencil-component="stencilType === 'circle' ? CircleStencil : undefined"
              :stencil-props="{
                aspectRatio: stencilType === 'circle' ? 1 : undefined,
              }"
              @change="onCropChange"
            />
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Preview & Export -->
      <el-col :xs="24" :lg="8">
        <!-- Crop Preview Panel -->
        <el-card shadow="hover" class="preview-card">
          <template #header>
            <div class="font-bold flex justify-between items-center">
              <span>🖼️ 实时裁剪预览</span>
              <el-radio-group v-model="stencilType" size="small">
                <el-radio-button value="circle">圆形 (头像)</el-radio-button>
                <el-radio-button value="rectangle">矩形 (自由)</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div class="preview-box flex flex-col items-center justify-center py-4">
            <div 
              class="avatar-preview-container" 
              :class="{ 'circle-preview': stencilType === 'circle' }"
            >
              <img v-if="croppedImage" :src="croppedImage" alt="Cropped Preview" />
              <div v-else class="text-xs text-secondary">等待裁剪...</div>
            </div>
            <span class="text-xs text-secondary mt-3">圆形模板实时头像预览 (1:1)</span>
          </div>

          <el-divider />

          <!-- Export Actions -->
          <div class="export-actions">
            <el-button type="success" class="w-full mb-2" @click="exportResult">
              💾 导出高分辨率裁剪图片
            </el-button>
            <div class="flex gap-2">
              <el-button size="small" class="flex-1" @click="downloadBase64">下载 Base64</el-button>
              <el-button size="small" class="flex-1" @click="viewOriginalInfo">源图坐标信息</el-button>
            </div>
          </div>
        </el-card>

        <!-- Coordinate Info Card -->
        <el-card shadow="hover" class="info-card mt-4" v-if="cropCoordinates">
          <template #header>
            <span class="font-bold">📍 裁剪锚点物理坐标</span>
          </template>
          <div class="font-mono text-xs text-secondary leading-relaxed">
            <div class="flex justify-between"><span>宽度 (Width):</span> <span>{{ cropCoordinates.width }}px</span></div>
            <div class="flex justify-between"><span>高度 (Height):</span> <span>{{ cropCoordinates.height }}px</span></div>
            <div class="flex justify-between"><span>左锚点 (Left):</span> <span>{{ cropCoordinates.left }}px</span></div>
            <div class="flex justify-between"><span>上锚点 (Top):</span> <span>{{ cropCoordinates.top }}px</span></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// Import vue-advanced-cropper and styles
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

// Default premium avatar vector graphic to prevent empty state and work offline
const defaultImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%236366f1'/><stop offset='100%' stop-color='%23ec4899'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><circle cx='400' cy='300' r='130' fill='%23ffffff' opacity='0.95'/><circle cx='400' cy='240' r='45' fill='%231e1b4b'/><path d='M300 390 C300 320, 500 320, 500 390 Z' fill='%231e1b4b'/></svg>"

// States
const cropperRef = ref<any>(null)
const imageSrc = ref(defaultImage)
const stencilType = ref<'circle' | 'rectangle'>('circle')
const croppedImage = ref('')
const cropCoordinates = ref<any>(null)

// Handle file uploading
const handleImageUpload = (uploadFile: any) => {
  const file = uploadFile.raw
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        imageSrc.value = e.target.result as string
        ElMessage.success('本地图片加载成功，请开始裁剪')
      }
    }
    reader.readAsDataURL(file)
  }
}

// Reset to default sample image
const resetToDefault = () => {
  imageSrc.value = defaultImage
  ElMessage.info('已重置为默认矢量背景图')
}

// Transform operations
const rotate = (angle: number) => {
  cropperRef.value?.rotate(angle)
}

const flip = (horizontal: boolean, vertical: boolean) => {
  cropperRef.value?.flip(horizontal, vertical)
}

const zoom = (factor: number) => {
  cropperRef.value?.zoom(factor)
}

// Triggered when cropper area changes
const onCropChange = ({ coordinates, canvas }: any) => {
  cropCoordinates.value = coordinates
  if (canvas) {
    // Generate low-res image for real-time preview (performance optimization)
    croppedImage.value = canvas.toDataURL('image/jpeg', 0.75)
  }
}

// Export final high resolution cropped image
const exportResult = () => {
  const { canvas } = cropperRef.value.getResult()
  if (canvas) {
    const dataUrl = canvas.toDataURL('image/png')
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(`<img src="${dataUrl}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`)
      newWindow.document.title = '裁剪图片导出结果'
      ElMessage.success('成功将高分辨率裁剪图导出至新标签页')
    } else {
      ElMessage.warning('弹出窗口被浏览器拦截，可点击下方下载 Base64 按钮进行保存')
    }
  }
}

// Download cropped image directly as file
const downloadBase64 = () => {
  const { canvas } = cropperRef.value.getResult()
  if (canvas) {
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `cropped-avatar-${Date.now()}.png`
    link.href = dataUrl
    link.click()
    ElMessage.success('图片已保存至本地下载夹')
  }
}

// Dialog coordinates alert
const viewOriginalInfo = () => {
  ElMessage({
    message: `当前裁剪范围: 宽 ${Math.round(cropCoordinates.value.width)}px, 高 ${Math.round(cropCoordinates.value.height)}px, 偏移量 X: ${Math.round(cropCoordinates.value.left)}px, Y: ${Math.round(cropCoordinates.value.top)}px`,
    type: 'info',
    duration: 5000
  })
}

// Code example content
const cropperExampleCode = `<template>
  <div class="cropper-container">
    <cropper
      ref="cropperRef"
      :src="imageSrc"
      :stencil-component="stencilType === 'circle' ? CircleStencil : undefined"
      :stencil-props="{ aspectRatio: 1 }"
      @change="onCropChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const cropperRef = ref(null)
const imageSrc = ref('path-to-image')

// Transform helper examples
const rotate = (angle) => cropperRef.value?.rotate(angle)
const flip = (h, v) => cropperRef.value?.flip(h, v)

const onCropChange = ({ coordinates, canvas }) => {
  if (canvas) {
    const croppedBase64 = canvas.toDataURL('image/png')
  }
}
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.cropper-toolbar {
  padding: 8px 12px;
  background: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.cropper-workspace {
  width: 100%;
  height: 400px;
  background: #111827;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-instance {
  width: 100%;
  height: 100%;
  max-width: 100%;
}

/* Avatar Preview Circle/Rect */
.avatar-preview-container {
  width: 180px;
  height: 180px;
  border: 2px solid var(--border-color);
  background: var(--bg-color-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-radius 0.3s;
  
  &.circle-preview {
    border-radius: 50%;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.w-full { width: 100%; }
.flex-1 { flex: 1; }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
</style>
