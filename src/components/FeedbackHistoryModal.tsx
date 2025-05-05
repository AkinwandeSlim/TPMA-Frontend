// src/components/FeedbackHistoryModal.tsx
"use client";

type FeedbackHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  feedbackHistory: { category: string; feedback: string; submittedAt: string }[];
  traineeName: string;
};

const FeedbackHistoryModal = ({ isOpen, onClose, feedbackHistory, traineeName }: FeedbackHistoryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Feedback History for {traineeName}</h2>
        {feedbackHistory.length > 0 ? (
          <ul className="list-disc pl-5 flex flex-col gap-4">
            {feedbackHistory.map((fb, index) => (
              <li key={index} className="text-sm text-gray-700">
                <span className="font-medium">{fb.category}:</span> {fb.feedback}
                <p className="text-xs text-gray-500">
                  Submitted: {new Intl.DateTimeFormat("en-GB").format(new Date(fb.submittedAt))}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No feedback history available.</p>
        )}
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

export default FeedbackHistoryModal;