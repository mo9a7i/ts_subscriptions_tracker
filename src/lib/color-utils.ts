import { Vibrant } from 'node-vibrant/browser'
import { fetchImageAsDataUrl } from './server-actions'

export interface ExtractedColors {
  Vibrant?: string
  Muted?: string
  DarkVibrant?: string
  DarkMuted?: string
  LightVibrant?: string
  LightMuted?: string
}

// Brand colors for known services as fallback
const knownServiceColors: { [key: string]: ExtractedColors } = {
  'youtube': {
    Vibrant: '#FF0000',
    DarkVibrant: '#CC0000',
    Muted: '#B71C1C',
    DarkMuted: '#8B0000'
  },
  'netflix': {
    Vibrant: '#E50914',
    DarkVibrant: '#B20710',
    Muted: '#8B0000',
    DarkMuted: '#660000'
  },
  'spotify': {
    Vibrant: '#1DB954',
    DarkVibrant: '#1AA34A',
    Muted: '#0F7B2C',
    DarkMuted: '#0A5D22'
  },
  'github': {
    Vibrant: '#24292E',
    DarkVibrant: '#1B1F23',
    Muted: '#586069',
    DarkMuted: '#2F363D'
  },
  'icloud': {
    Vibrant: '#007AFF',
    DarkVibrant: '#0051D5',
    Muted: '#4A90E2',
    DarkMuted: '#1565C0'
  },
  'adobe': {
    Vibrant: '#FF0000',
    DarkVibrant: '#CC0000',
    Muted: '#E53935',
    DarkMuted: '#C62828'
  },
  'chatgpt': {
    Vibrant: '#10A37F',
    DarkVibrant: '#0D8B6B',
    Muted: '#26A69A',
    DarkMuted: '#00695C'
  },
  'perplexity': {
    Vibrant: '#6B73FF',
    DarkVibrant: '#4E56CC',
    Muted: '#7986CB',
    DarkMuted: '#3F51B5'
  }
}

function getServiceColorsByName(serviceName: string): ExtractedColors | null {
  const name = serviceName.toLowerCase()
  
  for (const [key, colors] of Object.entries(knownServiceColors)) {
    if (name.includes(key)) {
      return colors
    }
  }
  
  return null
}

function isExternalUrl(imageUrl: string): boolean {
  return imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
}

function isDataUrl(imageUrl: string): boolean {
  return imageUrl.startsWith('data:')
}

function isSVGFile(imageUrl: string): boolean {
  return imageUrl.toLowerCase().includes('.svg')
}

export async function extractColorsFromImage(imageUrl: string, serviceName?: string): Promise<ExtractedColors> {
  try {
    let processedImageUrl = imageUrl
    
    // Skip SVG files (still unsupported)
    if (isSVGFile(imageUrl)) {
      console.log('Skipping color extraction for SVG format:', imageUrl)
      return serviceName ? getServiceColorsByName(serviceName) || {} : {}
    }
    
    // For external URLs, fetch server-side to avoid CORS
    if (isExternalUrl(imageUrl) && !isDataUrl(imageUrl)) {
      try {
        console.log('Fetching external image server-side:', imageUrl)
        const dataUrl = await fetchImageAsDataUrl(imageUrl)
        if (dataUrl) {
          processedImageUrl = dataUrl
        } else {
          console.log('Failed to fetch external image, trying brand colors')
          return serviceName ? getServiceColorsByName(serviceName) || {} : {}
        }
      } catch (error) {
        console.log('Server-side image fetch failed, trying brand colors:', error)
        return serviceName ? getServiceColorsByName(serviceName) || {} : {}
      }
    }

    const palette = await Vibrant.from(processedImageUrl).getPalette()
    
    const colors: ExtractedColors = {}
    
    if (palette.Vibrant) colors.Vibrant = palette.Vibrant.hex
    if (palette.Muted) colors.Muted = palette.Muted.hex
    if (palette.DarkVibrant) colors.DarkVibrant = palette.DarkVibrant.hex
    if (palette.DarkMuted) colors.DarkMuted = palette.DarkMuted.hex
    if (palette.LightVibrant) colors.LightVibrant = palette.LightVibrant.hex
    if (palette.LightMuted) colors.LightMuted = palette.LightMuted.hex
    
    return colors
  } catch (error) {
    console.log('Color extraction failed, trying brand colors:', error)
    return serviceName ? getServiceColorsByName(serviceName) || {} : {}
  }
}

export function getBestColorForBackground(colors: ExtractedColors): string {
  // Priority order: DarkMuted (best for backgrounds), Muted, DarkVibrant, Vibrant
  return colors.DarkMuted || colors.Muted || colors.DarkVibrant || colors.Vibrant || '#6B7280'
}

export function getBestColorForAccent(colors: ExtractedColors): string {
  // Priority order: Vibrant (best for accents), LightVibrant, DarkVibrant, Muted
  return colors.Vibrant || colors.LightVibrant || colors.DarkVibrant || colors.Muted || '#3B82F6'
} 