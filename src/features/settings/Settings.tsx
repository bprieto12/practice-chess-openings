import { useRef, useState } from "react";
import { Segmented } from "../../components/ui";
import { exportJson, importJson, type AnimationSpeed, type BoardTheme, type ThemeMode } from "../../lib/storage";
import { snapshot, useApp } from "../../store";

export function Settings() {
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const replaceAll = useApp((s) => s.replaceAll);
  const resetAll = useApp((s) => s.resetAll);
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  function doExport() {
    const blob = new Blob([exportJson(snapshot(useApp.getState()))], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chess-openings-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: "good", text: "Progress exported." });
  }

  async function doImport(file: File) {
    try {
      const data = importJson(await file.text());
      if (!confirm("Replace your current progress with this file?")) return;
      replaceAll(data);
      setMessage({ tone: "good", text: "Progress imported." });
    } catch (e) {
      setMessage({ tone: "bad", text: (e as Error).message });
    }
  }

  const row = (label: string, control: React.ReactNode, hint?: string) => (
    <div className="settings__row">
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {hint && <div className="small muted">{hint}</div>}
      </div>
      {control}
    </div>
  );

  return (
    <div className="stack">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <section className="card stack">
        <h2 style={{ margin: 0 }}>Board</h2>
        {row(
          "Board colors",
          <Segmented<BoardTheme>
            label="Board colors"
            value={settings.boardTheme}
            onChange={(v) => update({ boardTheme: v })}
            options={[
              { value: "green", label: "Green" },
              { value: "brown", label: "Brown" },
              { value: "blue", label: "Blue" },
            ]}
          />,
        )}
        {row(
          "Coordinates",
          <Segmented<"on" | "off">
            label="Show coordinates"
            value={settings.showCoordinates ? "on" : "off"}
            onChange={(v) => update({ showCoordinates: v === "on" })}
            options={[
              { value: "on", label: "Show" },
              { value: "off", label: "Hide" },
            ]}
          />,
          "Notation lessons choose for themselves.",
        )}
        {row(
          "Animation",
          <Segmented<AnimationSpeed>
            label="Animation speed"
            value={settings.animationSpeed}
            onChange={(v) => update({ animationSpeed: v })}
            options={[
              { value: "normal", label: "Normal" },
              { value: "fast", label: "Fast" },
              { value: "off", label: "Off" },
            ]}
          />,
        )}
        {row(
          "Opponent reply speed",
          <Segmented<string>
            label="Opponent reply speed"
            value={String(settings.opponentDelayMs)}
            onChange={(v) => update({ opponentDelayMs: Number(v) })}
            options={[
              { value: "800", label: "Slow" },
              { value: "400", label: "Normal" },
              { value: "150", label: "Fast" },
            ]}
          />,
          "In Practice mode.",
        )}
      </section>

      <section className="card stack">
        <h2 style={{ margin: 0 }}>App</h2>
        {row(
          "Review session size",
          <Segmented<string>
            label="Review session size"
            value={String(settings.reviewSessionSize)}
            onChange={(v) => update({ reviewSessionSize: Number(v) })}
            options={[
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
            ]}
          />,
        )}
        {row(
          "Theme",
          <Segmented<ThemeMode>
            label="Theme"
            value={settings.theme}
            onChange={(v) => update({ theme: v })}
            options={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />,
        )}
      </section>

      <section className="card stack">
        <h2 style={{ margin: 0 }}>Your data</h2>
        <p className="small muted" style={{ margin: 0 }}>
          Progress is saved in this browser only. Export it to back it up or move it to another device.
        </p>
        <div className="row">
          <button className="btn" onClick={doExport}>
            Export progress
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import progress
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void doImport(f);
              e.target.value = "";
            }}
          />
          <button
            className="btn btn--danger"
            onClick={() => {
              if (confirm("Delete all progress? This can't be undone.")) {
                resetAll();
                setMessage({ tone: "good", text: "All progress deleted." });
              }
            }}
          >
            Reset all progress
          </button>
        </div>
        {message && (
          <div className={`feedback feedback--${message.tone}`} role="status">
            {message.text}
          </div>
        )}
      </section>

      <section className="card stack">
        <h2 style={{ margin: 0 }}>About</h2>
        <p className="small" style={{ margin: 0 }}>
          Practice Chess Openings. Chess rules by chess.js (BSD-2-Clause). Board and pieces by react-chessboard (MIT).
          Works offline once loaded.
        </p>
      </section>
    </div>
  );
}
