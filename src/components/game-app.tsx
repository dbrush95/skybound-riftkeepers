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
