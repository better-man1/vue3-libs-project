<template>
  <div class="xterm-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>专业场景集成</el-breadcrumb-item>
      <el-breadcrumb-item>XTerm.js Web 终端</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>XTerm.js Web 终端模拟器</h2>
      <p>
        XTerm.js 是一个用 TypeScript 编写的前端组件，允许开发者在浏览器中实现功能完整的终端。
        它是 VS Code、Hyper 等众多编辑器和云开发环境 Web 终端的底层核心。支持 WebGL 加速渲染、
        富文本颜色样式（ANSI 转义序列）、多链接检测以及插件体系扩展。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Left Terminal -->
      <el-col :lg="16" :md="24">
        <DemoCard
          title="网页终端沙盒"
          description="点击右侧预设命令可直接在终端中运行，支持键盘实时输入交互。本终端为前端虚拟文件系统沙盒。"
          :code="demoCode"
        >
          <div class="terminal-container">
            <!-- macOS Style Window Header -->
            <div class="terminal-header-bar">
              <div class="dots">
                <span class="dot dot-red" />
                <span class="dot dot-yellow" />
                <span class="dot dot-green" />
              </div>
              <div class="window-title">bash - vue-playground@web-terminal</div>
            </div>

            <!-- Terminal DOM Target -->
            <div ref="terminalRef" class="terminal-body" />

            <!-- Terminal Status Bar -->
            <div class="terminal-status-bar">
              <span>状态: <el-tag size="small" type="success">连接就绪</el-tag></span>
              <span class="ml-2">当前路径: <code>{{ currentPath }}</code></span>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right Settings & Quick Commands -->
      <el-col :lg="8" :md="24">
        <!-- Settings Panel -->
        <el-card class="settings-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>⚙️ 终端显示设置</span>
            </div>
          </template>
          <div class="settings-list">
            <div class="setting-item">
              <label>字体大小</label>
              <div class="slider-row">
                <el-slider v-model="fontSize" :min="12" :max="22" :step="1" @change="updateOptions" />
                <span class="value">{{ fontSize }}px</span>
              </div>
            </div>

            <div class="setting-item">
              <label>光标样式</label>
              <el-radio-group v-model="cursorStyle" size="small" @change="updateOptions">
                <el-radio-button label="block">█ 块状</el-radio-button>
                <el-radio-button label="underline">_ 下划线</el-radio-button>
                <el-radio-button label="bar">| 竖线</el-radio-button>
              </el-radio-group>
            </div>

            <div class="setting-item">
              <label>终端色彩主题</label>
              <el-select v-model="selectedTheme" placeholder="选择主题" @change="updateTheme">
                <el-option label="Default Dark" value="dark" />
                <el-option label="Dracula Dark" value="dracula" />
                <el-option label="Material Light" value="light" />
                <el-option label="Monokai" value="monokai" />
              </el-select>
            </div>
          </div>
        </el-card>

        <!-- Quick Commands Panel -->
        <el-card class="quick-commands-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>⚡ 快捷命令传送门</span>
            </div>
          </template>
          <div class="commands-grid">
            <el-button size="small" type="primary" plain @click="runPresetCommand('help')">
              ❓ help (帮助)
            </el-button>
            <el-button size="small" type="primary" plain @click="runPresetCommand('ls -la')">
              📁 ls -la (列出文件)
            </el-button>
            <el-button size="small" type="primary" plain @click="runPresetCommand('pwd')">
              📍 pwd (路径)
            </el-button>
            <el-button size="small" type="primary" plain @click="runPresetCommand('cat package.json')">
              📄 cat package.json
            </el-button>
            <el-button size="small" type="primary" plain @click="runPresetCommand('node -v')">
              🟢 node -v
            </el-button>
            <el-button size="small" type="primary" plain @click="runPresetCommand('uname -a')">
              🖥️ uname -a (系统型)
            </el-button>
            <el-button size="small" type="warning" plain @click="runPresetCommand('clear')">
              🧹 clear (清屏)
            </el-button>
          </div>
        </el-card>

        <!-- Docs Card -->
        <el-card class="docs-card" shadow="hover" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>💡 使用说明</span>
            </div>
          </template>
          <div class="docs-content">
            <p><strong>XTerm.js</strong> 负责解析 ANSI 字符和按键数据流：</p>
            <ul>
              <li>在实际的商业项目中，XTerm.js 通常使用 <strong>WebSocket</strong> 协议与服务端的 <strong>Pty</strong>（伪终端进程，如 node-pty）建立实时双向连接。</li>
              <li>本演示为方便在浏览器内本地调试，实现了一套<strong>内存级轻量级 Shell 命令解析器</strong>，能模拟绝大部分常见 Bash 动作。</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

// XTerm core styles
import '@xterm/xterm/css/xterm.css'

// ─── State ───────────────────────────────────────────────────────────────────
const terminalRef = ref<HTMLDivElement | null>(null)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null

const fontSize = ref(14)
const cursorStyle = ref<'block' | 'underline' | 'bar'>('block')
const selectedTheme = ref<'dark' | 'dracula' | 'light' | 'monokai'>('dark')
const currentPath = ref('~/workspace')

let cmdBuffer = ''

// ─── Simulated File System ───────────────────────────────────────────────────
const fileSystem: Record<string, string[]> = {
  '~/workspace': ['src/', 'public/', 'package.json', 'vite.config.ts', 'README.md'],
  '~/workspace/src': ['main.ts', 'App.vue', 'views/', 'components/', 'router/'],
}

const fileContents: Record<string, string> = {
  'package.json': `{
  "name": "vue3-libs-playground",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.5.34",
    "element-plus": "^2.14.0",
    "@xterm/xterm": "^6.0.0"
  }
}`,
  'README.md': `# Vue3 Libs Playground
本画板演示了包含 Element Plus、D3、ECharts、Three.js、XTerm.js、Monaco Editor 在内的各种三方库。`,
  'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()]
})`
}

// ─── XTerm Themes ────────────────────────────────────────────────────────────
const themes = {
  dark: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    cursor: '#6366f1',
    selectionBackground: '#313244',
  },
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#bd93f9',
    selectionBackground: '#44475a',
  },
  light: {
    background: '#f8fafc',
    foreground: '#0f172a',
    cursor: '#6366f1',
    selectionBackground: '#cbd5e1',
  },
  monokai: {
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f92672',
    selectionBackground: '#49483e',
  }
}

// ─── Terminal Logic ──────────────────────────────────────────────────────────
const initTerminal = () => {
  if (!terminalRef.value) return

  term = new Terminal({
    cursorBlink: true,
    fontSize: fontSize.value,
    fontFamily: '"JetBrains Mono", Consolas, monospace',
    cursorStyle: cursorStyle.value,
    theme: themes[selectedTheme.value],
    allowProposedApi: true,
  })

  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)

  term.open(terminalRef.value)
  fitAddon.fit()

  // Welcome Messages
  term.writeln('\x1b[1;36m╔════════════════════════════════════════════════════════════╗\x1b[0m')
  term.writeln('\x1b[1;36m║               Vue 3 XTerm.js 沙盒终端 v1.0.0               ║\x1b[0m')
  term.writeln('\x1b[1;36m╚════════════════════════════════════════════════════════════╝\x1b[0m')
  term.writeln('\x1b[90m提示: 本终端运行于浏览器前端模拟沙箱。输入 help 获得全部指令清单。\x1b[0m')
  term.writeln('')
  
  writePrompt()

  // Handle data input
  term.onData((data) => {
    if (!term) return
    const code = data.charCodeAt(0)
    
    if (data === '\r') {
      // Enter
      term.writeln('')
      if (cmdBuffer.trim()) {
        executeCommand(cmdBuffer.trim())
      } else {
        writePrompt()
      }
      cmdBuffer = ''
    } else if (code === 127) {
      // Backspace
      if (cmdBuffer.length > 0) {
        cmdBuffer = cmdBuffer.slice(0, -1)
        term.write('\b \b')
      }
    } else if (code < 32) {
      // Ignore other control keys in simple sim
    } else {
      cmdBuffer += data
      term.write(data)
    }
  })

  // Resize handler
  window.addEventListener('resize', handleResize)
}

const writePrompt = () => {
  if (term) {
    term.write(`\x1b[1;32mvue-dev@playground\x1b[0m:\x1b[1;34m${currentPath.value}\x1b[0m$ `)
  }
}

const executeCommand = (line: string) => {
  if (!term) return

  const args = line.split(' ')
  const cmd = args[0].toLowerCase()

  switch (cmd) {
    case 'help':
      term.writeln('\x1b[1;33m当前可用前端模拟指令:\x1b[0m')
      term.writeln('  help             显示此命令手册')
      term.writeln('  ls [-la]         列出当前文件夹下的文件及目录')
      term.writeln('  pwd              查看当前工作路径')
      term.writeln('  cd [dir]         进入特定文件夹 (支持 cd .. 级联)')
      term.writeln('  cat [file]       打印文本文件内容')
      term.writeln('  node -v          显示当前模拟 Node 版本')
      term.writeln('  uname -a         输出虚拟内核版本信息')
      term.writeln('  clear            清除屏幕内容')
      break
    
    case 'ls':
      const files = fileSystem[currentPath.value] || []
      const isLong = args.includes('-la') || args.includes('-l')
      
      if (files.length === 0) {
        term.writeln('(当前文件夹为空)')
      } else {
        files.forEach((file) => {
          const isDir = file.endsWith('/')
          if (isLong) {
            const time = new Date().toLocaleString()
            const type = isDir ? 'drwxr-xr-x' : '-rw-r--r--'
            const size = isDir ? '4096' : ' 234'
            const colorPrefix = isDir ? '\x1b[1;34m' : ''
            const colorSuffix = isDir ? '\x1b[0m' : ''
            term?.writeln(`${type}  1 vue-user  staff  ${size} ${time} ${colorPrefix}${file}${colorSuffix}`)
          } else {
            const colorPrefix = isDir ? '\x1b[1;34m' : ''
            const colorSuffix = isDir ? '\x1b[0m' : ''
            term?.write(`${colorPrefix}${file}${colorSuffix}  `)
          }
        })
        if (!isLong) term.writeln('')
      }
      break

    case 'pwd':
      term.writeln(currentPath.value)
      break

    case 'cd':
      const target = args[1] || ''
      if (!target || target === '~') {
        currentPath.value = '~/workspace'
      } else if (target === '..') {
        if (currentPath.value === '~/workspace/src') {
          currentPath.value = '~/workspace'
        } else {
          term.writeln('已是根节点')
        }
      } else {
        const checkDir = target.endsWith('/') ? target : `${target}/`
        const filesInPath = fileSystem[currentPath.value] || []
        
        if (filesInPath.includes(checkDir)) {
          currentPath.value = `${currentPath.value}/${target}`
        } else {
          term.writeln(`cd: 找不到名为 "${target}" 的文件夹`)
        }
      }
      break

    case 'cat':
      const file = args[1]
      if (!file) {
        term.writeln('cat: 请指定文件名。例如: cat package.json')
      } else {
        const content = fileContents[file]
        if (content) {
          term.writeln(content)
        } else {
          term.writeln(`cat: ${file}: 找不到此文件或并非文本文件`)
        }
      }
      break

    case 'node':
      if (args[1] === '-v' || args[1] === '--version') {
        term.writeln('v20.12.2 (Mock Web Sandbox)')
      } else {
        term.writeln('node: 目前本画板仅支持 node -v 查看版本')
      }
      break

    case 'uname':
      if (args[1] === '-a') {
        term.writeln('Darwin vue-terminal-sandbox.local 23.4.0 Darwin Kernel Version 23.4.0: x86_64')
      } else {
        term.writeln('Darwin')
      }
      break

    case 'clear':
      term.clear()
      break

    default:
      term.writeln(`bash: ${cmd}: 找不到此命令。请输入 help 查看命令。`)
      break
  }

  writePrompt()
}

// ─── Actions & Settings ───────────────────────────────────────────────────────
const runPresetCommand = (command: string) => {
  if (!term) return
  
  // Wipe buffer
  cmdBuffer = ''
  
  // Print Command
  term.write(command)
  term.writeln('')
  
  // Execute
  executeCommand(command)
}

const updateOptions = () => {
  if (term) {
    term.options.fontSize = fontSize.value
    term.options.cursorStyle = cursorStyle.value
    fitAddon?.fit()
  }
}

const updateTheme = () => {
  if (term) {
    term.options.theme = themes[selectedTheme.value]
  }
}

const handleResize = () => {
  fitAddon?.fit()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  initTerminal()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (term) {
    term.dispose()
    term = null
  }
})

// ─── Static Code Snippet ──────────────────────────────────────────────────────
const demoCode = `import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

// 1. 实例初始化与挂载
const term = new Terminal({
  cursorBlink: true,
  theme: { background: '#0d1117' }
})

const fitAddon = new FitAddon()
term.loadAddon(fitAddon)

term.open(terminalRef.value)
fitAddon.fit()

// 2. 数据输入输出监听
term.writeln('Welcome to XTerm.js!')
term.onData((data) => {
  term.write(data) // 回显输入
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.xterm-demo {
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

.terminal-container {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  border: 1px solid var(--border-color);
}

.terminal-header-bar {
  background: #161b22;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  position: relative;
  border-bottom: 1px solid #21262d;

  .dots {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }

  .window-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: #8b949e;
    font-size: 0.82rem;
    font-family: monospace;
  }
}

.terminal-body {
  padding: 12px;
  background-color: #0d1117;
  height: 380px;

  :deep(.xterm) {
    height: 100%;
    .xterm-viewport {
      background-color: #0d1117 !important;
    }
  }
}

.terminal-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #161b22;
  color: #8b949e;
  font-size: 0.8rem;
  font-family: monospace;
  border-top: 1px solid #21262d;

  code {
    color: #58a6ff;
  }
}

.settings-card, .quick-commands-card, .docs-card {
  border-radius: 12px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      .el-slider { flex: 1; }
      .value { font-size: 0.8rem; font-weight: 700; color: $primary-color; }
    }
  }
}

.commands-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  .el-button {
    margin: 0 !important;
    justify-content: flex-start;
  }
}

.docs-content {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  
  p { margin: 0 0 8px; }
  ul { padding-left: 18px; margin: 0; }
}

.ml-2 {
  margin-left: 8px;
}
</style>
