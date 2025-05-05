"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

type Announcement = {
  title: string;
  description: string;
  date: string;
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // const fetchAnnouncements = async () => {
  //   const token = document.cookie
  //     .split("; ")
  //     .find((row) => row.startsWith("token="))
  //     ?.split("=")[1];

  //   if (!token) {
  //     console.log("No token found for Announcements");
  //     setAnnouncements([]);
  //     return;
  //   }

  //   try {
  //     const response = await axios.get("http://localhost:5000/api/announcements", {
  //       headers: { Authorization: `Bearer ${token}` },
  //       params: { limit: 3 },
  //     });
  //     console.log("Announcements - Data:", response.data);

  //     // Validate response structure
  //     const data = response.data.announcements || response.data;
  //     if (!Array.isArray(data)) {
  //       console.error("Announcements - Invalid response format:", response.data);
  //       setAnnouncements([]);
  //       return;
  //     }

  //     // Sort by date descending and take top 3
  //     const sortedAnnouncements = data
  //       .filter((ann: Announcement) => ann.date && typeof ann.date === "string")
  //       .sort((a: Announcement, b: Announcement) => {
  //         const dateA = new Date(a.date);
  //         const dateB = new Date(b.date);
  //         return isNaN(dateB.getTime()) || isNaN(dateA.getTime()) ? 0 : dateB.getTime() - dateA.getTime();
  //       })
  //       .slice(0, 3);

  //     setAnnouncements(sortedAnnouncements);
  //   } catch (error) {
  //     console.error("Announcements - Fetch error:", error.response?.data || error.message);
  //     setAnnouncements([]);
  //   }
  // };

  const fetchAnnouncements = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      console.log("No token found for Announcements");
      setAnnouncements([]);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/announcements", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 3 },
      });
      console.log("Announcements - Data:", response.data);

      // Validate response structure
      const data = response.data.announcements || response.data;
      if (!Array.isArray(data)) {
        console.error("Announcements - Invalid response format:", response.data);
        setAnnouncements([]);
        return;
      }

      // Sort by date descending and take top 3
      const sortedAnnouncements = data
        .filter((ann: Announcement) => ann.date && typeof ann.date === "string")
        .sort((a: Announcement, b: Announcement) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return isNaN(dateB.getTime()) || isNaN(dateA.getTime()) ? 0 : dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);

      setAnnouncements(sortedAnnouncements);
    } catch (error: any) {
      console.error("Announcements - Fetch error:", error.response?.data || error.message);
      setAnnouncements([]);
    }
  };



  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Helper to format date safely
  const formatDate = (dateString?: string): string => {
    if (!dateString || typeof dateString !== "string") {
      return "Date unavailable";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="bg-white rounded-md p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements.length === 0 ? (
          <div className="text-sm text-gray-400">No announcements available</div>
        ) : (
          announcements.slice(0, 3).map((ann, index) => (
            <div
              key={ann.date + index} // Use index to ensure uniqueness if dates repeat
              className={`rounded-md p-4 ${
                index === 0 ? "bg-lamaSkyLight" : index === 1 ? "bg-lamaPurpleLight" : "bg-lamaYellowLight"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{ann.title || "Untitled"}</h2>
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {formatDate(ann.date)}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{ann.description || "No description"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}






































// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";

// type Announcement = {
//   title: string;
//   description: string;
//   date: string;
// };

// export default function Announcements() {
//   const [announcements, setAnnouncements] = useState<Announcement[]>([]);

//   const fetchAnnouncements = async () => {
//     const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
//     if (!token) {
//       console.log("No token found for Announcements");
//       return;
//     }

//     try {
//       const response = await axios.get("http://localhost:5000/api/announcements", {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { limit: 3 }, // Optional: Add limit if Flask supports it
//       });
//       console.log("Announcements - Data:", response.data);
//       // Sort by date descending and take top 3 (if Flask doesn’t already limit)
//       const sortedAnnouncements = response.data
//         .sort((a: Announcement, b: Announcement) => new Date(b.date).getTime() - new Date(a.date).getTime())
//         .slice(0, 3);
//       setAnnouncements(sortedAnnouncements);
//     } catch (error) {
//       console.error("Announcements - Fetch error:", error.response?.data || error.message);
//     }
//   };

//   useEffect(() => {
//     fetchAnnouncements();
//   }, []);

//   return (
//     <div className="bg-white rounded-md p-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-lg font-semibold">Announcements</h1>
//         <span className="text-xs text-gray-400">View All</span>
//       </div>
//       <div className="flex flex-col gap-4 mt-4">
//         {announcements[0] && (
//           <div className="bg-lamaSkyLight rounded-md p-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-medium">{announcements[0].title}</h2>
//               <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
//                 {new Intl.DateTimeFormat("en-GB").format(new Date(announcements[0].date))}
//               </span>
//             </div>
//             <p className="text-sm text-gray-400 mt-1">{announcements[0].description}</p>
//           </div>
//         )}
//         {announcements[1] && (
//           <div className="bg-lamaPurpleLight rounded-md p-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-medium">{announcements[1].title}</h2>
//               <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
//                 {new Intl.DateTimeFormat("en-GB").format(new Date(announcements[1].date))}
//               </span>
//             </div>
//             <p className="text-sm text-gray-400 mt-1">{announcements[1].description}</p>
//           </div>
//         )}
//         {announcements[2] && (
//           <div className="bg-lamaYellowLight rounded-md p-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-medium">{announcements[2].title}</h2>
//               <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
//                 {new Intl.DateTimeFormat("en-GB").format(new Date(announcements[2].date))}
//               </span>
//             </div>
//             <p className="text-sm text-gray-400 mt-1">{announcements[2].description}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





















// import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// const Announcements = async () => {
//   const { userId, sessionClaims } = auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const roleConditions = {
//     teacher: { lessons: { some: { teacherId: userId! } } },
//     student: { students: { some: { id: userId! } } },
//     parent: { students: { some: { parentId: userId! } } },
//   };

//   const data = await prisma.announcement.findMany({
//     take: 3,
//     orderBy: { date: "desc" },
//     where: {
//       ...(role !== "admin" && {
//         OR: [
//           { classId: null },
//           { class: roleConditions[role as keyof typeof roleConditions] || {} },
//         ],
//       }),
//     },
//   });

//   return (
//     <div className="bg-white p-4 rounded-md">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Announcements</h1>
//         <span className="text-xs text-gray-400">View All</span>
//       </div>
//       <div className="flex flex-col gap-4 mt-4">
//         {data[0] && (
//           <div className="bg-lamaSkyLight rounded-md p-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-medium">{data[0].title}</h2>
//               <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
//                 {new Intl.DateTimeFormat("en-GB").format(data[0].date)}
//               </span>
//             </div>
//             <p className="text-sm text-gray-400 mt-1">{data[0].description}</p>
//           </div>
//         )}
//         {data[1] && (
//           <div className="bg-lamaPurpleLight rounded-md p-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-medium">{data[1].title}</h2>
//               <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
//                 {new Intl.DateTimeFormat("en-GB").format(data[1].date)}
//               </span>
//             </div>
//             <p className="text-sm text-gray-400 mt-1">{data[1].description}</p>
//           </div>
//         )}
//         {data[2] && (
//           <div className="bg-lamaYellowLight rounded-md p-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-medium">{data[2].title}</h2>
//               <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
//                 {new Intl.DateTimeFormat("en-GB").format(data[2].date)}
//               </span>
//             </div>
//             <p className="text-sm text-gray-400 mt-1">{data[2].description}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Announcements;
