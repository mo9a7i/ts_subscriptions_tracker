'use server'

export async function fetchImageAsDataUrl(imageUrl: string): Promise<string | null> {
  try {
    // Fetch image from server-side (no CORS issues)
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      console.log('Failed to fetch image:', response.status, response.statusText)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Determine content type
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // Convert to data URL
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`
    
    return dataUrl
  } catch (error) {
    console.log('Error fetching image server-side:', error)
    return null
  }
} 