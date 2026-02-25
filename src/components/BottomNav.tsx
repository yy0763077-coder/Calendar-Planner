const navItems = [
  {
    label: '日历',
    active: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
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
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 1V3M10 17V19M1 10H3M17 10H19M3.93 3.93L5.34 5.34M14.66 14.66L16.07 16.07M16.07 3.93L14.66 5.34M5.34 14.66L3.93 16.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav style={{ display: 'flex', alignItems: 'stretch', borderTop: '1px solid #F1F5F9', background: '#fff', padding: '8px 16px 20px 16px' }}>
      {navItems.map((item) => (
        <button
          key={item.label}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <span style={{ color: item.active ? '#F6C6EA' : '#94A3B8' }}>
            {item.icon}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: item.active ? 700 : 500,
              color: item.active ? '#F6C6EA' : '#94A3B8',
            }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
