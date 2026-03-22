<template>
  <section class="panel">
    <div class="inner">

      <header class="panel-header" :class="{ in: active }">
        <span class="mono-label">03 / blog</span>
        <h2 class="panel-title">random thoughts</h2>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="state-row" :class="{ in: active }">
        <span class="mono-label">fetching posts…</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-row" :class="{ in: active }">
        <span class="mono-label">couldn't load — <a :href="mediumUrl" target="_blank" rel="noopener" class="inline-link">open Medium ↗</a></span>
      </div>

      <!-- Posts list -->
      <div v-else class="post-list">
        <a
          v-for="(post, i) in posts"
          :key="post.guid"
          :href="post.link"
          target="_blank"
          rel="noopener noreferrer"
          class="post"
          :class="{ in: active }"
          :style="{ '--delay': `${0.1 + i * 0.06}s` }"
        >
          <div class="post-num">{{ String(i + 1).padStart(2, '0') }}</div>
          <div class="post-body">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-meta">
              <span>{{ formatDate(post.pubDate) }}</span>
              <span class="dot">·</span>
              <span>{{ readTime(post.description) }} min read</span>
            </div>
          </div>
          <div class="post-arrow">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </div>
        </a>
      </div>

      <!-- View all — always shown once loaded -->
      <a
        v-if="!loading"
        :href="mediumUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="view-all"
        :class="{ in: active }"
      >
        <span>→ view everything on Medium</span>
      </a>

    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CONFIG } from '../data.js'

const props = defineProps({ active: Boolean })

const posts    = ref([])
const loading  = ref(true)
const error    = ref(false)
const mediumUrl = `https://medium.com/@${CONFIG.mediumUsername}`
let fetched = false

watch(() => props.active, (val) => {
  if (val && !fetched) { fetched = true; fetchPosts() }
})

async function fetchPosts() {
  try {
    const rss = `https://medium.com/feed/@${CONFIG.mediumUsername}`
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}&count=6`
    const res  = await fetch(api)
    const data = await res.json()
    if (!data.items?.length) throw new Error()
    posts.value = data.items.slice(0, 6)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function readTime(html) {
  return Math.max(1, Math.round((html || '').replace(/<[^>]+>/g, '').split(' ').length / 200))
}
</script>

<style scoped>
.panel {
  width: 100vw; height: 100dvh; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}

.inner {
  width: 100%;
  max-width: min(820px, 95vw);
  padding: clamp(24px, 5vh, 56px) clamp(20px, 5vw, 64px);
  display: flex; flex-direction: column;
  gap: clamp(16px, 2.8vh, 28px);
}

/* Header */
.panel-header {
  opacity: 0; transform: translateY(16px);
  transition: opacity .55s, transform .55s cubic-bezier(.22,1,.36,1);
}
.panel-header.in { opacity: 1; transform: none; }

.mono-label {
  font-family: var(--mono);
  font-size: clamp(.56rem, 1.1vw, .63rem);
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--faint); display: block; margin-bottom: 7px;
}
.panel-title {
  font-family: var(--display); font-weight: 800;
  font-size: clamp(1.6rem, 3.5vw, 2.8rem);
  letter-spacing: -.035em; color: #fff; line-height: 1;
}

/* State */
.state-row {
  opacity: 0; transition: opacity .4s .1s;
}
.state-row.in { opacity: 1; }
.inline-link { color: var(--muted); text-decoration: underline; }

/* Posts */
.post-list {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--border);
}

.post {
  display: flex; align-items: center; gap: clamp(12px, 2vw, 20px);
  padding: clamp(11px, 1.8vh, 15px) 0;
  border-bottom: 1px solid var(--border);
  text-decoration: none; color: inherit;
  opacity: 0; transform: translateX(-12px);
  transition: background .16s;
  border-radius: 3px;
}
.post.in {
  animation: postIn .45s var(--delay) ease both;
}
@keyframes postIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: none; }
}
.post:hover { background: rgba(255,255,255,.025); }
.post:hover .post-title  { color: #fff; }
.post:hover .post-arrow  { color: var(--muted); transform: translate(3px, -3px); }

.post-num {
  font-family: var(--mono);
  font-size: clamp(.55rem, 1vw, .6rem);
  color: var(--faint); flex-shrink: 0; width: 22px;
}

.post-body { flex: 1; min-width: 0; }

.post-title {
  font-size: clamp(.82rem, 1.6vw, .95rem);
  font-weight: 500; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 3px;
  transition: color .16s;
}
.post-meta {
  font-family: var(--mono);
  font-size: clamp(.55rem, 1vw, .6rem);
  color: var(--faint);
  display: flex; gap: 7px; align-items: center;
}
.dot { opacity: .35; }

.post-arrow {
  color: var(--faint); flex-shrink: 0;
  transition: color .16s, transform .2s cubic-bezier(.22,1,.36,1);
}

/* View all */
.view-all {
  display: inline-flex; align-items: center;
  opacity: 0;
  transition: opacity .45s .55s;
  text-decoration: none;
  align-self: flex-start;
}
.view-all.in { opacity: 1; }
.view-all span {
  font-family: var(--mono);
  font-size: clamp(.58rem, 1.1vw, .65rem);
  letter-spacing: .08em;
  color: var(--faint);
  transition: color .18s;
}
.view-all:hover span { color: var(--muted); }
</style>
