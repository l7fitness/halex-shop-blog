import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const AffiliatesManagement = ({ affiliates, onRefresh }: { affiliates: any[], onRefresh: () => void }) => {
  const [newAffiliate, setNewAffiliate] = useState({ name: '', email: '', ref_code: '', commission_rate: 10 });

  const handleAddAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAffiliate)
    });
    setNewAffiliate({ name: '', email: '', ref_code: '', commission_rate: 10 });
    onRefresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddAffiliate} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xl font-bold">Novo Afiliado</h3>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Nome" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.name} onChange={e => setNewAffiliate({...newAffiliate, name: e.target.value})} required />
          <input placeholder="Email" type="email" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.email} onChange={e => setNewAffiliate({...newAffiliate, email: e.target.value})} required />
          <input placeholder="Código de Referência (ex: nome)" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.ref_code} onChange={e => setNewAffiliate({...newAffiliate, ref_code: e.target.value})} required />
          <input placeholder="Comissão (%)" type="number" className="p-3 bg-gray-50 rounded-xl" value={newAffiliate.commission_rate} onChange={e => setNewAffiliate({...newAffiliate, commission_rate: parseFloat(e.target.value)})} required />
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2"><Plus size={16} /> Adicionar Afiliado</button>
      </form>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Afiliados Cadastrados</h3>
        <div className="space-y-4">
          {affiliates.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold">{a.name}</p>
                <p className="text-sm text-gray-500">{a.email} | Ref: {a.ref_code}</p>
              </div>
              <p className="font-bold text-brand-orange">{a.commission_rate}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
