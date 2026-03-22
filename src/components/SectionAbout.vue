<template>
  <section class="panel">
    <div class="inner">

      <header class="panel-header" :class="{ in: active }">
        <span class="mono-label">04 / about</span>
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

      <div class="stats-row" :class="{ in: active }">
        <div v-for="stat in stats" :key="stat.label" class="stat">
          <span class="stat-val">{{ stat.val }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ABOUT_TAGS } from '../data.js'
defineProps({ active: Boolean })
const stats = []
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

.stats-row {
  display: flex; gap: clamp(24px, 5vw, 56px);
  padding-top: clamp(16px, 2.5vh, 22px);
  border-top: 1px solid var(--border);
  opacity: 0; transform: translateY(10px);
  transition: opacity .55s .38s, transform .55s .38s cubic-bezier(.22,1,.36,1);
}
.stats-row.in { opacity: 1; transform: none; }
.stat { display: flex; flex-direction: column; gap: 3px; }
.stat-val {
  font-family: var(--display); font-weight: 800;
  font-size: clamp(1.4rem, 3.5vw, 2.1rem);
  color: #fff; letter-spacing: -.03em;
}
.stat-label {
  font-family: var(--mono);
  font-size: clamp(.52rem, 1vw, .58rem);
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--faint);
}
</style>
