"use client";

import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import { useTableSearch } from "@/hooks/useTableSearch";
import { useAuth } from "@/lib/useAuth";
import Image from "next/image";
import { format } from "date-fns";
import {
  getSupervisorProfile,
  reviewLessonPlan,
  scheduleObservation,
  submitObservationFeedback,
  updateObservationStatusAPI,
} from "@/lib/api";

// Type definitions
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
  reviewComments?: string;
  reviewScore?: number | null;
};

type Schedule = {
  id: string;
  supervisorId?: string;
  traineeId: string;
  lesson_plan_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED";
  created_at: string;
  lessonPlanTitle?: string;
  traineeName?: string;
};

// Type for API response schedule (without supervisorId, lessonPlanTitle, traineeName)
type ApiSchedule = {
  id: string;
  traineeId: string;
  lesson_plan_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  created_at?: string;
};

// Type for feedback submission payload
type FeedbackPayload = {
  traineeId: string;
  supervisorId: string;
  lesson_plan_id: string | null;
  schedule_id: string;
  comments: string;
  score: number;
};

// Type for feedback (including server-side fields)
type Feedback = {
  id: string;
  traineeId: string;
  supervisorId: string;
  lesson_plan_id: string | null;
  schedule_id: string;
  comments: string;
  score: number | null;
  created_at: string;
  traineeName?: string;
  supervisorName?: string;
  lessonPlanTitle?: string;
};

// Define the expected response type for reviewLessonPlan
type ReviewLessonPlanResponse = {
  lessonPlan: LessonPlan;
  schedules: ApiSchedule[];
  message: string;
  feedback: unknown;
};

// Define the expected response type for scheduleObservation
type ScheduleObservationResponse = {
  schedule: ApiSchedule;
  message: string;
};

type State = {
  lessonPlans: LessonPlan[];
  schedules: Schedule[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  totalSchedules: number;
  totalSchedulePages: number;
  currentSchedulePage: number;
  isFetching: boolean;
  loading: boolean;
  error: string | null;
  filterModal: {
    isOpen: boolean;
    tempConfig: { subject: string; status: string };
  };
  reviewModal: {
    isOpen: boolean;
    lessonPlanId: string | null;
  };
  viewReviewModal: {
    isOpen: boolean;
    status: "APPROVED" | "REJECTED" | null;
  };
  scheduleModal: {
    isOpen: boolean;
    lessonPlanId: string;
    traineeId: string;
    date: string;
    startTime: string;
    endTime: string;
    lessonPlanTitle: string;
    traineeName: string;
    isApproval: boolean;
  };
  feedbackModal: {
    isOpen: boolean;
    observationId: string | null;
  };
  newScheduleId: string | null;
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
function isValidScheduleStatus(status: string): status is Schedule["status"] {
  return ["SCHEDULED", "ONGOING", "COMPLETED"].includes(status);
}

// Normalize schedule data
function normalizeSchedule(schedule: ApiSchedule, lessonPlans: LessonPlan[]): Schedule {
  const lessonPlan = lessonPlans.find((lp) => lp.id === schedule.lesson_plan_id);
  return {
    ...schedule,
    lessonPlanTitle: lessonPlan?.title || "Unknown Lesson Plan",
    traineeName: lessonPlan?.traineeName || schedule.traineeId || "Unknown Trainee",
    start_time: normalizeTime(schedule.start_time),
    end_time: normalizeTime(schedule.end_time),
    supervisorId: undefined, // Set to undefined as API does not provide supervisorId
    created_at: schedule.created_at || new Date().toISOString(),
    status: isValidScheduleStatus(schedule.status) ? schedule.status : "SCHEDULED",
  };
}

// Modals
const ReviewLessonPlanModal = ({
  isOpen,
  onClose,
  onSubmit,
  lessonPlanId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lessonPlanId: string, data: { status: "APPROVED" | "REJECTED"; comments: string; score?: number }) => void;
  lessonPlanId: string;
}) => {
  const [status, setStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [comments, setComments] = useState("");
  const [score, setScore] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments) {
      toast.error("Comments are required.");
      return;
    }
    const scoreNum = score ? parseInt(score) : undefined;
    if (scoreNum !== undefined && (scoreNum < 0 || scoreNum > 10)) {
      toast.error("Score must be between 0 and 10.");
      return;
    }
    onSubmit(lessonPlanId, { status, comments, score: scoreNum });
    setComments("");
    setScore("");
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
              value={score}
              onChange={(e) => setScore(e.target.value)}
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
  lessonPlanId,
  traineeId,
  date,
  startTime,
  endTime,
  lessonPlanTitle,
  traineeName,
  isApproval,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    lessonPlanId: string;
    traineeId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  lessonPlanId: string;
  traineeId: string;
  date: string;
  startTime: string;
  endTime: string;
  lessonPlanTitle: string;
  traineeName: string;
  isApproval: boolean;
}) => {
  const [formData, setFormData] = useState({
    lessonPlanId,
    traineeId,
    date,
    startTime,
    endTime,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({ lessonPlanId, traineeId, date, startTime, endTime });
  }, [lessonPlanId, traineeId, date, startTime, endTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!formData.lessonPlanId || !formData.traineeId || !formData.date || !formData.startTime || !formData.endTime) {
        throw new Error("All fields are required.");
      }
      const parsedDate = new Date(formData.date);
      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");
      const startTimeMatch = formData.startTime.match(/^(\d{2}):(\d{2})$/);
      const endTimeMatch = formData.endTime.match(/^(\d{2}):(\d{2})$/);
      if (!startTimeMatch || !endTimeMatch) throw new Error("Invalid time format (use HH:MM)");
      const [startHour, startMin] = startTimeMatch.slice(1).map(Number);
      const [endHour, endMin] = endTimeMatch.slice(1).map(Number);
      if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
        throw new Error("End time must be after start time");
      }
      await onSubmit(formData);
      toast.success(isApproval ? "Lesson plan approved and observation scheduled" : "Observation scheduled successfully");
      setFormData({ lessonPlanId: "", traineeId: "", date: "", startTime: "", endTime: "" });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {isApproval ? "Confirm Observation Schedule" : "Schedule Observation"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lesson Plan</label>
            <input
              type="text"
              value={lessonPlanTitle}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-100"
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Trainee</label>
            <input
              type="text"
              value={traineeName}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-100"
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Start Time (HH:MM)</label>
            <input
              type="text"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              placeholder="e.g., 09:00"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">End Time (HH:MM)</label>
            <input
              type="text"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              placeholder="e.g., 10:00"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400 flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isApproval ? "Confirm Schedule" : "Schedule"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewReviewModal = ({
  isOpen,
  onClose,
  status,
}: {
  isOpen: boolean;
  onClose: () => void;
  status: "APPROVED" | "REJECTED" | null;
}) => {
  if (!isOpen || !status) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Review Details</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <p className="mt-1 text-sm text-gray-800">{status}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
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
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = parseInt(score);
    if (!comments) {
      toast.error("Comments are required.");
      return;
    }
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      toast.error("Score must be between 0 and 10.");
      return;
    }
    onSubmit(observationId, { score: scoreNum, comments });
    setScore("");
    setComments("");
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
              value={score}
              onChange={(e) => setScore(e.target.value)}
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

const SupervisorLessonPlanPage = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();
  const initialFetchRef = useRef(true);
  const fetchCountRef = useRef(0);
  const authCheckRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  const [state, setState] = useState<State>({
    lessonPlans: [],
    schedules: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    totalSchedules: 0,
    totalSchedulePages: 1,
    currentSchedulePage: 1,
    isFetching: false,
    loading: true,
    error: null,
    filterModal: {
      isOpen: false,
      tempConfig: { subject: "", status: "PENDING,APPROVED" },
    },
    reviewModal: {
      isOpen: false,
      lessonPlanId: null,
    },
    viewReviewModal: {
      isOpen: false,
      status: null,
    },
    scheduleModal: {
      isOpen: false,
      lessonPlanId: "",
      traineeId: "",
      date: "",
      startTime: "",
      endTime: "",
      lessonPlanTitle: "",
      traineeName: "",
      isApproval: false,
    },
    feedbackModal: {
      isOpen: false,
      observationId: null,
    },
    newScheduleId: null,
  });

  const {
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
    filterConfig,
    updateFilter,
  } = useTableSearch<LessonPlan>({
    data: state.lessonPlans,
    searchableFields: [
      (lp) => lp.title || "",
      (lp) => lp.subject || "",
      (lp) => lp.traineeName || "",
    ],
    initialSortField: "createdAt",
    initialSortDirection: "desc",
    itemsPerPage: 10,
  });

  const memoizedFilterConfig = useMemo(
    () => ({
      subject: filterConfig.subject || "",
      status: filterConfig.status || "PENDING,APPROVED",
    }),
    [filterConfig.subject, filterConfig.status]
  );

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    const localStorageToken = localStorage.getItem("token");
    return cookieToken || localStorageToken || null;
  }, []);

  const fetchData = useCallback(
    async (page: number, resetPage = false, fetchSchedules = false) => {
      const now = Date.now();
      if (authLoading || state.isFetching || fetchCountRef.current > 10 || now - lastFetchTimeRef.current < 2000) {
        return;
      }
      fetchCountRef.current += 1;
      lastFetchTimeRef.current = now;

      if (authError || !getToken() || !user || user.role.toLowerCase() !== "supervisor") {
        setState((prev) => ({ ...prev, error: authError || "Please sign in as a supervisor." }));
        router.push("/auth/signin");
        return;
      }

      setState((prev) => ({ ...prev, isFetching: true, loading: true }));
      try {
        const pageToFetch = resetPage ? 1 : page;
        const statusFilter = memoizedFilterConfig.status || "PENDING,APPROVED";

        const profileData = await getSupervisorProfile(user.identifier);
        console.log("Profile Data:", profileData);

        let filteredPlans = profileData.lessonPlans as LessonPlan[];
        if (statusFilter) {
          const statuses = statusFilter.split(",");
          filteredPlans = filteredPlans.filter((plan) => statuses.includes(plan.status));
        }
        if (searchQuery) {
          const lowerSearch = searchQuery.toLowerCase();
          filteredPlans = filteredPlans.filter(
            (plan) =>
              plan.title?.toLowerCase().includes(lowerSearch) ||
              plan.subject?.toLowerCase().includes(lowerSearch) ||
              plan.traineeName?.toLowerCase().includes(lowerSearch)
          );
        }
        if (memoizedFilterConfig.subject) {
          filteredPlans = filteredPlans.filter((plan) => plan.subject === memoizedFilterConfig.subject);
        }

        const startIndex = (pageToFetch - 1) * 10;
        const paginatedPlans = filteredPlans.slice(startIndex, startIndex + 10);
        const totalCount = filteredPlans.length;
        const totalPages = Math.ceil(totalCount / 10) || 1;

        const scheduleData = profileData.schedules as Schedule[];
        console.log("Schedules Data:", scheduleData);

        const schedulesWithFallback = Array.isArray(scheduleData)
          ? scheduleData.map((s) => normalizeSchedule(s as ApiSchedule, paginatedPlans))
          : [];

        setState((prev) => {
          console.log("Setting state.schedules:", schedulesWithFallback);
          return {
            ...prev,
            lessonPlans: paginatedPlans.map((lp) => ({
              ...lp,
              traineeName: lp.traineeName || lp.traineeId || "Unknown Trainee",
              schoolName: lp.schoolName || "Not Assigned",
            })),
            schedules: schedulesWithFallback,
            totalCount,
            totalPages,
            currentPage: pageToFetch,
            totalSchedules: schedulesWithFallback.length,
            totalSchedulePages: Math.ceil(schedulesWithFallback.length / 10) || 1,
            currentSchedulePage: pageToFetch,
            isFetching: false,
            loading: false,
            error: null,
          };
        });
        fetchCountRef.current = 0;
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setState((prev) => ({
          ...prev,
          isFetching: false,
          loading: false,
          error: "Failed to fetch data.",
        }));
        toast.error("Failed to fetch data.");
      }
    },
    [user, authError, authLoading, router, searchQuery, memoizedFilterConfig, getToken]
  );

  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => {
      if (authLoading) return;
      if (query === searchQuery) return;
      setSearchQuery(query);
      fetchData(1, true);
    }, 1000),
    [setSearchQuery, authLoading, searchQuery, fetchData]
  );

  const handlePageChange = useCallback(
    (newPage: number, type: "lessonPlans" | "schedules") => {
      if (
        (type === "lessonPlans" && (newPage < 1 || newPage > state.totalPages || newPage === state.currentPage)) ||
        (type === "schedules" && (newPage < 1 || newPage > state.totalSchedulePages || newPage === state.currentSchedulePage))
      ) {
        return;
      }
      fetchData(newPage, false, type === "schedules");
    },
    [state.totalPages, state.currentPage, state.totalSchedulePages, state.currentSchedulePage, fetchData]
  );

  const handleReviewLessonPlan = useCallback(
    async (lessonPlanId: string, data: { status: "APPROVED" | "REJECTED"; comments: string; score?: number }) => {
      if (!user?.identifier) {
        toast.error("Supervisor profile not loaded. Please sign in again.");
        router.push("/auth/signin");
        return;
      }

      try {
        const lessonPlan = state.lessonPlans.find((lp) => lp.id === lessonPlanId);
        if (!lessonPlan) {
          throw new Error("Lesson plan not found");
        }

        if (data.status === "APPROVED") {
          setState((prev) => ({
            ...prev,
            reviewModal: { isOpen: false, lessonPlanId: null },
            scheduleModal: {
              isOpen: true,
              lessonPlanId,
              traineeId: lessonPlan.traineeId,
              date: lessonPlan.date,
              startTime: lessonPlan.startTime || "09:00",
              endTime: lessonPlan.endTime || "10:00",
              lessonPlanTitle: lessonPlan.title,
              traineeName: lessonPlan.traineeName,
              isApproval: true,
            },
          }));
          return;
        }

        await reviewLessonPlan(user.identifier, lessonPlanId, data);
        toast.success("Lesson plan rejected");
        fetchData(state.currentPage, false, true);
      } catch (err: any) {
        toast.error(`Error: ${err.message}`);
      }
    },
    [user, router, state.lessonPlans, state.currentPage, fetchData]
  );

  const confirmScheduleAndApprove = useCallback(
    async (data: { lessonPlanId: string; traineeId: string; date: string; startTime: string; endTime: string }) => {
      if (!user?.identifier) {
        toast.error("Please sign in as a supervisor.");
        router.push("/auth/signin");
        return;
      }

      try {
        const lessonPlan = state.lessonPlans.find((lp) => lp.id === data.lessonPlanId);
        if (!lessonPlan) {
          throw new Error("Lesson plan not found");
        }
        const reviewData = {
          status: "APPROVED" as const,
          comments: "Approved with scheduled observation",
          score: undefined as number | undefined,
        };
        const response = await reviewLessonPlan(user.identifier, data.lessonPlanId, reviewData);
        console.log("Review Lesson Plan Response:", response);
        const newSchedule = response.schedules[0];
        if (newSchedule) {
          const normalizedSchedule = normalizeSchedule(
            {
              ...newSchedule,
              status: isValidScheduleStatus(newSchedule.status) ? newSchedule.status : "SCHEDULED",
              supervisorId: user.identifier, // Explicitly set supervisorId
            } as ApiSchedule,
            state.lessonPlans
          );
          console.log("New Schedule:", {
            id: normalizedSchedule.id,
            lessonPlanTitle: normalizedSchedule.lessonPlanTitle,
            traineeName: normalizedSchedule.traineeName,
          });
          setState((prev) => ({
            ...prev,
            newScheduleId: normalizedSchedule.id,
            schedules: [
              ...prev.schedules.filter((s) => s.id !== normalizedSchedule.id),
              normalizedSchedule,
            ],
          }));
          toast.success("Lesson plan approved and observation scheduled");
          setTimeout(() => setState((prev) => ({ ...prev, newScheduleId: null })), 3000);
        } else {
          console.warn("No schedule returned in response");
          toast.warn("Lesson plan approved, but no observation scheduled");
        }
        fetchData(state.currentPage, false, true);
      } catch (err: any) {
        console.error("Approval Error:", err);
        fetchData(state.currentPage, false, true);
      }
    },
    [user, router, state.lessonPlans, state.currentPage, fetchData]
  );

  const scheduleObservationHandler = useCallback(
    async (data: { lessonPlanId: string; traineeId: string; date: string; startTime: string; endTime: string }) => {
      if (!user?.identifier) {
        toast.error("Please sign in as a supervisor.");
        router.push("/auth/signin");
        return;
      }

      try {
        const lessonPlan = state.lessonPlans.find((lp) => lp.id === data.lessonPlanId);
        const response = await scheduleObservation(user.identifier, {
          lesson_plan_id: data.lessonPlanId,
          trainee_id: data.traineeId,
          date: data.date,
          start_time: data.startTime,
          end_time: data.endTime,
        });
        const newSchedule = response.schedule;
        if (!newSchedule) {
          throw new Error("No schedule returned in response");
        }
        const normalizedSchedule = normalizeSchedule(
          {
            ...newSchedule,
            status: isValidScheduleStatus(newSchedule.status) ? newSchedule.status : "SCHEDULED",
            supervisorId: user.identifier, // Explicitly set supervisorId
          } as ApiSchedule,
          state.lessonPlans
        );
        console.log("New Schedule (Observation):", {
          id: normalizedSchedule.id,
          lessonPlanTitle: normalizedSchedule.lessonPlanTitle,
          traineeName: normalizedSchedule.traineeName,
        });
        setState((prev) => ({
          ...prev,
          newScheduleId: normalizedSchedule.id,
          schedules: [
            ...prev.schedules.filter((s) => s.id !== normalizedSchedule.id),
            normalizedSchedule,
          ],
        }));
        setTimeout(() => setState((prev) => ({ ...prev, newScheduleId: null })), 3000);
        fetchData(state.currentPage, false, true);
      } catch (err: any) {
        toast.error(`Error: ${err.message}`);
      }
    },
    [user, router, state.lessonPlans, state.currentPage, fetchData]
  );

  const updateObservationStatus = useCallback(
    async (observationId: string, newStatus: "ONGOING" | "COMPLETED") => {
      if (!user?.identifier) {
        toast.error("Please sign in as a supervisor.");
        router.push("/auth/signin");
        return;
      }

      const previousSchedules = state.schedules;
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((s) =>
          s.id === observationId ? { ...s, status: newStatus } : s
        ),
      }));

      try {
        await updateObservationStatusAPI(user.identifier, observationId, newStatus);
        toast.success(`Observation marked as ${newStatus.toLowerCase()}`);
        setTimeout(() => fetchData(state.currentPage, false, true), 500);
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          schedules: previousSchedules,
        }));
        toast.error(`Failed to update status: ${err.message}`);
      }
    },
    [user, router, state.schedules, state.currentPage, fetchData]
  );

  const submitFeedback = useCallback(
    async (observationId: string, data: { score: number; comments: string }) => {
      if (!user?.identifier) {
        toast.error("Please sign in as a supervisor.");
        router.push("/auth/signin");
        return;
      }

      try {
        const schedule = state.schedules.find((s) => s.id === observationId);
        if (!schedule) {
          throw new Error("Schedule not found for observation");
        }
        const feedback: FeedbackPayload = {
          traineeId: schedule.traineeId,
          supervisorId: user.identifier,
          lesson_plan_id: schedule.lesson_plan_id,
          schedule_id: observationId,
          comments: data.comments,
          score: data.score,
        };
        await submitObservationFeedback(user.identifier, observationId, feedback as any);
        toast.success("Feedback submitted successfully");
        fetchData(state.currentPage, false, true);
      } catch (err: any) {
        toast.error(`Error: ${err.message}`);
      }
    },
    [user, router, state.schedules, state.currentPage, fetchData]
  );

  const debouncedApplyFilters = useCallback(
    debounce(() => {
      if (authLoading) return;
      updateFilter("subject", state.filterModal.tempConfig.subject);
      updateFilter("status", state.filterModal.tempConfig.status || "PENDING,APPROVED");
      setState((prev) => ({
        ...prev,
        filterModal: { ...prev.filterModal, isOpen: false },
      }));
      fetchData(1, true);
    }, 1000),
    [state.filterModal.tempConfig, updateFilter, fetchData, authLoading]
  );

  const clearFilters = useCallback(
    () => {
      if (authLoading) return;
      setState((prev) => ({
        ...prev,
        filterModal: {
          isOpen: false,
          tempConfig: { subject: "", status: "PENDING,APPROVED" },
        },
      }));
      updateFilter("subject", "");
      updateFilter("status", "PENDING,APPROVED");
      fetchData(1, true);
    },
    [updateFilter, fetchData, authLoading]
  );

  useEffect(() => {
    if (authLoading || authError || !getToken() || !user || user.role.toLowerCase() !== "supervisor") {
      if (!authLoading) {
        setState((prev) => ({ ...prev, error: authError || "Please sign in as a supervisor." }));
        router.push("/auth/signin");
      }
      return;
    }

    if (!authCheckRef.current) {
      const timer = setTimeout(() => {
        authCheckRef.current = true;
        if (initialFetchRef.current) {
          fetchData(1, true);
          initialFetchRef.current = false;
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else if (initialFetchRef.current) {
      fetchData(1, true);
      initialFetchRef.current = false;
    }
  }, [authLoading, authError, user, router, fetchData, getToken]);

  const lessonPlanColumns = useMemo(
    () => [
      { header: "Title", accessor: "title", sortable: true, field: "title" },
      { header: "Subject", accessor: "subject", className: "hidden md:table-cell", sortable: true, field: "subject" },
      { header: "Class", accessor: "class", className: "hidden md:table-cell", sortable: true, field: "class" },
      { header: "Trainee", accessor: "traineeName", className: "hidden md:table-cell", sortable: true, field: "traineeName" },
      { header: "Date", accessor: "date", sortable: true, field: "date" },
      { header: "Time", accessor: "time", sortable: false },
      { header: "Status", accessor: "status", sortable: true, field: "status" },
      { header: "Actions", accessor: "action" },
    ],
    []
  );

  const scheduleColumns = useMemo(
    () => [
      { header: "Lesson Plan", accessor: "lessonPlanTitle", sortable: true, field: "lessonPlanTitle" },
      { header: "Trainee", accessor: "traineeName", sortable: true, field: "traineeName" },
      { header: "Date", accessor: "date", sortable: true, field: "date" },
      { header: "Time", accessor: "time", sortable: false },
      { header: "Status", accessor: "status", sortable: true, field: "status" },
      { header: "Actions", accessor: "action" },
    ],
    []
  );

  const renderLessonPlanRow = useCallback(
    (item: LessonPlan) => (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-100"
      >
        <td className="p-4">{item.title}</td>
        <td className="hidden md:table-cell">{item.subject}</td>
        <td className="hidden md:table-cell">{item.class}</td>
        <td className="hidden md:table-cell">{item.traineeName}</td>
        <td>{format(new Date(item.date), "MMM d, yyyy")}</td>
        <td>{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : "N/A"}</td>
        <td>
          <span
            className={`px-2 py-1 rounded text-xs ${
              item.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : item.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.status}
          </span>
        </td>
        <td>
          <div className="flex items-center gap-2">
            <FormModal
              table="lesson_plan"
              type="view"
              data={item}
              ariaLabel={`View lesson plan: ${item.title}`}
            />
            {item.status === "PENDING" ? (
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    reviewModal: { isOpen: true, lessonPlanId: item.id },
                  }))
                }
                className="px-3 py-1 bg-blue-300 text-white rounded-md text-xs hover:bg-blue-400"
              >
                Review
              </button>
            ) : (
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    viewReviewModal: {
                      isOpen: true,
                      status: item.status as "APPROVED" | "REJECTED",
                    },
                  }))
                }
                className="px-3 py-1 bg-gray-300 text-white rounded-md text-xs hover:bg-gray-400"
              >
                Reviewed
              </button>
            )}
          </div>
        </td>
      </tr>
    ),
    []
  );

  const renderScheduleRow = useCallback(
    (item: Schedule) => {
      console.log(`Rendering schedule ${item.id}:`, {
        lessonPlanTitle: item.lessonPlanTitle,
        traineeName: item.traineeName,
        status: item.status,
      });
      return (
        <tr
          key={item.id}
          className={`border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-100 ${
            state.newScheduleId === item.id ? "animate-pulse bg-green-50" : ""
          }`}
        >
          <td className="p-4">{item.lessonPlanTitle || "Unknown Lesson Plan"}</td>
          <td>{item.traineeName || "Unknown Trainee"}</td>
          <td>{format(new Date(item.date), "MMM d, yyyy")}</td>
          <td>{`${item.start_time || "N/A"} - ${item.end_time || "N/A"}`}</td>
          <td>
            <span
              className={`px-2 py-1 rounded text-xs ${
                item.status === "SCHEDULED"
                  ? "bg-yellow-100 text-yellow-800"
                  : item.status === "ONGOING"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {item.status}
            </span>
          </td>
          <td>
            <div className="flex items-center gap-2">
              {item.status === "SCHEDULED" && (
                <button
                  onClick={() => updateObservationStatus(item.id, "ONGOING")}
                  className="px-3 py-1 bg-blue-300 text-white rounded-md text-xs hover:bg-blue-400"
                >
                  Mark Ongoing
                </button>
              )}
              {item.status === "ONGOING" && (
                <button
                  onClick={() => updateObservationStatus(item.id, "COMPLETED")}
                  className="px-3 py-1 bg-green-300 text-white rounded-md text-xs hover:bg-green-400"
                >
                  Mark Completed
                </button>
              )}
              {item.status === "COMPLETED" && (
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      feedbackModal: { isOpen: true, observationId: item.id },
                    }))
                  }
                  className="px-3 py-1 bg-blue-300 text-white rounded-md text-xs hover:bg-blue-400"
                >
                  Submit Feedback
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    },
    [updateObservationStatus, state.newScheduleId]
  );

  if (authError) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-medium">{authError}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => fetchData(1, true)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-4">
        <h1 className="text-lg font-semibold">Lesson Plans to Review</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Title, Subject, Trainee..."
            onSearch={debouncedSetSearchQuery}
            ariaLabel="Search lesson plans"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  filterModal: {
                    isOpen: true,
                    tempConfig: {
                      subject: filterConfig.subject || "",
                      status: filterConfig.status || "PENDING,APPROVED",
                    },
                  },
                }))
              }
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
              aria-label="Filter lesson plans"
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button
              onClick={() => toggleSort("createdAt")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
              aria-label="Sort lesson plans"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {state.lessonPlans.length === 0 && !state.error ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">No lesson plans assigned for review.</p>
        </div>
      ) : state.error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {state.error}
        </div>
      ) : (
        <>
          <Table
            columns={lessonPlanColumns.map((col) => ({
              ...col,
              onSort: col.sortable ? () => toggleSort(col.field || col.accessor) : undefined,
            }))}
            renderRow={renderLessonPlanRow}
            data={state.lessonPlans}
          />
          <Pagination
            page={state.currentPage}
            count={state.totalCount}
            onPageChange={(newPage) => handlePageChange(newPage, "lessonPlans")}
          />
        </>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-4">Observation Schedules</h2>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setState((prev) => ({
              ...prev,
              scheduleModal: {
                isOpen: true,
                lessonPlanId: "",
                traineeId: "",
                date: "",
                startTime: "",
                endTime: "",
                lessonPlanTitle: "",
                traineeName: "",
                isApproval: false,
              },
            }))
          }
          className="px-4 py-2 bg-blue-300 text-white rounded-md hover:bg-blue-400"
          aria-label="Schedule new observation"
        >
          Schedule Observation
        </button>
      </div>
      {state.schedules.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">No observation schedules found.</p>
        </div>
      ) : (
        <>
          <Table
            columns={scheduleColumns}
            renderRow={renderScheduleRow}
            data={state.schedules}
          />
          <Pagination
            page={state.currentSchedulePage}
            count={state.totalSchedules}
            onPageChange={(newPage) => handlePageChange(newPage, "schedules")}
          />
        </>
      )}

      {state.filterModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-[90%] md:w-[500px]">
            <h2 className="text-lg font-semibold mb-4">Filter Lesson Plans</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Subject</label>
                <select
                  value={state.filterModal.tempConfig.subject}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      filterModal: {
                        ...prev.filterModal,
                        tempConfig: { ...prev.filterModal.tempConfig, subject: e.target.value },
                      },
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by subject"
                >
                  <option value="">All</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English Language">English Language</option>
                  <option value="Basic Science">Basic Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Civic Education">Civic Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={state.filterModal.tempConfig.status}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      filterModal: {
                        ...prev.filterModal,
                        tempConfig: { ...prev.filterModal.tempConfig, status: e.target.value },
                      },
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by status"
                >
                  <option value="PENDING,APPROVED">Pending & Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="">All</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={debouncedApplyFilters}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  aria-label="Apply filters"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  aria-label="Clear filters"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      filterModal: { ...prev.filterModal, isOpen: false },
                    }))
                  }
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  aria-label="Close filter modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ReviewLessonPlanModal
        isOpen={state.reviewModal.isOpen}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            reviewModal: { isOpen: false, lessonPlanId: null },
          }))
        }
        onSubmit={handleReviewLessonPlan}
        lessonPlanId={state.reviewModal.lessonPlanId || ""}
      />
      <ViewReviewModal
        isOpen={state.viewReviewModal.isOpen}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            viewReviewModal: { isOpen: false, status: null },
          }))
        }
        status={state.viewReviewModal.status}
      />
      <ScheduleObservationModal
        isOpen={state.scheduleModal.isOpen}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            scheduleModal: { ...prev.scheduleModal, isOpen: false, isApproval: false },
          }))
        }
        onSubmit={state.scheduleModal.isApproval ? confirmScheduleAndApprove : scheduleObservationHandler}
        lessonPlanId={state.scheduleModal.lessonPlanId}
        traineeId={state.scheduleModal.traineeId}
        date={state.scheduleModal.date}
        startTime={state.scheduleModal.startTime}
        endTime={state.scheduleModal.endTime}
        lessonPlanTitle={state.scheduleModal.lessonPlanTitle}
        traineeName={state.scheduleModal.traineeName}
        isApproval={state.scheduleModal.isApproval}
      />
      <SubmitFeedbackModal
        isOpen={state.feedbackModal.isOpen}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            feedbackModal: { isOpen: false, observationId: null },
          }))
        }
        onSubmit={submitFeedback}
        observationId={state.feedbackModal.observationId || ""}
      />
    </div>
  );
};

export default SupervisorLessonPlanPage;









































