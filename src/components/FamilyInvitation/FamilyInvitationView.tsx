import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GuestGroup } from '../../types/wedding';
import { fetchRsvpByToken, submitRsvp } from '../../lib/api';
import { InteractiveEnvelopeIntro } from '../Envelope/InteractiveEnvelopeIntro';

interface FamilyInvitationViewProps {
  token: string;
  onNavigateHome?: () => void;
}

export const FamilyInvitationView: React.FC<FamilyInvitationViewProps> = ({ token }) => {
  const [group, setGroup] = useState<GuestGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio & Envelope Intro state
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown timer calculations (Target: 06 de Marzo de 2027 a las 18:00)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2027-03-06T18:00:00').getTime();

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

  // Fetch guest group data
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
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'No se encontró la invitación');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Audio control
  const handleStartMusic = useCallback(() => {
    if (isMusicEnabled && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlayingMusic(true))
        .catch((e) => {
          console.warn('Audio auto-play prevented:', e);
          setIsPlayingMusic(false);
        });
    }
  }, [isMusicEnabled]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
      setIsMusicEnabled(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlayingMusic(true);
          setIsMusicEnabled(true);
        })
        .catch(console.warn);
    }
  };

  const handleEnvelopeComplete = () => {
    setShowEnvelope(false);
    handleStartMusic();
  };

  // Reveal animation on scroll
  useEffect(() => {
    const handleScrollReveal = () => {
      const elements = document.querySelectorAll('.reveal:not(.in)');
      const windowHeight = window.innerHeight;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.88) {
          el.classList.add('in');
        }
      });
    };

    window.addEventListener('scroll', handleScrollReveal, { passive: true });
    // Run initially after brief timeout
    const timer = setTimeout(handleScrollReveal, 300);

    return () => {
      window.removeEventListener('scroll', handleScrollReveal);
      clearTimeout(timer);
    };
  }, [showEnvelope, loading]);

  // Regalos accordion state
  const [showGiftDetails, setShowGiftDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<'alias' | 'cbu' | null>(null);

  const handleCopy = (text: string, field: 'alias' | 'cbu') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2200);
  };

  // RSVP Form State
  const [rsvpAttending, setRsvpAttending] = useState<'attending' | 'declined'>('attending');
  const [confirmedGuests, setConfirmedGuests] = useState<number>(1);
  const [menuChoice, setMenuChoice] = useState<'Normal' | 'Vegetariano' | 'Celíaco'>('Normal');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Initialize RSVP count once group is loaded
  useEffect(() => {
    if (group) {
      if (group.confirmed_count > 0) {
        setConfirmedGuests(group.confirmed_count);
      } else {
        setConfirmedGuests(Math.min(group.max_guests, 1));
      }
      if (group.rsvp_status === 'attending') {
        setRsvpSuccess(true);
        setRsvpAttending('attending');
      } else if (group.rsvp_status === 'declined') {
        setRsvpSuccess(true);
        setRsvpAttending('declined');
      }
    }
  }, [group]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    setRsvpSubmitting(true);
    setRsvpError(null);

    const dietaryPayload = [
      `Menú: ${menuChoice}`,
      dietaryNotes ? `Restricciones: ${dietaryNotes}` : '',
      rsvpMessage ? `Mensaje: ${rsvpMessage}` : '',
    ].filter(Boolean).join(' | ');

    try {
      const res = await submitRsvp({
        token: group.token,
        name: group.name,
        rsvp_status: rsvpAttending,
        confirmed_count: rsvpAttending === 'attending' ? confirmedGuests : 0,
        dietary_requirements: dietaryPayload,
      });

      if (res.success) {
        setRsvpSuccess(true);
        if (res.group) {
          setGroup(res.group);
        }
      }
    } catch (err: any) {
      setRsvpError(err?.message || 'Error al registrar tu confirmación. Por favor intentá nuevamente.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F9F0EA] text-[#53111B] font-['Instrument_Serif']">
        <div className="w-10 h-10 border-2 border-[#C3A15E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl italic">Cargando invitación...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#F9F0EA] text-[#53111B] text-center font-['Instrument_Serif']">
        <h1 className="text-3xl mb-3">Invitación no encontrada</h1>
        <p className="font-['Neue_Regrade'] text-sm text-[#9A7B6A] max-w-sm mb-6">
          El enlace que utilizaste no es válido o ya caducó. Por favor contactate con Sol & Lea.
        </p>
      </div>
    );
  }

  const displayName = group.name;

  return (
    <div className="relative w-full overflow-x-hidden select-none bg-[#F9F0EA]">
      {/* Background Music Audio Element */}
      <audio ref={audioRef} src="/background-music.mp3" loop preload="auto" />

      {/* 1. Envelope Intro Screen (seamless, auto-opens after 3s) */}
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

      {/* Floating Music Toggle Button */}
      <button
        className={`music ${isPlayingMusic ? 'playing' : ''}`}
        type="button"
        onClick={toggleMusic}
        aria-label={isPlayingMusic ? 'Pausar música' : 'Reproducir música'}
        title="Música"
      >
        <svg className="ic-play ring" viewBox="0 0 24 24">
          <polygon points="6 4 19 12 6 20 6 4" fill="currentColor" />
        </svg>
        <svg className="ic-pause" viewBox="0 0 24 24">
          <rect x="5" y="4" width="4" height="16" rx="1" fill="currentColor" />
          <rect x="15" y="4" width="4" height="16" rx="1" fill="currentColor" />
        </svg>
      </button>

      {/* ===== HERO ===== */}
      <header className="hero" id="hero">
        <img
          className="hero-photo"
          src="/fixdate/img/portada-3.jpg"
          alt="Sol y Lea"
          onError={(e) => {
            document.getElementById('hero')?.classList.add('no-photo');
            e.currentTarget.remove();
          }}
        />
        <div className="hero-inner">
          <p className="eyebrow">nos casamos!!</p>
          <h1 className="names">
            Sol <span className="amp">&amp;</span> Lea
          </h1>
        </div>
        <div className="scroll-ind">
          <span className="hashtag hashtag-date">06 de marzo de 2027</span>
          <span className="hashtag">#06M</span>
          <span className="chev">
            <svg viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
      </header>

      {/* ===== MAIN CONTENT WRAP ===== */}
      <main className="wrap">
        {/* ===== CUENTA REGRESIVA ===== */}
        <section className="section" id="countdown">
          <div className="divider reveal in" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal in">Spoiler: hay barra libre.</p>
          <img
            className="champagne reveal in d1"
            src="/fixdate/img/champagne.webp"
            alt="Torre de copas de champagne"
            width="210"
          />
          <p className="lede reveal in d1">La cuenta regresiva ya empezó.</p>
          <div className="count reveal in d2">
            <div className="cell">
              <span className="num">{timeLeft.days}</span>
              <span className="lbl">Días</span>
            </div>
            <div className="cell">
              <span className="num">{timeLeft.hours}</span>
              <span className="lbl">Horas</span>
            </div>
            <div className="cell">
              <span className="num">{timeLeft.minutes}</span>
              <span className="lbl">Min</span>
            </div>
            <div className="cell">
              <span className="num">{timeLeft.seconds}</span>
              <span className="lbl">Seg</span>
            </div>
          </div>
        </section>

        {/* ===== CEREMONIA Y FIESTA ===== */}
        <section className="section sec-bordo" id="fiesta">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">Primero los anillos. Después el baile.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <ellipse cx="26" cy="39" rx="13" ry="14" />
              <ellipse cx="40" cy="34" rx="11" ry="12" />
              <path d="M40 12.5l1.9 4 4 1.9-4 1.9-1.9 4-1.9-4-4-1.9 4-1.9z" />
            </svg>
          </div>
          <h2 className="title reveal d1">Ceremonia y Fiesta</h2>
          <p className="lede reveal d2">Todo sucede en el mismo lugar.</p>
          <div className="timeline reveal d2">
            <div className="tl-row">
              <span className="tl-time">17:00</span>
              <span className="tl-ev">Llegada de invitados</span>
            </div>
            <div className="tl-row mark">
              <span className="tl-time">17:30</span>
              <span className="tl-ev">
                Ceremonia
                <span className="ti">
                  <svg viewBox="0 0 64 64">
                    <ellipse cx="26" cy="39" rx="13" ry="14" />
                    <ellipse cx="40" cy="34" rx="11" ry="12" />
                    <path d="M40 12.5l1.9 4 4 1.9-4 1.9-1.9 4-1.9-4-4-1.9 4-1.9z" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-time">18:15</span>
              <span className="tl-ev">Recepción</span>
            </div>
            <div className="tl-row">
              <span className="tl-time">20:00</span>
              <span className="tl-ev">Cena</span>
            </div>
            <div className="tl-row mark">
              <span className="tl-time">21:30</span>
              <span className="tl-ev">
                ¡A bailar!
                <span className="ti">
                  <svg viewBox="0 0 64 64">
                    <path d="M32 6v9" />
                    <path d="M28.5 6.5h7" />
                    <circle cx="32" cy="36" r="17" />
                    <path d="M15 36h34" />
                    <path d="M17.5 27.5h29" />
                    <path d="M17.5 44.5h29" />
                    <path d="M32 19v34" />
                    <path d="M23 20.5c-5 8-5 23 0 31" />
                    <path d="M41 20.5c5 8 5 23 0 31" />
                    <path d="M54.5 17l1.3 2.8 2.8 1.3-2.8 1.3-1.3 2.8-1.3-2.8-2.8-1.3 2.8-1.3z" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-time">22:15</span>
              <span className="tl-ev">Brindis &amp; Mesa Dulce</span>
            </div>
            <div className="tl-row">
              <span className="tl-time">01:00</span>
              <span className="tl-ev">Fin de fiesta</span>
            </div>
          </div>
          <p className="place reveal d3">La Celestina</p>
          <p className="place-sub reveal d3">Los Cardales, Provincia de Buenos Aires.</p>
          <a
            className="btn ghost reveal d3"
            href="https://maps.google.com/?q=La+Celestina+Los+Cardales"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            Cómo llegar
          </a>
        </section>

        {/* ===== DRESS CODE ===== */}
        <section className="section" id="dresscode">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">La elegancia también es parte de la fiesta.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <path d="M32 9c2.4 0 3.6 1.6 3.6 3.2 0 2-2.6 2.4-3.6 4" />
              <path d="M32 16.2L15 26.5h34z" />
              <path d="M27 26.5c.4 3.4-1.2 6-3.4 8.2 2.6 1 4.4 3 4.8 6.2" />
              <path d="M37 26.5c-.4 3.4 1.2 6 3.4 8.2-2.6 1-4.4 3-4.8 6.2" />
              <path d="M24.4 34.7C22 41 20 48 19.5 55h25c-.5-7-2.5-14-4.9-20.3" />
            </svg>
          </div>
          <p className="eyebrow reveal d1" style={{ marginBottom: 6 }}>
            Dress Code
          </p>
          <h2 className="title reveal d1">Elegante</h2>
          <p className="body reveal d2" style={{ marginTop: 14 }}>
            Todos impecables, que la ocasión (y las fotos) lo valen.
          </p>
          <div className="dc">
            <div className="dc-item reveal d2">
              <h4>Ellos</h4>
              <p>Traje o pantalón de vestir con camisa.</p>
            </div>
            <div className="dc-item reveal d3">
              <h4>Ellas</h4>
              <p>Vestido largo o midi elegante.</p>
            </div>
          </div>
          <p className="noblanco reveal d3">Prohibido el blanco, obvio!</p>
        </section>

        {/* ===== HOSPEDAJE (Reemplaza a Traslado) ===== */}
        <section className="section sec-bordo" id="hospedaje">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">Para que descanses cerca y disfrutes sin apuro.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <path d="M12 44V22" />
              <path d="M12 36h40v8" />
              <path d="M52 44V30" />
              <path d="M12 28h18c3 0 5 2 5 5v3H12z" />
              <circle cx="21" cy="24" r="3.5" />
              <path d="M8 44h48" />
            </svg>
          </div>
          <h2 className="title reveal d1">Hospedaje</h2>
          <div className="trip">
            <div className="trip-item reveal d2">
              <p className="lg">A 10 minutos de la estancia</p>
              <h3 className="th">Howard Johnson Resort & Spa</h3>
              <p className="ts">
                Habitaciones confortables con desayuno incluido y comodidades ideales para descansar después de la fiesta.
              </p>
              <div style={{ marginTop: 12 }}>
                <a
                  className="btn ghost"
                  style={{ fontSize: '0.74rem', padding: '0.6em 1.2em' }}
                  href="https://wa.me/5491145678901?text=Hola!%20Consulto%20por%20alojamiento%20para%20el%20casamiento%20de%20Sol%20y%20Lea"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
            <div className="trip-item reveal d3">
              <p className="lg">A 12 minutos de la estancia</p>
              <h3 className="th">Cabañas del Pinar</h3>
              <p className="ts">
                Opción serena y rodeada de naturaleza, ideal para grupos familiares o amigos que deseen compartir estancia.
              </p>
              <div style={{ marginTop: 12 }}>
                <a
                  className="btn ghost"
                  style={{ fontSize: '0.74rem', padding: '0.6em 1.2em' }}
                  href="https://wa.me/5491198765432?text=Hola!%20Consulto%20por%20caba%C3%B1as%20para%20el%20casamiento%20de%20Sol%20y%20Lea"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MENÚ ===== */}
        <section className="section" id="menu">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">Queremos que todos disfruten de la mesa.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <circle cx="32" cy="34" r="15" />
              <circle cx="32" cy="34" r="9.5" />
              <path d="M13 13v9M17 13v9M21 13v9" />
              <path d="M13 22h8" />
              <path d="M17 22v29" />
              <path d="M51 13c-3.4 2-4.2 10.5-1.4 15.4h1.4V51" />
            </svg>
          </div>
          <h2 className="title reveal d1">Menú</h2>
          <p className="body reveal d2" style={{ marginTop: 14 }}>
            El servicio cuenta con opciones pensadas para que disfrutes de la mesa.
          </p>
          <p className="body reveal d2" style={{ marginTop: 14 }}>
            Contamos con menú tradicional, vegetariano y celíaco. Recordá informarnos cualquier restricción alimentaria o alergia en el formulario de asistencia.
          </p>
        </section>

        {/* ===== REGALOS ===== */}
        <section className="section sec-bordo" id="regalos">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">Lo único obligatorio es que vengas.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <rect x="14" y="28" width="36" height="23" rx="1.5" />
              <rect x="11" y="21.5" width="42" height="7" rx="1.5" />
              <path d="M32 21.5V51" />
              <path d="M32 21.5c-2.4-4.8-10-4.8-10 .3 0 3 4.6 3.4 10-.3z" />
              <path d="M32 21.5c2.4-4.8 10-4.8 10 .3 0 3-4.6 3.4-10-.3z" />
            </svg>
          </div>
          <h2 className="title reveal d1">Regalos</h2>
          <p className="body reveal d2" style={{ marginTop: 14 }}>
            El mejor regalo es tu presencia. Si deseás hacernos un presente, podés ayudarnos con nuestra luna de miel:
          </p>
          <button
            className="btn reveal d2"
            type="button"
            onClick={() => setShowGiftDetails(!showGiftDetails)}
            style={{ marginTop: 22 }}
          >
            {showGiftDetails ? 'Ocultar datos para regalar' : 'Ver datos para regalar'}
          </button>
          <div className={`gift-card ${showGiftDetails ? '' : 'is-hidden'}`} id="giftCard">
            <div className="gift-row">
              <span className="gk">Alias</span>
              <span className="gv">SOL.Y.LEA.BODA</span>
              <button
                className={`gcopy ${copiedField === 'alias' ? 'done' : ''}`}
                type="button"
                onClick={() => handleCopy('SOL.Y.LEA.BODA', 'alias')}
                aria-label="Copiar alias"
              >
                {copiedField === 'alias' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="gift-row">
              <span className="gk">CBU</span>
              <span className="gv">0070123430004567890123</span>
              <button
                className={`gcopy ${copiedField === 'cbu' ? 'done' : ''}`}
                type="button"
                onClick={() => handleCopy('0070123430004567890123', 'cbu')}
                aria-label="Copiar CBU"
              >
                {copiedField === 'cbu' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="gift-row">
              <span className="gk">Titular</span>
              <span className="gv">Sol &amp; Leandro</span>
            </div>
            <div className="gift-row">
              <span className="gk">Banco</span>
              <span className="gv">Banco Galicia</span>
            </div>
          </div>
        </section>

        {/* ===== GALERÍA ===== */}
        <section className="section gallery" id="galeria">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">Un poco de nosotros.</p>
          <h2 className="title reveal d1" style={{ fontSize: 'clamp(1.9rem,7vw,2.5rem)', marginBottom: 6 }}>
            Galería
          </h2>
          <div className="carousel reveal d2">
            <div className="slide">
              <img src="/fixdate/img/img_1.webp" alt="Sol y Lea" loading="lazy" />
            </div>
            <div className="slide">
              <img src="/fixdate/img/img_4.webp" alt="Sol y Lea" loading="lazy" />
            </div>
            <div className="slide">
              <img src="/fixdate/img/img_5.webp" alt="Sol y Lea" loading="lazy" />
            </div>
            <div className="slide">
              <img src="/fixdate/img/img_6.webp" alt="Sol y Lea" loading="lazy" />
            </div>
            <div className="slide">
              <img src="/fixdate/img/img_7.webp" alt="Sol y Lea" loading="lazy" />
            </div>
            <div className="slide">
              <img src="/fixdate/img/img_8.webp" alt="Sol y Lea" loading="lazy" />
            </div>
          </div>
          <p className="cue reveal d3">Deslizá para ver más</p>
        </section>

        {/* ===== INSTAGRAM ===== */}
        <section className="section" id="instagram">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">Seguinos para enterarte de todo antes y después del gran día.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <rect x="11" y="21" width="42" height="28" rx="6.5" />
              <path d="M24 21l2.8-5h10.4l2.8 5" />
              <circle cx="32" cy="35" r="8.5" />
              <circle cx="32" cy="35" r="3.4" />
              <circle cx="46" cy="27.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <p className="ig-handle reveal d1">@solylea.boda</p>
          <a
            className="btn reveal d2"
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Seguir en Instagram
          </a>
        </section>

        {/* ===== RSVP ===== */}
        <section className="section sec-bordo" id="rsvp">
          <div className="divider reveal" aria-hidden="true">
            <span className="ln" />
            <span className="mo">
              <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4v22" />
                <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
              </svg>
            </span>
            <span className="ln r" />
          </div>
          <p className="micro reveal">Un “sí, voy” nos hace muy felices.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <path d="M32 51C15 40 11 29.5 16.5 22.5c3.8-4.8 11.4-4 15.5 3 4.1-7 11.7-7.8 15.5-3C53 29.5 49 40 32 51z" />
              <path d="M32 31v11" />
              <path d="M32 35c-3-1.2-5.4 0-6.8 2.2" />
              <path d="M32 35c3-1.2 5.4 0 6.8 2.2" />
            </svg>
          </div>
          <h2 className="title reveal d1">Confirmá tu asistencia</h2>
          <p className="rsvp-note reveal d2">
            Invitación reservada para: <strong className="text-white">{displayName}</strong>
            <br />
            ({group.max_guests} {group.max_guests === 1 ? 'pase reservado' : 'pases reservados'})
          </p>

          {rsvpSuccess ? (
            <div className="rsvp-done" id="rsvpDone">
              <div className="icon">
                <svg viewBox="0 0 64 64">
                  <path d="M32 51C15 40 11 29.5 16.5 22.5c3.8-4.8 11.4-4 15.5 3 4.1-7 11.7-7.8 15.5-3C53 29.5 49 40 32 51z" />
                  <path d="M32 31v11" />
                  <path d="M32 35c-3-1.2-5.4 0-6.8 2.2" />
                  <path d="M32 35c3-1.2 5.4 0 6.8 2.2" />
                </svg>
              </div>
              <h3>¡Gracias por confirmar!</h3>
              <p>
                {rsvpAttending === 'attending'
                  ? `Registramos tu confirmación con ${confirmedGuests} ${
                      confirmedGuests === 1 ? 'pase' : 'pases'
                    }. ¡Nos vemos el 06M!`
                  : 'Registramos tu respuesta. ¡Los vamos a extrañar mucho!'}
              </p>
              <button
                type="button"
                className="btn"
                onClick={() => setRsvpSuccess(false)}
                style={{ marginTop: 20 }}
              >
                Modificar respuesta
              </button>
            </div>
          ) : (
            <form className="rsvp-form reveal d2" onSubmit={handleRsvpSubmit}>
              <fieldset className="fld is-required">
                <span className="flabel">¿Asistís a la fiesta?</span>
                <div className="opts">
                  <label className="opt">
                    <input
                      type="radio"
                      name="asistencia"
                      value="attending"
                      checked={rsvpAttending === 'attending'}
                      onChange={() => setRsvpAttending('attending')}
                      required
                    />
                    <span>Sí, confirmo</span>
                  </label>
                  <label className="opt">
                    <input
                      type="radio"
                      name="asistencia"
                      value="declined"
                      checked={rsvpAttending === 'declined'}
                      onChange={() => setRsvpAttending('declined')}
                    />
                    <span>No voy a poder</span>
                  </label>
                </div>
              </fieldset>

              {rsvpAttending === 'attending' && (
                <div id="rsvpDetails">
                  {group.max_guests > 1 && (
                    <fieldset className="fld is-required">
                      <span className="flabel">
                        Cantidad de asistentes (máximo {group.max_guests})
                      </span>
                      <div className="opts">
                        {Array.from({ length: group.max_guests }, (_, i) => i + 1).map((num) => (
                          <label key={num} className="opt">
                            <input
                              type="radio"
                              name="pases"
                              value={num}
                              checked={confirmedGuests === num}
                              onChange={() => setConfirmedGuests(num)}
                            />
                            <span>{num} {num === 1 ? 'pase' : 'pases'}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <fieldset className="fld is-required">
                    <span className="flabel">Menú preferido</span>
                    <div className="opts">
                      {(['Normal', 'Vegetariano', 'Celíaco'] as const).map((m) => (
                        <label key={m} className="opt">
                          <input
                            type="radio"
                            name="menu"
                            value={m}
                            checked={menuChoice === m}
                            onChange={() => setMenuChoice(m)}
                            required
                          />
                          <span>{m}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="fld">
                    <span className="flabel">Alergias o restricciones (opcional)</span>
                    <input
                      type="text"
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      placeholder="Ej: intolerante a la lactosa, sin mariscos..."
                    />
                  </label>
                </div>
              )}

              <label className="fld">
                <span className="flabel">Dejanos un mensajito (opcional)</span>
                <textarea
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  rows={2}
                  placeholder="¡Nos vemos en la pista!"
                />
              </label>

              {rsvpError && (
                <p style={{ margin: 0, textAlign: 'center', color: '#ffb3ba', fontSize: '0.86rem' }}>
                  {rsvpError}
                </p>
              )}

              <button className="btn" type="submit" disabled={rsvpSubmitting}>
                {rsvpSubmitting ? 'Enviando...' : 'Confirmar Asistencia'}
              </button>
            </form>
          )}
        </section>
      </main>

      {/* ===== CIERRE FOOTER ===== */}
      <footer className="section closing" id="cierre">
        <div className="divider reveal" aria-hidden="true">
          <span className="ln" />
          <span className="mo">
            <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4v22" />
              <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
              <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
              <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
              <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
              <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
              <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
              <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
            </svg>
          </span>
          <span className="ln r" />
        </div>
        <p className="micro reveal">Ahora sí... nos vemos el 06M</p>
        <p className="love reveal d2">Con amor</p>
        <img
          className="seal reveal d2"
          src="/monogram-clean.png"
          alt="Sol &amp; Lea"
          style={{ width: 130, height: 130, objectFit: 'contain' }}
        />
      </footer>
    </div>
  );
};
