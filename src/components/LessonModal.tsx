// src/components/LessonsModal.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

type Lesson = {
  id: number;
  supervisorId: string;
  className: string;
  subject: string;
  startTime: string;
  endTime: string;
};

type LessonsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supervisorId: string;
  pendingLessonPlansCount: number;
};

const LessonsModal = ({ isOpen, onClose, supervisorId, pendingLessonPlansCount }: LessonsModalProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLessons = async () => {
      try {
        setLoading(true);
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) throw new Error("Authentication token not found.");

        const response = await axios.get(
          `http://localhost:5000/api/lessons/supervisor/${supervisorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLessons(response.data.lessons || []);
      } catch (err: any) {
        console.error("Error fetching lessons:", err);
        setError("Failed to fetch lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [isOpen, supervisorId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Supervisor&apos;s Lessons (Pending Plans: {pendingLessonPlansCount})
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && lessons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-gray-200 text-left">Class</th>
                  <th className="p-2 border border-gray-200 text-left">Subject</th>
                  <th className="p-2 border border-gray-200 text-left">Start Time</th>
                  <th className="p-2 border border-gray-200 text-left">End Time</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-gray-200">
                    <td className="p-2">{lesson.className}</td>
                    <td className="p-2">{lesson.subject}</td>
                    <td className="p-2">
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(lesson.startTime))}
                    </td>
                    <td className="p-2">
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(lesson.endTime))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && !error && <p>No lessons found.</p>
        )}
      </div>
    </div>
  );
};

export default LessonsModal;