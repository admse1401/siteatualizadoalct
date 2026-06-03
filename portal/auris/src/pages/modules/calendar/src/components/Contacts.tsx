import { useState, useEffect } from "react";
import { User, Mail, Briefcase, Trash2 } from "lucide-react";

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: "", sector: "RH", email: "" });

  const fetchContacts = async () => {
    const res = await fetch("/api/contacts");
    setContacts(await res.json());
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    setFormData({ name: "", sector: "RH", email: "" });
    fetchContacts();
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Remover contato?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    fetchContacts();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-semibold text-white">Gestão de Contatos e Setores</h2>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="glass-card liquid-glass p-6 md:col-span-1 h-fit">
          <h3 className="text-sm font-medium text-white mb-4">Adicionar Contato</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Nome Completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-2.5 text-white/40" />
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="glass-input w-full pl-9 p-2 text-sm" />
              </div>
            </div>
            
            <div>
              <label className="block text-[12px] text-white/50 mb-1">Setor / Departamento</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-2.5 text-white/40" />
                <select name="sector" value={formData.sector} onChange={handleChange} className="glass-input w-full pl-9 p-2 text-sm appearance-none">
                  <option value="RH">Recursos Humanos</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Criação">Criação de Artes</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Comunicação">Comunicação Interna</option>
                  <option value="Geral">Time Geral</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-white/50 mb-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-white/40" />
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="glass-input w-full pl-9 p-2 text-sm" />
              </div>
            </div>

            <button type="submit" className="liquid-glass-btn w-full mt-4">
              Salvar Contato
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-card overflow-hidden md:col-span-2">
           <table className="w-full text-left text-sm">
            <thead className="bg-[#ffffff0a] text-white/50 text-[12px] tracking-wider border-b border-[#ffffff26]">
              <tr>
                <th className="px-6 py-4 font-medium">CONTATO</th>
                <th className="px-6 py-4 font-medium">SETOR</th>
                <th className="px-6 py-4 font-medium text-right">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff1a]">
              {contacts.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-white/50">Nenhum contato cadastrado.</td></tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#ffffff0a] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-[14px] text-white font-medium">{contact.name}</div>
                      <div className="text-[12px] text-white/60">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium border bg-[#ffffff14] border-[#ffffff26]">
                        {contact.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDelete(contact.id)} className="text-[#f09595] opacity-50 group-hover:opacity-100 hover:text-white transition-opacity">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
