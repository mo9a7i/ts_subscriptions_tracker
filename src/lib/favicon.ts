// Configuration for favicon fetching
const CONFIG = {
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
    TIMEOUT: 5000,
    PARALLEL_LIMIT: 2,
  }
  
  // Multiple favicon sources to try
  const FAVICON_SOURCES = [
    {
      name: "Google Favicon API",
      getUrl: (domain: string) => `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
    },
    {
      name: "Favicon Kit",
      getUrl: (domain: string) => `https://api.faviconkit.com/${domain}/64`,
    },
    {
      name: "Favicon Grabber",
      getUrl: (domain: string) => `https://favicongrabber.com/api/grab/${domain}`,
      isApi: true,
    },
    {
      name: "DuckDuckGo",
      getUrl: (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    },
    {
      name: "Yandex",
      getUrl: (domain: string) => `https://favicon.yandex.net/favicon/${domain}`,
    },
  ]
  
  // Add this function at the top of the file
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
  
  // Delay utility for retry mechanism
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  
  // Retry mechanism
  async function withRetry<T>(
    fn: () => Promise<T>,
    retries = CONFIG.MAX_RETRIES,
    initialDelay = CONFIG.RETRY_DELAY,
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries === 0) throw error
      await delay(initialDelay)
      return withRetry(fn, retries - 1, initialDelay * 1.5)
    }
  }
  
  // Test if an image URL is accessible
  async function testImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      const timeout = setTimeout(() => {
        resolve(false)
      }, CONFIG.TIMEOUT)
  
      img.onload = () => {
        clearTimeout(timeout)
        resolve(true)
      }
  
      img.onerror = () => {
        clearTimeout(timeout)
        resolve(false)
      }
  
      img.src = url
    })
  }
  
  // Handle API-based favicon services (like favicongrabber)
  async function fetchFromApi(url: string): Promise<string | null> {
    try {
      const response = await fetch(url)
      if (!response.ok) return null
  
      const data = await response.json()
  
      // Handle favicongrabber response format
      if (data.icons && Array.isArray(data.icons) && data.icons.length > 0) {
        // Find the largest icon or first one
        const icon = data.icons.reduce((prev: any, curr: any) => {
          const prevSize = Number.parseInt(prev.sizes?.split("x")[0] || "0")
          const currSize = Number.parseInt(curr.sizes?.split("x")[0] || "0")
          return currSize > prevSize ? curr : prev
        })
  
        if (icon.src && (await testImageUrl(icon.src))) {
          return icon.src
        }
      }
  
      return null
    } catch (error) {
      console.log("API fetch failed:", error)
      return null
    }
  }
  
  // Try to fetch favicon from a single source
  async function tryFaviconSource(source: any, domain: string): Promise<string | null> {
    try {
      const url = source.getUrl(domain)
  
      if (source.isApi) {
        return await fetchFromApi(url)
      } else {
        const isAccessible = await testImageUrl(url)
        return isAccessible ? url : null
      }
    } catch (error) {
      console.log(`Failed to fetch from ${source.name}:`, error)
      return null
    }
  }
  
  // Try website's own favicon paths
  async function tryDirectFavicon(origin: string): Promise<string | null> {
    const faviconPaths = [
      "/favicon.ico",
      "/favicon.png",
      "/apple-touch-icon.png",
      "/apple-touch-icon-precomposed.png",
      "/icon.png",
      "/icon.ico",
    ]
  
    for (const path of faviconPaths) {
      const faviconUrl = `${origin}${path}`
      try {
        if (await testImageUrl(faviconUrl)) {
          return faviconUrl
        }
      } catch (error) {
        continue
      }
    }
  
    return null
  }
  
  // Main favicon fetching function
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
      const urlObject = new URL(normalizedUrl)
      const domain = urlObject.hostname
      const origin = urlObject.origin
  
      console.log(`Fetching favicon for: ${domain} (normalized from: ${url})`)
  
      // First, try the website's own favicon
      const directFavicon = await tryDirectFavicon(origin)
      if (directFavicon) {
        console.log(`Found direct favicon: ${directFavicon}`)
        return directFavicon
      }
  
      // Then try external services in batches
      for (let i = 0; i < FAVICON_SOURCES.length; i += CONFIG.PARALLEL_LIMIT) {
        const batch = FAVICON_SOURCES.slice(i, i + CONFIG.PARALLEL_LIMIT)
  
        const promises = batch.map((source) => withRetry(() => tryFaviconSource(source, domain)).catch(() => null))
  
        const results = await Promise.all(promises)
  
        for (const result of results) {
          if (result) {
            console.log(`Found favicon from external source: ${result}`)
            return result
          }
        }
      }
  
      console.log(`No favicon found for: ${domain}`)
      return null
    } catch (error) {
      console.error("Error fetching favicon:", error)
      return null
    }
  }
  
  // Update fetchFaviconAsDataUrl to use normalized URL
  export async function fetchFaviconAsDataUrl(url: string): Promise<string | null> {
    const normalizedUrl = normalizeUrl(url)
    const faviconUrl = await fetchFavicon(normalizedUrl)
    if (!faviconUrl) return null
  
    try {
      // Convert to data URL for better caching and offline support
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()
  
        img.crossOrigin = "anonymous"
        canvas.width = 64
        canvas.height = 64
  
        img.onload = () => {
          if (ctx) {
            ctx.drawImage(img, 0, 0, 64, 64)
            const dataUrl = canvas.toDataURL("image/png")
            resolve(dataUrl)
          } else {
            resolve(faviconUrl)
          }
        }
  
        img.onerror = () => {
          resolve(faviconUrl) // Fallback to original URL
        }
  
        img.src = faviconUrl
      })
    } catch (error) {
      console.log("Could not convert to data URL:", error)
      return faviconUrl // Return original URL as fallback
    }
  }
  