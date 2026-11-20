/** Tejado's mark: a house with eyes, running to the right. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size * 0.92} viewBox="-3 1 44 40" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round" fill="none" opacity={0.45} strokeWidth={1.8}>
        <path d="M-1 19h4.5M-2 24h4M0 29h3" />
      </g>
      <g stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M15.5 29 10.5 34.2 14.6 35.6" />
        <path d="M25.5 29 29.6 34 34.2 33.4" />
      </g>
      <g transform="rotate(9 20 20)">
        <path d="M20 4.5 35.5 17.5H30.5V30.5H9.5V17.5H4.5Z" fill="currentColor" stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round" />
        <ellipse cx="15.6" cy="21.8" rx="3.4" ry="4.4" fill="#fff" />
        <ellipse cx="24.6" cy="21.8" rx="3.4" ry="4.4" fill="#fff" />
        <circle cx="17.1" cy="22.4" r="1.7" fill="currentColor" />
        <circle cx="26.1" cy="22.4" r="1.7" fill="currentColor" />
      </g>
    </svg>
  );
}
