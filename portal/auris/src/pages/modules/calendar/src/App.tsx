import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Logs from './components/Logs';
import Campaigns from './components/Campaigns';
import Contacts from './components/Contacts';
import CalendarGigante from './components/CalendarGigante';
import MotorEnvios from './components/MotorEnvios';
import { Building2, CalendarDays, BarChart2, Palette, Users, History, Settings as SettingsIcon, ChevronDown, Download, Plus, Filter, Heart, Rocket } from 'lucide-react';
import RightPanel from './components/RightPanel';

export type TabT = 'dashboard' | 'campaigns' | 'calendar' | 'contacts' | 'logs' | 'settings' | 'motor';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabT>('calendar');

  return (
    <>
      {/* Background orbs */}
      <div className="blur-orb-1 mix-blend-screen"></div>
      <div className="blur-orb-2 mix-blend-screen"></div>

      <div className="shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-name"><Building2 size={16} className="mr-2" />Aliança Tur</div>
            <div className="brand-sub">Motor de Automação</div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Navegação</div>
            <div className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><CalendarDays size={16} /> Calendário</div>
            <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><BarChart2 size={16} /> Visão Geral</div>
            <div className={`nav-item ${activeTab === 'motor' ? 'active' : ''}`} onClick={() => setActiveTab('motor')}><Rocket size={16} /> Motor de Envios</div>
            <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
              <History size={16} /> Digest & Logs <span className="nav-badge text-[9px] px-1.5 py-0">i</span>
            </div>
          </div>

          <div className="nav-section mt-2">
            <div className="nav-label">Configuração</div>
            <div className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}><Users size={16} /> Personas/Setores</div>
            <div className={`nav-item ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}><Palette size={16} /> Temas Mensais</div>
            <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><SettingsIcon size={16} /> Sistema</div>
          </div>

          <div className="sidebar-footer">
            <div className="persona-pill">
              <div className="persona-avatar text-[10px]">ADM</div>
              <div>
                <div className="persona-name">Administrador</div>
                <div className="persona-role">Acesso: Editor</div>
              </div>
              <ChevronDown size={14} className="ml-auto text-white/50" />
            </div>
          </div>
        </aside>

        <main className="main flex flex-col flex-1">
          <div className="content-area flex-1">
            {/* The main content area where components render. We let them take full height */}
            <div className="calendar-wrap w-full">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'campaigns' && <Campaigns />}
              {activeTab === 'calendar' && <CalendarGigante />}
              {activeTab === 'contacts' && <Contacts />}
              {activeTab === 'settings' && <Settings />}
              {activeTab === 'logs' && <Logs />}
              {activeTab === 'motor' && <MotorEnvios />}
            </div>

            {/* Right Panel is fixed and contextual. We can show it globally */}
            <RightPanel />
          </div>

          <footer className="w-full text-center py-4 mt-auto">
            <p style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '11px', fontWeight: 500 }}>
              Auris Corporate Calendar • Uma ferramenta Auris Toolbox
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
