<template>
  <div class="editor-page page-container">
    <!-- Header -->
    <div class="page-header editor-header">
      <div class="header-left">
        <router-link to="/admin" class="back-link">← ADMIN</router-link>
        <h1 class="page-title">{{ isEdit ? 'EDIT POST' : 'NEW POST' }}</h1>
      </div>
      <div class="editor-actions">
        <button class="action-btn btn-draft" @click="handleSave(false)" :disabled="saving">
          SAVE DRAFT
        </button>
        <button class="action-btn btn-pub" @click="handleSave(true)" :disabled="saving">
          PUBLISH NOW
        </button>
      </div>
    </div>

    <div v-loading="loadingPost" class="editor-body">
      <!-- Meta -->
      <div class="meta-card">
        <div class="form-row">
          <div class="form-group flex-2">
            <label>TITLE</label>
            <input v-model="form.title" class="brutal-input" placeholder="POST TITLE..." />
          </div>
          <div class="form-group flex-1">
            <label>SLUG</label>
            <div class="slug-input-wrapper">
              <span class="slug-prefix">/post/</span>
              <input v-model="form.slug" class="brutal-input no-left-border" placeholder="url-slug..." />
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>EXCERPT</label>
          <textarea v-model="form.excerpt" class="brutal-input" rows="2" placeholder="Short description..."></textarea>
        </div>
      </div>

      <!-- Split Editor -->
      <div class="editor-split">
        <!-- Edit -->
        <div class="editor-pane edit-pane">
          <div class="pane-header">
            <span>MARKDOWN</span>
            <span class="pane-badge">EDIT</span>
          </div>
          <textarea
            v-model="form.content"
            class="editor-textarea"
            placeholder="Write content here..."
            spellcheck="false"
          ></textarea>
        </div>

        <!-- Preview -->
        <div class="editor-pane preview-pane">
          <div class="pane-header">
            <span>PREVIEW</span>
            <span class="pane-badge badge-green">LIVE</span>
          </div>
          <div class="editor-preview">
            <MarkdownRenderer :content="form.content" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../supabase'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '../../components/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const loadingPost = ref(false)

const form = reactive({
  title: '',
  content: '',
  excerpt: '',
  slug: '',
})

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || `post-${Date.now()}`
}

async function loadPost() {
  if (!isEdit.value) return
  loadingPost.value = true
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', route.params.id)
      .single()
    if (error) throw error

    form.title = data.title
    form.content = data.content
    form.excerpt = data.excerpt || ''
    form.slug = data.slug
  } catch (err) {
    ElMessage.error('Load failed')
    router.push('/admin')
  } finally {
    loadingPost.value = false
  }
}

async function handleSave(publish) {
  if (!form.title.trim()) return ElMessage.warning('Title required')
  if (!form.content.trim()) return ElMessage.warning('Content required')

  if (!form.slug.trim()) {
    form.slug = generateSlug(form.title)
  }

  saving.value = true
  try {
    const postData = {
      title: form.title.trim(),
      content: form.content,
      excerpt: form.excerpt.trim(),
      slug: form.slug.trim(),
      published: publish,
      updated_at: new Date().toISOString(),
    }

    if (isEdit.value) {
      const { error } = await supabase.from('posts').update(postData).eq('id', route.params.id)
      if (error) throw error
    } else {
      postData.author_id = userStore.session.user.id
      const { error } = await supabase.from('posts').insert(postData)
      if (error) throw error
    }

    ElMessage.success(publish ? 'PUBLISHED!' : 'SAVED DRAFT')
    router.push('/admin')
  } catch (err) {
    if (err.message?.includes('duplicate key')) {
      ElMessage.error('Slug taken')
    } else {
      ElMessage.error('Error: ' + err.message)
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadPost)
</script>

<style scoped>
.editor-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 4px solid #000;
  padding-bottom: 24px;
}

.back-link {
  font-weight: 800;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 8px;
}

.editor-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  border: 2px solid #000;
  font-weight: 800;
  font-size: 16px;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.btn-draft { background: #fff; color: #000; }
.btn-pub { background: var(--primary); color: #fff; }

.meta-card {
  background: var(--bg-secondary);
  border: 3px solid #000;
  padding: 24px;
  box-shadow: 6px 6px 0 #000;
  margin-top: 24px;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

label {
  font-weight: 800;
  font-size: 14px;
}

.brutal-input {
  border: 2px solid #000;
  padding: 12px;
  font-size: 16px;
  font-family: inherit;
  font-weight: 500;
  outline: none;
  background: #fff;
}

.brutal-input:focus {
  background: var(--accent-yellow);
}

.slug-input-wrapper {
  display: flex;
  border: 2px solid #000;
}

.slug-prefix {
  background: #e4e4e7;
  padding: 12px;
  font-weight: 600;
  border-right: 2px solid #000;
}

.no-left-border {
  border: none !important;
  flex: 1;
}

/* Split Editor */
.editor-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 600px;
  margin-top: 24px;
}

.editor-pane {
  background: #fff;
  border: 3px solid #000;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 6px 0 #000;
}

.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 3px solid #000;
  font-weight: 800;
  background: #f4f4f5;
}

.pane-badge {
  background: #000;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
}

.badge-green { background: var(--accent-green); color: #000; }

.editor-textarea {
  flex: 1;
  padding: 20px;
  border: none;
  resize: none;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  line-height: 1.6;
  background: #fff;
}

.editor-preview {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #FDFBF7;
}

@media (max-width: 900px) {
  .editor-split {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .editor-textarea { min-height: 400px; }
  .form-row { flex-direction: column; gap: 16px; }
}
</style>
