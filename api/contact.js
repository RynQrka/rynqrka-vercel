export default async function handler(req, res) {
  const { name, email, message } = req.body
  const text = `📬 New message\n\n👤 ${name}\n📧 ${email}\n\n💬 ${message}`

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
  })

  res.status(200).json({ ok: true })
}