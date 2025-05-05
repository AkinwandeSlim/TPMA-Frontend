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

import { getObservationFeedback, ObservationFeedback } from "@/lib/api";

// Type definitions
interface State {
  feedback: ObservationFeedback[];
  totalFeedback: number;
  totalFeedbackPages: number;
  currentFeedbackPage: number;
  isFetching: boolean;
  loading: boolean;
  error: string | null;
}

const FeedbackObservationPage = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();
  const initialFetchRef = useRef(true);
  const fetchCountRef = useRef(0);
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
    filteredData,
  } = useTableSearch<ObservationFeedback>({
    data: state.feedback,
    searchableFields: [
      (f) => f.lessonPlanTitle || "",
      (f) => f.traineeName || "",
      (f) => f.supervisorName || "",
      (f) => f.comments || "",
    ],
    initialSortField: "created_at",
    initialSortDirection: "desc",
    itemsPerPage: 10,
  });

  // Check for token in localStorage
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || null;
  }, []);

  // Debounced search query setter
  const debouncedSetSearchQuery = useCallback( debounce((query: string) => {
      console.log("FeedbackObservationPage - Debounced setSearchQuery:", { query, authLoading, currentSearchQuery: searchQuery });
      if (authLoading) {
        console.log("FeedbackObservationPage - Skipping fetchFeedback: auth still loading");
        return;
      }
      if (query === searchQuery) {
        console.log("FeedbackObservationPage - Skipping fetchFeedback: query unchanged");
        return;
      }
      setSearchQuery(query);
      fetchFeedback(1, true);
    }, 1000),
    [setSearchQuery, authLoading, searchQuery]
  );

  // Fetch feedback based on user role
  const fetchFeedback = useCallback(
    async (page: number, resetPage = false) => {
      const now = Date.now();
      console.log("FeedbackObservationPage - fetchFeedback called:", {
        page,
        resetPage,
        authLoading,
        user,
        timeSinceLastFetch: now - lastFetchTimeRef.current,
      });

      if (authLoading) {
        console.log("FeedbackObservationPage - Skipping fetchFeedback: auth still loading");
        setState((prev) => ({ ...prev, error: "Authentication still loading, please wait." }));
        return;
      }
      if (state.isFetching) {
        console.log("FeedbackObservationPage - Skipping fetch: already fetching");
        return;
      }
      if (fetchCountRef.current > 10) {
        console.error("FeedbackObservationPage - Excessive fetch attempts detected, breaking loop");
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
        console.log("FeedbackObservationPage - Skipping fetchFeedback: too soon since last fetch");
        return;
      }

      fetchCountRef.current += 1;
      console.log("FeedbackObservationPage - Fetch attempt:", fetchCountRef.current);
      lastFetchTimeRef.current = now;

      const token = getToken();
      if (!token) {
        console.error("FeedbackObservationPage - No token found");
        setState((prev) => ({ ...prev, error: "No authentication token found. Please sign in." }));
        router.push("/auth/signin");
        return;
      }

      if (!user || !["supervisor", "teacherTrainee"].includes(user.role)) {
        console.error("FeedbackObservationPage - Invalid user or role:", { user });
        setState((prev) => ({ ...prev, error: "Please sign in as a supervisor or teacher trainee." }));
        router.push("/auth/signin");
        return;
      }

      setState((prev) => ({ ...prev, isFetching: true, loading: true }));
      try {
        const pageToFetch = resetPage ? 1 : page;
        console.log("FeedbackObservationPage - Fetching feedback with params:", {
          userId: user.identifier,
          role: user.role,
          page: pageToFetch,
          search: searchQuery || undefined,
        });

        const feedbackData = await getObservationFeedback(
          user.identifier,
          pageToFetch,
          undefined, // lessonPlanId (not used here)
          searchQuery || undefined,
          user.role as "supervisor" | "teacherTrainee" // Type assertion to narrow role
        );

        console.log("FeedbackObservationPage - Backend response:", feedbackData);

        setState((prev) => ({
          ...prev,
          feedback: feedbackData.feedback || [],
          totalFeedback: feedbackData.totalCount || 0,
          totalFeedbackPages: feedbackData.totalPages || 1,
          currentFeedbackPage: pageToFetch,
          isFetching: false,
          loading: false,
          error: null,
        }));
        fetchCountRef.current = 0;
        toast.success("Feedback loaded successfully.");
      } catch (err: any) {
        console.error("FeedbackObservationPage - Error fetching feedback:", {
          message: err.message,
          stack: err.stack,
        });
        setState((prev) => ({
          ...prev,
          isFetching: false,
          loading: false,
          error: err.message || "Failed to fetch feedback",
        }));
        toast.error(err.message || "Failed to fetch feedback");
        fetchCountRef.current = 0;
      }
    },
    [user,state.isFetching, authLoading, router, searchQuery, getToken]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      console.log("FeedbackObservationPage - handlePageChange called:", newPage);
      if (newPage < 1 || newPage > state.totalFeedbackPages || newPage === state.currentFeedbackPage) {
        return;
      }
      fetchFeedback(newPage);
    },
    [state.totalFeedbackPages, state.currentFeedbackPage, fetchFeedback]
  );

  // Initial fetch
  useEffect(() => {
    console.log("FeedbackObservationPage - useEffect running", {
      authLoading,
      user,
      authError,
      initialFetch: initialFetchRef.current,
    });

    if (authLoading) {
      console.log("FeedbackObservationPage - Auth loading, waiting...");
      return;
    }

    const token = getToken();
    console.log("FeedbackObservationPage - Token check:", { token: token ? "present" : "missing" });

    if (!token) {
      console.log("FeedbackObservationPage - No token, redirecting to signin");
      setState((prev) => ({ ...prev, error: "No authentication token found. Please sign in." }));
      router.push("/auth/signin");
      return;
    }

    if (authError) {
      console.log("FeedbackObservationPage - Auth error detected:", authError);
      setState((prev) => ({ ...prev, error: authError }));
      router.push("/auth/signin");
      return;
    }

    if (!user || !["supervisor", "teacherTrainee"].includes(user.role)) {
      console.error("FeedbackObservationPage - Invalid user or role:", { user });
      setState((prev) => ({ ...prev, error: "Please sign in as a supervisor or teacher trainee." }));
      router.push("/auth/signin");
      return;
    }

    if (initialFetchRef.current) {
      console.log("FeedbackObservationPage - Performing initial fetch");
      fetchFeedback(1, true);
      initialFetchRef.current = false;
    }

    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [authLoading, authError, user, router, fetchFeedback, getToken, debouncedSetSearchQuery]);

  const feedbackColumns = useMemo(() => {
    const isSupervisor = user?.role === "supervisor";
    return [
      { header: "Lesson Plan", accessor: "lessonPlanTitle", sortable: true, field: "lessonPlanTitle" },
      {
        header: isSupervisor ? "Trainee" : "Supervisor",
        accessor: isSupervisor ? "traineeName" : "supervisorName",
        sortable: true,
        field: isSupervisor ? "traineeName" : "supervisorName",
      },
      { header: "Score", accessor: "score", sortable: true, field: "score" },
      { header: "Comments", accessor: "comments", sortable: false },
      { header: "Submitted On", accessor: "created_at", sortable: true, field: "created_at" },
    ];
  }, [user]);

  const renderFeedbackRow = useCallback(
    (item: ObservationFeedback) => {
      const isSupervisor = user?.role === "supervisor";
      return (
        <tr
          key={item.id}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-100"
        >
          <td className="p-4">{item.lessonPlanTitle || "N/A"}</td>
          <td>{isSupervisor ? item.traineeName || "N/A" : item.supervisorName || "N/A"}</td>
          <td>{item.score !== null && item.score !== undefined ? `${item.score}/10` : "N/A"}</td>
          <td>{item.comments}</td>
          {/*<td>{format(new Date(item.created_at), "MMM d, yyyy")}</td>*/}
          <td>{item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "N/A"}</td>

        </tr>
      );
    },
    [user]
  );

  if (state.error || authError) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg max-w-7xl mx-auto">
        <p className="font-medium">{state.error || authError}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
            aria-label="Sign in"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setState((prev) => ({ ...prev, error: null, loading: true }));
              fetchFeedback(1, true);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            aria-label="Retry loading feedback"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full max-w-7xl mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  const isSupervisor = user?.role === "supervisor";

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-4">
        <h1 className="text-lg font-semibold">
          {isSupervisor ? "Feedback You’ve Submitted" : "Feedback Received"}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Lesson Plan, Trainee, Supervisor, Comments..."
            onSearch={debouncedSetSearchQuery}
            ariaLabel="Search feedback"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleSort("created_at")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
              aria-label="Sort feedback by date"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {filteredData.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">
            {isSupervisor ? "No feedback submitted yet." : "No feedback received yet."}
          </p>
        </div>
      ) : (
        <>
          <Table
            columns={feedbackColumns.map((col) => ({
              ...col,
              onSort: col.sortable ? () => toggleSort(col.field || col.accessor) : undefined,
            }))}
            renderRow={renderFeedbackRow}
            data={filteredData}
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

export default FeedbackObservationPage;