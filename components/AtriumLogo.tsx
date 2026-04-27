export default function AtriumLogo() {
  return (
    <div className="flex items-center gap-2 text-ink">
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <g stroke="#F59E0B" strokeWidth="0.9" strokeLinecap="round">
          <line x1="16" y1="9" x2="13.4" y2="22"  />
          <line x1="16" y1="9" x2="16"   y2="22.5"/>
          <line x1="16" y1="9" x2="18.6" y2="22"  />
        </g>
        <path d="M5 27 L15.4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M27 27 L16.6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span className="text-base font-semibold tighter">Atrium</span>
    </div>
  );
}
