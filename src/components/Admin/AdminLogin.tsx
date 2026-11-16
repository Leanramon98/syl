import React, { useState } from 'react';
import { Lock, ArrowRight, Sparkles, Shield } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, isLoading, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    await onLogin(password);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-[#F7F5EF] text-[#2C2A29]">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#D4AF67]/30 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF6EA] border border-[#D4AF67]/40 flex items-center justify-center mb-6 shadow-xs">
          <Shield className="w-8 h-8 text-[#A87B2E]" />
        </div>

        <h1 className="font-serif text-3xl font-semibold text-[#2C2A29] mb-2 tracking-wide">
          Sol & Lea
        </h1>
        <p className="font-sans text-xs uppercase tracking-widest text-[#A87B2E] mb-6 font-medium">
          Panel de Administración
        </p>

        <p className="font-sans text-sm text-[#5C544E] mb-6 leading-relaxed">
          Ingresá la clave de administrador para gestionar las familias invitadas y las confirmaciones.
        </p>

        {error && (
          <div className="w-full p-3 mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-sans text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clave de administrador..."
              autoFocus
              className="w-full px-4 py-3 pl-11 rounded-xl border border-[#D4AF67]/40 bg-[#FAF8F5] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#A87B2E]/40 focus:border-[#A87B2E] transition-all"
            />
            <Lock className="w-4 h-4 text-[#A87B2E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2C2A29] hover:bg-[#1B1A19] text-[#FAF8F5] text-xs font-sans uppercase tracking-widest font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Accediendo...</span>
            ) : (
              <>
                <span>Ingresar al panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#EFE9DE] w-full flex items-center justify-center gap-2 text-xs text-[#8C847E]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF67]" />
          <span>Gestión de invitaciones familiares</span>
        </div>
      </div>
    </div>
  );
};
