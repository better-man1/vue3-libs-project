<template>
  <div class="d3-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>D3.js 可视化</el-breadcrumb-item>
      <el-breadcrumb-item>力导向图</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>D3.js 关系网络力导向图</h2>
      <p>探索复杂拓扑关系。使用 D3.js 力学引擎设置多体排斥力 (Charge)、弹簧连线力 (Link) 及碰撞体积力 (Collision)，支持鼠标拖拽与双击锁定。</p>
    </div>

    <el-row :gutter="20">
      <!-- Force Graph Viewport -->
      <el-col :xs="24" :lg="16">
        <DemoCard 
          title="D3.js Network Graph" 
          description="按住左键拖拽节点改变其物理位置。双击节点可以锁定/释放其固定坐标。"
          :code="forceGraphCode"
        >
          <div class="chart-wrapper" ref="chartContainer">
            <!-- SVG injected here by D3 -->
          </div>
        </DemoCard>
      </el-col>

      <!-- Panel Control Card -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header">
              <span>⚙️ 物理力场调校</span>
            </div>
          </template>

          <div class="control-group">
            <h4 class="group-title">排斥与吸引</h4>
            <div class="control-item-vertical">
              <span class="label">节点排斥力 (Repulsion): {{ forceParams.chargeStrength }}</span>
              <el-slider v-model="forceParams.chargeStrength" :min="-200" :max="-20" :step="10" @input="updateSimulationForces" />
            </div>
            <div class="control-item-vertical">
              <span class="label">连线张力距离 (Link Distance): {{ forceParams.linkDistance }}</span>
              <el-slider v-model="forceParams.linkDistance" :min="30" :max="150" :step="5" @input="updateSimulationForces" />
            </div>
            <div class="control-item-vertical">
              <span class="label">碰撞半径 (Collision Radius): {{ forceParams.collideRadius }}</span>
              <el-slider v-model="forceParams.collideRadius" :min="10" :max="35" :step="1" @input="updateSimulationForces" />
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">图例说明</h4>
            <div class="legend-list">
              <div class="legend-item">
                <span class="circle-bullet" style="background-color: #6366f1;"></span>
                <span class="legend-label">根节点 (Root)</span>
              </div>
              <div class="legend-item">
                <span class="circle-bullet" style="background-color: #ec4899;"></span>
                <span class="legend-label">子模块级 (Module)</span>
              </div>
              <div class="legend-item">
                <span class="circle-bullet" style="background-color: #10b981;"></span>
                <span class="legend-label">功能叶节点 (Leaf)</span>
              </div>
            </div>
          </div>

          <div class="control-group">
            <h4 class="group-title">节点搜索定位</h4>
            <el-select 
              v-model="selectedNodeName" 
              placeholder="寻找特定节点..." 
              clearable 
              class="w-full" 
              @change="highlightSearchedNode"
            >
              <el-option 
                v-for="node in nodesData" 
                :key="node.id" 
                :label="node.label" 
                :value="node.label" 
              />
            </el-select>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import DemoCard from '@/components/common/DemoCard.vue'

// DOM Reference
const chartContainer = ref<HTMLDivElement | null>(null)

// Selected node for highlighting
const selectedNodeName = ref('')

// Parameters
const forceParams = reactive({
  chargeStrength: -80,
  linkDistance: 60,
  collideRadius: 18
})

// Mock Nodes & Links data
interface CustomNode extends d3.SimulationNodeDatum {
  id: string
  label: string
  group: number
  radius: number
}
interface CustomLink extends d3.SimulationLinkDatum<CustomNode> {
  source: string | CustomNode
  target: string | CustomNode
  value: number
}

const nodesData = reactive<CustomNode[]>([
  { id: '1', label: 'Playground', group: 1, radius: 24 },
  
  { id: '2', label: 'Vue 3', group: 2, radius: 18 },
  { id: '3', label: 'Pinia', group: 2, radius: 18 },
  { id: '4', label: 'Element Plus', group: 2, radius: 18 },
  { id: '5', label: 'ECharts', group: 2, radius: 18 },
  { id: '6', label: 'Three.js', group: 2, radius: 18 },
  { id: '7', label: 'D3.js', group: 2, radius: 18 },

  { id: '8', label: 'Router', group: 3, radius: 12 },
  { id: '9', label: 'Composition API', group: 3, radius: 12 },
  { id: '10', label: 'Stores', group: 3, radius: 12 },
  { id: '11', label: 'AutoImport', group: 3, radius: 12 },
  { id: '12', label: 'WebGL', group: 3, radius: 12 },
  { id: '13', label: 'OrbitControls', group: 3, radius: 12 },
  { id: '14', label: 'Custom Shader', group: 3, radius: 12 },
  { id: '15', label: 'SVG', group: 3, radius: 12 },
  { id: '16', label: 'Forces', group: 3, radius: 12 }
])

const linksData = reactive<CustomLink[]>([
  { source: '1', target: '2', value: 3 },
  { source: '1', target: '3', value: 3 },
  { source: '1', target: '4', value: 3 },
  { source: '1', target: '5', value: 3 },
  { source: '1', target: '6', value: 3 },
  { source: '1', target: '7', value: 3 },

  { source: '2', target: '8', value: 2 },
  { source: '2', target: '9', value: 2 },
  { source: '3', target: '10', value: 2 },
  { source: '4', target: '11', value: 2 },
  { source: '6', target: '12', value: 2 },
  { source: '6', target: '13', value: 2 },
  { source: '6', target: '14', value: 2 },
  { source: '7', target: '15', value: 2 },
  { source: '7', target: '16', value: 2 }
])

// D3 Force Simulation Setup
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
let simulation: d3.Simulation<CustomNode, CustomLink>

// Node and Link selections for drawing updates
let link: d3.Selection<SVGLineElement, CustomLink, SVGGElement, unknown>
let node: d3.Selection<SVGGElement, CustomNode, SVGGElement, unknown>

// 初始化及构建力导向图主画布
const initChart = () => {
  if (!chartContainer.value) return

  // 1. 清理遗留绘图：防止 Vue 热更新或组件重入时在 DOM 中重复添加多个 SVG 画布
  d3.select(chartContainer.value).selectAll('svg').remove()

  const width = chartContainer.value.clientWidth
  const height = 440

  // 2. 插入 SVG 视口
  svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 3. 建立主绘图容器组（便于后续进行缩放或整体位移）
  const g = svg.append('g').attr('class', 'graph-container')

  /**
   * 4. 核心力学仿真器初始化 (Force Simulation)
   * D3 力学引擎利用 Euler 积分迭代计算节点在各个物理法则作用下的加速度、速度与位移。
   * - forceLink: 弹簧连线力，使有关联的节点互相牵引。通过 id 映射关联 source/target，distance 定义弹簧静止物理距离。
   * - forceManyBody: 多体库仑排斥力，数值为负表示斥力（如同电荷相斥），防止所有节点聚成一团。
   * - forceCenter: 向心重力场，强行将整体网络结构的重心拖拉回画布的中轴线交点，防止节点飘出屏幕外。
   * - forceCollide: 弹性碰撞体积检测，限制每个节点的排他安全半径，避免文字重叠。
   */
  simulation = d3.forceSimulation<CustomNode, CustomLink>(nodesData)
    .force('link', d3.forceLink<CustomNode, CustomLink>(linksData).id(d => d.id).distance(forceParams.linkDistance))
    .force('charge', d3.forceManyBody().strength(forceParams.chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(forceParams.collideRadius))

  // 5. 渲染连线 (Link Line) - 必须先于节点渲染，使线在视觉层次处于圆圈底层
  link = g.append('g')
    .attr('class', 'links')
    .selectAll<SVGLineElement, CustomLink>('line')
    .data(linksData)
    .enter()
    .append('line')
    .attr('stroke', 'var(--border-color)')
    // 线粗细取决于权重 value 的开根号比率
    .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
    .attr('stroke-opacity', 0.6)

  // 6. 渲染节点组 (Node Group) - 每个节点包含一个圆形和悬浮文字
  node = g.append('g')
    .attr('class', 'nodes')
    .selectAll<SVGGElement, CustomNode>('g')
    .data(nodesData)
    .enter()
    .append('g')
    .attr('cursor', 'grab')
    // 绑定 D3 Drag 拖拽手势处理器
    .call(d3.drag<SVGGElement, CustomNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended) as any
    )
    // 双击交互：锁定或解锁当前节点的物理坐标
    .on('dblclick', (event, d) => {
      // 如果 fx (Fixed X) 不为空，说明目前是锁定状态，双击执行解锁
      if (d.fx !== null && d.fx !== undefined) {
        d.fx = null
        d.fy = null
        // 恢复实线边框样式
        d3.select(event.currentTarget).select('circle').attr('stroke-dasharray', 'none')
      } else {
        // 将当前计算渲染坐标 (x, y) 固定赋值给固锚坐标 (fx, fy)
        d.fx = d.x
        d.fy = d.y
        // 设置虚线边框样式，标识“被固定”的视觉状态
        d3.select(event.currentTarget).select('circle').attr('stroke-dasharray', '3,3')
      }
    })
    .on('mouseenter', handleNodeHover)
    .on('mouseleave', handleNodeLeave)

  // 色彩配置映射表，对应 nodes 里的 group (1:根节点, 2:模块级, 3:叶子节点)
  const nodeColors = ['#6366f1', '#ec4899', '#10b981']

  // 追加核心圆圈
  node.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => nodeColors[d.group - 1])
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .attr('class', 'node-circle')
    .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)')

  // 追加文本标注，像素偏移位置基于节点半径动态延伸，保证不遮挡圆形
  node.append('text')
    .text(d => d.label)
    .attr('x', d => d.radius + 6)
    .attr('y', 4)
    .style('font-size', '11px')
    .style('font-weight', '500')
    .style('fill', 'var(--text-primary)')
    .style('pointer-events', 'none') // 禁用鼠标事件响应，防止干扰节点的 hover/drag 手势

  // 7. 注册时钟滴答周期事件 (Tick Listener)
  // 当力学引擎每一帧计算完最新的节点加速度与瞬时速度后，会触发该回调。
  // 我们在此处动态更新线段两端的起止点像素坐标 (x1, y1) -> (x2, y2) 以及圆圈组的平移 translate。
  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as CustomNode).x || 0)
      .attr('y1', d => (d.source as CustomNode).y || 0)
      .attr('x2', d => (d.target as CustomNode).x || 0)
      .attr('y2', d => (d.target as CustomNode).y || 0)

    node
      .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`)
  })
}

// 动态调整力学系数（被侧边栏 el-slider 控制器触发）
const updateSimulationForces = () => {
  if (!simulation) return

  // 重新装配斥力参数
  simulation.force('charge', d3.forceManyBody().strength(forceParams.chargeStrength))
  
  // 提取 link 力场，更改弹簧距离
  const linkForce = simulation.force('link') as d3.ForceLink<CustomNode, CustomLink>
  if (linkForce) linkForce.distance(forceParams.linkDistance)

  // 更改碰撞检测安全间距
  simulation.force('collision', d3.forceCollide().radius(forceParams.collideRadius))

  // 核心优化：D3 在静止后会令仿真进入“睡眠”冻结状态以节约 CPU 资源。
  // 当我们手动更改滑块参数后，必须通过给 alpha（能量值）重新加热并重启，才能让节点产生平滑的二次散开动画。
  simulation.alpha(0.3).restart()
}

/**
 * 拖拽交互细节讲解 (Drag lifecycle)
 * D3 内部维护了一个衰减因子 alpha，在物理运动稳定时趋近于 0（即停止运算）。
 * - dragstarted: 刚触碰拖动时，event.active 表明是否是初始触点。
 *   我们需要人为设置 alphaTarget 并调用 restart，类似于向水面扔入石子灌注“动能”，使系统重新活跃计算。
 *   同时将当前坐标暂存给 fx/fy 实现跟随。
 * - dragged: 高频拖拽位移中，实时覆盖 fx/fy 为当前鼠标指针像素。
 * - dragended: 释放时，如果该节点没有被双击锁定，则清空 fx/fy 为 null，使其重新顺从弹簧与电荷排斥法则回弹。
 */
function dragstarted(event: any, d: CustomNode) {
  if (!event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

function dragged(event: any, d: CustomNode) {
  d.fx = event.x
  d.fy = event.y
}

function dragended(event: any, d: CustomNode) {
  if (!event.active) simulation.alphaTarget(0)
  // 判断该圆圈在松开时是否带有 3,3 虚线边框样式，如果不是固定锁定，则释放坐标控制权归还仿真
  const isSticky = d3.select(event.sourceEvent.currentTarget).select('circle').attr('stroke-dasharray') === '3,3'
  if (!isSticky) {
    d.fx = null
    d.fy = null
  }
}


// Hover connection path highlight
const handleNodeHover = (_event: any, d: CustomNode) => {
  // Find neighboring nodes from linksData
  const neighbors = new Set<string>()
  neighbors.add(d.id)

  linksData.forEach((l) => {
    const s = l.source as CustomNode
    const t = l.target as CustomNode
    if (s.id === d.id) neighbors.add(t.id)
    if (t.id === d.id) neighbors.add(s.id)
  })

  // Fade out nodes that are not neighbors
  node.style('opacity', n => neighbors.has(n.id) ? 1.0 : 0.15)
  // Fade out lines that are not connected
  link.style('stroke-opacity', l => {
    const s = l.source as CustomNode
    const t = l.target as CustomNode
    return (s.id === d.id || t.id === d.id) ? 0.9 : 0.05
  })
}

// Reset hover
const handleNodeLeave = () => {
  node.style('opacity', 1.0)
  link.style('stroke-opacity', 0.6)
}

// Highlight searched node
const highlightSearchedNode = (val: string | null) => {
  if (!val) {
    handleNodeLeave()
    return
  }

  node.style('opacity', n => n.label === val ? 1.0 : 0.25)
  // Scale up node size
  node.selectAll<SVGCircleElement, CustomNode>('circle')
    .attr('r', n => n.label === val ? n.radius * 1.35 : n.radius)
}

const handleResize = () => {
  if (!chartContainer.value || !svg || !simulation) return
  const width = chartContainer.value.clientWidth
  const height = 440

  svg.attr('width', width)
  simulation.force('center', d3.forceCenter(width / 2, height / 2))
  simulation.alpha(0.3).restart()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (simulation) {
    simulation.stop()
  }
})

const forceGraphCode = `// D3 力导向图核心力学配置与绑定
import * as d3 from 'd3'

// 1. 创建仿真器，并添加四大力场
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(60))
  .force('charge', d3.forceManyBody().strength(-80)) // 点排斥力
  .force('center', d3.forceCenter(width / 2, height / 2)) // 中心向心力
  .force('collision', d3.forceCollide().radius(18)) // 碰撞检测

// 2. 绑定节点拖拽控制器
const drag = d3.drag()
  .on('start', (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x // 锁定临时X
    d.fy = d.y // 锁定临时Y
  })
  .on('drag', (event, d) => {
    d.fx = event.x
    d.fy = event.y
  })
  .on('end', (event, d) => {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null // 释放坐标
    d.fy = null
  })

// 3. 在 Tick 回调更新中动态计算 SVG 线与圆圈位置
simulation.on('tick', () => {
  link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      
  node.attr('transform', d => \`translate(\${d.x}, \${d.y})\`)
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.d3-demo-container {
  padding-bottom: 24px;
}

.chart-wrapper {
  width: 100%;
  height: 440px;
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  position: relative;
  
  :deep(.links line) {
    transition: stroke-opacity 0.25s, stroke-width 0.2s;
  }

  :deep(.nodes g) {
    transition: opacity 0.25s;
  }
  
  :deep(.nodes circle) {
    transition: r 0.2s, stroke-width 0.2s;
  }
}

.control-card {
  height: 100%;
  
  .card-header {
    font-weight: 600;
  }
}

.control-group {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-color);
  
  .group-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-primary);
  }
}

.control-item-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    
    .circle-bullet {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.4);
    }
  }
}

.w-full {
  width: 100%;
}
</style>
