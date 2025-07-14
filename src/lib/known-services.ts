export const knownServices = {
    netflix: {
      name: "Netflix",
      icon: "🎬",
      color: "#E50914",
    },
    spotify: {
      name: "Spotify",
      icon: "🎵",
      color: "#1DB954",
    },
    "adobe creative cloud": {
      name: "Adobe Creative Cloud",
      icon: "🎨",
      color: "#FF0000",
    },
    "microsoft 365": {
      name: "Microsoft 365",
      icon: "📊",
      color: "#0078D4",
    },
    "google workspace": {
      name: "Google Workspace",
      icon: "📧",
      color: "#4285F4",
    },
    github: {
      name: "GitHub",
      icon: "🐙",
      color: "#181717",
    },
    figma: {
      name: "Figma",
      icon: "🎯",
      color: "#F24E1E",
    },
    notion: {
      name: "Notion",
      icon: "📝",
      color: "#000000",
    },
    slack: {
      name: "Slack",
      icon: "💬",
      color: "#4A154B",
    },
    zoom: {
      name: "Zoom",
      icon: "📹",
      color: "#2D8CFF",
    },
  }
  
  export function getKnownService(name: string) {
    const key = name.toLowerCase()
    return knownServices[key as keyof typeof knownServices]
  }
  