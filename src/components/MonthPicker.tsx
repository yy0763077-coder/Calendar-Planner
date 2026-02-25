import { useState, useEffect } from 'react';
import { MONTH_NAMES } from '../data/calendarData';

interface MonthPickerProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
}

export default function MonthPicker({ isOpen, onClose, year, month, onSelect }: MonthPickerProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  useEffect(() => {
    if (isOpen) {
      setPickerYear(year);
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, year]);

  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center transition-colors duration-300 ${
        animating ? 'bg-[rgba(15,23,42,0.4)]' : 'bg-transparent'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-[calc(100%-24px)] mx-3 transition-all duration-300 ease-out ${
          animating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ boxShadow: '0px 20px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <button
            onClick={() => setPickerYear((y) => y - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="font-manrope text-lg font-bold text-dark">{pickerYear} 年</span>
          <button
            onClick={() => setPickerYear((y) => y + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 pb-5">
          {MONTH_NAMES.map((name, i) => {
            const m = i + 1;
            const isCurrent = pickerYear === year && m === month;
            return (
              <button
                key={m}
                onClick={() => { onSelect(pickerYear, m); onClose(); }}
                className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                  isCurrent
                    ? 'bg-pink-primary text-white'
                    : 'text-dark hover:bg-pink-primary/10'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
