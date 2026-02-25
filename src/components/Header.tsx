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
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 12px 24px' }}>
      <button
        onClick={onMenuClick}
        style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5H17M3 10H17M3 15H17" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2.5px solid ${currentUser?.color.bg ?? '#E2E8F0'}`,
            cursor: 'pointer',
            padding: 0,
            background: 'transparent',
          }}
        >
          {currentUser ? (
            <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="#94A3B8" strokeWidth="1.3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#94A3B8" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
          )}
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 48,
              width: 200,
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              zIndex: 40,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ padding: '12px 16px 6px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>切换用户</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '0 6px 8px' }}>
              {members.map((m) => {
                const isActive = m.id === currentUser?.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { onSwitchUser(m.id); setDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: isActive ? 'rgba(246,198,234,0.1)' : 'transparent',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: `2px solid ${isActive ? m.color.text : 'transparent'}`,
                        flexShrink: 0,
                      }}
                    >
                      <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 400, color: isActive ? '#0F172A' : '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {m.name}
                    </span>
                    {isActive && (
                      <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 14 14" fill="none">
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
