import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Copy,
  Check,
  Share2,
  Trash2,
  Edit3,
  LogOut,
  Utensils,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { GuestGroup, SummaryMetrics } from '../../types/wedding';
import {
  fetchAdminGroups,
  fetchAdminSummary,
  createAdminGroup,
  updateAdminGroup,
  deleteAdminGroup,
  clearAdminToken,
} from '../../lib/api';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [groups, setGroups] = useState<GuestGroup[]>([]);
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GuestGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    max_guests: 2,
    custom_token: '',
    notes: '',
    guest_names: ['', ''] as string[],
    rsvp_status: 'pending' as 'pending' | 'attending' | 'declined',
    confirmed_count: 1,
    dietary_requirements: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Feedback copied state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [groupsData, summaryData] = await Promise.all([
        fetchAdminGroups(),
        fetchAdminSummary(),
      ]);
      setGroups(groupsData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMaxGuestsChange = (val: number) => {
    const newMax = Math.max(1, Math.min(20, val || 1));
    const currentNames = [...formData.guest_names];
    const adjustedNames = Array.from({ length: newMax }, (_, i) => currentNames[i] || '');
    setFormData((prev) => ({
      ...prev,
      max_guests: newMax,
      confirmed_count: Math.min(newMax, Math.max(1, prev.confirmed_count || 1)),
      guest_names: adjustedNames,
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      max_guests: 2,
      custom_token: '',
      notes: '',
      guest_names: ['', ''],
      rsvp_status: 'pending',
      confirmed_count: 2,
      dietary_requirements: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (group: GuestGroup) => {
    setEditingGroup(group);
    const existingNames = group.guest_names || [];
    const padded = Array.from({ length: group.max_guests }, (_, i) => existingNames[i] || '');
    setFormData({
      name: group.name,
      max_guests: group.max_guests,
      custom_token: group.token,
      notes: group.notes || '',
      guest_names: padded,
      rsvp_status: group.rsvp_status || 'pending',
      confirmed_count: group.confirmed_count > 0 ? group.confirmed_count : group.max_guests,
      dietary_requirements: group.dietary_requirements || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuestNames = formData.guest_names.map((n) => n.trim()).filter(Boolean);
    const resolvedName = formData.name.trim() || cleanGuestNames.join(' y ') || 'Invitación';

    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingGroup) {
        const updated = await updateAdminGroup(editingGroup.id, {
          name: resolvedName,
          max_guests: formData.max_guests,
          custom_token: formData.custom_token,
          notes: formData.notes,
          guest_names: cleanGuestNames,
          rsvp_status: formData.rsvp_status,
          confirmed_count:
            formData.rsvp_status === 'attending'
              ? Math.min(formData.max_guests, Math.max(1, formData.confirmed_count || 1))
              : 0,
          dietary_requirements: formData.dietary_requirements,
        });
        setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const created = await createAdminGroup({
          name: resolvedName,
          max_guests: formData.max_guests,
          custom_token: formData.custom_token,
          notes: formData.notes,
          guest_names: cleanGuestNames,
        });
        setGroups((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${name}"?`)) {
      return;
    }

    try {
      await deleteAdminGroup(id);
      await loadData(true);
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar');
    }
  };

  const getFullInvitationUrl = (token: string) => {
    const origin = window.location.origin;
    return `${origin}/invitacion/${token}`;
  };

  const handleCopyLink = async (token: string) => {
    const url = getFullInvitationUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    } catch (err) {
      prompt('Copia este enlace:', url);
    }
  };

  const handleShareWhatsApp = (group: GuestGroup) => {
    const url = getFullInvitationUrl(group.token);
    const message = `¡Hola ${group.name}! ✨ Sol y Lea los invitamos a nuestro casamiento.\n\nLes dejamos acá su enlace personalizado para ver la invitación y confirmar asistencia:\n${url}\n\n¡Esperamos que puedan venir a celebrar con nosotros! ❤️`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.confirmed_name && g.confirmed_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.dietary_requirements && g.dietary_requirements.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'confirmed') return g.rsvp_status === 'attending';
      if (statusFilter === 'declined') return g.rsvp_status === 'declined';
      if (statusFilter === 'pending') return g.rsvp_status === 'pending';

      return true;
    });
  }, [groups, searchTerm, statusFilter]);

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAF8F5] text-[#2C2A29] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#EFE9DE] shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/monogram-clean.png"
            alt="Sol & Lea"
            className="w-9 h-9 object-contain"
          />
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#2C2A29]">
              Sol & Lea
            </h1>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#A87B2E] font-medium">
              Administración de Invitaciones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Actualizar datos"
            className="p-2 rounded-lg text-[#5C544E] hover:text-[#2C2A29] hover:bg-[#F3E5C8]/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#A87B2E]' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2C2A29] hover:bg-[#1B1A19] text-[#FAF8F5] text-xs font-sans font-medium uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF67]" />
            <span className="hidden sm:inline">Nueva Familia</span>
          </button>

          <button
            onClick={() => {
              clearAdminToken();
              onLogout();
            }}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-[#8C847E] hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
            {error}
          </div>
        )}

        {/* Metric Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Passes */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE9DE] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#8C847E] mb-2">
                <span className="text-xs font-sans uppercase tracking-wider font-medium">Pases Asignados</span>
                <Users className="w-4 h-4 text-[#A87B2E]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29]">
                  {summary.total_allowed_passes}
                </span>
                <span className="text-xs text-[#8C847E]">
                  ({summary.total_groups} familias)
                </span>
              </div>
            </div>

            {/* Confirmed Persons */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-sans uppercase tracking-wider font-medium">Confirmados</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
                  {summary.attending_count}
                </span>
                <span className="text-xs text-emerald-600">
                  {summary.total_allowed_passes > 0
                    ? `${Math.round((summary.attending_count / summary.total_allowed_passes) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Pending Passes */}
            <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-sans uppercase tracking-wider font-medium">Pendientes</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-700">
                  {summary.pending_passes}
                </span>
                <span className="text-xs text-amber-600 font-sans">
                  ({summary.pending_count} fam.)
                </span>
              </div>
            </div>

            {/* Declined Groups */}
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-sans uppercase tracking-wider font-medium">No Asisten</span>
                <UserX className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-rose-700">
                  {summary.declined_count}
                </span>
                <span className="text-xs text-rose-600 font-sans">
                  familias
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dietary breakdown pill strip */}
        {summary && summary.dietary_list && summary.dietary_list.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[#A87B2E]">
              <Utensils className="w-3.5 h-3.5" />
              <span>Restricciones alimentarias reportadas ({summary.dietary_list.length}):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {summary.dietary_list.map((item, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-200/70">
                  <strong className="text-[#2C2A29]">{item.family}:</strong>{' '}
                  <span className="text-[#5C544E]">{item.diet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#EFE9DE] shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C847E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, dieta o enlace..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EFE9DE] bg-[#FAF8F5] text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#A87B2E]/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'confirmed', label: 'Confirmados' },
                { id: 'pending', label: 'Pendientes' },
                { id: 'declined', label: 'No asisten' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === filter.id
                    ? 'bg-[#2C2A29] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#5C544E] hover:bg-[#EFE9DE]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="py-16 text-center text-[#8C847E] flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#A87B2E]" />
            <span className="text-sm font-sans">Cargando familias...</span>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#D4AF67]/40 p-8">
            <Users className="w-10 h-10 text-[#D4AF67] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-semibold text-[#2C2A29] mb-1">
              No hay familias encontradas
            </h3>
            <p className="font-sans text-xs text-[#8C847E] max-w-sm mx-auto mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Ninguna familia coincide con los filtros aplicados.'
                : 'Empezá creando la primera familia para generar su enlace personalizado.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C2A29] text-white text-xs font-sans font-medium uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF67]" />
              <span>Crear Familia</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => {
              const isCopied = copiedToken === group.token;
              const isAttending = group.rsvp_status === 'attending';
              const isDeclined = group.rsvp_status === 'declined';

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-[#EFE9DE] shadow-xs hover:border-[#D4AF67]/50 transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2A29]">
                        {group.name}
                      </h3>

                      {/* Status Badge */}
                      {isAttending ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-sans font-semibold">
                          Confirmado: {group.confirmed_count} {group.confirmed_count === 1 ? 'persona' : 'personas'}
                        </span>
                      ) : isDeclined ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-sans font-semibold">
                          No asiste
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-sans font-semibold">
                          Pendiente
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C847E] border border-[#EFE9DE] text-xs font-sans font-medium">
                        Cupo: {group.max_guests} {group.max_guests === 1 ? 'pase' : 'pases'}
                      </span>
                    </div>

                    {group.guest_names && group.guest_names.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-1.5">
                        {group.guest_names.map((n, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#EFE9DE] text-[11px] text-[#5C544E]"
                          >
                            Pase #{i + 1}: <strong className="text-[#2C2A29]">{n}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-[#5C544E]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#A87B2E] bg-amber-50/50 px-2 py-0.5 rounded">
                          /invitacion/{group.token}
                        </span>
                        {group.notes && (
                          <span className="italic text-[#8C847E]">Nota: {group.notes}</span>
                        )}
                      </div>

                      {group.dietary_requirements && (
                        <div className="text-[#A87B2E] font-medium flex items-center gap-1 pt-0.5">
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Dieta: {group.dietary_requirements}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* WhatsApp Button */}
                    <button
                      onClick={() => handleShareWhatsApp(group)}
                      title="Enviar por WhatsApp"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-medium transition-all shadow-xs cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(group.token)}
                      title="Copiar enlace"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-sans font-medium transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-[#EFE9DE] hover:border-[#D4AF67] text-[#2C2A29]'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#A87B2E]" />}
                      <span>{isCopied ? '¡Copiado!' : 'Copiar Link'}</span>
                    </button>

                    {/* View Link in New Tab */}
                    <a
                      href={getFullInvitationUrl(group.token)}
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir como invitado"
                      className="p-1.5 rounded-xl border border-[#EFE9DE] text-[#8C847E] hover:text-[#2C2A29] hover:bg-[#FAF8F5] transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(group)}
                      title="Editar"
                      className="p-1.5 rounded-xl border border-[#EFE9DE] text-[#8C847E] hover:text-[#2C2A29] hover:bg-[#FAF8F5] transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      title="Eliminar"
                      className="p-1.5 rounded-xl border border-[#EFE9DE] text-[#8C847E] hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal: Create / Edit Group */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE9DE] max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7">
            <h2 className="font-serif text-2xl font-bold text-[#2C2A29] mb-1">
              {editingGroup ? 'Editar Familia / Invitación' : 'Nueva Familia / Invitación'}
            </h2>
            <p className="font-sans text-xs text-[#8C847E] mb-5">
              Definí el nombre que verá la familia y el máximo de pases disponibles.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#2C2A29] mb-1">
                    Cantidad de pases *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.max_guests}
                    onChange={(e) => handleMaxGuestsChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DE] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#A87B2E]/40"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#2C2A29] mb-1">
                    Token / Enlace personalizado
                  </label>
                  <input
                    type="text"
                    value={formData.custom_token}
                    onChange={(e) => setFormData({ ...formData, custom_token: e.target.value })}
                    placeholder="Opcional: rita-y-colman"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DE] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#A87B2E]/40"
                  />
                </div>
              </div>

              {/* Nombres según los pases asignados */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFE9DE] space-y-2.5">
                <label className="block font-semibold text-[#2C2A29]">
                  Nombres según los {formData.max_guests} {formData.max_guests === 1 ? 'pase asignado' : 'pases asignados'}:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {Array.from({ length: formData.max_guests }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-[11px] font-mono text-[#8C847E]">
                        Pase #{idx + 1}:
                      </span>
                      <input
                        type="text"
                        value={formData.guest_names[idx] || ''}
                        onChange={(e) => {
                          const updated = [...formData.guest_names];
                          updated[idx] = e.target.value;
                          const filtered = updated.map((n) => n.trim()).filter(Boolean);
                          setFormData({
                            ...formData,
                            guest_names: updated,
                            // If name is not manually customized yet, suggest the joined names
                            name: formData.name ? formData.name : filtered.join(', '),
                          });
                        }}
                        placeholder={idx === 0 ? 'Nombre titular (ej: Rita Lynch)' : `Nombre acompañante ${idx}`}
                        className="flex-1 px-3 py-2 rounded-xl border border-[#DCD5C7] bg-white text-xs text-[#2C2A29] focus:outline-none focus:ring-1 focus:ring-[#855F1E]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#2C2A29] mb-1">
                  Título visible de la invitación
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Lynch, Rita y Colman"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DE] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#A87B2E]/40"
                />
                <p className="text-[11px] text-[#8C847E] mt-1 font-light">
                  Si lo dejás vacío se arma automáticamente con los nombres de los pases.
                </p>
              </div>

              {editingGroup && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFE9DE] space-y-3">
                  <label className="block font-semibold text-[#2C2A29]">
                    Estado de Asistencia (RSVP)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: 'pending', label: 'Pendiente', active: 'bg-amber-600 text-white border-amber-600' },
                        { value: 'attending', label: 'Asiste', active: 'bg-emerald-700 text-white border-emerald-700' },
                        { value: 'declined', label: 'No asiste', active: 'bg-red-700 text-white border-red-700' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            rsvp_status: opt.value,
                            confirmed_count:
                              opt.value === 'attending'
                                ? prev.confirmed_count > 0
                                  ? Math.min(prev.max_guests, prev.confirmed_count)
                                  : prev.max_guests
                                : 0,
                          }))
                        }
                        className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          formData.rsvp_status === opt.value
                            ? opt.active
                            : 'bg-white text-[#5C544E] border-[#DCD5C7] hover:bg-[#F3EFE8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {formData.rsvp_status === 'attending' && (
                    <div>
                      <label className="block font-medium text-[#2C2A29] mb-1">
                        Pases confirmados (máx. {formData.max_guests})
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={formData.max_guests}
                        value={formData.confirmed_count}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmed_count: Math.min(
                              formData.max_guests,
                              Math.max(1, Number(e.target.value) || 1)
                            ),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#DCD5C7] bg-white text-xs text-[#2C2A29] focus:outline-none focus:ring-1 focus:ring-[#855F1E]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-[#2C2A29] mb-1">
                      Menú / Restricciones / Mensaje
                    </label>
                    <input
                      type="text"
                      value={formData.dietary_requirements}
                      onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
                      placeholder="Ej: Menú: 2 Tradicional, 1 Vegetariano"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCD5C7] bg-white text-xs text-[#2C2A29] focus:outline-none focus:ring-1 focus:ring-[#855F1E]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#2C2A29] mb-1">
                  Notas internas
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Familia de la novia, vienen del interior..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DE] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#A87B2E]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#EFE9DE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE9DE] text-[#5C544E] hover:bg-[#FAF8F5] font-medium transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2C2A29] hover:bg-[#1B1A19] text-white font-medium uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Guardando...' : editingGroup ? 'Guardar Cambios' : 'Crear Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
