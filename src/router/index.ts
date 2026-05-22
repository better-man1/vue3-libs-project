/**
 * 路由管理中心
 * 负责路由表的建立、路由懒加载机制（Lazy Loading）的配置以及全局路由拦截钩子。
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// 骨架屏布局组件：所有的二级视图组件都会被注入到该布局组件的 <router-view> 插槽内
import AppLayout from '@/components/layout/AppLayout.vue'
// 引入页面切换顶部进度条组件及其 CSS 样式，提升 SPA 单页应用加载观感
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// NProgress 全局配置项：关闭环形微调加载动画，保持极简顶部横条形式
NProgress.configure({ showSpinner: false })


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/HomePage.vue'),
      },
      // Pinia routes
      {
        path: 'pinia/counter',
        name: 'PiniaCounter',
        component: () => import('@/views/pinia/CounterStore.vue'),
      },
      {
        path: 'pinia/todo',
        name: 'PiniaTodo',
        component: () => import('@/views/pinia/TodoStore.vue'),
      },
      {
        path: 'pinia/cart',
        name: 'PiniaCart',
        component: () => import('@/views/pinia/CartStore.vue'),
      },
      // Element Plus routes
      {
        path: 'element-plus/basic',
        name: 'ElementBasic',
        component: () => import('@/views/element-plus/BasicComponents.vue'),
      },
      {
        path: 'element-plus/form',
        name: 'ElementForm',
        component: () => import('@/views/element-plus/FormDemo.vue'),
      },
      {
        path: 'element-plus/table',
        name: 'ElementTable',
        component: () => import('@/views/element-plus/TableDemo.vue'),
      },
      {
        path: 'element-plus/dialog',
        name: 'ElementDialog',
        component: () => import('@/views/element-plus/DialogDemo.vue'),
      },
      // ECharts routes
      {
        path: 'echarts/line',
        name: 'EChartsLine',
        component: () => import('@/views/echarts/LineChart.vue'),
      },
      {
        path: 'echarts/bar',
        name: 'EChartsBar',
        component: () => import('@/views/echarts/BarChart.vue'),
      },
      {
        path: 'echarts/pie',
        name: 'EChartsPie',
        component: () => import('@/views/echarts/PieChart.vue'),
      },
      {
        path: 'echarts/dashboard',
        name: 'EChartsDashboard',
        component: () => import('@/views/echarts/DashboardDemo.vue'),
      },
      // Three.js routes
      {
        path: 'threejs/basic',
        name: 'ThreejsBasic',
        component: () => import('@/views/threejs/BasicScene.vue'),
      },
      {
        path: 'threejs/geometry',
        name: 'ThreejsGeometry',
        component: () => import('@/views/threejs/GeometryDemo.vue'),
      },
      {
        path: 'threejs/material-light',
        name: 'ThreejsMaterialLight',
        component: () => import('@/views/threejs/MaterialLight.vue'),
      },
      {
        path: 'threejs/earth',
        name: 'ThreejsEarth',
        component: () => import('@/views/threejs/EarthGlobe.vue'),
      },
      {
        path: 'threejs/animation',
        name: 'ThreejsAnimation',
        component: () => import('@/views/threejs/AnimationDemo.vue'),
      },
      // D3.js routes
      {
        path: 'd3js/bar',
        name: 'D3BarChart',
        component: () => import('@/views/d3js/BarChartD3.vue'),
      },
      {
        path: 'd3js/force',
        name: 'D3ForceGraph',
        component: () => import('@/views/d3js/ForceGraph.vue'),
      },
      {
        path: 'd3js/treemap',
        name: 'D3TreeMap',
        component: () => import('@/views/d3js/TreeMap.vue'),
      },
      {
        path: 'd3js/china-map',
        name: 'D3ChinaMap',
        component: () => import('@/views/d3js/GeoMap.vue'),
      },
      // Animation routes
      {
        path: 'animation/gsap',
        name: 'GsapDemo',
        component: () => import('@/views/animation/GsapDemo.vue'),
      },
      {
        path: 'animation/anime',
        name: 'AnimeDemo',
        component: () => import('@/views/animation/AnimeDemo.vue'),
      },
      {
        path: 'animation/lottie',
        name: 'LottieDemo',
        component: () => import('@/views/animation/LottieDemo.vue'),
      },
      // VueUse routes
      {
        path: 'vueuse/mouse-tracker',
        name: 'MouseTracker',
        component: () => import('@/views/vueuse/MouseTracker.vue'),
      },
      {
        path: 'vueuse/storage-demo',
        name: 'StorageDemo',
        component: () => import('@/views/vueuse/StorageDemo.vue'),
      },
      {
        path: 'vueuse/sensor-demo',
        name: 'SensorDemo',
        component: () => import('@/views/vueuse/SensorDemo.vue'),
      },
      // Utility routes
      {
        path: 'utils/axios',
        name: 'AxiosDemo',
        component: () => import('@/views/utils/AxiosDemo.vue'),
      },
      {
        path: 'utils/lodash',
        name: 'LodashDemo',
        component: () => import('@/views/utils/LodashDemo.vue'),
      },
      {
        path: 'utils/dayjs',
        name: 'DayjsDemo',
        component: () => import('@/views/utils/DayjsDemo.vue'),
      },
      // Advanced routes
      {
        path: 'advanced/tiptap',
        name: 'TiptapDemo',
        component: () => import('@/views/advanced/TiptapDemo.vue'),
      },
      {
        path: 'advanced/excel',
        name: 'ExcelDemo',
        component: () => import('@/views/advanced/ExcelDemo.vue'),
      },
      {
        path: 'advanced/pdf-screenshot',
        name: 'PdfScreenshotDemo',
        component: () => import('@/views/advanced/PdfScreenshotDemo.vue'),
      },
      {
        path: 'advanced/i18n',
        name: 'I18nDemo',
        component: () => import('@/views/advanced/I18nDemo.vue'),
      },
      {
        path: 'advanced/drag-drop',
        name: 'DragDropDemo',
        component: () => import('@/views/advanced/DragDropDemo.vue'),
      },
      {
        path: 'advanced/virtual-scroll',
        name: 'VirtualScrollDemo',
        component: () => import('@/views/advanced/VirtualScrollDemo.vue'),
      },
      // Phase 5 routes
      {
        path: 'phase5/vue-query',
        name: 'VueQueryDemo',
        component: () => import('@/views/phase5/VueQueryDemo.vue'),
      },
      {
        path: 'phase5/vitest',
        name: 'VitestDemo',
        component: () => import('@/views/phase5/VitestDemo.vue'),
      },
      {
        path: 'phase5/vee-validate',
        name: 'VeeValidateDemo',
        component: () => import('@/views/phase5/VeeValidateDemo.vue'),
      },
      {
        path: 'phase5/leaflet',
        name: 'LeafletDemo',
        component: () => import('@/views/phase5/LeafletDemo.vue'),
      },
      {
        path: 'phase5/chartjs',
        name: 'ChartJsDemo',
        component: () => import('@/views/phase5/ChartJsDemo.vue'),
      },
      {
        path: 'phase5/vueuse-advanced',
        name: 'VueUseAdvancedDemo',
        component: () => import('@/views/phase5/VueUseAdvancedDemo.vue'),
      },
      {
        path: 'phase5/markdown',
        name: 'MarkdownDemo',
        component: () => import('@/views/phase5/MarkdownDemo.vue'),
      },
      // Phase 6 routes
      {
        path: 'phase6/swiper',
        name: 'SwiperDemo',
        component: () => import('@/views/phase6/SwiperDemo.vue'),
      },
      {
        path: 'phase6/motion',
        name: 'MotionDemo',
        component: () => import('@/views/phase6/MotionDemo.vue'),
      },
      {
        path: 'phase6/driver',
        name: 'DriverDemo',
        component: () => import('@/views/phase6/DriverDemo.vue'),
      },
      {
        path: 'phase6/cropper',
        name: 'CropperDemo',
        component: () => import('@/views/phase6/CropperDemo.vue'),
      },
      // Phase 7 routes
      {
        path: 'phase7/maplibre',
        name: 'MaplibreDemo',
        component: () => import('@/views/phase7/MaplibreDemo.vue'),
      },
      {
        path: 'phase7/comlink',
        name: 'ComlinkDemo',
        component: () => import('@/views/phase7/ComlinkDemo.vue'),
      },
      {
        path: 'phase7/floating',
        name: 'FloatingDemo',
        component: () => import('@/views/phase7/FloatingDemo.vue'),
      },
      // Phase 8 routes
      {
        path: 'phase8/nprogress',
        name: 'NProgressDemo',
        component: () => import('@/views/phase8/NProgressDemo.vue'),
      },
      {
        path: 'phase8/qrcode',
        name: 'QRCodeDemo',
        component: () => import('@/views/phase8/QRCodeDemo.vue'),
      },
      {
        path: 'phase8/typed',
        name: 'TypedDemo',
        component: () => import('@/views/phase8/TypedDemo.vue'),
      },
      {
        path: 'phase8/particles',
        name: 'ParticlesDemo',
        component: () => import('@/views/phase8/ParticlesDemo.vue'),
      },
      {
        path: 'phase8/fabric',
        name: 'FabricDemo',
        component: () => import('@/views/phase8/FabricDemo.vue'),
      },
      // Phase 9 routes
      {
        path: 'phase9/vue-flow',
        name: 'VueFlowDemo',
        component: () => import('@/views/phase9/VueFlowDemo.vue'),
      },
      {
        path: 'phase9/xterm',
        name: 'XTermDemo',
        component: () => import('@/views/phase9/XTermDemo.vue'),
      },
      {
        path: 'phase9/monaco',
        name: 'MonacoDemo',
        component: () => import('@/views/phase9/MonacoDemo.vue'),
      },
      {
        path: 'phase9/wavesurfer',
        name: 'WavesurferDemo',
        component: () => import('@/views/phase9/WavesurferDemo.vue'),
      },
      {
        path: 'phase9/vcalendar',
        name: 'VCalendarDemo',
        component: () => import('@/views/phase9/VCalendarDemo.vue'),
      },
      // CesiumJS 3D Earth
      {
        path: 'cesium',
        name: 'CesiumDemo',
        component: () => import('@/views/cesium/CesiumDemo.vue'),
      },
      // Front-end Explorations
      {
        path: 'exploration/signature',
        name: 'SignatureDemo',
        component: () => import('@/views/exploration/SignatureDemo.vue'),
      },
      {
        path: 'exploration/rough-notation',
        name: 'RoughNotationDemo',
        component: () => import('@/views/exploration/RoughNotationDemo.vue'),
      },
    ],
  },
]

// 实例化路由对象
const router = createRouter({
  // 使用 Web 历史记录模式（HTML5 History API），并指定基础 URL 路径（通常为 "/"）
  history: createWebHistory(import.meta.env.BASE_URL),
  // 注入我们定义的静态与动态嵌套路由规则
  routes,
})

// 全局路由前置守卫（BeforeEach）
// 在页面发生跳转前触发：用于启动页面顶部的加载进度条，告知用户网络加载进度
router.beforeEach((_to, _from, next) => {
  NProgress.start() // 启动进度条
  next()           // 放行路由跳转
})

// 全局路由后置钩子（AfterEach）
// 当路由加载完毕、新页面 DOM 开始渲染时触发：用于关闭进度条并重置滚动位置
router.afterEach(() => {
  NProgress.done() // 结束进度条
})

export default router

