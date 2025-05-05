// src/components/AttendanceChartContainer.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import { getAssignmentsBySchool } from "@/lib/api";

export default function AttendanceChartContainer() {
  const [data, setData] = useState<{ schoolName: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAssignmentsBySchool();
        if (response?.data) {
          setData(response.data);
          console.log("AttendanceChartContainer - Data:", response.data);
        }
      } catch (error: any) {
        console.error(
          "AttendanceChartContainer - Fetch error:",
          error.message
        );
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold ">
          Assignments by School
        </h1>
        <Image src="/moreDark.png" alt="Options" width={20} height={20} />
      </div>
      <AttendanceChart data={data} />
    </div>
  );
}