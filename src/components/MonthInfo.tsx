import { MONTH_NAMES } from '../data/calendarData';

interface MonthInfoProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onMonthClick: () => void;
}

export default function MonthInfo({ year, month, onPrev, onNext, onMonthClick }: MonthInfoProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button
          onClick={onPrev}
          style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onMonthClick}
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: 'rgba(15,23,42,0.6)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8,
          }}
        >
          {MONTH_NAMES[month - 1]} {year}
        </button>
        <button
          onClick={onNext}
          style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M1 1L7 7L1 13" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  );
}
