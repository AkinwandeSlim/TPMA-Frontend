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
type Supervisor = {
  id: string;
  name: string;
  surname: string;
  placeOfSupervision?: string;
};

type Metrics = {
  traineesSupervised: number;
  lessonPlansReviewed: number;
  observationsConducted: number;
  feedbackSent: number;
};

type Trainee = {
  id: string;
  name: string;
  lessonPlansSubmitted: number;
  lessonPlansApproved: number;
  observations: number;
  feedbackReceived: number;
};

type LessonPlan = {
  id: string;
  title: string;
  traineeName: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  submittedAt: string;
  feedback?: string | null;
};

type ReportData = {
  supervisor: Supervisor;
  metrics: Metrics;
  trainees: Trainee[];
  lessonPlans: LessonPlan[];
};

// Hypothetical API call (replace with actual implementation)
const getSupervisorReport = async (
  supervisorId: string,
  dateRange?: { start: string; end: string },
  query?: string
): Promise<ReportData> => {
  // Mock response for demonstration
  return {
    supervisor: {
      id: supervisorId,
      name: "John Doe",
      surname: "",
      placeOfSupervision: "Springfield High School",
    },
    metrics: {
      traineesSupervised: 3,
      lessonPlansReviewed: 10,
      observationsConducted: 5,
      feedbackSent: 8,
    },
    trainees: [
      {
        id: "t1",
        name: "Jude Trainee",
        lessonPlansSubmitted: 4,
        lessonPlansApproved: 3,
        observations: 2,
        feedbackReceived: 3,
      },
      {
        id: "t2",
        name: "Amaka Obi",
        lessonPlansSubmitted: 3,
        lessonPlansApproved: 2,
        observations: 1,
        feedbackReceived: 2,
      },
      {
        id: "t3",
        name: "Chidi Okeke",
        lessonPlansSubmitted: 3,
        lessonPlansApproved: 1,
        observations: 2,
        feedbackReceived: 3,
      },
    ],
    lessonPlans: [
      {
        id: "lp-1",
        title: "Algebra Basics",
        traineeName: "Jude Trainee",
        status: "APPROVED",
        submittedAt: "2025-04-01T10:00:00Z",
        feedback: "Well-structured plan.",
      },
      {
        id: "lp-2",
        title: "Poetry Analysis",
        traineeName: "Amaka Obi",
        status: "PENDING",
        submittedAt: "2025-04-02T12:00:00Z",
        feedback: null,
      },
    ],
  };
};

const exportReport = async (supervisorId: string, format: "pdf" | "csv") => {
  // Mock export (replace with actual API call)
  console.log(`Exporting report for supervisor ${supervisorId} as ${format}`);
  return `/reports/supervisor-${supervisorId}.${format}`;
};

const getToken = (): string | null => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1] || localStorage.getItem("token") || null;
  console.log("getToken:", token ? "present" : "missing");
  return token;
};

const SupervisorReportPage = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [filteredLessonPlans, setFilteredLessonPlans] = useState<LessonPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
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
      supervisorId: string,
      traineePage: number = 1,
      traineeQuery: string = "",
      lessonPlanPage: number = 1,
      lessonPlanQuery: string = "",
      dateRange?: { start: string; end: string },
      isRetry: boolean = false
    ) => {
      console.log(`fetchReportData called: supervisorId=${supervisorId}, traineePage=${traineePage}, traineeQuery=${traineeQuery}, lessonPlanPage=${lessonPlanPage}, lessonPlanQuery=${lessonPlanQuery}, dateRange=${JSON.stringify(dateRange)}, isRetry=${isRetry}, retryCount=${retryCount.current}`);
      try {
        setLoading(true);
        setError(null);

        const response = await getSupervisorReport(supervisorId, dateRange, traineeQuery || lessonPlanQuery);
        if (!response) {
          console.error(`getSupervisorReport returned null/undefined for supervisorId=${supervisorId}`);
          if (isRetry && retryCount.current < maxRetries) {
            retryCount.current += 1;
            const delay = Math.pow(2, retryCount.current) * 1000;
            console.log(`Retrying fetchReportData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
            setTimeout(() => fetchReportData(token, supervisorId, traineePage, traineeQuery, lessonPlanPage, lessonPlanQuery, dateRange, true), delay);
            return;
          }
          setError("Failed to fetch report data.");
          return;
        }

        setReportData(response);

        const trainees = Array.isArray(response.trainees) ? response.trainees : [];
        const filteredTrainees = traineeQuery
          ? trainees.filter((t) => t.name.toLowerCase().includes(traineeQuery.toLowerCase()))
          : trainees;
        const itemsPerPage = 5;
        const traineeStart = (traineePage - 1) * itemsPerPage;
        const traineeEnd = traineeStart + itemsPerPage;
        setFilteredTrainees(filteredTrainees.slice(traineeStart, traineeEnd));
        setTotalTraineePages(Math.max(1, Math.ceil(filteredTrainees.length / itemsPerPage)));

        const lessonPlans = Array.isArray(response.lessonPlans) ? response.lessonPlans : [];
        const filteredLessonPlans = lessonPlanQuery
          ? lessonPlans.filter((lp) =>
              lp.title.toLowerCase().includes(lessonPlanQuery.toLowerCase()) ||
              lp.traineeName.toLowerCase().includes(lessonPlanQuery.toLowerCase())
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
          setTimeout(() => fetchReportData(token, supervisorId, traineePage, traineeQuery, lessonPlanPage, lessonPlanQuery, dateRange, true), delay);
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

  const handleTraineePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalTraineePages || newPage === currentTraineePage) return;
      setCurrentTraineePage(newPage);
      const token = getToken();
      if (token && userIdentifier) {
        fetchReportData(token, userIdentifier, newPage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [totalTraineePages, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, fetchReportData, router, userIdentifier]
  );

  const handleLessonPlanPageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalLessonPlanPages || newPage === currentLessonPlanPage) return;
      setCurrentLessonPlanPage(newPage);
      const token = getToken();
      if (token && userIdentifier) {
        fetchReportData(token, userIdentifier, currentTraineePage, traineeSearchQuery, newPage, lessonPlanSearchQuery, dateRange);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [totalLessonPlanPages, currentLessonPlanPage, currentTraineePage, traineeSearchQuery, lessonPlanSearchQuery, dateRange, fetchReportData, router, userIdentifier]
  );

  const handleTraineeSearchSubmit = useCallback(
    (query: string) => {
      if (query === traineeSearchQuery) return;
      setTraineeSearchQuery(query);
      setCurrentTraineePage(1);
      const token = getToken();
      if (token && userIdentifier) {
        fetchReportData(token, userIdentifier, 1, query, currentLessonPlanPage, lessonPlanSearchQuery, dateRange);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, fetchReportData, router, userIdentifier]
  );

  const handleLessonPlanSearchSubmit = useCallback(
    (query: string) => {
      if (query === lessonPlanSearchQuery) return;
      setLessonPlanSearchQuery(query);
      setCurrentLessonPlanPage(1);
      const token = getToken();
      if (token && userIdentifier) {
        fetchReportData(token, userIdentifier, currentTraineePage, traineeSearchQuery, 1, query, dateRange);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [lessonPlanSearchQuery, currentTraineePage, traineeSearchQuery, dateRange, fetchReportData, router, userIdentifier]
  );

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange(start && end ? { start, end } : undefined);
    setCurrentTraineePage(1);
    setCurrentLessonPlanPage(1);
    const token = getToken();
    if (token && userIdentifier) {
      fetchReportData(token, userIdentifier, 1, traineeSearchQuery, 1, lessonPlanSearchQuery, start && end ? { start, end } : undefined);
    } else {
      setError("Authentication token or user identifier missing. Please sign in.");
      router.push("/auth/signin");
    }
  };

  const handleExport = async (format: "pdf" | "csv") => {
    try {
      if (!userIdentifier) throw new Error("Supervisor identifier missing");
      const url = await exportReport(userIdentifier, format);
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

        if (response.role !== "supervisor") {
          setError("You are not authorized to access this page.");
          router.push(response.role === "teacherTrainee" ? "/trainees/profile" : "/admins/profile");
          return;
        }

        if (!response.identifier) {
          setError("Failed to retrieve user identifier. Please sign in again.");
          router.push("/auth/signin");
          return;
        }

        await fetchReportData(token, response.identifier, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, true);
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
  }, [router, fetchReportData, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange]);

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
              onClick={() => fetchReportData(getToken()!, userIdentifier!, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, true)}
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
        <h1 className="text-xl font-semibold">Supervisor Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Report for {reportData.supervisor.name} {reportData.supervisor.surname} at {reportData.supervisor.placeOfSupervision || "N/A"}
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
              onChange={(e) => {
                if (dateRange?.end) handleDateRangeChange(e.target.value, dateRange.end);
              }}
            />
            <input
              type="date"
              className="p-2 border rounded-md w-full"
              onChange={(e) => {
                if (dateRange?.start) handleDateRangeChange(dateRange.start, e.target.value);
              }}
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
          <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.traineesSupervised}</h1>
            <span className="text-sm text-gray-400">Trainees Supervised</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.lessonPlansReviewed}</h1>
            <span className="text-sm text-gray-400">Lesson Plans Reviewed</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.observationsConducted}</h1>
            <span className="text-sm text-gray-400">Observations Conducted</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
          <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
          <div>
            <h1 className="text-xl font-semibold">{reportData.metrics.feedbackSent}</h1>
            <span className="text-sm text-gray-400">Feedback Sent</span>
          </div>
        </div>
      </div>

      {/* TRAINEES SECTION */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Trainee Performance</h2>
          <TableSearch placeholder="Search trainees..." onSearch={handleTraineeSearchSubmit} />
        </div>
        {filteredTrainees.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image src="/stockout.png" alt="No trainees" width={120} height={120} className="mx-auto mb-4" style={{ width: "auto", height: "auto" }} />
            <p className="text-gray-500 text-lg">No trainees found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Trainee</th>
                    <th scope="col" className="px-6 py-3">Lesson Plans Submitted</th>
                    <th scope="col" className="px-6 py-3">Lesson Plans Approved</th>
                    <th scope="col" className="px-6 py-3">Observations</th>
                    <th scope="col" className="px-6 py-3">Feedback Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainees.map((trainee) => (
                    <tr key={trainee.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{trainee.name}</td>
                      <td className="px-6 py-4">{trainee.lessonPlansSubmitted}</td>
                      <td className="px-6 py-4">{trainee.lessonPlansApproved}</td>
                      <td className="px-6 py-4">{trainee.observations}</td>
                      <td className="px-6 py-4">{trainee.feedbackReceived}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentTraineePage} count={filteredTrainees.length} onPageChange={handleTraineePageChange} />
          </>
        )}
      </div>

      {/* LESSON PLANS SECTION */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Lesson Plan Summary</h2>
          <TableSearch placeholder="Search lesson plans..." onSearch={handleLessonPlanSearchSubmit} />
        </div>
        {filteredLessonPlans.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image src="/stockout.png" alt="No lesson plans" width={120} height={120} className="mx-auto mb-4" style={{ width: "auto", height: "auto" }} />
            <p className="text-gray-500 text-lg">No lesson plans found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Title</th>
                    <th scope="col" className="px-6 py-3">Trainee</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Submitted At</th>
                    <th scope="col" className="px-6 py-3">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLessonPlans.map((lp) => (
                    <tr key={lp.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{lp.title}</td>
                      <td className="px-6 py-4">{lp.traineeName}</td>
                      <td className="px-6 py-4">{lp.status}</td>
                      <td className="px-6 py-4">{formatDate(lp.submittedAt)}</td>
                      <td className="px-6 py-4">{lp.feedback || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentLessonPlanPage} count={filteredLessonPlans.length} onPageChange={handleLessonPlanPageChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default SupervisorReportPage;













































// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import TableSearch from "@/components/TableSearch";
// import Pagination from "@/components/Pagination";
// import { toast } from "react-toastify";
// import { verifyToken } from "@/lib/api";
// import { formatDate } from "@/lib/utils";

// // Hypothetical API call (replace with actual implementation)
// const getSupervisorReport = async (supervisorId: string, dateRange?: { start: string; end: string }, query?: string) => {
//   // Mock response for demonstration
//   return {
//     supervisor: {
//       id: supervisorId,
//       name: "John Doe",
//       surname: "",
//       placeOfSupervision: "Springfield High School",
//     },
//     metrics: {
//       traineesSupervised: 3,
//       lessonPlansReviewed: 10,
//       observationsConducted: 5,
//       feedbackSent: 8,
//     },
//     trainees: [
//       {
//         id: "t1",
//         name: "Jude Trainee",
//         lessonPlansSubmitted: 4,
//         lessonPlansApproved: 3,
//         observations: 2,
//         feedbackReceived: 3,
//       },
//       {
//         id: "t2",
//         name: "Amaka Obi",
//         lessonPlansSubmitted: 3,
//         lessonPlansApproved: 2,
//         observations: 1,
//         feedbackReceived: 2,
//       },
//       {
//         id: "t3",
//         name: "Chidi Okeke",
//         lessonPlansSubmitted: 3,
//         lessonPlansApproved: 1,
//         observations: 2,
//         feedbackReceived: 3,
//       },
//     ],
//     lessonPlans: [
//       {
//         id: "lp-1",
//         title: "Algebra Basics",
//         traineeName: "Jude Trainee",
//         status: "APPROVED",
//         submittedAt: "2025-04-01T10:00:00Z",
//         feedback: "Well-structured plan.",
//       },
//       {
//         id: "lp-2",
//         title: "Poetry Analysis",
//         traineeName: "Amaka Obi",
//         status: "PENDING",
//         submittedAt: "2025-04-02T12:00:00Z",
//         feedback: null,
//       },
//     ],
//   };
// };

// const exportReport = async (supervisorId: string, format: "pdf" | "csv") => {
//   // Mock export (replace with actual API call)
//   console.log(`Exporting report for supervisor ${supervisorId} as ${format}`);
//   return `/reports/supervisor-${supervisorId}.${format}`;
// };

// // Type definitions
// type Supervisor = {
//   id: string;
//   name: string;
//   surname: string;
//   placeOfSupervision?: string;
// };

// type Metrics = {
//   traineesSupervised: number;
//   lessonPlansReviewed: number;
//   observationsConducted: number;
//   feedbackSent: number;
// };

// type Trainee = {
//   id: string;
//   name: string;
//   lessonPlansSubmitted: number;
//   lessonPlansApproved: number;
//   observations: number;
//   feedbackReceived: number;
// };

// type LessonPlan = {
//   id: string;
//   title: string;
//   traineeName: string;
//   status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
//   submittedAt: string;
//   feedback?: string | null;
// };

// type ReportData = {
//   supervisor: Supervisor;
//   metrics: Metrics;
//   trainees: Trainee[];
//   lessonPlans: LessonPlan[];
// };

// const getToken = (): string | null => {
//   const token = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("token="))
//     ?.split("=")[1] || localStorage.getItem("token") || null;
//   console.log("getToken:", token ? "present" : "missing");
//   return token;
// };

// const SupervisorReportPage = () => {
//   const router = useRouter();
//   const [reportData, setReportData] = useState<ReportData | null>(null);
//   const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
//   const [filteredLessonPlans, setFilteredLessonPlans] = useState<LessonPlan[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [verifying, setVerifying] = useState<boolean>(true);
//   const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
//   const [currentTraineePage, setCurrentTraineePage] = useState<number>(1);
//   const [totalTraineePages, setTotalTraineePages] = useState<number>(1);
//   const [traineeSearchQuery, setTraineeSearchQuery] = useState<string>("");
//   const [currentLessonPlanPage, setCurrentLessonPlanPage] = useState<number>(1);
//   const [totalLessonPlanPages, setTotalLessonPlanPages] = useState<number>(1);
//   const [lessonPlanSearchQuery, setLessonPlanSearchQuery] = useState<string>("");
//   const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
//   const retryCount = useRef(0);
//   const maxRetries = 3;

//   const fetchReportData = useCallback(
//     async (
//       token: string,
//       supervisorId: string,
//       traineePage: number = 1,
//       traineeQuery: string = "",
//       lessonPlanPage: number = 1,
//       lessonPlanQuery: string = "",
//       dateRange?: { start: string; end: string },
//       isRetry: boolean = false
//     ) => {
//       console.log(`fetchReportData called: supervisorId=${supervisorId}, traineePage=${traineePage}, traineeQuery=${traineeQuery}, lessonPlanPage=${lessonPlanPage}, lessonPlanQuery=${lessonPlanQuery}, dateRange=${JSON.stringify(dateRange)}, isRetry=${isRetry}, retryCount=${retryCount.current}`);
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await getSupervisorReport(supervisorId, dateRange, traineeQuery || lessonPlanQuery);
//         if (!response) {
//           console.error(`getSupervisorReport returned null/undefined for supervisorId=${supervisorId}`);
//           if (isRetry && retryCount.current < maxRetries) {
//             retryCount.current += 1;
//             const delay = Math.pow(2, retryCount.current) * 1000;
//             console.log(`Retrying fetchReportData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
//             setTimeout(() => fetchReportData(token, supervisorId, traineePage, traineeQuery, lessonPlanPage, lessonPlanQuery, dateRange, true), delay);
//             return;
//           }
//           setError("Failed to fetch report data.");
//           return;
//         }

//         setReportData(response);

//         const trainees = Array.isArray(response.trainees) ? response.trainees : [];
//         const filteredTrainees = traineeQuery
//           ? trainees.filter((t) => t.name.toLowerCase().includes(traineeQuery.toLowerCase()))
//           : trainees;
//         const itemsPerPage = 5;
//         const traineeStart = (traineePage - 1) * itemsPerPage;
//         const traineeEnd = traineeStart + itemsPerPage;
//         setFilteredTrainees(filteredTrainees.slice(traineeStart, traineeEnd));
//         setTotalTraineePages(Math.max(1, Math.ceil(filteredTrainees.length / itemsPerPage)));

//         const lessonPlans = Array.isArray(response.lessonPlans) ? response.lessonPlans : [];
//         const filteredLessonPlans = lessonPlanQuery
//           ? lessonPlans.filter((lp) =>
//               lp.title.toLowerCase().includes(lessonPlanQuery.toLowerCase()) ||
//               lp.traineeName.toLowerCase().includes(lessonPlanQuery.toLowerCase())
//             )
//           : lessonPlans;
//         const lessonPlanStart = (lessonPlanPage - 1) * itemsPerPage;
//         const lessonPlanEnd = lessonPlanStart + itemsPerPage;
//         setFilteredLessonPlans(filteredLessonPlans.slice(lessonPlanStart, lessonPlanEnd));
//         setTotalLessonPlanPages(Math.max(1, Math.ceil(filteredLessonPlans.length / itemsPerPage)));

//         retryCount.current = 0;
//       } catch (err: any) {
//         console.error("Error fetching report data:", err.message, err.stack);
//         if (isRetry && retryCount.current < maxRetries) {
//           retryCount.current += 1;
//           const delay = Math.pow(2, retryCount.current) * 1000;
//           console.log(`Retrying fetchReportData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
//           setTimeout(() => fetchReportData(token, supervisorId, traineePage, traineeQuery, lessonPlanPage, lessonPlanQuery, dateRange, true), delay);
//           return;
//         }
//         const errorMessage = err.message || "Failed to fetch report data. Please try again.";
//         setError(errorMessage);
//         toast.error(errorMessage, { toastId: "fetch-report-error" });
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const handleTraineePageChange = useCallback(
//     (newPage: number) => {
//       if (newPage < 1 || newPage > totalTraineePages || newPage === currentTraineePage) return;
//       setCurrentTraineePage(newPage);
//       const token = getToken();
//       if (token && userIdentifier) {
//         fetchReportData(token, userIdentifier, newPage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange);
//       } else {
//         setError("Authentication token or user identifier missing. Please sign in.");
//         router.push("/auth/signin");
//       }
//     },
//     [totalTraineePages, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, fetchReportData, router, userIdentifier]
//   );

//   const handleLessonPlanPageChange = useCallback(
//     (newPage: number) => {
//       if (newPage < 1 || newPage > totalLessonPlanPages || newPage === currentLessonPlanPage) return;
//       setCurrentLessonPlanPage(newPage);
//       const token = getToken();
//       if (token && userIdentifier) {
//         fetchReportData(token, userIdentifier, currentTraineePage, traineeSearchQuery, newPage, lessonPlanSearchQuery, dateRange);
//       } else {
//         setError("Authentication token or user identifier missing. Please sign in.");
//         router.push("/auth/signin");
//       }
//     },
//     [totalLessonPlanPages, currentLessonPlanPage, currentTraineePage, traineeSearchQuery, lessonPlanSearchQuery, dateRange, fetchReportData, router, userIdentifier]
//   );

//   const handleTraineeSearchSubmit = useCallback(
//     (query: string) => {
//       if (query === traineeSearchQuery) return;
//       setTraineeSearchQuery(query);
//       setCurrentTraineePage(1);
//       const token = getToken();
//       if (token && userIdentifier) {
//         fetchReportData(token, userIdentifier, 1, query, currentLessonPlanPage, lessonPlanSearchQuery, dateRange);
//       } else {
//         setError("Authentication token or user identifier missing. Please sign in.");
//         router.push("/auth/signin");
//       }
//     },
//     [traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, fetchReportData, router, userIdentifier]
//   );

//   const handleLessonPlanSearchSubmit = useCallback(
//     (query: string) => {
//       if (query === lessonPlanSearchQuery) return;
//       setLessonPlanSearchQuery(query);
//       setCurrentLessonPlanPage(1);
//       const token = getToken();
//       if (token && userIdentifier) {
//         fetchReportData(token, userIdentifier, currentTraineePage, traineeSearchQuery, 1, query, dateRange);
//       } else {
//         setError("Authentication token or user identifier missing. Please sign in.");
//         router.push("/auth/signin");
//       }
//     },
//     [lessonPlanSearchQuery, currentTraineePage, traineeSearchQuery, dateRange, fetchReportData, router, userIdentifier]
//   );

//   const handleDateRangeChange = (start: string, end: string) => {
//     setDateRange({ start, end });
//     setCurrentTraineePage(1);
//     setCurrentLessonPlanPage(1);
//     const token = getToken();
//     if (token && userIdentifier) {
//       fetchReportData(token, userIdentifier, 1, traineeSearchQuery, 1, lessonPlanSearchQuery, { start, end });
//     } else {
//       setError("Authentication token or user identifier missing. Please sign in.");
//       router.push("/auth/signin");
//     }
//   };

//   const handleExport = async (format: "pdf" | "csv") => {
//     try {
//       if (!userIdentifier) throw new Error("Supervisor identifier missing");
//       const url = await exportReport(userIdentifier, format);
//       window.open(url, "_blank");
//       toast.success(`Report exported as ${format.toUpperCase()}`);
//     } catch (err: any) {
//       console.error("Error exporting report:", err);
//       toast.error("Failed to export report.");
//     }
//   };

//   useEffect(() => {
//     const verifyAndFetch = async () => {
//       try {
//         setVerifying(true);
//         setError(null);

//         const token = getToken();
//         if (!token) {
//           setError("Please sign in to view this page.");
//           router.push("/auth/signin");
//           return;
//         }

//         const response = await verifyToken();
//         setUserIdentifier(response.identifier);

//         if (response.role !== "supervisor") {
//           setError("You are not authorized to access this page.");
//           router.push(response.role === "teacherTrainee" ? "/trainees/profile" : "/admins/profile");
//           return;
//         }

//         if (!response.identifier) {
//           setError("Failed to retrieve user identifier. Please sign in again.");
//           router.push("/auth/signin");
//           return;
//         }

//         await fetchReportData(token, response.identifier, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, true);
//       } catch (err: any) {
//         const errorMessage =
//           err.message === "Invalid or expired token"
//             ? "Your session has expired. Please log in again."
//             : "Failed to verify session. Please sign in.";
//         setError(errorMessage);
//         toast.error(errorMessage, { toastId: "verify-error" });
//         router.push("/auth/signin");
//       } finally {
//         setVerifying(false);
//         setLoading(false);
//       }
//     };

//     verifyAndFetch();
//   }, [router, fetchReportData, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange]);

//   if (verifying || loading) {
//     return (
//       <div className="p-4 flex items-center justify-center h-full">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
//       </div>
//     );
//   }

//   if (error || !reportData) {
//     return (
//       <div className="p-4 text-red-500 flex flex-col items-center">
//         <p>{error || "Failed to load report data."}</p>
//         <div className="mt-4 flex gap-4">
//           {error?.includes("sign in") ? (
//             <button
//               onClick={() => router.push("/auth/signin")}
//               className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               Sign In
//             </button>
//           ) : (
//             <button
//               onClick={() => fetchReportData(getToken()!, userIdentifier!, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, dateRange, true)}
//               className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
//             >
//               Retry
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 p-4 flex flex-col gap-4">
//       {/* HEADER */}
//       <div className="bg-white p-4 rounded-md shadow-md">
//         <h1 className="text-xl font-semibold">Supervisor Report</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Report for {reportData.supervisor.name} {reportData.supervisor.surname} at {reportData.supervisor.placeOfSupervision || "N/A"}
//         </p>
//       </div>

//       {/* FILTERS */}
//       <div className="bg-white p-4 rounded-md shadow-md flex flex-col md:flex-row gap-4">
//         <div className="flex-1">
//           <label className="block text-sm font-medium text-gray-700">Date Range</label>
//           <div className="flex gap-2 mt-1">
//             <input
//               type="date"
//               className="p-2 border rounded-md w-full"
//               onChange={(e) => {
//                 if (dateRange?.end) handleDateRangeChange(e.target.value, dateRange.end);
//               }}
//             />
//             <input
//               type="date"
//               className="p-2 border rounded-md w-full"
//               onChange={(e) => {
//                 if (dateRange?.start) handleDateRangeChange(dateRange.start, e.target.value);
//               }}
//             />
//           </div>
//         </div>
//         <div className="flex items-end">
//           <div className="flex gap-2">
//             <button
//               onClick={() => handleExport("pdf")}
//               className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               Export PDF
//             </button>
//             <button
//               onClick={() => handleExport("csv")}
//               className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
//             >
//               Export CSV
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* METRICS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
//           <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
//           <div>
//             <h1 className="text-xl font-semibold">{reportData.metrics.traineesSupervised}</h1>
//             <span className="text-sm text-gray-400">Trainees Supervised</span>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
//           <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
//           <div>
//             <h1 className="text-xl font-semibold">{reportData.metrics.lessonPlansReviewed}</h1>
//             <span className="text-sm text-gray-400">Lesson Plans Reviewed</span>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
//           <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
//           <div>
//             <h1 className="text-xl font-semibold">{reportData.metrics.observationsConducted}</h1>
//             <span className="text-sm text-gray-400">Observations Conducted</span>
//           </div>
//         </div>
//         <div className="bg-white p-4 rounded-md shadow-md flex gap-4">
//           <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" style={{ width: "auto", height: "auto" }} />
//           <div>
//             <h1 className="text-xl font-semibold">{reportData.metrics.feedbackSent}</h1>
//             <span className="text-sm text-gray-400">Feedback Sent</span>
//           </div>
//         </div>
//       </div>

//       {/* TRAINEES SECTION */}
//       <div className="bg-white p-4 rounded-md shadow-md">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold">Trainee Performance</h2>
//           <TableSearch placeholder="Search trainees..." onSearch={handleTraineeSearchSubmit} />
//         </div>
//         {filteredTrainees.length === 0 ? (
//           <div className="text-center py-10 bg-gray-50 rounded-md">
//             <Image src="/stockout.png" alt="No trainees" width={120} height={120} className="mx-auto mb-4" style={{ width: "auto", height: "auto" }} />
//             <p className="text-gray-500 text-lg">No trainees found.</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left text-gray-500">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3">Trainee</th>
//                     <th scope="col" className="px-6 py-3">Lesson Plans Submitted</th>
//                     <th scope="col" className="px-6 py-3">Lesson Plans Approved</th>
//                     <th scope="col" className="px-6 py-3">Observations</th>
//                     <th scope="col" className="px-6 py-3">Feedback Received</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredTrainees.map((trainee) => (
//                     <tr key={trainee.id} className="bg-white border-b hover:bg-gray-50">
//                       <td className="px-6 py-4 font-medium text-gray-900">{trainee.name}</td>
//                       <td className="px-6 py-4">{trainee.lessonPlansSubmitted}</td>
//                       <td className="px-6 py-4">{trainee.lessonPlansApproved}</td>
//                       <td className="px-6 py-4">{trainee.observations}</td>
//                       <td className="px-6 py-4">{trainee.feedbackReceived}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <Pagination page={currentTraineePage} count={filteredTrainees.length} onPageChange={handleTraineePageChange} />
//           </>
//         )}
//       </div>

//       {/* LESSON PLANS SECTION */}
//       <div className="bg-white p-4 rounded-md shadow-md">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold">Lesson Plan Summary</h2>
//           <TableSearch placeholder="Search lesson plans..." onSearch={handleLessonPlanSearchSubmit} />
//         </div>
//         {filteredLessonPlans.length === 0 ? (
//           <div className="text-center py-10 bg-gray-50 rounded-md">
//             <Image src="/stockout.png" alt="No lesson plans" width={120} height={120} className="mx-auto mb-4" style={{ width: "auto", height: "auto" }} />
//             <p className="text-gray-500 text-lg">No lesson plans found.</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left text-gray-500">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3">Title</th>
//                     <th scope="col" className="px-6 py-3">Trainee</th>
//                     <th scope="col" className="px-6 py-3">Status</th>
//                     <th scope="col" className="px-6 py-3">Submitted At</th>
//                     <th scope="col" className="px-6 py-3">Feedback</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredLessonPlans.map((lp) => (
//                     <tr key={lp.id} className="bg-white border-b hover:bg-gray-50">
//                       <td className="px-6 py-4 font-medium text-gray-900">{lp.title}</td>
//                       <td className="px-6 py-4">{lp.traineeName}</td>
//                       <td className="px-6 py-4">{lp.status}</td>
//                       <td className="px-6 py-4">{formatDate(lp.submittedAt)}</td>
//                       <td className="px-6 py-4">{lp.feedback || "N/A"}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <Pagination page={currentLessonPlanPage} count={filteredLessonPlans.length} onPageChange={handleLessonPlanPageChange} />
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SupervisorReportPage;