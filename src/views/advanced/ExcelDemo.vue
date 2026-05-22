<template>
  <div class="advanced-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>高级功能</el-breadcrumb-item>
      <el-breadcrumb-item>Excel 导入导出</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>SheetJS (xlsx) 电子表格数据处理</h2>
      <p>学习如何解析本地 Excel 文件并载入 Vue 状态中，支持对表格进行增删改编辑，并支持一键重新生成样式精美的 Excel 工作簿下载。</p>
    </div>

    <el-row :gutter="20">
      <!-- File upload and control panel -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span class="font-bold">📥 导入数据源 (Import Excel)</span>
            </div>
          </template>

          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx, .xls"
            :on-change="handleExcelUpload"
            class="excel-uploader"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽 Excel 文件到此或 <em>点击导入</em>
            </div>
            <template #tip>
              <div class="el-upload__tip text-center">
                仅支持 .xlsx / .xls 格式的表格文件
              </div>
            </template>
          </el-upload>

          <div class="action-buttons mt-4 flex flex-col gap-2">
            <el-button type="success" class="w-full" @click="exportToExcel">
              📤 导出当前表格为 Excel
            </el-button>
            <el-button type="primary" plain class="w-full" @click="loadMockData">
              📂 载入模拟学生成绩单
            </el-button>
            <el-button type="danger" plain class="w-full" @click="clearTable">
              🗑️ 清空当前表格
            </el-button>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <div class="card-header">
              <span class="font-bold">💡 SheetJS 操作要点</span>
            </div>
          </template>
          <div class="card-content text-sm text-secondary">
            <ul>
              <li><strong>导入原理</strong>：使用 <code>FileReader</code> 读取文件为 ArrayBuffer，然后调用 <code>XLSX.read</code> 转换成工作簿对象，并提取第一张 Sheet 转成 JSON。</li>
              <li><strong>导出原理</strong>：使用 <code>XLSX.utils.json_to_sheet</code> 直接由 JSON 数据生成工作表，装载进 workbook 后，使用 <code>XLSX.writeFile</code> 进行本地保存。</li>
              <li>本系统已支持响应式表格，您可以直接在右侧表格中<strong>双击单元格</strong>修改数值。</li>
            </ul>
          </div>
        </el-card>
      </el-col>

      <!-- Table preview and editing -->
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="电子表格编辑器 (Excel Table Editor)"
          description="可在该表中新增、双击编辑或删除行，所有修改会在导出时完全保留。"
          :code="sheetJsCode"
        >
          <div class="table-actions mb-4 flex justify-between">
            <span class="text-secondary text-sm flex items-center">
              表格行数: <el-tag size="small" class="ml-2">{{ tableData.length }} 行</el-tag>
            </span>
            <el-button type="primary" size="small" @click="addNewRow">
              ➕ 添加新行
            </el-button>
          </div>

          <el-table :data="tableData" border style="width: 100%" max-height="450" empty-text="当前无数据，请先导入或点击载入模拟数据">
            <!-- Dynamic Headers based on the keys of the first item -->
            <el-table-column 
              v-for="col in columns" 
              :key="col" 
              :prop="col" 
              :label="col"
            >
              <template #default="scope">
                <!-- Double click or simple input for editing -->
                <el-input 
                  v-model="scope.row[col]" 
                  size="small" 
                  class="edit-input"
                  placeholder="点击输入..."
                />
              </template>
            </el-table-column>

            <!-- Actions column -->
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  size="small" 
                  circle 
                  @click="deleteRow(scope.$index)"
                >🗑️</el-button>
              </template>
            </el-table-column>
          </el-table>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import DemoCard from '@/components/common/DemoCard.vue'

// Table columns and data
const tableData = ref<any[]>([])

// Columns computed dynamically based on the keys in tableData
const columns = computed(() => {
  if (tableData.value.length === 0) return []
  // Get all unique keys from all rows to ensure custom columns are included
  const keysSet = new Set<string>()
  tableData.value.forEach(row => {
    Object.keys(row).forEach(key => keysSet.add(key))
  })
  return Array.from(keysSet)
})

// Initialize mockup students score sheet
const loadMockData = () => {
  tableData.value = [
    { '学号 (ID)': 'S001', '姓名 (Name)': '张小明', '语文 (Chinese)': 92, '数学 (Math)': 98, '英语 (English)': 89, '班级 (Class)': '高一(1)班' },
    { '学号 (ID)': 'S002', '姓名 (Name)': '李红梅', '语文 (Chinese)': 85, '数学 (Math)': 76, '英语 (English)': 95, '班级 (Class)': '高一(2)班' },
    { '学号 (ID)': 'S003', '姓名 (Name)': '王大卫', '语文 (Chinese)': 78, '数学 (Math)': 88, '英语 (English)': 84, '班级 (Class)': '高一(1)班' },
    { '学号 (ID)': 'S004', '姓名 (Name)': '赵若雨', '语文 (Chinese)': 90, '数学 (Math)': 92, '英语 (English)': 91, '班级 (Class)': '高一(3)班' }
  ]
  ElMessage.success('成功载入模拟数据！')
}

// Clear table data
const clearTable = () => {
  tableData.value = []
  ElMessage.warning('表格已清空。')
}

// Handle Excel Upload Parsing
const handleExcelUpload = (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return

  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      // Read Excel workbook
      const workbook = XLSX.read(data, { type: 'array' })
      
      // Get first worksheet name
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert sheet content to JSON
      const parsedData = XLSX.utils.sheet_to_json(worksheet)
      
      if (parsedData.length === 0) {
        ElMessage.warning('导入的 Excel 文件似乎没有数据内容。')
        return
      }

      tableData.value = parsedData
      ElMessage.success(`成功导入 Excel 表格，共加载 ${parsedData.length} 行数据！`)
    } catch (err) {
      ElMessage.error('解析 Excel 文件失败，请确认文件是否受损。')
      console.error(err)
    }
  }

  reader.onerror = () => {
    ElMessage.error('读取本地文件失败。')
  }

  reader.readAsArrayBuffer(rawFile)
}

// Export to Excel sheet
const exportToExcel = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('没有可导出的数据，请先填入或导入数据。')
    return
  }

  try {
    // 1. Create a sheet from json
    const worksheet = XLSX.utils.json_to_sheet(tableData.value)
    
    // 2. Create a workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DataSheet')
    
    // 3. Trigger local download
    XLSX.writeFile(workbook, `playground_export_${Date.now()}.xlsx`)
    ElMessage.success('导出 Excel 文件成功！')
  } catch (err) {
    ElMessage.error('导出 Excel 过程中发生错误。')
    console.error(err)
  }
}

// Add new row logic
const addNewRow = () => {
  // Create a template object based on current columns or predefined keys
  const newRow: any = {}
  if (columns.value.length > 0) {
    columns.value.forEach(col => {
      newRow[col] = ''
    })
  } else {
    // Default columns templates
    newRow['ID'] = ''
    newRow['Name'] = ''
    newRow['Value'] = ''
  }
  tableData.value.push(newRow)
}

// Delete row
const deleteRow = (index: number) => {
  tableData.value.splice(index, 1)
}

// Mock initial data
loadMockData()

const sheetJsCode = `// SheetJS Excel 导入导出核心逻辑
import * as XLSX from 'xlsx'

// 1. 导入数据解析 (ArrayBuffer)
const reader = new FileReader()
reader.onload = (e) => {
  const data = new Uint8Array(e.target.result)
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json(sheet)
  console.log('读取 JSON:', jsonData)
}
reader.readAsArrayBuffer(file)

// 2. 数据表格一键导出
const worksheet = XLSX.utils.json_to_sheet(jsonData)
const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
XLSX.writeFile(workbook, 'export.xlsx')`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.advanced-demo-container {
  padding-bottom: 24px;
}

.excel-uploader {
  :deep(.el-upload-dragger) {
    background-color: var(--bg-color-primary);
    border: 1px dashed var(--border-color);
    padding: 16px;
    
    &:hover {
      border-color: $primary-color;
    }
  }
}

.control-card, .info-card {
  .card-header {
    font-weight: 600;
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

.edit-input {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    background-color: transparent;
    padding: 0;
    
    &:hover, &.is-focus {
      box-shadow: 0 0 0 1px var(--el-input-border-color, var(--border-color)) inset;
      background-color: var(--bg-color-secondary);
      padding: 0 8px;
    }
  }
}

.text-center {
  text-align: center;
}
.ml-2 {
  margin-left: 8px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.gap-2 {
  gap: 8px;
}
.w-full {
  width: 100%;
}
.font-bold {
  font-weight: 700;
}
</style>
