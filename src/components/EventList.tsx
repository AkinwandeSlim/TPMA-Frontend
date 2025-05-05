"use client";

import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

interface EventListProps {
  dateParam: string;
  onEventAddedCallback?: () => void;
}

interface Event {
  id: string;
  title: string;
  description: string;
}

const EventList = ({ dateParam, onEventAddedCallback }: EventListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchEvents = useCallback(async () => {
    console.log("Fetching events for date:", dateParam);
    setLoading(true);
    setError(null);

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<{ data: Event[] }>("http://localhost:5000/api/events", {
        params: { date: dateParam },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(response.data.data)) {
        throw new Error("Expected an array of events");
      }
      setEvents(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.error("Fetch error:", error.response?.data || error.message);
      setError(error.response?.data?.error || error.message || "Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  }, [dateParam]);

  useEffect(() => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      fetchEvents();
    } else {
      setError("Invalid or missing date parameter.");
      setLoading(false);
    }
  }, [fetchEvents, dateParam, refreshKey]);

  useEffect(() => {
    const handleEventAdded = () => {
      setRefreshKey((prev) => prev + 1);
      if (onEventAddedCallback) onEventAddedCallback();
    };

    document.addEventListener("eventAdded", handleEventAdded);
    return () => document.removeEventListener("eventAdded", handleEventAdded);
  }, [onEventAddedCallback]);

  if (loading) {
    return (
      <div className="p-5 rounded-md border-2 border-gray-100 text-gray-500">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-md border-2 border-gray-100 text-red-500">
        {error}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="p-5 rounded-md border-2 border-gray-100 text-gray-500">
        No events scheduled for this day.
      </div>
    );
  }

  return (
    <>
      {events.map((event) => (
        <div
          className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
          key={event.id}
        >
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-gray-600">{event.title}</h1>
          </div>
          <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
        </div>
      ))}
    </>
  );
};

export default EventList;






































// // src/components/EventList.tsx
// "use client";

// import axios from "axios";
// import { useEffect, useState } from "react";

// const EventList = ({ dateParam, onEventAddedCallback }) => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const fetchEvents = async () => {
//     console.log("Fetching events for date:", dateParam);
//     setLoading(true);
//     setError(null);

//     const token = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("token="))
//       ?.split("=")[1];

//     if (!token) {
//       setError("No authentication token found.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.get("http://localhost:5000/api/events", {
//         params: { date: dateParam },
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!Array.isArray(response.data)) {
//         throw new Error("Expected an array of events");
//       }
//       setEvents(response.data);
//     } catch (err) {
//       console.error("Fetch error:", err.response?.data || err.message);
//       setError(err.response?.data?.error || err.message || "Failed to fetch events.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
//       fetchEvents();
//     } else {
//       setError("Invalid or missing date parameter.");
//       setLoading(false);
//     }
//   }, [fetchEvents,dateParam, refreshKey]);

//   useEffect(() => {
//     const handleEventAdded = () => {
//       setRefreshKey((prev) => prev + 1);
//       if (onEventAddedCallback) onEventAddedCallback();
//     };

//     document.addEventListener("eventAdded", handleEventAdded);
//     return () => document.removeEventListener("eventAdded", handleEventAdded);
//   }, [onEventAddedCallback]);

//   if (loading) {
//     return (
//       <div className="p-5 rounded-md border-2 border-gray-100 text-gray-500">
//         Loading events...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-5 rounded-md border-2 border-gray-100 text-red-500">
//         {error}
//       </div>
//     );
//   }

//   if (!events.length) {
//     return (
//       <div className="p-5 rounded-md border-2 border-gray-100 text-gray-500">
//         No events scheduled for this day.
//       </div>
//     );
//   }

//   return (
//     <>
//       {events.map((event) => (
//         <div
//           className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
//           key={event.id}
//         >
//           <div className="flex items-center justify-between">
//             <h1 className="font-semibold text-gray-600">{event.title}</h1>
//           </div>
//           <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
//         </div>
//       ))}
//     </>
//   );
// };

// export default EventList;


































// "use client";

// import axios from "axios";
// import { useEffect, useState } from "react";

// const EventList = ({ dateParam, onEventAddedCallback }) => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const fetchEvents = async () => {
//     setLoading(true);
//     setError(null);

//     const token = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("token="))
//       ?.split("=")[1];

//     if (!token) {
//       setError("No authentication token found.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.get("http://localhost:5000/api/events", {
//         params: { date: dateParam },
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setEvents(response.data);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to fetch events.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, [dateParam, refreshKey]);

//   useEffect(() => {
//     const handleEventAdded = () => {
//       setRefreshKey((prev) => prev + 1); // Force re-fetch
//       if (onEventAddedCallback) onEventAddedCallback();
//     };

//     document.addEventListener("eventAdded", handleEventAdded);
//     return () => document.removeEventListener("eventAdded", handleEventAdded);
//   }, [onEventAddedCallback]);

//   if (loading) {
//     return (
//       <div className="p-5 rounded-md border-2 border-gray-100 text-gray-500">
//         Loading events...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-5 rounded-md border-2 border-gray-100 text-red-500">
//         {error}
//       </div>
//     );
//   }

//   if (!events.length) {
//     return (
//       <div className="p-5 rounded-md border-2 border-gray-100 text-gray-500">
//         No events scheduled for this day.
//       </div>
//     );
//   }

//   return (
//     <>
//       {events.map((event) => (
//         <div
//           className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
//           key={event.id}
//         >
//           <div className="flex items-center justify-between">
//             <h1 className="font-semibold text-gray-600">{event.title}</h1>
//           </div>
//           <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
//         </div>
//       ))}
//     </>
//   );
// };

// export default EventList;