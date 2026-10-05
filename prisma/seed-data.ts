import type { ScoreType } from "../src/lib/types";

export const SEED_VERSION = 2;

export const CATEGORIES = [
  {
    slug: "girls",
    name: "Girls",
    description: "Benchmarks clásicos con nombre de mujer",
    sortOrder: 1,
  },
  {
    slug: "heroes",
    name: "Heroes",
    description: "WODs en honor a héroes caídos",
    sortOrder: 2,
  },
  {
    slug: "open",
    name: "Open",
    description: "Workouts del CrossFit Open",
    sortOrder: 3,
  },
  {
    slug: "bodyweight",
    name: "Peso corporal",
    description: "Sin material o mínimo equipamiento",
    sortOrder: 4,
  },
  {
    slug: "benchmarks",
    name: "Benchmarks",
    description: "Pruebas de referencia y Girl variants",
    sortOrder: 5,
  },
  {
    slug: "custom",
    name: "Personalizados",
    description: "Tus WODs creados",
    sortOrder: 6,
  },
] as const;

export interface SeedWorkout {
  slug: string;
  name: string;
  category: string;
  scoreType: ScoreType;
  description: string;
  scheme?: string;
  rxNotes?: string;
  scaledNotes?: string;
}

export const WORKOUTS: SeedWorkout[] = [
  {
    slug: "fran",
    name: "Fran",
    category: "girls",
    scoreType: "TIME",
    description: "21-15-9 reps de thrusters y pull-ups",
    scheme: "For time",
    rxNotes: "Thrusters 43/29 kg",
    scaledNotes: "Thrusters 29/20 kg · jumping pull-ups",
  },
  {
    slug: "grace",
    name: "Grace",
    category: "girls",
    scoreType: "TIME",
    description: "30 clean and jerks",
    scheme: "For time",
    rxNotes: "61/43 kg",
    scaledNotes: "43/29 kg",
  },
  {
    slug: "helen",
    name: "Helen",
    category: "girls",
    scoreType: "TIME",
    description: "3 rondas: 400 m run, 21 kettlebell swing, 12 pull-ups",
    scheme: "For time",
    rxNotes: "KB 24/16 kg",
    scaledNotes: "KB 16/12 kg · ring rows",
  },
  {
    slug: "annie",
    name: "Annie",
    category: "girls",
    scoreType: "TIME",
    description: "50-40-30-20-10 double-unders y sit-ups",
    scheme: "For time",
    scaledNotes: "Single-unders ×2",
  },
  {
    slug: "cindy",
    name: "Cindy",
    category: "girls",
    scoreType: "AMRAP",
    description: "AMRAP 20: 5 pull-ups, 10 push-ups, 15 air squats",
    scheme: "AMRAP 20 min",
    scaledNotes: "Ring rows · knee push-ups",
  },
  {
    slug: "mary",
    name: "Mary",
    category: "girls",
    scoreType: "AMRAP",
    description: "AMRAP 20: 5 HSPU, 10 pistol squats, 15 pull-ups",
    scheme: "AMRAP 20 min",
  },
  {
    slug: "diane",
    name: "Diane",
    category: "girls",
    scoreType: "TIME",
    description: "21-15-9 deadlifts y HSPU",
    scheme: "For time",
    rxNotes: "DL 102/70 kg",
    scaledNotes: "DL 70/48 kg · pike push-ups",
  },
  {
    slug: "elizabeth",
    name: "Elizabeth",
    category: "girls",
    scoreType: "TIME",
    description: "21-15-9 cleans y ring dips",
    scheme: "For time",
    rxNotes: "Cleans 61/43 kg",
  },
  {
    slug: "karen",
    name: "Karen",
    category: "girls",
    scoreType: "TIME",
    description: "150 wall balls",
    scheme: "For time",
    rxNotes: "9/6 kg a 3/2.7 m",
  },
  {
    slug: "isabel",
    name: "Isabel",
    category: "girls",
    scoreType: "TIME",
    description: "30 snatches",
    scheme: "For time",
    rxNotes: "61/43 kg",
  },
  {
    slug: "murph",
    name: "Murph",
    category: "heroes",
    scoreType: "TIME",
    description:
      "1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run",
    scheme: "For time",
    rxNotes: "Chaleco 9/6 kg · partición permitida",
    scaledNotes: "Sin chaleco · reducir volumen",
  },
  {
    slug: "dt",
    name: "DT",
    category: "heroes",
    scoreType: "TIME",
    description: "5 rondas: 12 DL, 9 hang power clean, 6 push jerk",
    scheme: "For time",
    rxNotes: "70/48 kg",
  },
  {
    slug: "randy",
    name: "Randy",
    category: "heroes",
    scoreType: "TIME",
    description: "75 power snatches",
    scheme: "For time",
    rxNotes: "34/25 kg",
  },
  {
    slug: "michael",
    name: "Michael",
    category: "heroes",
    scoreType: "TIME",
    description: "3 rondas: 800 m run, 50 back extensions, 50 sit-ups",
    scheme: "For time",
  },
  {
    slug: "daniel",
    name: "Daniel",
    category: "heroes",
    scoreType: "TIME",
    description: "50 pull-ups, 400 m run, 21 thrusters, 800 m run, 21 thrusters, 400 m run, 50 pull-ups",
    scheme: "For time",
    rxNotes: "Thrusters 43/29 kg",
  },
  {
    slug: "open-24-1",
    name: "24.1",
    category: "open",
    scoreType: "TIME",
    description: "21-15-9 dumbbell snatches y lateral burpees over DB",
    scheme: "For time (15 min cap)",
    rxNotes: "DB 22.5/15 kg",
  },
  {
    slug: "open-23-1",
    name: "23.1",
    category: "open",
    scoreType: "AMRAP",
    description: "AMRAP 14: 14 cal row, 14 thrusters, 21 chest-to-bar",
    scheme: "AMRAP 14 min",
    rxNotes: "Thrusters 43/29 kg",
  },
  {
    slug: "open-22-1",
    name: "22.1",
    category: "open",
    scoreType: "AMRAP",
    description: "AMRAP 15: 3 wall walks, 12 DB snatches, 15 box jump-overs",
    scheme: "AMRAP 15 min",
  },
  {
    slug: "open-21-1",
    name: "21.1",
    category: "open",
    scoreType: "TIME",
    description: "1-3-6-9-12-15 wall walks y double-unders crecientes",
    scheme: "For time (15 min cap)",
  },
  {
    slug: "burpee-mile",
    name: "Burpee Mile",
    category: "bodyweight",
    scoreType: "TIME",
    description: "1 milla de burpees (aprox. 1609 burpee broad jumps)",
    scheme: "For time",
  },
  {
    slug: "angie",
    name: "Angie",
    category: "bodyweight",
    scoreType: "TIME",
    description: "100 pull-ups, 100 push-ups, 100 sit-ups, 100 squats",
    scheme: "For time",
  },
  {
    slug: "chelsea",
    name: "Chelsea",
    category: "bodyweight",
    scoreType: "AMRAP",
    description: "EMOM 30: 5 pull-ups, 10 push-ups, 15 squats",
    scheme: "EMOM 30 (rounds completed)",
  },
  {
    slug: "tabata-something",
    name: "Tabata Something Else",
    category: "bodyweight",
    scoreType: "AMRAP",
    description: "Tabata pull-ups, push-ups, sit-ups, squats (menor reps total)",
    scheme: "4 × Tabata",
  },
  {
    slug: "fight-gone-bad",
    name: "Fight Gone Bad",
    category: "benchmarks",
    scoreType: "AMRAP",
    description:
      "3 rondas: wall ball, SDHP, box jump, push press, row — 1 min cada estación",
    scheme: "3 rounds · total reps",
    rxNotes: "WB 9/6 · SDHP 34/25 · PP 34/25 · box 60/50",
  },
  {
    slug: "filthy-fifty",
    name: "Filthy Fifty",
    category: "benchmarks",
    scoreType: "TIME",
    description:
      "50 box jump, jumping pull-ups, KB swing, walking lunge, knees-to-elbows, push press, back extension, wall ball, burpee, double-under",
    scheme: "For time",
  },
  {
    slug: "the-chief",
    name: "The Chief",
    category: "benchmarks",
    scoreType: "AMRAP",
    description: "5 × (AMRAP 3: 3 power cleans, 6 push-ups, 9 squats) + 1 min rest",
    scheme: "5 × AMRAP 3",
    rxNotes: "Cleans 61/43 kg",
  },
  {
    slug: "jackie",
    name: "Jackie",
    category: "benchmarks",
    scoreType: "TIME",
    description: "1000 m row, 50 thrusters, 30 pull-ups",
    scheme: "For time",
    rxNotes: "Thrusters 20/15 kg",
  },
];

export interface SeedPR {
  slug: string;
  name: string;
  scoreType: ScoreType;
}

export const PERSONAL_RECORDS: SeedPR[] = [
  { slug: "back-squat", name: "Back Squat", scoreType: "WEIGHT" },
  { slug: "front-squat", name: "Front Squat", scoreType: "WEIGHT" },
  { slug: "overhead-squat", name: "Overhead Squat", scoreType: "WEIGHT" },
  { slug: "deadlift", name: "Deadlift", scoreType: "WEIGHT" },
  { slug: "shoulder-press", name: "Shoulder Press", scoreType: "WEIGHT" },
  { slug: "push-press", name: "Push Press", scoreType: "WEIGHT" },
  { slug: "push-jerk", name: "Push Jerk", scoreType: "WEIGHT" },
  { slug: "bench-press", name: "Bench Press", scoreType: "WEIGHT" },
  { slug: "clean", name: "Clean", scoreType: "WEIGHT" },
  { slug: "clean-and-jerk", name: "Clean & Jerk", scoreType: "WEIGHT" },
  { slug: "snatch", name: "Snatch", scoreType: "WEIGHT" },
  { slug: "power-clean", name: "Power Clean", scoreType: "WEIGHT" },
  { slug: "power-snatch", name: "Power Snatch", scoreType: "WEIGHT" },
  { slug: "thruster", name: "Thruster", scoreType: "WEIGHT" },
  { slug: "weighted-pullup", name: "Weighted Pull-up", scoreType: "WEIGHT" },
  { slug: "max-pullups", name: "Max Pull-ups", scoreType: "AMRAP" },
  { slug: "max-hspu", name: "Max HSPU", scoreType: "AMRAP" },
  { slug: "max-muscleups", name: "Max Muscle-ups", scoreType: "AMRAP" },
  { slug: "500m-row", name: "500 m Row", scoreType: "TIME" },
  { slug: "2k-row", name: "2k Row", scoreType: "TIME" },
  { slug: "5k-run", name: "5k Run", scoreType: "TIME" },
  { slug: "1-mile-run", name: "1 Mile Run", scoreType: "TIME" },
];

export const ATHLETIC_LEVELS = [
  {
    slug: "initiate",
    name: "Iniciado",
    description: "Bases de movimiento y consistencia",
    sortOrder: 0,
    color: "#858995",
  },
  {
    slug: "operator",
    name: "Operador",
    description: "Competencia sólida en gymnastic y barbell",
    sortOrder: 1,
    color: "#55C6FF",
  },
  {
    slug: "specialist",
    name: "Especialista",
    description: "Alto rendimiento y benchmarks exigentes",
    sortOrder: 2,
    color: "#FFB703",
  },
  {
    slug: "elite",
    name: "Élite",
    description: "Nivel competitivo avanzado",
    sortOrder: 3,
    color: "#FF3D23",
  },
] as const;

/** 31 standards × 4 levels = 124 reference goals */
const STANDARD_DEFS: {
  name: string;
  category: string;
  values: [string, string, string, string]; // initiate → elite (male-ish display)
  unit: string;
}[] = [
  { name: "Back Squat", category: "Fuerza", values: ["60 kg", "100 kg", "140 kg", "180 kg"], unit: "kg" },
  { name: "Front Squat", category: "Fuerza", values: ["50 kg", "85 kg", "120 kg", "150 kg"], unit: "kg" },
  { name: "Overhead Squat", category: "Fuerza", values: ["40 kg", "70 kg", "100 kg", "130 kg"], unit: "kg" },
  { name: "Deadlift", category: "Fuerza", values: ["80 kg", "140 kg", "180 kg", "220 kg"], unit: "kg" },
  { name: "Shoulder Press", category: "Fuerza", values: ["30 kg", "50 kg", "70 kg", "90 kg"], unit: "kg" },
  { name: "Push Press", category: "Fuerza", values: ["40 kg", "70 kg", "95 kg", "120 kg"], unit: "kg" },
  { name: "Push Jerk", category: "Fuerza", values: ["40 kg", "75 kg", "100 kg", "130 kg"], unit: "kg" },
  { name: "Bench Press", category: "Fuerza", values: ["40 kg", "80 kg", "110 kg", "140 kg"], unit: "kg" },
  { name: "Clean", category: "Halterofilia", values: ["40 kg", "80 kg", "110 kg", "140 kg"], unit: "kg" },
  { name: "Clean & Jerk", category: "Halterofilia", values: ["40 kg", "80 kg", "110 kg", "140 kg"], unit: "kg" },
  { name: "Snatch", category: "Halterofilia", values: ["30 kg", "60 kg", "90 kg", "115 kg"], unit: "kg" },
  { name: "Power Clean", category: "Halterofilia", values: ["40 kg", "75 kg", "105 kg", "130 kg"], unit: "kg" },
  { name: "Power Snatch", category: "Halterofilia", values: ["30 kg", "55 kg", "80 kg", "100 kg"], unit: "kg" },
  { name: "Thruster", category: "Halterofilia", values: ["30 kg", "60 kg", "85 kg", "110 kg"], unit: "kg" },
  { name: "Fran", category: "Benchmark", values: ["8:00", "5:00", "3:30", "2:30"], unit: "tiempo" },
  { name: "Grace", category: "Benchmark", values: ["5:00", "3:00", "2:00", "1:30"], unit: "tiempo" },
  { name: "Helen", category: "Benchmark", values: ["14:00", "11:00", "9:00", "7:30"], unit: "tiempo" },
  { name: "Cindy", category: "Benchmark", values: ["10 r", "15 r", "20 r", "25 r"], unit: "rondas" },
  { name: "Murph (rx chaleco)", category: "Benchmark", values: ["75:00", "55:00", "45:00", "38:00"], unit: "tiempo" },
  { name: "Pull-ups max", category: "Gimnasia", values: ["5", "15", "25", "40"], unit: "reps" },
  { name: "HSPU max", category: "Gimnasia", values: ["1", "8", "15", "25"], unit: "reps" },
  { name: "Muscle-ups max", category: "Gimnasia", values: ["—", "3", "8", "15"], unit: "reps" },
  { name: "Toes-to-bar max", category: "Gimnasia", values: ["5", "15", "25", "35"], unit: "reps" },
  { name: "Handstand walk", category: "Gimnasia", values: ["—", "5 m", "15 m", "30 m"], unit: "m" },
  { name: "Double-unders unbroken", category: "Skill", values: ["10", "50", "100", "150"], unit: "reps" },
  { name: "500 m Row", category: "Monostructural", values: ["2:00", "1:40", "1:30", "1:22"], unit: "tiempo" },
  { name: "2k Row", category: "Monostructural", values: ["8:30", "7:30", "6:50", "6:20"], unit: "tiempo" },
  { name: "5k Run", category: "Monostructural", values: ["30:00", "24:00", "20:00", "17:30"], unit: "tiempo" },
  { name: "1 Mile Run", category: "Monostructural", values: ["9:00", "7:00", "6:00", "5:15"], unit: "tiempo" },
  { name: "Fight Gone Bad", category: "Benchmark", values: ["200", "300", "370", "430"], unit: "pts" },
  { name: "Filthy Fifty", category: "Benchmark", values: ["35:00", "25:00", "20:00", "16:00"], unit: "tiempo" },
];

export function buildStandards() {
  const out: {
    levelSlug: string;
    name: string;
    category: string;
    maleValue: string;
    femaleValue: string;
    unit: string;
    sortOrder: number;
  }[] = [];

  STANDARD_DEFS.forEach((def, i) => {
    ATHLETIC_LEVELS.forEach((level, li) => {
      out.push({
        levelSlug: level.slug,
        name: def.name,
        category: def.category,
        maleValue: def.values[li],
        femaleValue: def.values[li],
        unit: def.unit,
        sortOrder: i,
      });
    });
  });

  return out;
}
