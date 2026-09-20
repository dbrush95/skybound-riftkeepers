import { useEffect, useRef, useState, type RefObject } from "react";
import { Heart, Pause, Volume2, VolumeX } from "lucide-react";
import { useGameStore, type Weapon } from "@/game/store";
import type { GameAPI } from "@/game/api";
import { END_COPY, WEAPONS } from "@/game/story";
import { GAME_VERSION } from "@/game/version";

function useRoomyHud() {
  const [roomy, setRoomy] = useState(false);
  useEffect(() => {
    const sync = () => setRoomy(window.innerWidth >= 1024 && window.innerHeight >= 640);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  return roomy;
}

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<GameAPI | null>(null);
  const hud = useGameStore();
  const [name, setName] = useState("");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const stored = hud.playerName;
    if (stored) setName(stored);
  }, [hud.playerName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let destroy = () => {};
    void import("@/game/engine").then(({ mountGame }) => {
      if (cancelled || !canvasRef.current) return;
      const mounted = mountGame(canvasRef.current);
      destroy = mounted.destroy;
      api.current = mounted.api;
      setBooting(false);
    });
    return () => {
      cancelled = true;
      destroy();
      api.current = null;
    };
  }, []);

  const start = () => {
    const typed = (document.getElementById("player-name") as HTMLInputElement | null)?.value ?? name;
    setName(typed);
    api.current?.start(typed);
  };

  const overlay =
    hud.phase === "title" ||
    hud.phase === "pause" ||
    hud.phase === "clear" ||
    hud.phase === "over" ||
    hud.phase === "credits" ||
    hud.phase === "won";

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-paper">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />

      {booting && (
        <p className="pointer-events-none absolute left-4 top-4 z-20 text-xs tracking-wide text-fog">
          Opening the rift…
        </p>
      )}

      {hud.phase === "play" && (
        <Hud
          onPause={() => api.current?.pause()}
          onMute={() => api.current?.toggleMute()}
          onWeapon={(w) => api.current?.setWeapon(w)}
        />
      )}
      {hud.phase === "play" && <TouchPad api={api} />}

      {overlay && hud.phase !== "boot" && (
        <div className="absolute inset-0 z-10 flex items-end justify-center p-4 sm:items-center sm:p-8">
          <section className="w-full max-w-lg rounded-2xl border border-paper/10 bg-ink-2/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-8">
            {hud.phase === "title" && (
              <TitleCard
                name={name}
                setName={setName}
                high={hud.highScore}
                onStart={start}
                muted={hud.muted}
                onMute={() => api.current?.toggleMute()}
                booting={booting}
              />
            )}
            {hud.phase === "pause" && (
              <MenuCard
                kicker={hud.playerName}
                title="Paused"
                body="The rift can wait. Resume when you are ready."
                action="Resume"
                onAction={() => api.current?.resume()}
                extra="Retry run"
                onExtra={() => api.current?.retry()}
              />
            )}
            {hud.phase === "clear" && (
              <MenuCard
                kicker="Gate closed"
                title={hud.worldName}
                body={hud.nixLine || `+1,000  ·  Score ${hud.score.toLocaleString()}`}
                action="Next world"
                onAction={() => api.current?.nextWorld()}
              />
            )}
            {hud.phase === "over" && (
              <MenuCard
                kicker={hud.playerName}
                title="Rift wins this time"
                body={`Score ${hud.score.toLocaleString()}  ·  Bolts ${hud.bolts}`}
                action="Play again"
                onAction={() => api.current?.retry()}
              />
            )}
            {hud.phase === "credits" && <CreditsCard name={hud.playerName} />}
            {hud.phase === "won" && (
              <WonCard name={hud.playerName} score={hud.score} onRetry={() => api.current?.retry()} />
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function TitleCard({
  name,
  setName,
  high,
  onStart,
  muted,
  onMute,
  booting,
}: {
  name: string;
  setName: (v: string) => void;
  high: number;
  onStart: () => void;
  muted: boolean;
  onMute: () => void;
  booting: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-copper">Riftkeeper</p>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Skybound</h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-fog">
          Name your inventor. Swing the rift-wrench, blast coral bots, smash crates, and close the sky gates across ten worlds.
        </p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-fog-2">Captain name</span>
        <input
          id="player-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onStart();
          }}
          placeholder="Rook Vane"
          maxLength={18}
          autoComplete="off"
          className="h-11 rounded-lg border border-paper/12 bg-ink px-3 text-base text-paper outline-none ring-accent/0 transition placeholder:text-fog-2 focus:border-accent/40 focus:ring-2 focus:ring-accent/30"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onStart}
          disabled={booting}
          className="h-12 flex-1 rounded-lg bg-paper px-5 text-sm font-semibold text-ink transition hover:bg-accent disabled:opacity-50"
        >
          Start Adventure
        </button>
        <button
          type="button"
          onClick={onMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-paper/12 px-4 text-sm text-fog transition hover:border-paper/25 hover:text-paper"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          {muted ? "Muted" : "Sound"}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs text-fog">
        <div className="rounded-md bg-ink px-3 py-2">
          <dt className="uppercase tracking-[0.14em] text-fog-2">Best</dt>
          <dd className="mt-1 font-medium tabular-nums text-paper">{high.toLocaleString()}</dd>
        </div>
        <div className="rounded-md bg-ink px-3 py-2">
          <dt className="uppercase tracking-[0.14em] text-fog-2">Worlds</dt>
          <dd className="mt-1 font-medium text-paper">10 gates</dd>
        </div>
      </dl>

      <p className="text-xs leading-relaxed text-fog-2">
        Move WASD / stick · Jump Space (tap again in air) · Wrench J always · Blaster F always · 1–8 / Tab / wheel to
        switch · Sprint Shift · Camera Q / E · Pause Esc
      </p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-fog-2">Version {GAME_VERSION}</p>
    </div>
  );
}

function MenuCard({
  kicker,
  title,
  body,
  action,
  onAction,
  extra,
  onExtra,
}: {
  kicker: string;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
  extra?: string;
  onExtra?: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">{kicker}</p>
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">{title}</h2>
        <p className="text-sm text-fog">{body}</p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAction}
          className="h-12 flex-1 rounded-lg bg-paper px-5 text-sm font-semibold text-ink transition hover:bg-accent"
        >
          {action}
        </button>
        {extra && onExtra && (
          <button
            type="button"
            onClick={onExtra}
            className="h-12 rounded-lg border border-paper/12 px-5 text-sm text-fog transition hover:text-paper"
          >
            {extra}
          </button>
        )}
      </div>
    </div>
  );
}

function CreditsCard({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-copper">{name || "Rook Vane"}</p>
      <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">The sky knits</h2>
      <p className="text-pretty text-sm leading-relaxed text-fog">{END_COPY.credits}</p>
      <p className="text-xs text-fog-2">{END_COPY.receipt}</p>
    </div>
  );
}

function WonCard({ name, score, onRetry }: { name: string; score: number; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {name || "Rook Vane"}
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">Skybound</h2>
        <p className="text-pretty text-base leading-relaxed text-paper">
          Ai has come a long way, but we are only at the beginning of the frontier. Keep the world moving
          forward. Thanks for playing. If you feel inclined, you can donate to me on X{" "}
          <a
            href="https://x.com/dallasbrush"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4"
          >
            @dallasbrush
          </a>
        </p>
        <p className="text-sm text-fog">Ten gates sealed. Final score {score.toLocaleString()}</p>
      </header>
      <button
        type="button"
        onClick={onRetry}
        className="h-12 rounded-lg bg-paper px-5 text-sm font-semibold text-ink transition hover:bg-accent"
      >
        Play Again
      </button>
    </div>
  );
}

function Hud({
  onPause,
  onMute,
  onWeapon,
}: {
  onPause: () => void;
  onMute: () => void;
  onWeapon: (w: Weapon) => void;
}) {
  const hud = useGameStore();
  const roomy = useRoomyHud();
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex flex-col p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-5 ${
        roomy ? "justify-between" : "justify-start"
      }`}
    >
      <div className="flex flex-col gap-1.5 sm:gap-2 [@media(max-height:480px)]:gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 rounded-xl border border-paper/10 bg-ink-2/80 px-2.5 py-1.5 sm:px-3 sm:py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-accent sm:text-[11px]">
              {hud.playerName || "Riftkeeper"}
            </p>
            <p className="truncate text-[11px] text-fog sm:text-xs">{hud.worldName}</p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: hud.maxHp }).map((_, i) => (
              <Heart
                key={i}
                className={`size-3.5 sm:size-4 ${i < hud.hp ? "fill-hp text-hp" : "text-fog-2"}`}
                strokeWidth={2}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onMute}
              className="pointer-events-auto grid size-10 place-items-center rounded-lg border border-paper/10 bg-ink-2/80 text-fog sm:size-11"
              aria-label="Toggle sound"
            >
              {hud.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onPause}
              className="pointer-events-auto grid size-10 place-items-center rounded-lg border border-paper/10 bg-ink-2/80 text-fog sm:size-11"
              aria-label="Pause"
            >
              <Pause className="size-4" />
            </button>
          </div>
        </div>

        {!roomy && (
          <div className="flex items-center justify-between gap-2">
          <p className="rounded-lg border border-paper/10 bg-ink-2/80 px-2.5 py-1 text-[11px] tabular-nums text-bolt">
            Bolts {String(hud.bolts).padStart(2, "0")}
            <span className="mx-2 text-fog">Lives {hud.lives}</span>
            <span className="text-paper">Score {hud.score.toLocaleString()}</span>
          </p>
          <p className="shrink-0 rounded-lg border border-paper/10 bg-ink-2/80 px-2.5 py-1 text-right text-[10px] leading-tight">
            <span className="text-copper">{hud.meleeName}</span>
            <span className="text-fog"> · </span>
            <span className="text-accent">{hud.gunName}</span>
          </p>
        </div>
        )}

        <div className="mx-auto w-full max-w-md">
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-3">
            <div
              className="h-full bg-accent transition-[width] duration-200"
              style={{ width: `${Math.round(hud.gateMeter * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-center text-[10px] uppercase tracking-[0.18em] text-fog-2 [@media(max-height:480px)]:hidden">
            Gate {Math.round(hud.gateMeter * 100)}% · Gommage {hud.gommage}
          </p>
        </div>

        {hud.nixLine && (
          <div className="mx-auto flex w-full max-w-lg items-start gap-2 rounded-xl border border-paper/10 bg-ink-2/90 px-3 py-2">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent">
              NX
            </span>
            <p className="line-clamp-2 text-xs leading-relaxed text-paper [@media(max-height:480px)]:line-clamp-1">{hud.nixLine}</p>
          </div>
        )}
        {hud.banner && !hud.nixLine && (
          <p className="mx-auto max-w-md rounded-lg border border-paper/10 bg-ink-2/90 px-3 py-1.5 text-center text-xs font-medium tracking-wide text-paper">
            {hud.banner}
            {hud.combo > 1 ? `  ·  Combo ${hud.combo}` : ""}
          </p>
        )}
      </div>

      {roomy && (
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <div className="rounded-xl border border-paper/10 bg-ink-2/80 px-3 py-2 text-xs">
            <p className="tabular-nums text-bolt">Bolts {String(hud.bolts).padStart(2, "0")}</p>
            <p className="tabular-nums text-fog">Lives {hud.lives}</p>
            <p className="tabular-nums text-paper">Score {hud.score.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-paper/10 bg-ink-2/80 px-3 py-2 text-right text-xs">
            <p className="text-copper">{hud.meleeName} · J</p>
            <p className="text-accent">{hud.gunName} · F</p>
          </div>
        </div>
        <div className="pointer-events-auto hidden justify-end gap-1 lg:flex">
          {WEAPONS.map((w) => {
            const open = hud.unlocked.includes(w.id);
            const active = hud.weapon === w.id || hud.melee === w.id || hud.gun === w.id;
            return (
              <WeaponBtn
                key={w.id}
                active={active && open}
                locked={!open}
                onClick={() => onWeapon(w.id)}
                label={`${w.slot} ${w.short}`}
                slot={w.slot}
              />
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}

function WeaponBtn({
  active,
  locked,
  onClick,
  label,
  slot,
}: {
  active: boolean;
  locked?: boolean;
  onClick: () => void;
  label: string;
  slot: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`grid h-10 min-w-10 place-items-center rounded-lg border px-1.5 text-[10px] font-semibold tracking-wide ${
        locked
          ? "border-paper/8 bg-ink/60 text-fog-2"
          : active
            ? "border-accent/50 bg-accent text-accent-fg"
            : "border-paper/10 bg-ink-2/80 text-fog"
      }`}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      {slot}
    </button>
  );
}

function TouchPad({ api }: { api: RefObject<GameAPI | null> }) {
  const [show, setShow] = useState(false);
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  const look = useRef<{ x: number; id: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, on: false, ox: 0, oy: 0 });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900;
    setShow(coarse);
  }, []);

  if (!show) return null;

  const radius = 64;
  const applyStick = (clientX: number, clientY: number) => {
    const o = origin.current;
    if (!o) return;
    const dx = (clientX - o.x) / radius;
    const dy = -((clientY - o.y) / radius);
    const mag = Math.hypot(dx, dy);
    const s = mag > 1 ? 1 / mag : 1;
    const x = dx * s;
    const y = dy * s;
    api.current?.setTouchMove(x, y);
    setKnob({ x, y, on: true, ox: o.x, oy: o.y });
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        className="pointer-events-auto absolute bottom-0 left-0 h-[38%] w-[40%] touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          origin.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          applyStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (origin.current?.id === e.pointerId) applyStick(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (origin.current?.id !== e.pointerId) return;
          origin.current = null;
          api.current?.setTouchMove(0, 0);
          setKnob({ x: 0, y: 0, on: false, ox: 0, oy: 0 });
        }}
        onPointerCancel={() => {
          origin.current = null;
          api.current?.setTouchMove(0, 0);
          setKnob({ x: 0, y: 0, on: false, ox: 0, oy: 0 });
        }}
      />
      <div
        className="pointer-events-auto absolute bottom-0 right-0 h-[38%] w-[52%] touch-none"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          look.current = { x: e.clientX, id: e.pointerId };
        }}
        onPointerMove={(e) => {
          if (look.current?.id !== e.pointerId) return;
          const dx = (e.clientX - look.current.x) / Math.max(280, window.innerWidth * 0.4);
          look.current.x = e.clientX;
          api.current?.setTouchLook(dx * 2.4);
        }}
        onPointerUp={(e) => {
          if (look.current?.id === e.pointerId) look.current = null;
        }}
        onPointerCancel={() => {
          look.current = null;
        }}
      />

      <div className="pointer-events-none absolute bottom-[max(0.85rem,env(safe-area-inset-bottom))] left-4 size-28 rounded-full border border-paper/18 bg-ink-2/35 sm:left-6 sm:size-32">
        {knob.on && (
          <div
            className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/50 bg-accent/80 sm:size-14"
            style={{ transform: `translate(calc(-50% + ${knob.x * 36}px), calc(-50% + ${-knob.y * 36}px))` }}
          />
        )}
      </div>

      <div className="pointer-events-auto absolute bottom-[max(0.7rem,env(safe-area-inset-bottom))] right-3 flex items-end gap-2 sm:right-4 sm:gap-3">
        <div className="flex flex-col gap-2 sm:gap-3">
          <TouchBtn
            label="Cycle"
            onDown={() => api.current?.setTouchAction("cycle", true)}
            onUp={() => api.current?.setTouchAction("cycle", false)}
          />
          <TouchBtn
            label="Sprint"
            onDown={() => api.current?.setTouchAction("sprint", true)}
            onUp={() => api.current?.setTouchAction("sprint", false)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:gap-3">
          <TouchBtn
            label="Wrench"
            onDown={() => api.current?.setTouchAction("wrench", true)}
            onUp={() => api.current?.setTouchAction("wrench", false)}
          />
          <TouchBtn
            label="Blast"
            onDown={() => api.current?.setTouchAction("blaster", true)}
            onUp={() => api.current?.setTouchAction("blaster", false)}
          />
        </div>
        <TouchBtn
          label="Jump"
          primary
          onDown={() => api.current?.setTouchAction("jump", true)}
          onUp={() => api.current?.setTouchAction("jump", false)}
        />
      </div>
    </div>
  );
}

function TouchBtn({
  label,
  onDown,
  onUp,
  primary,
}: {
  label: string;
  onDown: () => void;
  onUp: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={`touch-none rounded-full border px-2.5 text-[11px] font-semibold tracking-wide sm:px-3 sm:text-xs ${
        primary
          ? "h-16 min-w-16 border-paper/25 bg-paper text-ink sm:h-[4.5rem] sm:min-w-[4.5rem]"
          : "h-14 min-w-14 border-paper/20 bg-ink-2/80 text-paper"
      }`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onUp();
      }}
      onPointerCancel={onUp}
    >
      {label}
    </button>
  );
}
