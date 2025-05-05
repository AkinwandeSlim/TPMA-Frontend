import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import AddEventForm from "./forms/AddEventForm";

const EventCalendarContainer = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const date = searchParams?.date || new Date().toISOString().split("T")[0]; // Fallback to today if no date in searchParams

  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalendar />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
{/*        <AddEventForm
          selectedDate={date}
          onEventAdded={() => document.dispatchEvent(new Event("eventAdded"))}
        />*/}
        <EventList
          dateParam={date}
          onEventAddedCallback={() =>
            document.dispatchEvent(new Event("eventAdded"))
          }
        />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
























// import Image from "next/image";



// import EventCalendar from "./EventCalendar";
// import EventList from "./EventList";

// const EventCalendarContainer = ({
//   searchParams,
// }: {
//   searchParams: { [keys: string]: string | undefined };
// }) => {
//   const date = searchParams?.date || new Date().toISOString().split("T")[0]; // Fallback to today if no date in searchParams

//   return (
//     <div className="bg-white p-4 rounded-md">
//       <EventCalendar />
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold my-4">Events</h1>
//         <Image src="/moreDark.png" alt="" width={20} height={20} />
//       </div>
//       <div className="flex flex-col gap-4">
//         <EventList dateParam={date} />
//       </div>
//     </div>
//   );
// };

// export default EventCalendarContainer;






















// import prisma from "@/lib/prisma";
// import EventCalendar from "./EventCalendar";

// type EventCalendarContainerProps = {
//   searchParams: { [key: string]: string | undefined };
// };

// export default async function EventCalendarContainer({ searchParams }: EventCalendarContainerProps) {
//   const events = await prisma.event.findMany({
//     select: {
//       id: true,
//       title: true,
//       startTime: true,
//       endTime: true,
//       class: { select: { name: true } },
//     },
//   });

//   const formattedEvents = events.map((event) => ({
//     id: event.id,
//     title: `${event.title} (${event.class?.name || "All"})`,
//     start: event.startTime,
//     end: event.endTime,
//   }));

//   return (
//     <div className="bg-white rounded-md p-4 h-[450px]">
//       <h1 className="text-lg font-semibold">Events</h1>
//       <EventCalendar events={formattedEvents} />
//     </div>
//   );
// }

























// // import Image from "next/image";
// // import EventCalendar from "./EventCalendar";
// // import EventList from "./EventList";

// // const EventCalendarContainer = async ({
// //   searchParams,
// // }: {
// //   searchParams: { [keys: string]: string | undefined };
// // }) => {
// //   const { date } = searchParams;
// //   return (
// //     <div className="bg-white p-4 rounded-md">
// //       <EventCalendar />
// //       <div className="flex items-center justify-between">
// //         <h1 className="text-xl font-semibold my-4">Events</h1>
// //         <Image src="/moreDark.png" alt="" width={20} height={20} />
// //       </div>
// //       <div className="flex flex-col gap-4">
// //         <EventList dateParam={date} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default EventCalendarContainer;
