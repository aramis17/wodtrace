import type { TimerMode } from "./types";

export interface TimerConfig {
  mode: TimerMode;
  /** Total work duration in seconds (AMRAP / FOR_TIME) */
  durationSeconds: number;
  /** EMOM interval length */
  intervalSeconds: number;
  /** EMOM number of rounds */
  rounds: number;
  /** Tabata work / rest */
  workSeconds: number;
  restSeconds: number;
  tabataRounds: number;
  countdownSeconds: number;
}

export interface TimerSnapshot {
  phase: "idle" | "countdown" | "work" | "rest" | "done";
  displaySeconds: number;
  currentRound: number;
  totalRounds: number;
  elapsedWorkSeconds: number;
  isRunning: boolean;
}

export function defaultTimerConfig(mode: TimerMode): TimerConfig {
  switch (mode) {
    case "AMRAP":
      return {
        mode,
        durationSeconds: 12 * 60,
        intervalSeconds: 60,
        rounds: 10,
        workSeconds: 20,
        restSeconds: 10,
        tabataRounds: 8,
        countdownSeconds: 10,
      };
    case "EMOM":
      return {
        mode,
        durationSeconds: 10 * 60,
        intervalSeconds: 60,
        rounds: 10,
        workSeconds: 20,
        restSeconds: 10,
        tabataRounds: 8,
        countdownSeconds: 10,
      };
    case "TABATA":
      return {
        mode,
        durationSeconds: 4 * 60,
        intervalSeconds: 60,
        rounds: 8,
        workSeconds: 20,
        restSeconds: 10,
        tabataRounds: 8,
        countdownSeconds: 10,
      };
    case "FOR_TIME":
      return {
        mode,
        durationSeconds: 20 * 60,
        intervalSeconds: 60,
        rounds: 1,
        workSeconds: 20,
        restSeconds: 10,
        tabataRounds: 8,
        countdownSeconds: 10,
      };
  }
}

export function totalTimerSeconds(config: TimerConfig): number {
  switch (config.mode) {
    case "AMRAP":
    case "FOR_TIME":
      return config.durationSeconds;
    case "EMOM":
      return config.intervalSeconds * config.rounds;
    case "TABATA":
      return (config.workSeconds + config.restSeconds) * config.tabataRounds;
  }
}

/**
 * Given elapsed milliseconds since start (excluding pauses),
 * compute the current timer snapshot.
 */
export function computeTimerSnapshot(
  config: TimerConfig,
  elapsedMs: number,
  isRunning: boolean,
  started: boolean,
): TimerSnapshot {
  if (!started) {
    return {
      phase: "idle",
      displaySeconds: config.countdownSeconds || totalTimerSeconds(config),
      currentRound: 1,
      totalRounds: totalRounds(config),
      elapsedWorkSeconds: 0,
      isRunning: false,
    };
  }

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const cd = config.countdownSeconds;

  if (elapsedSec < cd) {
    return {
      phase: "countdown",
      displaySeconds: cd - elapsedSec,
      currentRound: 1,
      totalRounds: totalRounds(config),
      elapsedWorkSeconds: 0,
      isRunning,
    };
  }

  const workElapsed = elapsedSec - cd;

  switch (config.mode) {
    case "AMRAP": {
      const remaining = config.durationSeconds - workElapsed;
      if (remaining <= 0) {
        return doneSnapshot(config, config.durationSeconds, isRunning);
      }
      return {
        phase: "work",
        displaySeconds: remaining,
        currentRound: 1,
        totalRounds: 1,
        elapsedWorkSeconds: workElapsed,
        isRunning,
      };
    }
    case "FOR_TIME": {
      if (workElapsed >= config.durationSeconds) {
        return doneSnapshot(config, config.durationSeconds, isRunning);
      }
      return {
        phase: "work",
        displaySeconds: workElapsed,
        currentRound: 1,
        totalRounds: 1,
        elapsedWorkSeconds: workElapsed,
        isRunning,
      };
    }
    case "EMOM": {
      const total = config.intervalSeconds * config.rounds;
      if (workElapsed >= total) {
        return doneSnapshot(config, total, isRunning);
      }
      const round = Math.floor(workElapsed / config.intervalSeconds) + 1;
      const into = workElapsed % config.intervalSeconds;
      return {
        phase: "work",
        displaySeconds: config.intervalSeconds - into,
        currentRound: round,
        totalRounds: config.rounds,
        elapsedWorkSeconds: workElapsed,
        isRunning,
      };
    }
    case "TABATA": {
      const cycle = config.workSeconds + config.restSeconds;
      const total = cycle * config.tabataRounds;
      if (workElapsed >= total) {
        return doneSnapshot(config, total, isRunning);
      }
      const round = Math.floor(workElapsed / cycle) + 1;
      const into = workElapsed % cycle;
      if (into < config.workSeconds) {
        return {
          phase: "work",
          displaySeconds: config.workSeconds - into,
          currentRound: round,
          totalRounds: config.tabataRounds,
          elapsedWorkSeconds: workElapsed,
          isRunning,
        };
      }
      return {
        phase: "rest",
        displaySeconds: cycle - into,
        currentRound: round,
        totalRounds: config.tabataRounds,
        elapsedWorkSeconds: workElapsed,
        isRunning,
      };
    }
  }
}

function totalRounds(config: TimerConfig): number {
  switch (config.mode) {
    case "EMOM":
      return config.rounds;
    case "TABATA":
      return config.tabataRounds;
    default:
      return 1;
  }
}

function doneSnapshot(
  config: TimerConfig,
  elapsedWork: number,
  _isRunning: boolean,
): TimerSnapshot {
  void _isRunning;
  return {
    phase: "done",
    displaySeconds: 0,
    currentRound: totalRounds(config),
    totalRounds: totalRounds(config),
    elapsedWorkSeconds: elapsedWork,
    isRunning: false,
  };
}

export function formatTimerDisplay(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
