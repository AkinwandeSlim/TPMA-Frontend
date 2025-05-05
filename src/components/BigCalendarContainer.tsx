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




















