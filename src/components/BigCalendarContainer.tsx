"use client";

import { useState } from "react";
import BigCalendar from "@/components/BigCalendar";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  onClick: () => void;
  onDelete: () => void;
}

interface BigCalendarContainerProps {
  type: string;
  id: string;
  events?: Event[];
}

const BigCalendarContainer = ({ type, id, events = [] }: BigCalendarContainerProps) => {
  const statusColors: { [key: string]: string } = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="mt-4">
      <BigCalendar
        events={events.map((event) => ({
          ...event,
          className: `${statusColors[event.status]} rounded-lg p-2`,
          onClick: event.onClick,
          onDelete: event.onDelete,
        }))}
      />
    </div>
  );
};

export default BigCalendarContainer;





















// "use client";

// import BigCalendar from "./BigCalendar";
// import { adjustScheduleToCurrentWeek } from "@/lib/utils";
// import { useEffect, useState } from "react";
// import axios from "axios";

// const BigCalendarContainer = ({
//   type,
//   id,
// }: {
//   type: "teacherId" | "classId" | "supervisorId";
//   id: string | number;
// }) => {
//   const [schedule, setSchedule] = useState<
//     { title: string; start: Date; end: Date }[]
//   >([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchLessons = async () => {
//       try {
//         const token = document.cookie
//           .split("; ")
//           .find((row) => row.startsWith("token="))
//           ?.split("=")[1];

//         if (!token) {
//           setError("Authentication token not found. Please sign in.");
//           return;
//         }

//         let endpoint = "";
//         if (type === "supervisorId") {
//           endpoint = `http://localhost:5000/api/lessons/supervisor/${id}`;
//         } else if (type === "teacherId") {
//           endpoint = `http://localhost:5000/api/lessons/teacher/${id}`; // Placeholder for future implementation
//         } else if (type === "classId") {
//           endpoint = `http://localhost:5000/api/lessons/class/${id}`; // Placeholder for future implementation
//         }

//         const response = await axios.get(endpoint, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const lessons = response.data.lessons || [];

//         // Map the lessons to the format expected by BigCalendar
//         const formattedLessons = lessons.map((lesson: any) => ({
//           title: lesson.title,
//           start: new Date(lesson.start),
//           end: new Date(lesson.end),
//         }));

//         // Adjust the schedule to the current week
//         const adjustedSchedule = adjustScheduleToCurrentWeek(formattedLessons);

//         setSchedule(adjustedSchedule);
//         setError(null);
//       } catch (error: any) {
//         console.error("Error fetching lessons:", error);
//         setError("Failed to load schedule. Please try again later.");
//         setSchedule([]);
//       }
//     };

//     fetchLessons();
//   }, [type, id]);

//   if (error) {
//     return <div className="p-4 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="">
//       <BigCalendar data={schedule} />
//     </div>
//   );
// };

// export default BigCalendarContainer;


























// import prisma from "@/lib/prisma";
// import BigCalendar from "./BigCalender";
// import { adjustScheduleToCurrentWeek } from "@/lib/utils";

// const BigCalendarContainer = async ({
//   type,
//   id,
// }: {
//   type: "teacherId" | "classId";
//   id: string | number;
// }) => {
//   const dataRes = await prisma.lesson.findMany({
//     where: {
//       ...(type === "teacherId"
//         ? { teacherId: id as string }
//         : { classId: id as number }),
//     },
//   });

//   const data = dataRes.map((lesson) => ({
//     title: lesson.name,
//     start: lesson.startTime,
//     end: lesson.endTime,
//   }));

//   const schedule = adjustScheduleToCurrentWeek(data);

//   return (
//     <div className="">
//       <BigCalendar data={schedule} />
//     </div>
//   );
// };

// export default BigCalendarContainer;
