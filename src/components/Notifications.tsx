import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Notification } from "@/types/types";
import { updateNotification } from "@/lib/api";
import { toast } from "react-toastify";

type Props = {
  notifications: Notification[];
  userIdentifier: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
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

const Notifications = ({ notifications, userIdentifier, loading, setLoading, setNotifications }: Props) => {
  const handleToggleRead = async (notificationId: string, read_status: boolean) => {
    try {
      setLoading(true);
      const newReadStatus = !read_status;
      setNotifications(
        notifications.map((n) => (n.id === notificationId ? { ...n, read_status: newReadStatus } : n))
      );
      await updateNotification(notificationId, newReadStatus);
      toast.success("Notification updated successfully");
    } catch (err: any) {
      console.error("Toggle read error:", err);
      toast.error("Failed to update notification");
      setNotifications(
        notifications.map((n) => (n.id === notificationId ? { ...n, read_status } : n))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <Image
            src="/stockout.png"
            alt="No notifications"
            width={120}
            height={120}
            className="mx-auto mb-4"
            style={{ width: "auto", height: "auto" }}
          />
          <p className="text-gray-500 text-lg">No notifications found.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => {
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
                  <p className="text-xs mt-1">
                    <span className={styles.statusText}>
                      {notification.read_status ? "Read" : "Unread"}
                    </span>{" "}
                    • <span className="text-gray-600">{formatDate(notification.created_at)}</span>
                  </p>
                </div>
                {notification.user_id === userIdentifier ? (
                  <button
                    onClick={() => handleToggleRead(notification.id, notification.read_status)}
                    className="p-1 rounded-full bg-blue-300 hover:bg-blue-400 focus:ring-2 focus:ring-blue-200"
                    aria-label={notification.read_status ? "Mark as unread" : "Mark as read"}
                    disabled={loading}
                  >
                    <Image
                      src={notification.read_status ? "/checked.png" : "/unchecked.png"}
                      alt={notification.read_status ? "Read" : "Unread"}
                      width={20}
                      height={20}
                      style={{ width: "auto", height: "auto" }}
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;