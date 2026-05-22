/**
 * 应用主入口文件 (Entry Point)
 * 负责实例化 Vue 应用、注册全局插件、载入全局样式，并挂载应用到 DOM 上。
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { MotionPlugin } from '@vueuse/motion'
import router from '@/router'
import i18n from '@/i18n'
import App from './App.vue'

// tsParticles 炫酷粒子特效的 Vue 3 组件及轻量级渲染引擎
// @ts-ignore
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim' // 使用 slim 轻量版，减少首屏打包体积，只包含核心粒子运动算法

// 引入 Element Plus 的全局样式以及暗黑模式专用的 CSS 变量主题包
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 引入项目全局自定义样式（重置样式、滚动条美化、HSL语义化变量定义等）
import '@/assets/styles/global.scss'

// 1. 创建 Vue 应用实例
const app = createApp(App)

// 2. 实例化 Pinia 状态管理仓库，并挂载到 Vue 应用上
const pinia = createPinia()
app.use(pinia)

// 3. 挂载国际化多语言插件 (中/英文切换)
app.use(i18n)

// 4. 挂载 VueQuery 插件 (用于网络请求的数据缓存、自动重试和乐观更新)
app.use(VueQueryPlugin)

// 5. 挂载 MotionPlugin 插件 (提供指令式声明动画 v-motion 等，提升动效表现力)
app.use(MotionPlugin)

// 6. 挂载 Vue Router 路由管理器，接管页面跳转与动态分包加载
app.use(router)

// 7. 装配并配置 tsParticles 粒子背景插件
app.use(Particles, {
  // 定义初始化回调，当引擎准备就绪时，异步加载 slim 核心渲染器，防止阻塞主线程首屏渲染
  init: async (engine: any) => {
    await loadSlim(engine)
  }
})

// 8. 将应用实例挂载到 index.html 中 id 为 "app" 的真实 DOM 节点上
app.mount('#app')


