"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

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
        const response = await axios.get("http://localhost:5000/api/admin/reports", {
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


















// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import Image from "next/image";

// export default function UserCard({ type }: { type: "admin" | "supervisor" | "teacherTrainee" }) {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     const fetchCount = async () => {
//       const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
//       if (!token) return;

//       try {
//         let endpoint = "";
//         let countKey = "";
        
//         switch (type) {
//           case "admin":
//             endpoint = "/api/admin/reports";
//             countKey = "total_admins"; // We'll add this to Flask
//             break;
//           case "supervisor":
//             endpoint = "/api/admin/supervisors";
//             countKey = "length";
//             break;
//           case "teacherTrainee":
//             endpoint = "/api/admin/trainees";
//             countKey = "length";
//             break;
//         }

//         const response = await axios.get(`http://localhost:5000${endpoint}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         // Handle different response structures
//         const data = response.data;
//         setCount(countKey === "length" ? data.length : data[countKey] || 0);
//       } catch (error) {
//         console.error(`UserCard (${type}) - Fetch error:`, error);
//       }
//     };

//     fetchCount();
//   }, [type]);

//   return (
//     <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
//       <div className="flex justify-between items-center">
//         <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
//           2025
//         </span>
//         <Image src="/more.png" alt="" width={20} height={20} />
//       </div>
//       <h1 className="text-2xl font-semibold my-4">{count}</h1>
//       <h2 className="capitalize text-sm font-medium text-gray-500">
//         {type === "teacherTrainee" ? "Teacher Trainees" : `${type}s`}
//       </h2>
//     </div>
//   );
// }






























// import prisma from "@/lib/prisma";
// import Image from "next/image";

// const UserCard = async ({
//   type,
// }: {
//   type: "admin" | "teacher" | "student" | "parent";
// }) => {
//   const modelMap: Record<typeof type, any> = {
//     admin: prisma.admin,
//     teacher: prisma.teacher,
//     student: prisma.student,
//     parent: prisma.parent,
//   };

//   const data = await modelMap[type].count();

//   return (
//     <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
//       <div className="flex justify-between items-center">
//         <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
//           2024/25
//         </span>
//         <Image src="/more.png" alt="" width={20} height={20} />
//       </div>
//       <h1 className="text-2xl font-semibold my-4">{data}</h1>
//       <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
//     </div>
//   );
// };

// export default UserCard;
