const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`

let cachedAccessToken = null
let tokenExpiry = 0

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiry) return cachedAccessToken

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  })

  const data = await response.json()
  if (data.access_token) {
    cachedAccessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Buffer
  }
  return cachedAccessToken
}

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.max(1, Math.floor(diffMs / 60000))
  
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  
  const options = { month: 'short', day: 'numeric' }
  if (date.getFullYear() !== now.getFullYear()) options.year = 'numeric'
  return `on ${date.toLocaleDateString('en-US', options)}`
}

export default async function handler(req, res) {
  if (!refresh_token || !client_id || !client_secret) {
    return res.status(200).json({ isPlaying: false, message: 'Spotify not configured natively yet' })
  }

  try {
    const token = await getAccessToken()
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    })

    let isPlaying = false
    let songItem = null
    let playedAt = null

    if (response.status !== 204 && response.status < 400) {
      const songData = await response.json()
      if (songData.item && songData.is_playing) {
        isPlaying = true
        songItem = songData.item
      }
    }

    if (!isPlaying) {
      // Fetch recently played
      const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (recentRes.ok) {
        const recentData = await recentRes.json()
        if (recentData.items && recentData.items.length > 0) {
          songItem = recentData.items[0].track
          playedAt = recentData.items[0].played_at
        }
      }
    }

    if (!songItem) {
      return res.status(200).json({ isPlaying: false })
    }

    const title = songItem.name
    const artist = songItem.artists.map((a) => a.name).join(', ')
    const album = songItem.album.name
    const albumImageUrl = songItem.album.images[0].url
    const songUrl = songItem.external_urls.spotify
    const lastPlayedText = playedAt ? `was listening ${timeAgo(playedAt)}` : null

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15')
    return res.status(200).json({
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
      lastPlayedText
    })
  } catch (error) {
    console.error('Error fetching Spotify:', error)
    return res.status(200).json({ isPlaying: false, error: 'Failed to fetch' })
  }
}
