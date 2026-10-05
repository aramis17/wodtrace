import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const GUEST_ID = process.env.TEST_GUEST_ID || "";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(18, 30, 0, 0);
  return d;
}

type WorkoutResultSeed = {
  performedAt: Date;
  scaling?: "RX" | "SCALED";
  timeSeconds?: number;
  reps?: number;
  weightKg?: number;
  rounds?: number;
  extraReps?: number;
  customValue?: string;
  notes?: string;
};

type PRAttemptSeed = {
  performedAt: Date;
  timeSeconds?: number;
  reps?: number;
  weightKg?: number;
  notes?: string;
};

const WOD_RESULTS: Record<string, WorkoutResultSeed[]> = {
  fran: [
    { performedAt: daysAgo(28), scaling: "RX", timeSeconds: 245, notes: "Primera vez en Fran" },
    { performedAt: daysAgo(21), scaling: "RX", timeSeconds: 232, notes: "Sensación fuerte" },
    { performedAt: daysAgo(14), scaling: "RX", timeSeconds: 220, notes: "Récord personal" },
  ],
  grace: [
    { performedAt: daysAgo(25), scaling: "RX", timeSeconds: 185, notes: "" },
    { performedAt: daysAgo(12), scaling: "RX", timeSeconds: 168, notes: "30 clean&jerks a tope" },
  ],
  cindy: [
    { performedAt: daysAgo(20), scaling: "RX", rounds: 17, extraReps: 5, notes: "Máximo en 20 min" },
    { performedAt: daysAgo(8), scaling: "RX", rounds: 18, extraReps: 12, notes: "" },
  ],
  murph: [
    { performedAt: daysAgo(30), scaling: "SCALED", timeSeconds: 2880, notes: "Con chaleco, menos pull-ups" },
  ],
  annie: [
    { performedAt: daysAgo(10), scaling: "RX", timeSeconds: 435, notes: "" },
  ],
  karen: [
    { performedAt: daysAgo(6), scaling: "RX", timeSeconds: 780, notes: "150 wall balls" },
  ],
  "open-24-1": [
    { performedAt: daysAgo(18), scaling: "RX", reps: 195, timeSeconds: 600, notes: "Open 24.1" },
  ],
  helen: [
    { performedAt: daysAgo(3), scaling: "RX", timeSeconds: 720, notes: "" },
  ],
};

const PR_ATTEMPTS: Record<string, PRAttemptSeed[]> = {
  "back-squat": [
    { performedAt: daysAgo(27), weightKg: 120, notes: "Serie 5x5" },
    { performedAt: daysAgo(15), weightKg: 130, notes: "1RM" },
    { performedAt: daysAgo(5), weightKg: 140, notes: "Nuevo PR 1RM" },
  ],
  deadlift: [
    { performedAt: daysAgo(26), weightKg: 160 },
    { performedAt: daysAgo(9), weightKg: 175 },
    { performedAt: daysAgo(2), weightKg: 182.5, notes: "Récord absoluto" },
  ],
  snatch: [
    { performedAt: daysAgo(24), weightKg: 60 },
    { performedAt: daysAgo(11), weightKg: 67.5, notes: "Buen técnica" },
  ],
  "clean-and-jerk": [
    { performedAt: daysAgo(22), weightKg: 90 },
    { performedAt: daysAgo(7), weightKg: 97.5, notes: "" },
  ],
  "2k-row": [
    { performedAt: daysAgo(19), timeSeconds: 452 },
    { performedAt: daysAgo(4), timeSeconds: 441, notes: "Ritmo 1:50" },
  ],
  "5k-run": [
    { performedAt: daysAgo(16), timeSeconds: 1440 },
  ],
  "max-pullups": [
    { performedAt: daysAgo(13), reps: 15 },
    { performedAt: daysAgo(1), reps: 18, notes: "Nuevo máximo" },
  ],
};

async function main() {
  if (!GUEST_ID) {
    console.error("TEST_GUEST_ID requerido");
    process.exit(1);
  }
  const guest = await prisma.guestProfile.findUnique({ where: { id: GUEST_ID } });
  if (!guest) {
    console.error("Perfil invitado no existe:", GUEST_ID);
    process.exit(1);
  }

  let results = 0;
  for (const [slug, rows] of Object.entries(WOD_RESULTS)) {
    const workout = await prisma.workout.findFirst({ where: { slug, isSeed: true } });
    if (!workout) { console.warn("WOD no encontrado:", slug); continue; }
    for (const row of rows) {
      await prisma.workoutResult.create({
        data: { guestId: GUEST_ID, workoutId: workout.id, scaling: "RX", ...row },
      });
      results++;
    }
  }

  let attempts = 0;
  for (const [slug, rows] of Object.entries(PR_ATTEMPTS)) {
    const pr = await prisma.personalRecord.findFirst({ where: { slug, isSeed: true } });
    if (!pr) { console.warn("PR no encontrado:", slug); continue; }
    for (const row of rows) {
      await prisma.personalRecordAttempt.create({
        data: { guestId: GUEST_ID, personalRecordId: pr.id, ...row },
      });
      attempts++;
    }
  }

  const wods = await prisma.workout.findMany({ where: { isSeed: true }, take: 3 });
  let favorites = 0;
  for (const w of wods) {
    await prisma.favorite.upsert({
      where: { guestId_targetType_targetId: { guestId: GUEST_ID, targetType: "WORKOUT", targetId: w.id } },
      create: { guestId: GUEST_ID, targetType: "WORKOUT", targetId: w.id },
      update: {},
    });
    favorites++;
  }
  const prSnatch = await prisma.personalRecord.findFirst({ where: { slug: "snatch", isSeed: true } });
  if (prSnatch) {
    await prisma.favorite.upsert({
      where: { guestId_targetType_targetId: { guestId: GUEST_ID, targetType: "PERSONAL_RECORD", targetId: prSnatch.id } },
      create: { guestId: GUEST_ID, targetType: "PERSONAL_RECORD", targetId: prSnatch.id },
      update: {},
    });
    favorites++;
  }

  console.log(`Datos de prueba: ${results} resultados, ${attempts} intentos PR, ${favorites} favoritos para ${GUEST_ID}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
