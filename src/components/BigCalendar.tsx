// components/BigCalendar.tsx
"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  onClick: () => void;
  onDelete: () => void;
  className?: string;
}

interface BigCalendarProps {
  events: Event[];
}

const BigCalendar = ({ events }: BigCalendarProps) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const minTime = new Date();
  minTime.setHours(7, 0, 0, 0); // 7:00 AM local time
  const maxTime = new Date();
  maxTime.setHours(18, 0, 0, 0); // 6:00 PM local time

  const eventStyleGetter = (event: Event) => {
    return {
      className: event.className || "",
    };
  };

  const EventComponent = ({ event }: { event: Event }) => (
    <div className="flex items-center justify-between">
      <span className="truncate">{event.title}</span>
    </div>
  );

  // Set default date to the first event or today
  const defaultDate = events.length > 0 ? events[0].start : new Date();

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      style={{ height: "98%" }}
      onView={handleOnChangeView}
      min={minTime}
      max={maxTime}
      defaultDate={defaultDate}
      eventPropGetter={eventStyleGetter}
      components={{ event: EventComponent }}
      onSelectEvent={(event) => event.onClick()}
      step={15} // 15-minute time slots
      timeslots={4} // 4 slots per hour
      formats={{
        timeGutterFormat: "h:mm a", // Clear time labels
        eventTimeRangeFormat: ({ start, end }) =>
          `${moment(start).format("h:mm a")} - ${moment(end).format("h:mm a")}`,
      }}
    />
  );
};

export default BigCalendar;









































// "use client";

// import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { useState } from "react";
// import Image from "next/image";

// const localizer = momentLocalizer(moment);

// interface Event {
//   id: string;
//   title: string;
//   start: Date;
//   end: Date;
//   status: string;
//   onClick: () => void;
//   onDelete: () => void;
//   className?: string;
// }

// interface BigCalendarProps {
//   events: Event[];
// }

// const BigCalendar = ({ events }: BigCalendarProps) => {
//   const [view, setView] = useState<View>(Views.WORK_WEEK);

//   const handleOnChangeView = (selectedView: View) => {
//     setView(selectedView);
//   };

//   const minTime = new Date();
//   minTime.setUTCHours(8, 0, 0, 0); // 8:00 AM UTC
//   const maxTime = new Date();
//   maxTime.setUTCHours(17, 0, 0, 0); // 5:00 PM UTC

//   const eventStyleGetter = (event: Event) => {
//     return {
//       className: event.className || "",
//     };
//   };

//   const EventComponent = ({ event }: { event: Event }) => (
//     <div className="relative group">
//       <span>{event.title}</span>
//       <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             event.onClick();
//           }}
//           className="p-1 bg-[#C3EBFA] rounded-full hover:bg-[#A8D8EA]"
//         >
//           <Image src="/update.png" alt="Edit" width={12} height={12} />
//         </button>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             event.onDelete();
//           }}
//           className="p-1 bg-[#CFCEFF] rounded-full hover:bg-[#B6B5FF]"
//         >
//           <Image src="/delete.png" alt="Delete" width={12} height={12} />
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <Calendar
//       localizer={localizer}
//       events={events}
//       startAccessor="start"
//       endAccessor="end"
//       views={["work_week", "day"]}
//       view={view}
//       style={{ height: "98%" }}
//       onView={handleOnChangeView}
//       min={minTime}
//       max={maxTime}
//       defaultDate={new Date("2025-04-07")}
//       eventPropGetter={eventStyleGetter}
//       components={{
//         event: EventComponent,
//       }}
//       onSelectEvent={(event) => event.onClick()}
//     />
//   );
// };

// export default BigCalendar;













































// "use client";

// import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { useState } from "react";

// const localizer = momentLocalizer(moment);

// const BigCalendar = ({
//   data,
// }: {
//   data: { title: string; start: Date; end: Date }[];
// }) => {
//   const [view, setView] = useState<View>(Views.WORK_WEEK);

//   const handleOnChangeView = (selectedView: View) => {
//     setView(selectedView);
//   };

//   return (
//     <Calendar
//       localizer={localizer}
//       events={data}
//       startAccessor="start"
//       endAccessor="end"
//       views={["work_week", "day"]}
//       view={view}
//       style={{ height: "98%" }}
//       onView={handleOnChangeView}
//       min={new Date(2025, 1, 0, 8, 0, 0)}
//       max={new Date(2025, 1, 0, 17, 0, 0)}
//     />
//   );
// };

// export default BigCalendar;
