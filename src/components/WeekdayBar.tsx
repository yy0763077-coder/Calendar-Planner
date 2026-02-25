import { WEEKDAYS } from '../data/calendarData';

export default function WeekdayBar() {
  return (
    <div style={{ paddingTop: 12, paddingLeft: 16, paddingRight: 16 }}>
      <div
        style={{
          display: 'flex',
          background: 'rgba(248,246,247,0.5)',
          borderRadius: 8,
          borderTop: '1px solid rgba(246,198,234,0.1)',
          borderBottom: '1px solid rgba(246,198,234,0.1)',
        }}
      >
        {WEEKDAYS.map((day, i) => (
          <div key={day} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: i === 0 ? '#F87171' : '#64748B',
              }}
            >
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
