import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const AffiliatesManagement = ({ affiliates, onRefresh }: { affiliates: any[], onRefresh: () => void }) => {
  const [newAffiliate, setNewAffiliate] = useState({ name: '', email: '', whatsapp: '', ref_code: '', commission_rate: 10 });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ whatsapp: '', commission_rate: 10 });

  const handleAddAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAffiliate)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      alert(`Erro ao criar afiliado: ${errorData.error}`);
      return;
    }

    alert(`Afiliado ${newAffiliate.name} criado com sucesso!`);
    setNewAffiliate({ name: '', email: '', whatsapp: '', ref_code: '', commission_rate: 10 });
    onRefresh();
  };

  const handleUpdateAffiliate = async (id: string) => {
    const response = await fetch(`/api/affiliates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    
    if (!response.ok) {
      alert('Erro ao atualizar afiliado');
      return;
    }
    setEditingId(null);
    onRefresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddAffiliate} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xl font-bold">Novo Afiliado</h3>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Nome" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.name} onChange={e => setNewAffiliate({...newAffiliate, name: e.target.value})} required />
          <input placeholder="Email" type="email" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.email} onChange={e => setNewAffiliate({...newAffiliate, email: e.target.value})} required />
          <input placeholder="WhatsApp" type="tel" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.whatsapp} onChange={e => setNewAffiliate({...newAffiliate, whatsapp: e.target.value})} required />
          <input placeholder="Código de Referência (ex: nome)" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.ref_code} onChange={e => setNewAffiliate({...newAffiliate, ref_code: e.target.value})} required />
          <input placeholder="Comissão (%)" type="number" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.commission_rate} onChange={e => setNewAffiliate({...newAffiliate, commission_rate: Number(e.target.value)})} required />
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2"><Plus size={16} /> Adicionar Afiliado</button>
      </form>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Afiliados Cadastrados</h3>
        <div className="space-y-4">
          {affiliates.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              {editingId === a.id ? (
                <div className="flex gap-2 items-center w-full">
                  <input className="p-2 rounded-lg" value={editData.whatsapp} onChange={e => setEditData({...editData, whatsapp: e.target.value})} />
                  <input type="number" className="p-2 rounded-lg w-20" value={editData.commission_rate} onChange={e => setEditData({...editData, commission_rate: Number(e.target.value)})} />
                  <button onClick={() => handleUpdateAffiliate(a.id)} className="btn-primary p-2">Salvar</button>
                  <button onClick={() => setEditingId(null)} className="btn-secondary p-2">Cancelar</button>
                </div>
              ) : (
                <div className="flex justify-between w-full items-center">
                  <div>
                    <p className="font-bold">{a.name}</p>
                    <p className="text-sm text-gray-500">{a.email} | WhatsApp: {a.whatsapp} | Ref: {a.ref_code}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-brand-orange">{a.commission_rate}%</p>
                    <button onClick={() => { setEditingId(a.id); setEditData({ whatsapp: a.whatsapp, commission_rate: a.commission_rate }); }} className="text-blue-500 text-sm">Editar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
