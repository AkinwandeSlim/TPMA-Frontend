"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { toast } from "react-toastify";
import { verifyToken } from "@/lib/api";
import { formatDate } from "@/lib/utils";

// Type definitions
type Metrics = {
  totalTrainees: number;
  totalSupervisors: number;
  totalLessonPlans: number;
  totalFeedbackSent: number;
};

type Supervisor = {
  id: string;
  name: string;
  traineesSupervised: number;
  lessonPlansReviewed: number;
  observations: number;
  feedbackSent: number;
};

type Trainee = {
  id: string;
  name: string;
  supervisorName: string;
  lessonPlansSubmitted: number;
  lessonPlansApproved: number;
  observations: number;
  feedbackReceived: number;
};

type LessonPlan = {
  id: string;
  title: string;
  traineeName: string;
  supervisorName: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  submittedAt: string;
  feedback?: string | null;
};

type ReportData = {
  metrics: Metrics;
  supervisors: Supervisor[];
  trainees: Trainee[];
  lessonPlans: LessonPlan[];
};

// Mock API call for admin report data
const getAdminReport = async (
  dateRange?: { start: string; end: string },
  query?: string
): Promise<ReportData> => {
  const mockData: ReportData = {
    metrics: {
      totalTrainees: 50,
      totalSupervisors: 10,
      totalLessonPlans: 0, // Will be updated based on filtered lesson plans
      totalFeedbackSent: 150,
    },
    supervisors: [
      {
        id: "s1",
        name: "John Doe",
        traineesSupervised: 5,
        lessonPlansReviewed: 0, // Will be updated
        observations: 10,
        feedbackSent: 15,
      },
      {
        id: "s2",
        name: "Jane Smith",
        traineesSupervised: 4,
        lessonPlansReviewed: 0, // Will be updated
        observations: 8,
        feedbackSent: 12,
      },
      {
        id: "s3",
        name: "Michael Brown",
        traineesSupervised: 6,
        lessonPlansReviewed: 0, // Will be updated
        observations: 12,
        feedbackSent: 18,
      },
    ],
    trainees: [
      {
        id: "t1",
        name: "Jude Trainee",
        supervisorName: "John Doe",
        lessonPlansSubmitted: 0, // Will be updated
        lessonPlansApproved: 0, // Will be updated
        observations: 4,
        feedbackReceived: 5,
      },
      {
        id: "t2",
        name: "Amaka Obi",
        supervisorName: "Jane Smith",
        lessonPlansSubmitted: 0, // Will be updated
        lessonPlansApproved: 0, // Will be updated
        observations: 3,
        feedbackReceived: 4,
      },
      {
        id: "t3",
        name: "Chidi Okeke",
        supervisorName: "Michael Brown",
        lessonPlansSubmitted: 0, // Will be updated
        lessonPlansApproved: 0, // Will be updated
        observations: 5,
        feedbackReceived: 6,
      },
    ],
    lessonPlans: [
      {
        id: "lp-1",
        title: "Algebra Basics",
        traineeName: "Jude Trainee",
        supervisorName: "John Doe",
        status: "APPROVED",
        submittedAt: "2025-04-01T10:00:00Z",
        feedback: "Well-structured plan.",
      },
      {
        id: "lp-2",
        title: "Poetry Analysis",
        traineeName: "Amaka Obi",
        supervisorName: "Jane Smith",
        status: "PENDING",
        submittedAt: "2025-04-02T12:00:00Z",
        feedback: null,
      },
      {
        id: "lp-3",
        title: "Physics Experiment",
        traineeName: "Chidi Okeke",
        supervisorName: "Michael Brown",
        status: "REJECTED",
        submittedAt: "2025-04-03T14:00:00Z",
        feedback: "Needs more detail.",
      },
    ],
  };

  let filteredLessonPlans = mockData.lessonPlans;

  // Apply date range filter
  if (dateRange?.start && dateRange?.end) {
    const startDate = new Date(dateRange.start).getTime();
    const endDate = new Date(dateRange.end).getTime();
    filteredLessonPlans = mockData.lessonPlans.filter((lp) => {
      const submittedAt = new Date(lp.submittedAt).getTime();
      return submittedAt >= startDate && submittedAt <= endDate;
    });
  }

  // Apply query filter
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredLessonPlans = filteredLessonPlans.filter(
      (lp) =>
        lp.title.toLowerCase().includes(lowerQuery) ||
        lp.traineeName.toLowerCase().includes(lowerQuery) ||
        lp.supervisorName.toLowerCase().includes(lowerQuery)
    );
  }

  // Update metrics
  const updatedMetrics: Metrics = {
    ...mockData.metrics,
    totalLessonPlans: filteredLessonPlans.length,
  };

  // Update supervisors
  const updatedSupervisors = mockData.supervisors.map((supervisor) => ({
    ...supervisor,
    lessonPlansReviewed: filteredLessonPlans.filter(
      (lp) => lp.supervisorName === supervisor.name
    ).length,
  }));

  // Update trainees
  const updatedTrainees = mockData.trainees.map((trainee) => ({
    ...trainee,
    lessonPlansSubmitted: filteredLessonPlans.filter(
      (lp) => lp.traineeName === trainee.name
    ).length,
    lessonPlansApproved: filteredLessonPlans.filter(
      (lp) => lp.traineeName === trainee.name && lp.status === "APPROVED"
    ).length,
  }));

  // Return updated data
  return {
    metrics: updatedMetrics,
    supervisors: updatedSupervisors,
    trainees: updatedTrainees,
    lessonPlans: filteredLessonPlans,
  };
};

// Mock export function
const exportAdminReport = async (format: "pdf" | "csv"): Promise<string> => {
  console.log(`Exporting admin report as ${format}`);
  return `/reports/admin-report.${format}`;
};

const getToken = (): string | null => {
  const token =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || localStorage.getItem("token") || null;
  console.log("getToken:", token ? "present" : "missing");
  return token;
};

const AdminReportPage = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredSupervisors, setFilteredSupervisors] = useState<Supervisor[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [filteredLessonPlans, setFilteredLessonPlans] = useState<LessonPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [currentSupervisorPage, setCurrentSupervisorPage] = useState<number>(1);
  const [totalSupervisorPages, setTotalSupervisorPages] = useState<number>(1);
  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState<string>("");
  const [currentTraineePage, setCurrentTraineePage] = useState<number>(1);
  const [totalTraineePages, setTotalTraineePages] = useState<number>(1);
  const [traineeSearchQuery, setTraineeSearchQuery] = useState<string>("");
  const [currentLessonPlanPage, setCurrentLessonPlanPage] = useState<number>(1);
  const [totalLessonPlanPages, setTotalLessonPlanPages] = useState<number>(1);
  const [lessonPlanSearchQuery, setLessonPlanSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>(undefined);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const fetchReportData = useCallback(
    async (
      token: string,
      supervisorPage: number = 1,
      supervisorQuery: string = "",
      traineePage: number = 1,
      traineeQuery: string = "",
      lessonPlanPage: number = 1,
      lessonPlanQuery: string = "",
      dateRange?: { start: string; end: string },
      isRetry: boolean = false
    ) => {
      console.log(
        `fetchReportData called: supervisorPage=${supervisorPage}, supervisorQuery=${supervisorQuery}, traineePage=${traineePage}, traineeQuery=${traineeQuery}, lessonPlanPage=${lessonPlanPage}, lessonPlanQuery=${lessonPlanQuery}, dateRange=${JSON.stringify(
          dateRange
        )}, isRetry=${isRetry}, retryCount=${retryCount.current}`
      );
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminReport(dateRange, supervisorQuery || traineeQuery || lessonPlanQuery);
        if (!response) {
          console.error("getAdminReport returned null/undefined");
          if (isRetry && retryCount.current < maxRetries) {
            retryCount.current += 1;
            const delay = Math.pow(2, retryCount.current) * 1000;
            console.log(`Retrying fetchReportData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
            setTimeout(
              () =>
                fetchReportData(
                  token,
                  supervisorPage,
                  supervisorQuery,
                  traineePage,
                  traineeQuery,
                  lessonPlanPage,
                  lessonPlanQuery,
                  dateRange,
                  true
                ),
              delay
            );
            return;
          }
          setError("Failed to fetch report data.");
          return;
        }

        setReportData(response);

        // Supervisors
        const supervisors = Array.isArray(response.supervisors) ? response.supervisors : [];
        const filteredSupervisors = supervisorQuery
          ? supervisors.filter((s) => s.name.toLowerCase().includes(supervisorQuery.toLowerCase()))
          : supervisors;
        const itemsPerPage = 10;
        const supervisorStart = (supervisorPage - 1) * itemsPerPage;
        const supervisorEnd = supervisorStart + itemsPerPage;
        setFilteredSupervisors(filteredSupervisors.slice(supervisorStart, supervisorEnd));
        setTotalSupervisorPages(Math.max(1, Math.ceil(filteredSupervisors.length / itemsPerPage)));

        // Trainees
        const trainees = Array.isArray(response.trainees) ? response.trainees : [];
        const filteredTrainees = traineeQuery
          ? trainees.filter((t) => t.name.toLowerCase().includes(traineeQuery.toLowerCase()))
          : trainees;
        const traineeStart = (traineePage - 1) * itemsPerPage;
        const traineeEnd = traineeStart + itemsPerPage;
        setFilteredTrainees(filteredTrainees.slice(traineeStart, traineeEnd));
        setTotalTraineePages(Math.max(1, Math.ceil(filteredTrainees.length / itemsPerPage)));

        // Lesson Plans
        const lessonPlans = Array.isArray(response.lessonPlans) ? response.lessonPlans : [];
        const filteredLessonPlans = lessonPlanQuery
          ? lessonPlans.filter(
              (lp) =>
                lp.title.toLowerCase().includes(lessonPlanQuery.toLowerCase()) ||
                lp.traineeName.toLowerCase().includes(lessonPlanQuery.toLowerCase()) ||
                lp.supervisorName.toLowerCase().includes(lessonPlanQuery.toLowerCase())
            )
          : lessonPlans;
        const lessonPlanStart = (lessonPlanPage - 1) * itemsPerPage;
        const lessonPlanEnd = lessonPlanStart + itemsPerPage;
        setFilteredLessonPlans(filteredLessonPlans.slice(lessonPlanStart, lessonPlanEnd));
        setTotalLessonPlanPages(Math.max(1, Math.ceil(filteredLessonPlans.length / itemsPerPage)));

        retryCount.current = 0;
      } catch (err: any) {
        console.error("Error fetching report data:", err.message, err.stack);
        if (isRetry && retryCount.current < maxRetries) {
          retryCount.current += 1;
          const delay = Math.pow(2, retryCount.current) * 1000;
          console.log(`Retrying fetchReportData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
          setTimeout(
            () =>
              fetchReportData(
                token,
                supervisorPage,
                supervisorQuery,
                traineePage,
                traineeQuery,
                lessonPlanPage,
                lessonPlanQuery,
                dateRange,
                true
              ),
            delay
          );
          return;
        }
        const errorMessage = err.message || "Failed to fetch report data. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage, { toastId: "fetch-report-error" });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSupervisorPageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalSupervisorPages || newPage === currentSupervisorPage) return;
      setCurrentSupervisorPage(newPage);
      const token = getToken();
      if (token) {
        fetchReportData(
          token,
          newPage,
          supervisorSearchQuery,
          currentTraineePage,
          traineeSearchQuery,
          currentLessonPlanPage,
          lessonPlanSearchQuery,
          dateRange
        );
      } else {
        setError("Authentication token missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [
      totalSupervisorPages,
      currentSupervisorPage,
      supervisorSearchQuery,
      currentTraineePage,
      traineeSearchQuery,
      currentLessonPlanPage,
      lessonPlanSearchQuery,
      dateRange,
      fetchReportData,
      router,
    ]
  );

  const handleTraineePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalTraineePages || newPage === currentTraineePage) return;
      setCurrentTraineePage(newPage);
      const token = getToken();
      if (token) {
        fetchReportData(
          token,
          currentSupervisorPage,
          supervisorSearchQuery,
          newPage,
          traineeSearchQuery,
          currentLessonPlanPage,
          lessonPlanSearchQuery,
          dateRange
        );
      } else {
        setError("Authentication token missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [
      totalTraineePages,
      currentTraineePage,
      currentSupervisorPage,
      supervisorSearchQuery,
      traineeSearchQuery,
      currentLessonPlanPage,
      lessonPlanSearchQuery,
      dateRange,
      fetchReportData,
      router,
    ]
  );

  const handleLessonPlanPageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalLessonPlanPages || newPage === currentLessonPlanPage) return;
      setCurrentLessonPlanPage(newPage);
      const token = getToken();
      if (token) {
        fetchReportData(
          token,
          currentSupervisorPage,
          supervisorSearchQuery,
          currentTraineePage,
          traineeSearchQuery,
          newPage,
          lessonPlanSearchQuery,
          dateRange
        );
      } else {
        setError("Authentication token missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [
      totalLessonPlanPages,
      currentLessonPlanPage,
      currentSupervisorPage,
      supervisorSearchQuery,
      currentTraineePage,
      traineeSearchQuery,
      lessonPlanSearchQuery,
      dateRange,
      fetchReportData,
      router,
    ]
  );

  const handleSupervisorSearchSubmit = useCallback(
    (query: string) => {
      if (query === supervisorSearchQuery) return;
      setSupervisorSearchQuery(query);
      setCurrentSupervisorPage(1);
      const token = getToken();
      if (token) {
        fetchReportData(
          token,
          1,
          query,
          currentTraineePage,
          traineeSearchQuery,
          currentLessonPlanPage,
          lessonPlanSearchQuery,
          dateRange
        );
      } else {
        setError("Authentication token missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [
      supervisorSearchQuery,
      currentTraineePage,
      traineeSearchQuery,
      currentLessonPlanPage,
      lessonPlanSearchQuery,
      dateRange,
      fetchReportData,
      router,
    ]
  );

  const handleTraineeSearchSubmit = useCallback(
    (query: string) => {
      if (query === traineeSearchQuery) return;
      setTraineeSearchQuery(query);
      setCurrentTraineePage(1);
      const token = getToken();
      if (token) {
        fetchReportData(
          token,
          currentSupervisorPage,
          supervisorSearchQuery,
          1,
          query,
          currentLessonPlanPage,
          lessonPlanSearchQuery,
          dateRange
        );
      } else {
        setError("Authentication token missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [
      traineeSearchQuery,
      currentSupervisorPage,
      supervisorSearchQuery,
      currentLessonPlanPage,
      lessonPlanSearchQuery,
      dateRange,
      fetchReportData,
      router,
    ]
  );

  const handleLessonPlanSearchSubmit = useCallback(
    (query: string) => {
      if (query === lessonPlanSearchQuery) return;
      setLessonPlanSearchQuery(query);
      setCurrentLessonPlanPage(1);
      const token = getToken();
      if (token) {
        fetchReportData(
          token,
          currentSupervisorPage,
          supervisorSearchQuery,
          currentTraineePage,
          traineeSearchQuery,
          1,
          query,
          dateRange
        );
      } else {
        setError("Authentication token missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [
      lessonPlanSearchQuery,
      currentSupervisorPage,
      supervisorSearchQuery,
      currentTraineePage,
      traineeSearchQuery,
      dateRange,
      fetchReportData,
      router,
    ]
  );

  const handleDateRangeChange = (start: string, end: string) => {
    if (start && end) {
      setDateRange({ start, end });
    } else {
      setDateRange(undefined);
    }
    setCurrentSupervisorPage(1);
    setCurrentTraineePage(1);
    setCurrentLessonPlanPage(1);
    const token = getToken();
    if (token) {
      fetchReportData(
        token,
        1,
        supervisorSearchQuery,
        1,
        traineeSearchQuery,
        1,
        lessonPlanSearchQuery,
        start && end ? { start, end } : undefined
      );
    } else {
      setError("Authentication token missing. Please sign in.");
      router.push("/auth/signin");
    }
  };

  const handleExport = async (format: "pdf" | "csv") => {
    try {
      const url = await exportAdminReport(format);
      window.open(url, "_blank");
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      console.error("Error exporting report:", err);
      toast.error("Failed to export report.");
    }
  };

  useEffect(() => {
    const verifyAndFetch = async () => {
      try {
        setVerifying(true);
        setError(null);

        const token = getToken();
        if (!token) {
          setError("Please sign in to view this page.");
          router.push("/auth/signin");
          return;
        }

        const response = await verifyToken();
        if (response.role !== "admin") {
          setError("You are not authorized to access this page.");
          router.push(
            response.role === "teacherTrainee"
              ? "/trainees/profile"
              : response.role === "supervisor"
              ? "/supervisors/profile"
              : "/dashboard"
          );
          return;
        }

        await fetchReportData(
          token,
          currentSupervisorPage,
          supervisorSearchQuery,
          currentTraineePage,
          traineeSearchQuery,
          currentLessonPlanPage,
          lessonPlanSearchQuery,
          dateRange
        );
      } catch (err: any) {
        const errorMessage =
          err.message === "Invalid or expired token"
            ? "Your session has expired. Please log in again."
            : "Failed to verify session. Please sign in.";
        setError(errorMessage);
        toast.error(errorMessage, { toastId: "verify-error" });
        router.push("/auth/signin");
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [
    router,
    fetchReportData,
    currentSupervisorPage,
    supervisorSearchQuery,
    currentTraineePage,
    traineeSearchQuery,
    currentLessonPlanPage,
    lessonPlanSearchQuery,
    dateRange,
  ]);

  if (verifying || loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="p-4 text-red-500 flex flex-col items-center">
        <p>{error || "Failed to load report data."}</p>
        <div className="mt-4 flex gap-4">
          {error?.includes("sign in") ? (
            <button
              onClick={() => router.push("/auth/signin")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() =>
                fetchReportData(
                  getToken()!,
                  currentSupervisorPage,
                  supervisorSearchQuery,
                  currentTraineePage,
                  traineeSearchQuery,
                  currentLessonPlanPage,
                  lessonPlanSearchQuery,
                  dateRange
                )
              }
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <h1 className="text-xl font-semibold">Admin Report</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide performance overview</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-md shadow-md flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="flex gap-2 mt-1">
            <input
              type="date"
              className="p-2 border rounded-md w-full"
              value={dateRange?.start || ""}
              onChange={(e) => handleDateRangeChange(e.target.value, dateRange?.end || "")}
            />
            <input
              type="date"
              className="p-2 border rounded-md w-full"
              value={dateRange?.end || ""}
              onChange={(e) => handleDateRangeChange(dateRange?.start || "", e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-end">
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("pdf")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Export PDF
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image
            src="/singleAttendance.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6"
            style={{ width: "auto", height: "auto" }}
          />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalTrainees}</h1>
            <span className="text-sm text-gray-400">Total Trainees</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image
            src="/singleClass.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6"
            style={{ width: "auto", height: "auto" }}
          />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalSupervisors}</h1>
            <span className="text-sm text-gray-400">Total Supervisors</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image
            src="/singleLesson.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6"
            style={{ width: "auto", height: "auto" }}
          />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalLessonPlans}</h1>
            <span className="text-sm text-gray-400">Total Lesson Plans</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image
            src="/singleBranch.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6"
            style={{ width: "auto", height: "auto" }}
          />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalFeedbackSent}</h1>
            <span className="text-sm text-gray-400">Total Feedback Sent</span>
          </div>
        </div>
      </div>

      {/* SUPERVISORS SECTION */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Supervisor Performance</h2>
          <TableSearch
            placeholder="Search supervisors..."
            onSearch={handleSupervisorSearchSubmit}
            value={supervisorSearchQuery}
            ariaLabel="Search supervisors"
          />
        </div>
        {filteredSupervisors.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image
              src="/stockout.png"
              alt="No supervisors"
              width={120}
              height={120}
              className="mx-auto mb-4"
              style={{ width: "auto", height: "auto" }}
            />
            <p className="text-gray-500 text-lg">No supervisors found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Supervisor
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Trainees Supervised
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Lesson Plans Reviewed
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Observations
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Feedback Sent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupervisors.map((supervisor) => (
                    <tr key={supervisor.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{supervisor.name}</td>
                      <td className="px-6 py-4">{supervisor.traineesSupervised}</td>
                      <td className="px-6 py-4">{supervisor.lessonPlansReviewed}</td>
                      <td className="px-6 py-4">{supervisor.observations}</td>
                      <td className="px-6 py-4">{supervisor.feedbackSent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentSupervisorPage}
              count={filteredSupervisors.length}
              onPageChange={handleSupervisorPageChange}
            />
          </>
        )}
      </div>

      {/* TRAINEES SECTION */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Trainee Performance</h2>
          <TableSearch
            placeholder="Search trainees..."
            onSearch={handleTraineeSearchSubmit}
            value={traineeSearchQuery}
            ariaLabel="Search trainees"
          />
        </div>
        {filteredTrainees.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image
              src="/stockout.png"
              alt="No trainees"
              width={120}
              height={120}
              className="mx-auto mb-4"
              style={{ width: "auto", height: "auto" }}
            />
            <p className="text-gray-500 text-lg">No trainees found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Trainee
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Supervisor
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Lesson Plans Submitted
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Lesson Plans Approved
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Observations
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Feedback Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainees.map((trainee) => (
                    <tr key={trainee.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{trainee.name}</td>
                      <td className="px-6 py-4">{trainee.supervisorName}</td>
                      <td className="px-6 py-4">{trainee.lessonPlansSubmitted}</td>
                      <td className="px-6 py-4">{trainee.lessonPlansApproved}</td>
                      <td className="px-6 py-4">{trainee.observations}</td>
                      <td className="px-6 py-4">{trainee.feedbackReceived}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentTraineePage}
              count={filteredTrainees.length}
              onPageChange={handleTraineePageChange}
            />
          </>
        )}
      </div>

      {/* LESSON PLANS SECTION */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Lesson Plan Summary</h2>
          <TableSearch
            placeholder="Search lesson plans..."
            onSearch={handleLessonPlanSearchSubmit}
            value={lessonPlanSearchQuery}
            ariaLabel="Search lesson plans"
          />
        </div>
        {filteredLessonPlans.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image
              src="/stockout.png"
              alt="No lesson plans"
              width={120}
              height={120}
              className="mx-auto mb-4"
              style={{ width: "auto", height: "auto" }}
            />
            <p className="text-gray-500 text-lg">No lesson plans found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Trainee
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Supervisor
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Submitted At
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Feedback
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLessonPlans.map((lp) => (
                    <tr key={lp.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{lp.title}</td>
                      <td className="px-6 py-4">{lp.traineeName}</td>
                      <td className="px-6 py-4">{lp.supervisorName}</td>
                      <td className="px-6 py-4">{lp.status}</td>
                      <td className="px-6 py-4">{formatDate(lp.submittedAt)}</td>
                      <td className="px-6 py-4">{lp.feedback || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentLessonPlanPage}
              count={filteredLessonPlans.length}
              onPageChange={handleLessonPlanPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReportPage;