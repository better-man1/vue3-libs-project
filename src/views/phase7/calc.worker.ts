import { expose } from 'comlink'

/**
 * 🛠️ Web Worker 独立辅助计算线程脚本
 * 
 * 【Web Worker 核心原理】：
 * 浏览器为 JavaScript 开辟的第二计算通道。Worker 线程与主线程（UI渲染线程）完全分离，
 * 它拥有独立的 V8 实例与事件轮询（Event Loop），但不允许访问 DOM 树（如 window, document 对象）。
 * 在这里运行的任何 CPU 密集型死循环、海量排序、复杂算法，都【完全不会】阻塞主线程上的用户交互、CSS 动效及 UI 重绘。
 */
const workerMethods = {
  // A. 经典 CPU 密集型任务：高阶斐波那契数列计算（采用高效迭代非递归法防爆栈）
  fibonacci(n: number): number {
    if (n <= 1) return n
    let a = 0, b = 1
    for (let i = 2; i <= n; i++) {
      const temp = a + b
      a = b
      b = temp
    }
    return b
  },

  // B. 复合三角函数迭代，强占 CPU 计算周期
  runHeavyComputation(iterations: number): number {
    let sum = 0
    for (let i = 0; i < iterations; i++) {
      // 各种高负荷浮点数三角计算，强占 CPU 算力
      sum += Math.sin(i) * Math.cos(i) + Math.tan(i % 45)
    }
    return sum
  },

  // C. 庞大浮点数数组随机生成与原地排序
  sortLargeArray(size: number): number[] {
    // 实例化 size 长度的随机数组
    const arr = Array.from({ length: size }, () => Math.random() * 1000000)
    // 排序在 V8 底层是阻塞性质的快排/插入排序算法
    arr.sort((a, b) => a - b)
    
    /**
     * 💡 性能优化点：跨线程数据拷贝瓶颈 (Structured Clone Algorithm)
     * Web Worker 在将数据回传给主线程时，默认采用的是“结构化克隆算法”。
     * 如果将一个几百万长度的浮点数数组原样通过 postMessage 传回，序列化/反序列化这块大内存会使主线程卡顿数毫秒。
     * 因此，这里只切割前 10 个代表元素传回，或者也可以使用 Transferable Objects（如 ArrayBuffer）进行零拷贝转移。
     */
    return arr.slice(0, 10)
  }
}

// 导出 Worker 类型签名，供主线程 TypeScript 进行强类型感知 (Type Safety)
export type CalcWorker = typeof workerMethods

// 通过 Comlink 提供的 expose API，将这些计算方法发布暴露出去。
// Comlink 在底层会自动为我们建立 MessageChannel 双向通信通道，并包装为异步代理。
expose(workerMethods)

