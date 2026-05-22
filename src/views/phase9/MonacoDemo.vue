<template>
  <div class="monaco-demo">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>专业场景集成</el-breadcrumb-item>
      <el-breadcrumb-item>Monaco Editor 在线代码编辑器</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Header -->
    <div class="header-desc">
      <h2>Monaco Editor 在线代码编辑器</h2>
      <p>
        Monaco Editor 是驱动 VS Code 的核心浏览器端代码编辑器。它具备一流的代码高亮、
        智能补全（IntelliSense）、键盘快捷键绑定、多光标编辑以及代码差异比对（Diff）等特性。
        是开发云 IDE、在线代码运行沙箱、配置中心后台不可替代的组件。
      </p>
    </div>

    <el-row :gutter="20">
      <!-- Editor Column -->
      <el-col :span="24">
        <DemoCard
          title="Monaco Editor 实时体验"
          description="点击切换语言和样式配置，在代码编辑器中输入代码并模拟执行。"
          :code="demoCode"
        >
          <div class="editor-playground">
            <!-- Toolbar controls -->
            <div class="editor-toolbar">
              <div class="toolbar-left">
                <div class="control-item">
                  <span class="label">语言:</span>
                  <el-select v-model="selectedLanguage" style="width: 140px" @change="onLanguageChange">
                    <el-option label="TypeScript" value="typescript" />
                    <el-option label="JavaScript" value="javascript" />
                    <el-option label="HTML" value="html" />
                    <el-option label="CSS" value="css" />
                    <el-option label="JSON" value="json" />
                    <el-option label="Python" value="python" />
                  </el-select>
                </div>

                <div class="control-item">
                  <span class="label">主题:</span>
                  <el-select v-model="selectedTheme" style="width: 130px" @change="onThemeChange">
                    <el-option label="VS Dark" value="vs-dark" />
                    <el-option label="VS Light" value="vs" />
                    <el-option label="High Contrast" value="hc-black" />
                  </el-select>
                </div>

                <div class="control-item">
                  <span class="label">字号:</span>
                  <el-slider v-model="fontSize" :min="12" :max="22" :step="1" style="width: 100px" @input="updateOptions" />
                </div>
              </div>

              <div class="toolbar-right">
                <el-button type="success" plain @click="formatDocument">
                  🧹 格式化代码
                </el-button>
                <el-button type="primary" plain @click="copyCode">
                  📋 复制代码
                </el-button>
                <el-button type="primary" @click="runCode" :loading="isRunning">
                  🚀 运行代码
                </el-button>
              </div>
            </div>

            <!-- Monaco Target DOM -->
            <div ref="editorContainer" class="editor-container" />

            <!-- Output/Terminal window -->
            <div class="output-console">
              <div class="console-header">💻 模拟控制台输出</div>
              <div class="console-body">
                <div v-if="outputLines.length === 0" class="empty-line">等待代码执行...</div>
                <div v-for="(line, idx) in outputLines" :key="idx" class="console-line">
                  {{ line }}
                </div>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DemoCard from '@/components/common/DemoCard.vue'
import { ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'

// ─── Monaco Worker Configuration (Vite ESM style) ───────────────────────────
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

// ─── State ───────────────────────────────────────────────────────────────────
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

const selectedLanguage = ref('typescript')
const selectedTheme = ref('vs-dark')
const fontSize = ref(14)
const isRunning = ref(false)
const outputLines = ref<string[]>([])

// ─── Code Templates ──────────────────────────────────────────────────────────
const codeTemplates: Record<string, string> = {
  typescript: `// TypeScript 泛型类示例
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

class UserRegistry<T extends User> {
  private users: T[] = [];

  register(user: T): void {
    this.users.push(user);
    console.log(\`Successfully registered user: \${user.name}\`);
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }
}

const registry = new UserRegistry<User>();
registry.register({ id: 1, name: "Antigravity", role: "admin" });
registry.register({ id: 2, name: "VueDeveloper", role: "user" });

console.log("Total Admin Users:", registry.getAdminCount());`,

  javascript: `// ES6/ESNext 常用工具特性
const fetchUserInfo = async (userId) => {
  try {
    const response = await fetch(\`https://api.github.com/users/\${userId}\`);
    const data = await response.json();
    return {
      login: data.login,
      publicRepos: data.public_repos ?? 0,
    };
  } catch (error) {
    console.error("Fetch API error:", error);
  }
};

fetchUserInfo("vuejs").then(res => {
  console.log("Fetched Github Account Details:", res);
});`,

  html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Monaco HTML Demo</title>
  <style>
    body { font-family: sans-serif; background: #fafafa; }
    h1 { color: #42b983; }
  </style>
</head>
<body>
  <h1>Hello Monaco Editor!</h1>
  <p>通过 Monaco，你可以像在 VS Code 里一样享受极度流畅的 HTML 编写体验。</p>
</body>
</html>`,

  css: `/* CSS Grid 布局自适应系统 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 16px;
  background-color: var(--bg-color);
}

.grid-item {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.grid-item:hover {
  transform: translateY(-5px);
}`,

  json: `{
  "name": "vue3-libs-playground",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build"
  },
  "dependencies": {
    "vue": "^3.5.34",
    "monaco-editor": "^0.55.1"
  }
}`,

  python: `# Python 数据处理演示
import json

class MetricCalculator:
    def __init__(self, data):
        self.data = data

    def get_average(self):
        if not self.data:
            return 0
        return sum(self.data) / len(self.data)

calculator = MetricCalculator([12.5, 45.2, 78.9, 100.0])
print(f"Calculated average value: {calculator.get_average():.2f}")`
}

// ─── Actions & Lifecycle ───────────────────────────────────────────────────────
const initEditor = () => {
  if (!editorContainer.value) return

  editor = monaco.editor.create(editorContainer.value, {
    value: codeTemplates[selectedLanguage.value],
    language: selectedLanguage.value,
    theme: selectedTheme.value,
    fontSize: fontSize.value,
    fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
    minimap: { enabled: true },
    automaticLayout: true,
    tabSize: 2,
    cursorBlinking: 'blink',
  })
}

const onLanguageChange = () => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, selectedLanguage.value)
      editor.setValue(codeTemplates[selectedLanguage.value])
    }
  }
}

const onThemeChange = () => {
  monaco.editor.setTheme(selectedTheme.value)
}

const updateOptions = () => {
  if (editor) {
    editor.updateOptions({
      fontSize: fontSize.value,
    })
  }
}

const formatDocument = () => {
  if (editor) {
    editor.getAction('editor.action.formatDocument')?.run()
  }
}

const copyCode = async () => {
  if (editor) {
    const val = editor.getValue()
    try {
      await navigator.clipboard.writeText(val)
      ElMessage.success('代码已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }
}

const runCode = () => {
  isRunning.value = true
  outputLines.value = []
  
  setTimeout(() => {
    outputLines.value.push(`[${new Date().toLocaleTimeString()}] 🚀 开始执行 ${selectedLanguage.value.toUpperCase()} 代码...`)
    
    // Parse simulated output based on language
    if (selectedLanguage.value === 'typescript') {
      outputLines.value.push(`[Console] Successfully registered user: Antigravity`)
      outputLines.value.push(`[Console] Successfully registered user: VueDeveloper`)
      outputLines.value.push(`[Console] Total Admin Users: 1`)
    } else if (selectedLanguage.value === 'javascript') {
      outputLines.value.push(`[Console] Fetching Github details for "vuejs"...`)
      outputLines.value.push(`[Console] Fetched Github Account Details: { login: "vuejs", publicRepos: 96 }`)
    } else if (selectedLanguage.value === 'python') {
      outputLines.value.push(`[Console] Calculated average value: 59.15`)
    } else {
      outputLines.value.push(`[Console] (此语言无特制 Mock 输出，代码校验成功)`)
    }

    outputLines.value.push(`[${new Date().toLocaleTimeString()}] ✨ 进程执行完毕 (Process exited with code 0)`)
    isRunning.value = false
  }, 1000)
}

onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

// ─── Static Code Snippet ──────────────────────────────────────────────────────
const demoCode = `import * as monaco from 'monaco-editor'

// 1. 初始化编辑器组件
const editor = monaco.editor.create(editorContainer, {
  value: '// Write code here\\n',
  language: 'typescript',
  theme: 'vs-dark',
  fontSize: 14
})

// 2. 动态修改语言属性
const model = editor.getModel()
if (model) {
  monaco.editor.setModelLanguage(model, 'javascript')
}

// 3. 动态配置主题
monaco.editor.setTheme('vs')

// 4. 获取/设置编辑器文本
const codeText = editor.getValue()
editor.setValue('const msg = "new text"')`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.monaco-demo {
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

.editor-playground {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 10px 16px;
  background: var(--bg-color-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--text-secondary);

    .label {
      font-weight: 600;
    }
  }
}

.editor-container {
  height: 480px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.output-console {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);

  .console-header {
    background-color: #1e1e2e;
    color: #a6adc8;
    padding: 8px 16px;
    font-size: 0.8rem;
    font-family: monospace;
    border-bottom: 1px solid #313244;
  }

  .console-body {
    background-color: #181825;
    color: #cdd6f4;
    padding: 14px 16px;
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    min-height: 100px;
    max-height: 180px;
    overflow-y: auto;
    line-height: 1.6;

    .empty-line {
      color: #585b70;
      font-style: italic;
    }

    .console-line {
      margin-bottom: 4px;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
