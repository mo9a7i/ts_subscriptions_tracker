// Direct favicon service configuration
const FAVICON_SERVICE_URL = "https://newfav.mohannad-otaibi.workers.dev/?url="

// URL normalization helper
  function normalizeUrl(url: string): string {
    if (!url) return url
  
    // Remove any whitespace
    url = url.trim()
  
    // If it doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      url = `https://${url}`
    }
  
    return url
  }
  
  // URL validation
  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
// Main favicon fetching function - returns service URL directly
  export async function fetchFavicon(url: string): Promise<string | null> {
    if (!url || url === "#") {
      return null
    }
  
    // Normalize the URL first
    const normalizedUrl = normalizeUrl(url)
  
    if (!isValidUrl(normalizedUrl)) {
      return null
    }
  
    try {
    // Use favicon service directly (returns PNG image, no CORS issues)
    const serviceUrl = `${FAVICON_SERVICE_URL}${encodeURIComponent(normalizedUrl)}`
    console.log(`Storing favicon service URL directly: ${serviceUrl}`)
    return serviceUrl

    } catch (error) {
    console.error("Error creating favicon service URL:", error)
      return null
    }
  }
  
// Simplified favicon fetching - returns service URL directly
  export async function fetchFaviconAsDataUrl(url: string): Promise<string | null> {
    const normalizedUrl = normalizeUrl(url)
    const faviconUrl = await fetchFavicon(normalizedUrl)
  return faviconUrl // Return the service URL directly - it's already an image
  }
  