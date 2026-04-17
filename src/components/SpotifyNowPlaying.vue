<template>
  <div class="spotify-widget" :class="{ in: active }">
    <span class="section-sub">What I’m playing</span>
    
    <a v-if="song && song.title" :href="song.songUrl" target="_blank" rel="noopener noreferrer" class="playing-card premium-card">
      <div class="album-wrapper">
        <img :src="song.albumImageUrl" class="album-art" alt="Album Cover" />
        <div class="album-glow" :style="{ backgroundImage: `url(${song.albumImageUrl})` }"></div>
      </div>
      <div class="song-info">
        <div class="song-title">{{ song.title }}</div>
        <div class="song-artist">{{ song.artist }}</div>
        <div v-if="!song.isPlaying" class="last-played">{{ song.lastPlayedText }}</div>
      </div>
      <div v-if="song.isPlaying" class="playing-bars">
        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </div>
    </a>
    
    <div v-else-if="song && !song.title" class="not-playing">
      <span>Nothing at the moment.</span>
    </div>

    <!-- Loading state -->
    <div v-else class="not-playing">
      <span class="loading-dots">Loading<span/><span/><span/></span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({ active: Boolean })
const song = ref(null)
let fetchedSong = false

async function fetchSong() {
  if (fetchedSong) return
  fetchedSong = true
  try {
    const res = await fetch('/api/spotify')
    if (!res.ok) throw new Error()
    song.value = await res.json()
  } catch (e) {
    song.value = { isPlaying: false }
  }
}

// Fetch on mount or when active
onMounted(() => {
  if (props.active) fetchSong()
})

watch(() => props.active, (val) => {
  if (val) fetchSong()
})
</script>

<style scoped>
.spotify-widget {
  padding-top: clamp(16px, 2.5vh, 22px);
  border-top: 1px solid var(--border);
  opacity: 0; transform: translateY(10px);
  transition: opacity .55s .38s, transform .55s .38s cubic-bezier(.22,1,.36,1);
}
.spotify-widget.in { opacity: 1; transform: none; }

.section-sub {
  font-family: var(--mono);
  font-size: clamp(.52rem, 1vw, .58rem);
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--faint); display: block; margin-bottom: clamp(8px, 1.4vh, 12px);
}

.premium-card {
  display: inline-flex; align-items: center; gap: 16px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 14px 20px 14px 14px;
  text-decoration: none; max-width: 100%;
  transition: transform .3s cubic-bezier(.22,1,.36,1), border-color .3s, background .3s, box-shadow .3s;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
}
.premium-card:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.album-wrapper {
  position: relative;
  width: 52px; height: 52px;
  flex-shrink: 0;
}
.album-art {
  width: 100%; height: 100%; border-radius: 8px;
  object-fit: cover; position: relative; z-index: 2;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.album-glow {
  position: absolute; top: 10%; left: 10%; width: 80%; height: 80%;
  background-size: cover; background-position: center;
  filter: blur(14px) saturate(1.5); opacity: 0.6; z-index: 1;
}

.song-info {
  display: flex; flex-direction: column; overflow: hidden;
  white-space: nowrap; max-width: 200px; justify-content: center;
}
.song-title {
  font-size: .95rem; font-weight: 600; color: #fff;
  text-overflow: ellipsis; overflow: hidden; line-height: 1.25;
}
.song-artist {
  font-size: .75rem; color: var(--muted);
  text-overflow: ellipsis; overflow: hidden; margin-top: 3px;
}
.last-played {
  font-family: var(--mono); font-size: 0.6rem; color: var(--faint);
  margin-top: 4px; letter-spacing: 0.05em;
}
.not-playing {
  font-family: var(--mono); font-size: .65rem; color: var(--faint);
  letter-spacing: .05em; padding: 8px 0;
}

/* Loading Dots Animation */
.loading-dots { display: flex; align-items: center; gap: 2px; }
.loading-dots span {
  width: 3px; height: 3px; border-radius: 50%; background: var(--faint);
  animation: bounceDot 1.2s infinite;
}
.loading-dots span:nth-child(2) { animation-delay: .2s; }
.loading-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes bounceDot { 0%,60%,100%{transform:none} 30%{transform:translateY(-3px)} }

/* Playing Bars Animation */
.playing-bars {
  display: flex; gap: 3px; align-items: flex-end;
  height: 14px; margin-left: 12px;
}
.bar {
  width: 3px; background: #1ED760; border-radius: 2px;
  animation: bounce 1.2s ease infinite alternate;
}
.bar:nth-child(2) { animation-delay: 0.2s; background: #22c55e; }
.bar:nth-child(3) { animation-delay: 0.4s; background: #10b981; }

@keyframes bounce {
  10%  { height: 4px; }
  50%  { height: 14px; }
  90%  { height: 6px; }
  100% { height: 6px; }
}

@media (max-width: 640px) {
  .spotify-widget { padding-top: 12px; }
}
</style>
