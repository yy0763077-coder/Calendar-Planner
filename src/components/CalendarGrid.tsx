import { getFirstDayOfWeek, type DayData, type DisplayEvent } from '../data/calendarData';

const TODAY_BG = '#E8F5E9';

interface DayCellProps {
  data: DayData | null;
  onEventClick: (event: DisplayEvent, day: number) => void;
  onDayClick: (day: number) => void;
}

function DayCell({ data, onEventClick, onDayClick }: DayCellProps) {
  if (!data) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 84,
          opacity: 0.4,
          background: 'rgba(248,250,252,0.3)',
          borderRight: '1px solid rgba(246,198,234,0.2)',
          borderBottom: '1px solid rgba(246,198,234,0.2)',
        }}
      />
    );
  }

  const dayColor = data.isSunday
    ? '#F87171'
    : data.isToday
    ? '#2E7D32'
    : '#0F172A';

  const lunarColor = data.isSolarTerm
    ? '#F6C6EA'
    : data.isHoliday
    ? '#F87171'
    : '#94A3B8';

  return (
    <div
      style={{
        flex: 1,
        minHeight: 84,
        display: 'flex',
        flexDirection: 'column',
        padding: 4,
        gap: 2,
        cursor: 'pointer',
        position: 'relative',
        background: data.isToday ? TODAY_BG : undefined,
        borderRight: '1px solid rgba(246,198,234,0.2)',
        borderBottom: '1px solid rgba(246,198,234,0.2)',
      }}
      onClick={() => onDayClick(data.day)}
    >
      {/* "休" badge */}
      {data.isStatutoryHoliday && (
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            fontSize: 8,
            fontWeight: 700,
            color: '#fff',
            background: '#F87171',
            borderRadius: 3,
            padding: '0px 3px',
            lineHeight: '14px',
          }}
        >
          休
        </span>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '0 2px' }}>
        <span
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: dayColor,
          }}
        >
          {data.day}
        </span>
        {data.lunar && (
          <span
            style={{
              fontSize: 7,
              lineHeight: '10px',
              color: lunarColor,
              fontWeight: data.isSolarTerm ? 700 : 400,
            }}
          >
            {data.lunar}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.events.map((event) => (
          <button
            key={event.id}
            style={{
              background: event.color,
              borderRadius: 2,
              padding: '0 4px',
              textAlign: 'left',
              cursor: 'pointer',
              border: 'none',
              display: 'block',
              width: '100%',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event, data.day);
            }}
          >
            <span
              style={{
                fontSize: 8,
                lineHeight: '13px',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: event.textColor,
              }}
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
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(246,198,234,0.2)' }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={{ display: 'flex' }}>
            {week.map((day, dayIndex) => (
              <DayCell key={dayIndex} data={day} onEventClick={onEventClick} onDayClick={onDayClick} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
