import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  X,
  ExternalLink,
  Music2,
  Shirt,
  Info,
  Heart,
  Wine,
  Utensils,
  Sparkles,
  Bed,
  Car,
  Phone,
  MessageCircle,
} from 'lucide-react';
import type { GuestGroup } from '../../types/wedding';
import { fetchRsvpByToken } from '../../lib/api';
import { AddToCalendarButton } from '../InvitationCard/AddToCalendarButton';
import { invitationConfig } from '../../config/invitation';
import { FamilyRsvpForm } from './FamilyRsvpForm';
import { LottieAnimation } from '../Common/LottieAnimation';
import { InteractiveEnvelopeIntro } from '../Envelope/InteractiveEnvelopeIntro';

interface FamilyInvitationViewProps {
  token: string;
  onNavigateHome?: () => void;
}

export const FamilyInvitationView: React.FC<FamilyInvitationViewProps> = ({
  token,
}) => {
  const [group, setGroup] = useState<GuestGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio & Envelope Intro state
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Content Modals
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDressCodeModal, setShowDressCodeModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showMusicSongModal, setShowMusicSongModal] = useState(false);

  const [copiedField, setCopiedField] = useState<'alias' | 'cbu' | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown timer calculations
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(invitationConfig.countdownTargetDate || '2027-03-06T18:00:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchRsvpByToken(token)
      .then((data) => {
        if (isMounted) {
          setGroup(data.group);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || 'Invitación no encontrada');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleStartMusic = React.useCallback(() => {
    if (audioRef.current && isMusicEnabled) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));
    }
  }, [isMusicEnabled]);

  const handleEnvelopeComplete = React.useCallback(() => {
    setShowEnvelope(false);
  }, []);

  const toggleMusic = React.useCallback(() => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));
    }
  }, [isPlayingMusic]);

  const handleCopy = (text: string, field: 'alias' | 'cbu') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2200);
  };

  const displayName = group?.name || '';
  const guestList = React.useMemo(() => {
    if (group?.guest_names && group.guest_names.length > 0) {
      return group.guest_names.map((n) => n.trim()).filter(Boolean);
    }
    return [displayName];
  }, [group?.guest_names, displayName]);

  // Sol & Lea Official Brand Palette
  const weddingColors = [
    { hex: '#732a2d', name: 'Burgundy (Principal)' },
    { hex: '#b4717a', name: 'Dusty Rose (Principal)' },
    { hex: '#9aa289', name: 'Sage Green (Complementario)' },
    { hex: '#393734', name: 'Charcoal' },
    { hex: '#73494c', name: 'Mauve Plum' },
    { hex: '#d4c1bd', name: 'Alabaster' },
    { hex: '#c4a270', name: 'Camel Sand' },
    { hex: '#e2b093', name: 'Blush' },
  ];

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-white text-[#732a2d]">
        <div className="w-12 h-12 border-3 border-[#732a2d] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-['Rubik',sans-serif] text-sm tracking-widest uppercase">Cargando...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 text-center bg-white">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#d4c1bd] shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-[#393734] mb-2">
            Invitación no encontrada
          </h2>
          <p className="font-['Rubik',sans-serif] text-xs text-[#73494c]">
            El enlace ingresado no corresponde a ninguna invitación activa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full fine-paper-texture text-[#393734] font-['Rubik',sans-serif]">
      {/* Background audio */}
      <audio ref={audioRef} src="/background-music.mp3" loop preload="metadata" />

      {/* Floating Audio Toggle Button */}
      <div className="fixed top-5 right-5 z-40">
        <button
          onClick={toggleMusic}
          aria-label={isPlayingMusic ? 'Pausar música' : 'Reproducir música'}
          className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg backdrop-blur-md transition-all cursor-pointer ${
            isPlayingMusic
              ? 'bg-[#b4717a] text-white border-[#b4717a] animate-pulse'
              : 'bg-white/95 text-[#732a2d] border-[#d4c1bd] hover:text-[#b4717a]'
          }`}
        >
          {isPlayingMusic ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* 1. Sobre Digital Interactivo Previo (Video sobre abriéndose) */}
      {showEnvelope && (
        <InteractiveEnvelopeIntro
          groupName={displayName}
          maxGuests={group.max_guests}
          onOpen={handleStartMusic}
          onComplete={handleEnvelopeComplete}
          isPlayingMusic={isMusicEnabled}
          onToggleMusic={() => {
            setIsMusicEnabled(!isMusicEnabled);
            if (isPlayingMusic && audioRef.current) {
              audioRef.current.pause();
              setIsPlayingMusic(false);
            }
          }}
        />
      )}

      {/* 2. Portada (Fixdate White exact layout) */}
      <section
        className="relative min-h-[100vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(57, 55, 52, 0.45), rgba(57, 55, 52, 0.45)), url('/fixdate/img/portada-3.jpg')`,
        }}
      >
        <div className="w-full max-w-2xl mx-auto my-auto flex flex-col items-center z-10">
          {/* Fecha con líneas horizontales a los lados */}
          <div className="flex items-center justify-center w-full max-w-xs mb-2">
            <div className="h-px bg-white/60 flex-1" />
            <span className="font-['Rubik',sans-serif] text-lg sm:text-xl font-medium tracking-widest px-4 text-white">
              06.03.2027
            </span>
            <div className="h-px bg-white/60 flex-1" />
          </div>

          {/* Nombres gigantes en tipografía Parisienne con el círculo del & */}
          <h1 className="font-['Parisienne',cursive] text-6xl sm:text-8xl md:text-9xl text-white leading-none my-2 drop-shadow-md">
            Sol
            <span className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-[#b4717a] text-3xl sm:text-4xl font-['Raleway'] font-medium mx-3 sm:mx-4 align-middle shadow-md">
              &
            </span>
            Lea
          </h1>

          {/* Línea horizontal central */}
          <div className="w-3/4 max-w-md h-px bg-white/60 my-6" />

          {/* Frase emotiva con comillas Fixdate */}
          <div className="text-center my-2 max-w-lg">
            <img
              src="/fixdate/img/img_comillaApertura.svg"
              alt="Comilla"
              className="w-8 h-auto mx-auto mb-3 opacity-90"
            />
            <p className="font-['Raleway'] font-medium text-xl sm:text-2xl text-white leading-relaxed drop-shadow-xs px-2">
              Todos somos mortales, <br />
              hasta el primer beso y la segunda copa de vino
            </p>
            <img
              src="/fixdate/img/img_comillaCierre.svg"
              alt="Comilla"
              className="w-8 h-auto mx-auto mt-3 opacity-90"
            />
          </div>

          {/* Flecha animada down-scroll */}
          <div className="mt-8">
            <LottieAnimation
              path="/fixdate/img/down-scroll.json"
              className="w-12 h-12 mx-auto cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 3. Cuenta Regresiva ("Falta") */}
      <section className="pt-16 pb-6 px-4 bg-transparent text-center">
        <div className="max-w-xl mx-auto">
          <span className="font-['Parisienne',cursive] text-5xl sm:text-6xl text-[#732a2d] block mb-8">
            Falta
          </span>

          {/* Reloj de 4 columnas */}
          <div className="flex items-center justify-center max-w-md mx-auto">
            <div className="flex-1 border-r border-[#d4c1bd] px-2 text-center">
              <span className="block text-4xl sm:text-5xl font-light font-['Rubik',sans-serif] text-[#393734]">
                {timeLeft.days}
              </span>
              <span className="block text-xs sm:text-sm font-semibold font-['Raleway',sans-serif] text-[#9aa289] uppercase mt-1">
                días
              </span>
            </div>

            <div className="flex-1 border-r border-[#d4c1bd] px-2 text-center">
              <span className="block text-4xl sm:text-5xl font-light font-['Rubik',sans-serif] text-[#393734]">
                {timeLeft.hours}
              </span>
              <span className="block text-xs sm:text-sm font-semibold font-['Raleway',sans-serif] text-[#9aa289] uppercase mt-1">
                hs
              </span>
            </div>

            <div className="flex-1 border-r border-[#d4c1bd] px-2 text-center">
              <span className="block text-4xl sm:text-5xl font-light font-['Rubik',sans-serif] text-[#393734]">
                {timeLeft.minutes}
              </span>
              <span className="block text-xs sm:text-sm font-semibold font-['Raleway',sans-serif] text-[#9aa289] uppercase mt-1">
                min
              </span>
            </div>

            <div className="flex-1 px-2 text-center">
              <span className="block text-4xl sm:text-5xl font-light font-['Rubik',sans-serif] text-[#393734]">
                {timeLeft.seconds}
              </span>
              <span className="block text-xs sm:text-sm font-semibold font-['Raleway',sans-serif] text-[#9aa289] uppercase mt-1">
                seg
              </span>
            </div>
          </div>
        </div>

        {/* Divisor ornamental Fixdate */}
        <div className="fixdate-divider mt-12" />
      </section>

      {/* 4. Bloque Grupo de Invitados con botón Confirmar Asistencia */}
      <section className="py-8 px-4 bg-transparent">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#d4c1bd]/60 shadow-xl text-center">
            {/* Total de pases en círculo con Dusty Rose */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b4717a] text-white text-3xl font-bold font-['Raleway'] mb-3 shadow-md">
              {group.max_guests}
            </div>

            {/* Título del grupo */}
            <h3 className="font-['Raleway'] text-3xl sm:text-4xl text-[#732a2d] font-semibold tracking-wide my-1 uppercase">
              {displayName}
            </h3>

            {/* Pases info con acento en Sage */}
            <div className="text-sm font-['Rubik',sans-serif] text-[#9aa289] font-medium mt-1">
              {group.max_guests === 1
                ? '(1 pase asignado)'
                : `(${group.max_guests} pases asignados)`}
            </div>

            {/* Lista de invitados asignados con pill Sage suave */}
            <ul className="my-5 space-y-2">
              {guestList.map((guest, idx) => (
                <li
                  key={idx}
                  className="font-['Rubik',sans-serif] text-base sm:text-lg text-[#393734] bg-[#9aa289]/12 border border-[#9aa289]/50 py-1.5 px-4 rounded-lg inline-block mx-1 shadow-2xs font-medium"
                >
                  {guest}
                </li>
              ))}
            </ul>

            {/* Mensaje */}
            <p className="font-['Rubik',sans-serif] text-base text-[#73494c] mt-4 mb-5">
              Tu presencia es lo más importante. ¡No faltes!
            </p>

            {/* Botón Confirmar Asistencia directamente dentro de la tarjeta */}
            <div>
              <button
                type="button"
                onClick={() => setShowRsvpModal(true)}
                className="fixdate-btn text-base px-10 py-3.5 shadow-md hover:shadow-lg"
              >
                Confirmar asistencia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cuándo y Dónde (Ceremonia y Fiesta unificadas en el mismo lugar) */}
      <section className="pt-12 pb-6 px-4 bg-transparent text-center">
        <div className="max-w-2xl mx-auto">
          {/* Animación Lottie: Ceremonia en Bordó, Fiesta en Dusty Rose */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <LottieAnimation
              path="/fixdate/img/json_ceremonia.json"
              className="w-28 h-28 sm:w-32 sm:h-32"
            />
            <LottieAnimation
              path="/fixdate/img/json_fiesta.json"
              className="w-28 h-28 sm:w-32 sm:h-32"
            />
          </div>

          <h3 className="font-['Parisienne',cursive] text-4xl sm:text-6xl text-[#732a2d] mb-2 font-medium">
            Cuándo y Dónde
          </h3>
          <p className="font-['Rubik',sans-serif] text-xs sm:text-sm text-[#b4717a] uppercase tracking-widest mb-8 font-medium">
            Ceremonia & Fiesta
          </p>

          <div className="bg-white/95 rounded-3xl p-8 sm:p-10 border border-[#d4c1bd]/60 shadow-xl max-w-xl mx-auto space-y-7">
            {/* Día */}
            <div className="text-center">
              <h6 className="font-['Rubik',sans-serif] text-xl font-semibold text-[#393734]">
                Día
              </h6>
              <p className="font-['Rubik',sans-serif] text-lg font-medium text-[#732a2d] mt-1 mb-2">
                Sábado 06 de Marzo de 2027
              </p>

              {/* Horarios de Ceremonia (Bordó) y Fiesta (Dusty Rose) */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-['Rubik',sans-serif] font-medium my-3">
                <span className="bg-white text-[#732a2d] px-3.5 py-1.5 rounded-full border border-[#732a2d]/30 shadow-2xs">
                  Ceremonia: 18:00 hs
                </span>
                <span className="bg-white text-[#b4717a] px-3.5 py-1.5 rounded-full border border-[#b4717a]/40 shadow-2xs font-semibold">
                  Fiesta: 19:30 hs
                </span>
              </div>

              <div className="mt-4 flex justify-center">
                <AddToCalendarButton />
              </div>
            </div>

            <div className="w-20 h-px bg-[#d4c1bd] mx-auto" />

            {/* Lugar */}
            <div className="text-center">
              <h6 className="font-['Rubik',sans-serif] text-xl font-semibold text-[#393734]">
                Lugar
              </h6>
              <p className="font-serif text-2xl text-[#393734] font-semibold mt-1">
                Estancia Las Marías
              </p>
              <p className="font-['Rubik',sans-serif] text-sm text-[#73494c] mt-1 mb-2">
                Ruta 8 Km 54, Ramal Pilar — BsAs
              </p>
              <p className="font-['Rubik',sans-serif] text-xs text-[#52634d] font-medium mb-5 bg-[#9aa289]/15 border border-[#9aa289]/30 py-1.5 px-4 rounded-full inline-block">
                La ceremonia y la fiesta se realizarán en el mismo predio
              </p>

              <div>
                <a
                  href={invitationConfig.venue.party.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fixdate-btn-sage"
                >
                  ¿Cómo llegar?
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divisor ornamental Fixdate */}
        <div className="fixdate-divider mt-16" />
      </section>

      {/* 6. Itinerario del Día (Timeline) */}
      <section className="pt-8 pb-6 px-4 bg-transparent text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-['Parisienne',cursive] text-4xl sm:text-5xl text-[#732a2d] mb-2 font-medium">
            Itinerario
          </h2>
          <p className="font-['Rubik',sans-serif] text-sm text-[#b4717a] mb-10">
            El paso a paso de nuestro gran día
          </p>

          <div className="bg-white/95 rounded-3xl p-6 sm:p-10 border border-[#d4c1bd]/60 shadow-xl max-w-xl mx-auto">
            <div className="relative pl-6 sm:pl-8 space-y-8 text-left border-l-2 border-[#9aa289]/40 ml-4 sm:ml-6">
              {invitationConfig.itinerary.map((item, idx) => {
                const icon =
                  item.iconName === 'heart' ? (
                    <Heart className="w-4 h-4 text-[#732a2d]" />
                  ) : item.iconName === 'glass' ? (
                    <Wine className="w-4 h-4 text-[#b4717a]" />
                  ) : item.iconName === 'utensils' ? (
                    <Utensils className="w-4 h-4 text-[#732a2d]" />
                  ) : item.iconName === 'music' ? (
                    <Music2 className="w-4 h-4 text-[#b4717a]" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#9aa289]" />
                  );

                return (
                  <div key={idx} className="relative group">
                    {/* Node Circle */}
                    <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[#9aa289] flex items-center justify-center shadow-xs">
                      {icon}
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-['Rubik',sans-serif] text-xs font-bold text-[#b4717a] uppercase tracking-wider bg-[#b4717a]/10 px-2.5 py-0.5 rounded-full">
                        {item.time}
                      </span>
                    </div>

                    <h4 className="font-['Rubik',sans-serif] text-base sm:text-lg font-semibold text-[#732a2d]">
                      {item.title}
                    </h4>

                    <p className="font-['Rubik',sans-serif] text-xs sm:text-sm text-[#73494c] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divisor ornamental Fixdate */}
        <div className="fixdate-divider mt-16" />
      </section>

      {/* 7. Galería ("Retratos de Nuestro Amor") con fotos Polaroid Fixdate */}
      <section className="pt-8 pb-6 px-4 bg-transparent text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Parisienne',cursive] text-4xl sm:text-5xl text-[#732a2d] mb-2 font-medium">
            Retratos de Nuestro Amor
          </h2>
          <p className="font-['Rubik',sans-serif] text-sm text-[#b4717a] mb-4">
            Un minuto, un segundo, un instante que queda en la eternidad
          </p>

          {/* Lottie Cámara */}
          <LottieAnimation
            path="/fixdate/img/json_camara.json"
            className="w-24 h-24 mx-auto mb-8"
          />

          {/* Grid de Fotos Polaroid reales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="fixdate-polaroid">
                <img
                  src={`/fixdate/img/galeria/${num}.jpg`}
                  alt={`Retrato ${num}`}
                  className="w-full h-48 sm:h-64 object-cover rounded-xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Divisor ornamental Fixdate */}
        <div className="fixdate-divider mt-16" />
      </section>

      {/* 8. Fiesta (3 Bloques de Fixdate con la tríada: Rose, Burgundy, Sage) */}
      <section className="pt-8 pb-6 px-4 bg-transparent text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Parisienne',cursive] text-4xl sm:text-5xl text-[#732a2d] mb-2 font-medium">
            Fiesta
          </h2>
          <p className="font-['Rubik',sans-serif] text-sm text-[#b4717a] max-w-md mx-auto mb-12">
            Hagamos juntos una fiesta épica. Aquí algunos detalles a tener en cuenta.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-2">
            {/* 1. Música (Dusty Rose #b4717a) */}
            <div className="bg-white rounded-2xl p-8 border border-[#b4717a]/35 shadow-md flex flex-col justify-between items-center min-h-[380px]">
              <h3 className="font-['Parisienne',cursive] text-3xl text-[#b4717a] font-medium">
                Música
              </h3>

              <div className="h-24 flex items-center justify-center my-2">
                <LottieAnimation
                  path="/fixdate/img/json_musica.json"
                  className="w-20 h-20 mx-auto"
                />
              </div>

              <p className="font-['Rubik',sans-serif] text-sm text-[#73494c] my-3 leading-relaxed">
                ¿Cuál es la canción que no debe faltar en la PlayList de la fiesta?
              </p>

              <button
                onClick={() => setShowMusicSongModal(true)}
                className="fixdate-btn-rose w-full mt-2"
              >
                Sugerir canción
              </button>
            </div>

            {/* 2. Dress Code (Burgundy #732a2d) */}
            <div className="bg-white rounded-2xl p-8 border border-[#732a2d]/30 shadow-md flex flex-col justify-between items-center min-h-[380px]">
              <h3 className="font-['Parisienne',cursive] text-3xl text-[#732a2d] font-medium">
                Dress Code
              </h3>

              <div className="h-24 flex items-center justify-center my-2">
                <LottieAnimation
                  path="/fixdate/img/json_dresscode.json"
                  className="w-20 h-20 mx-auto"
                />
              </div>

              <p className="font-['Rubik',sans-serif] text-sm text-[#73494c] my-3 leading-relaxed">
                Una orientación para <br /> tu vestuario
              </p>

              <button
                onClick={() => setShowDressCodeModal(true)}
                className="fixdate-btn w-full mt-2"
              >
                Ver más
              </button>
            </div>

            {/* 3. Tips y Notas (Sage Green #9aa289) */}
            <div className="bg-white rounded-2xl p-8 border border-[#9aa289]/45 shadow-md flex flex-col justify-between items-center min-h-[380px]">
              <h3 className="font-['Parisienne',cursive] text-3xl text-[#6b7b62] font-medium">
                Tips y Notas
              </h3>

              <div className="h-24 flex items-center justify-center my-2">
                <LottieAnimation
                  path="/fixdate/img/json_tips.json"
                  className="w-20 h-20 mx-auto"
                />
              </div>

              <p className="font-['Rubik',sans-serif] text-sm text-[#73494c] my-3 leading-relaxed">
                Información adicional <br /> para tener en cuenta
              </p>

              <button
                onClick={() => setShowTipsModal(true)}
                className="fixdate-btn-sage w-full mt-2"
              >
                + Info
              </button>
            </div>
          </div>
        </div>

        {/* Divisor ornamental Fixdate */}
        <div className="fixdate-divider mt-16" />
      </section>

      {/* 9. Hospedaje & Traslados Recomendados */}
      <section className="pt-8 pb-6 px-4 bg-transparent text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Parisienne',cursive] text-4xl sm:text-5xl text-[#732a2d] mb-2 font-medium">
            Hospedaje & Traslados
          </h2>
          <p className="font-['Rubik',sans-serif] text-sm text-[#b4717a] max-w-md mx-auto mb-10">
            Opciones recomendadas cercanas a la estancia para descansar y viajar tranquilos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-6">
            {invitationConfig.lodging.map((hotel, idx) => (
              <div
                key={idx}
                className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-[#d4c1bd]/60 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 font-['Rubik',sans-serif] text-xs font-semibold text-[#52634d] bg-[#9aa289]/15 px-3 py-1 rounded-full">
                      <Bed className="w-3.5 h-3.5" />
                      {hotel.distance}
                    </span>
                  </div>

                  <h3 className="font-['Rubik',sans-serif] text-lg font-semibold text-[#732a2d] my-1">
                    {hotel.name}
                  </h3>

                  <p className="font-['Rubik',sans-serif] text-xs sm:text-sm text-[#73494c] leading-relaxed my-2">
                    {hotel.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {hotel.whatsapp && (
                    <a
                      href={`https://wa.me/${hotel.whatsapp}?text=Hola,%20quisiera%20consultar%20por%20alojamiento%20para%20el%2006%20de%20marzo%20de%202027`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9aa289] hover:bg-[#732a2d] text-white text-xs font-medium transition-all shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {hotel.phone && (
                    <a
                      href={`tel:${hotel.phone}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#d4c1bd] hover:border-[#732a2d] text-[#73494c] hover:text-[#732a2d] text-xs font-medium transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{hotel.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tarjeta de Traslados y Remises */}
          <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-[#d4c1bd]/60 shadow-md text-left max-w-xl mx-auto flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#9aa289]/40 flex items-center justify-center shrink-0 text-[#732a2d]">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Rubik',sans-serif] text-base font-semibold text-[#732a2d]">
                Remises & Combis de la Zona
              </h4>
              <p className="font-['Rubik',sans-serif] text-xs text-[#73494c] mt-1 leading-relaxed">
                Si no vas a venir en auto o querés disfrutar de la fiesta sin preocuparte por manejar, te sugerimos coordinar traslados con anticipación. La estancia cuenta con espacio de descenso y ascenso seguro.
              </p>
            </div>
          </div>
        </div>

        {/* Divisor ornamental Fixdate */}
        <div className="fixdate-divider mt-16" />
      </section>

      {/* 10. Regalos (Dusty Rose Accent) */}
      <section className="pt-8 pb-6 px-4 bg-transparent text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-['Parisienne',cursive] text-4xl sm:text-5xl text-[#732a2d] mb-2 font-medium">
            Regalos
          </h2>
          <p className="font-['Rubik',sans-serif] text-sm text-[#73494c] max-w-md mx-auto mb-4">
            Si deseas regalarnos algo más que tu hermosa presencia...
          </p>

          <LottieAnimation
            path="/fixdate/img/json_regalo.json"
            className="w-20 h-20 mx-auto my-4"
          />

          <button
            onClick={() => setShowBankModal(true)}
            className="fixdate-btn-rose text-base px-10 py-3.5 shadow-lg mt-2"
          >
            Ver más
          </button>
        </div>

        {/* Divisor ornamental Fixdate */}
        <div className="fixdate-divider mt-16" />
      </section>

      {/* 11. Instagram (Sage & Dusty Rose Accent) */}
      <section className="pt-8 pb-16 px-4 bg-transparent text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-['Parisienne',cursive] text-3xl sm:text-4xl text-[#732a2d] mb-2 font-medium">
            Compartimos este día junto a vos
          </h2>
          <p className="font-['Rubik',sans-serif] text-sm text-[#b4717a] max-w-md mx-auto mb-4 font-medium">
            Compartí tus fotos y videos de ese hermoso día
          </p>

          <LottieAnimation
            path="/fixdate/img/json_instagram.json"
            className="w-20 h-20 mx-auto my-4"
          />

          <div className="my-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/"
              className="text-xl sm:text-2xl font-['Rubik',sans-serif] font-semibold text-[#b4717a] hover:text-[#732a2d] transition-colors"
            >
              #solylea
            </a>
          </div>

          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/"
            className="fixdate-btn-sage text-sm px-8 py-3.5 mt-2"
          >
            Ver en Instagram
          </a>
        </div>
      </section>

      {/* 10. Footer (Fixdate Style) */}
      <footer className="py-12 px-4 bg-[#FAF8F5] text-center border-t border-[#d4c1bd]/60">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <h4 className="font-['Parisienne',cursive] text-4xl sm:text-5xl text-[#732a2d]">
            Sol
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#b4717a] text-xl font-['Raleway'] font-medium mx-2 align-middle shadow-xs">
              &
            </span>
            Lea
          </h4>

          <ul className="flex flex-wrap justify-center gap-4 text-xs font-['Rubik',sans-serif] uppercase tracking-wider text-[#73494c]">
            <li>
              <button
                onClick={() => setShowRsvpModal(true)}
                className="hover:text-[#732a2d] transition-colors cursor-pointer font-medium"
              >
                Confirmar asistencia
              </button>
            </li>
            <li>•</li>
            <li>
              <button
                onClick={() => setShowMusicSongModal(true)}
                className="hover:text-[#b4717a] transition-colors cursor-pointer font-medium"
              >
                Sugerir canción
              </button>
            </li>
            <li>•</li>
            <li>
              <button
                onClick={() => setShowBankModal(true)}
                className="hover:text-[#9aa289] transition-colors cursor-pointer font-medium"
              >
                Regalos
              </button>
            </li>
            <li>•</li>
            <li>
              <button
                onClick={() => setShowEnvelope(true)}
                className="hover:text-[#732a2d] transition-colors cursor-pointer font-medium"
              >
                Ver sobre
              </button>
            </li>
          </ul>
        </div>
      </footer>

      {/* ==================== MODALS ==================== */}

      {/* MODAL 1: Confirmar Asistencia (RSVP) */}
      <AnimatePresence>
        {showRsvpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg my-auto"
            >
              <FamilyRsvpForm
                group={group}
                onClose={() => setShowRsvpModal(false)}
                onSubmitted={(updated) => {
                  setGroup(updated);
                  setTimeout(() => {
                    setShowRsvpModal(false);
                  }, 1800);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Regalos (Datos Bancarios) */}
      <AnimatePresence>
        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4c1bd]/60"
            >
              <button
                onClick={() => setShowBankModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#73494c] hover:text-[#393734] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <span className="font-['Parisienne',cursive] text-4xl text-[#732a2d] block mb-1">
                  Regalos
                </span>
                <p className="font-['Rubik',sans-serif] text-xs text-[#73494c]">
                  Luna de miel — Solange & Leandro
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div className="border-b border-gray-100 pb-2">
                  <span className="font-['Rubik',sans-serif] text-[11px] text-[#73494c] block uppercase tracking-wider">
                    Banco
                  </span>
                  <p className="font-serif text-base font-semibold text-[#393734]">
                    {invitationConfig.gifts.bankDetails.bank} ({invitationConfig.gifts.bankDetails.accountType})
                  </p>
                </div>

                <div className="border-b border-gray-100 pb-2">
                  <span className="font-['Rubik',sans-serif] text-[11px] text-[#73494c] block uppercase tracking-wider">
                    Titular
                  </span>
                  <p className="font-serif text-base font-semibold text-[#393734]">
                    {invitationConfig.gifts.bankDetails.titular}
                  </p>
                </div>

                {/* Alias */}
                <div className="flex items-center justify-between gap-2 p-3 bg-[#FAF8F5] rounded-2xl border border-[#d4c1bd]/60">
                  <div>
                    <span className="font-['Rubik',sans-serif] text-[11px] text-[#73494c] block uppercase tracking-wider">
                      Alias
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-[#732a2d]">
                      {invitationConfig.gifts.bankDetails.alias}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(invitationConfig.gifts.bankDetails.alias, 'alias')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#732a2d] hover:bg-[#b4717a] text-white text-xs font-medium transition-all cursor-pointer shadow-xs"
                  >
                    {copiedField === 'alias' ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* CBU */}
                <div className="flex items-center justify-between gap-2 p-3 bg-[#FAF8F5] rounded-2xl border border-[#d4c1bd]/60">
                  <div className="min-w-0">
                    <span className="font-['Rubik',sans-serif] text-[11px] text-[#73494c] block uppercase tracking-wider">
                      CBU
                    </span>
                    <span className="font-mono text-xs font-medium text-[#393734] truncate block">
                      {invitationConfig.gifts.bankDetails.cbu}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(invitationConfig.gifts.bankDetails.cbu, 'cbu')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d4c1bd] text-[#73494c] hover:text-[#393734] hover:border-[#732a2d] text-xs font-medium transition-all cursor-pointer shrink-0"
                  >
                    {copiedField === 'cbu' ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Dress Code con Paleta Oficial */}
      <AnimatePresence>
        {showDressCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4c1bd]/60 text-center"
            >
              <button
                onClick={() => setShowDressCodeModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#73494c] hover:text-[#393734] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#732a2d] flex items-center justify-center mx-auto mb-3 border border-[#9aa289]/40">
                <Shirt className="w-7 h-7 stroke-[1.5]" />
              </div>

              <h5 className="font-['Parisienne',cursive] text-4xl text-[#732a2d] mb-2 font-medium">
                Dress Code
              </h5>

              <p className="font-serif text-2xl text-[#732a2d] font-normal mb-2">
                Elegante
              </p>

              <p className="font-['Rubik',sans-serif] text-sm text-[#73494c] leading-relaxed mb-5">
                Queremos que te sientas cómodo/a y radiante para festejar toda la noche con nosotros.
              </p>

              {/* Muestra visual de la paleta oficial de Sol & Lea */}
              <div className="mb-5 p-4 bg-[#FAF8F5] rounded-2xl border border-[#d4c1bd]/60">
                <span className="font-['Rubik',sans-serif] text-xs font-semibold uppercase tracking-wider text-[#732a2d] block mb-3">
                  Nuestra paleta de colores
                </span>
                <div className="grid grid-cols-4 gap-2.5 max-w-[260px] mx-auto">
                  {weddingColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        style={{ backgroundColor: color.hex }}
                        className="w-9 h-9 rounded-xl border border-black/10 shadow-xs"
                        title={`${color.name} (${color.hex})`}
                      />
                      <span className="font-mono text-[9px] text-[#73494c] mt-1 font-medium">
                        {color.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#b4717a]/50 text-xs font-serif italic text-[#732a2d]">
                El color blanco queda exclusivamente reservado para la novia.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Tips y Notas */}
      <AnimatePresence>
        {showTipsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4c1bd]/60"
            >
              <button
                onClick={() => setShowTipsModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#73494c] hover:text-[#393734] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#732a2d] flex items-center justify-center mx-auto mb-3 border border-[#9aa289]/40">
                  <Info className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h5 className="font-['Parisienne',cursive] text-4xl text-[#732a2d] mb-1 font-medium">
                  Tips y Notas
                </h5>
                <p className="font-['Rubik',sans-serif] text-xs text-[#73494c]">
                  Información para tener en cuenta
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#d4c1bd]/60">
                  <p className="font-['Rubik',sans-serif] font-semibold text-sm text-[#732a2d] mb-1">
                    ⏰ Puntualidad
                  </p>
                  <p className="font-['Rubik',sans-serif] text-xs text-[#73494c] leading-relaxed">
                    Te recomendamos llegar 15 minutos antes de la ceremonia para ubicarnos con tranquilidad.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#d4c1bd]/60">
                  <p className="font-['Rubik',sans-serif] font-semibold text-sm text-[#732a2d] mb-1">
                    🚗 Estacionamiento
                  </p>
                  <p className="font-['Rubik',sans-serif] text-xs text-[#73494c] leading-relaxed">
                    El predio cuenta con estacionamiento privado con seguridad vigilada durante todo el evento.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: Sugerir Canción */}
      <AnimatePresence>
        {showMusicSongModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4c1bd]/60 text-center"
            >
              <button
                onClick={() => setShowMusicSongModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#73494c] hover:text-[#393734] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#732a2d] flex items-center justify-center mx-auto mb-3 border border-[#9aa289]/40">
                <Music2 className="w-7 h-7 stroke-[1.5]" />
              </div>

              <h5 className="font-['Parisienne',cursive] text-4xl text-[#732a2d] mb-2 font-medium">
                Sugerir Canción
              </h5>

              <p className="font-['Rubik',sans-serif] text-sm text-[#73494c] leading-relaxed mb-6">
                ¡Armemos juntos la pista de baile! Dejanos el tema que no puede faltar.
              </p>

              <a
                href={invitationConfig.playlist.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fixdate-btn w-full inline-flex items-center justify-center gap-2"
              >
                <span>Abrir Playlist en Spotify</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
