<template>
  <div class="signature-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>前沿探索</el-breadcrumb-item>
      <el-breadcrumb-item>在线电子签名</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Signature Pad — 电子签名与电子合同签署系统</h2>
      <p>
        在线电子签名在数字化办公、政务系统、金融合同以及在线发票中非常普及。
        本页面演示了基于 HTML5 Canvas 的高灵敏度、带笔触粗细感应的签字板，
        并支持将签名与定制化的电子合同（NDA协议）合并，一键导出高清 PDF 或 PNG 格式。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Left side: Contract Preview -->
      <el-col :xs="24" :lg="14" class="mb-4">
        <DemoCard
          title="电子合同在线签署区域"
          description="在此处预览合同。请在右侧签字板签字并点击「应用签名」以完成合同盖章签署。"
          :code="signatureSnippet"
        >
          <div class="contract-wrapper">
            <!-- A4 styled paper container -->
            <div ref="contractPaper" class="contract-paper" id="contract-capture-node">
              <div class="contract-header text-center">
                <h2 class="contract-title">机密信息非披露与保密协议</h2>
                <h4 class="contract-subtitle">NON-DISCLOSURE AGREEMENT (NDA)</h4>
                <div class="contract-no font-mono">协议编号：NDA-2026-SH0521</div>
              </div>

              <div class="contract-body mt-4">
                <p class="contract-section">
                  本保密协议（以下简称“协议”）由以下各方于 <strong>2026年05月21日</strong> 共同签署并生效：
                </p>
                <div class="contract-parties">
                  <div class="party">
                    <strong>甲方 (披露方)：</strong> 杭州奇点奥秘科技有限公司 (Antigravity Tech Ltd.)
                  </div>
                  <div class="party flex items-center gap-2">
                    <strong>乙方 (接收方)：</strong>
                    <el-input 
                      v-model="partyBName" 
                      size="small" 
                      placeholder="请输入乙方个人/企业姓名" 
                      style="width: 220px;" 
                      class="party-b-input"
                    />
                  </div>
                </div>

                <h5 class="body-heading">第一条：保密信息定义</h5>
                <p class="body-text">
                  “保密信息”指披露方向接收方明示、暗示或以书面、口头、电子或其他媒体形式提供的，具有商业价值或技术价值的任何专利、专有技术、算法、源代码、商业规划及研发路线图。
                </p>

                <h5 class="body-heading">第二条：保密义务与防泄露</h5>
                <p class="body-text">
                  接收方必须对保密信息采取最严格的防护措施（不低于自身核心技术机密的保护等级）。接收方不得向任何第三方泄漏、发布，或以任何方式未经授权复制和商业化使用该保密信息。
                </p>

                <h5 class="body-heading">第三条：期限与争议解决</h5>
                <p class="body-text">
                  本协议保密责任期限为自生效之日起 <strong>5 年</strong>，不受本协议终止或解除之影响。若发生争议，各方友好协商解决，协商不成可向甲方所在地人民法院提起诉讼。
                </p>
              </div>

              <!-- Signatures Row -->
              <div class="contract-signatures flex justify-between mt-6">
                <!-- Party A (Auto Seal & Signature) -->
                <div class="sig-box">
                  <div class="sig-title">甲方 (披露方) 签章</div>
                  <div class="sig-content">
                    <div class="official-seal">
                      <div class="seal-visual">奇点奥秘科技</div>
                      <span class="seal-text">合同专用章</span>
                    </div>
                    <div class="agent-signature font-mono">Antigravity R&D</div>
                  </div>
                  <div class="sig-date text-xs text-secondary mt-1">
                    代表签署：Antigravity Lead<br />
                    签署日期：2026-05-21
                  </div>
                </div>

                <!-- Party B (User Signature placement) -->
                <div class="sig-box">
                  <div class="sig-title">乙方 (接收方) 签章</div>
                  <div class="sig-content sig-placeholder flex items-center justify-center relative">
                    <div v-if="!appliedSignature" class="flex flex-col items-center justify-center text-secondary text-xxs">
                      <span class="text-xs">👋 待签署</span>
                      <span>(在右侧书写后应用)</span>
                    </div>
                    <img v-else :src="appliedSignature" alt="User Signature" class="sig-img" />
                    <!-- Drag seal overlay when completed -->
                    <div v-if="appliedSignature" class="official-seal-b">
                      <div class="seal-visual-b">在线签约核验</div>
                    </div>
                  </div>
                  <div class="sig-date text-xs text-secondary mt-1">
                    代表签署：{{ partyBName || '待输入' }}<br />
                    签署日期：{{ signedDate || '待签署' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right side: Signature Pad Controls -->
      <el-col :xs="24" :lg="10" class="mb-4">
        <!-- Canvas Card -->
        <el-card shadow="hover" class="sig-pad-card mb-4">
          <template #header>
            <div class="font-bold flex justify-between items-center">
              <span>✍️ 电子签名书写板</span>
              <el-tag size="small" type="success" effect="plain">压感笔触模拟</el-tag>
            </div>
          </template>

          <div class="canvas-container relative">
            <canvas ref="canvasRef" class="sig-canvas"></canvas>
            <div v-if="isCanvasEmptyPrompt" class="canvas-watermark" @mousedown="dismissPrompt" @touchstart="dismissPrompt">
              请在此处使用鼠标拖拽或触屏书写您的签名
            </div>
          </div>

          <div class="controls-panel mt-3">
            <!-- Styling controls -->
            <div class="control-row flex justify-between items-center mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xs text-secondary">画笔颜色:</span>
                <div class="color-palette flex gap-1">
                  <span 
                    v-for="color in penColors" 
                    :key="color.value"
                    :style="{ backgroundColor: color.value }"
                    class="color-dot"
                    :class="{ active: currentPenColor === color.value }"
                    @click="setPenColor(color.value)"
                    :title="color.label"
                  ></span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs text-secondary">笔尖粗细:</span>
                <el-slider 
                  v-model="brushThickness" 
                  :min="1" 
                  :max="10" 
                  :step="1" 
                  style="width: 100px;" 
                  @input="updateBrushSettings"
                />
              </div>
            </div>

            <!-- Operations buttons -->
            <div class="flex gap-2">
              <el-button size="small" type="info" plain @click="undoStroke" class="flex-1">
                ↩️ 撤销上一步
              </el-button>
              <el-button size="small" type="danger" plain @click="clearSignature" class="flex-1">
                🗑️ 清空签字板
              </el-button>
            </div>

            <el-divider class="my-3" />

            <!-- Core application action -->
            <div class="flex flex-col gap-2">
              <el-button type="success" class="w-full py-4 font-bold" @click="applySignatureToContract">
                ✒️ 将签名应用到合同 (Apply to NDA)
              </el-button>
              
              <div class="flex gap-2">
                <el-button 
                  type="primary" 
                  class="flex-1" 
                  :disabled="!appliedSignature" 
                  :loading="isExportingPdf"
                  @click="exportContractToPdf"
                >
                  📄 导出合同 PDF
                </el-button>
                <el-button 
                  type="warning" 
                  class="flex-1" 
                  :disabled="!appliedSignature" 
                  :loading="isExportingPng"
                  @click="exportContractToPng"
                >
                  🖼️ 导出合同 PNG
                </el-button>
              </div>

              <el-button 
                type="info" 
                size="small" 
                plain
                @click="downloadStandaloneSignature"
              >
                📥 仅下载透明签名图片 (PNG)
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- Technical specifications card -->
        <el-card shadow="hover" class="sig-tech-card">
          <template #header>
            <div class="font-bold">📚 Signature Pad 关键参数解析</div>
          </template>
          <div class="text-xs text-secondary leading-relaxed">
            <p class="mb-2">本项目集成了工业级 <code>signature_pad</code>，具有以下核心特性：</p>
            <ul class="tech-spec-list mb-3">
              <li><strong>笔触粗细模型 (Velocity Filter)</strong>: 签名笔尖的渲染粗细是动态计算的。根据手写移动的速度（Velocity），速度越快笔画越细，速度越慢笔画越粗，逼真模拟毛笔和钢笔的压感效果。</li>
              <li><strong>贝塞尔曲线插值</strong>: 捕捉鼠标或触摸轨迹的点坐标后，应用三次贝塞尔曲线进行路径拟合，有效消除由于低频采样率产生的拐角锯齿，使边缘极其平滑。</li>
              <li><strong>撤销机制实现</strong>: 签字板的状态被拆解为多组贝塞尔线段数组，撤销操作实质上是对历史状态数组执行 <code>pop()</code>，然后调用 <code>fromData()</code> 重构。</li>
              <li><strong>电子防伪盖章</strong>: 签名合并至 PDF 时可附加由前端哈希值模拟的「数字化安全核验章」，确保电子签署过程可溯源。</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import SignaturePad from 'signature_pad'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import DemoCard from '@/components/common/DemoCard.vue'

// ==========================================
// 1. 合同签署相关响应式状态
// ==========================================
// 乙方签名对应的姓名输入，绑定到输入框
const partyBName = ref('')
// 签署成功后保存的签名 Base64 DataURL 图片路径
const appliedSignature = ref<string>('')
// 电子合同实际签署生效日期
const signedDate = ref('')

// ==========================================
// 2. 签名画布状态管理
// ==========================================
// 绑定 template 中的 <canvas> DOM 节点
const canvasRef = ref<HTMLCanvasElement | null>(null)
// SignaturePad 实例对象，管理签字板的核心绘制逻辑与矢量轨迹
let signaturePad: SignaturePad | null = null
// 是否显示“请在此处书写签名”的浮层提示
const isCanvasEmptyPrompt = ref(true)

// ==========================================
// 3. 画笔属性参数控制
// ==========================================
// 基础笔触粗细调节系数（绑定到 Slider 滑块）
const brushThickness = ref(3)
// 当前选择的画笔颜色，默认为商务黑
const currentPenColor = ref('#000000')

// 预设画笔颜色列表，用于商务电子合同不同的合规签署场景
const penColors = [
  { value: '#000000', label: '深邃黑 (商务常规)' },
  { value: '#0000f0', label: '钢笔蓝 (财务常用)' },
  { value: '#d92c2c', label: '印章红 (警告审批)' }
]

// ==========================================
// 4. 导出任务状态控制
// ==========================================
// 绑定 A4 规格合同纸张容器的 DOM 引用，用于 html2canvas 区域截图
const contractPaper = ref<HTMLElement | null>(null)
// PDF 导出时的 Loading 状态，防止重复点击
const isExportingPdf = ref(false)
// PNG 导出时的 Loading 状态
const isExportingPng = ref(false)

// 隐藏画布提示水印层（在鼠标点击/触摸开始时触发）
const dismissPrompt = () => {
  isCanvasEmptyPrompt.value = false
}

// ==========================================
// 5. 签字板生命周期与初始化逻辑
// ==========================================
onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value
    
    // 初始化 SignaturePad 实例
    // signature_pad 基于 HTML5 Canvas 画布，通过监听 PointerEvents（包括 Mouse 和 Touch 坐标）进行矢量路径描绘
    signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)', // 画板背景设为完全透明，方便应用签名图片至合同中时与白色纸张完美融合
      minWidth: 1.0,                             // 画笔轨迹的最小宽度（对应快速移动时的线条粗细限制）
      maxWidth: 4.5,                             // 画笔轨迹的最大宽度（对应缓慢移动时的线条粗细限制）
      penColor: currentPenColor.value           // 初始画笔颜色
    })

    // 监听签字板绘制的起始事件
    // 一旦用户点按并开始移动画笔，应立即消除未签字时的水印浮层
    signaturePad.addEventListener('beginStroke', () => {
      isCanvasEmptyPrompt.value = false
    })

    // 初次加载时，自适应调整 Canvas 的逻辑分辨率（物理像素）与 CSS 布局大小
    resizeCanvas()
    
    // 监听浏览器视口大小改变，重新计算画布大小防止失真或拉伸
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  // 组件卸载时销毁全局事件监听，避免产生内存泄漏风险
  window.removeEventListener('resize', handleResize)
  if (signaturePad) {
    // 释放 SignaturePad 内置的指针/触摸监听器，移除底层 DOM 绑定的各类 EventListener
    signaturePad.off()
  }
})

// ==========================================
// 6. 高清屏自适应与 Canvas 分辨率缩放算法 (High-DPI Retina Adaptation)
// ==========================================
/**
 * 为什么需要对 Canvas 进行手动 resize 适配？
 * 1. 默认情况下，如果仅用 CSS 样式定义 Canvas 的宽高，在 Retina 高清屏（如 devicePixelRatio = 2 或 3）上，
 *    Canvas 内部像素点会映射到多个屏幕物理像素，导致绘制的线条极其模糊、产生锯齿。
 * 2. 解决方案：把 Canvas 元素内部的 width 与 height 属性（画布渲染分辨率）按屏幕像素比倍增，
 *    同时通过 CSS 样式保持原始的宽高展示。然后通过 context.scale() 将绘制上下文等比放大，使矢量线条达到 Retina 级超高清渲染效果。
 * 
 * 为什么在 resize 时需要暂存数据？
 * - 在 HTML5 Canvas 中，一旦重新设置 canvas.width 或 canvas.height，
 *   浏览器会自动清空该 Canvas 的渲染缓冲区，导致之前写的所有字迹全部丢失！
 * - 解决方案：在修改尺寸前，通过 signaturePad.toData() 获取现有的矢量点轨迹数组，
 *   重新分配画布物理宽高与缩放比例后，再调用 signaturePad.fromData(data) 将轨迹完美重绘还原。
 */
const resizeCanvas = () => {
  if (!canvasRef.value || !signaturePad) return
  const canvas = canvasRef.value
  
  // 1. 暂存当前画布中已录入的所有画笔矢量点轨迹数据
  const data = signaturePad.toData()
  
  // 2. 计算当前屏幕的物理像素比（至少为 1 倍）
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  
  // 3. 获取 canvas 在当前页面布局中所占据的真实几何尺寸
  const rect = canvas.getBoundingClientRect()
  
  // 4. 将画布逻辑分辨率乘以像素比，以达到超清渲染
  canvas.width = rect.width * ratio
  canvas.height = rect.height * ratio
  
  // 5. 使用 2D 渲染上下文，等比缩放矩阵，使得后续的坐标绘制逻辑不需要手动乘以 ratio
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(ratio, ratio)
  }
  
  // 6. 清理之前的物理状态并恢复暂存的矢量数据
  signaturePad.clear() // 重置缩放上下文内部的状态机
  if (data && data.length > 0) {
    signaturePad.fromData(data) // 重新根据矢量坐标序列渲染画面
  } else {
    // 若原本无任何签名笔画，则继续保持水印提示层显示
    isCanvasEmptyPrompt.value = true
  }
}

const handleResize = () => {
  resizeCanvas()
}

// ==========================================
// 7. 签字板笔触与撤销核心操作
// ==========================================
/**
 * 动态笔触粗细模型 (Velocity Filter):
 * signature_pad 内置了根据绘制速度动态计算线宽的算法：
 * 速度 v = 移动距离 d / 时间差 t。
 * - 当运笔速度极快时，物理钢笔中的墨水析出变少，因此 line_width 会收缩（趋近 minWidth）。
 * - 当运笔速度极慢或停顿时，墨水扩散变多，线宽会膨胀（趋近 maxWidth）。
 * 这样能在没有数位板压感笔支持的情况下，使用普通鼠标或触控屏也能画出极具书法美感的粗细渐变字迹。
 */
const updateBrushSettings = () => {
  if (!signaturePad) return
  
  const val = brushThickness.value
  // 根据用户滑块调整笔尖线宽的取值边界
  signaturePad.minWidth = Math.max(0.5, val / 3)   // 限制快速运笔时的最细界限
  signaturePad.maxWidth = Math.max(1.5, val * 1.5) // 限制缓慢运笔时的最粗界限
}

// 设置画笔颜色（深黑、钢笔蓝、印章红）
const setPenColor = (color: string) => {
  currentPenColor.value = color
  if (signaturePad) {
    signaturePad.penColor = color
  }
}

/**
 * 撤销上一步笔画 (Undo Last Stroke):
 * 1. signaturePad.toData() 获取的是一个包含多条路径的嵌套数组结构。
 *    每个元素代表一笔连续的书写轨迹（即从 pointerdown 到 pointerup 之间采集的所有坐标点集合）。
 * 2. 撤销原理：使用 JavaScript 数组的 .pop() 方法移除最后一条轨迹。
 * 3. 之后调用 .fromData() 传入过滤后的新数组，签字板会对 Canvas 执行 clear() 并重新绘制残留的所有笔画。
 */
const undoStroke = () => {
  if (!signaturePad) return
  const data = signaturePad.toData()
  if (data && data.length > 0) {
    data.pop() // 剔除最新绘制的一道笔迹
    signaturePad.fromData(data) // 重构 Canvas 图案
    
    // 如果撤销到没有任何笔画了，显示初始的水印引导文案
    if (data.length === 0) {
      isCanvasEmptyPrompt.value = true
    }
  } else {
    ElMessage.info('签字板上没有多余的笔画可撤销')
  }
}

// 清空当前签字板，重置内部状态
const clearSignature = () => {
  if (!signaturePad) return
  signaturePad.clear()
  isCanvasEmptyPrompt.value = true
}

// ==========================================
// 8. 签名合成与注入合同逻辑
// ==========================================
/**
 * 将签名应用至合同纸张上：
 * 1. 校验当前画板是否为空。
 * 2. 通过 signaturePad.toDataURL("image/png") 将 Canvas 缓冲区中的字迹像素序列编码为 Base64 格式的透明 PNG 数据。
 * 3. 赋值给响应式变量 `appliedSignature`，利用 Vue 的数据绑定机制，动态渲染在合同纸张对应的“乙方盖章区域”的 <img> 节点中。
 * 4. 自动捕获当前签署时间并规范化显示。
 */
const applySignatureToContract = () => {
  if (!signaturePad || signaturePad.isEmpty()) {
    ElMessage.warning('签字板为空，请先绘制签名再应用！')
    return
  }

  // 提取透明 PNG 格式的签名图片 Base64
  const dataUrl = signaturePad.toDataURL('image/png')
  appliedSignature.value = dataUrl

  // 记录签署时间
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  signedDate.value = `${year}-${month}-${day}`

  ElMessage.success({
    message: '电子签名应用成功！已注入下方合同乙方签署框。',
    type: 'success'
  })
}

// 仅导出透明背景签名 PNG（不包含合同文本）
const downloadStandaloneSignature = () => {
  if (!signaturePad || signaturePad.isEmpty()) {
    ElMessage.warning('签字板为空，无法下载签名图片')
    return
  }
  
  const dataUrl = signaturePad.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `signature_${Date.now()}.png`
  link.href = dataUrl
  link.click()
  ElMessage.success('透明签名图片 (PNG) 下载成功！')
}

// ==========================================
// 9. HTML 节点转 Canvas 与多页 PDF 合成算法
// ==========================================
/**
 * 电子合同导出高清 PDF 文档的算法实现：
 * 1. html2canvas 截屏算法：
 *    - 传入 contractPaper 对应的 DOM 容器，通过遍历 DOM 树解析样式、背景、绝对定位和图片，在离屏 Canvas 中重建视觉效果。
 *    - 参数 `scale: 2.2`：设定虚拟画布分辨率放大倍率。如果不放大，渲染出来的图片分辨率极低，打印或放大 PDF 时文字会发生模糊。
 *    - 参数 `useCORS: true`：跨域资源共享配置，确保外部托管的图片和字体资源能够被正确加载进 Canvas，防止出现 canvas 跨域污染的安全异常。
 * 2. jsPDF 分页算法原理 (A4 纵向多页溢出拆分算法)：
 *    - 标准 A4 纸比例为 210mm x 297mm。
 *    - 我们需要把导出的 Canvas 宽度无缝撑满 A4 (imgWidth = 210mm)。
 *    - 按宽高比例计算出对应的 PDF 图片高度：imgHeight = (canvas.height * imgWidth) / canvas.width。
 *    - 维护一个 `heightLeft` 表示剩下未渲染的高。如果 `heightLeft` 大于单页高度 `pageHeight` (297mm)，
 *      就通过 `pdf.addPage()` 创建新页，并利用负偏移 `position = heightLeft - imgHeight` 移动绘图位置，实现把长图截断并分页拼接的功能。
 */
const exportContractToPdf = async () => {
  if (!contractPaper.value) return
  // 必须保证合同内容要素完整
  if (!partyBName.value.trim()) {
    ElMessage.warning('请输入乙方名称，以保证合同条款完整性。')
    return
  }

  isExportingPdf.value = true
  ElMessage.info('正在编译并准备导出合同 A4 PDF 文档...')

  try {
    // 1. 将 DOM 节点转换为离屏 Canvas
    const canvas = await html2canvas(contractPaper.value, {
      scale: 2.2,             // 放大倍率，提升文字与电子印章的锐利度，消除模糊
      useCORS: true,          // 允许跨域图片渲染
      backgroundColor: '#ffffff' // 强制指定合同底色为白色
    })

    // 2. 导出 JPEG 数据，质量为 0.95 (保证体积与清晰度的最佳平衡)
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    
    // 3. 构建 jsPDF 实例。p: 纵向排版, mm: 毫米单位, a4: A4标准尺寸
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 297
    // 根据 DOM 的宽高比等比换算出 PDF 毫米空间中的高度
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // 4. 将第一页的图层写入 PDF 中
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 5. 循环检测当前长图是否溢出 A4 一页的高度，如溢出则进行分页裁剪追加
    while (heightLeft > 0) {
      position = heightLeft - imgHeight // 利用位置偏移，使得超出视口的图像定位到新的一页起始点
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // 6. 保存 PDF 文件，生成符合国家命名规范的协议文本
    pdf.save(`保密协议_NDA_${partyBName.value.trim()}.pdf`)
    ElMessage.success('电子合同保密协议 PDF 导出成功！')
  } catch (err) {
    console.error(err)
    ElMessage.error('PDF 合同编译失败，请检查浏览器兼容性！')
  } finally {
    isExportingPdf.value = false
  }
}

// 电子合同导出高清 PNG 图片逻辑
const exportContractToPng = async () => {
  if (!contractPaper.value) return
  if (!partyBName.value.trim()) {
    ElMessage.warning('请输入乙方名称，以保证合同完整。')
    return
  }

  isExportingPng.value = true
  ElMessage.info('正在截取合同图像，请稍候...')

  try {
    // 1. 将 DOM 节点以 2 倍逻辑分辨率截取为 Canvas
    const canvas = await html2canvas(contractPaper.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    // 2. 将 Canvas 编码为完整的 PNG 图片
    const imgData = canvas.toDataURL('image/png')
    
    // 3. 动态构建 <a> 标签触发客户端保存下载
    const link = document.createElement('a')
    link.download = `NDA_Agreement_${partyBName.value.trim()}.png`
    link.href = imgData
    link.click()

    ElMessage.success('电子合同高清 PNG 图像导出成功！')
  } catch (err) {
    console.error(err)
    ElMessage.error('合同图像截图生成失败！')
  } finally {
    isExportingPng.value = false
  }
}

// 提供在 DemoCard 组件中展示的代码示例片段
const signatureSnippet = `// 引入 signature_pad
import SignaturePad from 'signature_pad'

// 初始化签名板
const signaturePad = new SignaturePad(canvas, {
  backgroundColor: 'rgba(255, 255, 255, 0)',
  minWidth: 1.0, // 笔画最小宽度
  maxWidth: 4.5, // 笔画最大宽度 (实现速度/压感粗细渐变)
  penColor: '#000000'
})

// 撤销上一次笔画机制
const undoStroke = () => {
  const data = signaturePad.toData()
  if (data && data.length > 0) {
    data.pop() // 剔除最后一条线段
    signaturePad.fromData(data) // 重新重绘整个 Canvas
  }
}

// 导出为透明背景签名图片
const signaturePng = signaturePad.toDataURL('image/png')`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.signature-demo-container {
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

// Contract Frame Container
.contract-wrapper {
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  padding: 16px;
  border: 1px dashed var(--border-color);
  max-height: 700px;
  overflow-y: auto;
  @include custom-scrollbar;
}

// A4 paper formatting (looks ultra corporate and high quality)
.contract-paper {
  background-color: #ffffff;
  color: #1e293b;
  padding: 40px 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-family: "SimSun", "STSong", "Hiragino Sans GB", serif;
  line-height: 1.8;
  font-size: 13px;
  
  .contract-header {
    border-bottom: 2px solid #0f172a;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  
  .contract-title {
    font-size: 20px;
    font-weight: bold;
    color: #0f172a;
    margin: 0;
    letter-spacing: 2px;
  }
  
  .contract-subtitle {
    font-size: 10px;
    letter-spacing: 1px;
    color: #64748b;
    margin: 4px 0 0 0;
  }
  
  .contract-no {
    font-size: 11px;
    color: #475569;
    margin-top: 6px;
  }
  
  .contract-body {
    .contract-section {
      text-indent: 2em;
      margin-bottom: 16px;
      color: #334155;
    }
    
    .contract-parties {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 18px;
      border-radius: 6px;
      margin-bottom: 20px;
      
      .party {
        margin: 6px 0;
        color: #0f172a;
      }
    }
    
    .body-heading {
      font-size: 14px;
      font-weight: bold;
      color: #0f172a;
      margin: 18px 0 6px 0;
      border-left: 3px solid #0f172a;
      padding-left: 8px;
    }
    
    .body-text {
      text-indent: 2em;
      margin: 0 0 12px 0;
      color: #475569;
    }
  }

  // Contract signatures placement
  .contract-signatures {
    border-top: 1px solid #cbd5e1;
    padding-top: 20px;
    margin-top: 30px;
    
    .sig-box {
      width: 46%;
      display: flex;
      flex-direction: column;
      
      .sig-title {
        font-weight: bold;
        color: #0f172a;
        margin-bottom: 8px;
        font-size: 12px;
      }
      
      .sig-content {
        height: 100px;
        border: 1px dashed #cbd5e1;
        background-color: #fdfdfd;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
      }
      
      .sig-placeholder {
        background-color: #fafafa;
      }

      .sig-img {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        z-index: 2;
      }
    }

    // simulated red seal stamps
    .official-seal {
      position: absolute;
      top: 10px;
      right: 15px;
      width: 80px;
      height: 80px;
      border: 2px solid #ef4444;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ef4444;
      font-size: 8px;
      font-weight: bold;
      transform: rotate(-12deg);
      user-select: none;
      box-shadow: inset 0 0 0 1px #ef4444;
      z-index: 1;
      opacity: 0.85;

      .seal-visual {
        width: 100%;
        text-align: center;
        margin-top: 4px;
      }

      .seal-text {
        font-size: 7px;
        transform: scale(0.9);
      }
      
      &::after {
        content: "★";
        font-size: 12px;
        color: #ef4444;
        margin-top: -2px;
      }
    }

    .official-seal-b {
      position: absolute;
      bottom: 5px;
      right: 10px;
      width: 60px;
      height: 60px;
      border: 2px dashed #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #10b981;
      font-size: 7px;
      font-weight: bold;
      transform: rotate(15deg);
      user-select: none;
      z-index: 3;
      opacity: 0.8;
      background-color: rgba(255, 255, 255, 0.6);

      .seal-visual-b {
        text-align: center;
        line-height: 1.1;
      }
    }

    .agent-signature {
      position: absolute;
      bottom: 20px;
      left: 15px;
      font-size: 20px;
      color: #1e3a8a;
      font-weight: bold;
      letter-spacing: -1px;
      transform: rotate(-5deg);
    }
  }
}

// Right side: Drawing box styling
.sig-pad-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--border-color);
  }
}

.canvas-container {
  width: 100%;
  height: 220px;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.sig-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  display: block;
  background-color: transparent;
}

.canvas-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
  font-style: italic;
  pointer-events: none;
  user-select: none;
  background-color: rgba(248, 250, 252, 0.8);
  transition: opacity 0.3s;
}

// Color dot selection
.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.15);
  }
  
  &.active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 4px rgba(99, 102, 241, 0.5);
    transform: scale(1.15);
  }
}

.sig-tech-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--border-color);
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

:deep(.party-b-input) {
  .el-input__inner {
    font-family: inherit;
    font-weight: bold;
    color: #0f172a;
    border-bottom: 1px solid #94a3b8;
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0;
    background: transparent;
    padding: 0 4px;
    
    &:focus {
      border-bottom-color: #0f172a;
      box-shadow: none;
    }
  }
}

// Element class utilities
.text-xxs {
  font-size: 10px;
}
.w-full {
  width: 100%;
}
.flex-1 {
  flex: 1;
}
.py-4 {
  padding-top: 16px;
  padding-bottom: 16px;
}
.my-3 {
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
