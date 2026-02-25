export interface Member {
  id: string;
  name: string;
  avatar: string;
  color: { bg: string; text: string };
}

export interface StoredEvent {
  id: string;
  title: string;
  memberId: string;
  year: number;
  month: number;
  day: number;
}

export interface DisplayEvent {
  id: string;
  title: string;
  memberId: string;
  color: string;
  textColor: string;
}

export interface DayData {
  day: number;
  lunar: string;
  isWeekend: boolean;
  isSunday: boolean;
  isToday?: boolean;
  isSolarTerm?: boolean;
  isHoliday?: boolean;
  isStatutoryHoliday?: boolean;
  events: DisplayEvent[];
}

export const EVENT_COLORS = [
  { bg: 'rgba(181,232,224,0.4)', text: '#115E59' },
  { bg: 'rgba(208,225,249,0.4)', text: '#1E40AF' },
  { bg: 'rgba(246,198,234,0.3)', text: '#9D174D' },
  { bg: 'rgba(255,214,165,0.4)', text: '#9A3412' },
  { bg: 'rgba(226,209,249,0.4)', text: '#6B21A8' },
];

export const SYSTEM_COLOR = { bg: 'rgba(246,198,234,0.2)', text: '#BE185D' };
export const SYSTEM_MEMBER_ID = '_system';

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export const MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: '小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', color: EVENT_COLORS[0] },
  { id: 'm2', name: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', color: EVENT_COLORS[1] },
];

export const DEFAULT_EVENTS: StoredEvent[] = [
  { id: 'e1', title: '团队聚餐', memberId: 'm1', year: 2024, month: 6, day: 1 },
  { id: 'e2', title: '方案评审', memberId: 'm2', year: 2024, month: 6, day: 3 },
  { id: 'e3', title: '产品周会', memberId: 'm1', year: 2024, month: 6, day: 5 },
  { id: 'e4', title: '客户拜访', memberId: 'm2', year: 2024, month: 6, day: 5 },
  { id: 'e5', title: '版本发布', memberId: 'm1', year: 2024, month: 6, day: 7 },
  { id: 'e6', title: '法定假期', memberId: SYSTEM_MEMBER_ID, year: 2024, month: 6, day: 10 },
];

// 中国法定节假日（休息日）
const STATUTORY_HOLIDAYS: Record<string, number[]> = {
  '2024-1': [1],
  '2024-2': [10, 11, 12, 13, 14, 15, 16, 17],
  '2024-4': [4, 5, 6],
  '2024-5': [1, 2, 3, 4, 5],
  '2024-6': [8, 9, 10],
  '2024-9': [15, 16, 17],
  '2024-10': [1, 2, 3, 4, 5, 6, 7],
  '2025-1': [1, 28, 29, 30, 31],
  '2025-2': [1, 2, 3, 4],
  '2025-4': [4, 5, 6],
  '2025-5': [1, 2, 3, 4, 5],
  '2025-6': [31],
  '2025-10': [1, 2, 3, 4, 5, 6, 7, 8],
  '2026-1': [1, 2, 3],
  '2026-2': [17, 18, 19, 20, 21, 22, 23],
  '2026-4': [5, 6, 7],
  '2026-5': [1, 2, 3, 4, 5],
  '2026-6': [19, 20, 21],
  '2026-9': [25, 26, 27],
  '2026-10': [1, 2, 3, 4, 5, 6, 7],
};

function isStatutoryHoliday(year: number, month: number, day: number): boolean {
  const key = `${year}-${month}`;
  return STATUTORY_HOLIDAYS[key]?.includes(day) ?? false;
}

const JUNE_2024_LUNAR: Record<number, { lunar: string; isSolarTerm?: boolean; isHoliday?: boolean }> = {
  1: { lunar: '廿五' }, 2: { lunar: '廿六' }, 3: { lunar: '廿七' }, 4: { lunar: '廿八' },
  5: { lunar: '芒种', isSolarTerm: true }, 6: { lunar: '初一' }, 7: { lunar: '初二' },
  8: { lunar: '初三' }, 9: { lunar: '初四' }, 10: { lunar: '端午节', isHoliday: true },
  11: { lunar: '初六' }, 12: { lunar: '初七' }, 13: { lunar: '初八' }, 14: { lunar: '初九' },
  15: { lunar: '初十' }, 16: { lunar: '十一' }, 17: { lunar: '十二' }, 18: { lunar: '十三' },
  19: { lunar: '十四' }, 20: { lunar: '十五' }, 21: { lunar: '夏至', isSolarTerm: true },
  22: { lunar: '十七' }, 23: { lunar: '十八' }, 24: { lunar: '十九' }, 25: { lunar: '二十' },
  26: { lunar: '廿一' }, 27: { lunar: '廿二' }, 28: { lunar: '廿三' }, 29: { lunar: '廿四' },
  30: { lunar: '廿五' },
};

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function getMemberColor(memberId: string, members: Member[]): { bg: string; text: string } {
  if (memberId === SYSTEM_MEMBER_ID) return SYSTEM_COLOR;
  const member = members.find((m) => m.id === memberId);
  return member?.color ?? EVENT_COLORS[0];
}

export function generateCalendarDays(
  year: number,
  month: number,
  events: StoredEvent[],
  members: Member[],
): DayData[] {
  const totalDays = getDaysInMonth(year, month);
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();
  const isJune2024 = year === 2024 && month === 6;

  const monthEvents = events.filter((e) => e.year === year && e.month === month);

  const days: DayData[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    const lunarInfo = isJune2024 ? JUNE_2024_LUNAR[d] : undefined;

    const dayEvents: DisplayEvent[] = monthEvents
      .filter((e) => e.day === d)
      .map((e) => {
        const c = getMemberColor(e.memberId, members);
        return { id: e.id, title: e.title, memberId: e.memberId, color: c.bg, textColor: c.text };
      });

    days.push({
      day: d,
      lunar: lunarInfo?.lunar ?? '',
      isWeekend: dow === 0 || dow === 6,
      isSunday: dow === 0,
      isToday: year === todayYear && month === todayMonth && d === todayDay,
      isSolarTerm: lunarInfo?.isSolarTerm,
      isHoliday: lunarInfo?.isHoliday,
      isStatutoryHoliday: isStatutoryHoliday(year, month, d),
      events: dayEvents,
    });
  }
  return days;
}
