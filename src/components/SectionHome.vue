<template>
  <section class="panel">
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="home-inner">

      <div class="avatar-wrap" :class="{ in: active }">
        <div class="avatar">R</div>
      </div>

      <div class="mono-handle" :class="{ in: active }">@rynqrka</div>

      <h1 class="hero-name" :class="{ in: active }">RynQrka</h1>

      <p class="hero-bio" :class="{ in: active }">
        wannabe creator · maybe streamer · lowk rage baiting
      </p>

      <div class="cta-row" :class="{ in: active }">
        <button class="btn-primary" @click="$emit('go', 1)">socials</button>
        <button class="btn-ghost"   @click="$emit('go', 3)">about</button>
        <button class="btn-ghost"   @click="$emit('go', 4)">contact</button>
      </div>

      <div class="scroll-hint" :class="{ in: active }">
        <span class="hint-label">scroll</span>
        <div class="hint-track"><div class="hint-runner"></div></div>
      </div>

    </div>
  </section>
</template>

<script setup>
defineProps({ active: Boolean })
defineEmits(['go'])
</script>

<style scoped>
.panel {
  width: 100vw; height: 100dvh; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}

.grid-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
  background-size: clamp(44px, 6vw, 72px) clamp(44px, 6vw, 72px);
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 10%, transparent 100%);
}

.home-inner {
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
  padding: clamp(32px, 6vh, 72px) clamp(24px, 5vw, 48px);
  width: 100%;
  position: relative; z-index: 1;
}

/* Avatar */
.avatar-wrap {
  margin-bottom: clamp(22px, 3.5vh, 34px);
  opacity: 0; transform: translateY(18px);
  transition: opacity .65s .08s ease, transform .65s .08s cubic-bezier(.22,1,.36,1);
}
.avatar-wrap.in { opacity: 1; transform: none; }
.avatar {
  width: clamp(60px, 9vw, 84px); height: clamp(60px, 9vw, 84px);
  border-radius: 18px;
  background: var(--bg2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display); font-weight: 800;
  font-size: clamp(1.5rem, 3.5vw, 2.1rem);
  color: rgba(255,255,255,.65);
  margin: 0 auto;
}

/* Handle */
.mono-handle {
  font-family: var(--mono);
  font-size: clamp(.6rem, 1.4vw, .72rem);
  letter-spacing: .2em; text-transform: uppercase; color: var(--faint);
  margin-bottom: clamp(8px, 1.5vh, 14px);
  opacity: 0; transform: translateY(12px);
  transition: opacity .65s .18s ease, transform .65s .18s cubic-bezier(.22,1,.36,1);
}
.mono-handle.in { opacity: 1; transform: none; }

/* Name */
.hero-name {
  font-family: var(--display); font-weight: 800;
  font-size: clamp(3rem, 10vw, 7rem);
  letter-spacing: -.045em; line-height: .92; color: #fff;
  margin-bottom: clamp(16px, 2.5vh, 22px);
  opacity: 0; transform: translateY(14px);
  transition: opacity .65s .26s ease, transform .65s .26s cubic-bezier(.22,1,.36,1);
}
.hero-name.in { opacity: 1; transform: none; }

/* Bio */
.hero-bio {
  font-size: clamp(.82rem, 1.8vw, 1rem);
  color: var(--muted); line-height: 1.65;
  margin-bottom: clamp(28px, 4.5vh, 44px);
  opacity: 0; transform: translateY(12px);
  transition: opacity .65s .34s ease, transform .65s .34s cubic-bezier(.22,1,.36,1);
}
.hero-bio.in { opacity: 1; transform: none; }

/* CTAs */
.cta-row {
  display: flex; gap: clamp(7px, 1.5vw, 10px); flex-wrap: wrap; justify-content: center;
  margin-bottom: clamp(44px, 7vh, 68px);
  opacity: 0; transform: translateY(12px);
  transition: opacity .65s .42s ease, transform .65s .42s cubic-bezier(.22,1,.36,1);
}
.cta-row.in { opacity: 1; transform: none; }

.btn-primary {
  background: #fff; color: #09090c;
  border-radius: 8px; padding: clamp(9px, 1.5vh, 12px) clamp(20px, 3vw, 28px);
  font-size: clamp(.8rem, 1.6vw, .9rem); font-weight: 600;
  transition: background .18s, transform .18s;
}
.btn-primary:hover { background: #e4e4e4; transform: translateY(-2px); }

.btn-ghost {
  background: transparent; color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px; padding: clamp(9px, 1.5vh, 12px) clamp(20px, 3vw, 28px);
  font-size: clamp(.8rem, 1.6vw, .9rem); font-weight: 500;
  transition: border-color .18s, color .18s, transform .18s;
}
.btn-ghost:hover { border-color: var(--border-h); color: var(--text); transform: translateY(-2px); }

/* Scroll hint */
.scroll-hint {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  opacity: 0;
  transition: opacity .7s .85s;
}
.scroll-hint.in { opacity: 1; }
.hint-label {
  font-family: var(--mono);
  font-size: .57rem; letter-spacing: .2em; text-transform: uppercase;
  color: var(--faint);
}
.hint-track {
  width: 1px; height: 32px;
  background: var(--border);
  position: relative; overflow: hidden;
}
.hint-runner {
  width: 1px; height: 10px;
  background: rgba(255,255,255,.35);
  position: absolute; top: -10px;
  animation: run 2s ease-in-out infinite;
}
@keyframes run {
  0%   { top: -10px; opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { top: 32px; opacity: 0; }
}

/* Mobile */
@media (max-width: 640px) {
  .panel {
    height: auto;
    min-height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .home-inner {
    padding: clamp(24px, 4vh, 40px) 20px;
    min-height: 100dvh;
    justify-content: center;
  }
  .avatar-wrap { margin-bottom: 16px; }
  .avatar { width: 56px; height: 56px; border-radius: 14px; font-size: 1.3rem; }
  .mono-handle { margin-bottom: 6px; }
  .hero-name { margin-bottom: 12px; }
  .hero-bio { margin-bottom: 20px; }
  .cta-row { margin-bottom: 32px; gap: 8px; }
  .scroll-hint { display: none; }
}
</style>
