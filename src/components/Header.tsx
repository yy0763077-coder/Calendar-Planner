import { useState, useRef, useEffect } from 'react';
import type { Member } from '../data/calendarData';

interface HeaderProps {
  members: Member[];
  currentUser: Member | undefined;
  onMenuClick: () => void;
  onSwitchUser: (id: string) => void;
}

export default function Header({ members, currentUser, onMenuClick, onSwitchUser }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3">
      <button
        onClick={onMenuClick}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H17M3 10H17M3 15H17" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Current user avatar + switcher */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="w-10 h-10 rounded-full overflow-hidden border-[2.5px] transition-all hover:scale-105 active:scale-95"
          style={{ borderColor: currentUser?.color.bg ?? '#E2E8F0' }}
        >
          {currentUser ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="#94A3B8" strokeWidth="1.3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#94A3B8" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
          )}
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-12 w-52 bg-white rounded-xl overflow-hidden z-40"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
          >
            <div className="px-4 pt-3 pb-1.5">
              <p className="text-[10px] font-semibold text-gray-text uppercase tracking-wider">切换用户</p>
            </div>
            <div className="flex flex-col pb-2 px-1.5">
              {members.map((m) => {
                const isActive = m.id === currentUser?.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { onSwitchUser(m.id); setDropdownOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-pink-primary/10' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden border-2 shrink-0"
                      style={{ borderColor: isActive ? m.color.text : 'transparent' }}
                    >
                      <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm truncate ${isActive ? 'font-bold text-dark' : 'text-slate-text'}`}>
                      {m.name}
                    </span>
                    {isActive && (
                      <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7.5L5.5 11L12 3" stroke="#F6C6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
