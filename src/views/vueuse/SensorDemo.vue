<template>
  <div class="vueuse-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>VueUse 常用库</el-breadcrumb-item>
      <el-breadcrumb-item>传感器与状态</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>VueUse: 硬件传感器与网络状态 API</h2>
      <p>学习如何使用 `useBattery` 读取设备电池及充电流向，利用 `useNetwork` 检测实时网络连通率，以及利用 `useDocumentVisibility` 监控浏览器标签页的前后台切换状态。</p>
    </div>

    <el-row :gutter="20">
      <!-- Battery Status -->
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <DemoCard
              title="设备电池传感器 (useBattery)"
              description="读取当前物理设备电源电量。支持模拟电量变动以适配无电池台式机测试。"
              :code="batteryCode"
            >
              <div class="sensor-card-body flex-col items-center">
                <!-- Graphical Battery Visual -->
                <div class="battery-outer">
                  <div 
                    class="battery-inner" 
                    :style="{ 
                      width: `${(effectiveLevel * 100).toFixed(0)}%`,
                      backgroundColor: getBatteryColor(effectiveLevel)
                    }"
                  >
                    <span v-if="effectiveCharging" class="lightning-icon">⚡</span>
                  </div>
                  <div class="battery-tip"></div>
                </div>

                <div class="battery-info mt-4 w-full">
                  <div class="flex justify-between border-b pb-2 mb-2">
                    <span class="text-secondary text-sm">🔋 电池余量:</span>
                    <span class="font-bold text-primary">{{ (effectiveLevel * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="flex justify-between border-b pb-2 mb-2">
                    <span class="text-secondary text-sm">⚡ 充电状态:</span>
                    <span class="font-bold" :class="effectiveCharging ? 'text-success' : 'text-warning'">
                      {{ effectiveCharging ? '正在充电中' : '未连接充电器' }}
                    </span>
                  </div>
                  <div class="flex justify-between pb-1" v-if="!isSupported">
                    <span class="text-secondary text-sm">⚠️ 说明:</span>
                    <span class="text-warning text-xs">当前浏览器不支持 Battery API，已启用预设模拟。</span>
                  </div>
                </div>

                <!-- Simulation Controls -->
                <div class="battery-simulation mt-4 border-t pt-4 w-full">
                  <span class="label mb-2 block">手动模拟电量数值 (进行测试):</span>
                  <div class="flex items-center gap-2">
                    <el-slider v-model="simulatedLevel" :min="0" :max="100" class="flex-1" />
                    <el-switch v-model="simulatedCharging" active-text="模拟充电" />
                  </div>
                </div>
              </div>
            </DemoCard>
          </el-col>

          <!-- Network and Tab Visibility -->
          <el-col :xs="24" :md="12">
            <el-row :gutter="20">
              <!-- Network Status -->
              <el-col :span="24">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header font-bold">
                      <span>📶 网络连通率检测 (useNetwork)</span>
                    </div>
                  </template>

                  <div class="network-board">
                    <div class="flex items-center justify-between p-3 bg-primary-light rounded mb-3">
                      <span class="text-sm font-semibold">状态:</span>
                      <el-tag :type="isOnline ? 'success' : 'danger'" class="font-bold">
                        {{ isOnline ? '🟢 在线 (Online)' : '🔴 离线 (Offline)' }}
                      </el-tag>
                    </div>

                    <div class="network-details grid grid-cols-2 gap-2 text-sm text-secondary">
                      <div class="p-2 border rounded">
                        <span class="block text-xs">下行速率估计 (Bandwidth):</span>
                        <strong class="text-primary text-base">{{ downlink ? `${downlink} Mbps` : '未知' }}</strong>
                      </div>
                      <div class="p-2 border rounded">
                        <span class="block text-xs">往返时延 (RTT):</span>
                        <strong class="text-primary text-base">{{ rtt ? `${rtt} ms` : '未知' }}</strong>
                      </div>
                      <div class="p-2 border rounded">
                        <span class="block text-xs">网络连接类型:</span>
                        <strong class="text-primary text-base uppercase">{{ type || '未知' }}</strong>
                      </div>
                      <div class="p-2 border rounded">
                        <span class="block text-xs">是否节流省电模式:</span>
                        <strong class="text-primary text-base">{{ saveData ? '开启' : '关闭' }}</strong>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>

              <!-- Visibility Monitor -->
              <el-col :span="24" class="mt-4">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header font-bold">
                      <span>👁️ 页面活跃检测 (useDocumentVisibility)</span>
                    </div>
                  </template>

                  <div class="visibility-board flex-col items-center justify-center p-4">
                    <p class="desc-text mb-4 text-center">
                      当您切换到其他浏览器标签，或者最小化此页面时，`useDocumentVisibility` 将自动侦测并记录为 `hidden`。
                    </p>

                    <div class="visibility-stat mb-3">
                      <div class="stat-number">{{ tabLeaveCount }}</div>
                      <div class="stat-label">切换离开当前标签的次数</div>
                    </div>

                    <div class="flex items-center justify-center gap-2 p-2 bg-secondary-light rounded">
                      <span class="text-xs text-secondary">当前实时状态:</span>
                      <el-tag :type="visibility === 'visible' ? 'success' : 'info'" size="small">
                        {{ visibility === 'visible' ? '🌟 正常浏览中' : '💤 处于后台' }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBattery, useNetwork, useDocumentVisibility } from '@vueuse/core'
import DemoCard from '@/components/common/DemoCard.vue'

// 1. Battery hook
const { 
  charging, 
  level, 
  isSupported 
} = useBattery()

// Local simulated values if API is not supported (e.g. on Desktop)
const simulatedLevel = ref(85)
const simulatedCharging = ref(false)

// Fallback values
const effectiveLevel = computed(() => {
  return isSupported.value ? level.value : simulatedLevel.value / 100
})

const effectiveCharging = computed(() => {
  return isSupported.value ? charging.value : simulatedCharging.value
})

const getBatteryColor = (lvl: number) => {
  if (lvl <= 0.2) return '#ef4444' // Red
  if (lvl <= 0.5) return '#f59e0b' // Yellow/Orange
  return '#10b981' // Green
}

// 2. Network hook
const { 
  isOnline, 
  downlink, 
  rtt, 
  saveData, 
  type 
} = useNetwork()

// 3. Document visibility hook
const visibility = useDocumentVisibility()
const tabLeaveCount = ref(0)

// Increment counter every time the document visibility status changes to 'hidden'
watch(visibility, (currentVal) => {
  if (currentVal === 'hidden') {
    tabLeaveCount.value++
  }
})

const batteryCode = `// VueUse: useBattery 电池电量与插拔状态读取
import { useBattery } from '@vueuse/core'

const { 
  charging,    // 正在充电 (布尔型)
  chargingTime,// 充满所需时间 (秒)
  dischargingTime, // 放电耗尽所需时间 (秒)
  level,       // 电量比率 (0.0 到 1.0)
  isSupported  // 浏览器硬件 API 支持率 (部分桌面不可用)
} = useBattery()`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.vueuse-demo-container {
  padding-bottom: 24px;
}

.sensor-card-body {
  display: flex;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
}

// Battery representation
.battery-outer {
  width: 140px;
  height: 64px;
  border: 4px solid var(--text-primary);
  border-radius: 12px;
  padding: 3px;
  position: relative;
  display: flex;
  align-items: center;
}

.battery-inner {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease, background-color 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 6px;
}

.battery-tip {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 20px;
  background-color: var(--text-primary);
  border-radius: 0 4px 4px 0;
}

.lightning-icon {
  font-size: 1.2rem;
  color: #ffffff;
  font-weight: bold;
  animation: pulse 1.2s infinite;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.bg-primary-light {
  background-color: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.bg-secondary-light {
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
}

.network-details {
  .border {
    border-color: var(--border-color);
    background-color: var(--bg-color-primary);
  }
}

.visibility-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  
  .stat-number {
    font-size: 2.2rem;
    font-weight: 800;
    color: $primary-color;
    font-family: 'Outfit', sans-serif;
  }
  
  .stat-label {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }
}

.desc-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.border-t {
  border-top: 1px solid var(--border-color);
}
.border-b {
  border-bottom: 1px solid var(--border-color);
}

.pb-2 {
  padding-bottom: 8px;
}
.pb-1 {
  padding-bottom: 4px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.pt-4 {
  padding-top: 16px;
}
.w-full {
  width: 100%;
}
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.justify-center {
  justify-content: center;
}
.gap-2 {
  gap: 8px;
}
.block {
  display: block;
}
.font-bold {
  font-weight: 700;
}
.text-xs {
  font-size: 0.75rem;
}
.text-sm {
  font-size: 0.85rem;
}
.text-secondary {
  color: var(--text-secondary);
}
.text-primary {
  color: $primary-color;
}
.text-success {
  color: #10b981;
}
.text-warning {
  color: #f59e0b;
}
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}
</style>
