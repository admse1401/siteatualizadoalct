import { useState, useEffect } from "react";
import { Image } from "lucide-react";

export default function Campaigns() {
  const [campaign, setCampaign] = useState<any>({
    title: "", description: "", image_url: "", target_sector: "Todos", month: new Date().getMonth() + 1, year: new Date().getFullYear()
  });
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    fetch(`/api/campaigns?month=${campaign.month}&year=${campaign.year}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCampaign(data);
        } else {
          setCampaign(prev => ({ ...prev, title: "", description: "", image_url: "", target_sector: "Todos" }));
        }
      });
  }, [campaign.month, campaign.year]);

  const handleChange = (e: any) => {
    setCampaign({ ...campaign, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaign)
    });
    setSaving(false);
    alert("Campanha Atualizada!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-white">Gerenciar Campanha</h2>

      <div className="glass-card p-6 liquid-glass">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Mês</label>
              <select name="month" value={campaign.month} onChange={handleChange} className="glass-input w-full p-2 text-sm appearance-none">
                {[...Array(12)].map((_, i) => (
                   <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('pt-br', { month: 'long' }).toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Ano</label>
              <input type="number" name="year" value={campaign.year} onChange={handleChange} className="glass-input w-full p-2 text-sm" />
            </div>
          </div>

          <div>
             <label className="block text-[12px] text-white/50 mb-1">Título da Campanha (Ex: Maio Amarelo)</label>
             <input required type="text" name="title" value={campaign.title || ''} onChange={handleChange} className="glass-input w-full p-2 text-sm" />
          </div>

          <div>
             <label className="block text-[12px] text-white/50 mb-1">Alvo de Envio (Setor)</label>
             <select name="target_sector" value={campaign.target_sector || 'Todos'} onChange={handleChange} className="glass-input w-full p-2 text-sm appearance-none">
               <option value="Todos">Todos os Colaboradores</option>
               {sectors.map(sec => (
                 <option key={sec} value={sec}>Setor: {sec}</option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-[12px] text-white/50 mb-1">Mensagem de Engajamento Interno</label>
             <textarea name="description" value={campaign.description || ''} onChange={handleChange} className="glass-input w-full p-2 text-sm" rows={4}></textarea>
          </div>

          <div>
            <label className="block text-[12px] text-white/50 mb-1">Arte da Campanha (URL da Imagem para o E-mail)</label>
            <div className="flex gap-4 items-start">
              <input type="url" name="image_url" value={campaign.image_url || ''} onChange={handleChange} placeholder="https://..." className="glass-input flex-1 p-2 text-sm" />
              {campaign.image_url ? (
                <img src={campaign.image_url} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-[#ffffff1a] bg-[#00000033]" />
              ) : (
                <div className="h-24 w-24 rounded-lg border border-[#ffffff1a] border-dashed flex items-center justify-center bg-[#0000001a]">
                  <Image className="text-white/30" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#ffffff1a]">
            <button type="submit" disabled={saving} className="liquid-glass-btn">
              {saving ? 'Salvando...' : 'Salvar Campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
