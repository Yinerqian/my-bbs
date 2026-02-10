<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import 'github-markdown-css/github-markdown-light.css' // Use light theme for base
import hljs from 'highlight.js'
import 'highlight.js/styles/stackoverflow-light.css' // Or any other high-contrast theme

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  langPrefix: 'hljs language-',
})

const renderedHtml = computed(() => {
  if (!props.content) return ''
  return marked(props.content)
})
</script>

<style scoped>
.markdown-body {
  background: transparent !important;
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.8;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  border-bottom-color: #000;
  color: #000;
}

.markdown-body :deep(:not(pre) > code) {
  background: #f4f4f5;
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 600;
}

.markdown-body :deep(pre) {
  background: #fff !important;
  border: 3px solid #000;
  border-radius: 0;
  padding: 16px;
  overflow-x: auto;
  box-shadow: 6px 6px 0 #000;
  margin: 24px 0;
}

/* Remove scoped styles that might conflict */
.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
  color: inherit;
  white-space: pre;
}

/* Force specific colors for highlighting classes to ensure visibility */
.markdown-body :deep(.hljs-keyword),
.markdown-body :deep(.hljs-selector-tag),
.markdown-body :deep(.hljs-literal),
.markdown-body :deep(.hljs-section),
.markdown-body :deep(.hljs-link) {
  color: #d73a49;
}

.markdown-body :deep(.hljs-string),
.markdown-body :deep(.hljs-title),
.markdown-body :deep(.hljs-name),
.markdown-body :deep(.hljs-type),
.markdown-body :deep(.hljs-attribute),
.markdown-body :deep(.hljs-symbol),
.markdown-body :deep(.hljs-bullet),
.markdown-body :deep(.hljs-addition),
.markdown-body :deep(.hljs-variable),
.markdown-body :deep(.hljs-template-tag),
.markdown-body :deep(.hljs-template-variable) {
  color: #032f62;
}

.markdown-body :deep(.hljs-comment),
.markdown-body :deep(.hljs-quote),
.markdown-body :deep(.hljs-meta) {
  color: #6a737d;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--primary);
  color: var(--text-secondary);
  background: var(--primary-bg);
  padding: 12px 16px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.markdown-body :deep(table) {
  border-color: var(--border-color);
}

.markdown-body :deep(td),
.markdown-body :deep(th) {
  border-color: var(--border-color);
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
}

.markdown-body :deep(a) {
  color: var(--primary-light);
}

.markdown-body :deep(hr) {
  border-color: var(--border-color);
}
</style>
