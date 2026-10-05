import type { PrismaClient } from "../src/generated/prisma/client";
import {
  DEMO_GUEST_ID,
  DEMO_RAW_TOKEN,
  hashToken,
} from "../src/lib/guest-token";

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(18, 30, 0, 0);
  return date;
}

export async function seedDemoData(prisma: PrismaClient) {
  await prisma.guestProfile.upsert({
    where: { id: DEMO_GUEST_ID },
    create: {
      id: DEMO_GUEST_ID,
      tokenHash: hashToken(DEMO_RAW_TOKEN),
      alias: "Demo",
    },
    update: { tokenHash: hashToken(DEMO_RAW_TOKEN), alias: "Demo" },
  });
  await prisma.preference.upsert({
    where: { guestId: DEMO_GUEST_ID },
    create: {
      guestId: DEMO_GUEST_ID,
      weightUnit: "KG",
      theme: "DARK",
      locale: "es",
      athleticLevelIndex: 1,
    },
    update: {},
  });

  const workoutResults = [
    ["fran", 28, { timeSeconds: 245, notes: "Primera vez en Fran" }],
    ["fran", 21, { timeSeconds: 232, notes: "Sensaciones fuertes" }],
    ["fran", 14, { timeSeconds: 220, notes: "Récord personal" }],
    ["grace", 25, { timeSeconds: 185 }],
    ["grace", 12, { timeSeconds: 168, notes: "30 clean and jerks a tope" }],
    ["cindy", 20, { rounds: 17, extraReps: 5, notes: "AMRAP de 20 min" }],
    ["cindy", 8, { rounds: 18, extraReps: 12 }],
    ["murph", 30, { timeSeconds: 2880, scaling: "SCALED", notes: "Volumen adaptado" }],
    ["annie", 10, { timeSeconds: 435 }],
    ["karen", 6, { timeSeconds: 780, notes: "150 wall balls" }],
    ["open-24-1", 18, { reps: 195, timeSeconds: 600, notes: "Open 24.1" }],
    ["helen", 3, { timeSeconds: 720 }],
  ] as const;

  for (const [slug, days, score] of workoutResults) {
    const workout = await prisma.workout.findFirst({
      where: { slug, isSeed: true },
    });
    if (!workout) continue;

    const id = `demo-result-${slug}-${days}`;
    await prisma.workoutResult.upsert({
      where: { id },
      create: {
        id,
        guestId: DEMO_GUEST_ID,
        workoutId: workout.id,
        performedAt: daysAgo(days),
        ...score,
      },
      update: { workoutId: workout.id, performedAt: daysAgo(days), ...score },
    });
  }

  const prAttempts = [
    ["back-squat", 27, { weightKg: 120, notes: "Serie 5x5" }],
    ["back-squat", 15, { weightKg: 130, notes: "1RM" }],
    ["back-squat", 5, { weightKg: 140, notes: "Nuevo PR" }],
    ["deadlift", 26, { weightKg: 160 }],
    ["deadlift", 9, { weightKg: 175 }],
    ["deadlift", 2, { weightKg: 182.5, notes: "Récord absoluto" }],
    ["snatch", 24, { weightKg: 60 }],
    ["snatch", 11, { weightKg: 67.5, notes: "Mejor técnica" }],
    ["clean-and-jerk", 22, { weightKg: 90 }],
    ["clean-and-jerk", 7, { weightKg: 97.5 }],
    ["2k-row", 19, { timeSeconds: 452 }],
    ["2k-row", 4, { timeSeconds: 441, notes: "Ritmo medio 1:50" }],
    ["5k-run", 16, { timeSeconds: 1440 }],
    ["max-pullups", 13, { reps: 15 }],
    ["max-pullups", 1, { reps: 18, notes: "Nuevo máximo" }],
  ] as const;

  for (const [slug, days, score] of prAttempts) {
    const personalRecord = await prisma.personalRecord.findFirst({
      where: { slug, isSeed: true },
    });
    if (!personalRecord) continue;

    const id = `demo-pr-${slug}-${days}`;
    await prisma.personalRecordAttempt.upsert({
      where: { id },
      create: {
        id,
        guestId: DEMO_GUEST_ID,
        personalRecordId: personalRecord.id,
        performedAt: daysAgo(days),
        ...score,
      },
      update: {
        personalRecordId: personalRecord.id,
        performedAt: daysAgo(days),
        ...score,
      },
    });
  }

  for (const slug of ["fran", "grace", "cindy"]) {
    const workout = await prisma.workout.findFirst({
      where: { slug, isSeed: true },
    });
    if (!workout) continue;
    await prisma.favorite.upsert({
      where: {
        guestId_targetType_targetId: {
          guestId: DEMO_GUEST_ID,
          targetType: "WORKOUT",
          targetId: workout.id,
        },
      },
      create: {
        guestId: DEMO_GUEST_ID,
        targetType: "WORKOUT",
        targetId: workout.id,
      },
      update: {},
    });
  }

  const snatch = await prisma.personalRecord.findFirst({
    where: { slug: "snatch", isSeed: true },
  });
  if (snatch) {
    await prisma.favorite.upsert({
      where: {
        guestId_targetType_targetId: {
          guestId: DEMO_GUEST_ID,
          targetType: "PERSONAL_RECORD",
          targetId: snatch.id,
        },
      },
      create: {
        guestId: DEMO_GUEST_ID,
        targetType: "PERSONAL_RECORD",
        targetId: snatch.id,
      },
      update: {},
    });
  }

  console.log(`Perfil demo listo: ${workoutResults.length} WODs y ${prAttempts.length} intentos PR`);
}
