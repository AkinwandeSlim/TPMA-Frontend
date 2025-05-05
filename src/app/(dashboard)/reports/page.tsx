"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { toast } from "react-toastify";
import { verifyToken } from "@/lib/api";
import { formatDate } from "@/lib/utils";

// Hypothetical API call for admin reports (replace with actual implementation)
const getAdminReport = async (
  dateRange?: { start: string; end: string },
  query?: string
) => {
  // Mock response for demonstration
  return {
    metrics: {
      totalSupervisors: 10,
      totalTrainees: 50,
      totalLessonPlansReviewed: 120,
      totalObservationsConducted: 80,
      totalFeedbackSent: 100,
    },
    supervisors: [
      {
        id: "s1",
        name: "John Doe",
        placeOfSupervision: "Springfield High School",
        traineesSupervised: 5,
        lessonPlansReviewed: 20,
        observationsConducted: 10,
        feedbackSent: 15,
      },
      {
        id: "s2",
        name: "Jane Smith",
        placeOfSupervision: "Lincoln Academy",
        traineesSupervised: 4,
        lessonPlansReviewed: 15,
        observationsConducted: 8,
        feedbackSent: 12,
      },
      {
        id: "s3",
        name: "Alice Johnson",
        placeOfSupervision: "Riverside College",
        traineesSupervised: 6,
        lessonPlansReviewed: 25,
        observationsConducted: 12,
        feedbackSent: 18,
      },
    ],
  };
};

const exportAdminReport = async (format: "pdf" | "csv") => {
  // Mock export (replace with actual API call)
  console.log(`Exporting admin report as ${format}`);
  return `/reports/admin-report-${Date.now()}.${format}`;
};

// Type definitions
type Metrics = {
  totalSupervisors: number;
  totalTrainees: number;
  totalLessonPlansReviewed: number;
  totalObservationsConducted: number;
  totalFeedbackSent: number;
};

type Supervisor = {
  id: string;
  name: string;
  placeOfSupervision: string;
  traineesSupervised: number;
  lessonPlansReviewed: number;
  observationsConducted: number;
  feedbackSent: number;
};

type ReportData = {
  metrics: Metrics;
  supervisors: Supervisor[];
};

const getToken = (): string | null => {
  const token = document.cookie
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>(undefined);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const fetchReportData = useCallback(
    async (
      token: string,
      page: number = 1,
      query: string = "",
      dateRange?: { start: string; end: string },
      isRetry: boolean = false
    ) => {
      console.log(`fetchReportData called: page=${page}, query=${query}, dateRange=${JSON.stringify(dateRange)}, isRetry=${isRetry}, retryCount=${retryCount.current}`);
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminReport(dateRange, query);
        if (!response) {
          console.error(`getAdminReport returned null/undefined`);
          if (isRetry && retryCount.current < maxRetries) {
            retryCount.current += 1;
            const delay = Math.pow(2, retryCount.current) * 1000;
            console.log(`Retrying fetchReportData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
            setTimeout(() => fetchReportData(token, page, query, dateRange, true), delay);
            return;
          }
          setError("Failed to fetch report data.");
          return;
        }

        setReportData(response);

        const supervisors = Array.isArray(response.supervisors) ? response.supervisors : [];
        const filteredSupervisors = query
          ? supervisors.filter((s) =>
              s.name.toLowerCase().includes(query.toLowerCase()) ||
              s.placeOfSupervision.toLowerCase().includes(query.toLowerCase())
            )
          : supervisors;
        const itemsPerPage = 5;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setFilteredSupervisors(filteredSupervisors.slice(start, end));
        setTotalPages(Math.max(1, Math.ceil(filteredSupervisors.length / itemsPerPage)));

        retryCount.current = 0;
      } catch (err: any) {
        console.error("Error fetching report data:", err.message, err.stack);
        if (isRetry && retryCount.current < maxRetries) {
          retryCount.current += 1;
          const delay = Math.pow(2, retryCount.current) * 1000;
          console.log(`Retrying fetchReportData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
          setTimeout(() => fetchReportData(token, page, query, dateRange, true), delay);
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

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
      setCurrentPage(newPage);
      const token = getToken();
      if (token && userIdentifier) {
        fetchReportData(token, newPage, searchQuery, dateRange);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [totalPages, currentPage, searchQuery, dateRange, fetchReportData, router, userIdentifier]
  );

  const handleSearchSubmit = useCallback(
    (query: string) => {
      if (query === searchQuery) return;
      setSearchQuery(query);
      setCurrentPage(1);
      const token = getToken();
      if (token && userIdentifier) {
        fetchReportData(token, 1, query, dateRange);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [searchQuery, dateRange, fetchReportData, router, userIdentifier]
  );

  const handleDateRangeChange = (start: string, end: string) => {
    if (start && end) {
      setDateRange({ start, end });
      setCurrentPage(1);
      const token = getToken();
      if (token && userIdentifier) {
        fetchReportData(token, 1, searchQuery, { start, end });
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    } else {
      setDateRange(undefined);
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
        setUserIdentifier(response.identifier);

        if (response.role !== "admin") {
          setError("You are not authorized to access this page.");
          router.push(
            response.role === "supervisor"
              ? "/supervisors/profile"
              : response.role === "teacherTrainee"
              ? "/trainees/profile"
              : "/auth/signin"
          );
          return;
        }

        if (!response.identifier) {
          setError("Failed to retrieve user identifier. Please sign in again.");
          router.push("/auth/signin");
          return;
        }

        await fetchReportData(token, currentPage, searchQuery, dateRange, true);
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
  }, [router, fetchReportData, currentPage, searchQuery, dateRange]);

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
              onClick={() => fetchReportData(getToken()!, currentPage, searchQuery, dateRange, true)}
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
        <p className="text-sm text-gray-500 mt-1">
          Overview of supervisor and trainee performance
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-md shadow-md flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="flex gap-2 mt-1">
            <input
              type="date"
              className="p-2 border rounded-md w-full"
              onChange={(e) => handleDateRangeChange(e.target.value, dateRange?.end || "")}
            />
            <input
              type="date"
              className="p-2 border rounded-md w-full"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalSupervisors}</h1>
            <span className="text-sm text-gray-400">Total Supervisors</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleStudent.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalTrainees}</h1>
            <span className="text-sm text-gray-400">Total Trainees</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalLessonPlansReviewed}</h1>
            <span className="text-sm text-gray-400">Lesson Plans Reviewed</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalObservationsConducted}</h1>
            <span className="text-sm text-gray-400">Observations Conducted</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.totalFeedbackSent}</h1>
            <span className="text-sm text-gray-400">Feedback Sent</span>
          </div>
        </div>
      </div>

      {/* SUPERVISORS SECTION */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Supervisor Performance</h2>
          <TableSearch placeholder="Search supervisors..." onSearch={handleSearchSubmit} />
        </div>
        {filteredSupervisors.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image src="/stockout.png" alt="No supervisors" width={120} height={120} className="mx-auto mb-4" style={{ width: "auto", height: "auto" }} />
            <p className="text-gray-500 text-lg">No supervisors found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Supervisor</th>
                    <th scope="col" className="px-6 py-3">Place of Supervision</th>
                    <th scope="col" className="px-6 py-3">Trainees Supervised</th>
                    <th scope="col" className="px-6 py-3">Lesson Plans Reviewed</th>
                    <th scope="col" className="px-6 py-3">Observations</th>
                    <th scope="col" className="px-6 py-3">Feedback Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupervisors.map((supervisor) => (
                    <tr key={supervisor.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{supervisor.name}</td>
                      <td className="px-6 py-4">{supervisor.placeOfSupervision}</td>
                      <td className="px-6 py-4">{supervisor.traineesSupervised}</td>
                      <td className="px-6 py-4">{supervisor.lessonPlansReviewed}</td>
                      <td className="px-6 py-4">{supervisor.observationsConducted}</td>
                      <td className="px-6 py-4">{supervisor.feedbackSent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} count={filteredSupervisors.length} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReportPage;