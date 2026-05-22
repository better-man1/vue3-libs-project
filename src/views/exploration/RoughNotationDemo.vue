<template>
  <div class="rough-notation-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>前沿探索</el-breadcrumb-item>
      <el-breadcrumb-item>手绘风格标注</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Rough Notation — 动感手绘风网页文本标注引擎</h2>
      <p>
        Rough Notation 能够通过生动的手绘草图风格（线框、下划线、圆圈、高亮和删除线）来为关键段落增加视觉焦点。
        它基于 Canvas/SVG 技术渲染，具备轻量级、完全矢量化及高度拟真的书写动效，适合用于功能引导、内容推荐及交互式阅读场景。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Left side: Interactive Article Mockup -->
      <el-col :xs="24" :lg="15" class="mb-4">
        <DemoCard
          title="手绘效果展示：交互式技术前瞻报告"
          description="点击右侧控制面板的按钮，或者直接悬停在下方带有色彩暗示的词汇上，体验动感手绘动画效果。"
          :code="roughNotationSnippet"
        >
          <!-- Article Panel -->
          <div class="article-wrapper">
            <h3 class="article-title text-center mb-4">
              <span id="note-title" class="note-target">Antigravity 2026 前沿前端技术趋势报告</span>
            </h3>
            
            <div class="article-meta flex justify-center gap-4 text-xs text-secondary mb-4">
              <span>📅 发布日期：2026-05-21</span>
              <span>✍️ 作者：Antigravity Lab</span>
              <span>🏷️ 分类：前端工程化 / Web 可视化</span>
            </div>

            <div class="article-content leading-relaxed">
              <p class="paragraph">
                随着 WebGL / WebGPU 标准的普及，现代 Web 应用正在向三维地理信息和多维可视化演进。
                我们需要将 <span id="note-cesium" class="note-target important-text font-bold">CesiumJS 三维虚拟地球</span> 
                与大屏幕动态排版融合，这不仅是简单的组件堆砌，更是一次关于几何体拓扑运算的全新探索。
              </p>

              <p class="paragraph">
                在用户交互层面，流畅度是核心。许多老旧系统的签名板和表格输入组件性能极差，
                我们会引入 <span id="note-sig" class="note-target important-text font-bold">Signature Pad 电子签名板</span> 
                来实现极低延迟的曲线手写，结合 <span id="note-pressure" class="note-target italic-text">动态压感笔尖模拟</span>，
                提供媲美物理纸质签署的丝滑质感，同时输出无损 SVG/PNG 矢量图片。
              </p>

              <p class="paragraph mt-3">
                除了重型可视化，页面中的轻量级排版与视觉强调也至关重要。
                研究表明，采用枯燥的传统黑体粗字会导致信息层级混乱。
                相反，使用像 Rough Notation 这样的 <span id="note-hand" class="note-target color-tag-primary">手绘感趣味动画</span>，
                能让枯燥的文章瞬间生动起来。
              </p>

              <div class="highlight-quote my-4 p-4">
                💡 <strong>核心观点：</strong>
                传统的强调方式（如背景红字）是 <span id="note-strike" class="note-target text-muted">毫无灵动感且容易产生视觉疲劳的</span>。
                未来优秀的数字化排版，应当通过 <span id="note-crossed" class="note-target text-warning">多种轻量级微动效</span> 
                来对特定语义词汇进行点缀与强化。
              </div>

              <p class="paragraph">
                我们正在持续整合更多有趣的三方库，打造一个 <span id="note-circle" class="note-target important-text font-bold">一站式前端场景演练场</span>。
                不论是拖拽看板、国际化翻译，还是高阶 WebGL 粒子系统，都在这里进行标准化落地。
              </p>
            </div>
          </div>
        </DemoCard>

        <!-- Custom Interactive Sandbox -->
        <el-card shadow="hover" class="sandbox-card">
          <template #header>
            <div class="font-bold flex items-center justify-between">
              <span>✍️ 手绘标注沙盒自定义测试</span>
              <el-tag size="small" type="info">实时渲染测试</el-tag>
            </div>
          </template>
          
          <div class="sandbox-inner">
            <el-input 
              v-model="sandboxText" 
              placeholder="在这里输入一些句子..." 
              class="mb-3"
              clearable
            />
            
            <div class="sandbox-controls flex flex-wrap gap-3 items-center mb-3">
              <span class="text-xs text-secondary">选择标注样式:</span>
              <el-radio-group v-model="sandboxStyle" size="small" @change="recreateSandboxAnnotation">
                <el-radio-button label="underline">下划线 (Underline)</el-radio-button>
                <el-radio-button label="box">线框 (Box)</el-radio-button>
                <el-radio-button label="circle">画圈 (Circle)</el-radio-button>
                <el-radio-button label="highlight">背景荧光笔 (Highlight)</el-radio-button>
                <el-radio-button label="strike-through">删除线 (Strike)</el-radio-button>
                <el-radio-button label="crossed-off">打叉 (Crossed)</el-radio-button>
              </el-radio-group>
            </div>

            <div class="sandbox-preview p-4 mb-3 text-center">
              <span id="sandbox-target" class="sandbox-text-instance">{{ sandboxText || 'Antigravity WebLab 前沿前端探索' }}</span>
            </div>

            <div class="flex gap-2">
              <el-button type="primary" size="small" @click="showSandboxAnnotation">▶️ 播放手绘动效</el-button>
              <el-button size="small" plain @click="hideSandboxAnnotation">⏸️ 隐藏/清空</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right side: Style Controls & Config Panel -->
      <el-col :xs="24" :lg="9" class="mb-4">
        <!-- Control Card -->
        <el-card shadow="hover" class="config-card mb-4">
          <template #header>
            <div class="font-bold flex items-center justify-between">
              <span>⚙️ 标注风格参数调节</span>
              <el-switch 
                v-model="isHoverMode" 
                active-text="鼠标悬浮触发" 
                inactive-text="按钮手动控制" 
                size="small"
                @change="toggleInteractionMode"
              />
            </div>
          </template>

          <div class="flex flex-col gap-4 text-xs">
            <!-- Global config toggles -->
            <div class="config-item">
              <span class="config-label">画笔粗细 (Stroke Width):</span>
              <div class="flex items-center gap-2 flex-1 justify-end">
                <el-slider v-model="globalSettings.strokeWidth" :min="1" :max="6" :step="0.5" style="width: 120px;" @change="applyGlobalConfig" />
                <span class="font-mono w-8 text-right">{{ globalSettings.strokeWidth }}px</span>
              </div>
            </div>

            <div class="config-item">
              <span class="config-label">动画时长 (Duration):</span>
              <div class="flex items-center gap-2 flex-1 justify-end">
                <el-slider v-model="globalSettings.animationDuration" :min="200" :max="2500" :step="100" style="width: 120px;" @change="applyGlobalConfig" />
                <span class="font-mono w-14 text-right">{{ globalSettings.animationDuration }}ms</span>
              </div>
            </div>

            <div class="config-item">
              <span class="config-label">边缘内衬 (Padding):</span>
              <div class="flex items-center gap-2 flex-1 justify-end">
                <el-slider v-model="globalSettings.padding" :min="0" :max="15" :step="1" style="width: 120px;" @change="applyGlobalConfig" />
                <span class="font-mono w-8 text-right">{{ globalSettings.padding }}px</span>
              </div>
            </div>

            <div class="config-item">
              <span class="config-label">笔画重绘迭代次数 (Iterations):</span>
              <div class="flex items-center gap-2 flex-1 justify-end">
                <el-slider v-model="globalSettings.iterations" :min="1" :max="4" :step="1" style="width: 120px;" @change="applyGlobalConfig" />
                <span class="font-mono w-8 text-right">{{ globalSettings.iterations }}次</span>
              </div>
            </div>

            <el-divider class="my-2" />

            <!-- Highlight Colors presets -->
            <div class="config-item-column">
              <span class="config-label mb-2 block font-bold">标注颜色方案配给:</span>
              <div class="color-rows flex flex-col gap-2">
                <div v-for="colorConfig in colorSettings" :key="colorConfig.key" class="color-row flex justify-between items-center">
                  <span>{{ colorConfig.label }}:</span>
                  <div class="flex items-center gap-2">
                    <el-color-picker v-model="colorConfig.color" size="small" @change="applyGlobalConfig" />
                    <span class="font-mono">{{ colorConfig.color }}</span>
                  </div>
                </div>
              </div>
            </div>

            <el-divider class="my-2" />

            <!-- Global Action Triggers -->
            <div class="action-triggers" v-if="!isHoverMode">
              <span class="config-label mb-2 block">手动播放控制器:</span>
              <div class="flex flex-col gap-2">
                <el-button type="primary" class="w-full" @click="playSimultaneously">
                  ✨ 同时播放全部标注 (Simultaneous)
                </el-button>
                <el-button type="success" class="w-full" @click="playSequentially">
                  ⏳ 链式顺序播放标注 (Sequential)
                </el-button>
                <el-button type="danger" plain class="w-full" @click="hideAllAnnotations">
                  ❌ 清空隐藏所有标注 (Clear)
                </el-button>
              </div>
            </div>
            
            <div class="hover-mode-tip text-xxs text-secondary leading-relaxed p-3 border border-dashed border-color rounded" v-else>
              💡 <strong>已开启鼠标悬浮触发模式：</strong><br />
              请将鼠标移动到左侧文章的彩色虚线字词上，手绘标注会自动绘制渲染；鼠标移开后，标注线段会自动擦除隐藏。
            </div>
          </div>
        </el-card>

        <!-- Use Cases & Tech Card -->
        <el-card shadow="hover" class="rough-tech-card">
          <template #header>
            <div class="font-bold">📚 Rough Notation 核心技术解析</div>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2">Rough Notation 是基于 <code>rough.js</code> 开发的针对网页排版标注的高级包装库：</p>
            <ul class="tech-spec-list mb-3">
              <li><strong>草图感 SVG 画笔</strong>: 标注并不是普通的 CSS 样式，而是在目标 DOM 元素后方或前方动态创建了一个独立的 SVG 节点，通过粗糙画笔算法渲染出手绘的笔迹线。</li>
              <li><strong>精准边界计算</strong>: 渲染前，库会自动获取目标文字的 <code>getBoundingClientRect()</code>，计算其宽度、高度和行高，从而保证 SVG 完美的包裹范围。</li>
              <li><strong>多行文本折行适配</strong>: 针对跨行段落，<code>rough-notation</code> 支持对同一个元素分割渲染多组 SVG 线段，避免了传统标注工具折行失效的问题。</li>
              <li><strong>响应式视口更新</strong>: 视口宽度变化（Resize）时，由于 DOM 的绝对坐标可能发生变化，需要将原标注进行注销，重新计算排版物理边界再进行渲染。</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { annotate, annotationGroup } from 'rough-notation'
import type { RoughAnnotation, RoughAnnotationConfig } from 'rough-notation/lib/model'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// ==========================================
// 1. 交互与配置参数状态
// ==========================================
// 触发模式：false 表示手动按钮触发，true 表示鼠标悬浮（hover）自动触发
const isHoverMode = ref(false)

// 全局标注绘制属性配置，用于传给 rough-notation 引擎
const globalSettings = reactive({
  strokeWidth: 2,         // 矢量线条画笔粗细（单位：像素）
  animationDuration: 800, // 线条书写绘制动效的持续时间（单位：毫秒）
  padding: 5,             // 标注线框与文字内容的边缘内衬距离
  iterations: 2           // 笔画重绘迭代次数。值越大，手绘重叠交叉感越强，显得更“粗糙拟真”
})

// 六种标注样式对应的专属颜色配置，默认配置了一套高对比度的和谐色彩
const colorSettings = ref([
  { key: 'underline', label: '下划线颜色', color: '#6366f1' }, // Indigo Indigo
  { key: 'box', label: '线框颜色', color: '#10b981' }, // Emerald Emerald
  { key: 'circle', label: '圆圈颜色', color: '#f59e0b' }, // Amber Amber
  { key: 'highlight', label: '背景荧光色', color: '#fef08a' }, // Soft Yellow
  { key: 'strikeThrough', label: '删除线颜色', color: '#ef4444' }, // Red Red
  { key: 'crossedOff', label: '打叉粗线颜色', color: '#ec4899' } // Pink Pink
])

// 沙盒自定义输入框绑定的测试文本
const sandboxText = ref('')
// 沙盒标注类型选择器状态，默认为画圈标注
const sandboxStyle = ref<'underline' | 'box' | 'circle' | 'highlight' | 'strike-through' | 'crossed-off'>('circle')

// ==========================================
// 2. 标注引擎实例缓存
// ==========================================
// 缓存页面中所有文章目标文字的 RoughAnnotation 实例映射表
let annotations: Record<string, RoughAnnotation> = {}
// 关联整个文章标注实例的联动组对象（用于同时控制多项动画）
let annotationGrp: any = null
// 沙盒组件对应的独立 RoughAnnotation 标注实例
let sandboxAnnotation: RoughAnnotation | null = null

// 配置：文章内各 DOM 节点的 ID，映射到对应的标注类型及颜色键值
const annotationTargets = [
  { id: 'note-title', type: 'box', colorKey: 'box' },
  { id: 'note-cesium', type: 'circle', colorKey: 'circle' },
  { id: 'note-sig', type: 'underline', colorKey: 'underline' },
  { id: 'note-pressure', type: 'underline', colorKey: 'underline' },
  { id: 'note-hand', type: 'highlight', colorKey: 'highlight' },
  { id: 'note-strike', type: 'strike-through', colorKey: 'strikeThrough' },
  { id: 'note-crossed', type: 'crossed-off', colorKey: 'crossedOff' },
  { id: 'note-circle', type: 'circle', colorKey: 'circle' }
]

// ==========================================
// 3. 生命周期函数与重绘自适应监听
// ==========================================
onMounted(async () => {
  // 必须使用 nextTick 等待 Vue 模板完成初次 DOM 渲染与排版布局
  // 因为 Rough Notation 依赖底层 getBoundingClientRect() 计算物理尺寸与相对定位，若 DOM 未就绪将计算出零坐标导致排版错误！
  await nextTick()
  initAllAnnotations()
  initSandboxAnnotation()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  destroyAllAnnotations()
})

/**
 * 为什么视口尺寸改变 (Resize) 时必须重新构建所有标注？
 * 1. Rough Notation 本质上是通过绝对定位，在目标文本周围或底下贴上一层透明的 SVG 矢量画布节点。
 * 2. 当浏览器宽度改变、滚动条隐现或发生页面排版流动时，文字的目标 DOM 位置（Top, Left）和换行高度会随之改变。
 * 3. 此时如果不重新获取坐标计算，SVG 覆盖物仍保留在原处，就会产生可怕的“标注偏离、错位、脱节”现象。
 * 4. 解决方案：Resize 时，将所有标注实例注销（即从 DOM 中完全移除 SVG），并在 nextTick 中重新测算坐标重建。
 */
const handleResize = () => {
  rebuildAnnotations()
}

// ==========================================
// 4. 标注生成、销毁与重构核心算法
// ==========================================
const initAllAnnotations = () => {
  // 安全保障：在创建前先清理上一次残留的旧实例
  destroyAllAnnotations()

  const list: RoughAnnotation[] = []
  
  // 循环配置项，实例化每个标注
  annotationTargets.forEach(target => {
    const el = document.getElementById(target.id)
    if (!el) return

    // 匹配关联的颜色值配置
    const colorConfig = colorSettings.value.find(c => c.key === target.colorKey)
    const color = colorConfig ? colorConfig.color : '#e11d48'

    const config: RoughAnnotationConfig = {
      type: target.type as any,
      color: color,
      strokeWidth: globalSettings.strokeWidth,
      animationDuration: globalSettings.animationDuration,
      // 💡 特殊逻辑：如果是 highlight（荧光背景高亮），padding 应强制设为 0，否则高亮颜色块会超出字体溢出，显得很不精美；
      // 其他类似线框或圆圈的类型，则需要 padding 来留出一定呼吸感。
      padding: target.type === 'highlight' ? 0 : globalSettings.padding,
      iterations: globalSettings.iterations
    }

    // 调用 rough-notation 的核心方法：创建并挂载 SVG 标注层到 el 节点
    const annotation = annotate(el, config)
    annotations[target.id] = annotation
    list.push(annotation)

    // 如果开启了鼠标悬浮联动模式，需要注册 Hover 事件监听器
    if (isHoverMode.value) {
      el.addEventListener('mouseenter', handleElementEnter)
      el.addEventListener('mouseleave', handleElementLeave)
      el.classList.add('hoverable') // 动态追加 CSS 类，让鼠标指针显示为 pointer 手势
    } else {
      el.classList.remove('hoverable')
    }
  })

  // 使用 annotationGroup 方法将所有的独立标注统一合并为一个关联动画组
  annotationGrp = annotationGroup(list)
}

// 清理所有标注实例并解绑 DOM 事件
const destroyAllAnnotations = () => {
  // 1. 隐藏所有当前渲染在界面上的手绘线条
  hideAllAnnotations()

  // 2. 解除各个元素上绑定的 Hover 事件，避免遗留闭包占用导致垃圾回收失败
  annotationTargets.forEach(target => {
    const el = document.getElementById(target.id)
    if (el) {
      el.removeEventListener('mouseenter', handleElementEnter)
      el.removeEventListener('mouseleave', handleElementLeave)
      el.classList.remove('hoverable')
    }
  })

  annotations = {}
  annotationGrp = null
}

// 重构全部标注对象的方法，常用于滑块更新参数或视口缩放
const rebuildAnnotations = () => {
  destroyAllAnnotations()
  nextTick(() => {
    initAllAnnotations()
    recreateSandboxAnnotation()
  })
}

// ==========================================
// 5. 交互动作响应函数 (Event Handlers)
// ==========================================
// 悬浮移入：开启当前元素的标注绘制动画
const handleElementEnter = (e: Event) => {
  const el = e.currentTarget as HTMLElement
  if (el && annotations[el.id]) {
    annotations[el.id].show()
  }
}

// 悬浮移出：擦除当前元素的标注动画
const handleElementLeave = (e: Event) => {
  const el = e.currentTarget as HTMLElement
  if (el && annotations[el.id]) {
    annotations[el.id].hide()
  }
}

// 切换控制模式（鼠标悬浮触发 VS 手动控制）
const toggleInteractionMode = () => {
  rebuildAnnotations()
  ElMessage.success({
    message: isHoverMode.value ? '已成功切换为：鼠标悬浮自动触发。' : '已成功切换为：手动控制。',
    type: 'success'
  })
}

// 颜色或数值参数改变后，应用新配置
const applyGlobalConfig = () => {
  rebuildAnnotations()
}

// ==========================================
// 6. 手动播放动效流程控制 (Manual Controls)
// ==========================================
// 同时播放组内的全部标注，所有手绘线条将并行绘制
const playSimultaneously = () => {
  if (annotationGrp) {
    annotationGrp.show()
  }
}

/**
 * 链式顺序顺序播放标注 (Sequential Chain Rendering):
 * 1. 首先调用 hideAllAnnotations() 清空场上原有的所有线条状态。
 * 2. 获取所有的标注实例 key 序列。
 * 3. 维护一个累计的延迟毫秒值 `delay`，按照 `globalSettings.animationDuration * 0.75` 进行非完全重合的延迟排布。
 * 4. 使用 setTimeout 将各自的 `.show()` 方法注册到事件循环队列中，实现一个丝滑的、自上而下的视觉阅读引导流。
 */
const playSequentially = () => {
  hideAllAnnotations()
  
  const keys = Object.keys(annotations)
  let delay = 0
  
  keys.forEach((key) => {
    setTimeout(() => {
      // 确认当前组件仍未被卸载才执行显示，防止异步定时器触发时组件已被销毁导致 Null Pointer Error
      if (annotations[key]) {
        annotations[key].show()
      }
    }, delay)
    // 以动画时长的 75% 作为错峰推进的重叠间隔，视觉效果最自然
    delay += globalSettings.animationDuration * 0.75
  })
}

// 隐藏并擦除所有标注线
const hideAllAnnotations = () => {
  Object.values(annotations).forEach(ann => {
    ann.hide()
  })
}

// ==========================================
// 7. 自定义沙盒操作逻辑
// ==========================================
// 初始化沙盒标注
const initSandboxAnnotation = () => {
  if (sandboxAnnotation) {
    sandboxAnnotation.remove() // 调用 remove() 彻底把生成的 SVG 从 DOM 结构中移除
    sandboxAnnotation = null
  }

  const el = document.getElementById('sandbox-target')
  if (!el) return

  const colorConfig = colorSettings.value.find(c => c.key === 'circle')
  const color = colorConfig ? colorConfig.color : '#f59e0b'

  sandboxAnnotation = annotate(el, {
    type: sandboxStyle.value as any,
    color: color,
    strokeWidth: globalSettings.strokeWidth,
    animationDuration: globalSettings.animationDuration,
    padding: sandboxStyle.value === 'highlight' ? 0 : globalSettings.padding,
    iterations: globalSettings.iterations
  })
}

// 重建沙盒标注（用于修改样式或打字时自适应重新描点）
const recreateSandboxAnnotation = () => {
  if (sandboxAnnotation) {
    sandboxAnnotation.remove()
  }
  nextTick(() => {
    const el = document.getElementById('sandbox-target')
    if (!el) return
    
    // 建立下拉类型与颜色库的键映射映射表
    const styleKeyMap: Record<string, string> = {
      'underline': 'underline',
      'box': 'box',
      'circle': 'circle',
      'highlight': 'highlight',
      'strike-through': 'strikeThrough',
      'crossed-off': 'crossedOff'
    }
    const mappedKey = styleKeyMap[sandboxStyle.value] || 'circle'
    const colorConfig = colorSettings.value.find(c => c.key === mappedKey)
    const color = colorConfig ? colorConfig.color : '#10b981'

    sandboxAnnotation = annotate(el, {
      type: sandboxStyle.value as any,
      color: color,
      strokeWidth: globalSettings.strokeWidth,
      animationDuration: globalSettings.animationDuration,
      padding: sandboxStyle.value === 'highlight' ? 0 : globalSettings.padding,
      iterations: globalSettings.iterations
    })
    
    // 自适应更改后自动激活绘制
    sandboxAnnotation.show()
  })
}

// 手动运行沙盒手绘动画
const showSandboxAnnotation = () => {
  if (sandboxAnnotation) {
    sandboxAnnotation.show()
  }
}

// 隐藏沙盒手绘图层
const hideSandboxAnnotation = () => {
  if (sandboxAnnotation) {
    sandboxAnnotation.hide()
  }
}

// 展示用代码片段
const roughNotationSnippet = `// 引入 rough-notation 标注引擎
import { annotate, annotationGroup } from 'rough-notation'

// 1. 获取目标 DOM 并定义标注选项
const el = document.getElementById('note-cesium')
const annotation = annotate(el, {
  type: 'circle',              // 标注样式: circle / box / underline / highlight 等
  color: '#f59e0b',            // 矢量手绘颜色
  strokeWidth: 2,              // 笔画粗细
  padding: 5,                  // 文字内衬距离
  animationDuration: 800,      // 动效书写耗时 (ms)
  iterations: 2                // 画笔重复绘制次数
})

// 2. 动效播放
annotation.show()

// 3. 动效隐藏
annotation.hide()

// 4. 支持构建链式播放组
const grp = annotationGroup([ann1, ann2, ann3])
grp.show() // 队列中所有标注将按顺序联动书写`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.rough-notation-demo-container {
  padding-bottom: 24px;
}

.header-desc {
  margin-bottom: 20px;
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

// Article styling
.article-wrapper {
  background-color: #ffffff;
  color: #1e293b;
  padding: 35px 40px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  min-height: 380px;

  .article-title {
    color: #0f172a;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .paragraph {
    font-size: 13px;
    line-height: 1.8;
    color: #334155;
    margin-bottom: 14px;
    text-align: justify;
  }
}

// Targets text default visual helpers
.note-target {
  display: inline-block;
  
  &.hoverable {
    cursor: pointer;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.important-text {
  color: #0f172a;
}
.italic-text {
  font-style: italic;
  color: #475569;
}
.color-tag-primary {
  color: $primary-color;
  font-weight: 600;
}
.text-muted {
  color: #94a3b8;
}
.text-warning {
  color: #d97706;
}

// Highlight Blockquote
.highlight-quote {
  background-color: #f8fafc;
  border-left: 4px solid #94a3b8;
  border-radius: 4px;
  font-size: 12.5px;
  line-height: 1.7;
}

// Sandbox UI
.sandbox-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--border-color);
  }
}

.sandbox-preview {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.sandbox-text-instance {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  padding: 4px 8px;
}

// Configuration right card panel
.config-card, .rough-tech-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--border-color);
    padding: 12px 16px;
  }
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .config-label {
    font-weight: 500;
    color: var(--text-primary);
    min-width: 110px;
  }
}

.color-row {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 6px;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.tech-spec-list {
  padding-left: 16px;
  list-style-type: disc;
  
  li {
    margin-bottom: 8px;
    line-height: 1.5;
    
    strong {
      color: var(--text-primary);
    }
  }
}

.hover-mode-tip {
  background-color: rgba(99, 102, 241, 0.04);
}

.border-dashed {
  border-style: dashed;
}
.rounded {
  border-radius: 6px;
}
.p-3 {
  padding: 12px;
}
.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}
.p-4 {
  padding: 16px;
}
.gap-3 {
  gap: 12px;
}
.flex-wrap {
  flex-wrap: wrap;
}
.font-bold {
  font-weight: bold;
}
</style>
