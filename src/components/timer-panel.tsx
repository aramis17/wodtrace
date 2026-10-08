"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeTimerSnapshot,
  defaultTimerConfig,
  formatTimerDisplay,
  type TimerConfig,
} from "@/lib/timers";
import type { TimerMode } from "@/lib/types";
import { TIMER_MODE_LABELS } from "@/lib/types";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";
import { cn } from "@/lib/utils";

export function TimerPanel() {
  const [mode, setMode] = useState<TimerMode>("AMRAP");
  const [config, setConfig] = useState<TimerConfig>(() => defaultTimerConfig("AMRAP"));
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reps, setReps] = useState(0);
  const [keepAwake, setKeepAwake] = useState(false);
  const accRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const wakeRef = useRef<{ release: () => void } | null>(null);

  const snapshot = computeTimerSnapshot(config, elapsedMs, running, started);

  useEffect(() => {
    if (!running) return;
    lastRef.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      if (lastRef.current != null) {
        accRef.current += now - lastRef.current;
        lastRef.current = now;
        const next = accRef.current;
        setElapsedMs(next);
        const snap = computeTimerSnapshot(config, next, true, true);
        if (snap.phase === "done") {
          setRunning(false);
        }
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running, config]);

  useEffect(() => {
    async function manageWake() {
      if (keepAwake && running && "wakeLock" in navigator) {
        try {
          const lock = await navigator.wakeLock.request("screen");
          wakeRef.current = lock;
        } catch {
          /* ignore */
        }
      } else {
        wakeRef.current?.release();
        wakeRef.current = null;
      }
    }
    void manageWake();
    return () => {
      wakeRef.current?.release();
      wakeRef.current = null;
    };
  }, [keepAwake, running]);

  const switchMode = useCallback((m: TimerMode) => {
    setMode(m);
    setConfig(defaultTimerConfig(m));
    setStarted(false);
    setRunning(false);
    setElapsedMs(0);
    accRef.current = 0;
    lastRef.current = null;
    setReps(0);
  }, []);

  function start() {
    setStarted(true);
    setRunning(true);
  }

  function pause() {
    if (lastRef.current != null) {
      accRef.current += performance.now() - lastRef.current;
      lastRef.current = null;
      setElapsedMs(accRef.current);
    }
    setRunning(false);
  }

  function reset() {
    setStarted(false);
    setRunning(false);
    setElapsedMs(0);
    accRef.current = 0;
    lastRef.current = null;
    setReps(0);
  }

  const phaseColor =
    snapshot.phase === "countdown"
      ? "text-gold"
      : snapshot.phase === "rest"
        ? "text-info"
        : snapshot.phase === "done"
          ? "text-success"
          : "text-text-primary";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TIMER_MODE_LABELS) as TimerMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              "min-h-12 rounded-xl px-4 text-sm font-semibold",
              mode === m
                ? "bg-primary text-on-primary"
                : "bg-card text-text-secondary border border-border",
            )}
          >
            {TIMER_MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {!started ? (
        <div className="grid grid-cols-2 gap-3">
          {(mode === "AMRAP" || mode === "FOR_TIME") && (
            <div className="col-span-2">
              <Label>Duración (min)</Label>
              <Input
                type="number"
                min={1}
                value={Math.round(config.durationSeconds / 60)}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    durationSeconds: Math.max(1, Number(e.target.value) || 1) * 60,
                  }))
                }
              />
            </div>
          )}
          {mode === "EMOM" && (
            <>
              <div>
                <Label>Intervalo (s)</Label>
                <Input
                  type="number"
                  min={10}
                  value={config.intervalSeconds}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      intervalSeconds: Math.max(10, Number(e.target.value) || 60),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Rondas</Label>
                <Input
                  type="number"
                  min={1}
                  value={config.rounds}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      rounds: Math.max(1, Number(e.target.value) || 1),
                    }))
                  }
                />
              </div>
            </>
          )}
          {mode === "TABATA" && (
            <>
              <div>
                <Label>Trabajo (s)</Label>
                <Input
                  type="number"
                  min={5}
                  value={config.workSeconds}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      workSeconds: Math.max(5, Number(e.target.value) || 20),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Descanso (s)</Label>
                <Input
                  type="number"
                  min={0}
                  value={config.restSeconds}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      restSeconds: Math.max(0, Number(e.target.value) || 10),
                    }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Rondas</Label>
                <Input
                  type="number"
                  min={1}
                  value={config.tabataRounds}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      tabataRounds: Math.max(1, Number(e.target.value) || 8),
                    }))
                  }
                />
              </div>
            </>
          )}
          <div className="col-span-2">
            <Label>Cuenta regresiva (s)</Label>
            <Input
              type="number"
              min={0}
              max={30}
              value={config.countdownSeconds}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  countdownSeconds: Math.max(0, Number(e.target.value) || 0),
                }))
              }
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-text-muted">
          {snapshot.phase === "countdown"
            ? "Preparados"
            : snapshot.phase === "rest"
              ? "Descanso"
              : snapshot.phase === "done"
                ? "Finalizado"
                : TIMER_MODE_LABELS[mode]}
        </p>
        <p className={cn("mt-2 font-display text-7xl tabular-nums", phaseColor)}>
          {formatTimerDisplay(snapshot.displaySeconds)}
        </p>
        {(mode === "EMOM" || mode === "TABATA") && snapshot.phase !== "idle" ? (
          <p className="mt-2 text-sm text-text-secondary">
            Ronda {snapshot.currentRound} / {snapshot.totalRounds}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setReps((r) => Math.max(0, r - 1))}
          className="min-h-12 min-w-12 rounded-xl border border-border bg-card text-xl text-text-primary"
          aria-label="Restar rep"
        >
          −
        </button>
        <div className="text-center">
          <p className="font-display text-3xl text-text-primary">{reps}</p>
          <p className="text-xs text-text-muted">reps</p>
        </div>
        <button
          type="button"
          onClick={() => setReps((r) => r + 1)}
          className="min-h-12 min-w-12 rounded-xl bg-primary text-xl text-on-primary"
          aria-label="Sumar rep"
        >
          +
        </button>
      </div>

      <label className="flex min-h-12 items-center gap-3 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={keepAwake}
          onChange={(e) => setKeepAwake(e.target.checked)}
          className="h-5 w-5 accent-primary"
        />
        Mantener pantalla activa
      </label>

      <div className="grid grid-cols-2 gap-3">
        {!running ? (
          <Button onClick={start} className="col-span-2">
            {started ? "Continuar" : "Iniciar"}
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary" className="col-span-2">
            Pausar
          </Button>
        )}
        <Button onClick={reset} variant="ghost" className="col-span-2">
          Reiniciar
        </Button>
      </div>
    </div>
  );
}
