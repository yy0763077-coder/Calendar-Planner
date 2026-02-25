import { WEEKDAYS } from '../data/calendarData';

export default function WeekdayBar() {
  return (
    <div className="pt-3 px-3">
      <div
        className="flex bg-[rgba(248,246,247,0.5)] rounded-lg"
        style={{ borderTop: '1px solid rgba(246,198,234,0.1)', borderBottom: '1px solid rgba(246,198,234,0.1)' }}
      >
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="flex-1 flex items-center justify-center py-2">
            <span
              className={`text-[11px] font-bold ${
                i === 0 ? 'text-red-weekend' : 'text-slate-text'
              }`}
            >
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
