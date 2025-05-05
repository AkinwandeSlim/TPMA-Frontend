"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CountChart from "./CountChart";

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
        const response = await axios.get("http://localhost:5000/api/admin/trainee-gender", {
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























// import Image from "next/image";
// import CountChart from "./CountChart";
// import prisma from "@/lib/prisma";

// const CountChartContainer = async () => {
//   const data = await prisma.student.groupBy({
//     by: ["sex"],
//     _count: true,
//   });

//   const boys = data.find((d) => d.sex === "MALE")?._count || 0;
//   const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;

//   return (
//     <div className="bg-white rounded-xl w-full h-full p-4">
//       {/* TITLE */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Students</h1>
//         <Image src="/moreDark.png" alt="" width={20} height={20} />
//       </div>
//       {/* CHART */}
//       <CountChart boys={boys} girls={girls} />
//       {/* BOTTOM */}
//       <div className="flex justify-center gap-16">
//         <div className="flex flex-col gap-1">
//           <div className="w-5 h-5 bg-lamaSky rounded-full" />
//           <h1 className="font-bold">{boys}</h1>
//           <h2 className="text-xs text-gray-300">
//             Boys ({Math.round((boys / (boys + girls)) * 100)}%)
//           </h2>
//         </div>
//         <div className="flex flex-col gap-1">
//           <div className="w-5 h-5 bg-lamaYellow rounded-full" />
//           <h1 className="font-bold">{girls}</h1>
//           <h2 className="text-xs text-gray-300">
//             Girls ({Math.round((girls / (boys + girls)) * 100)}%)
//           </h2>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CountChartContainer;
