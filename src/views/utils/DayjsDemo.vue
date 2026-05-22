<template>
  <div class="utils-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工具方法实践</el-breadcrumb-item>
      <el-breadcrumb-item>Day.js 日期处理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Day.js 极简日期时间处理库</h2>
      <p>体验仅有 2KB 大小的 Day.js。通过其丰富的插件机制，可轻松实现日历时间格式化（Format）、时间跨度增减（Add/Subtract）以及人性化的相对模糊时间（Relative Time）换算。</p>
    </div>

    <el-row :gutter="20">
      <!-- Clock and format -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="系统实时时钟与格式化 (Date Clock)"
          description="使用 dayjs() 每秒捕获当前时间，并可通过选择框切换各种业务高频使用的排版格式。"
          :code="clockFormatCode"
        >
          <div class="clock-display mb-4">
            <div class="clock-time">{{ liveTime.format(selectedFormat) }}</div>
            <div class="clock-label">系统当前时钟 (实时刷新)</div>
          </div>

          <div class="format-picker">
            <span class="label mb-2 block">选择时间展示格式:</span>
            <el-select v-model="selectedFormat" class="w-full">
              <el-option label="YYYY-MM-DD HH:mm:ss (标准年-月-日)" value="YYYY-MM-DD HH:mm:ss" />
              <el-option label="YYYY年MM月DD日 HH时mm分ss秒 (中文精细)" value="YYYY年MM月DD日 HH时mm分ss秒 dddd" />
              <el-option label="MMM D, YYYY h:mm A (英文月历)" value="MMM D, YYYY h:mm A" />
              <el-option label="HH:mm:ss.SSS (高精毫秒级)" value="HH:mm:ss.SSS" />
            </el-select>
          </div>
        </DemoCard>
      </el-col>

      <!-- Arithmetic & Calculator -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="日期跨度运算计算器 (Time Arithmetic)"
          description="选定基准日期，快捷增加或扣减不同的时间维度，如计算某项目截至日或保质期。"
          :code="arithmeticCode"
        >
          <div class="calc-box">
            <div class="flex items-center gap-2 mb-4 w-full">
              <span class="label text-nowrap">1. 选择基准日期:</span>
              <el-date-picker 
                v-model="baseDate" 
                type="date" 
                placeholder="选择基准日期" 
                class="flex-1"
                :clearable="false"
              />
            </div>

            <div class="flex gap-2 mb-4 flex-wrap justify-center">
              <el-button-group>
                <el-button type="primary" size="small" @click="adjustTime(1, 'day')">+1 天</el-button>
                <el-button type="primary" size="small" @click="adjustTime(1, 'week')">+1 周</el-button>
                <el-button type="primary" size="small" @click="adjustTime(1, 'month')">+1 月</el-button>
                <el-button type="primary" size="small" @click="adjustTime(1, 'year')">+1 年</el-button>
              </el-button-group>

              <el-button-group>
                <el-button type="danger" size="small" plain @click="adjustTime(-1, 'day')">-1 天</el-button>
                <el-button type="danger" size="small" plain @click="adjustTime(-1, 'week')">-1 周</el-button>
                <el-button type="danger" size="small" plain @click="adjustTime(-1, 'month')">-1 月</el-button>
                <el-button type="danger" size="small" plain @click="adjustTime(-1, 'year')">-1 年</el-button>
              </el-button-group>
            </div>

            <!-- Result -->
            <div class="calc-result-panel">
              <div class="result-row">
                <span class="label text-secondary">当前基准/计算后日期:</span>
                <strong class="text-primary text-base">{{ dayjs(baseDate).format('YYYY年MM月DD日 (dddd)') }}</strong>
              </div>
              <div class="result-row mt-2">
                <span class="label text-secondary">是该年的第几天:</span>
                <span class="text-secondary text-sm">第 <strong>{{ getDayOfYear(baseDate) }}</strong> 天</span>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Relative Time -->
      <el-col :span="24" class="mt-4">
        <DemoCard
          title="人性化相对模糊时间转换 (Relative Time)"
          description="将精确的时刻转换为“3天前”、“刚刚”或“在 2 年内”等更加易读的社交化模糊表达。"
          :code="relativeTimeCode"
        >
          <div class="relative-time-box">
            <el-row :gutter="20" class="items-center">
              <el-col :xs="24" :md="12">
                <div class="mb-4">
                  <span class="label mb-2 block">选择过去的某个发生时间点:</span>
                  <el-date-picker
                    v-model="pastDate"
                    type="datetime"
                    placeholder="选择过去时刻"
                    class="w-full"
                    :clearable="false"
                  />
                </div>
                
                <div class="relative-display">
                  <span class="label text-secondary">转换结果 (fromNow):</span>
                  <div class="result-badge">{{ dayjs(pastDate).fromNow() }}</div>
                </div>
              </el-col>

              <el-col :xs="24" :md="12" class="border-l-desktop">
                <div class="mb-4">
                  <span class="label mb-2 block">选择未来的某个发生时间点:</span>
                  <el-date-picker
                    v-model="futureDate"
                    type="datetime"
                    placeholder="选择未来时刻"
                    class="w-full"
                    :clearable="false"
                  />
                </div>
                
                <div class="relative-display">
                  <span class="label text-secondary">转换结果 (toNow):</span>
                  <div class="result-badge future">{{ dayjs(futureDate).toNow() }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import DemoCard from '@/components/common/DemoCard.vue'

// Extend dayjs relativeTime plugin and set default locale to Chinese
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 1. Clock Format State
const liveTime = ref(dayjs())
const selectedFormat = ref('YYYY-MM-DD HH:mm:ss')
let clockInterval: any = null

// 2. Arithmetic Calculator State
const baseDate = ref(new Date())

// 3. Relative Time State
const pastDate = ref(dayjs().subtract(2, 'hour').subtract(15, 'minute').toDate())
const futureDate = ref(dayjs().add(3, 'day').add(5, 'hour').toDate())

const adjustTime = (amount: number, unit: 'day' | 'week' | 'month' | 'year') => {
  // Add or subtract depending on amount value
  baseDate.value = dayjs(baseDate.value).add(amount, unit).toDate()
}

const getDayOfYear = (date: Date) => {
  const d = dayjs(date)
  const startOfYear = dayjs(d.format('YYYY-01-01'))
  return d.diff(startOfYear, 'day') + 1
}

onMounted(() => {
  // Update clock every second
  clockInterval = setInterval(() => {
    liveTime.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})

const clockFormatCode = `// Day.js: 日期时间格式化
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 设定中文语言环境包
dayjs.locale('zh-cn')

const now = dayjs()
// 格式化输出各种排版结构
now.format('YYYY-MM-DD HH:mm:ss')
now.format('YYYY年MM月DD日 dddd') // 2026年05月20日 星期三`

const arithmeticCode = `// Day.js: 日期加减与差值运算
import dayjs from 'dayjs'

let date = dayjs('2026-05-20')

// 1. 日期相加得到新日期
const nextMonth = date.add(1, 'month')

// 2. 日期扣减得到新日期
const lastWeek = date.subtract(1, 'week')

// 3. 计算时间差 (例: 计算相差多少天)
const diffDays = dayjs('2026-06-01').diff(date, 'day')`

const relativeTimeCode = `// Day.js: 人性化相对时间插件 (.fromNow / .toNow)
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 必须拓展 relativeTime 插件
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 1. 计算过去距离当前的时间差
dayjs('2026-05-20 18:00:00').fromNow() // E.g. "2小时前"

// 2. 计算未来距离当前的时间差
dayjs('2026-05-23 20:00:00').toNow()   // E.g. "3天内"`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.utils-demo-container {
  padding-bottom: 24px;
}

.clock-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  
  .clock-time {
    font-size: 2.2rem;
    font-weight: 800;
    color: $primary-color;
    font-family: 'Outfit', sans-serif;
    letter-spacing: 0.5px;
    text-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    text-align: center;
  }
  
  .clock-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 8px;
  }
}

.format-picker {
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.calc-box {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.calc-result-panel {
  padding: 16px;
  background-color: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  
  .result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    
    .label {
      color: var(--text-secondary);
    }
  }
}

.relative-time-box {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .relative-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }
  
  .result-badge {
    padding: 16px;
    background-color: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.15);
    color: $primary-color;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.2rem;
    text-align: center;
    
    &.future {
      background-color: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.15);
      color: #10b981;
    }
  }
}

// Media Query replacement for desktop-only border line
@media (min-width: 992px) {
  .border-l-desktop {
    border-left: 1px solid var(--border-color);
    padding-left: 30px;
  }
}

.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
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
.mb-2 {
  margin-bottom: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.block {
  display: block;
}
.w-full {
  width: 100%;
}
.flex-wrap {
  flex-wrap: wrap;
}
.text-nowrap {
  white-space: nowrap;
}
.text-sm {
  font-size: 0.85rem;
}
.text-base {
  font-size: 1rem;
}
.text-secondary {
  color: var(--text-secondary);
}
.text-primary {
  color: $primary-color;
}
</style>
