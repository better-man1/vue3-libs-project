<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工程进阶</el-breadcrumb-item>
      <el-breadcrumb-item>VeeValidate + Zod</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>VeeValidate + Zod — TypeScript-first 表单校验</h2>
      <p>以 Zod Schema 为单一数据源，同时推导出 TypeScript 类型与运行时校验规则，彻底告别重复编写校验逻辑的痛苦。</p>
    </div>

    <el-row :gutter="20">
      <!-- Left: Wizard Form -->
      <el-col :xs="24" :lg="15">
        <DemoCard
          title="多步骤向导式表单 (Wizard Form)"
          description="每个步骤拥有独立的 Zod Schema，切换步骤前自动校验当前步骤的所有字段。"
          :code="veeValidateCode"
        >
          <!-- Step progress bar -->
          <el-steps :active="currentStep" finish-status="success" class="mb-6">
            <el-step title="账户信息" />
            <el-step title="个人资料" />
            <el-step title="确认提交" />
          </el-steps>

          <!-- Step 1: Account -->
          <div v-if="currentStep === 0" class="step-content">
            <el-form label-position="top" size="default">
              <el-form-item label="邮箱地址 *" :error="errors.email">
                <el-input v-bind="emailAttrs" v-model="email" placeholder="user@example.com" />
              </el-form-item>
              <el-form-item label="登录密码 *" :error="errors.password">
                <el-input v-bind="passwordAttrs" v-model="password" type="password" placeholder="至少 8 位，含大写与数字" show-password />
              </el-form-item>
              <el-form-item label="确认密码 *" :error="errors.confirmPassword">
                <el-input v-bind="confirmPasswordAttrs" v-model="confirmPassword" type="password" placeholder="请再次输入密码" show-password />
              </el-form-item>
            </el-form>
          </div>

          <!-- Step 2: Profile -->
          <div v-if="currentStep === 1" class="step-content">
            <el-form label-position="top" size="default">
              <el-row :gutter="16">
                <el-col :sm="12">
                  <el-form-item label="用户名 *" :error="errors.username">
                    <el-input v-bind="usernameAttrs" v-model="username" placeholder="仅限字母、数字和下划线" />
                  </el-form-item>
                </el-col>
                <el-col :sm="12">
                  <el-form-item label="年龄 *" :error="String(errors.age || '')">
                    <el-input v-bind="ageAttrs" :model-value="String(ageModel ?? '')" @update:model-value="v => { ageModel = v }" type="number" class="w-full" placeholder="年龄（1-120）" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="个人简介" :error="errors.bio">
                <el-input v-bind="bioAttrs" v-model="bio" type="textarea" :rows="3" placeholder="介绍一下自己（选填，最多 200 字）" />
              </el-form-item>
              <el-form-item label="头像文件（可选）">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :on-change="handleAvatarChange"
                  accept="image/*"
                  :limit="1"
                >
                  <el-button>选择头像图片</el-button>
                  <template #tip>
                    <div class="text-xs text-secondary mt-1">只接受 JPG/PNG 图片，大小不超过 2MB</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>

          <!-- Step 3: Review -->
          <div v-if="currentStep === 2" class="step-content review-step">
            <el-alert type="success" :closable="false" class="mb-4">
              <template #default>
                🎉 所有信息已通过 Zod Schema 校验，可以安全提交！
              </template>
            </el-alert>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="邮箱">{{ email }}</el-descriptions-item>
              <el-descriptions-item label="密码">{{ '●'.repeat((password || '').length) }}</el-descriptions-item>
              <el-descriptions-item label="用户名">{{ username }}</el-descriptions-item>
              <el-descriptions-item label="年龄">{{ ageModel }} 岁</el-descriptions-item>
              <el-descriptions-item label="简介" :span="2">{{ bio || '(未填写)' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- Navigation buttons -->
          <div class="step-footer flex justify-between mt-6">
            <el-button :disabled="currentStep === 0" @click="currentStep--">
              ← 上一步
            </el-button>
            <el-button
              v-if="currentStep < 2"
              type="primary"
              @click="handleNextStep"
            >
              下一步 →
            </el-button>
            <el-button
              v-else
              type="success"
              @click="handleSubmit"
            >
              ✅ 提交注册
            </el-button>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right: Info -->
      <el-col :xs="24" :lg="9">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="font-bold">🔍 Zod Schema 实时推导</span>
          </template>
          <div class="schema-box">
            <p class="text-xs text-secondary mb-2">当前步骤校验 Schema 定义：</p>
            <pre class="code-block"><code>{{ currentSchemaDisplay }}</code></pre>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <span class="font-bold">💡 核心优势对比</span>
          </template>
          <div class="text-sm text-secondary">
            <div class="comparison-row">
              <strong class="label">Element Plus rules</strong>
              <p>需要同时写 TS 类型 + 运行时校验两套规则，维护成本高。</p>
            </div>
            <el-divider />
            <div class="comparison-row">
              <strong class="label green">VeeValidate + Zod ✅</strong>
              <p>只写一次 <code>z.object()</code> Schema，自动推导 TypeScript 类型和运行时规则，单一数据源！</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// ─── Zod Schemas ─────────────────────────────────────────────────────
const step1Schema = z.object({
  email: z.string().email('请输入合法的邮箱地址'),
  password: z.string()
    .min(8, '密码最少 8 位')
    .regex(/[A-Z]/, '必须包含至少一个大写字母')
    .regex(/[0-9]/, '必须包含至少一个数字'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
})

const step2Schema = z.object({
  username: z.string()
    .min(3, '用户名至少 3 位')
    .regex(/^[a-zA-Z0-9_]+$/, '只允许字母、数字和下划线'),
  age: z.coerce.number().min(1).max(120),
  bio: z.string().max(200, '简介不能超过 200 字').optional(),
  avatar: z.any().optional()
})

// ─── Step & Form State ────────────────────────────────────────────────
const currentStep = ref(0)

// ─── Step 1 form ─────────────────────────────────────────────────────
const { errors: step1Errors, defineField: defineStep1Field, validate: validateStep1 } = useForm({
  validationSchema: toTypedSchema(step1Schema)
})

const [email, emailAttrs] = defineStep1Field('email')
const [password, passwordAttrs] = defineStep1Field('password')
const [confirmPassword, confirmPasswordAttrs] = defineStep1Field('confirmPassword')

// ─── Step 2 form ─────────────────────────────────────────────────────
const { errors: step2Errors, defineField: defineStep2Field, validate: validateStep2 } = useForm({
  validationSchema: toTypedSchema(step2Schema)
})

const [username, usernameAttrs] = defineStep2Field('username')
const age = defineStep2Field('age')
const [ageModel, ageAttrs] = age
const [bio, bioAttrs] = defineStep2Field('bio')

// Combined errors for template
const errors = computed(() => ({
  ...step1Errors.value,
  ...step2Errors.value
}))

const handleAvatarChange = (file: any) => {
  const rawFile: File = file.raw
  // Validate: image type and <2MB
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件！')
  } else if (rawFile.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB！')
  } else {
    ElMessage.success('头像文件验证通过 ✅')
  }
}

const handleNextStep = async () => {
  const validateFn = currentStep.value === 0 ? validateStep1 : validateStep2
  const result = await validateFn()
  if (result.valid) {
    currentStep.value++
  } else {
    ElMessage.warning('请修正表单中的错误后再继续')
  }
}

const handleSubmit = () => {
  ElMessage.success('🎊 注册成功！（演示模式，数据未真实提交）')
}

const currentSchemaDisplay = computed(() => {
  if (currentStep.value === 0) {
    return `z.object({
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
  confirmPassword: z.string()
}).refine(d => d.password ===
  d.confirmPassword, {
  path: ['confirmPassword']
})`
  }
  return `z.object({
  username: z.string()
    .min(3)
    .regex(/^[a-zA-Z0-9_]+$/),
  age: z.number()
    .min(1).max(120),
  bio: z.string()
    .max(200).optional(),
})`
})

const veeValidateCode = `// 1. 定义 Zod Schema（单一数据源）
const schema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '最少8位'),
})
// TS 类型自动推导：type FormData = z.infer<typeof schema>

// 2. 在组件中使用
const { errors, defineField, validate } = useForm({
  validationSchema: toTypedSchema(schema),
})

// 3. 绑定字段 (attrs 用于 v-bind 以支持 blur 触发)
const [email, emailAttrs] = defineField('email')

// 4. 模板绑定
// <el-input v-bind="emailAttrs" v-model="email" />
// <span>{{ errors.email }}</span>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.step-content { min-height: 200px; }

.review-step {
  :deep(.el-descriptions__label) { font-weight: 600; }
}

.step-footer { border-top: 1px solid var(--border-color); padding-top: 16px; }

.info-card .font-bold { font-weight: 700; }

.schema-box {
  .code-block {
    background: var(--bg-color-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
    font-family: 'Fira Code', monospace;
    font-size: 0.78rem;
    color: var(--text-secondary);
    overflow-x: auto;
    margin: 0;
  }
}

.comparison-row {
  margin-bottom: 8px;
  .label { display: block; margin-bottom: 4px; &.green { color: #10b981; } }
  p { margin: 0; line-height: 1.5; color: var(--text-secondary); font-size: 0.82rem; }
}

.flex { display: flex; }
.justify-between { justify-content: space-between; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-1 { margin-top: 4px; }
.w-full { width: 100%; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.85rem; }
.text-secondary { color: var(--text-secondary); }
.font-bold { font-weight: 700; }
</style>
