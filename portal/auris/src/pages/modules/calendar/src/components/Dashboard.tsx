import { Calendar, Bell, Mail, Target } from "lucide-react";
import { useEffect, useState } from "react";
import EventModal from "./EventModal";

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openNewEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const editEvent = (ev: any) => {
    setEditingEvent(ev);
    setIsModalOpen(true);
  };

  const deleteEvent = async (id: number) => {
    if(!confirm('Tem certeza?')) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  const colorMap: Record<string, string> = {
    blue: "bg-[#0070f333] border-[#0070f380] text-[#7eb5ff] shadow-[0_0_10px_rgba(0,112,243,0.3)]",
    teal: "bg-[#00dfd833] border-[#00dfd880] text-[#7dfaf6] shadow-[0_0_10px_rgba(0,223,216,0.3)]",
    amber: "bg-[#f5a62333] border-[#f5a62380] text-[#ffd699] shadow-[0_0_10px_rgba(245,166,35,0.3)]",
    purple: "bg-[#7928ca33] border-[#7928ca80] text-[#d499ff] shadow-[0_0_10px_rgba(121,40,202,0.3)]",
    red: "bg-[#ff008033] border-[#ff008080] text-[#ff99cf] shadow-[0_0_10px_rgba(255,0,128,0.3)]",
    gray: "bg-[#ffffff14] border-[#ffffff33] text-white/80 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Metric Cards Grid */}
      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        <div className="glass-card p-4 flex items-center space-x-3 liquid-glass">
          <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center bg-[#fac77533] border border-[#fac77559]">
            <Calendar className="text-[#fac775]" size={18} />
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-white">{events.length} Eventos</h3>
            <p className="text-[12px] text-white/50">Total de eventos cadastrados</p>
          </div>
        </div>
        
        <div className="glass-card p-4 flex items-center space-x-3 liquid-glass">
          <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center bg-[#5dcaa533] border border-[#5dcaa559]">
            <Bell className="text-[#5dcaa5]" size={18} />
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-white">{events.filter(e => new Date(e.event_date) > new Date()).length} Próximos</h3>
            <p className="text-[12px] text-white/50">Próximas datas importantes</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center space-x-3 liquid-glass">
          <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center bg-[#85B7EB33] border border-[#85B7EB59]">
            <Mail className="text-[#85B7EB]" size={18} />
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-white">4 Envios</h3>
            <p className="text-[12px] text-white/50">Próximos envios agendados</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center space-x-3 liquid-glass">
          <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center bg-[#f0959533] border border-[#f0959559]">
            <Target className="text-[#f09595]" size={18} />
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-white">Mês Padrão</h3>
            <p className="text-[12px] text-white/50">Campanha ativa do mês</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-semibold text-white">Cronograma Corporativo</h2>
        <button onClick={openNewEvent} className="liquid-glass-btn px-4 py-2 text-sm">
          + Novo Evento
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#ffffff0a] text-white/50 text-[12px] tracking-wider border-b border-[#ffffff15]">
            <tr>
              <th className="px-6 py-4 font-medium">EVENTO</th>
              <th className="px-6 py-4 font-medium w-32">DATA</th>
              <th className="px-6 py-4 font-medium w-32 text-center">STATUS</th>
              <th className="px-6 py-4 font-medium w-32">CATEGORIA</th>
              <th className="px-6 py-4 font-medium text-right w-40">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ffffff10]">
            {events.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-white/50">Nenhum evento cadastrado.</td></tr>
            ) : (
              events.map((ev, i) => (
                <tr key={i} className={`hover:bg-[#ffffff0a] transition-colors ${ev.status === 'draft' ? 'opacity-40 grayscale-[50%]' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="font-semibold text-white text-[15px]">{ev.title}</div>
                    <div className="text-[13px] text-white/50 mt-1 truncate max-w-md">{ev.description}</div>
                  </td>
                  <td className="px-6 py-5 text-white/80 text-[13px] whitespace-nowrap">
                     {ev.event_date.split('-').reverse().join('/')}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {ev.status === 'draft' ? (
                      <span className="text-[10px] uppercase font-bold text-white/40 border border-[#ffffff1a] px-2 py-0.5 rounded">Rascunho</span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-[#5dcaa5] border border-[#5dcaa533] bg-[#5dcaa51a] px-2 py-0.5 rounded">Publicado</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium border ${colorMap[ev.color_tag] || colorMap.gray}`}>
                      {ev.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-3">
                    <button onClick={() => editEvent(ev)} className="text-[#85B7EB] hover:text-white text-[13px] font-medium transition-colors">Editar</button>
                    <button onClick={() => deleteEvent(ev.id)} className="text-[#f09595] hover:text-white text-[13px] font-medium transition-colors">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <EventModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={fetchEvents}
          eventData={editingEvent}
        />
      )}
    </div>
  );
}
