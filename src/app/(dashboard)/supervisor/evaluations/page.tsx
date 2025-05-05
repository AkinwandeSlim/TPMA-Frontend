"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { useTableSearch } from "@/hooks/useTableSearch";
import { useAuth } from "@/lib/useAuth";
import Image from "next/image";
import { format } from "date-fns";
import { getObservationFeedback, getStudentEvaluations, getSupervisorStudentEvaluations } from "@/lib/api";

// Mock data for client testing (aligned with SupervisorObservationPage)
const mockFeedback = [
  {
    id: "ofb1",
    lesson_plan_id: "lp1",
    traineeId: "t1",
    supervisorId: "sup1",
    score: 8,
    comments: "Great delivery, improve student engagement",
    created_at: "2025-05-03",
  },
  {
    id: "ofb2",
    lesson_plan_id: "lp3",
    traineeId: "t3",
    supervisorId: "sup1",
    score: 7,
    comments: "Good effort, needs clearer objectives",
    created_at: "2025-05-04",
  },
];

const mockLessonPlans = [
  { id: "lp1", title: "Math Lesson", status: "APPROVED" },
  { id: "lp2", title: "Science Lesson", status: "PENDING" },
  { id: "lp3", title: "English Lesson", status: "REJECTED" },
];

const mockTrainees = [
  { id: "t1", name: "Jude Trainee", surname: "" },
  { id: "t2", name: "Amaka Obi", surname: "" },
  { id: "t3", name: "Chidi Okeke", surname: "" },
];

// Type definitions
type ObservationFeedback = {
  id: string;
  lesson_plan_id: string | null;
  traineeId: string;
  supervisorId: string;
  score: number | null;
  comments: string;
  created_at: string;
};

type State = {
  feedback: ObservationFeedback[];
  totalFeedback: number;
  totalFeedbackPages: number;
  currentFeedbackPage: number;
  isFetching: boolean;
  loading: boolean;
  error: string | null;
};

const StudentEvaluationListPage = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();
  const initialFetchRef = useRef(true);
  const fetchCountRef = useRef(0);
  const authCheckRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  const [state, setState] = useState<State>({
    feedback: [],
    totalFeedback: 0,
    totalFeedbackPages: 1,
    currentFeedbackPage: 1,
    isFetching: false,
    loading: true,
    error: null,
  });

  const {
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
  } = useTableSearch<ObservationFeedback>({
    data: state.feedback,
    searchableFields: [
      (f) => mockLessonPlans.find((lp) => lp.id === f.lesson_plan_id)?.title || "",
      (f) => mockTrainees.find((t) => t.id === f.traineeId)?.name || f.traineeId,
      (f) => f.comments || "",
    ],
    initialSortField: "created_at",
    initialSortDirection: "desc",
    itemsPerPage: 10,
  });

  // Check for token in cookies or localStorage
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    const localStorageToken = localStorage.getItem("token");
    return cookieToken || localStorageToken || null;
  }, []);

  // Debounced search query setter
  const debouncedSetSearchQuery = useCallback(debounce((query: string) => {
      console.log("StudentEvaluationListPage - Debounced setSearchQuery:", { query, authLoading, currentSearchQuery: searchQuery });
      if (authLoading) {
        console.log("StudentEvaluationListPage - Skipping fetchFeedback: auth still loading");
        return;
      }
      if (query === searchQuery) {
        console.log("StudentEvaluationListPage - Skipping fetchFeedback: query unchanged");
        return;
      }
      setSearchQuery(query);
      fetchFeedback(1, true);
    }, 1000),
    [setSearchQuery, authLoading, searchQuery]
  );

  // Fetch feedback from backend
  const fetchFeedback = useCallback(
    async (page: number, resetPage = false) => {
      const now = Date.now();
      console.log("StudentEvaluationListPage - fetchFeedback called:", { page, resetPage, authLoading, user, timeSinceLastFetch: now - lastFetchTimeRef.current });

      if (authLoading) {
        console.log("StudentEvaluationListPage - Skipping fetchFeedback: auth still loading");
        setState((prev) => ({ ...prev, error: "Authentication still loading, please wait." }));
        return;
      }
      if (state.isFetching) {
        console.log("StudentEvaluationListPage - Skipping fetch: already fetching");
        return;
      }
      if (fetchCountRef.current > 10) {
        console.error("StudentEvaluationListPage - Excessive fetch attempts detected, breaking loop");
        setState((prev) => ({
          ...prev,
          error: "Too many fetch attempts. Please refresh the page.",
          isFetching: false,
          loading: false,
        }));
        toast.error("Too many fetch attempts. Please refresh the page.");
        return;
      }
      if (now - lastFetchTimeRef.current < 2000) {
        console.log("StudentEvaluationListPage - Skipping fetchFeedback: too soon since last fetch");
        return;
      }

      fetchCountRef.current += 1;
      console.log("StudentEvaluationListPage - Fetch attempt:", fetchCountRef.current);
      lastFetchTimeRef.current = now;

      if (authError) {
        console.error("StudentEvaluationListPage - Auth error:", authError);
        setState((prev) => ({ ...prev, error: authError }));
        router.push("/auth/signin");
        return;
      }

      const token = getToken();
      if (!token) {
        console.error("StudentEvaluationListPage - No token found");
        setState((prev) => ({ ...prev, error: "No authentication token found. Please sign in." }));
        router.push("/auth/signin");
        return;
      }

      if (!user || !["supervisor", "admin"].includes(user.role.toLowerCase())) {
        console.error("StudentEvaluationListPage - Invalid user or role:", { user });
        setState((prev) => ({ ...prev, error: "Please sign in as a supervisor or admin." }));
        router.push("/auth/signin");
        return;
      }

      setState((prev) => ({ ...prev, isFetching: true, loading: true }));
      try {
        const pageToFetch = resetPage ? 1 : page;
        console.log("StudentEvaluationListPage - Fetching feedback with params:", {
          userId: user.identifier,
          role: user.role,
          page: pageToFetch,
          limit: 10,
          search: searchQuery,
        });

        let feedbackData;
        if (user.role.toLowerCase() === "supervisor") {
          // Fetch supervisor-specific feedback
          feedbackData = await getObservationFeedback(user.identifier, undefined);
        } else {
          // Fetch all evaluations for admin
          feedbackData = await getStudentEvaluations(pageToFetch, searchQuery);
          // Map student evaluations to observation feedback format
          feedbackData = {
            feedback: feedbackData.evaluations.map((evaluation: any) => ({
              id: evaluation.id,
              lesson_plan_id: evaluation.tpAssignmentId, // Assuming tpAssignmentId maps to lesson_plan_id
              traineeId: evaluation.traineeId,
              supervisorId: evaluation.supervisorId,
              score: evaluation.score / 10, // Convert 0-100 to 0-10 scale
              comments: evaluation.comments || "",
              created_at: evaluation.submittedAt || new Date().toISOString(),
            })),
            totalCount: feedbackData.totalCount,
            totalPages: feedbackData.totalPages,
            currentPage: pageToFetch,
          };
        }

        console.log("StudentEvaluationListPage - Backend response:", feedbackData);

        setState((prev) => ({
          ...prev,
          feedback: feedbackData.feedback,
          totalFeedback: feedbackData.totalCount,
          totalFeedbackPages: feedbackData.totalPages,
          currentFeedbackPage: pageToFetch,
          isFetching: false,
          loading: false,
          error: null,
        }));
        fetchCountRef.current = 0;
      } catch (err: any) {
        console.error("StudentEvaluationListPage - Error fetching feedback:", {
          message: err.message,
          stack: err.stack,
          response: err.response?.data,
          status: err.response?.status,
        });
        // Fallback to mock data for client testing
        const itemsPerPage = 10;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedFeedback = mockFeedback.slice(start, end);
        const totalCount = mockFeedback.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

        console.log("StudentEvaluationListPage - Using mock data:", { paginatedFeedback, totalCount, totalPages });

        setState((prev) => ({
          ...prev,
          feedback: paginatedFeedback,
          totalFeedback: totalCount,
          totalFeedbackPages: totalPages,
          currentFeedbackPage: page,
          isFetching: false,
          loading: false,
          error: null, // Clear error to ensure UI renders mock data
        }));
        toast.info("Failed to fetch evaluations from backend, displaying mock data.");
        fetchCountRef.current = 0;
      }
    },
    [state.isFetching, user, authError, authLoading, router, searchQuery, getToken]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      console.log("StudentEvaluationListPage - handlePageChange called:", newPage);
      if (newPage < 1 || newPage > state.totalFeedbackPages || newPage === state.currentFeedbackPage) {
        return;
      }
      fetchFeedback(newPage);
    },
    [state.totalFeedbackPages, state.currentFeedbackPage, fetchFeedback]
  );

  // Initial fetch and auth check
  useEffect(() => {
    console.log("StudentEvaluationListPage - useEffect running", {
      authLoading,
      user,
      authError,
      initialFetch: initialFetchRef.current,
      authCheck: authCheckRef.current,
      searchQuery,
    });

    if (authLoading) {
      console.log("StudentEvaluationListPage - Auth loading, waiting...");
      return;
    }

    const token = getToken();
    console.log("StudentEvaluationListPage - Token check:", { token: token ? "present" : "missing" });

    if (!token) {
      console.log("StudentEvaluationListPage - No token, redirecting to signin");
      setState((prev) => ({ ...prev, error: "No authentication token found. Please sign in." }));
      router.push("/auth/signin");
      return;
    }

    if (authError) {
      console.log("StudentEvaluationListPage - Auth error detected:", authError);
      setState((prev) => ({ ...prev, error: authError }));
      router.push("/auth/signin");
      return;
    }

    if (!authCheckRef.current) {
      console.log("StudentEvaluationListPage - Performing auth check with delay");
      const timer = setTimeout(() => {
        console.log("StudentEvaluationListPage - Auth check after delay:", { user, authLoading });
        if (!user || !["supervisor", "admin"].includes(user.role.toLowerCase())) {
          console.error("StudentEvaluationListPage - Invalid user or role after delay:", { user });
          setState((prev) => ({ ...prev, error: "Please sign in as a supervisor or admin." }));
          router.push("/auth/signin");
        } else {
          console.log("StudentEvaluationListPage - Auth check passed, user:", { user });
          authCheckRef.current = true;
          if (initialFetchRef.current) {
            console.log("StudentEvaluationListPage - Performing initial fetch");
            fetchFeedback(1, true);
            initialFetchRef.current = false;
          }
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else if (initialFetchRef.current) {
      console.log("StudentEvaluationListPage - Performing initial fetch (post-auth check)");
      fetchFeedback(1, true);
      initialFetchRef.current = false;
    }

    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [searchQuery,authLoading, authError, user, router, fetchFeedback, getToken, debouncedSetSearchQuery]);

  const feedbackColumns = useMemo(
    () => [
      { header: "Trainee", accessor: "traineeId", sortable: true, field: "traineeId" },
      { header: "Lesson Plan", accessor: "lesson_plan_id", sortable: false },
      { header: "Score", accessor: "score", sortable: true, field: "score" },
      { header: "Comments", accessor: "comments", sortable: false },
      { header: "Submitted At", accessor: "created_at", sortable: true, field: "created_at" },
    ],
    []
  );

  const renderFeedbackRow = useCallback(
    (item: ObservationFeedback) => (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="p-4">
          {mockTrainees.find((t) => t.id === item.traineeId)?.name || item.traineeId}
        </td>
        <td>
          {mockLessonPlans.find((lp) => lp.id === item.lesson_plan_id)?.title || "N/A"}
        </td>
        <td>{item.score !== null ? `${item.score}/10` : "N/A"}</td>
        <td>{item.comments || "-"}</td>
        <td>{format(new Date(item.created_at), "MMM d, yyyy")}</td>
      </tr>
    ),
    []
  );

  if (state.error || authError) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-medium">{state.error || authError}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setState((prev) => ({ ...prev, error: null, loading: true }));
              fetchFeedback(1, true);
            }}
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
        <h1 className="text-lg font-semibold">Student Evaluations</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Trainee, Lesson Plan, Comments..."
            onSearch={debouncedSetSearchQuery}
            ariaLabel="Search evaluations"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleSort("created_at")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
              aria-label="Sort evaluations"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {state.feedback.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">No evaluations found.</p>
        </div>
      ) : (
        <>
          <Table
            columns={feedbackColumns.map((col) => ({
              ...col,
              onSort: col.sortable ? () => toggleSort(col.field || col.accessor) : undefined,
            }))}
            renderRow={renderFeedbackRow}
            data={state.feedback}
          />
          <Pagination
            page={state.currentFeedbackPage}
            count={state.totalFeedback}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default StudentEvaluationListPage;



