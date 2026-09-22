import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film } from 'lucide-react';
import { type VideoConfig } from '../../config/invitation';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoConfig;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  video,
}) => {
  // Handle keyboard 'Escape' key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
        >
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-[#1A1918] border border-[#C49746]/40 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-[#E5CA96]">
                <Film className="w-4 h-4 text-[#C49746]" />
                <h3
                  id="video-modal-title"
                  className="font-serif text-sm sm:text-base tracking-wider text-[#FAF6EE] truncate font-light"
                >
                  {video.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C49746] cursor-pointer"
                aria-label="Cerrar video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Frame (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {video.type === 'custom' ? (
                <video
                  src={video.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  playsInline
                />
              ) : (
                <iframe
                  src={video.url}
                  title={video.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>

            {/* Modal Footer caption / subtle note */}
            <div className="px-5 py-2.5 bg-black/40 flex items-center justify-center text-center">
              <span className="font-serif italic text-xs text-[#A89885]">
                Pulsa Esc o toca fuera para cerrar
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
