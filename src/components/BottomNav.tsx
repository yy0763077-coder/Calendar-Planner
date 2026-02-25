const navItems = [
  {
    label: '日历',
    active: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 7H18" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7" cy="11" r="1" fill="currentColor"/>
        <circle cx="10" cy="11" r="1" fill="currentColor"/>
        <circle cx="13" cy="11" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: '成员',
    active: false,
    icon: (
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="4" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 14C1 11.2386 3.23858 9 6 9H10C12.7614 9 15 11.2386 15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M17 10C19.2091 10 21 11.7909 21 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: '消息',
    active: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V12C18 13.1046 17.1046 14 16 14H6L2 18V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="7" cy="8" r="0.75" fill="currentColor"/>
        <circle cx="10" cy="8" r="0.75" fill="currentColor"/>
        <circle cx="13" cy="8" r="0.75" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: '设置',
    active: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 1V3M10 17V19M1 10H3M17 10H19M3.93 3.93L5.34 5.34M14.66 14.66L16.07 16.07M16.07 3.93L14.66 5.34M5.34 14.66L3.93 16.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav className="flex items-stretch border-t border-border-light bg-white px-3 pt-2 pb-5">
      {navItems.map((item) => (
        <button
          key={item.label}
          className="flex-1 flex flex-col items-center gap-1"
        >
          <span className={item.active ? 'text-pink-primary' : 'text-gray-text'}>
            {item.icon}
          </span>
          <span
            className={`text-[10px] ${
              item.active ? 'font-bold text-pink-primary' : 'font-medium text-gray-text'
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
