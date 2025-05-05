// src/components/LessonPlanDetailsModal.tsx
"use client";

import { parseISO, format } from "date-fns";

type LessonPlanDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lessonPlan: {
    id: string;
    traineeName?: string;
    subject: string;
    schoolName?: string; // Maps to className in original props
    createdAt: string; // Changed from submittedAt to match LessonPlan type
    content?: string;
  };
};

const LessonPlanDetailsModal = ({ isOpen, onClose, lessonPlan }: LessonPlanDetailsModalProps) => {
  if (!isOpen) return null;

  // Format date safely
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy, HH:mm");
    } catch (error) {
      console.warn(`Invalid date format for ${dateString}:`, error);
      return "Invalid date";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Lesson Plan Details</h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Trainee:</span> {lessonPlan.traineeName || "N/A"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Subject:</span> {lessonPlan.subject || "N/A"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">School:</span> {lessonPlan.schoolName || "N/A"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Submitted:</span> {formatDate(lessonPlan.createdAt)}
          </p>
          <div className="mt-2">
            <span className="font-medium text-sm">Content:</span>
            <p className="text-sm text-gray-700 mt-1">{lessonPlan.content || "No content available."}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LessonPlanDetailsModal;





























