import { describe, expect, it } from "vitest";
import {
  computeTimerSnapshot,
  defaultTimerConfig,
  formatTimerDisplay,
  totalTimerSeconds,
} from "./timers";

describe("timers", () => {
  it("defaults AMRAP to 12 min", () => {
    const c = defaultTimerConfig("AMRAP");
    expect(c.durationSeconds).toBe(720);
    expect(totalTimerSeconds(c)).toBe(720);
  });

  it("formats display", () => {
    expect(formatTimerDisplay(65)).toBe("01:05");
  });

  it("countdown phase", () => {
    const c = defaultTimerConfig("AMRAP");
    c.countdownSeconds = 10;
    const snap = computeTimerSnapshot(c, 3000, true, true);
    expect(snap.phase).toBe("countdown");
    expect(snap.displaySeconds).toBe(7);
  });

  it("AMRAP counts down work time", () => {
    const c = defaultTimerConfig("AMRAP");
    c.countdownSeconds = 0;
    c.durationSeconds = 60;
    const snap = computeTimerSnapshot(c, 15_000, true, true);
    expect(snap.phase).toBe("work");
    expect(snap.displaySeconds).toBe(45);
  });

  it("FOR_TIME counts up", () => {
    const c = defaultTimerConfig("FOR_TIME");
    c.countdownSeconds = 0;
    const snap = computeTimerSnapshot(c, 90_000, true, true);
    expect(snap.phase).toBe("work");
    expect(snap.displaySeconds).toBe(90);
  });

  it("EMOM advances rounds", () => {
    const c = defaultTimerConfig("EMOM");
    c.countdownSeconds = 0;
    c.intervalSeconds = 60;
    c.rounds = 10;
    const snap = computeTimerSnapshot(c, 125_000, true, true);
    expect(snap.currentRound).toBe(3);
    expect(snap.displaySeconds).toBe(55);
  });

  it("Tabata work then rest", () => {
    const c = defaultTimerConfig("TABATA");
    c.countdownSeconds = 0;
    c.workSeconds = 20;
    c.restSeconds = 10;
    const work = computeTimerSnapshot(c, 5_000, true, true);
    expect(work.phase).toBe("work");
    const rest = computeTimerSnapshot(c, 25_000, true, true);
    expect(rest.phase).toBe("rest");
  });

  it("completes when time is up", () => {
    const c = defaultTimerConfig("AMRAP");
    c.countdownSeconds = 0;
    c.durationSeconds = 60;
    const snap = computeTimerSnapshot(c, 60_000, true, true);
    expect(snap.phase).toBe("done");
  });
});
