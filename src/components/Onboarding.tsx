import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";

interface OnboardingProps {
  onEnableReminders: () => Promise<void>;
  onFinish: () => void;
}

// First-launch intro, mirroring the iOS app. The last step asks for
// notification permission so the OS prompt appears with context.
export function Onboarding({ onEnableReminders, onFinish }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const last = STEPS.length - 1;
  const current = STEPS[step];

  async function enableReminders() {
    setBusy(true);
    try {
      await onEnableReminders();
    } finally {
      onFinish();
    }
  }

  return (
    <div className="glow-bottom fixed inset-0 z-50 flex flex-col items-center justify-center px-6" data-tauri-drag-region>
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-7 text-center">
        {current.titleFirst ? (
          <>
            <TwoToneTitle primary={current.primary} secondary={current.secondary} />
            {current.art}
          </>
        ) : (
          <>
            {current.art}
            <TwoToneTitle primary={current.primary} secondary={current.secondary} />
          </>
        )}
        {current.message && (
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            {current.message}
          </p>
        )}
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-3 pb-10">
        <div className="mb-3 flex gap-2" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === step ? 20 : 8,
                background: i === step ? "var(--text-primary)" : "var(--text-muted)",
                opacity: i === step ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        {step < last ? (
          <>
            <button type="button" className="pill-primary h-12 w-full text-sm" onClick={() => setStep(step + 1)}>
              {step === 0 ? "Get started" : "Continue"}
            </button>
            <button
              type="button"
              className="h-10 w-full cursor-pointer text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
              onClick={onFinish}
            >
              Skip
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="pill-primary h-12 w-full text-sm disabled:opacity-60"
              disabled={busy}
              onClick={enableReminders}
            >
              Turn on reminders
            </button>
            <button
              type="button"
              className="h-10 w-full cursor-pointer text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
              onClick={onFinish}
            >
              Not now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function TwoToneTitle({ primary, secondary, align = "center" }: { primary: string; secondary: string; align?: "center" | "left" }) {
  return (
    <h1 className="text-4xl font-bold leading-tight tracking-tight" style={{ textAlign: align }}>
      <span style={{ color: "var(--text-primary)" }}>{primary}</span>
      <br />
      <span style={{ color: "var(--text-muted)" }}>{secondary}</span>
    </h1>
  );
}

interface Step {
  primary: string;
  secondary: string;
  message?: string;
  art: ReactNode;
  titleFirst?: boolean;
}

const ICONS = {
  bell: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  bars: (
    <>
      <path d="M5 20V12" />
      <path d="M12 20V5" />
      <path d="M19 20v-9" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <path d="M8 8.5 20 17" />
      <path d="M8 15.5 20 7" />
    </>
  ),
  trend: (
    <>
      <path d="M4 17l5-5 4 3 7-7" />
      <path d="M15 8h5v5" />
    </>
  ),
  lock: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <rect x="9" y="11" width="6" height="5" rx="1" />
      <path d="M10.5 11V9.5a1.5 1.5 0 0 1 3 0V11" />
    </>
  ),
};

const STEPS: Step[] = [
  {
    primary: "Every subscription.",
    secondary: "In one place.",
    message: "Track what you pay, when it renews, and what you've stopped using.",
    art: (
      <div style={{ filter: "drop-shadow(0 12px 30px rgba(235, 104, 52, 0.5))" }}>
        <Logo size={96} />
      </div>
    ),
  },
  {
    primary: "Know before",
    secondary: "you're charged.",
    titleFirst: true,
    art: (
      <ul className="flex w-full flex-col gap-3.5 text-left">
        <FeatureRow icon={ICONS.bell} text="A reminder before every renewal and trial end" />
        <FeatureRow icon={ICONS.bars} text="Monthly and yearly totals, by category" />
        <FeatureRow icon={ICONS.scissors} text="Flags the ones you've stopped using" />
        <FeatureRow icon={ICONS.trend} text="Price history when a service gets pricier" />
      </ul>
    ),
  },
  {
    primary: "Yours alone.",
    secondary: "Kept on this device.",
    message: "No account, no ads, no tracking. DueDate never sends your data anywhere.",
    art: <SymbolBadge icon={ICONS.lock} />,
  },
  {
    primary: "Stay ahead",
    secondary: "of renewals.",
    message: "Turn on notifications to get a heads-up a few days before each charge.",
    art: <SymbolBadge icon={ICONS.bell} />,
  },
];

function FeatureRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3.5">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--surface-2)", color: "var(--accent)" }}
      >
        <Icon size={18}>{icon}</Icon>
      </span>
      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
        {text}
      </span>
    </li>
  );
}

function SymbolBadge({ icon }: { icon: ReactNode }) {
  return (
    <span
      className="flex h-28 w-28 items-center justify-center rounded-full border backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--surface-2) 70%, transparent)", borderColor: "var(--border)", color: "var(--accent)" }}
    >
      <Icon size={44}>{icon}</Icon>
    </span>
  );
}

function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
