// src/components/FeedbackModal.tsx
"use client";

import { useState } from "react";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, feedback: string) => void;
  traineeName?: string; // Optional for bulk feedback
  isBulk?: boolean;
};

const FeedbackModal = ({ isOpen, onClose, onSubmit, traineeName, isBulk = false }: FeedbackModalProps) => {
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const categories = ["Performance", "Attendance", "Skills", "Other"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!feedback.trim()) {
      setError("Feedback message cannot be empty.");
      return;
    }

    setError(null);
    onSubmit(category, feedback);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">
          {isBulk ? "Send Bulk Feedback" : `Send Feedback to ${traineeName}`}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              rows={3}
              placeholder="Enter your feedback here..."
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-lamaGreen text-gray-800 rounded-md hover:bg-opacity-80 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;