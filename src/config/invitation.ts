/**
 * Wedding Invitation Configuration
 *
 * Customize all text, dates, names, locations, and video settings here.
 */

export interface VideoConfig {
  /**
   * Type of video embed or custom stream
   * - 'youtube': Standard YouTube embed URL (e.g. https://www.youtube-nocookie.com/embed/...)
   * - 'vimeo': Vimeo player embed URL (e.g. https://player.vimeo.com/video/...)
   * - 'custom': Direct MP4/WebM URL for HTML5 <video> player
   */
  type: 'youtube' | 'vimeo' | 'custom';
  /**
   * The embed or video stream URL.
   * For YouTube, use privacy-enhanced embed domain: https://www.youtube-nocookie.com/embed/{VIDEO_ID}?autoplay=1
   */
  url: string;
  /** Accessible title for screen readers and modal header */
  title: string;
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
  video: {
    type: "youtube",
    // Sample romantic cinematic wedding teaser embed
    // To change to your own video, replace with your YouTube video ID:
    // e.g., "https://www.youtube-nocookie.com/embed/YOUR_ID?autoplay=1&rel=0"
    url: "https://www.youtube-nocookie.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1",
    title: "Sofía & Tomás — Nuestra Historia de Amor",
  },
  buttonText: "Ver video",
  replayText: "Repetir animación",
  envelopePrompt: "Tocar para abrir",
};
