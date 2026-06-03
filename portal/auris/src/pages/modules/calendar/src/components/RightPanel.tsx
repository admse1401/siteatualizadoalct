import { useEffect, useState } from 'react';
import { Send, Bell, BellRing, Flame, Image as ImageIcon, Upload, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function RightPanel() {
  const [stats, setStats] = useState({ events: 0, t2: 0, personas: 0, snapshots: 0 });
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    // Basic fetch for stats simulation and real data
    const fetchStats = async () => {
      try {
        const [evRes, camRes, conRes] = await Promise.all([
          fetch('/api/events'),
          fetch(`/api/campaigns?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`),
          fetch('/api/contacts')
        ]);
        const events = await evRes.json();
        const campaignData = await camRes.json();
        const contacts = await conRes.json();

        // Calculate
        const thisMonthEvents = events.filter((e: any) => new Date(e.event_date).getMonth() === new Date().getMonth());
        
        // T-2 count: events exactly 2 days from now. 
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        const t2Str = format(twoDaysFromNow, 'yyyy-MM-dd');
        const t2Events = events.filter((e: any) => e.event_date === t2Str && e.status === 'published');

        setStats({
          events: thisMonthEvents.length,
          t2: t2Events.length,
          personas: new Set((contacts as any[]).map(c => c.sector)).size,
          snapshots: campaignData && campaignData.image_url ? 1 : 0
        });

        if (campaignData) setCampaign(campaignData);
      } catch (err) {
        console.error("Error fetching right panel stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <aside className="right-panel">
      <div className="mini-stats">
        <div className="stat-card"><div className="stat-num">{stats.events}</div><div className="stat-lbl">Eventos no mês</div></div>
        <div className="stat-card"><div className="stat-num">{stats.t2}</div><div className="stat-lbl">Alertas T-2 ativos</div></div>
        <div className="stat-card"><div className="stat-num">{stats.personas}</div><div className="stat-lbl">Personas ativas</div></div>
        <div className="stat-card"><div className="stat-num">{stats.snapshots}</div><div className="stat-lbl">Snapshots prontos</div></div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Automações</div>
        <div className="automation-row">
          <div className="auto-icon bg-[#EAF3DE] text-[#3B6D11]"><Send size={14} /></div>
          <div className="auto-text">
            <div className="auto-label">Digest Mensal</div>
            <div className="auto-sub">Dia 1 — 07:00</div>
          </div>
          <div className="auto-status">Ativo</div>
        </div>
        <div className="automation-row">
          <div className="auto-icon bg-[#FAEEDA] text-[#854F0B]"><Bell size={14} /></div>
          <div className="auto-text">
            <div className="auto-label">Alerta T-2</div>
            <div className="auto-sub">2 dias antes</div>
          </div>
          <div className="auto-status">Ativo</div>
        </div>
        <div className="automation-row">
          <div className="auto-icon bg-[#E6F1FB] text-[#185FA5]"><BellRing size={14} /></div>
          <div className="auto-text">
            <div className="auto-label">Alerta T-1</div>
            <div className="auto-sub">1 dia antes</div>
          </div>
          <div className="auto-status pending">Pendente</div>
        </div>
        <div className="automation-row">
          <div className="auto-icon bg-[#FCEBEB] text-[#A32D2D]"><Flame size={14} /></div>
          <div className="auto-text">
            <div className="auto-label">Alerta D-0</div>
            <div className="auto-sub">No dia do evento</div>
          </div>
          <div className="auto-status">Ativo</div>
        </div>
      </div>

      <div className="snapshot-section">
        <div className="panel-title">Snapshots de Arte</div>
        <div className="snapshot-card">
          <div className="snap-header">
            <span className="snap-tag bg-[#FBEAF0] text-[#993556]">Campanha Mês</span>
            <span className="snap-date border-none">{format(new Date(), 'MMM')}</span>
          </div>
          <div className="snap-title">{campaign?.title || 'Tema do Mês'}</div>
          {campaign?.image_url ? (
            <>
              <div className="snap-img-placeholder !border-none !p-0 overflow-hidden h-14 justify-start">
                 {/* show small preview if real image, else standard box */}
                 <img src={campaign.image_url} alt="Snap preview" className="w-full h-full object-cover rounded-md" />
              </div>
              <div className="snap-meta mt-2"><Check size={12} className="text-[#2ecc71]"/> Aprovado · Anexo no e-mail</div>
            </>
          ) : (
            <>
              <div className="snap-img-placeholder"><Upload size={14} /> Aguardando upload</div>
              <div className="snap-meta mt-2"><Clock size={12} /> Pendente aprovação</div>
            </>
          )}
        </div>
        
        {/* Placeholder for future specific events */}
        <div className="snapshot-card opacity-50 mt-2">
          <div className="snap-header">
            <span className="snap-tag bg-[#FAEEDA] text-[#854F0B]">Próx. Evento</span>
            <span className="snap-date">--/--</span>
          </div>
          <div className="snap-title">Arte Individual</div>
          <div className="snap-img-placeholder"><ImageIcon size={14} /> Sem anexo vinculado</div>
        </div>
      </div>
    </aside>
  );
}
