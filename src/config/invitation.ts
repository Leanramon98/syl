/**
 * Wedding Invitation Configuration
 *
 * Customize all text, dates, names, locations, and video settings here.
 */

export interface VideoConfig {
  /**
   * Type of video embed or custom stream
   * - 'youtube': YouTube video (watch URL, share URL, or embed URL)
   * - 'vimeo': Vimeo video URL (watch URL or player embed URL)
   * - 'local' | 'custom': Direct MP4/WebM file (e.g. '/video.mp4')
   * - 'auto': Automatically detect based on URL
   */
  type?: 'youtube' | 'vimeo' | 'custom' | 'local' | 'auto';
  /**
   * The embed, share, or video stream URL / local file path.
   * Examples:
   * - YouTube: "https://www.youtube.com/watch?v=LXb3EKWsInQ" or "https://youtu.be/LXb3EKWsInQ"
   * - Vimeo: "https://vimeo.com/123456789"
   * - Local file: "/video.mp4" (placed in the public/ folder)
   */
  url: string;
  /** Accessible title for screen readers and modal header */
  title?: string;
  /** Optional poster image URL for HTML5 video player */
  poster?: string;
}

export interface CoupleConfig {
  person1: string;
  person2: string;
  initials: string;
  subtitle?: string;
}

export interface InvitationConfig {
  couple: CoupleConfig;
  title: string;
  headline?: string;
  date: string;
  time?: string;
  location: string;
  address?: string;
  reception?: string;
  video: VideoConfig;
  buttonText: string;
  replayText: string;
  envelopePrompt: string;
}

export const invitationConfig: InvitationConfig = {
  couple: {
    person1: "Sofía",
    person2: "Tomás",
    initials: "S & T",
    subtitle: "Junto a sus familias",
  },
  title: "Nos casamos",
  headline: "Tenemos el honor de invitarte a celebrar nuestro casamiento",
  date: "15 de noviembre de 2026",
  time: "17:30 hs",
  location: "Estancia La Candelaria",
  address: "Ruta 205 Km 114.5, Lobos, Prov. de Buenos Aires",
  reception: "Ceremonia & Fiesta al atardecer",
  // =========================================================================
  // VIDEO CONFIGURATION
  // =========================================================================
  // The video modal supports YouTube, Vimeo, and local video files (.mp4/.webm).
  // URLs are automatically normalized and optimized for mobile playback.
  //
  // HOW TO SWITCH VIDEO SOURCES:
  //
  // 1. YouTube (Recommended):
  //    type: "youtube", // or "auto"
  //    url: "https://www.youtube.com/watch?v=LXb3EKWsInQ", // or "https://youtu.be/..."
  //    title: "Sofía & Tomás — Nuestra Historia de Amor",
  //
  // 2. Vimeo:
  //    type: "vimeo", // or "auto"
  //    url: "https://vimeo.com/123456789", // or "https://player.vimeo.com/video/..."
  //    title: "Sofía & Tomás — Nuestra Historia de Amor",
  //
  // 3. Local Video File:
  //    Place your video inside the `public/` directory (e.g., `public/video.mp4`)
  //    type: "local", // or "custom", or "auto"
  //    url: "/video.mp4",
  //    poster: "/video-poster.jpg", // Optional cover image before playing
  //    title: "Sofía & Tomás — Nuestra Historia de Amor",
  // =========================================================================
  video: {
    type: "youtube",
    url: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    title: "Sofía & Tomás — Nuestra Historia de Amor",
  },
  buttonText: "Ver video",
  replayText: "Repetir animación",
  envelopePrompt: "Tocar para abrir",
};
