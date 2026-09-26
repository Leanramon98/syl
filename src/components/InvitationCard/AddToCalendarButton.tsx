import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPlus, Check, ChevronDown, ExternalLink, Download } from 'lucide-react';

export interface AddToCalendarButtonProps {
  className?: string;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Event details: 06-03-2027 17:00 to 07-03-2027 01:00 (Argentina Time UTC-3 -> 20:00Z to 04:00Z)
  const eventDetails = {
    title: 'Boda Sol & Lea',
    description: '¡Nos casamos! Reservate la fecha para festejar juntos. Más adelante te contamos más detalles.',
    location: 'Buenos Aires, Argentina',
    startDateUtc: '20270306T200000Z',
    endDateUtc: '20270307T040000Z',
  };

  const handleGoogleCalendar = () => {
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventDetails.title
    )}&dates=${eventDetails.startDateUtc}/${eventDetails.endDateUtc}&details=${encodeURIComponent(
      eventDetails.description
    )}&location=${encodeURIComponent(eventDetails.location)}&ctz=America/Argentina/Buenos_Aires`;

    window.open(googleUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 3500);
  };

  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sol y Lea//Boda Save The Date//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:sol-y-lea-boda-20270306@solylea.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${eventDetails.startDateUtc}`,
      `DTEND:${eventDetails.endDateUtc}`,
      `SUMMARY:${eventDetails.title}`,
      `DESCRIPTION:${eventDetails.description}`,
      `LOCATION:${eventDetails.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Boda-Sol-y-Lea.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsOpen(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 3500);
  };

  return (
    <div ref={containerRef} className={`relative inline-block mt-4 sm:mt-5 ${className}`}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full bg-white/70 hover:bg-white/95 border border-[#c4a270]/40 hover:border-[#b4717a]/50 text-[#5D4037] hover:text-[#2C1D18] shadow-[0_2px_10px_rgba(196,162,112,0.12)] backdrop-blur-sm transition-all duration-200 cursor-pointer select-none text-xs sm:text-[13px] font-sans tracking-wider uppercase font-medium focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {added ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#9aa289]" />
            <span className="text-[#5D4037]">¡Evento agregado!</span>
          </>
        ) : (
          <>
            <CalendarPlus className="w-4 h-4 text-[#b4717a]" />
            <span>Agregar a mi Calendario</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8D6E63] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </motion.button>

      {/* Floating Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-1.5 rounded-2xl bg-[#FAF8F3]/95 backdrop-blur-md border border-[#c4a270]/40 shadow-[0_12px_30px_rgba(44,29,24,0.15)] z-50 flex flex-col gap-1 select-none"
          >
            <div className="px-3 py-1.5 text-[11px] font-serif italic text-[#8D6E63] border-b border-[#c4a270]/20 text-center">
              06 Mar 2027 · 17:00 a 01:00 hs
            </div>

            {/* Google Calendar */}
            <button
              type="button"
              onClick={handleGoogleCalendar}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-sans text-[#2C1D18] hover:bg-[#c4a270]/15 hover:text-[#2C1D18] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                <span className="font-medium">Google Calendar</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8D6E63] group-hover:text-[#2C1D18] transition-colors" />
            </button>

            {/* Apple / Outlook / iCal */}
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-sans text-[#2C1D18] hover:bg-[#c4a270]/15 hover:text-[#2C1D18] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#b4717a]" />
                <span className="font-medium">Apple / Outlook (.ics)</span>
              </div>
              <Download className="w-3.5 h-3.5 text-[#8D6E63] group-hover:text-[#2C1D18] transition-colors" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddToCalendarButton;
