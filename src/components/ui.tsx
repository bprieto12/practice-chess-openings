import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Mastery } from "../lib/srs";
import type { Feedback } from "../lib/trainer";
import { IconBack } from "./icons";

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FeedbackBanner({ feedback }: { feedback?: Feedback }) {
  if (!feedback) return null;
  const icon = feedback.tone === "good" ? "✓" : feedback.tone === "bad" ? "✗" : "ℹ";
  return (
    <div className={`feedback feedback--${feedback.tone}`} role="status">
      <span aria-hidden="true">{icon}</span>
      <span>
        <RichText text={feedback.text} inline />
      </span>
    </div>
  );
}

const MASTERY_LABEL: Record<Mastery, string> = { new: "New", learning: "Learning", mastered: "Mastered" };
export function MasteryBadge({ mastery }: { mastery: Mastery }) {
  return <span className={`badge badge--${mastery}`}>{MASTERY_LABEL[mastery]}</span>;
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="back-link" to={to}>
      <IconBack /> {children}
    </Link>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Minimal formatting: blank-line paragraphs, **bold** and `code`. */
export function RichText({ text, inline = false }: { text: string; inline?: boolean }) {
  const renderInline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
      return <Fragment key={i}>{part}</Fragment>;
    });
  if (inline) return <>{renderInline(text)}</>;
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{renderInline(p)}</p>
      ))}
    </>
  );
}
