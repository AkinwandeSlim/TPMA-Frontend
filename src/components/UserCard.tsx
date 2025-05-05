"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";


export default function UserCard({ type }: { type: "admin" | "supervisor" | "teacherTrainee" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
      if (!token) {
        console.log(`No token found for ${type}`);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        console.log(`UserCard (${type}) - Data:`, data);

        switch (type) {
          case "admin":
            setCount(data.total_admins || 0);
            break;
          case "supervisor":
            setCount(data.total_supervisors || 0);
            break;
          case "teacherTrainee":
            setCount(data.total_trainees || 0);
            break;
        }
      } catch (error:any) {
        console.error(`UserCard (${type}) - Fetch error:`, error.response?.data || error.message);
      }
    };

    fetchCount();
  }, [type]);

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2025
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{count}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">
        {type === "teacherTrainee" ? "Teacher Trainees" : `${type}s`}
      </h2>
    </div>
  );
}















