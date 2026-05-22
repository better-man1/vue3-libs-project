<template>
  <div class="element-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Element Plus</el-breadcrumb-item>
      <el-breadcrumb-item>智能表单</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Element Plus 智能表单</h2>
      <p>完整的表单系统演示，包含多种输入控件（输入框、选择器、日期选择器、开关、多选/单选等）以及全面的数据验证逻辑。</p>
    </div>

    <el-row :gutter="20">
      <!-- Form Panel -->
      <el-col :xs="24" :lg="14">
        <DemoCard 
          title="系统注册表单" 
          description="填写以下信息进行表单校验与模拟提交"
          :code="formCode"
        >
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
            class="demo-ruleForm"
            status-icon
          >
            <!-- Username -->
            <el-form-item label="用户账号" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户账号">
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- Password -->
            <el-form-item label="安全密码" prop="password">
              <el-input 
                v-model="formData.password" 
                type="password" 
                placeholder="请输入密码" 
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- Email -->
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
            </el-form-item>

            <!-- User Role -->
            <el-form-item label="用户角色" prop="role">
              <el-select v-model="formData.role" placeholder="请选择角色" class="w-full">
                <el-option label="超级管理员" value="admin" />
                <el-option label="普通开发者" value="developer" />
                <el-option label="外部审计员" value="auditor" />
              </el-select>
            </el-form-item>

            <!-- Date Selection -->
            <el-form-item label="到期日期" prop="expireDate">
              <el-date-picker
                v-model="formData.expireDate"
                type="date"
                placeholder="选择账户到期时间"
                class="w-full"
              />
            </el-form-item>

            <!-- Notifications -->
            <el-form-item label="邮件通知" prop="subscribe">
              <el-switch v-model="formData.subscribe" active-text="允许接收系统邮件" />
            </el-form-item>

            <!-- Hobby -->
            <el-form-item label="技术栈" prop="techStack">
              <el-checkbox-group v-model="formData.techStack">
                <el-checkbox label="Vue 3" name="techStack" />
                <el-checkbox label="Pinia" name="techStack" />
                <el-checkbox label="ECharts" name="techStack" />
                <el-checkbox label="TypeScript" name="techStack" />
              </el-checkbox-group>
            </el-form-item>

            <!-- Remarks -->
            <el-form-item label="备注说明" prop="remarks">
              <el-input v-model="formData.remarks" type="textarea" placeholder="填写其它辅助说明" :rows="3" />
            </el-form-item>

            <!-- Controls -->
            <el-form-item>
              <el-button type="primary" @click="submitForm(formRef)">
                提交注册
              </el-button>
              <el-button @click="resetForm(formRef)">
                清空重置
              </el-button>
            </el-form-item>
          </el-form>
        </DemoCard>
      </el-col>

      <!-- Explanation side panel -->
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="explanation-card">
          <template #header>
            <div class="card-header">
              <span>💡 Element Form 验证核心</span>
            </div>
          </template>
          <div class="explanation-content">
            <h4>1. 数据模型与绑定</h4>
            <p>表单通过 `:model` 绑定数据对象，每个 `el-form-item` 通过 `prop` 指定字段键名，其子输入组件使用 `v-model` 进行双向绑定。</p>
            
            <h4>2. 验证规则设计 (`rules`)</h4>
            <p>通过规则数组配置验证策略，常见的校验属性包括：</p>
            <ul>
              <li>`required: true` (必填标识)</li>
              <li>`trigger: 'blur'` (失焦触发表单验证)</li>
              <li>`min/max` (限制长度)</li>
              <li>`type: 'email'` (邮箱格式校验)</li>
              <li>`validator` (自定义复杂的正则或异步校验函数)</li>
            </ul>

            <h4>3. 手动触发表单验证</h4>
            <p>通过获取 Form 实例引用 `ref`，调用 `formInstance.validate((valid) => { ... })` 方法获取最后的校验结果，安全地拦截非法提交。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

const formRef = ref<FormInstance>()
const formData = reactive({
  username: '',
  password: '',
  email: '',
  role: '',
  expireDate: '',
  subscribe: false,
  techStack: [] as string[],
  remarks: '',
})

const formRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账户用户名', trigger: 'blur' },
    { min: 3, max: 12, message: '账号长度在 3 到 12 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于 6 位数', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
  role: [
    { required: true, message: '请选择用户分配角色', trigger: 'change' },
  ],
  expireDate: [
    { required: true, type: 'date', message: '请设定到期时间', trigger: 'change' },
  ],
  techStack: [
    { type: 'array', required: true, message: '请选择至少一个擅长的技术栈', trigger: 'change' },
  ],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('注册信息提交成功！校验完成。')
      console.log('Form Submit Data:', formData)
    } else {
      ElMessage.error('表单校验未通过，请检查红字提示项！')
      console.log('Error Fields:', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  ElMessage.info('表单重置成功。')
}

const formCode = `<el-form
  ref="formRef"
  :model="formData"
  :rules="formRules"
  label-width="100px"
>
  <el-form-item label="用户账号" prop="username">
    <el-input v-model="formData.username" />
  </el-form-item>
  
  <el-form-item label="安全密码" prop="password">
    <el-input v-model="formData.password" type="password" />
  </el-form-item>

  <el-form-item>
    <el-button type="primary" @click="submitForm(formRef)">提交</el-button>
    <el-button @click="resetForm(formRef)">重置</el-button>
  </el-form-item>
</el-form>

const formRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 12, message: '账号长度在 3-12 位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}`
</script>

<style scoped lang="scss">
.element-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.w-full {
  width: 100% !important;
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

.explanation-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
  
  .explanation-content {
    h4 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      
      &:not(:first-child) {
        margin-top: 20px;
      }
    }
    
    p, ul {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
    
    ul {
      padding-left: 20px;
      margin-top: 8px;
    }
  }
}
</style>
