"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import { useTableSearch } from "@/hooks/useTableSearch";
import { createLessonPlan, updateLessonPlan, deleteLessonPlan, getLessonPlans, generateLessonPlanPDF, generateAILessonPlan, verifyToken } from "@/lib/api";
import { LessonPlanSchemaType } from "@/lib/api";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

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
  status: string;
  aiGenerated: boolean;
  traineeName: string;
  supervisorName: string;
  schoolName: string;
  pdfUrl: string | null;
};

const LessonPlanPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const traineeId = searchParams.get("traineeId");
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showChatbotModal, setShowChatbotModal] = useState(false);
  const [tempFilterConfig, setTempFilterConfig] = useState<{
    subject: string;
    status: string;
  }>({ subject: "", status: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [tempLessonPlan, setTempLessonPlan] = useState<Partial<LessonPlanSchemaType> | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tpma-backend.onrender.com";

  const {
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
    filterConfig,
    updateFilter,
  } = useTableSearch<LessonPlan>({
    data: lessonPlans,
    searchableFields: [
      (lp) => lp.title || "",
      (lp) => lp.subject || "",
      (lp) => lp.objectives || "",
    ],
    initialSortField: "title",
    initialSortDirection: "asc",
    itemsPerPage: 10,
  });

  const fetchLessonPlans = useCallback(
    async (page: number, resetPage = false) => {
      if (isFetching) {
        console.log("LessonPlanPage - Skipping fetch: already fetching");
        return;
      }
      console.log("LessonPlanPage - Fetching lesson plans for page:", page, "resetPage:", resetPage, "traineeId:", traineeId);
      setIsFetching(true);
      setLoading(true);
      try {
        const pageToFetch = resetPage ? 1 : page;
        const response = traineeId
          ? await getLessonPlans(traineeId, pageToFetch, 10, searchQuery, filterConfig.subject, filterConfig.status)
          : await getLessonPlans(undefined, pageToFetch, 10, searchQuery, filterConfig.subject, filterConfig.status);
        console.log("LessonPlanPage - API Response:", response);
        if (response.lessonPlans && Array.isArray(response.lessonPlans)) {
          const mappedPlans: LessonPlan[] = response.lessonPlans.map((item) => ({
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
          }));
          setLessonPlans(mappedPlans);
          const total = response.totalCount ?? 0;
          const pages = response.totalPages ?? 1;
          setTotalCount(total);
          setTotalPages(pages);
          if (resetPage && currentPage !== 1) {
            console.log("LessonPlanPage - Resetting currentPage to 1");
            setCurrentPage(1);
          } else if (pageToFetch !== currentPage) {
            console.log("LessonPlanPage - Setting currentPage to:", pageToFetch);
            setCurrentPage(pageToFetch);
          }
          console.log("LessonPlanPage - Updated State:", { totalCount: total, totalPages: pages, currentPage: pageToFetch });
        } else {
          console.error("LessonPlanPage - Invalid data structure:", response);
          setLessonPlans([]);
          setTotalCount(0);
          setTotalPages(1);
          toast.error("No lesson plans received from server.");
        }
      } catch (err: any) {
        console.error("LessonPlanPage - Error fetching lesson plans:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        let message = "Failed to fetch lesson plans. Please try again.";
        if (err.response?.status === 401) {
          message = "Session expired. Please sign in again.";
          router.push("/auth/signin");
        } else if (err.response?.status === 403) {
          message = "Unauthorized: You lack permission to view lesson plans.";
        } else if (err.response?.status === 404) {
          message = "No lesson plans found.";
        }
        toast.error(message);
        setError(message);
        setLessonPlans([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsFetching(false);
        setLoading(false);
        console.log("LessonPlanPage - Fetch completed");
      }
    },
    [searchQuery,isFetching, filterConfig.subject, filterConfig.status, currentPage, router, traineeId]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      console.log("LessonPlanPage - handlePageChange called with newPage:", newPage, "currentPage:", currentPage);
      if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
        console.log("LessonPlanPage - Invalid page change, skipping");
        return;
      }
      setCurrentPage(newPage);
      fetchLessonPlans(newPage);
    },
    [totalPages, currentPage, fetchLessonPlans]
  );

  const parseMarkdownLessonPlan = (markdown: string): Partial<LessonPlanSchemaType> & {
    rationale?: string;
    homework?: string;
    references?: string;
  } => {
    const lessonPlan: Partial<LessonPlanSchemaType> & {
      rationale?: string;
      homework?: string;
      references?: string;
    } = {};
    const lines = markdown.split("\n");
    let currentSection = "";
    let objectives: string[] = [];
    let activities: string[] = [];
    let rationale: string[] = [];
    let homework: string[] = [];
    let references: string[] = [];

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith("Subject: ")) lessonPlan.subject = line.replace("Subject: ", "");
      else if (line.startsWith("Topic: ")) lessonPlan.title = line.replace("Topic: ", "");
      else if (line.startsWith("Class: ")) lessonPlan.class = line.replace("Class: ", "");
      else if (line.startsWith("Duration: ")) {
        lessonPlan.date = "2025-04-25"; // Hardcode from prompt; adjust if needed
      }
      else if (line.startsWith("Teaching Aids: ")) lessonPlan.resources = line.replace("Teaching Aids: ", "");
      else if (line.startsWith("## Behavioral Objectives")) {
        currentSection = "objectives";
      }
      else if (line.startsWith("## Presentation and Development")) {
        currentSection = "activities";
      }
      else if (line.startsWith("## Rationale")) {
        currentSection = "rationale";
      }
      else if (line.startsWith("## Homework")) {
        currentSection = "homework";
      }
      else if (line.startsWith("## References")) {
        currentSection = "references";
      }
      else if (line.startsWith("## ") || line.startsWith("# ")) {
        currentSection = "";
      }
      else if (currentSection === "objectives" && line.startsWith("- ")) {
        objectives.push(line.replace("- ", ""));
      }
      else if (currentSection === "activities" && line.length > 0) {
        activities.push(line);
      }
      else if (currentSection === "rationale" && line.length > 0) {
        rationale.push(line);
      }
      else if (currentSection === "homework" && line.length > 0) {
        homework.push(line);
      }
      else if (currentSection === "references" && line.length > 0) {
        references.push(line);
      }
    });

    lessonPlan.objectives = objectives.join("\n");
    lessonPlan.activities = activities.join("\n");
    lessonPlan.rationale = rationale.join("\n");
    lessonPlan.homework = homework.join("\n");
    lessonPlan.references = references.join("\n");
    lessonPlan.aiGenerated = true;

    // Append unsupported fields to activities
    let combinedActivities = lessonPlan.activities;
    if (lessonPlan.rationale) {
      combinedActivities += `\n\n### Rationale\n${lessonPlan.rationale}`;
    }
    if (lessonPlan.homework) {
      combinedActivities += `\n\n### Homework\n${lessonPlan.homework}`;
    }
    if (lessonPlan.references) {
      combinedActivities += `\n\n### References\n${lessonPlan.references}`;
    }
    lessonPlan.activities = combinedActivities;

    return lessonPlan;
  };

  const validateLessonPlan = (data: Partial<LessonPlanSchemaType>): string | null => {
    if (!data.startTime || !data.endTime) {
      return "Start time and end time are required.";
    }
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      return "Times must be in HH:mm format (e.g., 09:00).";
    }
    const start = new Date(`2025-01-01T${data.startTime}:00`);
    const end = new Date(`2025-01-01T${data.endTime}:00`);
    if (end <= start) {
      return "End time must be after start time.";
    }
    return null;
  };

  const handleGenerateAILessonPlan = useCallback(async () => {
    if (!chatQuery.trim()) {
      toast.error("Please enter a lesson plan prompt");
      return;
    }
    setIsChatLoading(true);
    setChatResponse(null);
    setTempLessonPlan(null);
    try {
      const response = await generateAILessonPlan(chatQuery, conversationId);
      console.log("LessonPlanPage - AI Lesson Plan Response:", JSON.stringify(response, null, 2));
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }
      if (typeof response.answer === "string" && response.answer.includes("please provide the specific details")) {
        toast.error(
          "Please include details like topic, duration, objectives, and activities. Try the example prompt.",
          { autoClose: 5000 }
        );
        setChatResponse(response.answer);
        return;
      }
      setChatResponse(response.answer);
      const lessonPlanData = parseMarkdownLessonPlan(response.answer);
      setTempLessonPlan({
        ...lessonPlanData,
        startTime: "",
        endTime: "",
        date: lessonPlanData.date || "2025-04-25",
      });
    } catch (err: any) {
      console.error("LessonPlanPage - Error generating AI lesson plan:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error(err.message || "Failed to generate AI lesson plan");
    } finally {
      setIsChatLoading(false);
    }
  }, [chatQuery, conversationId]);

  const handleSaveLessonPlan = useCallback(async () => {
    if (!tempLessonPlan) {
      toast.error("No lesson plan data to save.");
      return;
    }
    const validationError = validateLessonPlan(tempLessonPlan);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsChatLoading(true);
    try {
      const validatedData: LessonPlanSchemaType = {
        title: tempLessonPlan.title || "Untitled",
        subject: tempLessonPlan.subject || "Unknown",
        class: tempLessonPlan.class || "Unknown",
        date: tempLessonPlan.date || "2025-04-25",
        startTime: tempLessonPlan.startTime!,
        endTime: tempLessonPlan.endTime!,
        objectives: tempLessonPlan.objectives || "",
        activities: tempLessonPlan.activities || "",
        resources: tempLessonPlan.resources || "",
        aiGenerated: true,
      };
      const { lessonPlan } = await createLessonPlan(validatedData);
      const pdfUrl = await generateLessonPlanPDF(lessonPlan.id, validatedData);
      window.open(`${API_BASE_URL}${pdfUrl}`, "_blank");
      toast.success("AI lesson plan created and PDF generated!");
      fetchLessonPlans(1, true);
      setShowChatbotModal(false);
      setChatQuery("");
      setChatResponse(null);
      setTempLessonPlan(null);
      setConversationId("");
    } catch (err: any) {
      console.error("LessonPlanPage - Error saving AI lesson plan:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error(err.message || "Failed to save AI lesson plan");
    } finally {
      setIsChatLoading(false);
    }
  }, [tempLessonPlan, fetchLessonPlans, API_BASE_URL]);

  useEffect(() => {
    console.log("LessonPlanPage - Auth useEffect running");
    const verifyAndFetch = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || localStorage.getItem("token");

        if (!token) {
          console.log("LessonPlanPage - No token found, redirecting to signin");
          router.push("/auth/signin");
          return;
        }

        const response = await verifyToken();
        setRole(response.role);
        setUserIdentifier(response.identifier);

        if (traineeId && response.role === "teacherTrainee" && response.identifier !== traineeId) {
          console.log("LessonPlanPage - Trainee accessing another trainee's plans, redirecting");
          setError("You can only view your own lesson plans.");
          router.push(`/list/lesson-plans?traineeId=${response.identifier}`);
          return;
        }

        fetchLessonPlans(1);
      } catch (err: any) {
        console.error("LessonPlanPage - Verification error:", err.message);
        toast.error("Failed to verify session. Please sign in.");
        router.push("/auth/signin");
      }
    };

    verifyAndFetch();
  }, [router, fetchLessonPlans, traineeId]);

  useEffect(() => {
    console.log("LessonPlanPage - Search/Filter useEffect running, searchQuery:", searchQuery, "subject:", filterConfig.subject, "status:", filterConfig.status);
    fetchLessonPlans(1, true);
  }, [searchQuery, filterConfig.subject, filterConfig.status, fetchLessonPlans]);

  const applyFilters = useCallback(() => {
    console.log("LessonPlanPage - Applying filters:", tempFilterConfig);
    updateFilter("subject", tempFilterConfig.subject);
    updateFilter("status", tempFilterConfig.status);
    setShowFilterModal(false);
  }, [tempFilterConfig, updateFilter]);

  const clearFilters = useCallback(() => {
    console.log("LessonPlanPage - Clearing filters");
    setTempFilterConfig({ subject: "", status: "" });
    updateFilter("subject", "");
    updateFilter("status", "");
    setShowFilterModal(false);
  }, [updateFilter]);

  const columns = useMemo(
    () => [
      { header: "Title", accessor: "title", sortable: true, field: "title" },
      { header: "Subject", accessor: "subject", className: "hidden md:table-cell", sortable: true, field: "subject" },
      { header: "Class", accessor: "class", className: "hidden md:table-cell", sortable: true, field: "class" },
      { header: "Date", accessor: "date", sortable: true, field: "date" },
      { header: "Time", accessor: "time", sortable: false },
      { header: "Status", accessor: "status", sortable: true, field: "status" },
      { header: "Actions", accessor: "action" },
    ],
    []
  );

  const renderRow = useCallback(
    (item: LessonPlan) => {
      console.log("LessonPlanPage - Rendering row with item:", item);
      return (
        <tr
          key={item.id}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-100"
        >
          <td className="p-4">{item.title}</td>
          <td className="hidden md:table-cell">{item.subject}</td>
          <td className="hidden md:table-cell">{item.class}</td>
          <td>{format(new Date(item.date), "MMM d, yyyy")}</td>
          <td>{item.startTime && item.endTime ? `${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)}` : "N/A"}</td>
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
              {role !== "teacherTrainee" && item.status !== "APPROVED" && (
                <>
                  <FormModal
                    table="lesson_plan"
                    type="update"
                    data={item}
                    customSubmit={async (data: LessonPlanSchemaType) => {
                      try {
                        await updateLessonPlan(item.id, data);
                        toast.success("Lesson plan updated successfully");
                        fetchLessonPlans(currentPage);
                      } catch (err: any) {
                        toast.error(err.message || "Failed to update lesson plan");
                        throw err;
                      }
                    }}
                    ariaLabel={`Edit lesson plan: ${item.title}`}
                  />
                  <FormModal
                    table="lesson_plan"
                    type="delete"
                    id={item.id}
                    customSubmit={async () => {
                      try {
                        await deleteLessonPlan(item.id);
                        toast.success("Lesson plan deleted successfully");
                        fetchLessonPlans(currentPage);
                      } catch (err: any) {
                        toast.error(err.message || "Failed to delete lesson plan");
                        throw err;
                      }
                    }}
                    ariaLabel={`Delete lesson plan: ${item.title}`}
                  />
                </>
              )}
            </div>
          </td>
        </tr>
      );
    },
    [fetchLessonPlans, currentPage, role]
  );

  const memoizedLessonPlans = useMemo(() => lessonPlans, [lessonPlans]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-4">
        <h1 className="text-lg font-semibold">{traineeId ? "My Lesson Plans" : "All Lesson Plans"}</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Title, Subject..."
            onSearch={setSearchQuery}
            ariaLabel="Search lesson plans"
          />
          {role !== "teacherTrainee" && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  console.log("LessonPlanPage - Opening filter modal");
                  setTempFilterConfig({
                    subject: filterConfig.subject || "",
                    status: filterConfig.status || "",
                  });
                  setShowFilterModal(true);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
                aria-label="Filter lesson plans"
              >
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <button
                onClick={() => {
                  console.log("LessonPlanPage - Toggling sort");
                  toggleSort("title");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"
                aria-label="Sort lesson plans"
              >
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              <FormModal
                table="lesson_plan"
                type="create"
                customSubmit={async (data: LessonPlanSchemaType) => {
                  try {
                    const { lessonPlan } = await createLessonPlan(data);
                    const pdfUrl = await generateLessonPlanPDF(lessonPlan.id, data);
                    window.open(`${API_BASE_URL}${pdfUrl}`, "_blank");
                    toast.success("Lesson plan created and PDF generated!");
                    fetchLessonPlans(1, true);
                  } catch (err: any) {
                    const errorMessage =
                      err.message === "You already have a pending lesson plan. Please submit or delete it first."
                        ? err.message
                        : "Failed to create lesson plan. Please try again.";
                    console.error("LessonPlanPage - Create lesson plan error:", {
                      message: err.message,
                      response: err.response?.data,
                      status: err.response?.status,
                    });
                    toast.error(errorMessage);
                    throw err;
                  }
                }}
                ariaLabel="Create new lesson plan"
              />
              <button
                onClick={() => {
                  console.log("LessonPlanPage - Opening chatbot modal");
                  setShowChatbotModal(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-md hover:from-blue-600 hover:to-indigo-700 transition-colors transform hover:scale-105"
                aria-label="Generate AI lesson plan"
              >
                Generate AI Lesson Plan
              </button>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      {memoizedLessonPlans.length === 0 && !error ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">No lesson plans found.</p>
          {role !== "teacherTrainee" && (
            <FormModal
              table="lesson_plan"
              type="create"
              customSubmit={async (data: LessonPlanSchemaType) => {
                try {
                  const { lessonPlan } = await createLessonPlan(data);
                  const pdfUrl = await generateLessonPlanPDF(lessonPlan.id, data);
                  window.open(`${API_BASE_URL}${pdfUrl}`, "_blank");
                  toast.success("Lesson plan created and PDF generated!");
                  fetchLessonPlans(1, true);
                } catch (err: any) {
                  const errorMessage =
                    err.message === "You already have a pending lesson plan. Please submit or delete it first."
                      ? err.message
                      : "Failed to create lesson plan. Please try again.";
                  console.error("LessonPlanPage - Create lesson plan error:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                  });
                  toast.error(errorMessage);
                  throw err;
                }
              }}
              ariaLabel="Create new lesson plan"
            />
          )}
        </div>
      ) : (
        <>
          <Table
            columns={columns.map((col) => ({
              ...col,
              onSort: col.sortable ? () => toggleSort(col.field || col.accessor) : undefined,
            }))}
            renderRow={renderRow}
            data={memoizedLessonPlans}
          />
          <Pagination
            page={currentPage}
            count={totalCount}
            onPageChange={handlePageChange}
          />
        </>
      )}
      {showFilterModal && role !== "teacherTrainee" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-[90%] md:w-[500px]">
            <h2 className="text-lg font-semibold mb-4">Filter Lesson Plans</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Subject</label>
                <select
                  value={tempFilterConfig.subject}
                  onChange={(e) =>
                    setTempFilterConfig({ ...tempFilterConfig, subject: e.target.value })
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
                  value={tempFilterConfig.status}
                  onChange={(e) =>
                    setTempFilterConfig({ ...tempFilterConfig, status: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by status"
                >
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
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
                    console.log("LessonPlanPage - Closing filter modal");
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
      {showChatbotModal && role !== "teacherTrainee" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] md:w-[800px] max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Generate AI Lesson Plan</h2>
              <button
                onClick={() => {
                  console.log("LessonPlanPage - Closing chatbot modal");
                  setShowChatbotModal(false);
                  setChatQuery("");
                  setChatResponse(null);
                  setTempLessonPlan(null);
                  setConversationId("");
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close chatbot modal"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <p className="text-sm text-gray-600 mb-2">
                  Enter a detailed prompt for your lesson plan, including topic, duration, objectives, and activities.
                </p>
                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10">
                  {"Example: \"Generate a lesson plan for English Language, JSS 3, on Introduction to Verbs, for 40 minutes, including objectives, activities, and resources.\""}
                </div>
              </div>
              <textarea
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="e.g., Generate a lesson plan for English Language, JSS 3, on Introduction to Verbs, for 40 minutes, including objectives, activities, and resources"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                aria-label="Lesson plan prompt"
              />
              <button
                onClick={handleGenerateAILessonPlan}
                disabled={isChatLoading}
                className="self-end bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-colors transform hover:scale-105"
                aria-label="Generate AI lesson plan"
              >
                {isChatLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate"
                )}
              </button>
              {chatResponse && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Lesson Plan (Raw)</h3>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">{chatResponse}</pre>
                </div>
              )}
              {tempLessonPlan && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Edit Lesson Plan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                      <input
                        id="title"
                        value={tempLessonPlan.title || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, title: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Lesson plan title"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                      <select
                        id="subject"
                        value={tempLessonPlan.subject || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, subject: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Lesson plan subject"
                      >
                        <option value="">Select Subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="English Language">English Language</option>
                        <option value="Basic Science">Basic Science</option>
                        <option value="Social Studies">Social Studies</option>
                        <option value="Civic Education">Civic Education</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="class" className="text-sm font-medium text-gray-700">Class</label>
                      <input
                        id="class"
                        value={tempLessonPlan.class || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, class: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Lesson plan class"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="date" className="text-sm font-medium text-gray-700">Date</label>
                      <input
                        id="date"
                        type="date"
                        value={tempLessonPlan.date || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, date: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Lesson plan date"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="startTime" className="text-sm font-medium text-gray-700">Start Time</label>
                      <input
                        id="startTime"
                        type="time"
                        value={tempLessonPlan.startTime || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, startTime: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Lesson plan start time"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="endTime" className="text-sm font-medium text-gray-700">End Time</label>
                      <input
                        id="endTime"
                        type="time"
                        value={tempLessonPlan.endTime || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, endTime: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Lesson plan end time"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="objectives" className="text-sm font-medium text-gray-700">Objectives</label>
                      <textarea
                        id="objectives"
                        value={tempLessonPlan.objectives || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, objectives: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        rows={4}
                        aria-label="Lesson plan objectives"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="activities" className="text-sm font-medium text-gray-700">Activities</label>
                      <textarea
                        id="activities"
                        value={tempLessonPlan.activities || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, activities: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        rows={6}
                        aria-label="Lesson plan activities"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="resources" className="text-sm font-medium text-gray-700">Resources</label>
                      <textarea
                        id="resources"
                        value={tempLessonPlan.resources || ""}
                        onChange={(e) => setTempLessonPlan({ ...tempLessonPlan, resources: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        rows={4}
                        aria-label="Lesson plan resources"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleSaveLessonPlan}
                      disabled={isChatLoading || !tempLessonPlan.startTime || !tempLessonPlan.endTime}
                      className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-md hover:from-green-600 hover:to-teal-700 disabled:opacity-50 transition-colors transform hover:scale-105"
                      aria-label="Save AI lesson plan"
                    >
                      {isChatLoading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        console.log("LessonPlanPage - Closing chatbot modal");
                        setShowChatbotModal(false);
                        setChatQuery("");
                        setChatResponse(null);
                        setTempLessonPlan(null);
                        setConversationId("");
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                      aria-label="Close chatbot modal"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanPage;































