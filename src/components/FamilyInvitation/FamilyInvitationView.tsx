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
    const targetDate = new Date('2027-03-06T17:00:00').getTime();

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
  const [menuChoice, setMenuChoice] = useState<'Tradicional' | 'Vegetariano' | 'Celíaco'>('Tradicional');
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
        <div className="w-10 h-10 border-2 border-[#b4717a] border-t-transparent rounded-full animate-spin mb-4" />
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
        <svg className="ic-play spin-ring" viewBox="0 0 24 24">
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
          <p className="cue reveal in d3" style={{ marginTop: 24 }}>
            <a href="#rsvp" style={{ color: 'inherit', textDecoration: 'none' }}>
              No olvides confirmar tu presencia al final.
            </a>
          </p>
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
          <p className="micro reveal">Primero los anillos. Después la fiesta.</p>
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
            <div className="tl-row mark">
              <span className="tl-time">17:00</span>
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
              <span className="tl-time">18:00</span>
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
              <span className="tl-time">01:00</span>
              <span className="tl-ev">Fin de fiesta</span>
            </div>
          </div>
          <p className="place reveal d3">La Celestina</p>
          <p className="place-sub reveal d3">Los Cardales, Provincia de Buenos Aires.</p>
          <a
            className="btn ghost reveal d3"
            href="https://maps.app.goo.gl/ZrZzyJwvj4Go4gZZ7"
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
              <p>Traje, o pantalón de vestir con camisa. Corbata o moño suman puntos.</p>
              <p style={{ marginTop: 8, fontSize: '0.86rem', color: '#8f303b', fontWeight: 600 }}>
                Evitá estos colores:
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#53111B' }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#9E9E9E',
                      border: '1px solid rgba(83,17,27,0.25)',
                      display: 'inline-block',
                    }}
                    aria-hidden="true"
                  />
                  <span>Gris</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#53111B' }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#E5D9C5',
                      border: '1px solid rgba(83,17,27,0.25)',
                      display: 'inline-block',
                    }}
                    aria-hidden="true"
                  />
                  <span>Beige</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#53111B' }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#A67B56',
                      border: '1px solid rgba(83,17,27,0.25)',
                      display: 'inline-block',
                    }}
                    aria-hidden="true"
                  />
                  <span>Marrón claro</span>
                </div>
              </div>
            </div>
            <div className="dc-item reveal d3">
              <h4>Ellas</h4>
              <p>
                Vestido, mono o conjunto elegante, del largo en que te sientas cómoda. Calzado cómodo para caminar por el pasto en la ceremonia y bailar después en la fiesta.
              </p>
            </div>
          </div>
          <p className="noblanco reveal d3">Prohibido el blanco</p>
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
              <p className="lg">A 20 MINUTOS DE LA CELESTINA</p>
              <h3 className="th">Ibis Pilar</h3>
              <p className="ts" style={{ marginTop: 6 }}>
                Al escribir o comunicarte para reservar, indicá que es por el casamiento de Sol y Leandro (noche del 6 de marzo).
              </p>
              <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                <a
                  className="btn ghost"
                  style={{ fontSize: '0.74rem', padding: '0.6em 1.2em', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  href="https://wa.me/5491136181016?text=Hola!%20Consulto%20por%20reserva%20para%20la%20noche%20del%206/3%20por%20el%20casamiento%20de%20Sol%20y%20Leandro"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  className="btn ghost"
                  style={{ fontSize: '0.74rem', padding: '0.6em 1.2em', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  href="https://all.accor.com/hotel/8646/index.es.shtml?utm_campaign=seo+maps&utm_medium=seo+maps&utm_source=google+Maps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Sitio Web
                </a>
              </div>
            </div>
            <div className="trip-item reveal d3">
              <p className="lg">A 22 MINUTOS DE LA CELESTINA</p>
              <h3 className="th">Viva Suites Pilar</h3>
              <p className="ts" style={{ marginTop: 6 }}>
                Al reservar desde su web, ingresá el código: <strong>XXXXXX</strong>.
              </p>
              <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                <a
                  className="btn ghost"
                  style={{ fontSize: '0.74rem', padding: '0.6em 1.2em', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  href="https://wa.me/5491165475354?text=Hola!%20Consulto%20por%20reserva%20para%20la%20noche%20del%206/3%20por%20el%20casamiento%20de%20Sol%20y%20Leandro"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  className="btn ghost"
                  style={{ fontSize: '0.74rem', padding: '0.6em 1.2em', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  href="https://www.casacampuspilar.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Sitio Web
                </a>
              </div>
            </div>
          </div>
          <p className="body reveal d3" style={{ marginTop: 28, color: '#D7AEA6', fontSize: '0.9rem' }}>
            También podés buscar otras alternativas en la zona: tanto en Pilar como en Los Cardales hay gran variedad de cabañas, quintas y opciones de alojamiento.
          </p>
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
          <p className="micro reveal">Queremos que todos disfruten de la cena.</p>
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
            El menú principal cuenta con platos a base de carne. Si contás con alguna preferencia o necesidad especial, disponemos de alternativas vegetarianas y celíacas.
          </p>
          <p className="body reveal d2" style={{ marginTop: 14 }}>
            Por favor avisanos de cualquier restricción alimentaria o alergia en el formulario de confirmación.
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

        {/* ===== MÚSICA ===== */}
        <section className="section" id="musica">
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
          <p className="micro reveal">Que no falte tu tema favorito.</p>
          <div className="icon reveal d1">
            <svg viewBox="0 0 64 64">
              <circle cx="22" cy="44" r="8" />
              <circle cx="46" cy="38" r="8" />
              <path d="M30 44V16l24-6v28" />
              <path d="M30 26l24-6" />
            </svg>
          </div>
          <h2 className="title reveal d1">Música</h2>
          <p className="body reveal d2" style={{ marginTop: 14 }}>
            ¡Ayudanos a armar la playlist de la fiesta! Sugerí esa canción que te hace bailar sí o sí y no puede faltar en la pista.
          </p>
          <a
            className="btn reveal d3"
            href="https://open.spotify.com/playlist/365aITY3rFsPpXZr4QS6c4?si=182654ff8f214fa6&pt=5f3e830f5de11f1fbdf8c5f4d9687c86"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Sugerir tema en Spotify
          </a>
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
          <p className="lede reveal d2" style={{ marginTop: 10 }}>
            Por favor confirmá antes del 6 de diciembre.
          </p>
          <p className="rsvp-note reveal d2" style={{ marginTop: 14 }}>
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
              <h3>Gracias por confirmar</h3>
              <p>
                {rsvpAttending === 'attending'
                  ? `Registramos tu confirmación con ${confirmedGuests} ${
                      confirmedGuests === 1 ? 'pase' : 'pases'
                    }.`
                  : 'Registramos tu respuesta. Los vamos a extrañar mucho.'}
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
                      {(['Tradicional', 'Vegetariano', 'Celíaco'] as const).map((m) => (
                        <label key={m} className="opt">
                          <input
                            type="radio"
                            name="menu"
                            value={m}
                            checked={menuChoice === m}
                            onChange={() => setMenuChoice(m)}
                            required
                          />
                          <span>{m === 'Tradicional' ? 'Tradicional (con carne)' : m}</span>
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
                  placeholder="Nos vemos en la pista..."
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
        <p className="micro reveal">Ahora sí, nos vemos el 6 de marzo!</p>
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
