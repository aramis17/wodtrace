import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ATHLETIC_LEVELS,
  CATEGORIES,
  PERSONAL_RECORDS,
  SEED_VERSION,
  WORKOUTS,
  buildStandards,
} from "./seed-data";
import { seedDemoData } from "./seed-demo";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const meta = await prisma.seedMeta.findUnique({ where: { id: "main" } });
  if (meta && meta.version >= SEED_VERSION) {
    console.log(`Seeds already at v${meta.version}, skipping.`);
    await seedDemoData(prisma);
    return;
  }

  for (const cat of CATEGORIES) {
    await prisma.workoutCategory.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isSeed: true,
      },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });
  }

  const cats = await prisma.workoutCategory.findMany();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  for (const w of WORKOUTS) {
    const existing = await prisma.workout.findFirst({
      where: { slug: w.slug, isSeed: true },
    });
    const data = {
      slug: w.slug,
      name: w.name,
      description: w.description,
      scoreType: w.scoreType,
      scheme: w.scheme,
      rxNotes: w.rxNotes,
      scaledNotes: w.scaledNotes,
      isSeed: true,
      isCustom: false,
      categoryId: catBySlug[w.category],
    };
    if (existing) {
      await prisma.workout.update({ where: { id: existing.id }, data });
    } else {
      await prisma.workout.create({ data });
    }
  }

  for (const pr of PERSONAL_RECORDS) {
    const existing = await prisma.personalRecord.findFirst({
      where: { slug: pr.slug, isSeed: true },
    });
    const data = {
      slug: pr.slug,
      name: pr.name,
      scoreType: pr.scoreType,
      isSeed: true,
      isCustom: false,
    };
    if (existing) {
      await prisma.personalRecord.update({ where: { id: existing.id }, data });
    } else {
      await prisma.personalRecord.create({ data });
    }
  }

  for (const level of ATHLETIC_LEVELS) {
    await prisma.athleticLevel.upsert({
      where: { slug: level.slug },
      create: {
        slug: level.slug,
        name: level.name,
        description: level.description,
        sortOrder: level.sortOrder,
        color: level.color,
      },
      update: {
        name: level.name,
        description: level.description,
        sortOrder: level.sortOrder,
        color: level.color,
      },
    });
  }

  const levels = await prisma.athleticLevel.findMany();
  const levelBySlug = Object.fromEntries(levels.map((l) => [l.slug, l.id]));

  // Refresh standards
  await prisma.athleticStandard.deleteMany({});
  const standards = buildStandards();
  await prisma.athleticStandard.createMany({
    data: standards.map((s) => ({
      levelId: levelBySlug[s.levelSlug],
      name: s.name,
      category: s.category,
      maleValue: s.maleValue,
      femaleValue: s.femaleValue,
      unit: s.unit,
      sortOrder: s.sortOrder,
    })),
  });

  await prisma.seedMeta.upsert({
    where: { id: "main" },
    create: { id: "main", version: SEED_VERSION },
    update: { version: SEED_VERSION, appliedAt: new Date() },
  });

  await seedDemoData(prisma);

  console.log(
    `Seeded v${SEED_VERSION}: ${WORKOUTS.length} WODs, ${PERSONAL_RECORDS.length} PRs, ${standards.length} standards`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
