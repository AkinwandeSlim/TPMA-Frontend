"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormModal from "@/components/FormModal";
import EventCalendar from "@/components/EventCalendar";
import {
  getSupervisorProfile,
  reviewLessonPlan,
  sendFeedback,
  scheduleObservation,
  submitObservationFeedback,
  getNotifications,
} from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

// Type definitions
type Supervisor = {
  id: string;
  staffId: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  createdAt?: string;
};

type Trainee = {
  id: string;
  name: string;
  surname: string;
  regNo?: string;
  email?: string;
};

type Observation = {
  id: string;
  supervisorId: string;
  traineeId: string;
  lesson_plan_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  status: string;
  created_at?: string;
  lessonPlanTitle?: string;
  traineeName?: string;
};

type ApiSchedule = {
  id: string;
  traineeId: string;
  lesson_plan_id: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  status: string;
  created_at?: string;
};

type LessonPlan = {
  id: string;
  traineeId: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  objectives: string;
  activities: string;
  resources: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  aiGenerated: boolean;
  traineeName: string;
  supervisorName: string;
  schoolName: string;
  pdfUrl: string | null;
};

type Notification = {
  id: string;
  user_id: string;
  initiator_id: string;
  type: string;
  message: string;
  created_at: string;
  read_status: boolean;
};

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  onClick: () => void;
  onDelete: () => void;
};

// Normalize time to HH:mm
function normalizeTime(time?: string | null): string {
  if (!time) return "";
  try {
    if (time.includes("T")) {
      return new Date(time).toISOString().slice(11, 16);
    }
    return time.slice(0, 5);
  } catch {
    return "";
  }
}

// Validate schedule status
function isValidScheduleStatus(status: string): status is Observation["status"] {
  return ["SCHEDULED", "ONGOING", "COMPLETED"].includes(status);
}

// Normalize schedule data
function normalizeSchedule(
  schedule: ApiSchedule,
  lessonPlans: LessonPlan[],
  supervisorId: string
): Observation {
  const lessonPlan = lessonPlans.find((lp) => lp.id === schedule.lesson_plan_id);
  return {
    ...schedule,
    supervisorId,
    traineeId: schedule.traineeId || "Unknown Trainee",
    lesson_plan_id: schedule.lesson_plan_id,
    lessonPlanTitle: lessonPlan?.title || "Unknown Lesson Plan",
    traineeName: lessonPlan?.traineeName || schedule.traineeId || "Unknown Trainee",
    start_time: normalizeTime(schedule.start_time),
    end_time: normalizeTime(schedule.end_time),
    created_at: schedule.created_at || new Date().toISOString(),
    status: isValidScheduleStatus(schedule.status) ? schedule.status : "SCHEDULED",
  };
}

const getLessonPlanStyles = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        bg: "bg-yellow-50",
        border: "border-l-4 border-yellow-400",
        dot: "bg-yellow-400",
        statusText: "text-yellow-800",
      };
    case "APPROVED":
      return {
        bg: "bg-green-50",
        border: "border-l-4 border-green-400",
        dot: "bg-green-400",
        statusText: "text-green-800",
      };
    case "REJECTED":
      return {
        bg: "bg-red-50",
        border: "border-l-4 border-red-400",
        dot: "bg-red-400",
        statusText: "text-red-800",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-l-4 border-gray-300",
        dot: "bg-gray-300",
        statusText: "text-gray-600",
      };
  }
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString || typeof dateString !== "string") {
    return "N/A";
  }
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.warn(`Date format error ${dateString}:`, error);
    return "N/A";
  }
};

const ReviewLessonPlanModal = ({
  isOpen,
  onClose,
  onSubmit,
  lessonPlanId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    lessonPlanId: string,
    data: { status: "APPROVED" | "REJECTED"; comments: string; score?: number }
  ) => void;
  lessonPlanId: string;
}) => {
  const [status, setStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [comments, setComments] = useState("");
  const [score, setScore] = useState<number | undefined>(undefined);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments) {
      toast.error("Comments are required.");
      return;
    }
    onSubmit(lessonPlanId, { status, comments, score });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Review Lesson Plan</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "APPROVED" | "REJECTED")}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            >
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Score (0-10, optional)</label>
            <input
              type="number"
              value={score ?? ""}
              onChange={(e) => setScore(e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
              max="10"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScheduleObservationModal = ({
  isOpen,
  onClose,
  onSubmit,
  lessonPlans,
  trainees,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    lesson_plan_id: string;
    trainee_id: string;
    date: string;
    start_time: string;
    end_time: string;
  }) => void;
  lessonPlans: LessonPlan[];
  trainees: Trainee[];
}) => {
  const [data, setData] = useState({
    lesson_plan_id: "",
    trainee_id: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.lesson_plan_id || !data.trainee_id || !data.date || !data.start_time || !data.end_time) {
      toast.error("All fields are required.");
      return;
    }
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Schedule Observation</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lesson Plan</label>
            <select
              value={data.lesson_plan_id}
              onChange={(e) => setData({ ...data, lesson_plan_id: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            >
              <option value="">Select Lesson Plan</option>
              {lessonPlans
                .filter((lp) => lp.status === "APPROVED")
                .map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {lp.title} ({lp.traineeName})
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Trainee</label>
            <select
              value={data.trainee_id}
              onChange={(e) => setData({ ...data, trainee_id: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            >
              <option value="">Select Trainee</option>
              {trainees.map((trainee) => (
                <option key={trainee.id} value={trainee.id}>
                  {trainee.name} {trainee.surname}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={data.start_time}
              onChange={(e) => setData({ ...data, start_time: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={data.end_time}
              onChange={(e) => setData({ ...data, end_time: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubmitFeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  observationId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (observationId: string, data: { score: number; comments: string }) => void;
  observationId: string;
}) => {
  const [score, setScore] = useState<number | undefined>(undefined);
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score === undefined || !comments) {
      toast.error("Score and comments are required.");
      return;
    }
    onSubmit(observationId, { score, comments });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Submit Observation Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Score (0-10)</label>
            <input
              type="number"
              value={score ?? ""}
              onChange={(e) => setScore(e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
              max="10"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  traineeName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, feedback: string) => void;
  traineeName: string;
}) => {
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !feedback) {
      toast.error("Category and feedback are required.");
      return;
    }
    onSubmit(category, feedback);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Send Feedback to {traineeName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            >
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="Lesson Plan">Lesson Plan</option>
              <option value="Teaching Practice">Teaching Practice</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SingleSupervisorPage = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [supervisedTraineesCount, setSupervisedTraineesCount] = useState<number>(0);
  const [totalObservationsScheduled, setTotalObservationsScheduled] = useState<number>(0);
  const [totalCompletedObservations, setTotalCompletedObservations] = useState<number>(0);
  const [totalLessonPlans, setTotalLessonPlans] = useState<number>(0);
  const [pendingLessonPlansCount, setPendingLessonPlansCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedTraineeForFeedback, setSelectedTraineeForFeedback] = useState<Trainee | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewLessonPlanId, setReviewLessonPlanId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isObservationFeedbackModalOpen, setIsObservationFeedbackModalOpen] = useState(false);
  const [feedbackObservationId, setFeedbackObservationId] = useState<string | null>(null);
  const router = useRouter();

  // Debounce function to limit fetch calls
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchSupervisorData = useCallback(async () => {
    if (!user || user.role !== "supervisor") {
      console.error("Invalid user or role:", user);
      setError("Please sign in as a supervisor.");
      router.push("/auth/signin");
      return;
    }

    const supervisorId = user.identifier;
    if (!supervisorId || supervisorId === "undefined" || typeof supervisorId !== "string" || supervisorId.trim() === "") {
      console.error("Invalid supervisorId from user.identifier:", supervisorId, "User:", user);
      setError("Missing or invalid supervisor identifier. Please sign in again.");
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching data for supervisorId:", supervisorId);
      const supervisorData = await getSupervisorProfile(supervisorId);
      console.log("Supervisor data received:", supervisorData);

      setSupervisor({
        id: supervisorData.id,
        staffId: supervisorData.staffId,
        name: supervisorData.name,
        surname: supervisorData.surname,
        email: supervisorData.email,
        phone: supervisorData.phone,
        createdAt: supervisorData.createdAt,
      });

      const traineesData = Array.isArray(supervisorData.assignedTrainees) ? supervisorData.assignedTrainees : [];
      console.log("Setting trainees:", traineesData);
      setTrainees(traineesData);
      setSupervisedTraineesCount(traineesData.length);

      const observationsData = Array.isArray(supervisorData.schedules)
        ? supervisorData.schedules.map((schedule: ApiSchedule) =>
            normalizeSchedule(schedule, supervisorData.lessonPlans, supervisorId)
          )
        : [];
      setObservations(observationsData);
      setTotalObservationsScheduled(observationsData.length);
      setTotalCompletedObservations(
        observationsData.filter((s) => s.status === "COMPLETED").length
      );

      const lessonPlansData = Array.isArray(supervisorData.lessonPlans) ? supervisorData.lessonPlans : [];
      const sortedLessonPlans = lessonPlansData
        .map((item: any) => ({
          id: item.id,
          traineeId: String(item.traineeId),
          title: item.title || "Untitled",
          subject: item.subject || "Unknown",
          class: item.class || "Unknown",
          date: item.date || new Date().toISOString().split("T")[0],
          startTime: item.startTime || null,
          endTime: item.endTime || null,
          objectives: item.objectives || "",
          activities: item.activities || "",
          resources: item.resources || "",
          createdAt: item.createdAt || new Date().toISOString(),
          status: item.status || "PENDING",
          aiGenerated: item.aiGenerated ?? false,
          traineeName: item.traineeName || "Unknown",
          supervisorName: item.supervisorName || "Unknown",
          schoolName: item.schoolName || "Unknown",
          pdfUrl: item.pdfUrl || null,
        }))
        .sort((a: LessonPlan, b: LessonPlan) => {
          const dateA = parseISO(a.createdAt).getTime();
          const dateB = parseISO(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });
      setLessonPlans(sortedLessonPlans);
      setTotalLessonPlans(lessonPlansData.length);
      setPendingLessonPlansCount(
        lessonPlansData.filter((lp) => lp.status === "PENDING").length
      );

      try {
        const notificationsResponse = await getNotifications(1, undefined, undefined, undefined, undefined);
        setNotifications(notificationsResponse.notifications || []);
        console.log("Notifications received:", notificationsResponse.notifications);
      } catch (notifErr: any) {
        toast.warning("Failed to load notifications.");
        setNotifications([]);
      }
    } catch (err: any) {
      const message = err.message.includes("CORS")
        ? "Failed to connect to the server. Please contact the administrator to check CORS settings."
        : err.response?.status === 401
        ? "Session expired. Please sign in again."
        : err.response?.status === 403
        ? "Unauthorized: You can only access your own profile."
        : err.response?.status === 404
        ? `Supervisor profile not found for ID: ${supervisorId}`
        : `Failed to load data: ${err.message}`;
      console.error("Fetch error:", message, err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const debouncedFetchSupervisorData = useCallback(debounce(fetchSupervisorData, 500), [fetchSupervisorData]);

  const handleRefetch = useCallback(() => {
    debouncedFetchSupervisorData();
    window.dispatchEvent(new Event("notification:updated"));
  }, [debouncedFetchSupervisorData]);

  const handleSendFeedback = (trainee: Trainee) => {
    setSelectedTraineeForFeedback(trainee);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (category: string, feedback: string) => {
    try {
      if (!selectedTraineeForFeedback) {
        throw new Error("No trainee selected");
      }
      if (!supervisor?.id) {
        throw new Error("Supervisor profile not loaded");
      }
      await sendFeedback({
        supervisorId: supervisor.id,
        category,
        feedback,
        traineeId: selectedTraineeForFeedback.id,
      });
      toast.success("Feedback sent to trainee");
      handleRefetch();
    } catch (err: any) {
      console.error("Send feedback error:", err.message);
      toast.error(err.message || "Failed to send feedback.");
    }
  };

  const handleReviewLessonPlan = async (
    lessonPlanId: string,
    data: { status: "APPROVED" | "REJECTED"; comments: string; score?: number }
  ) => {
    if (!supervisor?.id) {
      console.error("Invalid supervisorId in handleReviewLessonPlan: supervisor.id is undefined", "Supervisor state:", supervisor);
      toast.error("Supervisor profile not loaded. Please reload the page or sign in again.");
      return;
    }

    try {
      console.log("Reviewing lesson plan with supervisorId:", supervisor.id, "lessonPlanId:", lessonPlanId);
      const response = await reviewLessonPlan(supervisor.id, lessonPlanId, data);
      toast.success(response.message);
      handleRefetch();
    } catch (err: any) {
      console.error("Review lesson plan error:", err.message, err.response?.data);
      toast.error(err.message || "Failed to review lesson plan.");
    }
  };

  const handleScheduleObservation = async (data: {
    lesson_plan_id: string;
    trainee_id: string;
    date: string;
    start_time: string;
    end_time: string;
  }) => {
    if (!supervisor?.id) {
      console.error("Invalid supervisorId in handleScheduleObservation: supervisor.id is undefined", "Supervisor state:", supervisor);
      toast.error("Supervisor profile not loaded. Please reload the page or sign in again.");
      return;
    }

    try {
      const response = await scheduleObservation(supervisor.id, data);
      toast.success(response.message);
      handleRefetch();
    } catch (err: any) {
      console.error("Schedule observation error:", err.message);
      toast.error(err.message || "Failed to schedule observation.");
    }
  };

  const handleSubmitObservationFeedback = async (
    observationId: string,
    data: { score: number; comments: string }
  ) => {
    if (!supervisor?.id) {
      console.error("Invalid supervisorId in handleSubmitObservationFeedback: supervisor.id is undefined", "Supervisor state:", supervisor);
      toast.error("Supervisor profile not loaded. Please reload the page or sign in again.");
      return;
    }

    try {
      const response = await submitObservationFeedback(supervisor.id, observationId, data);
      toast.success(response.message);
      handleRefetch();
    } catch (err: any) {
      console.error("Submit observation feedback error:", err.message);
      toast.error(err.message || "Failed to submit observation feedback.");
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchSupervisorData();
    }
  }, [authLoading, fetchSupervisorData]);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      debouncedFetchSupervisorData();
    };
    window.addEventListener("notification:updated", handleNotificationUpdate);
    return () => {
      window.removeEventListener("notification:updated", handleNotificationUpdate);
    };
  }, [debouncedFetchSupervisorData]);

  if (authLoading || loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  if (error || !supervisor) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-medium">{error || "Failed to load profile."}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleRefetch}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const calendarEvents: Event[] = observations.map((obs) => ({
    id: obs.id,
    title: `Observation: ${obs.lessonPlanTitle || "Lesson"} (${obs.traineeName || "Trainee"})`,
    start: obs.start_time ? new Date(`${obs.date}T${obs.start_time}`) : new Date(obs.date),
    end: obs.end_time ? new Date(`${obs.date}T${obs.end_time}`) : new Date(obs.date),
    status: obs.status,
    onClick: () => {
      console.log(`Clicked observation: ${obs.id}`);
      toast.info(`Viewing observation: ${obs.lessonPlanTitle || "Lesson"}`);
    },
    onDelete: () => {
      console.log(`Delete observation: ${obs.id}`);
      toast.warn(`Deletion of observation ${obs.id} not implemented yet.`);
    },
  }));

  const showSchedule = observations.length > 0;

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* Supervisor Assignment Section */}
        <div className="bg-white p-4 rounded-md mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Supervisory Role</h1>
          </div>
          {trainees.length === 0 ? (
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt="No Assignment"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-500">No Trainees Assigned</h2>
                <span className="text-sm text-gray-400">Supervisory Status</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">{supervisedTraineesCount}</h2>
                  <span className="text-sm text-gray-400">Supervised Trainees</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">{totalLessonPlans}</h2>
                  <span className="text-sm text-gray-400">Total Lesson Plans</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">{totalObservationsScheduled}</h2>
                  <span className="text-sm text-gray-400">Observations Scheduled</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">{totalCompletedObservations}</h2>
                  <span className="text-sm text-gray-400">Completed Observations</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Plans Section */}
        <div className="bg-white p-6 rounded-md shadow-md mb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Lesson Plans to Review</h1>
            <button
              onClick={() => router.push("/supervisor/lesson-plans")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors focus:ring-2 focus:ring-blue-200 focus:outline-none"
              aria-label="Manage lesson plans"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manage Lesson Plans
            </button>
          </div>
          {lessonPlans.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Image
                src="/stockout.png"
                alt="No lesson plans"
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <p className="text-gray-500 text-lg mb-4">No lesson plans to review.</p>
              <button
                onClick={() => router.push("/supervisor/lesson-plans")}
                className="px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors"
                aria-label="Go to lesson plans"
              >
                Go to Lesson Plans
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Lesson Plans</h2>
              <ul className="space-y-3">
                {lessonPlans
                  .filter((plan) => plan.status === "PENDING")
                  .map((plan) => {
                    const styles = getLessonPlanStyles(plan.status);
                    return (
                      <li
                        key={plan.id}
                        className={`p-3 ${styles.bg} ${styles.border} rounded-md flex items-start space-x-3 hover:bg-opacity-90 transition-colors`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-2`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">{plan.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Trainee: {plan.traineeName}
                          </p>
                          <p className="text-xs text-gray-600">
                            Subject: {plan.subject}
                          </p>
                          <p className="text-xs text-gray-600">
                            Date: {formatDate(plan.date)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Time: {plan.startTime && plan.endTime ? `${plan.startTime.slice(0, 5)} - ${plan.endTime.slice(0, 5)}` : "N/A"}
                          </p>
                          <p className="text-xs mt-1">
                            <span className={styles.statusText}>{plan.status}</span> •{" "}
                            <span className="text-gray-600">{formatDate(plan.createdAt)}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <FormModal
                            table="lesson_plan"
                            type="view"
                            data={plan}
                            ariaLabel={`View lesson plan: ${plan.title}`}
                          />
                          <button
                            onClick={() => {
                              setReviewLessonPlanId(plan.id);
                              setIsReviewModalOpen(true);
                            }}
                            className="px-3 py-1 bg-blue-300 text-white rounded-md text-xs hover:bg-blue-400"
                          >
                            Review
                          </button>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">My Schedule</h1>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors focus:ring-2 focus:ring-blue-200 focus:outline-none"
              aria-label="Schedule observation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Schedule Observation
            </button>
          </div>
          {showSchedule ? (
            <div className="h-[400px] overflow-y-auto">
              <BigCalendarContainer type="supervisor" id={supervisor.id} events={calendarEvents} />
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Image
                src="/stockout.png"
                alt="No schedule"
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <p className="text-gray-500 text-lg">
                No observations scheduled yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap text-sm">
            <Link
              href={`/list/trainees?supervisorId=${supervisor.id}`}
              className="p-3 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              Manage Trainees
            </Link>
            <Link
              href={`/list/schedules?supervisorId=${supervisor.id}`}
              className="p-3 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              View Schedules
            </Link>
            <Link
              href={`/supervisor/report?supervisorId=${supervisor.id}`}
              className="p-3 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              Generate Report
            </Link>
          </div>
        </div>
        <EventCalendar />
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <p>No notifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg flex items-start gap-3 transition-all ${
                    notification.read_status
                      ? "bg-gray-100 hover:bg-gray-200"
                      : "bg-[#FAE27C] hover:bg-[#F7D154]"
                  }`}
                >
                  <Image
                    src={notification.read_status ? "/bell-gray.png" : "/bell-yellow.png"}
                    alt="Notification"
                    width={20}
                    height={20}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReviewLessonPlanModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewLessonPlan}
        lessonPlanId={reviewLessonPlanId || ""}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        traineeName={selectedTraineeForFeedback ? `${selectedTraineeForFeedback.name} ${selectedTraineeForFeedback.surname}` : ""}
      />
      <ScheduleObservationModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleScheduleObservation}
        lessonPlans={lessonPlans}
        trainees={trainees}
      />
      <SubmitFeedbackModal
        isOpen={isObservationFeedbackModalOpen}
        onClose={() => setIsObservationFeedbackModalOpen(false)}
        onSubmit={handleSubmitObservationFeedback}
        observationId={feedbackObservationId || ""}
      />
    </div>
  );
};

export default SingleSupervisorPage;































// "use client";

// import { useState, useEffect, useCallback } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { format, parseISO } from "date-fns";
// import Announcements from "@/components/Announcements";
// import BigCalendarContainer from "@/components/BigCalendarContainer";
// import FormModal from "@/components/FormModal";
// import EventCalendar from "@/components/EventCalendar";
// import {
//   getSupervisorProfile,
//   reviewLessonPlan,
//   sendFeedback,
//   scheduleObservation,
//   submitObservationFeedback,
//   getNotifications,
// } from "@/lib/api";
// import { useAuth } from "@/lib/useAuth";

// // Type definitions
// type Supervisor = {
//   id: string;
//   staffId: string;
//   name: string;
//   surname: string;
//   email: string;
//   phone?: string;
//   createdAt?: string;
// };

// type Trainee = {
//   id: string;
//   name: string;
//   surname: string;
//   regNo?: string;
//   email?: string;
// };

// type Observation = {
//   id: string;
//   supervisorId: string;
//   traineeId: string;
//   lesson_plan_id: string;
//   date: string;
//   start_time?: string;
//   end_time?: string;
//   status: string;
//   created_at?: string;
//   lessonPlanTitle?: string;
//   traineeName?: string;
// };

// type LessonPlan = {
//   id: string;
//   traineeId: string;
//   title: string;
//   subject: string;
//   class: string;
//   date: string;
//   startTime: string | null;
//   endTime: string | null;
//   objectives: string;
//   activities: string;
//   resources: string;
//   createdAt: string;
//   status: "PENDING" | "APPROVED" | "REJECTED";
//   aiGenerated: boolean;
//   traineeName: string;
//   supervisorName: string;
//   schoolName: string;
//   pdfUrl: string | null;
// };

// type Notification = {
//   id: string;
//   user_id: string;
//   initiator_id: string;
//   type: string;
//   message: string;
//   created_at: string;
//   read_status: boolean;
// };

// const getLessonPlanStyles = (status: string) => {
//   switch (status) {
//     case "PENDING":
//       return {
//         bg: "bg-yellow-50",
//         border: "border-l-4 border-yellow-400",
//         dot: "bg-yellow-400",
//         statusText: "text-yellow-800",
//       };
//     case "APPROVED":
//       return {
//         bg: "bg-green-50",
//         border: "border-l-4 border-green-400",
//         dot: "bg-green-400",
//         statusText: "text-green-800",
//       };
//     case "REJECTED":
//       return {
//         bg: "bg-red-50",
//         border: "border-l-4 border-red-400",
//         dot: "bg-red-400",
//         statusText: "text-red-800",
//       };
//     default:
//       return {
//         bg: "bg-gray-50",
//         border: "border-l-4 border-gray-300",
//         dot: "bg-gray-300",
//         statusText: "text-gray-600",
//       };
//   }
// };

// const formatDate = (dateString?: string | null): string => {
//   if (!dateString || typeof dateString !== "string") {
//     return "N/A";
//   }
//   try {
//     const date = parseISO(dateString);
//     return format(date, "MMM d, yyyy");
//   } catch (error) {
//     console.warn(`Date format error ${dateString}:`, error);
//     return "N/A";
//   }
// };

// const ReviewLessonPlanModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   lessonPlanId,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (
//     lessonPlanId: string,
//     data: { status: "APPROVED" | "REJECTED"; comments: string; score?: number }
//   ) => void;
//   lessonPlanId: string;
// }) => {
//   const [status, setStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
//   const [comments, setComments] = useState("");
//   const [score, setScore] = useState<number | undefined>(undefined);

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!comments) {
//       toast.error("Comments are required.");
//       return;
//     }
//     onSubmit(lessonPlanId, { status, comments, score });
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-md w-full max-w-md">
//         <h2 className="text-lg font-semibold mb-4">Review Lesson Plan</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Status</label>
//             <select
//               value={status}
//               onChange={(e) => setStatus(e.target.value as "APPROVED" | "REJECTED")}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             >
//               <option value="APPROVED">Approved</option>
//               <option value="REJECTED">Rejected</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Comments</label>
//             <textarea
//               value={comments}
//               onChange={(e) => setComments(e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               rows={4}
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Score (0-10, optional)</label>
//             <input
//               type="number"
//               value={score ?? ""}
//               onChange={(e) => setScore(e.target.value ? parseInt(e.target.value) : undefined)}
//               min="0"
//               max="10"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               type="submit"
//               className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const ScheduleObservationModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   lessonPlans,
//   trainees,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: {
//     lesson_plan_id: string;
//     trainee_id: string;
//     date: string;
//     start_time: string;
//     end_time: string;
//   }) => void;
//   lessonPlans: LessonPlan[];
//   trainees: Trainee[];
// }) => {
//   const [data, setData] = useState({
//     lesson_plan_id: "",
//     trainee_id: "",
//     date: "",
//     start_time: "",
//     end_time: "",
//   });

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!data.lesson_plan_id || !data.trainee_id || !data.date || !data.start_time || !data.end_time) {
//       toast.error("All fields are required.");
//       return;
//     }
//     onSubmit(data);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-md w-full max-w-md">
//         <h2 className="text-lg font-semibold mb-4">Schedule Observation</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Lesson Plan</label>
//             <select
//               value={data.lesson_plan_id}
//               onChange={(e) => setData({ ...data, lesson_plan_id: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             >
//               <option value="">Select Lesson Plan</option>
//               {lessonPlans
//                 .filter((lp) => lp.status === "APPROVED")
//                 .map((lp) => (
//                   <option key={lp.id} value={lp.id}>
//                     {lp.title} ({lp.traineeName})
//                   </option>
//                 ))}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Trainee</label>
//             <select
//               value={data.trainee_id}
//               onChange={(e) => setData({ ...data, trainee_id: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             >
//               <option value="">Select Trainee</option>
//               {trainees.map((trainee) => (
//                 <option key={trainee.id} value={trainee.id}>
//                   {trainee.name} {trainee.surname}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Date</label>
//             <input
//               type="date"
//               value={data.date}
//               onChange={(e) => setData({ ...data, date: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Start Time</label>
//             <input
//               type="time"
//               value={data.start_time}
//               onChange={(e) => setData({ ...data, start_time: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">End Time</label>
//             <input
//               type="time"
//               value={data.end_time}
//               onChange={(e) => setData({ ...data, end_time: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               type="submit"
//               className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
//             >
//               Schedule
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const SubmitFeedbackModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   observationId,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (observationId: string, data: { score: number; comments: string }) => void;
//   observationId: string;
// }) => {
//   const [score, setScore] = useState<number | undefined>(undefined);
//   const [comments, setComments] = useState("");

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (score === undefined || !comments) {
//       toast.error("Score and comments are required.");
//       return;
//     }
//     onSubmit(observationId, { score, comments });
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-md w-full max-w-md">
//         <h2 className="text-lg font-semibold mb-4">Submit Observation Feedback</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Score (0-10)</label>
//             <input
//               type="number"
//               value={score ?? ""}
//               onChange={(e) => setScore(e.target.value ? parseInt(e.target.value) : undefined)}
//               min="0"
//               max="10"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Comments</label>
//             <textarea
//               value={comments}
//               onChange={(e) => setComments(e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               rows={4}
//               required
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               type="submit"
//               className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const FeedbackModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   traineeName,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (category: string, feedback: string) => void;
//   traineeName: string;
// }) => {
//   const [category, setCategory] = useState("");
//   const [feedback, setFeedback] = useState("");

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!category || !feedback) {
//       toast.error("Category and feedback are required.");
//       return;
//     }
//     onSubmit(category, feedback);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-md w-full max-w-md">
//         <h2 className="text-lg font-semibold mb-4">Send Feedback to {traineeName}</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Category</label>
//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               required
//             >
//               <option value="">Select Category</option>
//               <option value="General">General</option>
//               <option value="Lesson Plan">Lesson Plan</option>
//               <option value="Teaching Practice">Teaching Practice</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Feedback</label>
//             <textarea
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
//               rows={4}
//               required
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               type="submit"
//               className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const SingleSupervisorPage = () => {
//   const { user, loading: authLoading, logout } = useAuth();
//   const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
//   const [trainees, setTrainees] = useState<Trainee[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [observations, setObservations] = useState<Observation[]>([]);
//   const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
//   const [supervisedTraineesCount, setSupervisedTraineesCount] = useState<number>(0);
//   const [totalObservationsScheduled, setTotalObservationsScheduled] = useState<number>(0);
//   const [totalCompletedObservations, setTotalCompletedObservations] = useState<number>(0);
//   const [totalLessonPlans, setTotalLessonPlans] = useState<number>(0);
//   const [pendingLessonPlansCount, setPendingLessonPlansCount] = useState<number>(0);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
//   const [selectedTraineeForFeedback, setSelectedTraineeForFeedback] = useState<Trainee | null>(null);
//   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
//   const [reviewLessonPlanId, setReviewLessonPlanId] = useState<string | null>(null);
//   const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
//   const [isObservationFeedbackModalOpen, setIsObservationFeedbackModalOpen] = useState(false);
//   const [feedbackObservationId, setFeedbackObservationId] = useState<string | null>(null);
//   const router = useRouter();

//   // Debounce function to limit fetch calls
//   const debounce = (func: (...args: any[]) => void, wait: number) => {
//     let timeout: NodeJS.Timeout;
//     return (...args: any[]) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => func(...args), wait);
//     };
//   };

//   const fetchSupervisorData = useCallback(async () => {
//     if (!user || user.role !== "supervisor") {
//       console.error("Invalid user or role:", user);
//       setError("Please sign in as a supervisor.");
//       router.push("/auth/signin");
//       return;
//     }

//     const supervisorId = user.identifier;
//     if (!supervisorId || supervisorId === "undefined" || typeof supervisorId !== "string" || supervisorId.trim() === "") {
//       console.error("Invalid supervisorId from user.identifier:", supervisorId, "User:", user);
//       setError("Missing or invalid supervisor identifier. Please sign in again.");
//       router.push("/auth/signin");
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log("Fetching data for supervisorId:", supervisorId);
//       const supervisorData = await getSupervisorProfile(supervisorId);
//       console.log("Supervisor data received:", supervisorData);

//       setSupervisor({
//         id: supervisorData.id,
//         staffId: supervisorData.staffId,
//         name: supervisorData.name,
//         surname: supervisorData.surname,
//         email: supervisorData.email,
//         phone: supervisorData.phone,
//         createdAt: supervisorData.createdAt,
//       });

//       const traineesData = Array.isArray(supervisorData.assignedTrainees) ? supervisorData.assignedTrainees : [];
//       console.log("Setting trainees:", traineesData);
//       setTrainees(traineesData);
//       setSupervisedTraineesCount(traineesData.length);

//       const observationsData = Array.isArray(supervisorData.schedules) ? supervisorData.schedules : [];
//       setObservations(observationsData);
//       setTotalObservationsScheduled(observationsData.length);
//       setTotalCompletedObservations(
//         observationsData.filter((s) => s.status === "COMPLETED").length
//       );

//       const lessonPlansData = Array.isArray(supervisorData.lessonPlans) ? supervisorData.lessonPlans : [];
//       const sortedLessonPlans = lessonPlansData
//         .map((item: any) => ({
//           id: item.id,
//           traineeId: String(item.traineeId),
//           title: item.title || "Untitled",
//           subject: item.subject || "Unknown",
//           class: item.class || "Unknown",
//           date: item.date || new Date().toISOString().split("T")[0],
//           startTime: item.startTime || null,
//           endTime: item.endTime || null,
//           objectives: item.objectives || "",
//           activities: item.activities || "",
//           resources: item.resources || "",
//           createdAt: item.createdAt || new Date().toISOString(),
//           status: item.status || "PENDING",
//           aiGenerated: item.aiGenerated ?? false,
//           traineeName: item.traineeName || "Unknown",
//           supervisorName: item.supervisorName || "Unknown",
//           schoolName: item.schoolName || "Unknown",
//           pdfUrl: item.pdfUrl || null,
//         }))
//         .sort((a: LessonPlan, b: LessonPlan) => {
//           const dateA = parseISO(a.createdAt).getTime();
//           const dateB = parseISO(b.createdAt).getTime();
//           return dateB - dateA; // Newest first
//         });
//       setLessonPlans(sortedLessonPlans);
//       setTotalLessonPlans(lessonPlansData.length);
//       setPendingLessonPlansCount(
//         lessonPlansData.filter((lp) => lp.status === "PENDING").length
//       );

//       try {
//         // const notificationsResponse = await getNotifications();
//         // setNotifications(notificationsResponse.data || []);

//         const notificationsResponse = await getNotifications(1, undefined, undefined, undefined, undefined);
//         setNotifications(notificationsResponse.notifications || []);
//         console.log("Notifications received:", notificationsResponse.notifications);
        
//       } catch (notifErr: any) {
//         toast.warning("Failed to load notifications.");
//         setNotifications([]);
//       }
//     } catch (err: any) {
//       const message = err.message.includes("CORS")
//         ? "Failed to connect to the server. Please contact the administrator to check CORS settings."
//         : err.response?.status === 401
//         ? "Session expired. Please sign in again."
//         : err.response?.status === 403
//         ? "Unauthorized: You can only access your own profile."
//         : err.response?.status === 404
//         ? `Supervisor profile not found for ID: ${supervisorId}`
//         : `Failed to load data: ${err.message}`;
//       console.error("Fetch error:", message, err);
//       setError(message);
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [user, router]);

//   const debouncedFetchSupervisorData = useCallback(debounce(fetchSupervisorData, 500), [fetchSupervisorData]);

//   const handleRefetch = useCallback(() => {
//     debouncedFetchSupervisorData();
//     window.dispatchEvent(new Event("notification:updated"));
//   }, [debouncedFetchSupervisorData]);

//   const handleSendFeedback = (trainee: Trainee) => {
//     setSelectedTraineeForFeedback(trainee);
//     setIsFeedbackModalOpen(true);
//   };

//   const handleFeedbackSubmit = async (category: string, feedback: string) => {
//     try {
//       if (!selectedTraineeForFeedback) {
//         throw new Error("No trainee selected");
//       }
//       if (!supervisor?.id) {
//         throw new Error("Supervisor profile not loaded");
//       }
//       await sendFeedback({
//         supervisorId: supervisor.id,
//         category,
//         feedback,
//         traineeId: selectedTraineeForFeedback.id,
//       });
//       toast.success("Feedback sent to trainee");
//       handleRefetch();
//     } catch (err: any) {
//       console.error("Send feedback error:", err.message);
//       toast.error(err.message || "Failed to send feedback.");
//     }
//   };

//   const handleReviewLessonPlan = async (
//     lessonPlanId: string,
//     data: { status: "APPROVED" | "REJECTED"; comments: string; score?: number }
//   ) => {
//     if (!supervisor?.id) {
//       console.error("Invalid supervisorId in handleReviewLessonPlan: supervisor.id is undefined", "Supervisor state:", supervisor);
//       toast.error("Supervisor profile not loaded. Please reload the page or sign in again.");
//       return;
//     }

//     try {
//       console.log("Reviewing lesson plan with supervisorId:", supervisor.id, "lessonPlanId:", lessonPlanId);
//       const response = await reviewLessonPlan(supervisor.id, lessonPlanId, data);
//       toast.success(response.message);
//       handleRefetch();
//     } catch (err: any) {
//       console.error("Review lesson plan error:", err.message, err.response?.data);
//       toast.error(err.message || "Failed to review lesson plan.");
//     }
//   };

//   const handleScheduleObservation = async (data: {
//     lesson_plan_id: string;
//     trainee_id: string;
//     date: string;
//     start_time: string;
//     end_time: string;
//   }) => {
//     if (!supervisor?.id) {
//       console.error("Invalid supervisorId in handleScheduleObservation: supervisor.id is undefined", "Supervisor state:", supervisor);
//       toast.error("Supervisor profile not loaded. Please reload the page or sign in again.");
//       return;
//     }

//     try {
//       const response = await scheduleObservation(supervisor.id, data);
//       toast.success(response.message);
//       handleRefetch();
//     } catch (err: any) {
//       console.error("Schedule observation error:", err.message);
//       toast.error(err.message || "Failed to schedule observation.");
//     }
//   };

//   const handleSubmitObservationFeedback = async (
//     observationId: string,
//     data: { score: number; comments: string }
//   ) => {
//     if (!supervisor?.id) {
//       console.error("Invalid supervisorId in handleSubmitObservationFeedback: supervisor.id is undefined", "Supervisor state:", supervisor);
//       toast.error("Supervisor profile not loaded. Please reload the page or sign in again.");
//       return;
//     }

//     try {
//       const response = await submitObservationFeedback(supervisor.id, observationId, data);
//       toast.success(response.message);
//       handleRefetch();
//     } catch (err: any) {
//       console.error("Submit observation feedback error:", err.message);
//       toast.error(err.message || "Failed to submit observation feedback.");
//     }
//   };

//   useEffect(() => {
//     if (!authLoading) {
//       fetchSupervisorData();
//     }
//   }, [authLoading, fetchSupervisorData]);

//   useEffect(() => {
//     const handleNotificationUpdate = () => {
//       debouncedFetchSupervisorData();
//     };
//     window.addEventListener("notification:updated", handleNotificationUpdate);
//     return () => {
//       window.removeEventListener("notification:updated", handleNotificationUpdate);
//     };
//   }, [debouncedFetchSupervisorData]);

//   if (authLoading || loading) {
//     return (
//       <div className="p-4 flex items-center justify-center h-full">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
//       </div>
//     );
//   }

//   if (error || !supervisor) {
//     return (
//       <div className="p-4 text-red-500 bg-red-50 rounded-lg">
//         <p className="font-medium">{error || "Failed to load profile."}</p>
//         <div className="mt-4 flex gap-3">
//           <button
//             onClick={() => router.push("/auth/signin")}
//             className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
//           >
//             Sign In
//           </button>
//           <button
//             onClick={handleRefetch}
//             className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const calendarEvents = observations.map((obs) => ({
//     title: `Observation: ${obs.lessonPlanTitle || "Lesson"} (${obs.traineeName || "Trainee"})`,
//     start: obs.start_time ? new Date(`${obs.date}T${obs.start_time}`) : new Date(obs.date),
//     end: obs.end_time ? new Date(`${obs.date}T${obs.end_time}`) : new Date(obs.date),
//   }));

//   const showSchedule = observations.length > 0;

//   return (
//     <div className="p-4 flex gap-4 flex-col xl:flex-row">
//       {/* LEFT */}
//       <div className="w-full xl:w-2/3">
//         {/* Supervisor Assignment Section */}
//         <div className="bg-white p-4 rounded-md mb-4 shadow-sm">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-xl font-semibold">Supervisory Role</h1>
//           </div>
//           {trainees.length === 0 ? (
//             <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
//               <Image
//                 src="/singleBranch.png"
//                 alt="No Assignment"
//                 width={24}
//                 height={24}
//                 className="w-6 h-6"
//               />
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-500">No Trainees Assigned</h2>
//                 <span className="text-sm text-gray-400">Supervisory Status</span>
//               </div>
//             </div>
//           ) : (
//             <div className="flex flex-wrap gap-4">
//               <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
//                 <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
//                 <div>
//                   <h2 className="text-lg font-semibold">{supervisedTraineesCount}</h2>
//                   <span className="text-sm text-gray-400">Supervised Trainees</span>
//                 </div>
//               </div>
//               <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
//                 <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
//                 <div>
//                   <h2 className="text-lg font-semibold">{totalLessonPlans}</h2>
//                   <span className="text-sm text-gray-400">Total Lesson Plans</span>
//                 </div>
//               </div>
//               <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
//                 <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
//                 <div>
//                   <h2 className="text-lg font-semibold">{totalObservationsScheduled}</h2>
//                   <span className="text-sm text-gray-400">Observations Scheduled</span>
//                 </div>
//               </div>
//               <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
//                 <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
//                 <div>
//                   <h2 className="text-lg font-semibold">{totalCompletedObservations}</h2>
//                   <span className="text-sm text-gray-400">Completed Observations</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Lesson Plans Section */}
//         <div className="bg-white p-6 rounded-md shadow-md mb-4">
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-2xl font-bold text-gray-800">Lesson Plans to Review</h1>
//             <button
//               onClick={() => router.push("/supervisor/lesson-plans")}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors focus:ring-2 focus:ring-blue-200 focus:outline-none"
//               aria-label="Manage lesson plans"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//               </svg>
//               Manage Lesson Plans
//             </button>
//           </div>
//           {lessonPlans.length === 0 ? (
//             <div className="text-center py-10 bg-gray-50 rounded-md">
//               <Image
//                 src="/stockout.png"
//                 alt="No lesson plans"
//                 width={120}
//                 height={120}
//                 className="mx-auto mb-4"
//               />
//               <p className="text-gray-500 text-lg mb-4">No lesson plans to review.</p>
//               <button
//                 onClick={() => router.push("/supervisor/lesson-plans")}
//                 className="px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors"
//                 aria-label="Go to lesson plans"
//               >
//                 Go to Lesson Plans
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Lesson Plans</h2>
//               <ul className="space-y-3">
//                 {lessonPlans
//                   .filter((plan) => plan.status === "PENDING")
//                   .map((plan) => {
//                     const styles = getLessonPlanStyles(plan.status);
//                     return (
//                       <li
//                         key={plan.id}
//                         className={`p-3 ${styles.bg} ${styles.border} rounded-md flex items-start space-x-3 hover:bg-opacity-90 transition-colors`}
//                       >
//                         <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-2`}></div>
//                         <div className="flex-1">
//                           <p className="text-sm text-gray-800 font-medium">{plan.title}</p>
//                           <p className="text-xs text-gray-600 mt-1">
//                             Trainee: {plan.traineeName}
//                           </p>
//                           <p className="text-xs text-gray-600">
//                             Subject: {plan.subject}
//                           </p>
//                           <p className="text-xs text-gray-600">
//                             Date: {formatDate(plan.date)}
//                           </p>
//                           <p className="text-xs text-gray-600">
//                             Time: {plan.startTime && plan.endTime ? `${plan.startTime.slice(0, 5)} - ${plan.endTime.slice(0, 5)}` : "N/A"}
//                           </p>
//                           <p className="text-xs mt-1">
//                             <span className={styles.statusText}>{plan.status}</span> •{" "}
//                             <span className="text-gray-600">{formatDate(plan.createdAt)}</span>
//                           </p>
//                         </div>
//                         <div className="flex gap-2">
//                           <FormModal
//                             table="lesson_plan"
//                             type="view"
//                             data={plan}
//                             ariaLabel={`View lesson plan: ${plan.title}`}
//                           />
//                           <button
//                             onClick={() => {
//                               setReviewLessonPlanId(plan.id);
//                               setIsReviewModalOpen(true);
//                             }}
//                             className="px-3 py-1 bg-blue-300 text-white rounded-md text-xs hover:bg-blue-400"
//                           >
//                             Review
//                           </button>
//                         </div>
//                       </li>
//                     );
//                   })}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Schedule Section */}
//         <div className="bg-white p-4 rounded-md shadow-md">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-xl font-semibold">My Schedule</h1>
//             <button
//               onClick={() => setIsScheduleModalOpen(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors focus:ring-2 focus:ring-blue-200 focus:outline-none"
//               aria-label="Schedule observation"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//               </svg>
//               Schedule Observation
//             </button>
//           </div>
//           {showSchedule ? (
//             <div className="h-[400px] overflow-y-auto">
//               <BigCalendarContainer type="supervisor" id={supervisor.id} events={calendarEvents} />
//             </div>
//           ) : (
//             <div className="text-center py-10 bg-gray-50 rounded-md">
//               <Image
//                 src="/stockout.png"
//                 alt="No schedule"
//                 width={120}
//                 height={120}
//                 className="mx-auto mb-4"
//               />
//               <p className="text-gray-500 text-lg">
//                 No observations scheduled yet.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-8">
//         <div className="bg-white p-4 rounded-md shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
//           <div className="flex gap-4 flex-wrap text-sm">
//             <Link
//               href={`/list/trainees?supervisorId=${supervisor.id}`}
//               className="p-3 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors"
//             >
//               Manage Trainees
//             </Link>
//             <Link
//               href={`/list/schedules?supervisorId=${supervisor.id}`}
//               className="p-3 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors"
//             >
//               View Schedules
//             </Link>
//             <Link
//               href={`/supervisor/report?supervisorId=${supervisor.id}`}
//               className="p-3 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors"
//             >
//               Generate Report
//             </Link>
//           </div>
//         </div>
//         <EventCalendar />
//         <div className="bg-white p-4 rounded-md shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Notifications</h2>
//           {notifications.length === 0 ? (
//             <div className="text-center text-gray-500 py-6">
//               <p>No notifications at the moment.</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`p-4 rounded-lg flex items-start gap-3 transition-all ${
//                     notification.read_status
//                       ? "bg-gray-100 hover:bg-gray-200"
//                       : "bg-[#FAE27C] hover:bg-[#F7D154]"
//                   }`}
//                 >
//                   <Image
//                     src={notification.read_status ? "/bell-gray.png" : "/bell-yellow.png"}
//                     alt="Notification"
//                     width={20}
//                     height={20}
//                   />
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-gray-800">{notification.message}</p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {new Date(notification.created_at).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <Announcements supervisorId={supervisor.id} />
//       </div>

//       {/* Modals */}
//       <ReviewLessonPlanModal
//         isOpen={isReviewModalOpen}
//         onClose={() => setIsReviewModalOpen(false)}
//         onSubmit={handleReviewLessonPlan}
//         lessonPlanId={reviewLessonPlanId || ""}
//       />
//       <FeedbackModal
//         isOpen={isFeedbackModalOpen}
//         onClose={() => setIsFeedbackModalOpen(false)}
//         onSubmit={handleFeedbackSubmit}
//         traineeName={selectedTraineeForFeedback ? `${selectedTraineeForFeedback.name} ${selectedTraineeForFeedback.surname}` : ""}
//       />
//       <ScheduleObservationModal
//         isOpen={isScheduleModalOpen}
//         onClose={() => setIsScheduleModalOpen(false)}
//         onSubmit={handleScheduleObservation}
//         lessonPlans={lessonPlans}
//         trainees={trainees}
//       />
//       <SubmitFeedbackModal
//         isOpen={isObservationFeedbackModalOpen}
//         onClose={() => setIsObservationFeedbackModalOpen(false)}
//         onSubmit={handleSubmitObservationFeedback}
//         observationId={feedbackObservationId || ""}
//       />
//     </div>
//   );
// };

// export default SingleSupervisorPage;







