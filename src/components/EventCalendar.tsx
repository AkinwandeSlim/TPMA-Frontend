"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      const formattedDate = value.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      router.push(`?date=${formattedDate}`);
    }
  }, [value, router]);

  return (
    <div className="bg-white p-4 rounded-md">
      <Calendar
        onChange={onChange}
        value={value}
        className="border-none text-gray-600"
        tileClassName="text-gray-600 hover:bg-gray-100 rounded-full"
        navigationLabel={({ date }) =>
          `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
        }
      />
    </div>
  );
};

export default EventCalendar;