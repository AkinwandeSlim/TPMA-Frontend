"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CountChart from "./CountChart";
import { API_BASE_URL } from "@/lib/api";
export default function CountChartContainer() {
  const [male, setMale] = useState(0);
  const [female, setFemale] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
      if (!token) {
        console.log("No token found for CountChartContainer");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/trainee-gender`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        console.log("CountChartContainer - Data:", data);
        setMale(data.male || 0);
        setFemale(data.female || 0);
      } catch (error: any) {
        console.error("CountChartContainer - Fetch error:", error.response?.data || error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-md h-full">
      <h2 className="text-xl font-semibold mb-4">Trainee Gender Breakdown</h2>
      <CountChart male={male} female={female} />
    </div>
  );
}






















