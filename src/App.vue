<template>
  <div
    class="shell"
    ref="shell"
    @wheel.prevent="onWheel"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Subtle radial spotlight that follows sections -->
    <div class="spotlight" :style="spotlightStyle" aria-hidden="true"></div>

    <!-- Side nav dots -->
    <nav class="sidenav" aria-label="Page sections">
      <button
        v-for="(sec, i) in SECTIONS"
        :key="sec"
        :class="['navdot', { active: current === i }]"
        @click="goTo(i)"
        :title="sec"
        :aria-label="`Go to ${sec}`"
      />
    </nav>

    <!-- Section label -->
    <div class="sec-indicator">
      <Transition name="label-slide" mode="out-in">
        <span :key="current" class="sec-label-text">{{ SECTIONS[current] }}</span>
      </Transition>
    </div>

    <!-- Arrow nav (desktop) -->
    <button
      class="arrow arrow-up"
      :class="{ hidden: current === 0 }"
      @click="goTo(current - 1)"
      aria-label="Previous section"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
    <button
      class="arrow arrow-down"
      :class="{ hidden: current === SECTIONS.length - 1 }"
      @click="goTo(current + 1)"
      aria-label="Next section"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Panels -->
    <div class="panels" ref="panels">
      <SectionHome    :active="current === 0" @go="goTo" />
      <SectionSocials :active="current === 1" />
      <SectionBlog    :active="current === 2" />
      <SectionAbout   :active="current === 3" />
      <SectionContact :active="current === 4" />
    </div>

    <!-- Bottom progress bar -->
    <div class="progress-track" aria-hidden="true">
      <div class="progress-fill" :style="{ width: progressPct }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { SECTIONS } from './data.js'
import SectionHome    from './components/SectionHome.vue'
import SectionSocials from './components/SectionSocials.vue'
import SectionBlog    from './components/SectionBlog.vue'
import SectionAbout   from './components/SectionAbout.vue'
import SectionContact from './components/SectionContact.vue'

const panels  = ref(null)
const current = ref(0)
const locked  = ref(false)

const progressPct = computed(() =>
  `${(current.value / (SECTIONS.length - 1)) * 100}%`
)

// Subtle section-tinted spotlight
const spotlightColors = ['#1a1a2e','#0e0e1a','#0e1a1a','#1a1a0e','#1a0e1a']
const spotlightStyle  = computed(() => ({
  background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${spotlightColors[current.value]}, transparent 70%)`,
}))

function goTo(idx) {
  if (locked.value) return
  const target = Math.max(0, Math.min(SECTIONS.length - 1, idx))
  if (target === current.value) return
  locked.value = true
  current.value = target
  panels.value.style.transform = `translateY(-${target * 100}vh)`
  setTimeout(() => { locked.value = false }, 900)
}

// Wheel — debounce by accumulated delta
let wheelAcc = 0, wheelTimer = null
function onWheel(e) {
  if (locked.value) return
  wheelAcc += e.deltaY
  clearTimeout(wheelTimer)
  wheelTimer = setTimeout(() => { wheelAcc = 0 }, 300)
  if (wheelAcc > 60)  { wheelAcc = 0; goTo(current.value + 1) }
  if (wheelAcc < -60) { wheelAcc = 0; goTo(current.value - 1) }
}

// Touch
let touchY = 0
function onTouchStart(e) { touchY = e.touches[0].clientY }
function onTouchEnd(e) {
  const diff = touchY - e.changedTouches[0].clientY
  if (Math.abs(diff) > 50) goTo(current.value + (diff > 0 ? 1 : -1))
}

// Keyboard
function onKey(e) {
  if (['ArrowDown','PageDown'].includes(e.key)) { e.preventDefault(); goTo(current.value + 1) }
  if (['ArrowUp','PageUp'].includes(e.key))     { e.preventDefault(); goTo(current.value - 1) }
}

onMounted(() => {
  panels.value.style.transition = 'transform 0.88s cubic-bezier(0.76, 0, 0.24, 1)'
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.shell {
  width: 100vw; height: 100dvh;
  overflow: hidden; position: relative;
  background: var(--bg);
}

/* Ambient spotlight */
.spotlight {
  position: fixed; inset: 0;
  pointer-events: none; z-index: 0;
  transition: background 1.2s ease;
}

/* Panels track */
.panels {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  will-change: transform;
  position: relative; z-index: 1;
}

/* Side nav */
.sidenav {
  position: fixed; right: clamp(14px, 3vw, 26px); top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 9px;
  z-index: 200;
}
.navdot {
  width: 4px; height: 4px; border-radius: 99px;
  background: var(--faint); padding: 0;
  transition: background .25s, transform .3s, height .3s, border-radius .3s;
}
.navdot.active {
  background: rgba(255,255,255,.55);
  transform: scaleY(2.8);
  border-radius: 3px;
}
.navdot:hover:not(.active) { background: var(--muted); transform: scale(1.5); }

/* Section indicator top-left */
.sec-indicator {
  position: fixed; top: clamp(18px, 3vh, 28px); left: clamp(18px, 3vw, 32px);
  z-index: 200; overflow: hidden; height: 16px;
}
.sec-label-text {
  display: block;
  font-family: var(--mono);
  font-size: .6rem; letter-spacing: .18em; text-transform: uppercase;
  color: var(--faint);
}
.label-slide-enter-active { transition: transform .4s cubic-bezier(.22,1,.36,1), opacity .4s; }
.label-slide-leave-active { transition: transform .3s ease, opacity .3s; position: absolute; }
.label-slide-enter-from   { transform: translateY(100%); opacity: 0; }
.label-slide-leave-to     { transform: translateY(-100%); opacity: 0; }

/* Arrow nav */
.arrow {
  position: fixed; left: clamp(14px, 3vw, 26px); z-index: 200;
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent; color: var(--faint);
  display: flex; align-items: center; justify-content: center;
  transition: border-color .2s, color .2s, opacity .3s, transform .2s;
}
.arrow:hover { border-color: var(--border-h); color: var(--muted); }
.arrow.hidden { opacity: 0; pointer-events: none; }
.arrow-up   { bottom: calc(50% + 20px); }
.arrow-down { top:    calc(50% + 20px); }

/* Progress */
.progress-track {
  position: fixed; bottom: 0; left: 0; right: 0; height: 1px;
  background: var(--border); z-index: 200;
}
.progress-fill {
  height: 100%;
  background: rgba(255,255,255,.22);
  transition: width .88s cubic-bezier(.76,0,.24,1);
}

/* Mobile: hide arrows */
@media (max-width: 640px) {
  .arrow { display: none; }
}
</style>
