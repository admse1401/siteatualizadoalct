import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Eye, MousePointerClick } from "lucide-react";

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch("/api/logs");
    const data = await res.json();
    setLogs(data);
  };

  const handleResend = async (logId: number) => {
    if(!confirm('Deseja forçar o reenvio manualmente?')) return;
    alert('Reenvio agendado.'); // Placeholder resend logic
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Logs de Disparos Automáticos</h2>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#ffffff0a] text-white/50 text-[12px] tracking-wider border-b border-[#ffffff15]">
            <tr>
              <th className="px-6 py-4 font-medium">DATA/HORA</th>
              <th className="px-6 py-4 font-medium">TIPO</th>
              <th className="px-6 py-4 font-medium">DESTINATÁRIO</th>
              <th className="px-6 py-4 font-medium">STATUS</th>
              <th className="px-6 py-4 font-medium text-center">ENGAJAMENTO</th>
              <th className="px-6 py-4 font-medium text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ffffff10]">
            {logs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-white/50">Nenhum log registrado.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#ffffff0a] transition-colors">
                  <td className="px-6 py-4 text-white/80 text-[13px]">
                    {format(new Date(log.send_date), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-white">
                    {log.trigger_type}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-white/80">
                    {log.recipient}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-medium border ${log.status === 'SUCCESS' ? 'bg-[#1d9e7533] border-[#5dcaa559] text-[#5dcaa5]' : 'bg-[#e24b4a2e] border-[#f0959559] text-[#f09595]'}`}>
                      {log.status}
                    </span>
                    {log.error_message && <div className="text-[11px] text-[#f09595] mt-1">{log.error_message}</div>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3 text-white/40">
                      <div className={`flex items-center gap-1 ${log.opened ? 'text-[#85B7EB]' : ''}`} title={log.opened ? "Aberto" : "Não aberto"}>
                        <Eye size={14} />
                      </div>
                      <div className={`flex items-center gap-1 ${log.clicked ? 'text-[#fac775]' : ''}`} title={log.clicked ? "Clicado" : "Não clicado"}>
                        <MousePointerClick size={14} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {log.status !== 'SUCCESS' && (
                      <button onClick={() => handleResend(log.id)} className="text-[#fac775] hover:text-white text-xs">
                        Reenviar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
