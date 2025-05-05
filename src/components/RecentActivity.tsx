// src/components/RecentActivity.tsx
"use client";

import { useState, useEffect } from "react";
import { getNotifications } from "@/lib/api";
import { parseISO, format } from "date-fns";

type Notification = {
  id: string;
  user_id: string;
  initiator_id: string;
  type: string;
  priority: string;
  message: string;
  created_at: string;
  read_status: boolean;
};

const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy, HH:mm");
  } catch (error) {
    console.warn(`Date format error ${dateString}:`, error);
    return "N/A";
  }
};

const getNotificationStyles = (type: string) => {
  switch (type) {
    case "ASSIGNMENT":
      return {
        bg: "bg-[#FEFCE8]", // lamaYellowLight
        border: "border-l-4 border-[#FAE27C]", // lamaYellow
        dot: "bg-[#FAE27C]",
        typeText: "text-[#5244F3]",
      };
    case "EVALUATION":
      return {
        bg: "bg-[#F1F0FF]", // lamaPurpleLight
        border: "border-l-4 border-[#CFCEFF]", // lamaPurple
        dot: "bg-[#CFCEFF]",
        typeText: "text-[#5244F3]",
      };
    case "EVENT":
      return {
        bg: "bg-[#EDF9FD]", // lamaSkyLight
        border: "border-l-4 border-[#C3EBFA]", // lamaSky
        dot: "bg-[#C3EBFA]",
        typeText: "text-[#5244F3]",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-l-4 border-gray-300",
        dot: "bg-gray-300",
        typeText: "text-gray-600",
      };
  }
};

const RecentActivity = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications(1); // Page 1
        if (response?.notifications?.length) {
          // Sort descending by created_at
          const sortedNotifications = response.notifications
            .slice(0, 5) // Limit 5
            .sort((a: Notification, b: Notification) => {
              const dateA = parseISO(a.created_at).getTime();
              const dateB = parseISO(b.created_at).getTime();
              return dateB - dateA; // Newest first
            });
          setNotifications(sortedNotifications);
        } else {
          setError("No recent activity found.");
        }
      } catch (err: any) {
        console.error("Fetch notifications error:", err);
        setError("Failed to load recent activity.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading recent activity...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No recent activity.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            return (
              <li
                key={notification.id}
                className={`p-3 ${styles.bg} ${styles.border} rounded-md flex items-start space-x-3 hover:bg-opacity-90 transition-colors`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-2`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                  <p className="text-xs mt-1">
                    <span className={styles.typeText}>{notification.type}</span> •{" "}
                    <span className="text-gray-600">{formatDate(notification.created_at)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;