import React, { useState, useEffect, FormEvent } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySettingsSchema, CompanyFormData } from '../utils/validation';
import { Input, TextArea, Button, Card, InfoPopover } from '../components/common/UIComponents';
import { apiClient } from '../services/apiClient';
import { UserProfile } from '../types';
import {
  Building, Save, CheckCircle2, XCircle, Globe, Mail, Phone,
  MapPin, FileText, Image as ImageIcon, X, UserPlus, Users,
  Settings, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';

export const CompanySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { company, updateCompany } = useCompany();
  
  // -- STAFF STATE --
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  
  // -- ACCORDION STATE --
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // -- TOAST & MODALS --
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success' | 'error' | 'cancel' }>({
    show: false, message: '', type: 'success',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean; action: 'SAVE_COMPANY' | 'DELETE_STAFF'; data?: any;
  }>({ show: false, action: 'SAVE_COMPANY' });

  // -- NEW TECH FORM --
  const [newTechData, setNewTechData] = useState({ email: '', password: '', isLead: false });
  const [addingTech, setAddingTech] = useState(false);

  // -- COMPANY FORM --
  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: company?.name || '',
      logo_url: company?.logo_url || '',
      address: company?.address || '',
      phone: company?.phone || '',
      email: company?.email || '',
      website: company?.website || '',
      legal_notice: company?.legal_notice || '',
    },
  });
  const logoUrl = watch('logo_url');

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        logo_url: company.logo_url || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        legal_notice: company.legal_notice || '',
      });
    }
  }, [company, reset]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await apiClient.get<UserProfile[]>('/api/staff');
      setStaff(data);
    } catch (err: any) {
      showToast('Error cargando personal: ' + err.message, 'error');
    } finally {
      setLoadingStaff(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'cancel') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  // --- HANDLERS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setValue('logo_url', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onAddTech = async (e: FormEvent) => {
    e.preventDefault();
    setAddingTech(true);
    try {
      await apiClient.post('/api/staff', {
        email: newTechData.email,
        password: newTechData.password,
        role: newTechData.isLead ? 'lead_technician' : 'technician'
      });
      showToast('Técnico agregado correctamente', 'success');
      setNewTechData({ email: '', password: '', isLead: false });
      fetchStaff();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAddingTech(false);
    }
  };

  const confirmDeleteStaff = (targetUser: UserProfile) => {
    setConfirmModal({
      show: true,
      action: 'DELETE_STAFF',
      data: targetUser
    });
  };

  // Delete functionality is handled by executeDeleteStaff below

  const executeDeleteStaff = async (targetUser: UserProfile) => {
    setConfirmModal({ show: false, action: 'SAVE_COMPANY' });
    try {
      const response = await fetch('/api/staff', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-company-id': user?.company_id || '',
        },
        body: JSON.stringify({ id: targetUser.id, requestorId: user?.id })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al eliminar');
      
      showToast('Personal eliminado', 'success');
      fetchStaff();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const onCompanySubmit = (data: CompanyFormData) => {
    setConfirmModal({ show: true, action: 'SAVE_COMPANY', data });
  };

  if (user?.role === 'technician') {
    return <div className="p-8 text-center text-slate-500">No tienes acceso a esta sección.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-brand-600" />
          Empresa
        </h1>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 text-xs font-medium">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : toast.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <XCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(t => ({ ...t, show: false }))} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CONFIRM MODALS */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmModal({ show: false, action: 'SAVE_COMPANY' })} />
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 space-y-4">
            
            {confirmModal.action === 'SAVE_COMPANY' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-brand-50 text-brand-600"><Save className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Confirmar Cambios</h3>
                    <p className="text-xs text-slate-600 mt-1">Los datos se sobreescribirán.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button onClick={() => setConfirmModal({ show: false, action: 'SAVE_COMPANY' })} className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl">Cancelar</button>
                  <button onClick={() => { setConfirmModal({ show: false, action: 'SAVE_COMPANY' }); setIsSubmitting(true); updateCompany(confirmModal.data).then(() => { showToast('Guardado', 'success'); setIsSubmitting(false); }).catch(e => { showToast(e.message, 'error'); setIsSubmitting(false); }); }} className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl">Confirmar</button>
                </div>
              </>
            )}

            {confirmModal.action === 'DELETE_STAFF' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600"><Trash2 className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Eliminar Personal</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      ¿Estás seguro que deseas eliminar a <b>{confirmModal.data?.email}</b> con rol <b>{confirmModal.data?.role}</b> de la empresa? Esta acción es irreversible.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button onClick={() => setConfirmModal({ show: false, action: 'SAVE_COMPANY' })} className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl">Cancelar</button>
                  <button onClick={() => executeDeleteStaff(confirmModal.data)} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">Confirmar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 1. AGREGAR NUEVO TECNICO */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand-600" />
          Agregar Nuevo Técnico
        </h3>
        <form onSubmit={onAddTech} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Input 
            label="Correo electrónico" type="email" required 
            value={newTechData.email} onChange={e => setNewTechData({...newTechData, email: e.target.value})} 
          />
          <Input 
            label="Contraseña" type="password" required minLength={6}
            value={newTechData.password} onChange={e => setNewTechData({...newTechData, password: e.target.value})} 
          />
          <div className="sm:col-span-2 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
            <input 
              type="checkbox" id="isLead" 
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              checked={newTechData.isLead} 
              onChange={e => setNewTechData({...newTechData, isLead: e.target.checked})} 
            />
            <label htmlFor="isLead" className="text-sm font-medium text-slate-700 cursor-pointer select-none flex items-center">
              Otorgar rol de líder técnico
              <InfoPopover text="Un líder técnico tiene acceso a 'Agregar Nuevo Técnico' y 'Personal'" />
            </label>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={addingTech}>
              Agregar
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. PERSONAL */}
      <Card className="p-0 overflow-hidden">
        <button 
          onClick={() => setIsStaffOpen(!isStaffOpen)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" />
            Personal
          </h3>
          {isStaffOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        {isStaffOpen && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            {loadingStaff ? (
              <div className="text-center text-xs text-slate-500 py-4">Cargando...</div>
            ) : staff.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-4">No hay personal registrado</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="p-3">Mail</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3 w-16 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => {
                      const isMe = s.id === user?.id;
                      const isAdmin = s.role === 'admin';
                      const canDelete = !isMe && !isAdmin && (user?.role === 'admin' || user?.role === 'lead_technician');
                      
                      return (
                        <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-sm text-slate-700 font-medium">{s.email}</td>
                          <td className="p-3 text-xs text-slate-500">
                            <span className={`px-2 py-1 rounded-md font-semibold ${
                              s.role === 'admin' ? 'bg-indigo-50 text-indigo-700' :
                              s.role === 'lead_technician' ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {s.role}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {canDelete && (
                              <button 
                                onClick={() => confirmDeleteStaff(s)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 3. CONFIGURACION DE LA EMPRESA (Solo Admin) */}
      {user?.role === 'admin' && (
        <Card className="p-0 overflow-hidden">
          <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-600" />
              Configuración de la Empresa
            </h3>
            {isConfigOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          
          {isConfigOpen && (
            <div className="p-4 border-t border-slate-100">
              <form onSubmit={handleSubmit(onCompanySubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <Input label="Nombre de la Empresa" required error={errors.name?.message} icon={<Building className="w-4 h-4" />} {...register('name')} />
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Logotipo Corporativo (PDF)
                      <InfoPopover text={
                        <>
                          <span className="font-semibold text-white">Medidas recomendadas:</span> Formato horizontal 3:1 (aprox. <span className="font-medium text-slate-200">600 × 200 px</span> o superior). Formato PNG con fondo transparente o JPG de alta calidad para garantizar nitidez en el PDF y la cabecera.
                        </>
                      } />
                    </label>
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                      <label htmlFor="logo-upload" className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors border border-slate-300">
                        <ImageIcon className="w-4 h-4 text-brand-600" /> Subir Imagen
                      </label>
                      {logoUrl ? (
                        <div className="flex items-center gap-1.5">
                          <img src={logoUrl} alt="Logo Prev" className="h-9 max-w-[120px] object-contain rounded border bg-slate-50 p-1" />
                          <button type="button" onClick={() => setValue('logo_url', '')} title="Eliminar logotipo" className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      ) : <span className="text-[11px] text-slate-400">Sin logo</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Dirección Comercial" required error={errors.address?.message} icon={<MapPin className="w-4 h-4" />} {...register('address')} />
                  <Input label="Teléfono Comercial / WhatsApp" required error={errors.phone?.message} icon={<Phone className="w-4 h-4" />} {...register('phone')} />
                  <Input label="Correo Electrónico Oficial" required type="email" error={errors.email?.message} icon={<Mail className="w-4 h-4" />} {...register('email')} />
                  <Input label="Sitio Web" error={errors.website?.message} icon={<Globe className="w-4 h-4" />} {...register('website')} />
                </div>

                <TextArea 
                  label={
                    <span className="flex items-center">
                      Texto Legal (Pie de página en PDF)
                      <InfoPopover text="Ejemplo: Esta estimación no constituye una factura ni contrato de prestación de servicios." />
                    </span>
                  }
                  rows={3} 
                  error={errors.legal_notice?.message} 
                  {...register('legal_notice')} 
                />

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <Button type="submit" size="lg" variant="primary" isLoading={isSubmitting} icon={<Save className="w-5 h-5" />}>
                    Guardar Configuración
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
