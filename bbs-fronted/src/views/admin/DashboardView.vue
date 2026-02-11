<template>
  <div class="dashboard-page page-container">
    <!-- Header -->
    <div class="page-header dashboard-header">
      <div>
        <h1 class="page-title">DASHBOARD</h1>
        <p class="page-subtitle">MANAGE YOUR CONTENT</p>
      </div>
      <el-button class="create-btn" size="large" @click="goCreate">
        <el-icon><Plus /></el-icon>
        NEW POST
      </el-button>
    </div>

    <!-- Toolbar -->
    <div class="dashboard-toolbar">
      <div class="search-wrapper">
        <el-input
          v-model="searchQuery"
          placeholder="SEARCH..."
          clearable
          :prefix-icon="Search"
          class="brutal-input"
          @input="debouncedSearch"
        />
      </div>
      <el-select v-model="statusFilter" placeholder="STATUS" class="brutal-select" @change="fetchPosts">
        <el-option label="ALL" value="all" />
        <el-option label="PUBLISHED" value="published" />
        <el-option label="DRAFT" value="draft" />
      </el-select>
    </div>

    <!-- Table -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="posts"
        style="width: 100%"
        :header-cell-style="{ background: '#000', color: '#fff', fontWeight: '900', borderBottom: '2px solid #000' }"
        :cell-style="{ borderColor: '#000', color: '#000', fontWeight: '600' }"
        border
      >
        <el-table-column prop="title" label="TITLE" min-width="250">
          <template #default="{ row }">
            <span class="table-title">{{ row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column label="STATUS" width="120" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', row.published ? 'status-pub' : 'status-draft']">
              {{ row.published ? 'LIVE' : 'DRAFT' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="DATE" width="160" align="center">
          <template #default="{ row }">
            <span class="date-text">
              {{ formatDate(row.created_at) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="ACTIONS" width="260" align="center">
          <template #default="{ row }">
            <div class="action-group">
              <button class="action-btn btn-edit" @click="goEdit(row.id)">EDIT</button>
              <button 
                class="action-btn"
                :class="row.published ? 'btn-hide' : 'btn-pub'" 
                @click="togglePublish(row)"
              >
                {{ row.published ? 'HIDE' : 'PUB' }}
              </button>
              <button class="action-btn btn-del" @click="handleDelete(row)">DEL</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        background
        @current-change="fetchPosts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../supabase'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 15
const total = ref(0)

let debounceTimer = null
function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchPosts()
  }, 300)
}

async function fetchPosts() {
  loading.value = true
  try {
    const from = (currentPage.value - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (searchQuery.value.trim()) {
      query = query.ilike('title', `%${searchQuery.value.trim()}%`)
    }

    if (statusFilter.value === 'published') {
      query = query.eq('published', true)
    } else if (statusFilter.value === 'draft') {
      query = query.eq('published', false)
    }

    const { data, count, error } = await query
    if (error) throw error

    posts.value = data || []
    total.value = count || 0
  } catch (err) {
    ElMessage.error('Fetch error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push('/admin/editor')
}

function goEdit(id) {
  router.push(`/admin/editor/${id}`)
}

async function togglePublish(post) {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ published: !post.published, updated_at: new Date().toISOString() })
      .eq('id', post.id)

    if (error) throw error
    post.published = !post.published
    ElMessage.success(post.published ? 'PUBLISHED' : 'UNPUBLISHED')
  } catch (err) {
    ElMessage.error('Action failed')
    console.error(err)
  }
}

async function handleDelete(post) {
  try {
    await ElMessageBox.confirm(
      `Delete "${post.title}"?`,
      'WARNING',
      { type: 'warning', confirmButtonText: 'DELETE', cancelButtonText: 'CANCEL' }
    )
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) throw error
    ElMessage.success('DELETED')
    fetchPosts()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('Delete failed')
    }
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB')
}

onMounted(fetchPosts)
onActivated(fetchPosts)
</script>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 4px solid #000;
  padding-bottom: 24px;
}

.create-btn {
  background: var(--primary) !important;
  color: #fff !important;
  font-weight: 800 !important;
  border: 2px solid #000 !important;
  box-shadow: 4px 4px 0 #000 !important;
}

.create-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000 !important;
}

.dashboard-toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  background: var(--bg-secondary);
  border: 2px solid #000;
  padding: 16px;
  box-shadow: 4px 4px 0 #000;
}

.search-wrapper {
  flex: 1;
  max-width: 300px;
}

.table-container {
  border: 2px solid #000;
  box-shadow: 8px 8px 0 #000;
}

.table-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-weight: 800;
  font-size: 12px;
  border: 2px solid #000;
  color: #000;
}

.status-pub { background: var(--accent-green); }
.status-draft { background: #e4e4e7; }

.date-text {
  font-family: monospace;
  font-weight: 600;
}

.action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  border: 2px solid #000;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #000;
}

.action-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #000;
}

.action-btn:active { transform: translate(0,0); box-shadow: none; }

.btn-edit { background: #fff; color: #000; }
.btn-pub { background: var(--accent-yellow); color: #000; }
.btn-hide { background: #e4e4e7; color: #000; }
.btn-del { background: #ef4444; color: #fff; }

.pagination-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}
</style>
