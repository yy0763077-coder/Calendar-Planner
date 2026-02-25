import { getFirstDayOfWeek, type DayData, type DisplayEvent } from '../data/calendarData';

interface DayCellProps {
  data: DayData | null;
  onEventClick: (event: DisplayEvent, day: number) => void;
  onDayClick: (day: number) => void;
}

function DayCell({ data, onEventClick, onDayClick }: DayCellProps) {
  if (!data) {
    return (
      <div
        className="relative flex-1 min-h-[84px] opacity-40"
        style={{
          background: 'rgba(248,250,252,0.3)',
          borderRight: '1px solid rgba(246,198,234,0.2)',
          borderBottom: '1px solid rgba(246,198,234,0.2)',
        }}
      />
    );
  }

  const dayColor = data.isSunday
    ? 'text-red-weekend'
    : data.isToday
    ? 'text-pink-primary'
    : 'text-dark';

  const lunarColor = data.isSolarTerm
    ? 'text-pink-primary/70 font-bold'
    : data.isHoliday
    ? 'text-red-weekend'
    : 'text-gray-text';

  return (
    <div
      className="relative flex-1 min-h-[84px] flex flex-col p-1 gap-0.5 cursor-pointer hover:bg-pink-primary/[0.03] transition-colors"
      style={{
        background: data.isToday ? 'rgba(246,198,234,0.05)' : undefined,
        borderRight: '1px solid rgba(246,198,234,0.2)',
        borderBottom: '1px solid rgba(246,198,234,0.2)',
      }}
      onClick={() => onDayClick(data.day)}
    >
      <div className="flex flex-col items-end px-0.5">
        <span className={`font-manrope text-[13px] font-bold ${dayColor}`}>
          {data.day}
        </span>
        {data.lunar && (
          <span className={`text-[7px] leading-tight ${lunarColor}`}>
            {data.lunar}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {data.events.map((event) => (
          <button
            key={event.id}
            className="rounded-sm px-1 text-left cursor-pointer hover:brightness-90 active:scale-95 transition-all"
            style={{ background: event.color }}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event, data.day);
            }}
          >
            <span
              className="text-[8px] leading-[13px] block truncate"
              style={{ color: event.textColor }}
            >
              {event.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface CalendarGridProps {
  year: number;
  month: number;
  days: DayData[];
  onEventClick: (event: DisplayEvent, day: number) => void;
  onDayClick: (day: number) => void;
}

export default function CalendarGrid({ year, month, days, onEventClick, onDayClick }: CalendarGridProps) {
  const firstDayOffset = getFirstDayOfWeek(year, month);

  const weeks: (DayData | null)[][] = [];
  let currentWeek: (DayData | null)[] = [];

  for (let i = 0; i < firstDayOffset; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="flex-1 overflow-y-auto px-3">
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(246,198,234,0.2)' }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex">
            {week.map((day, dayIndex) => (
              <DayCell key={dayIndex} data={day} onEventClick={onEventClick} onDayClick={onDayClick} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
