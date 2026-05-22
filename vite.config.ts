import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import compression from 'vite-plugin-compression'
import cesium from 'vite-plugin-cesium'

/**
 * Vite 项目核心配置文件
 * 包含开发服务器设置、静态插件、模块路径别名以及 Rollup 生成打包分割策略。
 */
export default defineConfig({
  // 1. 插件配置列表
  plugins: [
    // 渲染 Vue 单文件组件 (SFC) 的官方支持插件
    vue(),
    
    // 集成 CesiumJS 所需插件，自动处理其 Assets/Workers 目录并在编译时建立全局 CESIUM_BASE_URL 映射
    cesium(),
    
    // 自动导入配置：在组件中无需手动 import { ref, computed } from 'vue' 等，插件会自动扫描并注入
    AutoImport({
      // 指定自动引入 API 的三方库
      imports: ['vue', 'vue-router', 'pinia'],
      // 针对 Element Plus 组件库的 API 进行自动导入（例如 ElMessage, ElMessageBox）
      resolvers: [ElementPlusResolver()],
      // 自动生成的 TypeScript 类型声明文件，确保 IDE 不报红
      dts: 'src/auto-imports.d.ts',
    }),
    
    // 自动按需注册组件：在 template 中使用组件无需手动在 script 内 import
    Components({
      // 解析器：这里注册了 Element Plus，使得所有 <el-button> 等组件可以按需加载样式和 JS
      resolvers: [ElementPlusResolver()],
      // 生成的组件类型声明文件
      dts: 'src/components.d.ts',
    }),
    
    // Gzip 静态资源预压缩：在生产环境下构建时，自动为大文件生成同名 .gz 压缩包，减轻 Nginx 实时压缩的 CPU 负担
    compression({
      algorithm: 'gzip',    // 压缩算法选择：gzip
      ext: '.gz',           // 输出文件后缀名
      threshold: 10240,     // 仅对超过 10KB 的静态资源（JS, CSS）执行压缩
      deleteOriginFile: false // 保留原始未压缩文件，供不支持 gzip 压缩的极老版本浏览器降级使用
    }),
  ],

  // 2. 路径解析别名配置
  resolve: {
    alias: {
      // 定义 @ 符号指向项目的 src 目录，避免在深层文件夹引用时出现 ../../../ 这种冗长的路径
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 3. 生产环境构建打包配置
  build: {
    // 提升 Chunk 大小超限警告阈值（默认 500KB）。
    // 像 maplibre-gl, cesium 等重度地理/三维库即便经过 Tree-Shaking 之后体积也超过 500KB
    chunkSizeWarningLimit: 1500,
    
    rollupOptions: {
      output: {
        /**
         * 核心分包策略 (Manual Chunks Splitting)
         * 默认情况下，打包会把所有第三方库塞入一个巨大 vendor 包中，导致首屏加载巨慢。
         * 这里根据依赖库的功能，将其手动拆分为不同的专有 JS 模块包，能够极大提升浏览器并行下载效率，
         * 并且由于第三方库不常变动，可以最大化利用浏览器的缓存机制（Http Cache）。
         */
        manualChunks: (id) => {
          // Vue 核心框架与底层路由、状态管理打包在一起，确保基础运行骨架稳定
          if (id.includes('node_modules/vue/') || id.includes('node_modules/vue-router/') || id.includes('node_modules/pinia/')) {
            return 'vendor-vue'
          }
          // Element Plus UI 框架，单独打包
          if (id.includes('node_modules/element-plus/') || id.includes('node_modules/@element-plus/')) {
            return 'vendor-element'
          }
          // Three.js 3D 渲染引擎，体积偏大，独立出来以实现按需访问才加载
          if (id.includes('node_modules/three/')) {
            return 'vendor-three'
          }
          // D3.js 数据可视化库，包含大量的力导向、中国地图计算，单独包装
          if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) {
            return 'vendor-d3'
          }
          // 移动端和轻量 Web GIS 地图库
          if (id.includes('node_modules/maplibre-gl/')) {
            return 'vendor-maplibre'
          }
          // Cesium 3D 全球级地理空间平台，体积很大，强制解耦，防止阻塞首页渲染
          if (id.includes('node_modules/cesium/')) {
            return 'vendor-cesium'
          }
          // Monaco Editor（微软 VSCode 核心编辑器，内含庞大词法分析服务，体积约 3MB，必须单独独立）
          if (id.includes('node_modules/monaco-editor/')) {
            return 'vendor-monaco'
          }
          // VueFlow 流程图可视化节点库
          if (id.includes('node_modules/@vue-flow/')) {
            return 'vendor-vueflow'
          }
        }
      }
    }
  }
})

