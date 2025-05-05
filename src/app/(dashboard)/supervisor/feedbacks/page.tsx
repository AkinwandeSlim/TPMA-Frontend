"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

const SupervisorFeedbackPage = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<State>({
    feedback: [],
    totalFeedback: 0,
    totalFeedbackPages: 1,
    currentFeedbackPage: 1,
    isFetching: false,
    loading: true,
    error: null,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [tempFilterConfig, setTempFilterConfig] = useState<{
    traineeName: string;
    lessonPlanTitle: string;
  }>({ traineeName: "", lessonPlanTitle: "" });
  const [tempSortConfig, setTempSortConfig] = useState<{
    field: string | null;
    direction: "asc" | "desc";
  }>({ field: "created_at", direction: "desc" });
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
    filterConfig,
    updateFilter,
  } = useTableSearch<ObservationFeedback>({
    data: state.feedback,
    searchableFields: [
      (f) => f.lessonPlanTitle || "",
      (f) => f.traineeName || "",
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
    if (cookieToken) return cookieToken;
    return localStorage.getItem("token") || null;
  }, []);

  // Debounced search query setter
  const debouncedSetSearchQuery = useCallback(debounce((query: string) => {
      console.log("SupervisorFeedbackPage - Debounced setSearchQuery:", {
        query,
        authLoading,
        currentSearchQuery: searchQuery,
      });
      if (authLoading) {
        console.log("SupervisorFeedbackPage - Skipping setSearchQuery: auth still loading");
        return;
      }
      if (query === searchQuery) {
        console.log("SupervisorFeedbackPage - Skipping setSearchQuery: query unchanged");
        return;
      }
      setSearchQuery(query);
    }, 1000),
    [setSearchQuery, authLoading, searchQuery]
  );

  // Debounced fetch feedback with cleanup
  const debouncedFetchFeedback = useCallback(debounce(async (page: number, resetPage = false) => {
      console.log("SupervisorFeedbackPage - Fetching feedback for page:", page, "resetPage:", resetPage);
      if (state.isFetching) {
        console.log("SupervisorFeedbackPage - Skipping fetch: already fetching");
        return;
      }
      if (!user || !user.identifier) {
        console.log("SupervisorFeedbackPage - Skipping fetch: user or user.identifier not available");
        setState((prev) => ({
          ...prev,
          error: "User information not available. Please sign in.",
          loading: false,
          isFetching: false,
        }));
        router.push("/auth/signin");
        return;
      }
      setState((prev) => ({ ...prev, isFetching: true, loading: true }));
      try {
        const pageToFetch = resetPage ? 1 : page;
        console.log("SupervisorFeedbackPage - Fetching feedback with params:", {
          userId: user.identifier,
          role: "supervisor",
          page: pageToFetch,
          search: searchQuery || undefined,
          traineeName: filterConfig.traineeName,
          lessonPlanTitle: filterConfig.lessonPlanTitle,
        });

        const feedbackData = await getObservationFeedback(
          user.identifier,
          pageToFetch,
          undefined, // lessonPlanId (not used)
          searchQuery || undefined,
          "supervisor"
        );

        console.log("SupervisorFeedbackPage - Backend response:", feedbackData);

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
        toast.success("Feedback loaded successfully.");
      } catch (err: any) {
        console.error("SupervisorFeedbackPage - Error fetching feedback:", {
          message: err.message,
          status: err.response?.status,
          response: err.response?.data,
        });
        let message = "Failed to fetch feedback. Please try again.";
        if (err.response?.status === 400) {
          message = err.response?.data?.error || "Invalid request: Check user ID or role.";
        } else if (err.response?.status === 401) {
          message = "Session expired. Please sign in again.";
          router.push("/auth/signin");
        } else if (err.response?.status === 403) {
          message = "Unauthorized: You lack permission to view feedback.";
          router.push("/auth/signin");
        } else if (err.response?.status === 404) {
          message = "No feedback found for your trainees.";
        }
        toast.error(message);
        setState((prev) => ({
          ...prev,
          isFetching: false,
          loading: false,
          error: message,
        }));
      }
    }, 1000),
    [user, authLoading, router, searchQuery, filterConfig.traineeName, filterConfig.lessonPlanTitle]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetchFeedback.cancel();
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedFetchFeedback, debouncedSetSearchQuery]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      console.log("SupervisorFeedbackPage - handlePageChange called:", newPage);
      if (
        newPage < 1 ||
        newPage > state.totalFeedbackPages ||
        newPage === state.currentFeedbackPage
      ) {
        return;
      }
      setState((prev) => ({ ...prev, currentFeedbackPage: newPage }));
      debouncedFetchFeedback(newPage);
    },
    [state.totalFeedbackPages, state.currentFeedbackPage, debouncedFetchFeedback]
  );

  // Initial fetch and auth check
  useEffect(() => {
    console.log("SupervisorFeedbackPage - Auth useEffect running", {
      authLoading,
      user,
      authError,
      initialFetchDone,
    });

    const token = getToken();
    console.log("SupervisorFeedbackPage - Token check:", { token: token ? "present" : "missing" });

    if (!token) {
      console.log("SupervisorFeedbackPage - No token found, redirecting to signin");
      setState((prev) => ({
        ...prev,
        error: "No authentication token found. Please sign in.",
        loading: false,
      }));
      router.push("/auth/signin");
      return;
    }

    if (authLoading) {
      console.log("SupervisorFeedbackPage - Auth loading, waiting...");
      setState((prev) => ({ ...prev, loading: true }));
      return;
    }

    if (authError) {
      console.log("SupervisorFeedbackPage - Auth error detected:", authError);
      setState((prev) => ({ ...prev, error: authError, loading: false }));
      router.push("/auth/signin");
      return;
    }

    if (!user || user.role.toLowerCase() !== "supervisor" || !user.identifier) {
      console.error("SupervisorFeedbackPage - Invalid user or role:", { user });
      setState((prev) => ({
        ...prev,
        error: "Please sign in as a supervisor to view feedback.",
        loading: false,
      }));
      toast.error("Access restricted to supervisors.");
      router.push("/auth/signin");
      return;
    }

    if (!initialFetchDone) {
      console.log("SupervisorFeedbackPage - Performing initial fetch");
      debouncedFetchFeedback(1, true);
      setInitialFetchDone(true);
    }
  }, [authLoading, authError, user, router, debouncedFetchFeedback, getToken, initialFetchDone]);

  // Search and filter effect
  useEffect(() => {
    console.log("SupervisorFeedbackPage - Search/Filter useEffect running", {
      searchQuery,
      traineeName: filterConfig.traineeName,
      lessonPlanTitle: filterConfig.lessonPlanTitle,
      initialFetchDone,
    });
    if (
      initialFetchDone &&
      user &&
      user.identifier &&
      (searchQuery || filterConfig.traineeName !== "" || filterConfig.lessonPlanTitle !== "")
    ) {
      debouncedFetchFeedback(1, true);
    }
  }, [searchQuery, filterConfig.traineeName, filterConfig.lessonPlanTitle, initialFetchDone, user, debouncedFetchFeedback]);

  const applyFilters = useCallback(() => {
    console.log("SupervisorFeedbackPage - Applying filters:", tempFilterConfig);
    updateFilter("traineeName", tempFilterConfig.traineeName);
    updateFilter("lessonPlanTitle", tempFilterConfig.lessonPlanTitle);
    setShowFilterModal(false);
  }, [tempFilterConfig, updateFilter]);

  const clearFilters = useCallback(() => {
    console.log("SupervisorFeedbackPage - Clearing filters");
    setTempFilterConfig({ traineeName: "", lessonPlanTitle: "" });
    updateFilter("traineeName", "");
    updateFilter("lessonPlanTitle", "");
    setShowFilterModal(false);
  }, [updateFilter]);

  const applySort = useCallback(() => {
    console.log("SupervisorFeedbackPage - Applying sort:", tempSortConfig);
    if (tempSortConfig.field && tempSortConfig.field !== sortConfig.field) {
      toggleSort(tempSortConfig.field);
    }
    if (
      tempSortConfig.field === sortConfig.field &&
      tempSortConfig.direction !== sortConfig.direction
    ) {
      toggleSort(tempSortConfig.field); // Toggle to match desired direction
    }
    setShowSortModal(false);
  }, [tempSortConfig, toggleSort, sortConfig]);

  const clearSort = useCallback(() => {
    console.log("SupervisorFeedbackPage - Clearing sort");
    setTempSortConfig({ field: "created_at", direction: "desc" });
    if (sortConfig.field !== "created_at" || sortConfig.direction !== "desc") {
      toggleSort("created_at"); // Reset to default sort
    }
    setShowSortModal(false);
  }, [toggleSort, sortConfig]);

  const feedbackColumns = useMemo(
    () => [
      { header: "Lesson Plan", accessor: "lessonPlanTitle", sortable: true, field: "lessonPlanTitle" },
      { header: "Trainee", accessor: "traineeName", sortable: true, field: "traineeName" },
      { header: "Score", accessor: "score", sortable: true, field: "score" },
      { header: "Comments", accessor: "comments", sortable: false },
      { header: "Submitted On", accessor: "created_at", sortable: true, field: "created_at" },
    ],
    []
  );

  const sortableFields = useMemo(
    () => feedbackColumns.filter((col) => col.sortable).map((col) => ({
      label: col.header,
      value: col.field || col.accessor,
    })),
    [feedbackColumns]
  );

  const renderFeedbackRow = useCallback((item: ObservationFeedback) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-100"
      >
        <td className="p-4">{item.lessonPlanTitle || "N/A"}</td>
        <td>{item.traineeName || "N/A"}</td>
        <td>{item.score !== null && item.score !== undefined ? `${item.score}/10` : "N/A"}</td>
        <td className="max-w-xs truncate">{item.comments || "No comments"}</td>
        {/*<td>{format(new Date(item.created_at), "MMM d, yyyy")}</td>*/}
   
       <td>{item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "N/A"}</td>

      </tr>
    );
  }, []);

  if (state.error || authError) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 max-w-7xl mx-auto">
        {state.error || authError}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-[#5244F3] text-white rounded-md hover:bg-[#3b2db5] transition-colors"
            aria-label="Sign in"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setState((prev) => ({ ...prev, error: null, loading: true }));
              debouncedFetchFeedback(1, true);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            aria-label="Retry loading feedback"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (state.loading || authLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-full max-w-7xl mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-4">
        <h1 className="text-lg font-semibold">Feedback Sent to Trainees</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Lesson Plan, Trainee, Comments..."
            onSearch={debouncedSetSearchQuery}
            ariaLabel="Search feedback"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                console.log("SupervisorFeedbackPage - Opening filter modal");
                setTempFilterConfig({
                  traineeName: filterConfig.traineeName || "",
                  lessonPlanTitle: filterConfig.lessonPlanTitle || "",
                });
                setShowFilterModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
              aria-label="Filter feedback"
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button
              onClick={() => {
                console.log("SupervisorFeedbackPage - Opening sort modal");
                setTempSortConfig({
                  field: sortConfig.field || "created_at",
                  direction: sortConfig.direction || "desc",
                });
                setShowSortModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
              aria-label="Sort feedback"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {state.feedback.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">No feedback sent to trainees yet.</p>
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
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-[90%] md:w-[500px]">
            <h2 className="text-lg font-semibold mb-4">Filter Feedback</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Trainee Name</label>
                <input
                  value={tempFilterConfig.traineeName}
                  onChange={(e) =>
                    setTempFilterConfig({ ...tempFilterConfig, traineeName: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by trainee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Lesson Plan Title</label>
                <input
                  value={tempFilterConfig.lessonPlanTitle}
                  onChange={(e) =>
                    setTempFilterConfig({ ...tempFilterConfig, lessonPlanTitle: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by lesson plan title"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
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
                  onClick={() => {
                    console.log("SupervisorFeedbackPage - Closing filter modal");
                    setShowFilterModal(false);
                  }}
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
      {showSortModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-[90%] md:w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Sort Feedback</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Sort By</label>
                <select
                  value={tempSortConfig.field || ""}
                  onChange={(e) =>
                    setTempSortConfig({ ...tempSortConfig, field: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Select sort field"
                >
                  <option value="" disabled>
                    Select field
                  </option>
                  {sortableFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Sort Direction</label>
                <select
                  value={tempSortConfig.direction}
                  onChange={(e) =>
                    setTempSortConfig({
                      ...tempSortConfig,
                      direction: e.target.value as "asc" | "desc",
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Select sort direction"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applySort}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  aria-label="Apply sort"
                >
                  Apply
                </button>
                <button
                  onClick={clearSort}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  aria-label="Clear sort"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    console.log("SupervisorFeedbackPage - Closing sort modal");
                    setShowSortModal(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  aria-label="Close sort modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorFeedbackPage;