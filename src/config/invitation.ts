/**
 * Wedding Digital Invitation Configuration
 *
 * Centralized configuration for all sections, texts, couple details,
 * date, venue, itinerary, dress code, gifts, playlist, lodging, gallery, etc.
 */

export interface CoupleConfig {
  person1: string;
  person2: string;
  ampersand?: string;
  initials: string;
}

export interface VideoConfig {
  type: 'auto' | 'youtube' | 'vimeo' | 'local';
  url: string;
  title: string;
  poster?: string;
  aspectRatio?: '16:9' | '9:16';
}

export interface ThemeConfig {
  primaryAccent: string;
  primaryAccentHover: string;
  accentSecondary?: string;
  paperBackground: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  fontSerif: string;
  fontSans: string;
  fontScript: string;
}

export interface IntroConfig {
  type: 'frames' | 'video' | 'animation';
  videoSrc?: string;
  frames?: string[];
}

export interface OptionsConfig {
  autoPlayIntro: boolean;
  introDelayMs: number;
  showReplayButton: boolean;
  replayButtonText: string;
}

export interface VenueItem {
  title: string;
  name: string;
  time: string;
  address: string;
  city: string;
  mapUrl: string;
  note?: string;
}

export interface VenueConfig {
  ceremony: VenueItem;
  party: VenueItem;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
  iconName: 'heart' | 'glass' | 'utensils' | 'music' | 'moon' | 'sparkles' | 'camera';
}

export interface DressCodeConfig {
  title: string;
  subtitle: string;
  description: string;
  avoidColorsNote: string;
  colorPalette?: string[];
}

export interface BankDetails {
  bank: string;
  accountType: string;
  cbu: string;
  alias: string;
  titular: string;
}

export interface GiftsConfig {
  title: string;
  message: string;
  bankDetails: BankDetails;
}

export interface PlaylistConfig {
  title: string;
  subtitle: string;
  message: string;
  spotifyUrl: string;
}

export interface LodgingItem {
  name: string;
  description: string;
  distance: string;
  phone?: string;
  websiteUrl?: string;
  whatsapp?: string;
}

export interface PhotoItem {
  url: string;
  caption?: string;
  alt: string;
}

export interface SharedAlbumConfig {
  title: string;
  subtitle: string;
  description: string;
  uploadUrl: string;
  hashtag?: string;
}

export interface TipItem {
  title: string;
  description: string;
  iconName: 'shield' | 'clock' | 'car' | 'smile';
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
  formalInvitation?: {
    passcode: string;
  };
  music?: {
    src: string;
    loop: boolean;
    title?: string;
  };

  // Modular sections
  venue: VenueConfig;
  itinerary: ItineraryItem[];
  dressCode: DressCodeConfig;
  gifts: GiftsConfig;
  playlist: PlaylistConfig;
  gallery: PhotoItem[];
  lodging: LodgingItem[];
  sharedAlbum: SharedAlbumConfig;
  tips: TipItem[];
}

export const invitationConfig: InvitationConfig = {
  couple: {
    person1: "Sol",
    person2: "Lea",
    ampersand: "&",
    initials: "S & L",
  },

  mainPhrase: "NOS CASAMOS, YA TENEMOS LA FECHA",
  date: "06 de Marzo de 2027",
  secondaryText: "Por ahora solo reservate el día,\nmás adelante te contamos más detalles",
  buttonText: "Descubrí cuándo",
  countdownTargetDate: "2027-03-06T18:00:00",

  formalInvitation: {
    passcode: "141014syl",
  },

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

  video: {
    type: "local",
    url: "/save-the-date.mp4",
    title: "Sol & Lea — Save the Date",
    aspectRatio: "9:16",
  },

  theme: {
    primaryAccent: "#732a2d",
    primaryAccentHover: "#b4717a",
    accentSecondary: "#9aa289",
    paperBackground: "#FAF8F5",
    cardBackground: "#FFFFFF",
    textPrimary: "#393734",
    textSecondary: "#73494c",
    fontSerif: "'Cormorant Garamond', Georgia, serif",
    fontSans: "'Rubik', sans-serif",
    fontScript: "'Parisienne', cursive",
  },

  options: {
    autoPlayIntro: false,
    introDelayMs: 800,
    showReplayButton: true,
    replayButtonText: "Volver a ver apertura",
  },

  music: {
    src: "/background-music.mp3",
    loop: true,
    title: "Para siempre — Benjamín Amadeo",
  },

  // 1. Dónde es: Ceremonia y Fiesta
  venue: {
    ceremony: {
      title: "Ceremonia",
      name: "Parroquia San Gabriel",
      time: "18:00 hs",
      address: "Av. de los Eucaliptos 1420",
      city: "Buenos Aires, Argentina",
      mapUrl: "https://maps.google.com/?q=Parroquia+San+Gabriel",
      note: "Te pedimos llegar 15 minutos antes para ubicarnos con tranquilidad.",
    },
    party: {
      title: "Fiesta",
      name: "Estancia Las Marías",
      time: "19:30 hs",
      address: "Ruta 8 Km 54, Ramal Pilar",
      city: "Buenos Aires, Argentina",
      mapUrl: "https://maps.google.com/?q=Estancia+Las+Marias",
      note: "Contamos con estacionamiento privado con seguridad en el predio.",
    },
  },

  // 2. Itinerario / Cronograma del día
  itinerary: [
    {
      time: "18:00 hs",
      title: "Ceremonia Religiosa",
      description: "El momento donde daremos el sí.",
      iconName: "heart",
    },
    {
      time: "19:30 hs",
      title: "Recepción & Cóctel",
      description: "Tragos de bienvenida, appetizers y fotos al atardecer.",
      iconName: "glass",
    },
    {
      time: "21:00 hs",
      title: "Cena & Brindis",
      description: "Entrada, plato principal y los mejores deseos.",
      iconName: "utensils",
    },
    {
      time: "23:00 hs",
      title: "¡A Bailar!",
      description: "Se abre la pista de baile hasta que las velas no ardan.",
      iconName: "music",
    },
    {
      time: "02:30 hs",
      title: "Mesa Dulce & Fin de Fiesta",
      description: "Recarga de energías para seguir festejando.",
      iconName: "sparkles",
    },
  ],

  // 3. Dress Code
  dressCode: {
    title: "Dress Code",
    subtitle: "Elegante",
    description: "Queremos que te sientas cómodo/a y radiante para festejar toda la noche.",
    avoidColorsNote: "El color blanco queda exclusivamente reservado para la novia.",
    colorPalette: [
      "#393734",
      "#b4717a",
      "#732a2d",
      "#73494c",
      "#9aa289",
      "#d4c1bd",
      "#c4a270",
      "#e2b093",
    ],
  },

  // 4. Regalos / Datos bancarios
  gifts: {
    title: "Regalos",
    message: "El mejor regalo es tu presencia y compartir este día con nosotros. Pero si deseás hacernos un presente, podés ayudarnos con nuestra luna de miel:",
    bankDetails: {
      bank: "Banco Galicia",
      accountType: "Caja de Ahorro en Pesos",
      cbu: "0070123430004567890123",
      alias: "SOL.Y.LEA.BODA",
      titular: "Solange & Leandro",
    },
  },

  // 5. Playlist colaborativa
  playlist: {
    title: "¿Qué tema no puede faltar?",
    subtitle: "Playlist de la fiesta",
    message: "Armemos la pista de baile juntos. Dejanos las canciones que te hacen bailar sí o sí.",
    spotifyUrl: "https://open.spotify.com/playlist/365aITY3rFsPpXZr4QS6c4?si=182654ff8f214fa6&pt=5f3e830f5de11f1fbdf8c5f4d9687c86",
  },

  // 6. Galería de fotos nuestras
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      caption: "Nuestro camino juntos",
      alt: "Sol y Lea abrazo",
    },
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      caption: "El día de la propuesta",
      alt: "Propuesta de matrimonio",
    },
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      caption: "Celebrando el amor",
      alt: "Pareja sonriendo",
    },
    {
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
      caption: "Hacia una nueva etapa",
      alt: "Pareja al atardecer",
    },
  ],

  // 7. Recomendación de hospedaje
  lodging: [
    {
      name: "Hotel Howard Johnson Resort & Spa",
      description: "A 10 minutos de la estancia. Habitaciones dobles y familiares con desayuno incluido.",
      distance: "8 km del evento",
      phone: "+54 11 4567-8901",
      whatsapp: "5491145678901",
      websiteUrl: "https://www.google.com",
    },
    {
      name: "Cabañas del Pinar",
      description: "Opción tranquila inmersa en la naturaleza, ideal para grupos y familias.",
      distance: "12 km del evento",
      phone: "+54 11 9876-5432",
      whatsapp: "5491198765432",
      websiteUrl: "https://www.google.com",
    },
  ],

  // 8. Álbum compartido de fotos de la fiesta
  sharedAlbum: {
    title: "Álbum de Fotos",
    subtitle: "Compartí tus fotos",
    description: "Durante y después de la fiesta, subí todas las fotos y videos que saques para que podamos revivir cada recuerdo juntos.",
    uploadUrl: "https://photos.google.com",
    hashtag: "#BodaSolyLea",
  },

  // 9. Tips útiles
  tips: [
    {
      title: "Puntualidad",
      description: "Te recomendamos llegar 15 minutos antes de la ceremonia para ubicarnos con calma.",
      iconName: "clock",
    },
    {
      title: "Estacionamiento",
      description: "El predio cuenta con estacionamiento privado vigilado sin costo adicional.",
      iconName: "car",
    },
    {
      title: "Seguridad",
      description: "Personal de seguridad privada durante todo el desarrollo de la fiesta.",
      iconName: "shield",
    },
  ],
};
