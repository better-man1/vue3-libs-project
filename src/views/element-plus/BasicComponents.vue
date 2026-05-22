<template>
  <div class="element-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Element Plus</el-breadcrumb-item>
      <el-breadcrumb-item>基础组件</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Element Plus 基础组件</h2>
      <p>展示了按钮、标签、徽标、头像、进度条与评分组件等常用基础 UI 元素。</p>
    </div>

    <el-row :gutter="20">
      <!-- Buttons -->
      <el-col :xs="24" :md="12">
        <DemoCard title="按钮 Button" description="支持不同的类型、尺寸、形状和加载状态" :code="buttonCode">
          <div class="demo-box flex-wrap">
            <div class="sub-section">
              <h5>基础类型</h5>
              <div class="flex-row">
                <el-button>Default</el-button>
                <el-button type="primary">Primary</el-button>
                <el-button type="success">Success</el-button>
                <el-button type="danger">Danger</el-button>
              </div>
            </div>
            <div class="sub-section">
              <h5>朴素/圆角/圆形</h5>
              <div class="flex-row">
                <el-button type="primary" plain>Plain</el-button>
                <el-button type="success" round>Round</el-button>
                <el-button type="danger" circle><el-icon><Delete /></el-icon></el-button>
              </div>
            </div>
            <div class="sub-section">
              <h5>状态控制</h5>
              <div class="flex-row">
                <el-button type="warning" loading>加载中</el-button>
                <el-button type="info" disabled>禁用按钮</el-button>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Tags & Badges -->
      <el-col :xs="24" :md="12">
        <DemoCard title="标记 & 徽标 Tag & Badge" description="用于展示状态标签以及未读消息气泡" :code="tagBadgeCode">
          <div class="demo-box">
            <div class="sub-section">
              <h5>标签样式</h5>
              <div class="flex-row">
                <el-tag>标签一</el-tag>
                <el-tag type="success" effect="dark">高亮标签</el-tag>
                <el-tag type="warning" effect="plain">朴素标签</el-tag>
                <el-tag type="danger" closable @close="handleTagClose">可关闭</el-tag>
              </div>
            </div>
            <div class="sub-section">
              <h5>数字徽标</h5>
              <div class="flex-row gap-5">
                <el-badge :value="12" class="item">
                  <el-button>评论</el-button>
                </el-badge>
                <el-badge :value="99" :max="9" class="item">
                  <el-button>点赞</el-button>
                </el-badge>
                <el-badge is-dot class="item">
                  <el-button type="primary">新状态</el-button>
                </el-badge>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Progress & Rating -->
      <el-col :xs="24" :md="12">
        <DemoCard title="进度 & 评分 Progress & Rate" description="数字、状态环渲染及打分控制" :code="progressRateCode">
          <div class="demo-box">
            <div class="sub-section">
              <h5>进度条</h5>
              <el-progress :percentage="50" class="mb-3" />
              <el-progress :percentage="80" status="success" :stroke-width="15" striped striped-flow class="mb-3" />
              <div class="flex-row justify-center">
                <el-progress type="circle" :percentage="70" />
              </div>
            </div>
            <div class="sub-section">
              <h5>评分选择</h5>
              <div class="flex-row align-center">
                <span class="mr-2">学习满意度:</span>
                <el-rate v-model="rateVal" show-score score-template="{value} 星" />
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Avatar & Card -->
      <el-col :xs="24" :md="12">
        <DemoCard title="头像 Avatar" description="各种尺寸和形状的用户头像" :code="avatarCode">
          <div class="demo-box">
            <div class="sub-section">
              <h5>头像展示</h5>
              <div class="flex-row align-center gap-4">
                <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <el-avatar :size="40" :icon="UserFilled" />
                <el-avatar shape="square" :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              </div>
            </div>
            <div class="sub-section">
              <h5>空值兜底</h5>
              <div class="flex-row">
                <el-avatar> User </el-avatar>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Delete, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

const rateVal = ref(4.5)

const handleTagClose = () => {
  ElMessage.info('标签被关闭了')
}

const buttonCode = `<el-button>Default</el-button>
<el-button type="primary">Primary</el-button>
<el-button type="success" round>Round</el-button>
<el-button type="danger" circle><el-icon><Delete /></el-icon></el-button>
<el-button type="warning" loading>加载中</el-button>
<el-button type="info" disabled>禁用按钮</el-button>`

const tagBadgeCode = `<el-tag>标签一</el-tag>
<el-tag type="success" effect="dark">高亮标签</el-tag>
<el-tag type="danger" closable @close="handleClose">可关闭</el-tag>

<el-badge :value="12">
  <el-button>评论</el-button>
</el-badge>
<el-badge :value="99" :max="9">
  <el-button>点赞</el-button>
</el-badge>`

const progressRateCode = `<el-progress :percentage="50" />
<el-progress :percentage="80" status="success" :stroke-width="15" striped striped-flow />
<el-progress type="circle" :percentage="70" />

<el-rate v-model="rateVal" show-score score-template="{value} 星" />`

const avatarCode = `<el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
<el-avatar :size="40" icon="UserFilled" />
<el-avatar shape="square" :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />`
</script>

<style scoped lang="scss">
.element-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mr-2 {
  margin-right: 8px;
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

.demo-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-section {
  h5 {
    font-size: 0.88rem;
    color: var(--text-secondary);
    margin: 0 0 10px 0;
    font-weight: 500;
  }
}

.flex-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  &.justify-center {
    justify-content: center;
  }
  &.align-center {
    align-items: center;
  }
}

.gap-4 {
  gap: 16px;
}

.gap-5 {
  gap: 24px;
}
</style>
