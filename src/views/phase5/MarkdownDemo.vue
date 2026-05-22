<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工程进阶</el-breadcrumb-item>
      <el-breadcrumb-item>Markdown 实时预览</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Markdown 实时预览编辑器</h2>
      <p>使用 <code>markdown-it</code> 解析 Markdown 语法，配合 <code>shiki</code> 提供带语法高亮的代码块渲染。左侧编辑，右侧实时同步预览。</p>
    </div>

    <!-- Toolbar -->
    <div class="editor-toolbar flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="toolbar-left flex items-center gap-2">
        <el-tooltip content="插入标题" placement="top">
          <el-button size="small" @click="insertText('## 标题\n')">H2</el-button>
        </el-tooltip>
        <el-tooltip content="插入粗体" placement="top">
          <el-button size="small" @click="insertText('**粗体文字**')"><strong>B</strong></el-button>
        </el-tooltip>
        <el-tooltip content="插入斜体" placement="top">
          <el-button size="small" @click="insertText('*斜体文字*')"><em>I</em></el-button>
        </el-tooltip>
        <el-tooltip content="插入代码块" placement="top">
          <el-button size="small" @click="insertCodeBlock">&lt;/&gt;</el-button>
        </el-tooltip>
        <el-tooltip content="插入链接" placement="top">
          <el-button size="small" @click="insertText('[链接文字](https://example.com)')">🔗</el-button>
        </el-tooltip>
        <el-tooltip content="插入无序列表" placement="top">
          <el-button size="small" @click="insertText('- 列表项一\n- 列表项二\n- 列表项三\n')">• List</el-button>
        </el-tooltip>
        <el-divider direction="vertical" />
        <el-select v-model="codeTheme" size="small" style="width:160px" @change="renderMarkdown">
          <el-option label="🌑 GitHub Dark" value="github-dark" />
          <el-option label="☀️ GitHub Light" value="github-light" />
          <el-option label="🎨 Dracula" value="dracula" />
          <el-option label="🌊 Night Owl" value="night-owl" />
          <el-option label="🌿 Everforest Dark" value="everforest-dark" />
        </el-select>
      </div>
      <div class="toolbar-right flex gap-2">
        <el-button size="small" @click="loadSampleDoc">📋 加载示例文档</el-button>
        <el-button size="small" type="primary" @click="exportMarkdown">💾 导出 .md 文件</el-button>
        <el-button size="small" @click="clearEditor">🗑️ 清空</el-button>
      </div>
    </div>

    <!-- Editor + Preview pane -->
    <div class="editor-workspace">
      <!-- Left: Raw Markdown Input -->
      <div class="editor-pane">
        <div class="pane-header">
          <span class="pane-label">✏️ Markdown 源码编辑</span>
          <span class="char-count">{{ markdownSrc.length }} 字符</span>
        </div>
        <textarea
          ref="textareaRef"
          v-model="markdownSrc"
          class="markdown-textarea"
          placeholder="在此输入 Markdown 内容..."
          @input="renderMarkdown"
          spellcheck="false"
        />
      </div>

      <!-- Divider -->
      <div class="pane-divider">
        <div class="divider-line" />
      </div>

      <!-- Right: Rendered HTML Preview -->
      <div class="preview-pane">
        <div class="pane-header">
          <span class="pane-label">👁️ 渲染预览 (HTML)</span>
          <el-tag size="small" type="success">实时同步</el-tag>
        </div>
        <div
          v-if="isRendering"
          class="rendering-indicator flex items-center justify-center"
        >
          <el-icon class="is-loading"><Loading /></el-icon>
          <span class="ml-2 text-sm text-secondary">Shiki 代码高亮渲染中...</span>
        </div>
        <div
          v-else
          class="markdown-preview"
          v-html="renderedHtml"
        />
      </div>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar flex gap-4 mt-2 text-xs text-secondary">
      <span>📝 单词数: {{ wordCount }}</span>
      <span>📄 行数: {{ lineCount }}</span>
      <span>🔤 字符数: {{ markdownSrc.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import { createHighlighter } from 'shiki'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

// ─── Markdown-it instance ─────────────────────────────────────────────
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// ─── State ───────────────────────────────────────────────────────────
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const codeTheme = ref<string>('github-dark')
const renderedHtml = ref('')
const isRendering = ref(false)
let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null

const markdownSrc = ref(`# 👋 欢迎使用 Markdown 实时预览编辑器

这是一个基于 **markdown-it** 解析引擎 + **Shiki** 语法高亮的实时双栏预览编辑器。

## ✨ 支持的语法

### 文字样式

- **粗体文字** 与 *斜体文字*
- ~~删除线~~ 和 \`内联代码\`
- [超链接跳转](https://github.com/vuejs/vue)

### 代码块（支持 16+ 种语言高亮）

\`\`\`typescript
// TypeScript: TanStack Query 乐观更新示例
const mutation = useMutation({
  mutationFn: createPost,
  onMutate: async (newPost) => {
    await queryClient.cancelQueries({ queryKey: ['posts'] })
    const previous = queryClient.getQueryData(['posts'])
    queryClient.setQueryData(['posts'], (old: Post[]) => [newPost, ...old])
    return { previous }
  },
  onError: (_err, _vars, ctx) => {
    queryClient.setQueryData(['posts'], ctx?.previous)
  }
})
\`\`\`

\`\`\`vue
<!-- Vue 3 Composition API -->
<script setup lang="ts">
import { ref, computed } from 'vue'
const count = ref(0)
const doubled = computed(() => count.value * 2)
<\/script>
\`\`\`

### 引用与表格

> 💡 "好的代码不仅仅是运行正确的代码，更是能够被团队理解和维护的代码。"

| 库名 | 体积 (gzip) | 适用场景 |
|------|------------|---------|
| markdown-it | ~35 kB | 通用 Markdown 解析 |
| Shiki | ~150 kB+ | 精准代码语法高亮 |
| marked | ~20 kB | 轻量快速解析 |

### 有序列表

1. 安装依赖：\`npm install markdown-it shiki\`
2. 初始化 Shiki 高亮器（支持 async/await）
3. 将 Shiki 整合为 markdown-it 的自定义代码渲染器
4. 在模板中使用 \`v-html\` 渲染最终 HTML
`)

const wordCount = computed(() => markdownSrc.value.trim().split(/\s+/).filter(Boolean).length)
const lineCount = computed(() => markdownSrc.value.split('\n').length)

// ─── Shiki Highlighter setup ─────────────────────────────────────────
const initHighlighter = async () => {
  highlighter = await createHighlighter({
    themes: ['github-dark', 'github-light', 'dracula', 'night-owl', 'everforest-dark'],
    langs: ['typescript', 'javascript', 'vue', 'python', 'bash', 'css', 'json', 'html', 'rust', 'go']
  })
}

// ─── Render Markdown ─────────────────────────────────────────────────
const renderMarkdown = async () => {
  if (!highlighter) return
  isRendering.value = true

  // Custom fence renderer with Shiki
  md.renderer.rules.fence = (tokens: Token[], idx: number) => {
    const token = tokens[idx]
    const lang = token.info.trim() || 'text'
    const code = token.content

    try {
      const html = highlighter!.codeToHtml(code, {
        lang: lang as any,
        theme: codeTheme.value
      })
      return html
    } catch {
      return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`
    }
  }

  // Small delay to batch rapid typing
  await new Promise(r => setTimeout(r, 60))
  renderedHtml.value = md.render(markdownSrc.value)
  isRendering.value = false
}

// ─── Toolbar Helpers ─────────────────────────────────────────────────
const insertText = (text: string) => {
  const textarea = textareaRef.value
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  markdownSrc.value = markdownSrc.value.slice(0, start) + text + markdownSrc.value.slice(end)
  // Move cursor after inserted text
  const newPos = start + text.length
  setTimeout(() => {
    textarea.setSelectionRange(newPos, newPos)
    textarea.focus()
  }, 0)
  renderMarkdown()
}

const insertCodeBlock = () => {
  insertText('\n```typescript\n// 在此输入代码\n```\n')
}

const loadSampleDoc = () => {
  // Already loaded, just show success
  ElMessage.success('示例文档已是当前内容！')
}

const exportMarkdown = () => {
  const blob = new Blob([markdownSrc.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notes_${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('Markdown 文件已下载！')
}

const clearEditor = () => {
  markdownSrc.value = ''
  renderedHtml.value = ''
}

onMounted(async () => {
  await initHighlighter()
  await renderMarkdown()
})
</script>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.editor-toolbar {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 14px;
}

.editor-workspace {
  display: flex;
  gap: 0;
  height: 560px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.editor-pane, .preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--bg-color-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);

  .char-count {
    font-family: monospace;
    font-weight: 400;
    font-size: 0.75rem;
  }
}

.pane-label { color: var(--text-primary); }

.pane-divider {
  width: 1px;
  background: var(--border-color);
  flex-shrink: 0;
}

.markdown-textarea {
  flex: 1;
  padding: 16px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.7;
  background: var(--bg-color-primary);
  color: var(--text-primary);
  border: none;
  outline: none;
  resize: none;
  @include custom-scrollbar;

  &::placeholder { color: var(--text-secondary); }
}

.rendering-indicator {
  flex: 1;
  gap: 8px;
}

.markdown-preview {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-color-primary);
  line-height: 1.7;
  color: var(--text-primary);
  @include custom-scrollbar;

  // Markdown Styles
  h1, h2, h3, h4 {
    color: var(--text-primary);
    font-weight: 700;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  h1 { font-size: 1.6rem; border-bottom: 2px solid var(--border-color); padding-bottom: 8px; }
  h2 { font-size: 1.3rem; }
  h3 { font-size: 1.1rem; }

  p { margin-bottom: 12px; }

  a { color: $primary-color; text-decoration: none; &:hover { text-decoration: underline; } }

  blockquote {
    border-left: 4px solid $primary-color;
    padding: 8px 16px;
    margin: 16px 0;
    background: var(--bg-color-secondary);
    border-radius: 0 6px 6px 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  code {
    background: var(--bg-color-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 0.85em;
    color: #e11d48;
  }

  // Shiki code blocks override
  .shiki {
    border-radius: 8px;
    margin: 16px 0;
    font-size: 0.83rem;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }
  }

  ul, ol { padding-left: 20px; margin-bottom: 12px; li { margin-bottom: 6px; } }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    font-size: 0.87rem;

    th, td { border: 1px solid var(--border-color); padding: 8px 12px; }
    th { background: var(--bg-color-secondary); font-weight: 600; }
    tr:hover td { background: rgba(99, 102, 241, 0.03); }
  }

  del { text-decoration: line-through; color: var(--text-secondary); }
  strong { font-weight: 700; }
  em { font-style: italic; }
}

.stats-bar { padding: 6px 2px; }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.ml-2 { margin-left: 8px; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.85rem; }
.text-secondary { color: var(--text-secondary); }
.justify-center { justify-content: center; }
</style>
