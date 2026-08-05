interface LogoProps {
  size?: number;
}

export function Logo({ size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SubTrakt logo"
    >
      <defs>
        <linearGradient id="subtrakt-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2793f" />
          <stop offset="1" stopColor="#c94a1c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#subtrakt-logo-grad)" />
      <rect x="8" y="14.5" width="16" height="3" rx="1.5" fill="#fff" />
    </svg>
  );
}
