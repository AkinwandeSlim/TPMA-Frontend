"use client";
import { useEffect, useState } from "react";
import NotificationsListPage from "./NotificationsListPage";

export default function NotificationsPage() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    console.log("NotificationsPage - Unread count updated:", unreadCount);
  }, [unreadCount]);

  return <NotificationsListPage setUnreadCount={setUnreadCount} />;
}