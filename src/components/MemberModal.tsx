import { useState, useEffect, useRef } from 'react';
import type { Member } from '../data/calendarData';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentUserId: string;
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
  onSwitchUser: (id: string) => void;
}

export default function MemberModal({ isOpen, onClose, members, currentUserId, onAddMember, onRemoveMember, onSwitchUser }: MemberModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAdding(false);
      setNewName('');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (adding) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [adding]);

  if (!visible) return null;

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddMember(trimmed);
    setNewName('');
    setAdding(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: animating ? 'rgba(15,23,42,0.4)' : 'transparent',
        backdropFilter: animating ? 'blur(1px)' : 'none',
        transition: 'background 0.3s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          transform: animating ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-out',
          boxShadow: '0px -4px 20px 0px rgba(0,0,0,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 48, height: 6, borderRadius: 3, background: '#E2E8F0' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 24px 40px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#171116', letterSpacing: '-0.02em', margin: 0 }}>成员管理</h2>
            <button onClick={onClose} style={{ padding: 4, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {members.map((m) => {
              const isCurrent = m.id === currentUserId;
              return (
                <div
                  key={m.id}
                  onClick={() => onSwitchUser(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: isCurrent ? 'rgba(246,198,234,0.1)' : '#F8FAFC',
                    boxShadow: isCurrent ? 'inset 0 0 0 1px rgba(246,198,234,0.3)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `2px solid ${isCurrent ? m.color.text : '#fff'}`,
                      backgroundColor: m.color.bg,
                      flexShrink: 0,
                    }}
                  >
                    <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                      {isCurrent && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#F6C6EA', background: 'rgba(246,198,234,0.15)', padding: '1px 6px', borderRadius: 12 }}>当前</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: m.color.bg, border: `1px solid ${m.color.text}` }} />
                      <span style={{ fontSize: 10, color: '#94A3B8' }}>专属颜色</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveMember(m.id); }}
                    style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', flexShrink: 0 }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M2 10L10 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              );
            })}
          </div>

          {adding ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="输入成员名称"
                style={{
                  flex: 1,
                  height: 44,
                  background: '#F8FAFC',
                  border: '2px solid #F1F5F9',
                  borderRadius: 12,
                  padding: '0 12px',
                  fontSize: 14,
                  color: '#0F172A',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                style={{
                  height: 44,
                  padding: '0 20px',
                  background: newName.trim() ? '#F6C6EA' : '#F1F5F9',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 12,
                  border: 'none',
                  cursor: newName.trim() ? 'pointer' : 'default',
                  opacity: newName.trim() ? 1 : 0.5,
                }}
              >
                添加
              </button>
              <button
                onClick={() => { setAdding(false); setNewName(''); }}
                style={{ height: 44, padding: '0 12px', color: '#94A3B8', fontSize: 14, borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: '2px dashed #F1F5F9',
                background: 'transparent',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 14, fontWeight: 600 }}>新增成员</span>
            </button>
          )}
        </div>

        <div style={{ height: 24, background: '#fff' }} />
      </div>
    </div>
  );
}
