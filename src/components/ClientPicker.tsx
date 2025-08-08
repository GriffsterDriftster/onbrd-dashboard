'use client';
import { useEffect, useState } from 'react';
type Item = { clientId: string; clientName: string; active: boolean };
export default function ClientPicker() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { let mounted = true; fetch('/api/me/clients').then(r=>r.json()).then(d=>{ if(mounted) setItems(d.items||[]) }); return ()=>{mounted=false}; }, []);
  if (!items.length) return null;
  const activeId = items.find(i=>i.active)?.clientId || items[0].clientId;
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    window.location.href = `/clients/select?id=${encodeURIComponent(id)}`;
  }
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-sm">Client</span>
      <select onChange={onChange} defaultValue={activeId} className="rounded-md text-black px-2 py-1">
        {items.map(i => <option key={i.clientId} value={i.clientId}>{i.clientName}</option>)}
      </select>
    </label>
  );
}
