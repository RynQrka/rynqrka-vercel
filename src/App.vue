<template>
  <div
    class="shell"
    ref="shell"
    @wheel.prevent="onWheel"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend.passive="onTouchEnd"
  >
    <!-- Subtle radial spotlight that follows sections -->
    <div class="spotlight" :style="spotlightStyle" aria-hidden="true"></div>

    <!-- Custom Cursor -->
    <div class="custom-cursor" :class="{ hovering: isHovering, clicking: isClicking, hasTooltip: !!tooltipText, hidden: isMobile }" ref="cursorRef">
      <Transition name="fade">
        <span v-if="tooltipText" class="cursor-tip">{{ tooltipText }}</span>
      </Transition>
    </div>

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
      <SectionHome     :active="current === 0" @go="goTo" />
      <SectionSocials  :active="current === 1" />
      <SectionProjects :active="current === 2" />
      <SectionBlog     :active="current === 3" />
      <SectionAbout    :active="current === 4" />
      <SectionContact  :active="current === 5" />
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
import SectionProjects from './components/SectionProjects.vue'
import SectionBlog    from './components/SectionBlog.vue'
import SectionAbout   from './components/SectionAbout.vue'
import SectionContact from './components/SectionContact.vue'

const panels  = ref(null)
const current = ref(0)
const locked  = ref(false)
const isMobile = ref(false)

const cursorRef = ref(null)
const isHovering = ref(false)
const tooltipText = ref('')
const isClicking = ref(false)

function checkMobile() { isMobile.value = window.innerWidth <= 640 }

const progressPct = computed(() =>
  `${(current.value / (SECTIONS.length - 1)) * 100}%`
)

// Subtle section-tinted spotlight
const spotlightColors = ['#1a1a2e','#0e0e1a','#1a1a2e','#0e1a1a','#1a1a0e','#1a0e1a']
const spotlightStyle  = computed(() => ({
  background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${spotlightColors[current.value]}, transparent 70%)`,
}))

// Get the current panel element
function getCurrentPanel() {
  return panels.value?.children?.[current.value] || null
}

// Check if a panel has overflowing content
function panelHasOverflow(panel) {
  if (!panel) return false
  return panel.scrollHeight > panel.clientHeight + 5
}

function goTo(idx) {
  if (locked.value) return
  const target = Math.max(0, Math.min(SECTIONS.length - 1, idx))
  if (target === current.value) return
  locked.value = true
  current.value = target

  // Calculate offset: on mobile, use actual panel positions for accuracy
  if (isMobile.value && panels.value) {
    let offset = 0
    for (let i = 0; i < target; i++) {
      offset += panels.value.children[i]?.offsetHeight || window.innerHeight
    }
    panels.value.style.transform = `translateY(-${offset}px)`
  } else {
    panels.value.style.transform = `translateY(-${target * 100}vh)`
  }

  // Reset the target panel's scroll to top when navigating to it
  const targetPanel = panels.value?.children?.[target]
  if (targetPanel) targetPanel.scrollTop = 0

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

// Touch — scroll-boundary-aware on mobile
let touchY = 0
let touchStartScrollTop = 0
let touchDidScroll = false

function onTouchStart(e) {
  touchY = e.touches[0].clientY
  touchDidScroll = false
  const panel = getCurrentPanel()
  touchStartScrollTop = panel ? panel.scrollTop : 0
}

function onTouchMove() {
  // Track if internal scrolling occurred
  const panel = getCurrentPanel()
  if (panel && Math.abs(panel.scrollTop - touchStartScrollTop) > 3) {
    touchDidScroll = true
  }
}

function onTouchEnd(e) {
  const diff = touchY - e.changedTouches[0].clientY
  if (Math.abs(diff) < 50) return

  const panel = getCurrentPanel()

  // On mobile, check scroll boundaries before navigating
  if (isMobile.value && panel && panelHasOverflow(panel)) {
    // If internal scroll happened, skip navigation
    if (touchDidScroll) return

    if (diff > 0) {
      // Swiping up — only navigate if scrolled to bottom
      const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 8
      if (atBottom) goTo(current.value + 1)
    } else {
      // Swiping down — only navigate if scrolled to top
      const atTop = panel.scrollTop <= 8
      if (atTop) goTo(current.value - 1)
    }
  } else {
    // No overflow or desktop — normal behavior
    goTo(current.value + (diff > 0 ? 1 : -1))
  }
}

// Keyboard
function onKey(e) {
  if (['ArrowDown','PageDown'].includes(e.key)) { e.preventDefault(); goTo(current.value + 1) }
  if (['ArrowUp','PageUp'].includes(e.key))     { e.preventDefault(); goTo(current.value - 1) }
}

function onMouseMove(e) {
  if (isMobile.value || !cursorRef.value) return
  requestAnimationFrame(() => {
    if (cursorRef.value) {
      cursorRef.value.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    }
    
    // Magnetic pull logic
    const magneticEl = e.target.closest('.magnetic')
    if (magneticEl) {
      const rect = magneticEl.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const pullX = (e.clientX - centerX) * 0.25 // 25% pull strength
      const pullY = (e.clientY - centerY) * 0.25
      magneticEl.style.transform = `translate(${pullX}px, ${pullY}px)`
      magneticEl.style.transition = 'transform 0s' // Remove transform delay while tracking
    }
  })
}

function checkHover(e) {
  if (isMobile.value) return
  const target = e.target
  const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button') || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
  isHovering.value = !!isInteractive

  const tooltipEl = target.closest('[data-tooltip]')
  if (tooltipEl) {
    tooltipText.value = tooltipEl.getAttribute('data-tooltip')
  } else {
    tooltipText.value = ''
  }
}

function resetMagnetic(e) {
  const magneticEl = e.target.closest('.magnetic')
  if (magneticEl) {
    magneticEl.style.transform = `translate(0px, 0px)`
    magneticEl.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' // Spring back
    
    // Clean up inline style after spring back completes so CSS hover takes over again
    setTimeout(() => {
      if (!magneticEl.matches(':hover')) {
        magneticEl.style.transform = ''
        magneticEl.style.transition = ''
      }
    }, 400)
  }
}

function onMouseDown() { if (!isMobile.value) isClicking.value = true }
function onMouseUp()   { if (!isMobile.value) isClicking.value = false }

onMounted(() => {
  panels.value.style.transition = 'transform 0.88s cubic-bezier(0.76, 0, 0.24, 1)'
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', checkMobile)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseover', checkHover, { passive: true })
  window.addEventListener('mouseout', resetMagnetic, { passive: true })
  window.addEventListener('mousedown', onMouseDown, { passive: true })
  window.addEventListener('mouseup', onMouseUp, { passive: true })
  checkMobile()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseover', checkHover)
  window.removeEventListener('mouseout', resetMagnetic)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mouseup', onMouseUp)
})
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

/* Custom Cursor */
.custom-cursor {
  position: fixed;
  top: 0; left: 0;
  width: 14px; height: 14px;
  background: #fff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: exclusion;
  will-change: transform;
  transform: translate3d(-100px, -100px, 0); /* Start hidden offscreen */
  margin: -7px 0 0 -7px; /* Center dot on true cursor coord */
  transition: width 0.2s cubic-bezier(0.22, 1, 0.36, 1), height 0.2s cubic-bezier(0.22, 1, 0.36, 1), margin 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.custom-cursor.hovering {
  width: 44px; height: 44px;
  margin: -22px 0 0 -22px;
  background: rgba(255, 255, 255, 0.8);
}
.custom-cursor.clicking {
  width: 32px; height: 32px;
  margin: -16px 0 0 -16px;
  background: rgba(255, 255, 255, 0.95);
}
.custom-cursor.hidden {
  display: none !important;
}

/* Cursor Tooltip */
.cursor-tip {
  position: absolute; left: 100%; top: 50%; transform: translateY(-50%);
  margin-left: 14px; background: rgba(0,0,0,0.85); color: #fff;
  padding: 5px 10px; border-radius: 6px; font-size: 0.65rem;
  font-family: var(--mono); letter-spacing: 0.05em;
  white-space: nowrap; mix-blend-mode: normal;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.custom-cursor.hasTooltip { mix-blend-mode: normal; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.4); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-50%) translateX(-4px); }

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
  .panels { height: auto; }
}
</style>
