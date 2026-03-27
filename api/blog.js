export default async function handler(req, res) {
  const username = req.query.username || 'rynqrka'

  try {
    const response = await fetch(`https://medium.com/feed/@${username}`)
    if (!response.ok) throw new Error(`Medium returned ${response.status}`)

    const text = await response.text()

    // Simple robust regex parsing for RSS XML (avoiding heavy XML parser dependencies)
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(text)) !== null && items.length < 6) {
      const itemContent = match[1]

      const getTag = (tag) => {
        // Handle explicit CDATA and plain text
        const rx = new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`)
        const m = rx.exec(itemContent)
        return m ? (m[1] || m[2]).trim() : ''
      }

      // Medium also uses content:encoded for the full html payload
      const contentEncodedRx = /<content:encoded>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/content:encoded>/
      const contentMatch = contentEncodedRx.exec(itemContent)
      let content = contentMatch ? (contentMatch[1] || contentMatch[2]).trim() : ''

      if (!content) {
        content = getTag('description')
      }

      // Calculate Read Time
      const pureText = content.replace(/<[^>]*>?/gm, '') // Strip HTML tags
      const wordCount = pureText.split(/\s+/).filter(w => w.length > 0).length
      const readTime = Math.max(1, Math.ceil(wordCount / 200))

      items.push({
        guid: getTag('guid'),
        title: getTag('title').replace(/&amp;/g, '&'),
        link: getTag('link'),
        pubDate: getTag('pubDate'),
        description: content, // Contains HTML
        readTime: `${readTime} min read`
      })
    }

    // Cache on Vercel Edge for 1 hour, browser for 15 mins
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400, max-age=900')
    res.status(200).json(items)
  } catch (error) {
    console.error('Error fetching blog:', error)
    res.status(500).json({ error: 'Failed to fetch blog feed' })
  }
}
