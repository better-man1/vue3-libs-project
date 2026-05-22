<template>
  <div class="vcalendar-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>专业场景集成</el-breadcrumb-item>
      <el-breadcrumb-item>VCalendar 事件日历</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>VCalendar 事件日程与日期选择器</h2>
      <p>
        VCalendar 是一个为 Vue 3 量身定制的精美、高响应式日历和日期选择器组件。
        它支持丰富的装饰属性（如背景高亮、圆点、横条）、气泡提示（Popover）、暗色模式自适应以及灵活的双向绑定。
        在本示例中，我们展示了基于日历的事件日程管理、属性自定义与日期区间选择器的深度联动。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Left: Interactive Calendar & Date Picker -->
      <el-col :lg="14" :md="24">
        <!-- Calendar Card -->
        <DemoCard
          title="多功能事件日历"
          description="支持展示自定义日程，包括背景块高亮、下部圆点、下部细线和悬浮详情卡。双击或点击日期可对该日日程进行快速新建。"
          :code="demoCode"
        >
          <div class="calendar-wrapper">
            <Calendar
              :color="calendarColor"
              :is-dark="appStore.isDark"
              :first-day-of-week="firstDayOfWeek"
              :attributes="attributes as any"
              expanded
              borderless
              @dayclick="onDayClick"
              class="custom-calendar"
            />
          </div>
        </DemoCard>

        <!-- Date Range Picker Card -->
        <el-card class="picker-card" shadow="hover" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>📅 DatePicker 日期范围与时间选择</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :sm="14" :xs="24">
              <div class="datepicker-container">
                <DatePicker
                  v-model="range"
                  is-range
                  :color="calendarColor"
                  :is-dark="appStore.isDark"
                  :first-day-of-week="firstDayOfWeek"
                  expanded
                  borderless
                />
              </div>
            </el-col>
            <el-col :sm="10" :xs="24">
              <div class="range-info">
                <h4>已选择的时间区间</h4>
                <div class="info-block">
                  <div class="label">开始日期</div>
                  <div class="value">{{ range && range.start ? formatDate(range.start) : '未选择' }}</div>
                </div>
                <div class="info-block">
                  <div class="label">结束日期</div>
                  <div class="value">{{ range && range.end ? formatDate(range.end) : '未选择' }}</div>
                </div>
                <div class="info-block">
                  <div class="label">间隔天数</div>
                  <div class="value count">{{ daysDifference }} 天</div>
                </div>
                <el-button 
                  type="primary" 
                  :disabled="!range || !range.start || !range.end" 
                  style="width: 100%; margin-top: 16px"
                  @click="bookSchedule"
                >
                  🚀 确认预约区间
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- Right: Configurations and Event Manager -->
      <el-col :lg="10" :md="24">
        <!-- Configurations Panel -->
        <el-card class="config-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>⚙️ 日历外观与个性化设置</span>
            </div>
          </template>
          <div class="config-options">
            <el-form label-position="top">
              <el-form-item label="主色调配置 (color)">
                <el-radio-group v-model="calendarColor" size="small">
                  <el-radio-button value="indigo">Indigo</el-radio-button>
                  <el-radio-button value="blue">Blue</el-radio-button>
                  <el-radio-button value="teal">Teal</el-radio-button>
                  <el-radio-button value="green">Green</el-radio-button>
                  <el-radio-button value="red">Red</el-radio-button>
                  <el-radio-button value="orange">Orange</el-radio-button>
                  <el-radio-button value="purple">Purple</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="首周起始日">
                    <el-select v-model="firstDayOfWeek" size="small">
                      <el-option label="星期日" :value="1" />
                      <el-option label="星期一" :value="2" />
                      <el-option label="星期六" :value="7" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="当前主题模式">
                    <el-tag :type="appStore.isDark ? 'info' : 'success'" style="width: 100%; text-align: center;">
                      {{ appStore.isDark ? '🌙 暗色模式 (自适应)' : '☀️ 亮色模式 (自适应)' }}
                    </el-tag>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-card>

        <!-- Manage / Add Events Panel -->
        <el-card class="event-manager-card" shadow="hover" style="margin-top: 20px">
          <template #header>
            <div class="card-header justify-between">
              <span>📝 日程管理</span>
              <el-button type="primary" size="small" @click="showAddDialog(new Date())">
                ➕ 新建日程
              </el-button>
            </div>
          </template>

          <!-- Current Selected Day Events -->
          <div class="selected-day-section">
            <div class="section-title">
              📍 点击选中的日期: <span class="selected-date-txt">{{ formatDate(selectedDate) }}</span>
            </div>
            <div v-if="selectedDayEvents.length === 0" class="no-events-tip">
              该日期暂无日程安排，点击上方「新建日程」在此处添加。
            </div>
            <div v-else class="event-mini-list">
              <div 
                v-for="event in selectedDayEvents" 
                :key="event.id" 
                class="event-mini-item"
                :style="{ borderLeftColor: getColorHex(event.color) }"
              >
                <div class="item-header">
                  <span class="title">{{ event.title }}</span>
                  <el-button link type="danger" size="small" @click="deleteEvent(event.id)">
                    删除
                  </el-button>
                </div>
                <p v-if="event.description" class="desc">{{ event.description }}</p>
                <div class="item-meta">
                  <el-tag size="small" :type="getTagType(event.type)">{{ getTypeName(event.type) }}</el-tag>
                  <span class="time" v-if="event.isRange">区间: {{ formatDate(event.start) }} ~ {{ formatDate(event.end) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- All Events List -->
          <div class="all-events-section">
            <div class="section-title">
              📂 全部的日程总览 ({{ events.length }})
            </div>
            <el-scrollbar max-height="220px">
              <div class="all-events-list">
                <div 
                  v-for="event in events" 
                  :key="event.id" 
                  class="all-event-item"
                >
                  <div class="info">
                    <span 
                      class="color-dot" 
                      :style="{ backgroundColor: getColorHex(event.color) }"
                    />
                    <span class="title">{{ event.title }}</span>
                  </div>
                  <div class="actions">
                    <span class="date">{{ event.isRange ? '多天日程' : formatDate(event.start) }}</span>
                    <el-button link type="danger" size="small" @click="deleteEvent(event.id)">
                      🗑️
                    </el-button>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Add Event Dialog -->
    <el-dialog
      v-model="addDialogVisible"
      title="新建日程计划"
      width="480px"
      destroy-on-close
    >
      <el-form :model="newEventForm" label-position="right" label-width="90px">
        <el-form-item label="日程标题" required>
          <el-input v-model="newEventForm.title" placeholder="如：Vite 首屏加载性能评审" />
        </el-form-item>

        <el-form-item label="是否多天日程">
          <el-switch v-model="newEventForm.isRange" />
        </el-form-item>

        <el-form-item label="日程日期" required>
          <el-date-picker
            v-if="!newEventForm.isRange"
            v-model="newEventForm.singleDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
          <el-date-picker
            v-else
            v-model="newEventForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="展示类型">
          <el-select v-model="newEventForm.type" placeholder="选择展示在日历上的形状" style="width: 100%">
            <el-option label="高亮斑块 (Highlight)" value="highlight" />
            <el-option label="底部圆点 (Dot)" value="dot" />
            <el-option label="底部细线 (Bar)" value="bar" />
          </el-select>
        </el-form-item>

        <el-form-item label="标记颜色">
          <el-select v-model="newEventForm.color" placeholder="选择标记颜色" style="width: 100%">
            <el-option label="Indigo (靛青)" value="indigo" />
            <el-option label="Blue (蓝色)" value="blue" />
            <el-option label="Teal (青色)" value="teal" />
            <el-option label="Green (绿色)" value="green" />
            <el-option label="Red (红色)" value="red" />
            <el-option label="Orange (橘色)" value="orange" />
            <el-option label="Purple (紫色)" value="purple" />
          </el-select>
        </el-form-item>

        <el-form-item label="日程描述">
          <el-input 
            v-model="newEventForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="简要日程安排，悬浮在日历项上时可见..." 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNewEvent">保存日程</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import { Calendar, DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

// Store and configurations
const appStore = useAppStore()
const calendarColor = ref('indigo')
const firstDayOfWeek = ref<any>(2) // 星期一为起始

// Selection States
const selectedDate = ref<Date>(new Date())
const addDialogVisible = ref(false)

// Range Picker State (defaults to next 7 days)
const today = new Date()
const nextWeek = new Date()
nextWeek.setDate(today.getDate() + 6)
const range = ref({
  start: today,
  end: nextWeek
})

// Event interface
interface CalendarEvent {
  id: string
  title: string
  description?: string
  color: string // 'indigo' | 'blue' | 'teal' | 'green' | 'red' | 'orange' | 'purple'
  type: 'highlight' | 'dot' | 'bar'
  start: Date
  end: Date
  isRange: boolean
}

// Prepopulated Events
const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: '🚀 Vite 性能优化评审会',
    description: '讨论前端 Playground 首屏体积优化，涉及分包及 ECharts tree-shaking 落地细节。',
    color: 'indigo',
    type: 'highlight',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
    isRange: true
  },
  {
    id: '2',
    title: '🟢 Element Plus 依赖升级',
    description: '完成本地 Element Plus 精简打包及 UI 测试。',
    color: 'green',
    type: 'dot',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
    isRange: false
  },
  {
    id: '3',
    title: '🔥 Wavesurfer.js 音频调试',
    description: '修复合成和弦 AudioBuffer 生成精度丢失问题。',
    color: 'red',
    type: 'bar',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
    isRange: false
  },
  {
    id: '4',
    title: '🎨 Fabric 画板工具栏适配',
    description: '添加文字工具和撤销重做功能，导出高质量 PNG。',
    color: 'teal',
    type: 'highlight',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    isRange: false
  }
])

// ─── Dialog Form States ──────────────────────────────────────────────────────
interface NewEventForm {
  title: string
  isRange: boolean
  singleDate: Date
  dateRange: [Date, Date] | null
  color: string
  type: 'highlight' | 'dot' | 'bar'
  description: string
}

const newEventForm = ref<NewEventForm>({
  title: '',
  isRange: false,
  singleDate: new Date(),
  dateRange: null,
  color: 'indigo',
  type: 'highlight',
  description: ''
})

// ─── Computeds ───────────────────────────────────────────────────────────────
// Format calendar attributes for v-calendar
const attributes = computed(() => {
  return events.value.map(event => {
    const dates = event.isRange 
      ? { start: event.start, end: event.end } 
      : event.start

    return {
      key: event.id,
      // Map highlight properties
      highlight: event.type === 'highlight' ? {
        color: event.color,
        fillMode: 'light', // solid, light, outline
        contentClass: 'font-semibold'
      } : undefined,
      // Map dot properties
      dot: event.type === 'dot' ? {
        color: event.color
      } : undefined,
      // Map bar properties
      bar: event.type === 'bar' ? {
        color: event.color
      } : undefined,
      // Shared Popover detail
      popover: {
        label: `${event.title}${event.description ? ' - ' + event.description : ''}`,
        visibility: 'hover' as const,
        hideDelay: 200
      },
      dates,
      customData: event
    }
  })
})

// Events for selected date
const selectedDayEvents = computed(() => {
  return events.value.filter(event => {
    const checkDate = new Date(selectedDate.value)
    checkDate.setHours(0, 0, 0, 0)
    
    const startDate = new Date(event.start)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(event.end)
    endDate.setHours(0, 0, 0, 0)
    
    return checkDate >= startDate && checkDate <= endDate
  })
})

// Date range Picker duration calculation
const daysDifference = computed(() => {
  if (!range.value || !range.value.start || !range.value.end) return 0
  const timeDiff = Math.abs(range.value.end.getTime() - range.value.start.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
})

// ─── Actions ──────────────────────────────────────────────────────────────────
const onDayClick = (day: any) => {
  selectedDate.value = day.date
}

const showAddDialog = (date: Date) => {
  newEventForm.value = {
    title: '',
    isRange: false,
    singleDate: date,
    dateRange: [date, new Date(date.getTime() + 24 * 3600 * 1000)],
    color: calendarColor.value,
    type: 'highlight',
    description: ''
  }
  addDialogVisible.value = true
}

const saveNewEvent = () => {
  const form = newEventForm.value
  if (!form.title.trim()) {
    ElMessage.warning('请输入日程标题')
    return
  }

  let start: Date
  let end: Date

  if (form.isRange) {
    if (!form.dateRange || form.dateRange.length < 2) {
      ElMessage.warning('请选择日程起止日期')
      return
    }
    start = form.dateRange[0]
    end = form.dateRange[1]
  } else {
    if (!form.singleDate) {
      ElMessage.warning('请选择日程日期')
      return
    }
    start = form.singleDate
    end = form.singleDate
  }

  events.value.push({
    id: `event-${Date.now()}`,
    title: form.title,
    description: form.description,
    color: form.color,
    type: form.type,
    start,
    end,
    isRange: form.isRange
  })

  addDialogVisible.value = false
  ElMessage.success('日程新建成功！已自动添加在日历中。')
}

const deleteEvent = (id: string) => {
  const index = events.value.findIndex(e => e.id === id)
  if (index !== -1) {
    const title = events.value[index].title
    events.value.splice(index, 1)
    ElMessage.info(`日程 "${title}" 已成功删除`)
  }
}

const bookSchedule = () => {
  if (!range.value || !range.value.start || !range.value.end) return
  ElMessage.success({
    message: `成功预约区间: ${formatDate(range.value.start)} 至 ${formatDate(range.value.end)}，系统已锁定该时段！`,
    duration: 4000
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date: any): string => {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const r = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${r}`
}

const getColorHex = (color: string): string => {
  const map: Record<string, string> = {
    indigo: '#6366f1',
    blue: '#3b82f6',
    teal: '#14b8a6',
    green: '#10b981',
    red: '#ef4444',
    orange: '#f97316',
    purple: '#8b5cf6'
  }
  return map[color] || '#6366f1'
}

const getTagType = (type: string): any => {
  const map: Record<string, string> = {
    highlight: 'primary',
    dot: 'success',
    bar: 'warning'
  }
  return map[type] || 'info'
}

const getTypeName = (type: string): string => {
  const map: Record<string, string> = {
    highlight: '板块高亮',
    dot: '下部圆点',
    bar: '底部细线'
  }
  return map[type] || '事件'
}

// Static Demo Code Snippet
const demoCode = `<template>
  <div class="calendar-container">
    <!-- 引入 VCalendar 日历组件 -->
    <Calendar
      :color="calendarColor"
      :is-dark="isDark"
      :attributes="attributes"
      @dayclick="onDayClick"
      expanded
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar } from 'v-calendar'
import 'v-calendar/style.css' // 引入样式文件

const calendarColor = ref('indigo')
const isDark = ref(false)

// 定义事件日程属性
const attributes = computed(() => [
  {
    key: 'meeting',
    highlight: {
      color: 'indigo',
      fillMode: 'light' // 样式模式: solid (实色), light (淡色), outline (描边)
    },
    dates: new Date(2026, 4, 22), // 5月22日
    popover: {
      label: '🚀 Vite 性能优化评审会',
      visibility: 'hover'
    }
  },
  {
    key: 'issue-fix',
    dot: 'red', // 圆点装饰
    dates: new Date(2026, 4, 25)
  }
])

const onDayClick = (day) => {
  console.log('点击了日期:', day.date)
}
<\/script>`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.vcalendar-demo {
  padding: 0 0 40px;
}

.el-breadcrumb {
  margin-bottom: 20px;
}

.header-desc {
  margin-bottom: 28px;
  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 10px;
  }
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.7;
    max-width: 800px;
  }
}

.calendar-wrapper {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 8px;
  border: 1px solid var(--border-color);
}

.custom-calendar {
  // Override some V-Calendar styling internally to match standard style variables
  --vc-accent-50: rgba(99, 102, 241, 0.05);
  --vc-accent-100: rgba(99, 102, 241, 0.1);
  --vc-accent-500: #6366f1;
  --vc-accent-600: #4f46e5;
  
  font-family: inherit;
  background: transparent !important;
}

.datepicker-container {
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 8px;
}

.picker-card {
  border-radius: 12px;

  .card-header {
    display: flex;
    align-items: center;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .range-info {
    padding: 8px;
    
    h4 {
      margin: 0 0 16px 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .info-block {
      background: var(--bg-color-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 12px;

      .label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }

      .value {
        font-size: 0.9rem;
        font-weight: 700;
        font-family: monospace;
        color: var(--text-primary);
        
        &.count {
          color: $primary-color;
          font-size: 1.1rem;
        }
      }
    }
  }
}

.config-card {
  border-radius: 12px;
  .card-header {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.event-manager-card {
  border-radius: 12px;
  
  .card-header {
    display: flex;
    align-items: center;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    
    &.justify-between {
      justify-content: space-between;
      width: 100%;
    }
  }
}

.selected-day-section {
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-color);
  margin-bottom: 16px;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;

  .selected-date-txt {
    color: $primary-color;
    font-family: monospace;
    font-size: 0.9rem;
  }
}

.no-events-tip {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 20px 0;
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

.event-mini-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-mini-item {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-left: 4px solid #6366f1;
  border-radius: 6px;
  padding: 10px 12px;

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .title {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .desc {
    margin: 0 0 6px 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-secondary);

    .time {
      font-family: monospace;
    }
  }
}

.all-events-section {
  .all-events-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .all-event-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background-color: var(--bg-color-primary);
    border-radius: 6px;
    border: 1px solid var(--border-color);
    font-size: 0.82rem;

    .info {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      
      .color-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .title {
        color: var(--text-primary);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;

      .date {
        color: var(--text-secondary);
        font-size: 0.75rem;
        font-family: monospace;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
