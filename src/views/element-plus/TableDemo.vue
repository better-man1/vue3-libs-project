<template>
  <div class="element-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Element Plus</el-breadcrumb-item>
      <el-breadcrumb-item>高级表格</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Element Plus 高级表格</h2>
      <p>常用的复杂表格示例，包括列排序、筛选过滤、自定义单元格插槽、多选控制、子项详情展开以及底部分页器集成。</p>
    </div>

    <!-- Actions & Table -->
    <DemoCard 
      title="用户管理列表" 
      description="支持多列操作、批量导出，并且包含自定义的标签渲染样式"
      :code="tableCode"
    >
      <div class="table-actions mb-3">
        <div class="left-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名/邮箱..."
            clearable
            :prefix-icon="Search"
            class="search-input"
            @clear="handleSearch"
          />
        </div>
        <div class="right-actions">
          <el-button 
            type="danger" 
            :disabled="multipleSelection.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ multipleSelection.length }})
          </el-button>
        </div>
      </div>

      <!-- Data Table -->
      <el-table
        :data="paginatedData"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <!-- Selection -->
        <el-table-column type="selection" width="55" />
        
        <!-- Expand details -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="expanded-detail-box">
              <p><strong>账号详细备注:</strong> {{ props.row.remarks || '无备注信息。' }}</p>
              <p><strong>注册IP地址:</strong> {{ props.row.ipAddress }}</p>
              <p><strong>最近登录设备:</strong> {{ props.row.device }}</p>
            </div>
          </template>
        </el-table-column>

        <!-- ID (Sortable) -->
        <el-table-column label="ID" prop="id" width="80" sortable />

        <!-- User profile -->
        <el-table-column label="用户姓名" width="160">
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="28" :src="scope.row.avatar" />
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- Email -->
        <el-table-column label="电子邮箱" prop="email" />

        <!-- Status -->
        <el-table-column label="账户状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Date -->
        <el-table-column label="创建时间" prop="createdAt" width="180" />

        <!-- Actions -->
        <el-table-column label="操作行为" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 15]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
        />
      </div>
    </DemoCard>

    <!-- Dialog for Editing -->
    <el-dialog v-model="editDialogVisible" title="修改用户信息" width="500px">
      <el-form :model="editingRow" label-width="80px">
        <el-form-item label="用户姓名">
          <el-input v-model="editingRow.name" />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="editingRow.email" />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="editingRow.status" placeholder="状态选择">
            <el-option label="正常" value="正常" />
            <el-option label="禁用" value="禁用" />
            <el-option label="未激活" value="未激活" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">
            确认保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

interface UserItem {
  id: number
  name: string
  avatar: string
  email: string
  status: '正常' | '禁用' | '未激活'
  createdAt: string
  remarks: string
  ipAddress: string
  device: string
}

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const multipleSelection = ref<UserItem[]>([])

const editDialogVisible = ref(false)
const editingRow = ref<UserItem>({
  id: 0,
  name: '',
  avatar: '',
  email: '',
  status: '正常',
  createdAt: '',
  remarks: '',
  ipAddress: '',
  device: '',
})

const tableData = ref<UserItem[]>([
  { id: 1, name: '张伟', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', email: 'zhangwei@example.com', status: '正常', createdAt: '2026-05-01 10:00:23', remarks: '系统超级管理员，负责日常基础设置。', ipAddress: '192.168.1.10', device: 'MacBook Pro' },
  { id: 2, name: '王芳', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec983693f4585371d547284jpeg.jpeg', email: 'wangfang@example.com', status: '正常', createdAt: '2026-05-02 14:32:11', remarks: '核心开发，负责可视化看板渲染部分。', ipAddress: '192.168.1.15', device: 'ThinkPad' },
  { id: 3, name: '李静', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', email: 'lijing@example.com', status: '禁用', createdAt: '2026-05-04 09:12:45', remarks: '前任开发人员，账号因离职禁用。', ipAddress: '10.0.4.12', device: 'iPad Pro' },
  { id: 4, name: '刘洋', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec983693f4585371d547284jpeg.jpeg', email: 'liuyang@example.com', status: '正常', createdAt: '2026-05-05 16:55:02', remarks: '实习生，主要负责测试用例和文档维护。', ipAddress: '192.168.2.14', device: 'Windows Desktop' },
  { id: 5, name: '陈敏', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', email: 'chenmin@example.com', status: '未激活', createdAt: '2026-05-08 11:23:44', remarks: '新注册外部评审账户，尚未邮件激活认证。', ipAddress: '222.12.54.12', device: 'iPhone 15' },
  { id: 6, name: '赵强', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec983693f4585371d547284jpeg.jpeg', email: 'zhaoqiang@example.com', status: '正常', createdAt: '2026-05-10 15:44:12', remarks: '产品经理，负责日常系统功能验收。', ipAddress: '192.168.1.121', device: 'MacBook Air' }
])

const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return tableData.value
  return tableData.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const getStatusType = (status: string) => {
  if (status === '正常') return 'success'
  if (status === '禁用') return 'danger'
  return 'info'
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSelectionChange = (val: UserItem[]) => {
  multipleSelection.value = val
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('您确认要永久删除这名用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    tableData.value = tableData.value.filter((item) => item.id !== id)
    ElMessage.success('用户删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm('您确认要批量删除所选的用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const ids = multipleSelection.value.map(item => item.id)
    tableData.value = tableData.value.filter((item) => !ids.includes(item.id))
    multipleSelection.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleEdit = (row: UserItem) => {
  editingRow.value = { ...row }
  editDialogVisible.value = true
}

const saveEdit = () => {
  const index = tableData.value.findIndex(item => item.id === editingRow.value.id)
  if (index !== -1) {
    tableData.value[index] = { ...editingRow.value }
    editDialogVisible.value = false
    ElMessage.success('用户信息保存成功')
  }
}

const tableCode = `<el-table :data="tableData" @selection-change="handleSelectionChange">
  <el-table-column type="selection" width="55" />
  
  <el-table-column type="expand">
    <template #default="props">
      <div>备注: {{ props.row.remarks }}</div>
    </template>
  </el-table-column>

  <el-table-column label="用户姓名">
    <template #default="scope">
      <div class="user-cell">
        <el-avatar :size="28" :src="scope.row.avatar" />
        <span>{{ scope.row.name }}</span>
      </div>
    </template>
  </el-table-column>

  <el-table-column label="邮箱" prop="email" />
  
  <el-table-column label="状态">
    <template #default="scope">
      <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
    </template>
  </el-table-column>
</el-table>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.element-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 16px;
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

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  
  .search-input {
    width: 260px;
  }
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expanded-detail-box {
  padding: 16px 24px;
  background-color: var(--bg-color-primary);
  border-radius: 6px;
  margin: 8px 16px;
  border-left: 4px solid $primary-color;
  
  p {
    margin: 6px 0;
    font-size: 0.88rem;
    color: var(--text-secondary);
    
    strong {
      color: var(--text-primary);
      margin-right: 8px;
    }
  }
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
