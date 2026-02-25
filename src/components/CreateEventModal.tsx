import { useState, useEffect, useRef } from 'react';
import type { DisplayEvent } from '../data/calendarData';

export interface EditingEvent {
  event: DisplayEvent;
  day: number;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent?: EditingEvent | null;
  targetDay?: number | null;
  onSave: (title: string, editingEvent?: EditingEvent | null) => void;
  onDelete?: (editingEvent: EditingEvent) => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  editingEvent,
  targetDay,
  onSave,
  onDelete,
}: CreateEventModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!editingEvent;
  const displayDay = isEditing ? editingEvent.day : targetDay;

  useEffect(() => {
    if (isOpen) {
      setTitle(editingEvent?.event.title ?? '');
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
          setTimeout(() => textareaRef.current?.focus(), 350);
        });
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setVisible(false);
        setTitle('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, editingEvent]);

  if (!visible) return null;

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed, editingEvent);
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent && onDelete) {
      onDelete(editingEvent);
      onClose();
    }
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '8px 24px 40px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#171116', letterSpacing: '-0.02em', margin: 0 }}>
                {isEditing ? '编辑行程' : '创建行程'}
              </h2>
              {displayDay && (
                <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>— {displayDay} 日</span>
              )}
            </div>
            <button onClick={onClose} style={{ padding: 4, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', opacity: 0.6, letterSpacing: '0.05em', paddingBottom: 8 }}>
                行程内容
              </label>
              <textarea
                ref={textareaRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={3}
                placeholder="描述您的行程计划，例如：下午 3 点与设计团队在咖啡厅讨论新版 UI 设计稿。"
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '2px solid #F1F5F9',
                  borderRadius: 16,
                  padding: '16px 16px',
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: '#0F172A',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                style={{
                  width: '100%',
                  height: 48,
                  background: title.trim() ? '#F6C6EA' : '#F1F5F9',
                  borderRadius: 16,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: title.trim() ? 'pointer' : 'default',
                  opacity: title.trim() ? 1 : 0.5,
                  boxShadow: '0px 4px 6px -4px rgba(246,198,234,0.2), 0px 10px 15px -3px rgba(246,198,234,0.2)',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {isEditing ? '保存修改' : '创建行程'}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isEditing && (
                <button
                  onClick={handleDelete}
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 16,
                    border: '1px solid #FECACA',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    color: '#F87171',
                  }}
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <path d="M1 4H13M5 4V2H9V4M3 4V14H11V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 7V11M8.5 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>删除行程</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ height: 24, background: '#fff' }} />
      </div>
    </div>
  );
}
