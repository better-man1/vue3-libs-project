<template>
  <div class="element-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Element Plus</el-breadcrumb-item>
      <el-breadcrumb-item>反馈弹窗</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Element Plus 反馈与弹窗</h2>
      <p>完整的弹窗系统，包括对话框 (Dialog)、侧边抽屉 (Drawer)、气泡提示、全局通知服务以及全局 Loading 加载遮罩层。</p>
    </div>

    <el-row :gutter="20">
      <!-- Dialogs & Drawers -->
      <el-col :xs="24" :md="12">
        <DemoCard 
          title="对话框 & 抽屉" 
          description="模态框遮罩和抽屉面板，适合承载复杂次级操作"
          :code="dialogDrawerCode"
        >
          <div class="demo-buttons">
            <el-button type="primary" @click="dialogVisible = true">
              打开对话框 (Dialog)
            </el-button>
            <el-button type="success" @click="drawerVisible = true">
              打开侧边抽屉 (Drawer)
            </el-button>
          </div>
        </DemoCard>
      </el-col>

      <!-- Message Box -->
      <el-col :xs="24" :md="12">
        <DemoCard 
          title="确认弹框 Message Box" 
          description="系统阻断式提示，提供确认、取消或输入交互"
          :code="messageBoxCode"
        >
          <div class="demo-buttons">
            <el-button type="warning" plain @click="openConfirm">
              确认弹窗 (Confirm)
            </el-button>
            <el-button type="danger" plain @click="openPrompt">
              输入弹窗 (Prompt)
            </el-button>
          </div>
        </DemoCard>
      </el-col>

      <!-- Message & Notifications -->
      <el-col :xs="24" :md="12">
        <DemoCard 
          title="轻量提示 & 全局通知" 
          description="Message 与 Notification 差异化轻量反馈"
          :code="messageNotifyCode"
        >
          <div class="demo-buttons">
            <el-button-group>
              <el-button type="success" @click="triggerMessage('success')">成功消息</el-button>
              <el-button type="warning" @click="triggerMessage('warning')">警告消息</el-button>
              <el-button type="danger" @click="triggerMessage('error')">错误消息</el-button>
            </el-button-group>
            
            <el-button type="primary" @click="triggerNotification">
              发送带图通知 (Notification)
            </el-button>
          </div>
        </DemoCard>
      </el-col>

      <!-- Loading Overlays -->
      <el-col :xs="24" :md="12">
        <DemoCard 
          title="加载遮罩 Loading" 
          description="全屏或局部加载动效，缓解网络延迟焦虑"
          :code="loadingCode"
        >
          <div class="demo-buttons align-center">
            <el-button 
              type="primary" 
              @click="triggerFullscreenLoading"
            >
              触发全屏加载 (3秒)
            </el-button>

            <!-- Local Loading Box -->
            <div 
              v-loading="localLoading"
              element-loading-text="加载局部卡片数据..."
              element-loading-background="rgba(122, 122, 122, 0.1)"
              class="local-loading-box"
            >
              <span>局部加载内容区</span>
              <el-button size="small" type="success" plain @click="triggerLocalLoading">
                刷新卡片
              </el-button>
            </div>
          </div>
        </DemoCard>
      </el-col>
    </el-row>

    <!-- Dialog Component -->
    <el-dialog
      v-model="dialogVisible"
      title="通知公告标题"
      width="500px"
      :before-close="handleClose"
    >
      <div class="dialog-body">
        <p>这是 Element Plus Dialog 的内部主体内容，支持嵌套任何组件和表单项。</p>
        <p>模态遮罩允许防止用户误操作，并且可以通过配置 `before-close` 侦听退出行为。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Drawer Component -->
    <el-drawer
      v-model="drawerVisible"
      title="系统侧栏详情"
      direction="rtl"
      size="380px"
    >
      <div class="drawer-body">
        <h4>用户信息概要</h4>
        <el-descriptions :column="1" border class="mt-3">
          <el-descriptions-item label="登录账号">Administrator</el-descriptions-item>
          <el-descriptions-item label="安全等级">高</el-descriptions-item>
          <el-descriptions-item label="操作日志">正常 (12 条)</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

const dialogVisible = ref(false)
const drawerVisible = ref(false)
const localLoading = ref(false)

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('您确定要关闭此对话框吗？')
    .then(() => {
      done()
    })
    .catch(() => {})
}

const openConfirm = () => {
  ElMessageBox.confirm(
    '当前操作需要高权限，是否确认执行该指令？',
    '敏感操作确认',
    {
      confirmButtonText: '确定执行',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('指令已下发执行')
    })
    .catch(() => {
      ElMessage.info('操作已被终止')
    })
}

const openPrompt = () => {
  ElMessageBox.prompt('请输入您所申请的账户验证邮箱', '验证校验', {
    confirmButtonText: '确定提交',
    cancelButtonText: '取消',
    inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
    inputErrorMessage: '邮箱格式不规范，请修正',
  })
    .then(({ value }) => {
      ElMessage.success(`绑定邮箱成功: ${value}`)
    })
    .catch(() => {})
}

const triggerMessage = (type: 'success' | 'warning' | 'error') => {
  if (type === 'success') ElMessage.success('这是一条成功的轻量提示信息！')
  else if (type === 'warning') ElMessage.warning('警告！检测到环境异常风险。')
  else ElMessage.error('系统底层发生严重网络连接报错！')
}

const triggerNotification = () => {
  ElNotification({
    title: '重要消息推送',
    message: '检测到您已成功登录系统后台！请在日常研发中严格遵循三方安全守则限制。',
    type: 'success',
    duration: 5000,
  })
}

const triggerFullscreenLoading = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在紧急部署本地环境资源，请稍等...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  setTimeout(() => {
    loading.close()
    ElMessage.success('环境部署就绪')
  }, 3000)
}

const triggerLocalLoading = () => {
  localLoading.value = true
  setTimeout(() => {
    localLoading.value = false
    ElMessage.success('局部卡片刷新完毕')
  }, 2000)
}

const dialogDrawerCode = `<el-dialog v-model="dialogVisible" title="公告">
  <p>内容...</p>
</el-dialog>

<el-drawer v-model="drawerVisible" title="详情" direction="rtl">
  <div>详情主体...</div>
</el-drawer>`

const messageBoxCode = `ElMessageBox.confirm('是否执行指令？', '确认', { type: 'warning' })
  .then(() => ElMessage.success('执行成功'))
  .catch(() => ElMessage.info('取消'))

ElMessageBox.prompt('请输入验证邮箱', '验证', {
  inputPattern: /\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*/
})`

const messageNotifyCode = `ElMessage.success('成功轻量提示！')
ElMessage.warning('警告提示')
ElMessage.error('连接失败')

ElNotification({
  title: '推送消息',
  message: '登录后台通知内容',
  type: 'success'
})`

const loadingCode = `// 1. 全屏服务调用
const loading = ElLoading.service({
  lock: true,
  text: '部署中...',
  background: 'rgba(0, 0, 0, 0.7)',
})
setTimeout(() => loading.close(), 3000)

// 2. 指令声明调用 (v-loading)
<div v-loading="localLoading">局部加载</div>`
</script>

<style scoped lang="scss">
.element-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-3 {
  margin-top: 12px;
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

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
  
  &.align-center {
    align-items: center;
  }
}

.dialog-body, .drawer-body {
  p {
    font-size: 0.92rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }
}

.local-loading-box {
  width: 100%;
  height: 110px;
  border-radius: 8px;
  border: 1px dashed var(--border-color);
  background-color: var(--bg-color-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 0.88rem;
  color: var(--text-secondary);
}
</style>
