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
      className={`absolute inset-0 z-50 flex flex-col justify-end transition-colors duration-300 ${
        animating ? 'bg-[rgba(15,23,42,0.4)]' : 'bg-transparent'
      }`}
      style={{ backdropFilter: animating ? 'blur(1px)' : 'none' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-t-[20px] transition-transform duration-300 ease-out ${
          animating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ boxShadow: '0px -4px 20px 0px rgba(0,0,0,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="flex flex-col gap-4 px-5 pt-2 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#171116] tracking-tight">成员管理</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {members.map((m) => {
              const isCurrent = m.id === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent ? 'bg-pink-primary/10 ring-1 ring-pink-primary/30' : 'bg-bg-light hover:bg-gray-100'
                  }`}
                  onClick={() => onSwitchUser(m.id)}
                >
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden border-2 shrink-0"
                    style={{ borderColor: isCurrent ? m.color.text : 'white', backgroundColor: m.color.bg }}
                  >
                    <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-dark truncate">{m.name}</p>
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-pink-primary bg-pink-primary/15 px-1.5 py-0.5 rounded-full shrink-0">当前</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color.bg, border: `1px solid ${m.color.text}` }} />
                      <span className="text-[10px] text-gray-text">专属颜色</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveMember(m.id); }}
                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-text hover:text-red-weekend transition-colors shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M2 10L10 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              );
            })}
          </div>

          {adding ? (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 h-11 bg-bg-light border-2 border-border-light rounded-xl px-3 text-sm text-dark placeholder:text-gray-text focus:outline-none focus:border-pink-primary/40 transition-colors"
                placeholder="输入成员名称"
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="h-11 px-5 bg-pink-primary text-white text-sm font-bold rounded-xl hover:brightness-95 active:scale-95 transition-all disabled:opacity-50"
              >
                添加
              </button>
              <button
                onClick={() => { setAdding(false); setNewName(''); }}
                className="h-11 px-3 text-gray-text text-sm rounded-xl hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 border-2 border-dashed border-border-light text-slate-text hover:border-pink-primary/40 hover:text-pink-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-sm font-semibold">新增成员</span>
            </button>
          )}
        </div>

        <div className="h-6 bg-white" />
      </div>
    </div>
  );
}
