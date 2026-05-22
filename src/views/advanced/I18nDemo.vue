<template>
  <div class="advanced-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>高级功能</el-breadcrumb-item>
      <el-breadcrumb-item>i18n 国际化</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>{{ t('demo.i18nTitle') }}</h2>
      <p>{{ t('demo.i18nDesc') }}</p>
    </div>

    <!-- Toggle Controls -->
    <el-card shadow="hover" class="mb-4 theme-toggle-card">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <span class="text-sm font-semibold flex items-center">
          🌐 {{ t('demo.currentLang') }}:
          <el-tag size="large" class="ml-2 font-bold">{{ locale }}</el-tag>
        </span>
        <el-radio-group v-model="locale" @change="handleLanguageChange" size="default">
          <el-radio-button value="zh-CN">🇨🇳 简体中文 (Chinese)</el-radio-button>
          <el-radio-button value="en-US">🇺🇸 English (US)</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- Profile Form -->
      <el-col :xs="24" :lg="14">
        <DemoCard
          :title="t('demo.profileCard')"
          description="表单包含完整的 Element Plus Rules 校验规则。切换语言时提示语自动进行国际化映射。"
          :code="i18nCode"
        >
          <el-form 
            ref="profileFormRef"
            :model="profileForm" 
            :rules="formRules" 
            label-width="120px" 
            label-position="top"
            class="profile-form"
          >
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item :label="t('demo.username')" prop="username">
                  <el-input v-model="profileForm.username" :placeholder="t('demo.placeholder.username')" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item :label="t('demo.email')" prop="email">
                  <el-input v-model="profileForm.email" :placeholder="t('demo.placeholder.email')" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item :label="t('demo.role')" prop="role">
              <el-select v-model="profileForm.role" :placeholder="t('demo.placeholder.role')" class="w-full">
                <el-option :label="t('demo.roles.developer')" value="developer" />
                <el-option :label="t('demo.roles.designer')" value="designer" />
                <el-option :label="t('demo.roles.manager')" value="manager" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('demo.bio')" prop="bio">
              <el-input 
                v-model="profileForm.bio" 
                type="textarea" 
                :rows="3" 
                :placeholder="t('demo.placeholder.bio')" 
              />
            </el-form-item>

            <el-form-item prop="newsletter">
              <el-checkbox v-model="profileForm.newsletter" :label="t('demo.newsletter')" />
            </el-form-item>

            <div class="flex justify-end gap-2 border-t pt-4">
              <el-button type="info" plain @click="resetForm">{{ t('demo.reset') }}</el-button>
              <el-button type="primary" @click="submitForm">{{ t('demo.submit') }}</el-button>
            </div>
          </el-form>
        </DemoCard>
      </el-col>

      <!-- Localized Dayjs DateTime display -->
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span class="font-bold">📅 {{ t('demo.dateTimeTitle') }}</span>
            </div>
          </template>

          <div class="datetime-display mb-4">
            <div class="time-box p-4 bg-secondary rounded flex-col items-center">
              <span class="text-xs text-secondary mb-1 uppercase tracking-wider">{{ t('demo.timeLabel') }}</span>
              <h2 class="time-text font-mono">{{ currentTimeFormatted }}</h2>
            </div>
          </div>

          <div class="datetime-examples text-sm text-secondary">
            <div class="flex justify-between border-b py-2">
              <span>{{ t('demo.dateLong') }}:</span>
              <strong class="text-primary">{{ longDateFormatted }}</strong>
            </div>
            <div class="flex justify-between py-2">
              <span>{{ t('demo.relativeTime') }} (3 mins ago):</span>
              <strong class="text-primary">{{ relativeTimeFormatted }}</strong>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="info-card mt-4">
          <template #header>
            <div class="card-header">
              <span class="font-bold">📝 i18n 核心策略</span>
            </div>
          </template>
          <div class="card-content text-sm text-secondary">
            <ul>
              <li><strong>Element Plus 兼容</strong>：Vue-i18n 的 Composition API 实例与 Element Plus 的全局 Config Provider 高度配合，使日期、分页等组件自动汉化/英文转换。</li>
              <li><strong>响应式验证</strong>：表单验证规则 <code>formRules</code> 需使用 <code>computed</code> 依赖计算属性包裹，这样当 <code>locale</code> 改变时，表单的验证错误文案才能够自动翻译更新。</li>
              <li><strong>时间包本地化</strong>：Day.js 支持 <code>import 'dayjs/locale/zh-cn'</code> 语言包。切换时调用 <code>dayjs.locale(val.toLowerCase())</code> 可同步进行相对时间翻译。</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import DemoCard from '@/components/common/DemoCard.vue'

// Extend dayjs relativeTime
dayjs.extend(relativeTime)

const { t, locale } = useI18n()

// Profile Form State
const profileFormRef = ref<FormInstance | null>(null)
const profileForm = reactive({
  username: '',
  email: '',
  role: '',
  bio: '',
  newsletter: true
})

// Validation rules using computed to enable responsive locale changes
const formRules = computed(() => {
  return {
    username: [
      { required: true, message: t('demo.validation.usernameReq'), trigger: 'blur' },
      { min: 3, message: t('demo.validation.usernameMin'), trigger: 'blur' }
    ],
    email: [
      { required: true, message: t('demo.validation.emailReq'), trigger: 'blur' },
      { type: 'email', message: t('demo.validation.emailInvalid'), trigger: 'blur' }
    ],
    role: [
      { required: true, message: t('demo.validation.roleReq'), trigger: 'change' }
    ]
  }
})

// Current time updates
const timeTicker = ref<any>(null)
const now = ref(dayjs())

const currentTimeFormatted = computed(() => {
  return now.value.format('HH:mm:ss')
})

const longDateFormatted = computed(() => {
  // Localized date format
  return locale.value === 'zh-CN' 
    ? now.value.format('YYYY年MM月DD日 dddd')
    : now.value.format('dddd, MMMM DD, YYYY')
})

const relativeTimeFormatted = computed(() => {
  // Return the representation of 3 minutes ago
  return now.value.subtract(3, 'minute').fromNow()
})

// Sync Language change to Dayjs locale too
const handleLanguageChange = (lang: any) => {
  const dayjsLocale = lang === 'zh-CN' ? 'zh-cn' : 'en'
  dayjs.locale(dayjsLocale)
}

const submitForm = () => {
  if (!profileFormRef.value) return
  profileFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(t('demo.successMsg'))
    } else {
      ElMessage.error(locale.value === 'zh-CN' ? '请修改表单内的校验错误！' : 'Please resolve validation errors!')
    }
  })
}

const resetForm = () => {
  if (!profileFormRef.value) return
  profileFormRef.value.resetFields()
}

onMounted(() => {
  // Sync dayjs locale on mount
  handleLanguageChange(locale.value)

  // Start time updates
  timeTicker.value = setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  if (timeTicker.value) clearInterval(timeTicker.value)
})

const i18nCode = `// vue-i18n v9.x Composition API 实例与响应式表单配置
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t, locale } = useI18n()

// 切换语言直接修改 locale.value
const toggleLang = (val) => {
  locale.value = val
}

// 核心要点：将 rules 使用 computed 包含，实现切换语言即时刷新校验提示
const formRules = computed(() => ({
  username: [
    { required: true, message: t('validation.usernameReq'), trigger: 'blur' }
  ]
}))`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.advanced-demo-container {
  padding-bottom: 24px;
}

.theme-toggle-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(4px);
}

.info-card {
  .card-header {
    font-weight: 600;
  }
}

.datetime-display {
  .time-box {
    display: flex;
    justify-content: center;
    background-color: var(--bg-color-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    
    .time-text {
      font-size: 2.5rem;
      margin: 0;
      color: $primary-color;
      letter-spacing: 1px;
    }
  }
}

.datetime-examples {
  .border-b {
    border-bottom: 1px solid var(--border-color);
  }
  
  strong {
    color: var(--text-primary);
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

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.w-full { width: 100%; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-mono { font-family: 'Fira Code', monospace; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.85rem; }
.text-secondary { color: var(--text-secondary); }
.text-primary { color: $primary-color; }
.border-t { border-top: 1px solid var(--border-color); }
.pt-4 { padding-top: 16px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.ml-2 { margin-left: 8px; }
.mb-1 { margin-bottom: 4px; }
.mb-4 { margin-bottom: 16px; }
.flex-wrap { flex-wrap: wrap; }
</style>
