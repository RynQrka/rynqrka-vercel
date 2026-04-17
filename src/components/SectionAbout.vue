<template>
  <section class="panel">
    <div class="inner">

      <header class="panel-header" :class="{ in: active }">
        <h2 class="panel-title">Just me tbh</h2>
      </header>

      <div class="about-text" :class="{ in: active }">
        <p>Hey, I’m Ryn — not really a “content creator” yet, but I’m getting there. For now I just mess around online, say random stuff, and yeah… occasionally rage bait people for fun.</p>
        <p>I spend most of my time scrolling, finding new music, and posting whatever feels right in the moment — no overthinking, just vibes. Sometimes it’s dumb, sometimes it hits, but that’s kinda the point.</p>
        <p>I’m into capturing random things too — food, skies, places — anything that looks good or feels like a moment. This whole thing’s just me figuring stuff out as I go.</p>
        <p>Eventually I’ll probably take this more seriously. For now, I’m just here, doing my thing.</p>
      </div>

      <div class="tags-block" :class="{ in: active }">
        <span class="section-sub">interests</span>
        <div class="tags">
          <span
            v-for="(tag, i) in ABOUT_TAGS"
            :key="tag"
            class="tag"
            :class="{ in: active }"
            :style="{ '--delay': `${0.3 + i * 0.06}s` }"
          >{{ tag }}</span>
        </div>
      </div>

      <!-- Spotify Widget -->
      <div v-if="song" class="spotify-widget" :class="{ in: active }">
        <span class="section-sub">What I’m playing</span>
        <a v-if="song.title" :href="song.songUrl" target="_blank" rel="noopener noreferrer" class="playing-card premium-card">
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
        <div v-else class="not-playing">
          <span>Nothing at the moment.</span>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ABOUT_TAGS } from '../data.js'

const props = defineProps({ active: Boolean })
const song = ref(null)
let fetchedSong = false

watch(() => props.active, (val) => {
  if (val && !fetchedSong) {
    fetchedSong = true
    fetch('/api/spotify')
      .then(res => res.json())
      .then(data => { song.value = data })
      .catch(() => { song.value = { isPlaying: false } })
  }
})
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
  gap: clamp(22px, 3.5vh, 34px);
}

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

.about-text {
  opacity: 0; transform: translateY(14px);
  transition: opacity .55s .12s, transform .55s .12s cubic-bezier(.22,1,.36,1);
  display: flex; flex-direction: column; gap: clamp(10px, 1.8vh, 16px);
}
.about-text.in { opacity: 1; transform: none; }
.about-text p {
  font-size: clamp(.84rem, 1.7vw, .95rem);
  color: var(--muted); line-height: 1.75;
}

.tags-block {
  opacity: 0; transform: translateY(12px);
  transition: opacity .55s .22s, transform .55s .22s cubic-bezier(.22,1,.36,1);
}
.tags-block.in { opacity: 1; transform: none; }
.section-sub {
  font-family: var(--mono);
  font-size: clamp(.52rem, 1vw, .58rem);
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--faint); display: block; margin-bottom: clamp(8px, 1.4vh, 12px);
}
.tags { display: flex; flex-wrap: wrap; gap: clamp(5px, .8vw, 8px); }
.tag {
  font-family: var(--mono);
  font-size: clamp(.56rem, 1.1vw, .63rem); letter-spacing: .06em;
  padding: 5px 11px; border-radius: 6px;
  background: rgba(255,255,255,.035);
  border: 1px solid var(--border);
  color: var(--faint);
  opacity: 0; transform: scale(.94);
  transition: opacity .38s var(--delay), transform .38s var(--delay);
}
.tag.in { opacity: 1; transform: none; }

/* Spotify Widget */
.spotify-widget {
  padding-top: clamp(16px, 2.5vh, 22px);
  border-top: 1px solid var(--border);
  opacity: 0; transform: translateY(10px);
  transition: opacity .55s .38s, transform .55s .38s cubic-bezier(.22,1,.36,1);
}
.spotify-widget.in { opacity: 1; transform: none; }

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
  .about-text { gap: 8px; }
  .about-text p { font-size: .82rem; line-height: 1.6; }
  .tags { gap: 4px; }
  .tag { padding: 4px 9px; font-size: .52rem; }
  .spotify-widget { padding-top: 12px; }
}
</style>
