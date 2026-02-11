<template>
  <div class="home-page page-container">
    <!-- Hero -->
    <header class="hero-section">
      <h1 class="hero-title">欢迎来到我的博客</h1>
      <div class="hero-decoration"></div>
    </header>

    <!-- Search -->
    <div class="search-section">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文章..."
          size="large"
          @input="debouncedSearch"
        >
          <template #prefix>
            <el-icon :size="20"><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Posts Grid -->
    <div v-loading="loading" class="posts-grid">
      <template v-if="posts.length">
        <article
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="goToPost(post.slug)"
        >
          <div class="card-top">
            <span class="card-date">{{ formatDate(post.created_at) }}</span>
            <!-- <div class="card-dots">
              <span></span><span></span><span></span>
            </div> -->
          </div>
          
          <div class="card-body">
            <h2 class="card-title">{{ post.title }}</h2>
            <p class="card-excerpt">{{ post.excerpt || 'NO DESCRIPTION' }}</p>
            
            <div class="card-bottom">
              <span class="card-author">BY {{ (post.profiles?.nickname || 'ANON').toUpperCase() }}</span>
              <div class="card-arrow">→</div>
            </div>
          </div>
        </article>
      </template>

      <div v-else-if="!loading" class="empty-state">
        <h2>NOTHING FOUND</h2>
        <p>TRY ANOTHER SEARCH TERM</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="fetchPosts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 9
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
      .select('id, title, excerpt, slug, created_at, profiles(nickname)', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (searchQuery.value.trim()) {
      query = query.ilike('title', `%${searchQuery.value.trim()}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    posts.value = data || []
    total.value = count || 0
  } catch (err) {
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
  }
}

function goToPost(slug) {
  router.push(`/post/${slug}`)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).toUpperCase()
}

onMounted(fetchPosts)
onActivated(fetchPosts)
</script>

<style scoped>
/* Hero */
.hero-section {
  margin-bottom: 60px;
  position: relative;
  padding: 40px 0;
  border-bottom: 3px solid #000;
}

.hero-title {
  font-size: 5rem;
  line-height: 0.9;
  font-weight: 900;
  letter-spacing: -3px;
  color: #000;
  position: relative;
  z-index: 2;
}

.hero-decoration {
  position: absolute;
  top: 20px;
  right: 40px;
  width: 120px;
  height: 120px;
  background: var(--primary);
  border: 3px solid #000;
  border-radius: 50%;
  box-shadow: 8px 8px 0 #000;
  z-index: 1;
}

/* Search */
.search-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
}

.search-box {
  width: 100%;
  max-width: 400px;
}

/* Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  min-height: 300px;
}

.post-card {
  background: #FDFBF7;
  border: 4px solid #000;
  padding: 0; /* Remove padding to allow header to touch edges */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 8px 8px 0 #000;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.post-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 12px 12px 0 var(--primary);
}

.post-card:active {
  transform: translate(0, 0);
  box-shadow: none;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 4px solid #000;
  background: #f59e0b; /* Orange Header */
}

.card-date {
  font-weight: 800;
  font-size: 13px;
  background: #FEF08A; /* Yellow Badge */
  color: #000;
  padding: 4px 8px;
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #000;
}

.card-dots {
  display: flex;
  gap: 4px;
}

.card-dots span {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #000;
  border-radius: 50%;
}

.card-body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.6rem;
  line-height: 1.1;
  font-weight: 900;
  margin-bottom: 12px;
  text-transform: uppercase;
  color: #000;
}

.card-excerpt {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 24px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  font-size: 14px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 3px solid #000;
}

.card-author {
  text-transform: uppercase;
}

.card-arrow {
  font-size: 20px;
  background: #000;
  color: #fff;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.post-card:hover .card-arrow {
  transform: translateX(4px) rotate(-45deg);
  background: var(--primary);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  border: 3px dashed #000;
  background: rgba(255,255,255,0.5);
}

/* Pagination */
.pagination-wrapper {
  margin-top: 60px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
}
</style>
