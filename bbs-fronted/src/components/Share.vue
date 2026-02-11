<template>
  <div class="share-component">
    <h3 class="share-title">SHARE THIS</h3>
    <div class="share-options">
      <button class="share-btn btn-copy" @click="copyLink">
        COPY LINK
      </button>
      <button class="share-btn btn-twitter" @click="shareTwitter">
        TWITTER
      </button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: () => window.location.href
  }
})

function copyLink() {
  navigator.clipboard.writeText(props.url).then(() => {
    ElMessage.success('LINK COPIED!')
  })
}

function shareTwitter() {
  const text = encodeURIComponent(props.title)
  const url = encodeURIComponent(props.url)
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}
</script>

<style scoped>
.share-component {
  border: 3px solid #000;
  padding: 24px;
  background: #fff;
  box-shadow: 6px 6px 0 #000;
  margin-top: 32px;
}

.share-title {
  font-weight: 900;
  font-size: 1.2rem;
  margin-bottom: 16px;
  border-bottom: 2px solid #000;
  padding-bottom: 8px;
  display: inline-block;
}

.share-options {
  display: flex;
  gap: 16px;
}

.share-btn {
  padding: 12px 24px;
  border: 2px solid #000;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #000;
}

.share-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 #000;
}

.share-btn:active {
  transform: translate(0, 0);
  box-shadow: none;
}

.btn-copy { background: var(--accent-yellow); color: #000; }
.btn-twitter { background: #1DA1F2; color: #fff; }
</style>
