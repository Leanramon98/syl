import React, { useState } from 'react';
import { Check, Minus, Plus, AlertCircle, Heart, X } from 'lucide-react';
import type { GuestGroup } from '../../types/wedding';
import { submitRsvp } from '../../lib/api';

interface FamilyRsvpFormProps {
  group: GuestGroup;
  onSubmitted: (updatedGroup: GuestGroup) => void;
  onClose?: () => void;
}

export const FamilyRsvpForm: React.FC<FamilyRsvpFormProps> = ({ group, onSubmitted, onClose }) => {
  const displayName = group.name;

  const [isAttending, setIsAttending] = useState<boolean>(
    group.rsvp_status === 'declined' ? false : true
  );
  const [confirmedCount, setConfirmedCount] = useState<number>(
    group.confirmed_count > 0 ? group.confirmed_count : Math.min(group.max_guests, 1)
  );
  const [dietaryRequirements, setDietaryRequirements] = useState<string>(
    group.dietary_requirements || ''
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDecrement = () => {
    if (confirmedCount > 1) {
      setConfirmedCount(confirmedCount - 1);
    }
  };

  const handleIncrement = () => {
    if (confirmedCount < group.max_guests) {
      setConfirmedCount(confirmedCount + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await submitRsvp({
        token: group.token,
        name: group.name,
        rsvp_status: isAttending ? 'attending' : 'declined',
        confirmed_count: isAttending ? confirmedCount : 0,
        dietary_requirements: isAttending ? dietaryRequirements : '',
      });

      setSuccessMessage(
        isAttending
          ? `¡Gracias por confirmar! Te esperamos con ${confirmedCount} ${confirmedCount === 1 ? 'pase' : 'pases'}.`
          : '¡Gracias por avisarnos! Lamentamos mucho que no puedas venir.'
      );

      if (res.group) {
        onSubmitted(res.group);
      }
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al enviar tu respuesta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-[#FCFBF8] rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xl text-[#2C2A29]">
      {/* Close button if modal */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#736B63] hover:text-[#2C2A29] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Title & Subtitle */}
      <div className="text-center mb-6">
        <span className="font-['Rubik',sans-serif] text-[11px] uppercase tracking-widest text-[#9aa289] font-semibold block mb-1">
          ¿Asistís a la fiesta?
        </span>
        <h2 className="font-['Raleway',sans-serif] text-2xl sm:text-3xl font-semibold text-[#732a2d] tracking-wide uppercase my-1">
          {displayName}
        </h2>
        <p className="font-['Rubik',sans-serif] text-xs sm:text-sm text-[#73494c] font-light">
          Contanos si vas a venir así organizamos todo.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-sans">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-sans text-center flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-0.5">
            <Heart className="w-4 h-4 fill-emerald-600" />
          </div>
          <strong className="font-serif text-base">{successMessage}</strong>
          <p className="text-[#5C544E]">
            Podés modificar tu respuesta en cualquier momento con este mismo enlace.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Field 1: ¿Vas a venir? */}
        <div>
          <label className="block font-['Rubik',sans-serif] font-medium text-base text-[#393734] mb-2.5">
            ¿Vas a venir?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsAttending(true)}
              className={`py-3.5 px-4 rounded-full text-xs font-['Rubik',sans-serif] font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                isAttending
                  ? 'bg-[#732a2d] text-white shadow-md border border-[#5c2124]'
                  : 'bg-white text-[#73494c] border border-[#d4c1bd] hover:border-[#732a2d]'
              }`}
            >
              SÍ, VOY
            </button>

            <button
              type="button"
              onClick={() => setIsAttending(false)}
              className={`py-3.5 px-4 rounded-full text-xs font-['Rubik',sans-serif] font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                !isAttending
                  ? 'bg-[#73494c] text-white shadow-md border border-[#5a2123]'
                  : 'bg-white text-[#73494c] border border-[#d4c1bd] hover:border-[#73494c]'
              }`}
            >
              NO PUEDO
            </button>
          </div>
        </div>

        {/* Fields for Attending: Companion Counter & Dietary */}
        {isAttending ? (
          <>
            {/* Pases asignados */}
            <div className="space-y-3 pt-1">
              {/* Banner destacado con los nombres de los pases en chips limpios */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#d4c1bd] shadow-2xs text-center">
                <span className="font-['Rubik',sans-serif] text-[11px] sm:text-xs uppercase tracking-widest text-[#9aa289] font-semibold block">
                  Tenemos pase para:
                </span>
                
                <div className="flex flex-wrap items-center justify-center gap-2 my-2.5">
                  {(group.guest_names && group.guest_names.length > 0 ? group.guest_names : [group.name]).map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3.5 py-1.5 rounded-lg bg-white border border-[#9aa289]/40 text-[#393734] font-['Rubik',sans-serif] text-sm sm:text-base font-medium shadow-2xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>

                <p className="font-['Rubik',sans-serif] text-xs text-[#73494c] font-light">
                  {group.max_guests} {group.max_guests === 1 ? 'lugar reservado en total' : 'lugares reservados en total'}.
                </p>
              </div>

              {/* Selector de cantidad */}
              <div className="pt-2">
                <span className="block font-['Rubik',sans-serif] text-xs font-medium text-[#73494c] mb-2 uppercase tracking-wider">
                  Indicá cuántos van a asistir:
                </span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={confirmedCount <= 1}
                    className="w-12 h-12 rounded-full border border-[#d4c1bd] bg-white hover:bg-[#FAF8F5] active:bg-[#f0ece6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#393734] transition-all cursor-pointer shadow-2xs text-lg"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="w-14 text-center font-['Rubik',sans-serif] text-3xl sm:text-4xl font-semibold text-[#732a2d]">
                    {confirmedCount}
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={confirmedCount >= group.max_guests}
                    className="w-12 h-12 rounded-full border border-[#d4c1bd] bg-white hover:bg-[#FAF8F5] active:bg-[#f0ece6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#393734] transition-all cursor-pointer shadow-2xs text-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <span className="font-['Rubik',sans-serif] text-sm text-[#73494c] font-medium ml-1">
                    {confirmedCount === 1 ? 'persona confirmada' : 'personas confirmadas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Field 4: Restricción alimentaria */}
            <div>
              <label className="block font-['Rubik',sans-serif] font-medium text-base text-[#393734] mb-1.5">
                Restricción alimentaria
              </label>
              <textarea
                rows={3}
                value={dietaryRequirements}
                onChange={(e) => setDietaryRequirements(e.target.value)}
                placeholder="Ej: vegetariano, sin gluten, sin lactosa..."
                className="w-full px-4 py-3 rounded-2xl border border-[#d4c1bd] bg-white text-xs font-['Rubik',sans-serif] text-[#393734] focus:outline-none focus:ring-2 focus:ring-[#732a2d]/30 focus:border-[#732a2d] transition-all shadow-2xs"
              />
              <p className="font-['Rubik',sans-serif] text-[11px] text-[#73494c] mt-1.5 font-light">
                Si no tenés restricciones, podés dejar este campo vacío.
              </p>
            </div>
          </>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#d4c1bd] text-xs font-['Rubik',sans-serif] text-[#73494c] italic">
            Registraremos que no van a poder asistir. ¡Gracias por avisar!
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-full bg-[#732a2d] hover:bg-[#b4717a] text-white text-xs font-['Rubik',sans-serif] font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>ENVIANDO...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>ENVIAR RESPUESTA</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
