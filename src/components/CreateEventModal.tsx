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

        <div className="flex flex-col gap-5 px-5 pt-2 pb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-bold text-[#171116] tracking-tight">
                {isEditing ? '编辑行程' : '创建行程'}
              </h2>
              {displayDay && (
                <span className="text-sm text-gray-text font-medium">— {displayDay} 日</span>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-dark tracking-widest uppercase opacity-60 pb-2">
                行程内容
              </label>
              <textarea
                ref={textareaRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-bg-light border-2 border-border-light rounded-2xl px-4 py-4 text-base leading-relaxed text-dark placeholder:text-gray-text resize-none focus:outline-none focus:border-pink-primary/40 transition-colors"
                rows={3}
                placeholder="描述您的行程计划，例如：下午 3 点与设计团队在咖啡厅讨论新版 UI 设计稿。"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="relative w-full h-12 bg-pink-primary rounded-2xl flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: '0px 4px 6px -4px rgba(246,198,234,0.2), 0px 10px 15px -3px rgba(246,198,234,0.2)',
                  }}
                />
                <span className="relative text-base font-bold text-white">
                  {isEditing ? '保存修改' : '创建行程'}
                </span>
                <svg className="relative" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isEditing && (
                <button
                  onClick={handleDelete}
                  className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 border border-red-200 text-red-weekend hover:bg-red-50 active:scale-[0.98] transition-all"
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4H13M5 4V2H9V4M3 4V14H11V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 7V11M8.5 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm font-bold">删除行程</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-6 bg-white" />
      </div>
    </div>
  );
}
