import { useEffect, useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState<any>({
    resend_api_key: "", sender_email: "", global_send_time: "", email_signature: "", company_logo: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  const handleChange = (e: any) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    alert("Configurações salvas.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-white">Configurações do Sistema</h2>
      
      <form onSubmit={handleSave} className="space-y-8 animate-in fade-in">
        
        <div className="glass-card p-6 space-y-4 liquid-glass">
          <h3 className="text-lg font-medium text-white mb-4 border-b border-[#ffffff1a] pb-2">Integração Resend (API)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Resend API Key</label>
              <input required type="password" name="resend_api_key" value={settings.resend_api_key || ''} onChange={handleChange} className="glass-input w-full p-2 text-sm" placeholder="re_..." />
            </div>
            <div>
              <label className="block text-[12px] text-white/50 mb-1">E-mail do Remetente Autorizado</label>
              <input required type="email" name="sender_email" value={settings.sender_email || ''} onChange={handleChange} className="glass-input w-full p-2 text-sm" placeholder="exemplo@aliancatur.com" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4 liquid-glass">
          <h3 className="text-lg font-medium text-white mb-4 border-b border-[#ffffff1a] pb-2">Configurações Gerais</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Horário Global Padrão (Alertas)</label>
              <input required type="time" name="global_send_time" value={settings.global_send_time || ''} onChange={handleChange} className="glass-input p-2 text-sm w-32" />
            </div>
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Logo da Empresa (URL)</label>
              <input type="url" name="company_logo" value={settings.company_logo || ''} onChange={handleChange} placeholder="https://..." className="glass-input w-full p-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-white/50 mb-1">Assinatura de E-mail</label>
            <textarea name="email_signature" value={settings.email_signature || ''} onChange={handleChange} className="glass-input w-full p-2 text-sm" rows={3}></textarea>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="liquid-glass-btn">
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
