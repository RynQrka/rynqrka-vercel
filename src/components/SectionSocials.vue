<template>
  <section class="panel">
    <div class="inner">

      <header class="panel-header" :class="{ in: active }">
        <h2 class="panel-title">Find me online</h2>
      </header>

      <div class="all-groups">
        <div
          v-for="(group, gi) in SOCIAL_GROUPS"
          :key="group.key"
          class="group"
          :class="{ in: active }"
          :style="{ '--gi': gi }"
        >
          <!-- Subtle floating label, no line -->
          <div class="group-label">{{ group.label }}</div>

          <div class="grid">
            <a
              v-for="(s, i) in group.items"
              :key="s.id"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              class="card"
              :aria-label="s.label"
              :class="{ in: active, dark: darkBrand.has(s.id) }"
              :style="{
                '--color': s.color,
                '--delay': `${0.08 + gi * 0.07 + i * 0.035}s`
              }"
            >
              <img
                :src="LOGO_SRCS[s.id]"
                :alt="s.label"
                class="card-logo"
                width="22" height="22"
              />
              <span class="card-label">{{ s.label }}</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { SOCIAL_GROUPS, LOGO_SRCS } from '../data.js'
defineProps({ active: Boolean })
// Platforms whose brand color is dark/black — keep white even on hover
const darkBrand = new Set(['x', 'tiktok', 'threads', 'steam', '9gag'])
</script>

<style scoped>
.panel {
  width: 100vw; height: 100dvh; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}

.inner {
  width: 100%;
  max-width: min(1200px, 96vw);
  padding: clamp(20px, 4vh, 44px) clamp(20px, 4vw, 60px);
  display: flex; flex-direction: column;
  gap: clamp(16px, 2.8vh, 28px);
}

/* Header */
.panel-header {
  opacity: 0; transform: translateY(14px);
  transition: opacity .5s, transform .5s cubic-bezier(.22,1,.36,1);
}
.panel-header.in { opacity: 1; transform: none; }

.mono-label {
  font-family: var(--mono);
  font-size: clamp(.54rem, 1vw, .62rem);
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--faint); display: block; margin-bottom: 6px;
}
.panel-title {
  font-family: var(--display); font-weight: 800;
  font-size: clamp(1.5rem, 3.2vw, 2.6rem);
  letter-spacing: -.035em; color: #fff; line-height: 1;
}

/* Groups — stacked, no borders between them */
.all-groups {
  display: flex; flex-direction: column;
  gap: clamp(14px, 2.2vh, 22px);
}

.group {
  opacity: 0; transform: translateY(12px);
  transition:
    opacity .48s calc(var(--gi) * 0.07s + 0.1s) ease,
    transform .48s calc(var(--gi) * 0.07s + 0.1s) cubic-bezier(.22,1,.36,1);
}
.group.in { opacity: 1; transform: none; }

/* Subsection label — tiny, no line, just text */
.group-label {
  font-family: var(--mono);
  font-size: clamp(.5rem, .9vw, .56rem);
  letter-spacing: .2em; text-transform: uppercase;
  color: rgba(255,255,255,.16);
  margin-bottom: clamp(7px, 1vh, 10px);
  padding-left: 2px;
}

/* Fluid grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(68px, 8vw, 100px), 1fr));
  gap: clamp(5px, .8vw, 8px);
}

/* Card */
.card {
  aspect-ratio: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: clamp(4px, .7vh, 7px);
  border-radius: clamp(9px, 1.4vw, 13px);
  background: var(--bg2);
  border: 1px solid var(--border);
  text-decoration: none;
  transition:
    border-color .22s ease,
    background   .22s ease,
    transform    .28s cubic-bezier(.22,1,.36,1),
    box-shadow   .28s ease;
}
.card.in {
  animation: cardIn .42s var(--delay) cubic-bezier(.22,1,.36,1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px) scale(.95); }
  to   { opacity: 1; transform: none; }
}
.card:hover {
  border-color: color-mix(in srgb, var(--color) 55%, transparent);
  background: #111116;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px -6px color-mix(in srgb, var(--color) 30%, transparent);
}

/* Logo */
.card-logo {
  width: clamp(17px, 2.8vw, 24px);
  height: clamp(17px, 2.8vw, 24px);
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: .38;
  transition: opacity .22s, filter .22s;
  display: block;
}
/* Show real brand color on hover for color-brand platforms */
.card:not(.dark):hover .card-logo {
  filter: none;
  opacity: 1;
}
/* Keep dark-brand platforms as bright white on hover */
.card.dark:hover .card-logo {
  filter: brightness(0) invert(1);
  opacity: .82;
}

.card-label {
  font-size: clamp(.46rem, .85vw, .56rem);
  font-weight: 500; letter-spacing: .07em; text-transform: uppercase;
  color: var(--faint); text-align: center; line-height: 1.2;
  transition: color .22s;
  padding: 0 3px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 100%;
}
.card:hover .card-label { color: rgba(255,255,255,.44); }

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
    gap: clamp(10px, 2vh, 16px);
    min-height: 100dvh;
    justify-content: flex-start;
    padding-top: clamp(48px, 8vh, 64px);
    padding-bottom: clamp(32px, 5vh, 48px);
  }
  .all-groups { gap: clamp(10px, 1.5vh, 14px); }
  .group-label { margin-bottom: 5px; }
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 4px;
  }
  .card {
    border-radius: 8px;
  }
  .card-logo { width: 16px; height: 16px; }
  .card-label { font-size: .44rem; padding: 0 2px; }
}
</style>
