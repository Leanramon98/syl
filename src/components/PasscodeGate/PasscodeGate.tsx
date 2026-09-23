import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { invitationConfig } from '../../config/invitation';

export interface PasscodeGateProps {
  /** Callback fired when correct passcode is entered */
  onUnlock: () => void;
  /** Link navigation callback to go to /save-the-date */
  onNavigateToSaveTheDate: () => void;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({
  onUnlock,
  onNavigateToSaveTheDate,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expectedPasscode = (invitationConfig as any).formalInvitation?.passcode || 'solylea';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsSubmitting(true);
    setError(false);

    // Normalize comparison (case-insensitive, trimmed)
    const isValid = passcode.trim().toLowerCase() === expectedPasscode.trim().toLowerCase();

    setTimeout(() => {
      setIsSubmitting(false);
      if (isValid) {
        onUnlock();
      } else {
        setError(true);
      }
    }, 250);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-5 select-none paper-texture">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center px-4 sm:px-6 py-8 sm:py-10 rounded-3xl bg-white/70 border border-[#E6DCCE]/90 shadow-[0_12px_36px_-6px_rgba(62,41,34,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md"
      >
        {/* Monogram Logo */}
        <div className="flex flex-col items-center mb-5">
          <img
            src="/monogram-clean.png"
            alt="Sol & Lea"
            className="w-16 h-auto sm:w-20 object-contain drop-shadow-xs"
          />
          <div className="flex items-center gap-1.5 mt-2">
            <span className="font-serif text-xl sm:text-2xl text-[#2C1D18]">Sol</span>
            <span className="font-script text-xl sm:text-2xl text-[#b4717a] -translate-y-0.5">&</span>
            <span className="font-serif text-xl sm:text-2xl text-[#2C1D18]">Lea</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9aa289]/15 border border-[#9aa289]/30 text-[#606a52] text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.2em] uppercase mb-2.5">
            <Lock className="w-3 h-3 text-[#788466]" />
            <span>Invitación Formal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-[1.7rem] text-[#2C1D18] font-light leading-snug">
            Acceso Privado
          </h1>
          <p className="font-sans text-xs sm:text-[13px] text-[#6E4138] mt-1.5 max-w-[260px] mx-auto leading-relaxed">
            Ingresá la clave para acceder a la invitación formal.
          </p>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3.5">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8D6E63]/70">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Ingresá la clave..."
              autoFocus
              className={`w-full pl-10 pr-4 py-3 rounded-full bg-white/90 text-[#2C1D18] text-sm font-sans placeholder:text-[#A89885] border ${
                error
                  ? 'border-red-400 focus:ring-2 focus:ring-red-300'
                  : 'border-[#D5C7B7] focus:border-[#9aa289] focus:ring-2 focus:ring-[#9aa289]/30'
              } transition-all duration-200 outline-none shadow-inner`}
            />
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-red-600 font-sans"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Clave incorrecta. Intentá nuevamente.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !passcode.trim()}
            className="w-full py-3 sm:py-3.5 rounded-full bg-[#9aa289] hover:bg-[#8d957d] active:bg-[#838b73] disabled:opacity-50 text-white font-sans text-xs tracking-[0.22em] uppercase font-medium shadow-[0_4px_14px_rgba(154,162,137,0.35)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 focus:outline-none"
          >
            <span>{isSubmitting ? 'Verificando...' : 'Ingresar'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </form>

        {/* Link to Save the Date */}
        <div className="mt-7 pt-5 border-t border-[#E6DCCE]/70 w-full flex flex-col items-center">
          <button
            type="button"
            onClick={onNavigateToSaveTheDate}
            className="inline-flex items-center gap-1.5 text-xs text-[#8D6E63] hover:text-[#b4717a] transition-colors font-sans tracking-wider uppercase font-medium cursor-pointer"
          >
            <span>Ver Save the Date</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PasscodeGate;
