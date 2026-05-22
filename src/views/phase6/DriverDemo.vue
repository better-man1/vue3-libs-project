<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>移动与交互</el-breadcrumb-item>
      <el-breadcrumb-item>Driver.js 步骤引导</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Driver.js — 响应式页面元素步骤聚焦与新手引导</h2>
      <p>学习轻量级无依赖的页面分步指引库 Driver.js。高亮页面指定 DOM 元素，配合毛玻璃遮罩和富文本气泡，引导用户熟悉新版交互界面。</p>
    </div>

    <!-- Tour Mock Dashboard -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="新手引导互动模拟区"
          description="点击下方按钮启动 Driver.js 指引。系统将依次高亮该模拟看板的各个组件区域。"
          :code="driverExampleCode"
        >
          <div class="flex justify-between items-center mb-4">
            <span class="font-bold">🖥️ 业务模拟看板 (Onboarding Area)</span>
            <div class="flex gap-2">
              <el-button id="driver-start-btn" type="primary" size="small" @click="startTour">
                🚀 开始完整新手引导 (4 步)
              </el-button>
            </div>
          </div>

          <!-- Mock Dashboard Grid -->
          <el-row :gutter="16">
            <!-- Widget 1: Statistics -->
            <el-col :xs="24" :sm="12" class="mb-3">
              <div id="mock-stat-card" class="mock-widget stat-widget">
                <div class="widget-header">
                  <span class="icon">📈</span>
                  <span class="title">统计数据卡片</span>
                </div>
                <div class="widget-body">
                  <h2>¥ 4,892,102.80</h2>
                  <p class="text-success">↑ 12.8% 环比增长较上月</p>
                </div>
                <div class="widget-footer">
                  <el-button type="success" size="small" link @click="highlightSingle('#mock-stat-card', '数据统计区', '展示当前账户实时资金变动。')">
                    🔍 仅聚焦此卡片
                  </el-button>
                </div>
              </div>
            </el-col>

            <!-- Widget 2: Fast Action -->
            <el-col :xs="24" :sm="12" class="mb-3">
              <div id="mock-action-card" class="mock-widget action-widget">
                <div class="widget-header">
                  <span class="icon">⚡</span>
                  <span class="title">快速操作控制面板</span>
                </div>
                <div class="widget-body flex flex-wrap gap-2 py-2">
                  <el-button type="primary" size="small">同步状态</el-button>
                  <el-button type="warning" size="small">导出报表</el-button>
                  <el-button type="danger" size="small">清空缓存</el-button>
                </div>
                <div class="widget-footer">
                  <el-button type="warning" size="small" link @click="highlightSingle('#mock-action-card', '操作控制区', '快速发起数据清洗与报表归档操作。')">
                    🔍 仅聚焦此卡片
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <!-- Widget 3: Data Log -->
            <el-col :span="24">
              <div id="mock-log-card" class="mock-widget log-widget">
                <div class="widget-header">
                  <span class="icon">📝</span>
                  <span class="title">事件流水日志记录</span>
                </div>
                <div class="widget-body">
                  <ul class="mock-log-list font-mono text-xs">
                    <li><span class="text-info">[10:15:32]</span> Schema verification succeeded for VeeValidate.</li>
                    <li><span class="text-info">[10:16:04]</span> D3 provincial coordinates loaded (china.json).</li>
                    <li><span class="text-info">[10:16:15]</span> Vitest specs run passed: counter.spec.ts.</li>
                  </ul>
                </div>
                <div class="widget-footer">
                  <el-button type="info" size="small" link @click="highlightSingle('#mock-log-card', '事件日志区', '记录当前进程所捕获的最新底层事件与测试输出日志。')">
                    🔍 仅聚焦此卡片
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </DemoCard>
      </el-col>

      <!-- Right side: Parameters Panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="param-card">
          <template #header>
            <div class="font-bold">⚙️ 引导参数配置</div>
          </template>

          <el-form label-position="top">
            <el-form-item label="显示步骤进度条 (showProgress)">
              <el-switch v-model="showProgress" active-text="开启" inactive-text="关闭" />
            </el-form-item>

            <el-form-item label="开启平滑动画过渡 (animate)">
              <el-switch v-model="animate" active-text="开启" inactive-text="关闭" />
            </el-form-item>

            <el-form-item label="遮罩层透明度 (overlayOpacity)">
              <el-slider v-model="opacity" :min="0.1" :max="0.9" :step="0.05" show-input />
            </el-form-item>

            <el-form-item label="高亮溢出间距 (stagePadding)">
              <el-slider v-model="stagePadding" :min="0" :max="30" :step="2" show-input />
            </el-form-item>

            <el-form-item label="允许键盘左右控制 (allowKeyboardControl)">
              <el-switch v-model="allowKeyboardControl" active-text="允许" inactive-text="禁止" />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <span class="font-bold">💡 Driver.js 踩坑避坑建议</span>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2"><strong>1. DOM 生命周期</strong><br/>高亮的 <code>element</code> 目标必须已存在于当前的 DOM 树中。如果目标位于 <code>v-if</code> 弹窗或尚未渲染的 Tab 中，Driver.js 会因为获取不到 DOM 位置而报错或失效。建议在 <code>nextTick</code> 后或完全挂载后调用。</p>
            <p class="mb-2"><strong>2. 滚动重定位</strong><br/>Driver.js 具备内置的 scroll-into-view 算法，会在高亮目标位于视口外时自动进行滚动居中。可以通过自定义样式避免头部固定 Fixed navbar 被高亮层级遮挡。</p>
            <p><strong>3. 弹出框层级 (z-index)</strong><br/>Driver.js 高亮是通过克隆节点或修改 <code>position/z-index</code> 实现的。若页面中有较高层级的 Fixed/Absolute 元素，确保调整 Driver.js 的 overlay 样式避免错乱。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'

// Import driver.js and styles
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

// Form configurations
const showProgress = ref(true)
const animate = ref(true)
const opacity = ref(0.75)
const stagePadding = ref(10)
const allowKeyboardControl = ref(true)

// Run step onboarding tour
const startTour = () => {
  const driverObj = driver({
    showProgress: showProgress.value,
    animate: animate.value,
    overlayOpacity: opacity.value,
    stagePadding: stagePadding.value,
    allowKeyboardControl: allowKeyboardControl.value,
    overlayColor: 'rgba(0,0,0,0.85)',
    popoverClass: 'custom-driver-popover',
    steps: [
      {
        element: '#driver-start-btn',
        popover: {
          title: '第一步：启动控制按钮',
          description: '点击此按钮即可启动本全页交互新手教程。您可以通过下一步或方向键控制轮转。',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#mock-stat-card',
        popover: {
          title: '第二步：实时资产统计',
          description: '此模块展示实时资金流量，支持与后端 WebSocket 及 GraphQL 数据接口自动进行乐观同步渲染。',
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '#mock-action-card',
        popover: {
          title: '第三步：快捷控制面板',
          description: '这里集成高频操作（例如导出报表、同步状态）。可以使用 @vueuse/motion 的 tapped 特效实现轻快触控物理缩放。',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '#mock-log-card',
        popover: {
          title: '第四步：日志流水追踪',
          description: '底层的流水事件通过虚拟滚动列表（Virtual Scroll）处理，承载上十万级大数据且保持 60 帧极速渲染性能。',
          side: 'top',
          align: 'center'
        }
      }
    ]
  })

  driverObj.drive()
}

// Focus on a single element
const highlightSingle = (selector: string, title: string, desc: string) => {
  const driverObj = driver({
    animate: animate.value,
    overlayOpacity: opacity.value,
    stagePadding: stagePadding.value,
    steps: [
      {
        element: selector,
        popover: {
          title,
          description: desc,
          side: 'top'
        }
      }
    ]
  })
  
  driverObj.drive()
}

// Code preview content
const driverExampleCode = `<script setup>
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    steps: [
      {
        element: '#dashboard-btn',
        popover: {
          title: '快捷入口',
          description: '在这里快速执行数据流清洗。',
          side: 'bottom'
        }
      },
      {
        element: '#stats-panel',
        popover: {
          title: '数据总览',
          description: '查看月度数据变化趋势。',
          side: 'right'
        }
      }
    ]
  })
  
  driverObj.drive()
}
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

/* Onboarding Dashboard cards */
.mock-widget {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s;
  
  .widget-header {
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
    margin-bottom: 12px;
    
    .icon {
      font-size: 1.2rem;
    }
    
    .title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-primary);
    }
  }
  
  .widget-body {
    flex: 1;
    
    h2 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 4px 0;
      letter-spacing: -0.5px;
    }
    
    .text-success {
      font-size: 0.72rem;
      color: #10b981;
      margin: 0;
    }
  }
  
  .widget-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    border-top: 1px dashed var(--border-color);
    padding-top: 8px;
  }
}

.log-widget {
  min-height: 160px;
  
  .mock-log-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 5px 0;
      border-bottom: 1px solid rgba(0,0,0,0.02);
      color: var(--text-secondary);
      
      .text-info {
        color: #3b82f6;
        font-weight: 600;
        margin-right: 6px;
      }
    }
  }
}

/* Driver Popover Customizations in Global */
:deep(.driver-popover) {
  background: var(--bg-color-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
  padding: 16px !important;
  color: var(--text-primary) !important;
  
  .driver-popover-title {
    color: var(--text-primary) !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    margin-bottom: 8px !important;
  }
  
  .driver-popover-description {
    color: var(--text-secondary) !important;
    font-size: 12px !important;
    line-height: 1.5 !important;
  }
  
  .driver-popover-close-btn {
    color: var(--text-secondary) !important;
    &:hover {
      color: $primary-color !important;
    }
  }
  
  .driver-popover-navigation-btns {
    margin-top: 14px !important;
    gap: 6px !important;
  }
  
  .driver-popover-next-btn, .driver-popover-prev-btn {
    background-color: var(--bg-color-primary) !important;
    border: 1px solid var(--border-color) !important;
    color: var(--text-primary) !important;
    text-shadow: none !important;
    border-radius: 6px !important;
    font-size: 11px !important;
    padding: 4px 10px !important;
    
    &:hover {
      background-color: $primary-color !important;
      color: #ffffff !important;
      border-color: transparent !important;
    }
  }
  
  .driver-popover-progress-text {
    color: var(--text-secondary) !important;
    font-size: 11px !important;
  }
}

.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
</style>
