import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film } from 'lucide-react';
import { type VideoConfig } from '../../config/invitation';

export interface VideoModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback fired when modal is dismissed (via X button, backdrop tap, or Escape key) */
  onClose: () => void;
  /** Direct video source URL or local path (e.g. YouTube URL, Vimeo URL, or '/video.mp4') */
  src?: string;
  /** Alternative alias for `src` */
  url?: string;
  /** Explicit video provider type or 'auto' to auto-detect */
  type?: 'youtube' | 'vimeo' | 'local' | 'custom' | 'auto';
  /** Accessible title for modal header */
  title?: string;
  /** Optional poster image URL for local video playback */
  poster?: string;
  /** Backward-compatible configuration object */
  video?: VideoConfig;
}

/**
 * Extracts 11-character YouTube video ID from various standard, short, and embed URLs.
 */
function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const regExp =
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = rawUrl.match(regExp);
  return match ? match[1] : null;
}

/**
 * Normalizes YouTube URLs into privacy-enhanced embed URLs with mobile-ready autoplay parameters.
 */
function normalizeYouTubeUrl(rawUrl: string): string {
  const id = extractYouTubeId(rawUrl);
  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }
  return rawUrl;
}

/**
 * Extracts numeric Vimeo video ID from URLs.
 */
function extractVimeoId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const regExp =
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|video\/|)|player\.vimeo\.com\/video\/)(\d+)/i;
  const match = rawUrl.match(regExp);
  return match ? match[1] : null;
}

/**
 * Normalizes Vimeo URLs into player embed URLs with autoplay.
 */
function normalizeVimeoUrl(rawUrl: string): string {
  const id = extractVimeoId(rawUrl);
  if (id) {
    return `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`;
  }
  return rawUrl;
}

/**
 * Determines whether the video source is YouTube, Vimeo, or a local file.
 */
function resolveVideoType(
  rawUrl: string,
  explicitType?: 'youtube' | 'vimeo' | 'local' | 'custom' | 'auto'
): 'youtube' | 'vimeo' | 'local' {
  if (explicitType && explicitType !== 'auto') {
    if (explicitType === 'custom') return 'local';
    return explicitType;
  }

  const url = rawUrl.trim();
  if (extractYouTubeId(url) || /youtube\.com|youtu\.be/i.test(url)) {
    return 'youtube';
  }

  if (extractVimeoId(url) || /vimeo\.com/i.test(url)) {
    return 'vimeo';
  }

  if (
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) ||
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('blob:') ||
    url.startsWith('data:video')
  ) {
    return 'local';
  }

  return 'youtube';
}

/**
 * Returns the final playable embed or stream URL.
 */
function getFinalVideoUrl(
  rawUrl: string,
  videoType: 'youtube' | 'vimeo' | 'local'
): string {
  if (videoType === 'youtube') {
    return normalizeYouTubeUrl(rawUrl);
  }
  if (videoType === 'vimeo') {
    return normalizeVimeoUrl(rawUrl);
  }
  return rawUrl;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  src,
  url,
  type,
  title,
  poster,
  video,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Resolve effective props (direct props take precedence over video object)
  const rawUrl = (url || src || video?.url || '').trim();
  const rawType = type || video?.type || 'auto';
  const effectiveTitle = title || video?.title || 'Video de la boda';
  const effectivePoster = poster || video?.poster;

  const resolvedType = resolveVideoType(rawUrl, rawType);
  const finalVideoUrl = getFinalVideoUrl(rawUrl, resolvedType);

  // Lock scroll, manage Escape key dismiss, and handle focus
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button for accessible keyboard navigation
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          onClick={onClose}
        >
          {/* Backdrop Scrim with dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md pointer-events-none"
            aria-hidden="true"
          />

          {/* Subtle luxury golden vignette overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,151,70,0.12)_0%,rgba(10,9,8,0.92)_85%)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 14 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-[#141312] border border-[#C49746]/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(196,151,70,0.15)] flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[#C49746]/20 bg-[#1A1918]/90 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C49746]/10 border border-[#C49746]/30 flex items-center justify-center text-[#E5CA96]">
                  <Film className="w-3.5 h-3.5 text-[#C49746]" />
                </div>
                <h3
                  id="video-modal-title"
                  className="font-serif text-sm sm:text-base tracking-wide text-[#FAF6EE] truncate font-light"
                >
                  {effectiveTitle}
                </h3>
              </div>

              {/* Gold Accented Close Button (Min 44x44px touch target) */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full p-2 text-[#E5CA96] hover:text-[#FAF6EE] bg-[#C49746]/10 hover:bg-[#C49746]/20 active:bg-[#C49746]/30 border border-[#C49746]/35 hover:border-[#C49746]/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C49746] cursor-pointer"
                aria-label="Cerrar video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Frame (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {resolvedType === 'local' ? (
                <video
                  key={finalVideoUrl}
                  src={finalVideoUrl}
                  poster={effectivePoster}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Tu navegador no soporta la reproducción de video HTML5.
                </video>
              ) : (
                <iframe
                  key={finalVideoUrl}
                  src={finalVideoUrl}
                  title={effectiveTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>

            {/* Modal Footer caption / subtle note */}
            <div className="px-4 sm:px-6 py-2.5 bg-[#0F0E0D] border-t border-white/5 flex items-center justify-between text-xs text-[#A89885]">
              <span className="font-serif italic tracking-wide hidden sm:inline text-xs text-[#A89885]/80">
                {effectiveTitle}
              </span>
              <span className="font-serif italic text-center w-full sm:w-auto sm:ml-auto text-[11px] sm:text-xs text-[#8E8070]">
                Presiona Esc o toca fuera para cerrar
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
