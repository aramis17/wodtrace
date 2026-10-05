import { TimerPanel } from "@/components/timer-panel";

export default function TimersPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl uppercase text-text-primary">
          Temporizadores
        </h1>
        <p className="text-sm text-text-muted">
          AMRAP, EMOM, Tabata y por tiempo
        </p>
      </header>
      <TimerPanel />
    </div>
  );
}
