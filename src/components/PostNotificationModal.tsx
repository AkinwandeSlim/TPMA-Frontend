// src/components/PostNotificationModal.tsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/lib/api";



type PostNotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supervisorId: string;
  recentEvaluationsCount: number;
  refetch: () => Promise<void>;
};

const PostNotificationModal = ({
  isOpen,
  onClose,
  supervisorId,
  recentEvaluationsCount,
  refetch,
}: PostNotificationModalProps) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) throw new Error("Authentication token not found.");

      await axios.post(
        `${API_BASE_URL}/api/supervisors/${supervisorId}/notifications`,
        { title, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Notification posted successfully");
      await refetch();
      setTitle("");
      setMessage("");
      onClose();
    } catch (err: any) {
      console.error("Error posting notification:", err);
      toast.error("Failed to post notification.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Post Notification (Recent Evals: {recentEvaluationsCount})
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md w-full"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Notification"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostNotificationModal;