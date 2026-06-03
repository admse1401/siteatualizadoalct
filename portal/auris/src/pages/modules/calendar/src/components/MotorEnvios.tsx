import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Eye, Pause, Play, Send, Zap, Loader2, Users } from "lucide-react";

export default function MotorEnvios() {
  const [queue, setQueue] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ online: true, queueCount: 0, successRate: "100.0" });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [recipientsList, setRecipientsList] = useState<{eventTitle: string, contacts: any[]} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQueue = async () => {
    const res = await fetch("/api/queue");
    const data = await res.json();
    setQueue(data.queue);
    setMetrics(data.metrics);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handlePreview = async (id: string, type: string) => {
    const res = await fetch(`/api/preview/${id}/${type}`);
    const html = await res.text();
    setPreviewHtml(html);
  };

  const handleViewRecipients = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/queue/${id}/recipients`);
      const data = await res.json();
      setRecipientsList({ eventTitle: title, contacts: data.recipients });
    } catch(err) {
      showToast("Erro ao buscar destinatários", "error");
    }
  };

  const handlePauseToggle = async (id: string | number, currentStatus: string) => {
    if (String(id).startsWith('digest')) {
        showToast("Digest Mensal não pode ser pausado diretamente.", "error");
        return;
    }
    const isPaused = currentStatus !== 'Paused';
    await fetch(`/api/events/${id}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_paused: isPaused })
    });
    fetchQueue();
  };

  const handleForceSend = async (id: string | number, type: string) => {
    setSendingId(`${id}-${type}`);
    try {
      const res = await fetch(`/api/force_send/${id}/${type}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
         showToast("Erro: " + (data.error || "Falha ao forçar envio"), "error");
         return;
      }
      showToast(data.note || "Disparo forçado executado com sucesso!", "success");
      fetchQueue();
    } catch(err: any) {
      showToast("Erro ao executar: " + err.message, "error");
    } finally {
      setSendingId(null);
    }
  };

  const getTypeBadgeColor = (type: string) => {
      switch(type) {
          case 'Digest Mensal': return 'bg-[#0070f380] border-[#0070f3] text-white';
          case 'D-0': return 'bg-[#ff008080] border-[#ff0080] text-white';
          case 'T-1': return 'bg-[#7928ca80] border-[#7928ca] text-white';
          case 'T-2': return 'bg-[#f5a62380] border-[#f5a623] text-white';
          default: return 'bg-[#ffffff33] border-[#ffffff66] text-white';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-full bg-[#042C53]/10 p-6 rounded-xl border border-white/5 relative">
      
      {toast && (
        <div className={`absolute top-6 right-6 px-4 py-3 rounded shadow-lg flex items-center gap-2 z-[9999] transition-all animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
           <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
          <div className="glass-card p-6 border border-white/10 flex items-center justify-between">
              <div>
                  <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Status da API</h3>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                       {metrics.online ? <><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span> Online</> : <><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> Offline</>}
                  </div>
              </div>
          </div>
          <div className="glass-card p-6 border border-white/10 flex items-center justify-between">
              <div>
                  <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Envios na Fila (7 dias)</h3>
                  <div className="text-2xl font-bold text-white">{metrics.queueCount}</div>
              </div>
          </div>
          <div className="glass-card p-6 border border-white/10 flex items-center justify-between">
              <div>
                  <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Taxa de Sucesso</h3>
                  <div className="text-2xl font-bold text-white">{metrics.successRate}%</div>
              </div>
          </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col border border-white/10">
        <div className="p-5 border-b border-[#ffffff15] bg-[#ffffff05] flex justify-between items-center">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">Fila de Processamento Cron</h2>
        </div>
        <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
            <thead className="bg-[#ffffff0a] text-white/50 text-[12px] tracking-wider border-b border-[#ffffff15] sticky top-0 z-10 backdrop-blur-md">
                <tr>
                <th className="px-6 py-4 font-medium">TIPO DE DISPARO</th>
                <th className="px-6 py-4 font-medium">EVENTO RELACIONADO</th>
                <th className="px-6 py-4 font-medium">DATA/HORA DE SAÍDA</th>
                <th className="px-6 py-4 font-medium">SETOR/DESTINO</th>
                <th className="px-6 py-4 font-medium">STATUS</th>
                <th className="px-6 py-4 font-medium text-right">AÇÕES</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff10]">
                {queue.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-white/50">A fila de disparos está vazia.</td></tr>
                ) : (
                queue.map((item, index) => (
                    <tr key={`${item.id}-${item.type}-${index}`} className="hover:bg-[#ffffff0a] transition-colors group">
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getTypeBadgeColor(item.type)}`}>
                            {item.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-white/90 font-medium">
                        {item.related_event} 
                        {item.status === 'Paused' && <span className="ml-2 text-[10px] text-white/40 italic">(Pausado)</span>}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                        {format(new Date(item.send_date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                        {item.sector}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border
                            ${item.status === 'Scheduled' ? 'bg-[#00dfd820] text-[#00dfd8] border-[#00dfd830]' : 'bg-[#f5a62320] text-[#f5a623] border-[#f5a62330]'}
                        `}>
                             {item.status === 'Scheduled' ? 'Na Fila' : 'Pausado'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleViewRecipients(item.id, item.related_event)} className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Ver Destinatários">
                                <Users size={16} />
                            </button>
                            <button onClick={() => handlePreview(item.id, item.type)} className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Preview do E-mail">
                                <Eye size={16} />
                            </button>
                            <button onClick={() => handlePauseToggle(item.id, item.status)} className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors" title={item.status === 'Paused' ? "Retomar Disparo" : "Pausar Disparo"}>
                                {item.status === 'Paused' ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                            <button onClick={() => handleForceSend(item.id, item.type)} disabled={sendingId === `${item.id}-${item.type}`} className="p-1.5 rounded-md hover:bg-white/10 text-[#fac775]/60 hover:text-[#fac775] transition-colors disabled:opacity-50" title="Forçar Disparo Agora">
                                {sendingId === `${item.id}-${item.type}` ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            </button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {previewHtml && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-gray-800 font-medium">Preview do E-mail</h2>
                    <button onClick={() => setPreviewHtml(null)} className="text-gray-500 hover:text-gray-900 px-3 py-1 bg-gray-200 rounded">Fechar</button>
                </div>
                <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center">
                    <div className="w-full max-w-[600px] bg-white shadow-sm" dangerouslySetInnerHTML={{__html: previewHtml}} />
                </div>
            </div>
         </div>
      )}

      {recipientsList && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 text-black">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-gray-800 font-medium text-sm">Destinatários: {recipientsList.eventTitle}</h2>
                    <button onClick={() => setRecipientsList(null)} className="text-gray-500 hover:text-gray-900 px-2 py-1 bg-gray-200 rounded text-xs">Fechar</button>
                </div>
                <div className="flex-1 overflow-auto bg-white p-4 max-h-[300px]">
                    {recipientsList.contacts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhum destinatário encontrado neste setor.</p>
                    ) : (
                        <ul className="space-y-2">
                            {recipientsList.contacts.map((contact, idx) => (
                                <li key={idx} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border border-gray-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                        <span className="font-medium">{contact.name || "Sem Nome"}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">{contact.email}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
         </div>
      )}
    </div>
  );
}
