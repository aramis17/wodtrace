"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatScore } from "@/lib/scoring";
import type { ScoreType } from "@/lib/types";

export interface ChartPoint {
  date: string;
  label: string;
  timeSeconds?: number | null;
  reps?: number | null;
  weightKg?: number | null;
  rounds?: number | null;
  extraReps?: number | null;
  customValue?: string | null;
  sortValue: number;
}

export function ScoreChart({
  data,
  scoreType,
  weightUnit = "KG",
}: {
  data: ChartPoint[];
  scoreType: ScoreType;
  weightUnit?: "KG" | "LB";
}) {
  if (data.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Registra al menos 2 resultados para ver la gráfica.
      </p>
    );
  }

  const chartData = [...data].reverse().map((d) => ({
    ...d,
    y: scoreType === "TIME" ? (d.timeSeconds ?? 0) : d.sortValue,
  }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#343842" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#858995", fontSize: 11 }}
            axisLine={{ stroke: "#343842" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#858995", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            reversed={scoreType === "TIME"}
            tickFormatter={(v) => {
              if (scoreType === "TIME") {
                const m = Math.floor(Number(v) / 60);
                const s = Math.round(Number(v) % 60);
                return `${m}:${String(s).padStart(2, "0")}`;
              }
              return String(v);
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#1C1F27",
              border: "1px solid #343842",
              borderRadius: 12,
              color: "#FAFAFA",
            }}
            formatter={(_value, _name, item) => {
              const p = item.payload as ChartPoint;
              return formatScore(scoreType, p, { weightUnit }).primary;
            }}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as ChartPoint | undefined;
              return p?.date ?? "";
            }}
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#FF3D23"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#FF6B35", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
