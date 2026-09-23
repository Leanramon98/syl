/**
 * Wedding Digital Invitation Configuration
 *
 * Single centralized configuration object for editing all texts,
 * couple names, dates, colors, fonts, video source, and playback options.
 */

export interface CoupleConfig {
  /** Name of the first partner */
  person1: string;
  /** Name of the second partner */
  person2: string;
  /** Connector between names (e.g. '&', 'y', '+') */
  ampersand?: string;
  /** Monogram initials for the wax seal and interior watermark (e.g. 'S & T') */
  initials: string;
}

export interface VideoConfig {
  /**
   * Type of video embed or custom stream
   * - 'auto': Automatically detect based on URL
   * - 'youtube': YouTube video (watch URL, share URL, or embed URL)
   * - 'vimeo': Vimeo video URL (watch URL or player embed URL)
   * - 'local': Direct MP4/WebM file (e.g. '/video.mp4' in public folder)
   */
  type: 'auto' | 'youtube' | 'vimeo' | 'local';
  /** Video URL or local file path */
  url: string;
  /** Accessible title for screen readers and modal header */
  title: string;
  /** Optional poster image URL for local video playback */
  poster?: string;
}

export interface ThemeConfig {
  /** Main metallic or brand accent (gold) */
  primaryAccent: string;
  /** Darker accent for hover states, active borders and headlines */
  primaryAccentHover: string;
  /** Outer viewport & page background color */
  paperBackground: string;
  /** Inner invitation card background */
  cardBackground: string;
  /** Main heading and text color */
  textPrimary: string;
  /** Subtitle, date, and secondary text color */
  textSecondary: string;
  /** Serif font family for titles and elegant headings */
  fontSerif: string;
  /** Sans-serif font family for dates, labels, and buttons */
  fontSans: string;
  /** Script / calligraphy font family for ornamental ampersand */
  fontScript: string;
}

export interface IntroConfig {
  /**
   * Presentation mode for the invitation opening:
   * - 'frames': Sequential animated frames with smooth cross-fade
   * - 'video': High-quality vertical video intro (e.g. envelope opening animation)
   * - 'animation': Interactive 3D CSS/Framer-Motion gatefold envelope with wax seal & ribbon
   */
  type: 'frames' | 'video' | 'animation';
  /** Path to intro video (e.g. '/intro-envelope.mp4' in public folder) */
  videoSrc?: string;
  /** Frame sequence paths for frame animation mode */
  frames?: string[];
}

export interface OptionsConfig {
  /** Whether the envelope untying & opening animation starts automatically */
  autoPlayIntro: boolean;
  /** Delay in milliseconds before starting the auto-play intro */
  introDelayMs: number;
  /** Show discrete replay button on the revealed card */
  showReplayButton: boolean;
  /** Label for the replay button */
  replayButtonText: string;
}

export interface InvitationConfig {
  couple: CoupleConfig;
  mainPhrase: string;
  date: string;
  secondaryText?: string;
  buttonText: string;
  countdownTargetDate?: string;
  video: VideoConfig;
  theme: ThemeConfig;
  options: OptionsConfig;
  intro: IntroConfig;
  music?: {
    src: string;
    loop: boolean;
    title?: string;
  };
}

export const invitationConfig: InvitationConfig = {
  // Couple Information
  couple: {
    person1: "Sol",
    person2: "Lea",
    ampersand: "&",
    initials: "S & L",
  },

  // Main Invitation Phrasing
  mainPhrase: "NOS CASAMOS, YA TENEMOS LA FECHA",

  // Celebration Date
  date: "06 de Marzo de 2027",

  // Secondary Invitation Text
  secondaryText: "Por ahora solo reservate la fecha... Más adelante te contamos más",

  // Primary Action Button Label
  buttonText: "Descubrir la fecha",

  // Target Date for flip clock countdown timer (06 de Marzo de 2027)
  countdownTargetDate: "2027-03-06T18:00:00",

  // Intro Presentation Mode Configuration
  intro: {
    type: "video",
    videoSrc: "/intro-envelope.mp4",
    frames: [
      "/frames/frame-1.png",
      "/frames/frame-2.png",
      "/frames/frame-3.png",
      "/frames/frame-4.png",
      "/frames/frame-5.png",
    ],
  },

  // Video Source Configuration
  // Supports YouTube, Vimeo, and local video files in the public folder.
  video: {
    type: "youtube",
    url: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    title: "Sol & Lea — Nuestra Boda",
  },

  // Color Palette and Typography Styles (Official Sol & Lea Brand Palette)
  // Brand colors: #9aa289 (sage), #c4a270 (camel sand), #b4717a (dusty rose), #e2b093 (blush), #d4c1bd (dusty alabaster)
  theme: {
    primaryAccent: "#c4a270",
    primaryAccentHover: "#b4717a",
    paperBackground: "#FAF8F3",
    cardBackground: "#FAF8F3",
    textPrimary: "#2C1D18",
    textSecondary: "#5D4037",
    fontSerif: "'Cormorant Garamond', Georgia, serif",
    fontSans: "'Montserrat', sans-serif",
    fontScript: "'Great Vibes', cursive",
  },

  // Interactive Playback Options
  options: {
    autoPlayIntro: false,
    introDelayMs: 800,
    showReplayButton: true,
    replayButtonText: "Volver a ver apertura",
  },

  // Background Audio Configuration
  music: {
    src: "/background-music.mp3",
    loop: true,
    title: "Sarà perché ti amo",
  },
};

