// src/components/EvaluationModal.tsx
"use client";

import { useState } from "react";

type EvaluationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    lessonPlanning: { score: number; comments: string };
    teachingDelivery: { score: number; comments: string };
    classroomManagement: { score: number; comments: string };
    assessmentFeedback: { score: number; comments: string };
    professionalism: { score: number; comments: string };
    overallScore: number;
  }) => void;
  traineeName: string;
};

const EvaluationModal = ({ isOpen, onClose, onSubmit, traineeName }: EvaluationModalProps) => {
  const [formData, setFormData] = useState({
    lessonPlanning: { score: "", comments: "" },
    teachingDelivery: { score: "", comments: "" },
    classroomManagement: { score: "", comments: "" },
    assessmentFeedback: { score: "", comments: "" },
    professionalism: { score: "", comments: "" },
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof typeof formData,
    key: "score" | "comments",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate scores
    const fields: (keyof typeof formData)[] = [
      "lessonPlanning",
      "teachingDelivery",
      "classroomManagement",
      "assessmentFeedback",
      "professionalism",
    ];
    for (const field of fields) {
      const score = Number(formData[field].score);
      if (isNaN(score) || score < 1 || score > 10) {
        setError(`Score for ${field.replace(/([A-Z])/g, " $1").toLowerCase()} must be a number between 1 and 10.`);
        return;
      }
    }

    // Calculate overall score (average of all scores)
    const scores = fields.map((field) => Number(formData[field].score));
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Clear error and submit
    setError(null);
    onSubmit({
      lessonPlanning: { score: Number(formData.lessonPlanning.score), comments: formData.lessonPlanning.comments },
      teachingDelivery: { score: Number(formData.teachingDelivery.score), comments: formData.teachingDelivery.comments },
      classroomManagement: { score: Number(formData.classroomManagement.score), comments: formData.classroomManagement.comments },
      assessmentFeedback: { score: Number(formData.assessmentFeedback.score), comments: formData.assessmentFeedback.comments },
      professionalism: { score: Number(formData.professionalism.score), comments: formData.professionalism.comments },
      overallScore,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Evaluate Trainee: {traineeName}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Lesson Planning */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Lesson Planning (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.lessonPlanning.score}
              onChange={(e) => handleInputChange("lessonPlanning", "score", e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              required
            />
            <textarea
              value={formData.lessonPlanning.comments}
              onChange={(e) => handleInputChange("lessonPlanning", "comments", e.target.value)}
              className="w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              rows={2}
              placeholder="Comments on lesson planning..."
            />
          </div>

          {/* Teaching Delivery */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Teaching Delivery (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.teachingDelivery.score}
              onChange={(e) => handleInputChange("teachingDelivery", "score", e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              required
            />
            <textarea
              value={formData.teachingDelivery.comments}
              onChange={(e) => handleInputChange("teachingDelivery", "comments", e.target.value)}
              className="w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              rows={2}
              placeholder="Comments on teaching delivery..."
            />
          </div>

          {/* Classroom Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Classroom Management (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.classroomManagement.score}
              onChange={(e) => handleInputChange("classroomManagement", "score", e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              required
            />
            <textarea
              value={formData.classroomManagement.comments}
              onChange={(e) => handleInputChange("classroomManagement", "comments", e.target.value)}
              className="w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              rows={2}
              placeholder="Comments on classroom management..."
            />
          </div>

          {/* Assessment and Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Assessment and Feedback (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.assessmentFeedback.score}
              onChange={(e) => handleInputChange("assessmentFeedback", "score", e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              required
            />
            <textarea
              value={formData.assessmentFeedback.comments}
              onChange={(e) => handleInputChange("assessmentFeedback", "comments", e.target.value)}
              className="w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              rows={2}
              placeholder="Comments on assessment and feedback..."
            />
          </div>

          {/* Professionalism */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Professionalism (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.professionalism.score}
              onChange={(e) => handleInputChange("professionalism", "score", e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              required
            />
            <textarea
              value={formData.professionalism.comments}
              onChange={(e) => handleInputChange("professionalism", "comments", e.target.value)}
              className="w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-lamaBlue"
              rows={2}
              placeholder="Comments on professionalism..."
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

export default EvaluationModal;