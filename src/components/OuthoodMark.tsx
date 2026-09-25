export function OuthoodMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Sun */}
      <circle cx="20" cy="15" r="7" fill="#B8863A" />
      {/* Horizon hills */}
      <path d="M0 26 Q10 18 20 24 T40 22 V40 H0 Z" fill="#3E5C4C" />
      {/* Foreground ridge */}
      <path d="M0 32 Q12 27 22 32 T40 30 V40 H0 Z" fill="#1E2A24" />
    </svg>
  );
}
