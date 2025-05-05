// src/components/AttendanceChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AttendanceChart({
  data,
}: {
  data: { schoolName: string; count: number; fill?: string }[];
}) {
  // Cycle colors for each school
  const colors = ["#C3EBFA", "#FFD1DC", "#CFCEFF"]; // lamaSky, pink, lamaPurple
  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }));

  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={chartData} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
        <XAxis
          dataKey="schoolName"
          axisLine={false}
          tick={{ fill: "#000" }}
          tickLine={false}
        />
        <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            borderColor: "#F1F0FF", // lamaPurpleLight
            backgroundColor: "white",
          }}
          labelStyle={{ color: "#5244F3" }}
          formatter={(value: number) => [`${value} assignments`, "Assignments"]}
        />
        <Legend
          align="left"
          verticalAlign="top"
          wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
        />
        <Bar
          dataKey="count"
          name="Assignments"
          fill="#FAE27C" // Fallback, overridden by chartData.fill
          legendType="circle"
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}