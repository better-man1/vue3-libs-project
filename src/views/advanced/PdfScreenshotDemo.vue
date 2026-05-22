<template>
  <div class="advanced-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>高级功能</el-breadcrumb-item>
      <el-breadcrumb-item>PDF 与网页截图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>html2canvas & jsPDF 网页截图与 PDF 导出</h2>
      <p>学习如何捕获 DOM 元素结构并渲染为 Canvas 图像，支持生成高清晰度的 PNG 图片下载，以及利用比例运算导出标准的 A4 矢量 PDF 凭证。</p>
    </div>

    <el-row :gutter="20">
      <!-- Left Column: Interactive Receipt Invoice -->
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="可生成式商务收据 (Interactive Invoice Template)"
          description="点击右侧按钮将此收据的实时 DOM 渲染并打包下载。支持在收据中进行项目增减。"
          :code="pdfExportCode"
        >
          <!-- Receipt Template DOM -->
          <div ref="receiptContainer" class="receipt-paper" id="invoice-capture-node">
            <div class="receipt-header flex justify-between items-start pb-4 border-b">
              <div class="company-brand">
                <div class="logo-circle">🔥</div>
                <h3 class="brand-name">Antigravity Tech Ltd.</h3>
                <p class="brand-sub text-xs">北京市中关村科技园区创新大厦 9 层</p>
              </div>
              <div class="invoice-meta text-right">
                <h2 class="invoice-title">RECEIPT / 发票</h2>
                <div class="meta-row text-sm mt-2">
                  <span class="text-secondary">单号: </span>
                  <span class="font-mono font-bold">INV-2026-0520</span>
                </div>
                <div class="meta-row text-sm">
                  <span class="text-secondary">开票日期: </span>
                  <span class="font-mono">2026-05-20</span>
                </div>
              </div>
            </div>

            <div class="receipt-billing flex justify-between mt-4">
              <div class="billing-section">
                <h5 class="section-title text-secondary">开票单位 (ISSUER)</h5>
                <p class="name font-bold">Antigravity 研发部</p>
                <p class="detail text-xs">finance@antigravity.io<br />+86 10-8888-8888</p>
              </div>
              <div class="billing-section text-right">
                <h5 class="section-title text-secondary">付款客户 (CLIENT)</h5>
                <p class="name font-bold">前沿科技学习实验室</p>
                <p class="detail text-xs">study-center@domain.com<br />中国上海浦东新区开发中心</p>
              </div>
            </div>

            <!-- Items list -->
            <table class="receipt-table mt-4 w-full">
              <thead>
                <tr>
                  <th class="text-left">服务项目 (Item Description)</th>
                  <th class="text-right" width="80">单价</th>
                  <th class="text-center" width="60">数量</th>
                  <th class="text-right" width="100">金额</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in invoiceItems" :key="idx">
                  <td class="text-left">
                    <span class="font-semibold">{{ item.title }}</span>
                    <p class="desc text-xs text-secondary">{{ item.desc }}</p>
                  </td>
                  <td class="text-right font-mono">￥{{ item.price.toFixed(2) }}</td>
                  <td class="text-center font-mono">{{ item.count }}</td>
                  <td class="text-right font-mono font-bold">￥{{ (item.price * item.count).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Summary -->
            <div class="receipt-summary flex justify-end mt-4">
              <div class="summary-box text-right w-1/2">
                <div class="summary-row flex justify-between text-sm py-1">
                  <span class="text-secondary">小计 (Subtotal):</span>
                  <span class="font-mono">￥{{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-row flex justify-between text-sm py-1">
                  <span class="text-secondary">增值税 (VAT 6%):</span>
                  <span class="font-mono">￥{{ tax.toFixed(2) }}</span>
                </div>
                <div class="summary-row flex justify-between border-t pt-2 mt-2 font-bold text-lg">
                  <span>应付总额 (Total Due):</span>
                  <span class="text-primary font-mono">￥{{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Seal / Footer -->
            <div class="receipt-footer flex justify-between items-end mt-6 pt-4 border-t">
              <div class="notice text-xs text-secondary w-2/3">
                <h6 class="notice-title font-bold mb-1">📋 备注声明 / Notice</h6>
                <p>本凭证由前端高级功能模块自动生成。所有交易条目均经核实，请妥善保管作为报销及资产认证凭证。</p>
              </div>
              <div class="official-seal text-center flex-col items-center">
                <div class="seal-visual">财务专用章</div>
                <span class="text-xs text-secondary mt-1">财务核算室</span>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right Column: Settings and actions -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span class="font-bold">⚙️ 票据数据调整</span>
            </div>
          </template>

          <div class="invoice-editor">
            <span class="label mb-2 block">1. 快捷增减收据内容:</span>
            <div class="items-editor mb-4">
              <div v-for="(item, idx) in invoiceItems" :key="idx" class="editor-row flex items-center gap-2 mb-2">
                <el-input v-model="item.title" size="small" placeholder="项目名称" class="flex-1" />
                <el-input-number v-model="item.count" :min="1" :max="10" size="small" controls-position="right" class="w-20" />
                <el-button type="danger" size="small" circle @click="removeItem(idx)">🗑️</el-button>
              </div>
              <el-button type="primary" plain size="small" class="w-full mt-2" @click="addItem">
                ➕ 增加收费服务项目
              </el-button>
            </div>

            <el-divider />

            <span class="label mb-2 block">2. 生成与下载文件:</span>
            <div class="flex flex-col gap-2">
              <el-button type="primary" class="w-full py-4" :loading="isExportingPdf" @click="exportToPdf">
                📄 导出 A4 规格 PDF 文档
              </el-button>
              <el-button type="warning" class="w-full py-4" :loading="isExportingPng" @click="exportToPng">
                🖼️ 导出高清 PNG 网页截图
              </el-button>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <div class="card-header">
              <span class="font-bold">📝 排版技巧分享</span>
            </div>
          </template>
          <div class="card-content text-sm text-secondary">
            <ul>
              <li><strong>文字清晰度</strong>：使用 <code>html2canvas</code> 时需配置 <code>scale: 2</code> (双倍视网膜像素比)，可大幅改善 PDF 内字体的锯齿感。</li>
              <li><strong>防溢出剪裁</strong>：为了使得 PDF 排版居中，我们需要将 DOM 的物理宽高转换为 PDF 的毫米 (mm) 单位，进行完美的比例拉伸。</li>
              <li><strong>跨域图片</strong>：如果 DOM 中引用了外链图片，请设置 <code>useCORS: true</code> 以防止 Canvas 受到图片安全沙箱阻断。</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import DemoCard from '@/components/common/DemoCard.vue'

// Invoice items reactive state
const invoiceItems = ref([
  { title: 'Vue 3 + Vite 企业级架构咨询', desc: '包含 monorepo 拆分、路由拆包与 CI/CD 服务', price: 4200, count: 1 },
  { title: 'Three.js 智慧园区 3D 模型定制', desc: '包含 3D 球体、粒子波动与大气辉光着色器特效', price: 8500, count: 1 },
  { title: 'D3.js 力导向关系网络引擎开发', desc: '实现 1000 节点量级拓扑力学拖拽防抖锁定', price: 3600, count: 2 },
  { title: '前端专家团队季度技术内训服务', desc: '包含高级状态管理、内存管理及渲染瓶颈调优', price: 12000, count: 1 }
])

const subtotal = computed(() => {
  return invoiceItems.value.reduce((acc, curr) => acc + (curr.price * curr.count), 0)
})

const tax = computed(() => {
  return subtotal.value * 0.06 // 6% VAT Tax
})

const totalAmount = computed(() => {
  return subtotal.value + tax.value
})

const addItem = () => {
  invoiceItems.value.push({
    title: '新增技术咨询服务',
    desc: '按需追加的技术支持与架构指导',
    price: 3000,
    count: 1
  })
}

const removeItem = (idx: number) => {
  if (invoiceItems.value.length <= 1) {
    ElMessage.warning('收据上至少保留一个服务项目！')
    return
  }
  invoiceItems.value.splice(idx, 1)
}

// Export states
const receiptContainer = ref<HTMLElement | null>(null)
const isExportingPdf = ref(false)
const isExportingPng = ref(false)

// Action 1: Export as PNG screenshot
const exportToPng = async () => {
  if (!receiptContainer.value) return
  isExportingPng.value = true
  ElMessage.info('正在截取票据画面，请稍后...')

  try {
    const canvas = await html2canvas(receiptContainer.value, {
      scale: 2, // High resolution
      useCORS: true, // Cross-origin image support
      backgroundColor: '#ffffff' // White background for printing
    })

    const imgData = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `invoice_${Date.now()}.png`
    link.href = imgData
    link.click()

    ElMessage.success('高清票据 PNG 截图下载成功！')
  } catch (err) {
    ElMessage.error('网页截图生成失败，请重试！')
    console.error(err)
  } finally {
    isExportingPng.value = false
  }
}

// Action 2: Export as A4 PDF Document
const exportToPdf = async () => {
  if (!receiptContainer.value) return
  isExportingPdf.value = true
  ElMessage.info('正在编译生成 A4 PDF 凭证，请稍后...')

  try {
    const canvas = await html2canvas(receiptContainer.value, {
      scale: 2.5, // Even higher scale for printing
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    
    // A4 specs in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add extra pages if overflowing (highly robust multi-page handler)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`invoice_report_${Date.now()}.pdf`)
    ElMessage.success('票据 PDF 矢量文件下载成功！')
  } catch (err) {
    ElMessage.error('PDF 文件编译失败，请重试。')
    console.error(err)
  } finally {
    isExportingPdf.value = false
  }
}

const pdfExportCode = `// html2canvas + jsPDF 页面元素导出为 PDF 文件
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const exportPDF = async (element) => {
  // 1. 将 DOM 渲染为 Canvas ( scale: 2 解决模糊问题)
  const canvas = await html2canvas(element, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')

  // 2. 初始化 A4 尺寸的 jsPDF 实例 (纵向, 毫米单位)
  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgWidth = 210 // A4 横向宽度 (mm)
  const pageHeight = 297 // A4 纵向高度 (mm)
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  
  // 3. 将 Canvas 绘图画入 PDF 文档
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  
  // 4. 保存下载
  pdf.save('invoice.pdf')
}`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.advanced-demo-container {
  padding-bottom: 24px;
}

// Receipt paper styling (Looks like a real high-end printed invoice)
.receipt-paper {
  background-color: #ffffff;
  color: #1e293b;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  
  .receipt-header {
    border-bottom: 2px solid #f1f5f9;
  }

  .company-brand {
    .logo-circle {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, $primary-color, #ec4899);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #ffffff;
      margin-bottom: 8px;
    }
    
    .brand-name {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }
    
    .brand-sub {
      color: #64748b;
      margin: 2px 0 0 0;
    }
  }

  .invoice-meta {
    .invoice-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    
    .meta-row {
      margin-top: 4px;
    }
  }

  .receipt-billing {
    .billing-section {
      width: 45%;
      
      .section-title {
        margin: 0 0 6px 0;
        font-size: 0.72rem;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      
      .name {
        margin: 0 0 4px 0;
        font-size: 0.95rem;
        color: #0f172a;
      }
      
      .detail {
        margin: 0;
        color: #64748b;
        line-height: 1.4;
      }
    }
  }

  // Styled Table
  .receipt-table {
    border-collapse: collapse;
    margin-top: 24px;
    
    th {
      background-color: #f8fafc;
      color: #475569;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 10px 12px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      color: #334155;
      font-size: 0.88rem;
      
      .font-semibold {
        font-weight: 600;
        color: #0f172a;
      }
      
      .desc {
        color: #64748b;
        margin: 2px 0 0 0;
      }
    }
  }

  .receipt-summary {
    .summary-box {
      border-radius: 8px;
      background-color: #f8fafc;
      padding: 16px;
      border: 1px solid #f1f5f9;
    }
    
    .summary-row {
      color: #334155;
    }
  }

  .receipt-footer {
    border-top: 2px dashed #e2e8f0;
    
    .notice {
      .notice-title {
        color: #0f172a;
      }
      p {
        margin: 0;
        line-height: 1.5;
        color: #64748b;
      }
    }
    
    .official-seal {
      position: relative;
      width: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .seal-visual {
        width: 90px;
        height: 90px;
        border: 3px double #ef4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ef4444;
        font-size: 0.78rem;
        font-weight: 800;
        text-align: center;
        line-height: 1.3;
        transform: rotate(-10deg);
        user-select: none;
        box-shadow: inset 0 0 0 1px #ef4444;
        
        &::after {
          content: "★";
          position: absolute;
          top: 22px;
          color: #ef4444;
          font-size: 1.1rem;
        }
      }
    }
  }
}

.control-card, .info-card {
  .card-header {
    font-weight: 600;
  }
  
  .label {
    font-size: 0.82rem;
    color: var(--text-secondary);
  }
}

.info-card {
  ul {
    padding-left: 18px;
    margin: 8px 0 0 0;
    line-height: 1.5;
    
    li {
      margin-bottom: 8px;
    }
  }
}

.editor-row {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.flex-col {
  flex-direction: column;
}
.w-20 {
  width: 90px;
}
.w-1\/2 {
  width: 50%;
}
.w-2\/3 {
  width: 66.666%;
}
.w-full {
  width: 100%;
}
.py-4 {
  padding-top: 16px;
  padding-bottom: 16px;
}
.py-1 {
  padding-top: 4px;
  padding-bottom: 4px;
}
.pt-2 {
  padding-top: 8px;
}
.pt-4 {
  padding-top: 16px;
}
.pb-4 {
  padding-bottom: 16px;
}
.border-b {
  border-bottom: 1px solid var(--border-color);
}
.border-t {
  border-top: 1px solid var(--border-color);
}
.font-semibold {
  font-weight: 600;
}
.text-lg {
  font-size: 1.1rem;
}
.text-xs {
  font-size: 0.75rem;
}
.text-sm {
  font-size: 0.85rem;
}
.text-right {
  text-align: right;
}
.text-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.text-primary {
  color: $primary-color;
}
.text-secondary {
  color: #64748b;
}
.font-bold {
  font-weight: 700;
}
.font-mono {
  font-family: 'Fira Code', monospace;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-start {
  align-items: flex-start;
}
.items-end {
  align-items: flex-end;
}
.justify-end {
  justify-content: flex-end;
}
.justify-between {
  justify-content: space-between;
}
.gap-2 {
  gap: 8px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-4 {
  margin-top: 16px;
}
.mt-6 {
  margin-top: 24px;
}
.mb-1 {
  margin-bottom: 4px;
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
.flex {
  display: flex;
}
</style>
