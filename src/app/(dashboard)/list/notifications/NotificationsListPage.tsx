
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import FormContainer from "@/components/FormContainer";
import {
  getNotifications,
  updateNotification,
  verifyToken,
  getUnreadNotificationsCount,
} from "@/lib/api";
import { useTableSearch } from "@/hooks/useTableSearch";
import { toast } from "react-toastify";
import { parseISO, format } from "date-fns";

type Notification = {
  id: string;
  user_id: string;
  initiator_id: string;
  event_id?: string;
  event_startTime?: string;
  type: string;
  priority: string;
  message: string;
  created_at: string;
  read_status: boolean;
};

type FilterConfig = {
  type: string;
  priority: string;
  read_status: string;
};

interface NotificationsListPageProps {
  setUnreadCount?: (count: number) => void;
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) {
    console.warn("Empty date string");
    return "N/A";
  }
  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}`);
      return "N/A";
    }
    return format(date, "MMM d, yyyy, HH:mm");
  } catch (error) {
    console.warn(`Date format error ${dateString}:`, error);
    return "N/A";
  }
};

const getNotificationStyles = (read_status: boolean) => {
  return read_status
    ? {
        bg: "bg-green-50",
        border: "border-l-4 border-green-400",
        dot: "bg-green-400",
        statusText: "text-green-800",
        badge: "bg-green-200 text-green-800",
      }
    : {
        bg: "bg-yellow-50",
        border: "border-l-4 border-yellow-400",
        dot: "bg-yellow-400",
        statusText: "text-yellow-800",
        badge: "bg-yellow-200 text-yellow-800",
      };
};

export default function NotificationsListPage({ setUnreadCount }: NotificationsListPageProps) {
  const router = useRouter();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilterConfig, setTempFilterConfig] = useState<FilterConfig>({
    type: "",
    priority: "",
    read_status: "",
  });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
    filterConfig,
    updateFilter,
  } = useTableSearch<Notification>({
    data: allNotifications,
    searchableFields: [
      (n) => n.message || "",
      (n) => n.type || "",
      (n) => n.priority || "",
      (n) => n.initiator_id || "",
      (n) => n.event_startTime || "",
    ],
    initialSortField: "created_at",
    initialSortDirection: "desc",
    itemsPerPage: 10,
  });

  const fetchNotifications = useCallback(
    async (page: number, resetPage = false) => {
      if (isFetching) {
        console.log("Skipping fetch: fetching");
        return;
      }
      console.log("Fetch notifications:", { page, resetPage, searchQuery, filterConfig });
      setIsFetching(true);
      setLoading(true);
      try {
        const pageToFetch = resetPage ? 1 : page;
        const response = await getNotifications(
          pageToFetch,
          filterConfig.type || undefined,
          filterConfig.priority || undefined,
          filterConfig.read_status === "true"
            ? true
            : filterConfig.read_status === "false"
            ? false
            : undefined,
          searchQuery || undefined
        );
        if (response?.notifications?.length) {
          const notifications: Notification[] = response.notifications.map((n: any) => ({
            id: n.id || "",
            user_id: n.user_id || "",
            initiator_id: n.initiator_id || "Unknown",
            event_id: n.event_id,
            event_startTime: n.event_startTime,
            type: n.type || "",
            priority: n.priority || "",
            message: n.message || "",
            created_at: n.created_at || "",
            read_status: n.read_status ?? false,
          }));
          const unread = notifications.filter((n) => !n.read_status);
          console.log("Notifications - Unread:", unread.length, unread);
          console.log("Notifications - Filters:", filterConfig);
          setAllNotifications(notifications);
          setTotalCount(response.totalCount ?? 0);
          setTotalPages(response.totalPages ?? 1);
          if (resetPage && currentPage !== 1) {
            setCurrentPage(1);
          } else if (pageToFetch !== currentPage) {
            setCurrentPage(pageToFetch);
          }
        } else {
          console.error("Invalid response:", response);
          setAllNotifications([]);
          setTotalCount(0);
          setTotalPages(1);
          toast.error("No notifications found");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast.error(`Fetch failed: ${err.message}`);
        setAllNotifications([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsFetching(false);
        setLoading(false);
      }
    },
    [searchQuery, filterConfig, currentPage]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
      setCurrentPage(newPage);
      fetchNotifications(newPage);
    },
    [totalPages, currentPage, fetchNotifications]
  );

  const handleRefetch = useCallback(
    (operation: "create" | "update" | "delete") => {
      fetchNotifications(currentPage, operation === "create");
    },
    [currentPage, fetchNotifications]
  );

  const handleToggleRead = async (id: string, read_status: boolean) => {
    try {
      const newReadStatus = !read_status;
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: newReadStatus } : n))
      );
      if (setUnreadCount) {
        const currentUnread = allNotifications.filter((n) => !n.read_status && n.id !== id).length;
        const optimisticCount = newReadStatus ? currentUnread : currentUnread + 1;
        console.log("Notifications - Optimistic unread count:", optimisticCount);
        setUnreadCount(optimisticCount);
      }

      const response = await updateNotification(id, newReadStatus);
      const unread_count = response.unread_count ?? (await getUnreadNotificationsCount()).unread_count;
      console.log("Notifications - Server unread count:", unread_count);
      if (setUnreadCount) {
        setUnreadCount(unread_count);
      }
      window.dispatchEvent(new CustomEvent("notification:updated"));
      toast.success("Notification updated");
    } catch (err: any) {
      console.error("Toggle read error:", err);
      toast.error("Update failed");
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status } : n))
      );
      if (setUnreadCount) {
        const currentUnread = allNotifications.filter((n) => !n.read_status).length;
        setUnreadCount(currentUnread);
      }
    }
  };

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) {
      router.push("/auth/signin");
      return;
    }
    verifyToken()
      .then((response) => {
        setRole(response.role);
        setUserIdentifier(response.identifier);
        fetchNotifications(1);
      })
      .catch((err) => {
        console.error("Verify error:", err);
        toast.error("Auth failed");
        router.push("/auth/signin");
      });
  }, [router, fetchNotifications]);

  useEffect(() => {
    fetchNotifications(1, true);
  }, [searchQuery, filterConfig.type, filterConfig.priority, filterConfig.read_status, fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(currentPage, false);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications, currentPage]);

  const applyFilters = () => {
    updateFilter("type", tempFilterConfig.type);
    updateFilter("priority", tempFilterConfig.priority);
    updateFilter("read_status", tempFilterConfig.read_status);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setTempFilterConfig({ type: "", priority: "", read_status: "" });
    updateFilter("type", "");
    updateFilter("priority", "");
    updateFilter("read_status", "");
    setShowFilterModal(false);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">All Notifications</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Message, Type, Priority, Initiator, Start Time..."
            onSearch={setSearchQuery}
            ariaLabel="Search notifications"
          />
          <div className="flex items-center gap-4 self-end">
            <button
              onClick={() => {
                setTempFilterConfig({
                  type: filterConfig.type || "",
                  priority: filterConfig.priority || "",
                  read_status: filterConfig.read_status || "",
                });
                setShowFilterModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-200 hover:bg-yellow-300"
              aria-label="Filter notifications"
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button
              onClick={() => toggleSort("created_at")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-200 hover:bg-yellow-300"
              aria-label="Sort notifications"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            <button
              onClick={() => fetchNotifications(1, true)}
              className="px-4 py-2 bg-blue-300 text-white rounded-md hover:bg-blue-400"
              aria-label="Refresh notifications"
            >
              Refresh
            </button>
{/*            {(role === "admin" || role === "supervisor") && (
              <FormContainer
                table="notification"
                type="create"
                display="image"
                refetch={() => handleRefetch("create")}
              />
            )}

*/}
            {(role === "admin" || role === "supervisor") && (
              <button
                onClick={() => toast.info("Notification creation not supported in this version.")}
                className="px-4 py-2 bg-blue-300 text-white rounded-md hover:bg-blue-400"
                aria-label="Create notification (disabled)"
              >
                Create Notification
              </button>
            )}







          </div>
        </div>
      </div>
      {!allNotifications.length ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <Image
            src="/stockout.png"
            alt="No notifications"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <p className="text-gray-500 text-lg">No notifications found.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {allNotifications.map((notification) => {
              const styles = getNotificationStyles(notification.read_status);
              return (
                <li
                  key={notification.id}
                  className={`p-4 ${styles.bg} ${styles.border} rounded-md flex items-start space-x-3 hover:bg-opacity-90 transition-colors`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">{notification.message || "N/A"}</p>
                    <p className="text-xs text-gray-600 mt-1">Type: {notification.type || "N/A"}</p>
                    <p className="text-xs text-gray-600">Priority: {notification.priority || "N/A"}</p>
                    <p className="text-xs text-gray-600">Initiator: {notification.initiator_id || "N/A"}</p>
                    <p className="text-xs text-gray-600">
                      Event Start: {notification.event_startTime || "N/A"}
                    </p>
                    <p className="text-xs mt-1">
                      <span className={styles.statusText}>
                        {notification.read_status ? "Read" : "Unread"}
                      </span>{" "}
                      • <span className="text-gray-600">{formatDate(notification.created_at)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.user_id === userIdentifier ? (
                      <button
                        onClick={() => handleToggleRead(notification.id, notification.read_status)}
                        className="p-1 rounded-full bg-blue-300 hover:bg-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        aria-label={notification.read_status ? "Mark as unread" : "Mark as read"}
                      >
                        <Image
                          src={notification.read_status ? "/checked.png" : "/unchecked.png"}
                          alt={notification.read_status ? "Read" : "Unread"}
                          width={20}
                          height={20}
                        />
                      </button>
                    ) : (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${styles.badge}`}
                        aria-label={`Notification status: ${notification.read_status ? "Read" : "Unread"}`}
                      >
                        {notification.read_status ? "Read" : "Unread"}
                      </span>
                    )}
{/*                    {role === "admin" && (
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                          aria-label="Edit notification (Admin only)"
                          disabled
                        >
                          <Image src="/pen.png" alt="Edit" width={20} height={20} />
                        </button>
                        <FormContainer
                          table="notification"
                          type="delete"
                          id={notification.id}
                          display="image"
                          refetch={() => handleRefetch("delete")}
                        />
                        <span
                          className="text-xs text-gray-600 flex items-center gap-1"
                          title="Admin-only actions"
                        >
                          <Image src="/lock.png" alt="Admin only" width={12} height={12} />
                          Admin
                        </span>
                      </div>
                    )}
*/}



                  {role === "admin" && (
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        aria-label="Edit notification (Admin only)"
                        disabled
                      >
                        <Image src="/pen.png" alt="Edit" width={20} height={20} />
                      </button>
                      <button
                        onClick={() => toast.info("Notification deletion not supported in this version.")}
                        className="p-1 rounded-full bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-200 focus:outline-none"
                        aria-label="Delete notification (disabled)"
                      >
                        <Image src="/trash.png" alt="Delete" width={20} height={20} />
                      </button>
                      <span
                        className="text-xs text-gray-600 flex items-center gap-1"
                        title="Admin-only actions"
                      >
                        <Image src="/lock.png" alt="Admin only" width={12} height={12} />
                        Admin
                      </span>
                    </div>
                  )}










                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination
            page={currentPage}
            count={totalCount}
            onPageChange={handlePageChange}
          />
        </>
      )}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-4">Filter Notifications</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select
                  value={tempFilterConfig.type}
                  onChange={(e) =>
                    setTempFilterConfig({ ...tempFilterConfig, type: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by type"
                >
                  <option value="">All</option>
                  <option value="EVALUATION">Evaluation</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="EVENT">Event</option>
                  <option value="GENERAL">General</option>
                  <option value="LESSON_PLAN">Lesson Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Priority</label>
                <select
                  value={tempFilterConfig.priority}
                  onChange={(e) =>
                    setTempFilterConfig({ ...tempFilterConfig, priority: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by priority"
                >
                  <option value="">All</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Read Status</label>
                <select
                  value={tempFilterConfig.read_status}
                  onChange={(e) =>
                    setTempFilterConfig({ ...tempFilterConfig, read_status: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by read status"
                >
                  <option value="">All</option>
                  <option value="true">Read</option>
                  <option value="false">Unread</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  aria-label="Apply filters"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  aria-label="Clear filters"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  aria-label="Close filter modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



















