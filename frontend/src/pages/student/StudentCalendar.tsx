import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen, Clock, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

export function StudentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/calendar/events');
        setEvents(res.data.events || []);
      } catch (err) {
        toast.error('Failed to load calendar events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Map events to dates
  const eventsByDate: Record<number, any[]> = {};
  events.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDate[day]) eventsByDate[day] = [];
      eventsByDate[day].push(e);
    }
  });

  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const renderCells = () => {
    const cells = [];
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2 min-h-[80px] bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-transparent"></div>);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = isCurrentMonth && today.getDate() === i;
      const hasEvents = eventsByDate[i] && eventsByDate[i].length > 0;
      const isSelected = selectedDate === i;

      cells.push(
        <div 
          key={i} 
          onClick={() => setSelectedDate(i)}
          className={`p-2 min-h-[80px] rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col
            ${isToday ? 'border-[#862fe7] bg-[#862fe7]/5' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'}
            ${isSelected ? 'ring-2 ring-[#862fe7] ring-offset-2 dark:ring-offset-slate-900' : ''}
          `}
        >
          {isToday && <div className="absolute top-0 right-0 w-8 h-8 bg-[#862fe7] rounded-bl-full -mr-2 -mt-2"></div>}
          <span className={`text-sm font-bold z-10 ${isToday ? 'text-[#862fe7]' : 'text-slate-700 dark:text-slate-300'}`}>{i}</span>
          
          <div className="mt-auto space-y-1">
            {hasEvents && eventsByDate[i].slice(0, 2).map((e, idx) => (
              <div key={idx} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400 truncate">
                {e.subject} Test
              </div>
            ))}
            {hasEvents && eventsByDate[i].length > 2 && (
              <div className="text-[10px] font-bold text-slate-400">+ {eventsByDate[i].length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Calendar View */}
      <Card className="xl:col-span-2 flex flex-col overflow-y-auto h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#862fe7]/10 text-[#862fe7] rounded-xl"><CalendarIcon size={24} /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">{monthNames[month]} {year}</h2>
              <p className="text-slate-500 text-sm font-medium">Academic Calendar & Schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={prevMonth} className="px-2"><ChevronLeft size={20} /></Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="outline" onClick={nextMonth} className="px-2"><ChevronRight size={20} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">{d}</div>
          ))}
          {renderCells()}
        </div>
      </Card>

      {/* Selected Day View */}
      <Card className="overflow-y-auto h-full">
        {selectedDate ? (
          <div>
            <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-2">{monthNames[month]} {selectedDate}, {year}</h3>
            <p className="text-slate-500 text-sm mb-6">Schedule for the day</p>
            
            {eventsByDate[selectedDate] && eventsByDate[selectedDate].length > 0 ? (
              <div className="space-y-4">
                {eventsByDate[selectedDate].map(event => (
                  <div key={event.id} className="p-4 rounded-2xl border-l-4 border-l-teal-500 bg-slate-50 dark:bg-slate-900 border-y border-r border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="violet">{event.subject}</Badge>
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Clock size={12} /> {event.duration}m</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white leading-tight mb-2">{event.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen size={14} /> <span>{event.total_questions} Questions</span>
                      <span>•</span>
                      <span>{event.difficulty} diff.</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8">
                <EmptyState icon={<CalendarIcon size={48} />} title="No events" message="You're free on this day!" />
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState icon={<CalendarIcon size={64} />} title="Select a date" message="Click on any date in the calendar to view its schedule and events." />
          </div>
        )}
      </Card>
    </div>
  );
}
