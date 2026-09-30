import { resolveLogo, type LogoSubject } from "../lib/brandIcons";

interface LogoBadgeProps {
  sub: LogoSubject;
  size?: number;
}

export function LogoBadge({ sub, size = 40 }: LogoBadgeProps) {
  const resolution = resolveLogo(sub);
  const radius = Math.round(size * 0.28);

  if (resolution.kind === "custom") {
    return (
      <img
        src={resolution.src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 object-cover"
        style={{ borderRadius: radius, boxShadow: "inset 0 0 0 1px var(--border)" }}
      />
    );
  }

  const background = resolution.kind === "color" ? resolution.hex : resolution.color;
  return (
    <div
      className="flex shrink-0 items-center justify-center font-semibold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background,
        boxShadow: "inset 0 0 0 1px var(--border)",
        fontSize: Math.max(11, size * 0.36),
      }}
      aria-hidden
    >
      {resolution.initials}
    </div>
  );
}
