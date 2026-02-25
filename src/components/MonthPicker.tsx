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
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: animating ? 'rgba(15,23,42,0.4)' : 'transparent',
        transition: 'background 0.3s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          width: 'calc(100% - 48px)',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.15)',
          transform: animating ? 'scale(1)' : 'scale(0.95)',
          opacity: animating ? 1 : 0,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px' }}>
          <button
            onClick={() => setPickerYear((y) => y - 1)}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{pickerYear} 年</span>
          <button
            onClick={() => setPickerYear((y) => y + 1)}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 20px 20px' }}>
          {MONTH_NAMES.map((name, i) => {
            const m = i + 1;
            const isCurrent = pickerYear === year && m === month;
            return (
              <button
                key={m}
                onClick={() => { onSelect(pickerYear, m); onClose(); }}
                style={{
                  padding: '12px 0',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: isCurrent ? '#F6C6EA' : 'transparent',
                  color: isCurrent ? '#fff' : '#0F172A',
                }}
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
