import { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import MonthInfo from './components/MonthInfo';
import WeekdayBar from './components/WeekdayBar';
import CalendarGrid from './components/CalendarGrid';
import BottomNav from './components/BottomNav';
import CreateEventModal, { type EditingEvent } from './components/CreateEventModal';
import MonthPicker from './components/MonthPicker';
import MemberModal from './components/MemberModal';
import {
  DEFAULT_MEMBERS,
  DEFAULT_EVENTS,
  EVENT_COLORS,
  generateCalendarDays,
  type Member,
  type StoredEvent,
  type DisplayEvent,
} from './data/calendarData';

const AVATAR_SEEDS = ['Luna', 'Zoe', 'Max', 'Mia', 'Leo', 'Ivy', 'Sam', 'Ava', 'Kai', 'Noa'];
let nextEventId = 100;
let nextMemberId = 100;

export default function App() {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(6);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [events, setEvents] = useState<StoredEvent[]>(DEFAULT_EVENTS);
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_MEMBERS[0].id);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null);
  const [targetDay, setTargetDay] = useState<number | null>(null);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const currentUser = members.find((m) => m.id === currentUserId);

  const days = useMemo(
    () => generateCalendarDays(year, month, events, members),
    [year, month, events, members],
  );

  const handlePrevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 1) { setYear((y) => y - 1); return 12; }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 12) { setYear((y) => y + 1); return 1; }
      return m + 1;
    });
  }, []);

  const handleMonthSelect = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  const handleDayClick = useCallback((day: number) => {
    setEditingEvent(null);
    setTargetDay(day);
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((event: DisplayEvent, day: number) => {
    setEditingEvent({ event, day });
    setTargetDay(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingEvent(null);
    setTargetDay(null);
  }, []);

  const handleSave = useCallback((title: string, editing?: EditingEvent | null) => {
    if (editing) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editing.event.id ? { ...e, title } : e)),
      );
    } else if (targetDay) {
      setEvents((prev) => [
        ...prev,
        { id: `e${nextEventId++}`, title, memberId: currentUserId, year, month, day: targetDay },
      ]);
    }
  }, [targetDay, year, month, members]);

  const handleDelete = useCallback((editing: EditingEvent) => {
    setEvents((prev) => prev.filter((e) => e.id !== editing.event.id));
  }, []);

  const handleAddMember = useCallback((name: string) => {
    const colorIdx = members.length % EVENT_COLORS.length;
    const seedIdx = members.length % AVATAR_SEEDS.length;
    const newMember: Member = {
      id: `m${nextMemberId++}`,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${AVATAR_SEEDS[seedIdx]}`,
      color: EVENT_COLORS[colorIdx],
    };
    setMembers((prev) => [...prev, newMember]);
  }, [members.length]);

  const handleRemoveMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <div className="relative w-full max-w-[375px] h-[812px] bg-white flex flex-col overflow-hidden shadow-xl rounded-[40px]">
      <Header
        members={members}
        currentUser={currentUser}
        onMenuClick={() => setMemberModalOpen(true)}
        onSwitchUser={setCurrentUserId}
      />
      <MonthInfo
        year={year}
        month={month}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
        onMonthClick={() => setMonthPickerOpen(true)}
      />
      <WeekdayBar />
      <CalendarGrid
        year={year}
        month={month}
        days={days}
        onEventClick={handleEventClick}
        onDayClick={handleDayClick}
      />
      <BottomNav />

      <CreateEventModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editingEvent={editingEvent}
        targetDay={targetDay}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <MonthPicker
        isOpen={monthPickerOpen}
        onClose={() => setMonthPickerOpen(false)}
        year={year}
        month={month}
        onSelect={handleMonthSelect}
      />
      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        members={members}
        currentUserId={currentUserId}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onSwitchUser={setCurrentUserId}
      />
    </div>
  );
}
