export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  
  const { name, email, message } = req.body || {}
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: 'Missing fields' })

  const text = `📬 New message\n\n👤 ${name}\n📧 ${email}\n\n💬 ${message}`

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
    })

    if (!telegramRes.ok) throw new Error('Telegram API failed')
    
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ ok: false, error: 'Failed to send message' })
  }
}