<template>
  <div class="advanced-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>高级功能</el-breadcrumb-item>
      <el-breadcrumb-item>富文本编辑器</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>TipTap Headless 富文本编辑器</h2>
      <p>体验现代、高度定制化的无头编辑器（Headless Editor）。支持文字样式排版、块级结构设置，并能实时双向同步 HTML/JSON 状态及解析渲染。</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <DemoCard
          title="可视化编辑器 (Tiptap Workspace)"
          description="基于 Tiptap + ProseMirror 构建的无界交互式编辑器。点击工具栏激活排版格式。"
          :code="editorSetupCode"
        >
          <!-- Toolbar -->
          <div v-if="editor" class="editor-toolbar flex flex-wrap gap-1 mb-2">
            <el-tooltip content="粗体 (Bold)" placement="top">
              <el-button 
                :type="editor.isActive('bold') ? 'primary' : 'default'" 
                circle 
                size="small" 
                @click="editor.chain().focus().toggleBold().run()"
              ><strong>B</strong></el-button>
            </el-tooltip>
            
            <el-tooltip content="斜体 (Italic)" placement="top">
              <el-button 
                :type="editor.isActive('italic') ? 'primary' : 'default'" 
                circle 
                size="small" 
                @click="editor.chain().focus().toggleItalic().run()"
              ><em>I</em></el-button>
            </el-tooltip>
            
            <el-tooltip content="删除线 (Strike)" placement="top">
              <el-button 
                :type="editor.isActive('strike') ? 'primary' : 'default'" 
                circle 
                size="small" 
                @click="editor.chain().focus().toggleStrike().run()"
              ><span style="text-decoration: line-through;">S</span></el-button>
            </el-tooltip>
            
            <el-divider direction="vertical" />

            <el-tooltip content="一级标题 (H1)" placement="top">
              <el-button 
                :type="editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'" 
                size="small" 
                @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
              >H1</el-button>
            </el-tooltip>

            <el-tooltip content="二级标题 (H2)" placement="top">
              <el-button 
                :type="editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'" 
                size="small" 
                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              >H2</el-button>
            </el-tooltip>

            <el-tooltip content="三级标题 (H3)" placement="top">
              <el-button 
                :type="editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'" 
                size="small" 
                @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
              >H3</el-button>
            </el-tooltip>

            <el-divider direction="vertical" />

            <el-tooltip content="无序列表 (Bullet List)" placement="top">
              <el-button 
                :type="editor.isActive('bulletList') ? 'primary' : 'default'" 
                size="small" 
                @click="editor.chain().focus().toggleBulletList().run()"
              >• List</el-button>
            </el-tooltip>

            <el-tooltip content="有序列表 (Ordered List)" placement="top">
              <el-button 
                :type="editor.isActive('orderedList') ? 'primary' : 'default'" 
                size="small" 
                @click="editor.chain().focus().toggleOrderedList().run()"
              >1. List</el-button>
            </el-tooltip>

            <el-tooltip content="引用段落 (Blockquote)" placement="top">
              <el-button 
                :type="editor.isActive('blockquote') ? 'primary' : 'default'" 
                size="small" 
                @click="editor.chain().focus().toggleBlockquote().run()"
              >“” Quote</el-button>
            </el-tooltip>

            <el-tooltip content="代码块 (Code Block)" placement="top">
              <el-button 
                :type="editor.isActive('codeBlock') ? 'primary' : 'default'" 
                size="small" 
                @click="editor.chain().focus().toggleCodeBlock().run()"
              >&lt;/&gt;</el-button>
            </el-tooltip>

            <el-divider direction="vertical" />

            <el-tooltip content="撤销 (Undo)" placement="top">
              <el-button 
                size="small" 
                circle
                :disabled="!editor.can().chain().focus().undo().run()"
                @click="editor.chain().focus().undo().run()"
              >↩️</el-button>
            </el-tooltip>

            <el-tooltip content="重做 (Redo)" placement="top">
              <el-button 
                size="small" 
                circle
                :disabled="!editor.can().chain().focus().redo().run()"
                @click="editor.chain().focus().redo().run()"
              >↪️</el-button>
            </el-tooltip>
          </div>

          <!-- Editor area -->
          <div class="editor-viewport">
            <editor-content :editor="editor" />
          </div>

          <!-- Bottom character counter -->
          <div v-if="editor" class="editor-footer flex justify-between mt-2 text-xs text-secondary">
            <span>编辑器状态: 🟢 已连接</span>
            <span>字符数: {{ editor.getText().length }}</span>
          </div>
        </DemoCard>
      </el-col>

      <!-- Right Column: Outputs -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="output-card">
          <template #header>
            <div class="card-header flex justify-between items-center">
              <span class="font-bold">🖥️ 实时输出解析</span>
              <el-radio-group v-model="outputType" size="small">
                <el-radio-button value="html">HTML</el-radio-button>
                <el-radio-button value="json">JSON</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div class="output-viewport">
            <pre v-if="outputType === 'html'" class="code-output"><code>{{ htmlOutput }}</code></pre>
            <pre v-else class="code-output"><code>{{ jsonOutput }}</code></pre>
          </div>
        </el-card>

        <el-card shadow="hover" class="output-card mt-4">
          <template #header>
            <div class="card-header">
              <span class="font-bold">📖 干净的渲染预览 (Reader Preview)</span>
            </div>
          </template>
          <!-- Read-only styled html preview -->
          <div class="preview-viewport tiptap-preview" v-html="htmlOutput"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const outputType = ref<'html' | 'json'>('html')
const htmlOutput = ref('')
const jsonOutput = ref('')

// Initialize Tiptap Editor
const editor = useEditor({
  extensions: [
    StarterKit
  ],
  content: `
    <h2>✨ TipTap 编辑器实践</h2>
    <p>这是一段由 Tiptap 编辑器渲染出来的<b>富文本段落</b>。它基于高性能的 ProseMirror 构建，完全支持以下核心交互：</p>
    <ul>
      <li>使用上面的按钮或者键盘快捷键切换加粗、斜体与删除线。</li>
      <li>支持创建有序、无序列表。</li>
      <li>支持引入引用块 (Blockquote)：</li>
    </ul>
    <blockquote>
      “前端不仅是关于逻辑的实现，更是关于极致交互美学的呈现。”
    </blockquote>
    <p>您可以在这里修改任意内容，右侧的<strong>HTML/JSON数据</strong>以及下方的独立预览卡片将会实时发生双向同步！</p>
  `,
  onUpdate({ editor }) {
    htmlOutput.value = editor.getHTML()
    jsonOutput.value = JSON.stringify(editor.getJSON(), null, 2)
  },
  onCreate({ editor }) {
    htmlOutput.value = editor.getHTML()
    jsonOutput.value = JSON.stringify(editor.getJSON(), null, 2)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const editorSetupCode = `// Tiptap Vue 3 Composition API 基本设置
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>初始段落内容...</p>',
  onUpdate({ editor }) {
    console.log(editor.getHTML()) // 提取 HTML
    console.log(editor.getJSON()) // 提取结构化 JSON
  }
})`
</script>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.advanced-demo-container {
  padding-bottom: 24px;
}

.editor-toolbar {
  padding: 8px;
  background-color: var(--bg-color-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px 8px 0 0;
  border-bottom: none;
}

.editor-viewport {
  border: 1px solid var(--border-color);
  border-radius: 0 0 8px 8px;
  background-color: var(--bg-color-primary);
  min-height: 280px;
  padding: 16px;
  overflow-y: auto;
  outline: none;
  
  .tiptap {
    min-height: 250px;
    outline: none;
    line-height: 1.6;
    color: var(--text-primary);

    p {
      margin-top: 0;
      margin-bottom: 12px;
    }

    h1, h2, h3 {
      color: var(--text-primary);
      margin-top: 18px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    
    h1 { font-size: 1.6rem; }
    h2 { font-size: 1.3rem; }
    h3 { font-size: 1.1rem; }

    ul, ol {
      padding-left: 20px;
      margin-bottom: 16px;
      li {
        margin-bottom: 4px;
      }
    }

    blockquote {
      border-left: 4px solid $primary-color;
      padding-left: 16px;
      margin: 16px 0;
      color: var(--text-secondary);
      font-style: italic;
      background-color: var(--bg-color-secondary);
      padding-top: 8px;
      padding-bottom: 8px;
      border-radius: 0 4px 4px 0;
    }

    pre {
      background-color: var(--bg-color-secondary);
      color: #e5c07b;
      padding: 12px;
      border-radius: 6px;
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      margin: 12px 0;
      border: 1px solid var(--border-color);
    }
  }
}

.output-card {
  height: 240px;
  display: flex;
  flex-direction: column;
  
  :deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    padding: 12px;
  }
  
  .output-viewport {
    height: 100%;
    overflow-y: auto;
    background-color: var(--bg-color-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 10px;
  }
  
  .code-output {
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.preview-viewport {
  height: 100%;
  overflow-y: auto;
  line-height: 1.6;
  color: var(--text-primary);
}

// Styled output styles inside Reader preview card
.tiptap-preview {
  p { margin-top: 0; margin-bottom: 12px; }
  h1, h2, h3 { font-weight: 700; margin-top: 18px; margin-bottom: 12px; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
  h3 { font-size: 1.1rem; }
  ul, ol { padding-left: 20px; margin-bottom: 16px; }
  blockquote {
    border-left: 4px solid $primary-color;
    padding-left: 16px;
    margin: 16px 0;
    color: var(--text-secondary);
    font-style: italic;
    background-color: var(--bg-color-secondary);
    padding-top: 6px;
    padding-bottom: 6px;
    border-radius: 0 4px 4px 0;
  }
  pre {
    background-color: var(--bg-color-secondary);
    padding: 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    overflow-x: auto;
  }
}

.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.gap-1 { gap: 4px; }
.mb-2 { margin-bottom: 8px; }
.mt-4 { margin-top: 16px; }
.font-bold { font-weight: 700; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
</style>
