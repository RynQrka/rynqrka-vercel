const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`
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

export default async function handler(req, res) {
  // If user hasn't configured Spotify env vars yet, gracefully mock or fail
  if (!refresh_token || !client_id || !client_secret) {
    return res.status(200).json({ isPlaying: false, message: 'Spotify not configured natively yet' })
  }

  try {
    const token = await getAccessToken()
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.status === 204 || response.status > 400) {
      return res.status(200).json({ isPlaying: false })
    }

    const song = await response.json()
    if (!song.item) {
      return res.status(200).json({ isPlaying: false })
    }

    const isPlaying = song.is_playing
    const title = song.item.name
    const artist = song.item.artists.map((_artist) => _artist.name).join(', ')
    const album = song.item.album.name
    const albumImageUrl = song.item.album.images[0].url
    const songUrl = song.item.external_urls.spotify

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15')
    return res.status(200).json({
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
    })
  } catch (error) {
    console.error('Error fetching Spotify:', error)
    return res.status(200).json({ isPlaying: false, error: 'Failed to fetch' })
  }
}
