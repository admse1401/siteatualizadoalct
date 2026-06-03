import { useState, useEffect } from "react";

export default function EventModal({ isOpen, onClose, onSave, eventData }: any) {
  const [formData, setFormData] = useState({
    title: eventData?.title || "",
    description: eventData?.description || "",
    event_date: eventData?.event_date || "",
    category: eventData?.category || "Interno",
    color_tag: eventData?.color_tag || "blue",
    send_type: eventData?.send_type || "Todos",
    is_recurrent: eventData?.is_recurrent == 1,
    attachment_url: eventData?.attachment_url || "",
    status: eventData?.status || "published"
  });

  const [sectors, setSectors] = useState<string[]>([]);

  useEffect(() => {
    // Fetch unique sectors from contacts
    fetch("/api/contacts")
      .then(res => res.json())
      .then(data => {
        const uniqueSectors = Array.from(new Set(data.map((c: any) => c.sector)));
        setSectors(uniqueSectors as string[]);
      });
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const url = eventData && eventData.id ? `/api/events/${eventData.id}` : "/api/events";
    const method = eventData && eventData.id ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        throw new Error("Falha ao salvar o evento");
      }
      
      onSave();
      onClose();
    } catch(err: any) {
      alert("Erro: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010a1499] backdrop-blur-sm animate-in fade-in">
      <div className="glass-card liquid-glass w-full max-w-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">&times;</button>
        <h2 className="text-lg font-medium mb-6 text-white">{eventData && eventData.id ? "Editar" : "Novo"} Evento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] text-white/50 mb-1">Título</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="glass-input w-full p-2 text-sm" />
            </div>
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="glass-input w-full p-2 text-sm appearance-none">
                <option value="published">🟢 Publicado (Ativo)</option>
                <option value="draft">🟡 Rascunho (Oculto)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[12px] text-white/50 mb-1">Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="glass-input w-full p-2 text-sm" rows={3}></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Data</label>
              <input required type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="glass-input w-full p-2 text-sm" />
            </div>
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Categoria</label>
              <select name="category" value={formData.category} onChange={handleChange} className="glass-input w-full p-2 text-sm appearance-none">
                <option value="Transporte">Transporte</option>
                <option value="Saúde">Saúde</option>
                <option value="Regional">Regional</option>
                <option value="Interno">Interno</option>
                <option value="Feriado">Feriado Nacional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Cor/Tag Visual</label>
              <select name="color_tag" value={formData.color_tag} onChange={handleChange} className="glass-input w-full p-2 text-sm appearance-none">
                <option value="blue">Azul</option>
                <option value="teal">Turquesa</option>
                <option value="amber">Âmbar</option>
                <option value="purple">Roxo</option>
                <option value="red">Vermelho</option>
                <option value="gray">Cinza</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Alvo de Envio (Setor)</label>
              <select name="send_type" value={formData.send_type} onChange={handleChange} className="glass-input w-full p-2 text-sm appearance-none">
                <option value="Todos">Todos os Colaboradores</option>
                {sectors.map(sec => (
                  <option key={sec} value={sec}>Setor: {sec}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="is_recurrent" name="is_recurrent" checked={formData.is_recurrent} onChange={handleChange} className="rounded bg-[#ffffff14] border-[#ffffff26]" />
            <label htmlFor="is_recurrent" className="text-[13px] text-white/80">Repetir anualmente</label>
          </div>

          <div className="pt-2">
            <label className="block text-[12px] text-white/50 mb-1">URL de Anexo / Arte (Opcional)</label>
            <input type="url" name="attachment_url" value={formData.attachment_url} onChange={handleChange} placeholder="https://..." className="glass-input w-full p-2 text-sm" />
          </div>

          <div className="pt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="glass-btn-secondary px-4 py-2 text-sm">Cancelar</button>
            <button type="submit" className="liquid-glass-btn">
              Salvar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
