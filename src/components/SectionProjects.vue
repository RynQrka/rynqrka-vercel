<template>
  <section class="panel">
    <div class="inner">

      <header class="panel-header" :class="{ in: active }">
        <h2 class="panel-title">Things I've Built</h2>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="state-row" :class="{ in: active }">
        <span class="mono-label">fetching repos…</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-row" :class="{ in: active }">
        <span class="mono-label">couldn't load — <a :href="githubUrl" target="_blank" rel="noopener" class="inline-link">open GitHub ↗</a></span>
      </div>

      <!-- Projects Grid -->
      <div v-else class="projects-grid">
        <a
          v-for="(repo, i) in repos"
          :key="repo.id"
          :href="repo.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card"
          :class="{ in: active }"
          :style="{ '--delay': `${0.1 + i * 0.08}s` }"
        >
          <div class="card-top">
            <h3 class="repo-name">{{ repo.name }}</h3>
            <div class="repo-arrow">↗</div>
          </div>
          <p class="repo-desc">{{ repo.description || 'No description provided.' }}</p>
          <div class="repo-meta">
            <span v-if="repo.language" class="lang">
              <span class="lang-dot" :style="{ background: getLangColor(repo.language) }"></span> {{ repo.language }}
            </span>
            <span v-if="repo.stargazers_count > 0" class="stars">
              ★ {{ repo.stargazers_count }}
            </span>
          </div>
        </a>
      </div>

      <!-- View all -->
      <a
        v-if="!loading"
        :href="githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="view-all"
        :class="{ in: active }"
      >
        <span>→ view everything on GitHub</span>
      </a>

    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CONFIG } from '../data.js'

const props = defineProps({ active: Boolean })

const repos = ref([])
const loading = ref(true)
const error = ref(false)
const githubUrl = `https://github.com/${CONFIG.githubUsername}`
let fetched = false

const langColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600'
}
function getLangColor(lang) { return langColors[lang] || '#8b8b8b' }

watch(() => props.active, (val) => {
  if (val && !fetched) { fetched = true; fetchRepos() }
})

async function fetchRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=6`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    repos.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
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
  max-width: min(1000px, 95vw);
  padding: clamp(24px, 5vh, 56px) clamp(20px, 5vw, 64px);
  display: flex; flex-direction: column;
  gap: clamp(16px, 2.8vh, 28px);
}

.panel-header {
  opacity: 0; transform: translateY(16px);
  transition: opacity .55s, transform .55s cubic-bezier(.22,1,.36,1);
}
.panel-header.in { opacity: 1; transform: none; }

.panel-title {
  font-family: var(--display); font-weight: 800;
  font-size: clamp(1.6rem, 3.5vw, 2.8rem);
  letter-spacing: -.035em; color: #fff; line-height: 1;
}

.state-row {
  opacity: 0; transition: opacity .4s .1s;
}
.state-row.in { opacity: 1; }
.inline-link { color: var(--muted); text-decoration: underline; }
.mono-label {
  font-family: var(--mono);
  font-size: clamp(.56rem, 1.1vw, .63rem);
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--faint); display: block;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: clamp(12px, 2vw, 16px);
}

.project-card {
  background: rgba(255,255,255,.015);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: clamp(16px, 2.5vh, 22px);
  display: flex; flex-direction: column;
  gap: 12px;
  text-decoration: none;
  transition: border-color .2s, background .2s, transform .2s cubic-bezier(.22,1,.36,1);
  opacity: 0; transform: translateY(14px) scale(.98);
}
.project-card.in {
  animation: cardIn .5s var(--delay) cubic-bezier(.22,1,.36,1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px) scale(.98); }
  to   { opacity: 1; transform: none; }
}

.project-card:hover {
  background: rgba(255,255,255,.03);
  border-color: rgba(255,255,255,.12);
  transform: translateY(-2px);
}
.project-card:hover .repo-arrow {
  color: #fff; transform: translate(3px, -3px);
}

.card-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px;
}
.repo-name {
  font-size: clamp(1rem, 1.8vw, 1.1rem); font-weight: 600; color: var(--text);
  line-height: 1.3;
}
.repo-arrow {
  font-family: var(--mono); color: var(--faint);
  transition: color .2s, transform .2s;
  font-size: 1.1rem; line-height: 1;
}

.repo-desc {
  font-size: clamp(.82rem, 1.5vw, .9rem); color: var(--muted);
  line-height: 1.5; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

.repo-meta {
  display: flex; gap: 14px; align-items: center;
  font-family: var(--mono); font-size: .65rem; color: var(--faint);
  margin-top: auto;
}
.lang { display: flex; align-items: center; gap: 6px; }
.lang-dot {
  width: 8px; height: 8px; border-radius: 50%;
}

/* View all */
.view-all {
  display: inline-flex; align-items: center;
  opacity: 0; transition: opacity .45s .55s;
  text-decoration: none; align-self: flex-start;
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

/* Mobile */
@media (max-width: 640px) {
  .panel {
    height: auto;
    min-height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    align-items: flex-start;
  }
  .inner {
    padding: 16px;
    gap: clamp(16px, 2.5vh, 22px);
    min-height: 100dvh;
    justify-content: flex-start;
    padding-top: clamp(48px, 8vh, 64px);
    padding-bottom: clamp(32px, 5vh, 48px);
  }
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
