var EVENT_COLORS = [
  { bg: 'rgba(181,232,224,0.4)', text: '#115E59' },
  { bg: 'rgba(208,225,249,0.4)', text: '#1E40AF' },
  { bg: 'rgba(246,198,234,0.3)', text: '#9D174D' },
  { bg: 'rgba(255,214,165,0.4)', text: '#9A3412' },
  { bg: 'rgba(226,209,249,0.4)', text: '#6B21A8' },
];

var SYSTEM_COLOR = { bg: 'rgba(246,198,234,0.2)', text: '#BE185D' };
var SYSTEM_MEMBER_ID = '_system';

var WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

var MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

var DEFAULT_MEMBERS = [
  { id: 'm1', name: '小明', color: EVENT_COLORS[0] },
  { id: 'm2', name: '小红', color: EVENT_COLORS[1] },
];

var DEFAULT_EVENTS = [];

var STATUTORY_HOLIDAYS = {
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

var HOLIDAY_NAMES = {
  '2024-1-1': '元旦',
  '2024-2-10': '春节', '2024-2-11': '春节', '2024-2-12': '春节', '2024-2-13': '春节',
  '2024-2-14': '春节', '2024-2-15': '春节', '2024-2-16': '春节', '2024-2-17': '春节',
  '2024-4-4': '清明节', '2024-4-5': '清明节', '2024-4-6': '清明节',
  '2024-5-1': '劳动节', '2024-5-2': '劳动节', '2024-5-3': '劳动节', '2024-5-4': '劳动节', '2024-5-5': '劳动节',
  '2024-6-8': '端午节', '2024-6-9': '端午节', '2024-6-10': '端午节',
  '2024-9-15': '中秋节', '2024-9-16': '中秋节', '2024-9-17': '中秋节',
  '2024-10-1': '国庆节', '2024-10-2': '国庆节', '2024-10-3': '国庆节', '2024-10-4': '国庆节',
  '2024-10-5': '国庆节', '2024-10-6': '国庆节', '2024-10-7': '国庆节',
  '2025-1-1': '元旦', '2025-1-28': '春节', '2025-1-29': '春节', '2025-1-30': '春节', '2025-1-31': '春节',
  '2025-2-1': '春节', '2025-2-2': '春节', '2025-2-3': '春节', '2025-2-4': '春节',
  '2025-4-4': '清明节', '2025-4-5': '清明节', '2025-4-6': '清明节',
  '2025-5-1': '劳动节', '2025-5-2': '劳动节', '2025-5-3': '劳动节', '2025-5-4': '劳动节', '2025-5-5': '劳动节',
  '2025-6-31': '端午节',
  '2025-10-1': '国庆节', '2025-10-2': '国庆节', '2025-10-3': '国庆节', '2025-10-4': '国庆节',
  '2025-10-5': '国庆节', '2025-10-6': '国庆节', '2025-10-7': '国庆节', '2025-10-8': '国庆节',
  '2026-1-1': '元旦', '2026-1-2': '元旦', '2026-1-3': '元旦',
  '2026-2-17': '春节', '2026-2-18': '春节', '2026-2-19': '春节', '2026-2-20': '春节',
  '2026-2-21': '春节', '2026-2-22': '春节', '2026-2-23': '春节',
  '2026-4-5': '清明节', '2026-4-6': '清明节', '2026-4-7': '清明节',
  '2026-5-1': '劳动节', '2026-5-2': '劳动节', '2026-5-3': '劳动节', '2026-5-4': '劳动节', '2026-5-5': '劳动节',
  '2026-6-19': '端午节', '2026-6-20': '端午节', '2026-6-21': '端午节',
  '2026-9-25': '中秋节', '2026-9-26': '中秋节', '2026-9-27': '中秋节',
  '2026-10-1': '国庆节', '2026-10-2': '国庆节', '2026-10-3': '国庆节', '2026-10-4': '国庆节',
  '2026-10-5': '国庆节', '2026-10-6': '国庆节', '2026-10-7': '国庆节',
};

function getHolidayName(year, month, day) {
  var key = year + '-' + month + '-' + day;
  return HOLIDAY_NAMES[key] || '';
}

var JUNE_2024_LUNAR = {
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

function isStatutoryHoliday(year, month, day) {
  var key = year + '-' + month;
  var days = STATUTORY_HOLIDAYS[key];
  return days ? days.indexOf(day) >= 0 : false;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function getMemberColor(memberId, members) {
  if (memberId === SYSTEM_MEMBER_ID) return SYSTEM_COLOR;
  for (var i = 0; i < members.length; i++) {
    if (members[i].id === memberId) return members[i].color;
  }
  return EVENT_COLORS[0];
}

function generateCalendarDays(year, month, events, members) {
  var totalDays = getDaysInMonth(year, month);
  var now = new Date();
  var todayYear = now.getFullYear();
  var todayMonth = now.getMonth() + 1;
  var todayDay = now.getDate();
  var isJune2024 = year === 2024 && month === 6;

  var monthEvents = [];
  for (var i = 0; i < events.length; i++) {
    if (events[i].year === year && events[i].month === month) {
      monthEvents.push(events[i]);
    }
  }

  var days = [];
  for (var d = 1; d <= totalDays; d++) {
    var dow = new Date(year, month - 1, d).getDay();
    var lunarInfo = isJune2024 ? JUNE_2024_LUNAR[d] : undefined;
    var statutory = isStatutoryHoliday(year, month, d);
    var weekend = dow === 0 || dow === 6;
    var holidayName = getHolidayName(year, month, d);

    var dayEvents = [];
    for (var j = 0; j < monthEvents.length; j++) {
      if (monthEvents[j].day === d) {
        var c = getMemberColor(monthEvents[j].memberId, members);
        dayEvents.push({
          id: monthEvents[j].id,
          title: monthEvents[j].title,
          memberId: monthEvents[j].memberId,
          color: c.bg,
          textColor: c.text,
        });
      }
    }

    var lunarText = holidayName || (lunarInfo ? lunarInfo.lunar : '');
    days.push({
      day: d,
      lunar: lunarInfo ? lunarInfo.lunar : '',
      holidayName: holidayName || '',
      isWeekend: weekend,
      isSunday: dow === 0,
      isToday: year === todayYear && month === todayMonth && d === todayDay,
      isSolarTerm: lunarInfo ? !!lunarInfo.isSolarTerm : false,
      isHoliday: lunarInfo ? !!lunarInfo.isHoliday : false,
      isStatutoryHoliday: statutory,
      isRestDay: statutory || weekend,
      events: dayEvents,
      empty: false,
    });
  }
  return days;
}

function buildWeeks(year, month, days) {
  var firstDay = getFirstDayOfWeek(year, month);
  var weeks = [];
  var week = [];

  for (var i = 0; i < firstDay; i++) {
    week.push({ empty: true, day: 0, events: [] });
  }

  for (var j = 0; j < days.length; j++) {
    week.push(days[j]);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  while (week.length > 0 && week.length < 7) {
    week.push({ empty: true, day: 0, events: [] });
  }
  if (week.length > 0) weeks.push(week);

  return weeks;
}

function processMembers(members) {
  var result = [];
  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    result.push({
      id: m.id,
      name: m.name,
      color: m.color,
      initial: m.name.charAt(0),
    });
  }
  return result;
}

module.exports = {
  EVENT_COLORS: EVENT_COLORS,
  SYSTEM_COLOR: SYSTEM_COLOR,
  SYSTEM_MEMBER_ID: SYSTEM_MEMBER_ID,
  WEEKDAYS: WEEKDAYS,
  MONTH_NAMES: MONTH_NAMES,
  DEFAULT_MEMBERS: DEFAULT_MEMBERS,
  DEFAULT_EVENTS: DEFAULT_EVENTS,
  getDaysInMonth: getDaysInMonth,
  getFirstDayOfWeek: getFirstDayOfWeek,
  getMemberColor: getMemberColor,
  generateCalendarDays: generateCalendarDays,
  buildWeeks: buildWeeks,
  processMembers: processMembers,
};
