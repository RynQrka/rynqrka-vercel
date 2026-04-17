<template>
  <section class="panel">
    <div class="inner">

      <header class="panel-header" :class="{ in: active }">
        <h2 class="panel-title">hit me up</h2>
      </header>

      <form v-if="!status || status.type !== 'success'" class="form" :class="{ in: active }" @submit.prevent="send">
        <div class="form-row floating">
          <input id="cf-name" v-model="form.name" type="text" placeholder=" " autocomplete="off" />
          <label for="cf-name">Name</label>
        </div>
        <div class="form-row floating">
          <input id="cf-email" v-model="form.email" type="email" placeholder=" " autocomplete="off" />
          <label for="cf-email">Email</label>
        </div>
        <div class="form-row floating">
          <textarea id="cf-msg" v-model="form.message" placeholder=" " rows="4"></textarea>
          <label for="cf-msg">Message</label>
        </div>

        <button type="submit" class="btn-send" :disabled="sending">
          <span v-if="!sending">Send Message</span>
          <span v-else class="dots"><span/><span/><span/></span>
        </button>

        <div v-if="status && status.type === 'error'" :class="['status-msg', status.type]">
          {{ status.text }}
        </div>
      </form>

      <!-- Full Success View -->
      <div v-if="status && status.type === 'success'" class="success-view" :class="{ in: active }">
        <div class="success-icon">✓</div>
        <h3>Message Sent</h3>
        <p>Thanks for reaching out! I'll get back to you soon.</p>
        <button class="btn-reset" @click="resetForm">Send another</button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { CONFIG } from '../data.js'

defineProps({ active: Boolean })

const form    = reactive({ name: '', email: '', message: '' })
const sending = ref(false)
const status  = ref(null)

async function send() {
  status.value = null
  if (!form.name || !form.email || !form.message) {
    status.value = { type: 'err', text: 'Please fill in all fields.' }; return
  }
  if (!form.email.includes('@')) {
    status.value = { type: 'err', text: 'Please enter a valid email.' }; return
  }
  sending.value = true
  try {
    const res  = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, message: form.message })
    })
    const data = await res.json()
    if (data.ok) {
      status.value = { type: 'ok', text: "Sent! I'll get back to you." }
      Object.assign(form, { name: '', email: '', message: '' })
    } else throw new Error()
  } catch {
    status.value = { type: 'err', text: 'Something went wrong. Try reaching me on Telegram directly.' }
  }
  sending.value = false
}

function resetForm() {
  status.value = null
  Object.assign(form, { name: '', email: '', message: '' })
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
  max-width: min(600px, 95vw);
  padding: clamp(24px, 5vh, 56px) clamp(20px, 5vw, 64px);
  display: flex; flex-direction: column;
  gap: clamp(20px, 3.5vh, 32px);
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

.form {
  display: flex; flex-direction: column;
  gap: clamp(12px, 2vh, 16px);
  opacity: 0; transform: translateY(14px);
  transition: opacity .55s .14s, transform .55s .14s cubic-bezier(.22,1,.36,1);
}
.form.in { opacity: 1; transform: none; }

.form-row { position: relative; margin-top: 8px; }
.form-row label {
  position: absolute; left: 14px; top: 12px;
  pointer-events: none; background: transparent; padding: 0 4px; border-radius: 4px;
  font-family: var(--mono); font-size: clamp(.65rem, 1.2vw, .75rem);
  letter-spacing: .08em; text-transform: uppercase; color: var(--faint);
  transition: all .2s cubic-bezier(.22,1,.36,1);
}
.form-row input,
.form-row textarea {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 10px;
  padding: clamp(12px, 2vh, 16px) 14px; color: var(--text);
  font-size: clamp(.82rem, 1.6vw, .9rem); outline: none; resize: none;
  transition: border-color .18s; width: 100%;
}
.form-row input:focus + label,
.form-row input:not(:placeholder-shown) + label,
.form-row textarea:focus + label,
.form-row textarea:not(:placeholder-shown) + label {
  top: -8px; left: 10px; font-size: .55rem;
  background: var(--bg); color: #fff; letter-spacing: .15em;
}
.form-row input:focus,
.form-row textarea:focus { border-color: rgba(255,255,255,.2); }

.btn-send {
  background: #fff; color: #09090c;
  border-radius: 10px;
  padding: clamp(10px, 1.8vh, 13px) 20px;
  font-size: clamp(.84rem, 1.6vw, .9rem); font-weight: 600;
  width: 100%;
  transition: background .18s, transform .15s;
  display: flex; align-items: center; justify-content: center;
  min-height: 44px;
}
.btn-send:hover:not(:disabled) { background: #e8e8e8; transform: translateY(-1px); }
.btn-send:disabled { opacity: .45; cursor: not-allowed; }

.dots { display: flex; gap: 4px; align-items: center; }
.dots span {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--bg); animation: bounce 1.2s infinite;
}
.dots span:nth-child(2) { animation-delay: .2s; }
.dots span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce { 0%,60%,100%{transform:none} 30%{transform:translateY(-4px)} }

.status-msg {
  font-family: var(--mono);
  font-size: clamp(.58rem, 1.1vw, .65rem);
  letter-spacing: .05em; text-align: center;
  padding: 10px 14px; border-radius: 8px;
}
.status-msg.ok  { background: rgba(34,197,94,.07);  color: rgba(34,197,94,.8);  border: 1px solid rgba(34,197,94,.13); }
.status-msg.err { background: rgba(239,68,68,.06);  color: rgba(239,68,68,.7);  border: 1px solid rgba(239,68,68,.12); }

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
    gap: clamp(14px, 2.5vh, 22px);
    min-height: 100dvh;
    justify-content: flex-start;
    padding-top: clamp(48px, 8vh, 64px);
    padding-bottom: clamp(32px, 5vh, 48px);
  }
  .form { gap: 10px; }
  .form-row input,
  .form-row textarea { padding: 9px 12px; font-size: .84rem; }
  .btn-send { padding: 10px 16px; }
}
</style>
