import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter, Download, Heart } from "lucide-react";
import EventModal from "./EventModal";

export default function CalendarGigante() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  
  // Previous Month
  const prevMonthDays = getDaysInMonth(month - 1 < 0 ? 11 : month - 1, month - 1 < 0 ? year - 1 : year);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleAddEvent = (day: number) => {
    // Format YYYY-MM-DD
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dStr);
    setIsModalOpen(true);
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Use the themes for the badge
  const monthThemes: Record<number, string> = {
    0: "Janeiro Branco",
    4: "Maio Amarelo",
    6: "Julho Amarelo",
    9: "Outubro Rosa",
    10: "Novembro Azul",
  };

  const currentTheme = monthThemes[month] || "Mês Padrão";

  const colorMap: Record<string, string> = {
    blue: "chip-blue",
    teal: "chip-teal",
    amber: "chip-amber",
    purple: "chip-purple",
    red: "chip-coral",
    gray: "chip-blue opacity-70",
  };

  // Get today info
  const today = new Date();
  const isCurrentMonthDate = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="layout-topbar">
        <div className="month-nav">
          <button onClick={prevMonth} aria-label="Mês anterior"><ChevronLeft size={16} /></button>
          <div className="month-title">{monthNames[month]} {year}</div>
          <button onClick={nextMonth} aria-label="Próximo mês"><ChevronRight size={16} /></button>
        </div>
        
        {monthThemes[month] && (
          <div className="theme-badge">
            <Heart size={12} className="text-[#ff69b4]" fill={month === 9 ? "#ff69b4" : "none"}/> 
            {currentTheme}
          </div>
        )}
        
        <div className="topbar-actions">
          <button className="btn-sm"><Filter size={14} /> Filtrar</button>
          <button className="btn-sm"><Download size={14} /> Exportar</button>
          <button className="btn-sm btn-primary" onClick={() => {
            setSelectedDateStr("");
            setIsModalOpen(true);
          }}>
            <Plus size={14} /> Novo Evento
          </button>
        </div>
      </div>

      <div className="calendar-wrap">
        <div className="cal-grid-header">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="cal-dow">{d}</div>
          ))}
        </div>
        
        <div className="cal-grid">
          {Array.from({ length: firstDay }).map((_, i) => (
             <div key={`empty-${i}`} className="cal-day other-month">
               <div className="day-num">{prevMonthDays - firstDay + 1 + i}</div>
             </div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
             const day = i + 1;
             const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
             
             // Filter events for this day
             const dayEvents = events.filter(e => e.event_date === dStr);
             const isToday = isCurrentMonthDate && day === todayDate;

             return (
               <div 
                 key={day} 
                 className={`cal-day ${isToday ? 'today' : ''}`}
                 onMouseEnter={() => setHoveredDay(day)}
                 onMouseLeave={() => setHoveredDay(null)}
                 onClick={() => handleAddEvent(day)}
               >
                 <div className="day-num">
                   {isToday ? (
                     <div className="today-dot"><span>{day}</span></div>
                   ) : (
                     <>{day}</>
                   )}
                 </div>
                 
                 <div className="flex flex-col flex-1 gap-[2px] overflow-hidden">
                   {dayEvents.map((ev, idx) => {
                     // Check T-2 logic: if event is published, and it's 2 days from today, it has a dot
                     const evDate = new Date(ev.event_date);
                     evDate.setDate(evDate.getDate() - 2);
                     const dtStr = `${evDate.getFullYear()}-${String(evDate.getMonth() + 1).padStart(2, '0')}-${String(evDate.getDate()).padStart(2, '0')}`;
                     const hasT2 = ev.status === 'published'; // just conceptual marker for UI
                     
                     return (
                       <div 
                          key={idx} 
                          className={`event-chip ${colorMap[ev.color_tag] || 'chip-blue'} ${ev.status === 'draft' ? 'chip-draft' : ''}`}
                          title={ev.title}
                          onClick={(e) => { e.stopPropagation(); /* edit event... but we don't have it exposed here easily without a separate func, will just use global 'add' for now or handle Edit */ }}
                        >
                         {ev.title}
                         {hasT2 && idx === 0 && <div className="t2-dot" title="Alerta automático agendado" />}
                       </div>
                     )
                   })}
                 </div>

                 {hoveredDay === day && (
                   <div className="absolute inset-0 flex items-center justify-center bg-[#042c53b3] backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded">
                      <button className="btn-sm btn-primary border-none text-[11px] px-2 py-1" title="Adicionar Evento">
                        <Plus size={14} /> Novo
                      </button>
                   </div>
                 )}
               </div>
             );
          })}
          
          {/* Fill remaining days to keep grid uniform if necessary, though grid-auto-rows handles most. Let's add up to 42 cells total */}
          {Array.from({ length: 42 - (firstDay + daysInMonth) }).map((_, i) => (
             <div key={`next-empty-${i}`} className="cal-day other-month">
               <div className="day-num">{i + 1}</div>
             </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <EventModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={fetchEvents}
          eventData={{ event_date: selectedDateStr }}
        />
      )}
    </div>
  );
}
