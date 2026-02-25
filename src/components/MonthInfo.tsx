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
    <section className="flex flex-col gap-1 px-3 py-1">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrev}
          className="flex items-center justify-center hover:bg-gray-100 rounded-full w-8 h-8 transition-colors"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1L1 7L7 13" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onMonthClick}
          className="font-manrope text-xl font-bold text-dark/60 hover:text-dark/80 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
        >
          {MONTH_NAMES[month - 1]} {year}
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center hover:bg-gray-100 rounded-full w-8 h-8 transition-colors"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L1 13" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  );
}
