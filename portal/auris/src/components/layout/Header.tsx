import { Bell, Bot } from 'lucide-react';

interface HeaderProps {
  onToggleAI: () => void;
  onToggleProfile: () => void;
}

export function Header({ onToggleAI, onToggleProfile }: HeaderProps) {
  return (
    <header
      className="flex-shrink-0 flex items-center justify-between relative z-50"
      style={{ padding: '16px 24px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
            <path d="M9 2L15 6V12L9 16L3 12V6L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="9" cy="9" r="2" fill="white" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">
          Auris <span className="text-[#60a5fa]">Toolbox</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleAI}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white/75 transition-colors hover:bg-white/[0.13]"
          style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)' }}
        >
          <Bot className="w-[17px] h-[17px]" />
        </button>

        <button
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white/75 relative transition-colors hover:bg-white/[0.13]"
          style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)' }}
        >
          <Bell className="w-[17px] h-[17px]" />
          <div
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3b82f6]"
            style={{ border: '1.5px solid #0a1628' }}
          />
        </button>

        <button
          onClick={onToggleProfile}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', border: '2px solid rgba(255,255,255,0.2)' }}
        >
          JS
        </button>
      </div>
    </header>
  );
}
