<template>
  <div class="post-page page-container" v-loading="loading">
    <template v-if="post">
      <!-- Back -->
      <router-link to="/" class="back-link">
        <span class="back-icon">←</span> BACK
      </router-link>

      <!-- Article -->
      <article class="article-card">
        <!-- Header Section -->
        <header class="article__header">
          <div class="header-top">
            <span class="header-label">BLOG POST</span>
            <div class="header-badge">
              <el-icon><View /></el-icon> 1,234
            </div>
          </div>
          
          <div class="header-main">
            <h1 class="article__title">{{ post.title }}</h1>
            <div class="article-meta">
              \{{ post.profiles?.nickname || 'ANONYMOUS' }}
            </div>

            <!-- Floating Badge -->
            <div class="floating-badge">
              <div class="badge-inner">
                <el-icon><StarFilled /></el-icon> FEATURED
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <div class="article__content">
          <MarkdownRenderer :content="post.content" />
        </div>

        <!-- Footer Stats -->
        <footer class="article-footer">
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-btn">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(post.created_at) }}
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-btn" style="background: #FCA5A5;">
                <el-icon><Clock /></el-icon>
                READ
              </div>
            </div>
          </div>
          
          <div class="footer-bottom">
             <el-icon><Share /></el-icon>
             SHARE THIS ARTICLE
          </div>
        </footer>
      </article>
    </template>

    <div v-else-if="!loading" class="error-state">
      <h1>404</h1>
      <p>POST NOT FOUND</p>
      <router-link to="/" class="back-btn">GO HOME</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'

const route = useRoute()
const post = ref(null)
const loading = ref(true)

async function fetchPost() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(nickname)')
      .eq('slug', route.params.slug)
      .single()

    if (error) throw error
    post.value = data
  } catch (err) {
    console.error('Failed to fetch post:', err)
    post.value = null
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

onMounted(fetchPost)
</script>

<style scoped>
.post-page {
  max-width: 800px;
  padding-bottom: 60px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 40px;
  background: #fff;
  border: 3px solid #000;
  padding: 8px 16px;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s;
  cursor: pointer;
}

.back-link:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--primary);
  color: #000;
}

/* Article Card Container */
.article-card {
  background: #FDFBF7;
  border: 5px solid #000;
  box-shadow: 16px 16px 0 #000;
  overflow: hidden;
  position: relative;
}

/* Header Section (Orange/Yellow) */
.article__header {
  background: #FDBA74; /* Orange-ish Yellow */
  border-bottom: 5px solid #000;
  padding: 0;
  position: relative;
}

/* Header Top Bar */
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 3px solid #000;
}

.header-label {
  font-weight: 900;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-badge {
  background: #FEF08A; /* Light Yellow */
  border: 2px solid #000;
  padding: 4px 12px;
  font-weight: 800;
  font-size: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 2px 2px 0 #000;
}

/* Header Main Content */
.header-main {
  padding: 40px 24px;
  position: relative;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.article__title {
  font-size: 3.5rem;
  line-height: 1;
  font-weight: 900;
  color: #000;
  margin-bottom: 12px;
  max-width: 70%;
}

.article-meta {
  font-weight: 700;
  font-size: 1.2rem;
}

/* Floating Red Badge (Price/Value style) */
.floating-badge {
  position: absolute;
  top: 30px;
  right: 30px;
  background: #DC2626; /* Red */
  color: #fff;
  border: 4px solid #000;
  padding: 12px 24px;
  transform: rotate(-3deg);
  box-shadow: 6px 6px 0 #000;
  z-index: 2;
}

.badge-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  font-size: 1.8rem;
}

/* Content Area */
.article__content {
  padding: 40px 32px;
  background: #FDFBF7;
}

/* Markdown Styles Override (Simulated) */
:deep(.markdown-body) {
  font-family: 'Space Grotesk', sans-serif;
  color: #000;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2) {
  font-weight: 800;
  text-transform: uppercase;
  color: #DC2626; /* Red headings */
  border-bottom: none;
  font-size: 1.2rem;
  margin-top: 32px;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

:deep(.markdown-body p) {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

:deep(.markdown-body blockquote) {
  border: 3px solid #000;
  background: #fff;
  padding: 24px;
  margin: 32px 0;
  font-style: normal;
  box-shadow: 6px 6px 0 #e5e7eb;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 20px;
}

:deep(.markdown-body li) {
  margin-bottom: 8px;
  font-weight: 500;
}

/* Footer Stats Area */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 5px solid #000;
}

.stat-box {
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F3F4F6;
  border-right: 5px solid #000;
}

.stat-box:last-child {
  border-right: none;
}

.stat-btn {
  background: #FDBA74; /* Orange */
  border: 3px solid #000;
  padding: 12px 24px;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 4px 4px 0 #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Footer Bottom */
.footer-bottom {
  background: #7F1D1D; /* Dark Red */
  color: #fff;
  padding: 16px 24px;
  border-top: 5px solid #000;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 1.2rem;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .article__title {
    font-size: 2.5rem;
    max-width: 100%;
  }
  .floating-badge {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 16px;
    transform: rotate(0);
    display: inline-block;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .stat-box {
    border-right: none;
    border-bottom: 5px solid #000;
  }
}
</style>
