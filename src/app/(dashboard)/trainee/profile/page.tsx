"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import UserInfoCard from "@/components/UserInfoCard";
// import Notifications from "@/components/Notifications";
import LessonPlanDetailsModal from "@/components/LessonPlanDetailsModal";
import FeedbackModal from "@/components/FeedbackModal";
import Performance from "@/components/Performance";
import Announcements from "@/components/Announcements";
import { toast } from "react-toastify";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { getTraineeProfile, getTraineeLessons, getNotifications, verifyToken, API_BASE_URL } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Trainee = {
  id: string;
  regNo: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  img?: string;
  sex?: string;
  birthday?: string;
  progress?: string | number;
  createdAt?: string;
  address?: string;
  bloodType?: string;
  placeOfTP?: string;
  supervisorId?: string;
  tpAssignment?: {
    supervisorName: string;
    placeOfTP: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  lessonPlans?: LessonPlan[];
};

type LessonPlan = {
  id: string;
  title: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: string;
  pdfUrl?: string;
  aiGenerated?: boolean;
  traineeName?: string;
  supervisorName?: string;
  schoolName?: string;
  content?: string;
};

type Notification = {
  id: string;
  user_id: string;
  initiator_id: string;
  event_id?: string;
  type: string;
  priority: string;
  message: string;
  created_at: string;
  read_status: boolean;
};

type Supervisor = {
  id: string;
  staffId: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address: string;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  birthday: string;
  img?: string;
  placeOfSupervision?: string;
};

type Lesson = {
  id: number;
  supervisorId: string;
  className: string;
  subject: string;
  startTime: string;
  endTime: string;
};

// Mock data (unchanged)
const mockTrainee: Trainee = {
  id: "trainee-139",
  regNo: "TRN001",
  name: "Jane",
  surname: "Smith",
  email: "jane.smith@example.com",
  phone: "+1234567890",
  img: "/avatar-jane.png",
  sex: "FEMALE",
  birthday: "1998-05-15",
  progress: 85,
  createdAt: "2024-01-10",
  address: "456 Elm St",
  bloodType: "A+",
  placeOfTP: "Springfield High School",
  supervisorId: "supervisor-1",
  tpAssignment: {
    supervisorName: "John Doe",
    placeOfTP: "Springfield High School",
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    status: "ASSIGNED",
  },
};

const mockSupervisor: Supervisor = {
  id: "supervisor-1",
  staffId: "STAFF001",
  name: "John",
  surname: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  address: "123 Main St",
  bloodType: "O+",
  sex: "MALE",
  birthday: "1980-01-01",
  img: "/noAvatar.png",
  placeOfSupervision: "Springfield High School",
};

const mockLessons: Lesson[] = [
  {
    id: 1,
    supervisorId: "supervisor-1",
    className: "Grade 10A",
    subject: "Mathematics",
    startTime: "2025-04-07T09:00:00Z",
    endTime: "2025-04-07T10:00:00Z",
  },
  {
    id: 2,
    supervisorId: "supervisor-1",
    className: "Grade 11B",
    subject: "English",
    startTime: "2025-04-08T11:00:00Z",
    endTime: "2025-04-08T12:00:00Z",
  },
];

const mockLessonPlans: LessonPlan[] = [
  {
    id: "lp-1",
    title: "Algebra Basics",
    subject: "Mathematics",
    date: "2025-04-07",
    startTime: "2025-04-07T09:00:00Z",
    endTime: "2025-04-07T10:00:00Z",
    status: "APPROVED",
    createdAt: "2025-04-01T10:00:00Z",
    pdfUrl: "/lesson-plan-1.pdf",
    aiGenerated: false,
    traineeName: "Jane Smith",
    supervisorName: "John Doe",
    schoolName: "Springfield High School",
    content: "Introduction to algebra concepts.",
  },
  {
    id: "lp-2",
    title: "Poetry Analysis",
    subject: "English",
    date: "2025-04-08",
    startTime: "2025-04-08T11:00:00Z",
    endTime: "2025-04-08T12:00:00Z",
    status: "PENDING",
    createdAt: "2025-04-02T12:00:00Z",
    pdfUrl: "/lesson-plan-2.pdf",
    aiGenerated: true,
    traineeName: "Jane Smith",
    supervisorName: "John Doe",
    schoolName: "Springfield High School",
    content: "Analysis of modern poetry.",
  },
];

const getLessonPlanStyles = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        bg: "bg-yellow-50",
        border: "border-l-4 border-yellow-400",
        dot: "bg-yellow-400",
        text: "text-yellow-800",
      };
    case "SUBMITTED":
      return {
        bg: "bg-blue-50",
        border: "border-l-4 border-blue-400",
        dot: "bg-blue-400",
        text: "text-blue-800",
      };
    case "APPROVED":
      return {
        bg: "bg-green-50",
        border: "border-l-4 border-green-400",
        dot: "bg-green-400",
        text: "text-green-800",
      };
    case "REJECTED":
      return {
        bg: "bg-red-50",
        border: "border-l-4 border-red-400",
        dot: "bg-red-400",
        text: "text-red-800",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-l-4 border-gray-400",
        dot: "bg-gray-400",
        text: "text-gray-800",
      };
  }
};

const getToken = (): string | null => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1] || null;
  console.log("getToken:", token ? "present" : "missing");
  return token;
};

const TraineeProfilePage = () => {
  const router = useRouter();
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLessonPlanDetailsModalOpen, setIsLessonPlanDetailsModalOpen] = useState(false);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const renderCount = useRef(0);

  renderCount.current += 1;
  console.log(`TraineeProfilePage rendered ${renderCount.current} times, state=${JSON.stringify({
    currentPage,
    searchQuery,
    loading,
    verifying,
    error,
    trainee: !!trainee,
    userIdentifier,
  })}`);

  const fetchTraineeData = useCallback(
    async (token: string, page: number = 1, query: string = "", isRetry: boolean = false) => {
      console.log(`fetchTraineeData called: page=${page}, query=${query}, isRetry=${isRetry}, retryCount=${retryCount.current}`);
      try {
        setLoading(true);
        setError(null);

        if (userIdentifier === "trainee-139") {
          setTrainee(mockTrainee);
          setLessonPlans(mockLessonPlans);
          setLessons(mockLessons);
          setSupervisor(mockSupervisor);
          setNotifications([]);
          setTotalCount(mockLessonPlans.length);
          setTotalPages(1);
          setLoading(false);
          return;
        }

        if (!userIdentifier) {
          console.warn("fetchTraineeData: userIdentifier is null, skipping fetch");
          return;
        }

        console.log(`Fetching trainee profile with token=${token ? 'present' : 'missing'}`);
        const traineeResponse = await getTraineeProfile();
        if (!traineeResponse) {
          console.error(`getTraineeProfile returned null/undefined`);
          if (isRetry && retryCount.current < maxRetries) {
            retryCount.current += 1;
            const delay = Math.pow(2, retryCount.current) * 1000;
            console.log(`Retrying fetchTraineeData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
            setTimeout(() => fetchTraineeData(token, page, query, true), delay);
            return;
          }
          setError("The requested trainee could not be found.");
          return;
        }
        console.log(`getTraineeProfile success:`, traineeResponse);
        setTrainee(traineeResponse);

        const lessonsData = await getTraineeLessons(userIdentifier, page, 5);
        setLessonPlans(
          (lessonsData.lessonPlans || []).map((lp: any) => ({
            ...lp,
            status: ["PENDING", "SUBMITTED", "APPROVED", "REJECTED"].includes(lp.status)
              ? lp.status
              : "PENDING",
          }))
        );
        setTotalCount(lessonsData.totalCount || 0);
        setTotalPages(lessonsData.totalPages || 1);

        const notificationsData = await getNotifications(1, undefined, undefined, undefined, undefined);
        setNotifications(notificationsData.notifications || []);

        setSupervisor(traineeResponse.supervisorId ? mockSupervisor : null);
        // setLessons(
        //   lessonsData.lessonPlans.length > 0
        //     ? lessonsData.lessonPlans.map((lp: LessonPlan, index: number) => ({
        //         id: index + 1,
        //         supervisorId: traineeResponse.supervisorId || "unknown",
        //         className: lp.schoolName || "Unknown Class",
        //         subject: lp.subject,
        //         startTime: lp.startTime,
        //         endTime: lp.endTime,
        //       }))
        //     : mockLessons
        // );


        setLessons(
          lessonPlans.length > 0
            ? lessonPlans.map((lp: LessonPlan, index: number) => ({
                id: index + 1,
                supervisorId: traineeResponse.supervisorId || "unknown",
                className: lp.schoolName || "Unknown Class",
                subject: lp.subject,
                startTime: lp.startTime,
                endTime: lp.endTime,
              }))
            : mockLessons
        );


        retryCount.current = 0;
      } catch (err: any) {
        console.error("Error fetching trainee data:", err.message, err.stack);
        if (isRetry && retryCount.current < maxRetries) {
          retryCount.current += 1;
          const delay = Math.pow(2, retryCount.current) * 1000;
          console.log(`Retrying fetchTraineeData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
          setTimeout(() => fetchTraineeData(token, page, query, true), delay);
          return;
        }
        const errorMessage = err.message || "Failed to fetch trainee data. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage, { toastId: "fetch-trainee-error" });
      } finally {
        setLoading(false);
      }
    },
    [userIdentifier]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
      console.log(`handlePageChange: newPage=${newPage}`);
      setCurrentPage(newPage);
      const token = getToken();
      if (token && userIdentifier) {
        fetchTraineeData(token, newPage, searchQuery);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [totalPages, currentPage, searchQuery, fetchTraineeData, router, userIdentifier]
  );

  const handleSearchSubmit = useCallback(
    (query: string) => {
      console.log(`handleSearchSubmit: query="${query}", currentSearchQuery="${searchQuery}"`);
      if (query === searchQuery) {
        console.log(`handleSearchSubmit skipped: query "${query}" matches currentSearchQuery`);
        return;
      }
      setSearchQuery(query);
      setCurrentPage(1);
      const token = getToken();
      if (token && userIdentifier) {
        fetchTraineeData(token, 1, query);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [searchQuery, fetchTraineeData, router, userIdentifier]
  );

  const handleViewLessonPlanDetails = (lessonPlan: LessonPlan) => {
    setSelectedLessonPlan(lessonPlan);
    setIsLessonPlanDetailsModalOpen(true);
  };

  const handleGenerateTraineeReport = async () => {
    try {
      const token = getToken();
      if (!token || !userIdentifier) {
        throw new Error("Authentication token or user identifier missing");
      }

      const response = await fetch(`${API_BASE_URL}/api/trainees/${encodeURIComponent(userIdentifier)}/report`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `trainee_${userIdentifier}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Trainee report generated successfully");
    } catch (err: any) {
      console.error("Error generating trainee report:", err);
      toast.error("Failed to generate trainee report.");
    }
  };

  const handleFeedbackSubmit = async (category: string, feedback: string) => {
    try {
      const token = getToken();
      if (!token || !trainee || !userIdentifier) {
        throw new Error("Authentication token, trainee, or user identifier missing");
      }

      await fetch(`${API_BASE_URL}/api/trainees/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          traineeId: userIdentifier,
          category,
          feedback,
        }),
      });

      toast.success("Feedback submitted successfully");
      await refetch();
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      toast.error("Failed to submit feedback.");
    }
  };

  const refetch = useCallback(async () => {
    console.log("refetch triggered");
    const token = getToken();
    if (token && userIdentifier) {
      retryCount.current = 0;
      await fetchTraineeData(token, currentPage, searchQuery, true);
    } else {
      setError("Authentication token or user identifier missing. Please sign in.");
      router.push("/auth/signin");
    }
  }, [currentPage, searchQuery, fetchTraineeData, router, userIdentifier]);

  useEffect(() => {
    console.log("useEffect: Verifying and fetching data");
    const verifyAndFetch = async () => {
      try {
        setVerifying(true);
        setError(null);

        const token = getToken();
        if (!token) {
          console.error("No token found");
          setError("Please sign in to view this page.");
          router.push("/auth/signin");
          return;
        }

        console.log("Verifying token");
        const response = await verifyToken();
        console.log("verifyToken response:", response);
        setRole(response.role);
        setUserIdentifier(response.identifier);

        if (response.role !== "teacherTrainee") {
          console.error("Unauthorized access: role is not teacherTrainee");
          setError("You are not authorized to access this profile.");
          router.push(response.role === "supervisor" ? "/supervisors/profile" : "/admins/profile");
          return;
        }

        if (!response.identifier) {
          console.error("No identifier in token response");
          setError("Failed to retrieve user identifier. Please sign in again.");
          router.push("/auth/signin");
          return;
        }

        await fetchTraineeData(token, currentPage, searchQuery, true);
      } catch (err: any) {
        console.error("Verification error:", err.message, err.stack);
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
  }, [router, fetchTraineeData, currentPage, searchQuery]);

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
  ];
  const days = ["April 07", "April 08", "April 09", "April 10", "April 11"];
  const startDate = new Date("2025-04-07");

  const getLessonForSlot = (dayIndex: number, timeSlot: string) => {
    const slotHour =
      parseInt(timeSlot.split(":")[0]) +
      (timeSlot.includes("PM") && timeSlot !== "12:00 PM" ? 12 : 0);
    const slotDate = new Date(startDate);
    slotDate.setDate(startDate.getDate() + dayIndex);
    slotDate.setHours(slotHour, 0, 0, 0);

    return lessons.find((lesson) => {
      const lessonStart = new Date(lesson.startTime);
      return (
        lessonStart.getDate() === slotDate.getDate() &&
        lessonStart.getMonth() === slotDate.getMonth() &&
        lessonStart.getFullYear() === slotDate.getFullYear() &&
        lessonStart.getHours() === slotDate.getHours()
      );
    });
  };

  const pendingLessonPlansCount = lessonPlans.filter((lp) => lp.status === "PENDING").length;

  if (verifying || loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  if (error || !trainee) {
    return (
      <div className="p-4 text-red-500 flex flex-col items-center">
        <p>{error || "The requested trainee could not be found."}</p>
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
              onClick={refetch}
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
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          <UserInfoCard user={trainee} role="teacherTrainee" refetch={refetch} />
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
                style={{ width: "auto", height: "auto" }}
              />
              <div>
                <h1 className="text-xl font-semibold">{trainee.progress || 0}%</h1>
                <span className="text-sm text-gray-400">Progress</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
                style={{ width: "auto", height: "auto" }}
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {trainee.tpAssignment?.placeOfTP || trainee.placeOfTP || "N/A"}
                </h1>
                <span className="text-sm text-gray-400">Place of TP</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
                style={{ width: "auto", height: "auto" }}
              />
              <div>
                <h1 className="text-xl font-semibold">{lessons.length}</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
                style={{ width: "auto", height: "auto" }}
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {supervisor ? `${supervisor.name} ${supervisor.surname}` : "Not Assigned"}
                </h1>
                <span className="text-sm text-gray-400">Supervisor</span>
              </div>
            </div>
          </div>
        </div>
        {/* TP ASSIGNMENT CARD */}
        <div className="mt-4 bg-white rounded-md p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Teaching Practice Assignment</h2>
          {trainee.tpAssignment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-medium text-green-600">{trainee.tpAssignment.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Place of TP</p>
                <p className="text-lg font-medium">{trainee.tpAssignment.placeOfTP}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supervisor</p>
                <p className="text-lg font-medium">{trainee.tpAssignment.supervisorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-medium">
                  {formatDate(trainee.tpAssignment.startDate)} - {formatDate(trainee.tpAssignment.endDate)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Image
                src="/stockout.png"
                alt="No TP Assignment"
                width={120}
                height={120}
                className="mx-auto mb-4"
                style={{ width: "auto", height: "auto" }}
              />
              <p className="text-gray-500 text-lg">No Teaching Practice assigned yet.</p>
            </div>
          )}
        </div>
        {/* SCHEDULE TABLE */}
        <div className="mt-4 bg-white rounded-md p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">{"Trainee's Schedule"}</h1>
            <div className="text-sm text-gray-500">
              {days[0]} - {days[days.length - 1]}
            </div>
          </div>
          {lessons.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No lessons scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-gray-200"></th>
                    {days.map((day, index) => (
                      <th key={index} className="p-2 border border-gray-200 text-center text-sm font-medium">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={timeIndex}>
                      <td className="p-2 border border-gray-200 text-sm font-medium">{time}</td>
                      {days.map((_, dayIndex) => {
                        const lesson = getLessonForSlot(dayIndex, time);
                        return (
                          <td key={dayIndex} className="p-2 border border-gray-200 text-center">
                            {lesson ? (
                              <div className="bg-blue-100 rounded-md p-2 text-sm">
                                {lesson.className} - {lesson.subject}
                              </div>
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* LESSON PLANS SECTION */}
        <div className="mt-4 bg-white p-4 rounded-md shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Lesson Plans</h2>
              {pendingLessonPlansCount > 0 && (
                <p className="text-sm text-blue-500 mt-1">
                  You have {pendingLessonPlansCount} pending lesson plans.
                </p>
              )}
            </div>
            <TableSearch placeholder="Search lesson plans..." onSearch={handleSearchSubmit} />
          </div>
          {lessonPlans.length === 0 ? (
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
              <ul className="space-y-3">
                {lessonPlans.map((lp) => {
                  const styles = getLessonPlanStyles(lp.status);
                  return (
                    <li
                      key={lp.id}
                      className={`p-4 ${styles.bg} ${styles.border} rounded-md flex items-start space-x-3 hover:bg-opacity-90 transition-colors`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-2`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium">{lp.title || "N/A"}</p>
                        <p className="text-xs text-gray-600 mt-1">Subject: {lp.subject || "N/A"}</p>
                        <p className="text-xs text-gray-600">Date: {lp.date || "N/A"}</p>
                        <p className="text-xs text-gray-600">
                          Time: {formatDate(lp.startTime)} - {formatDate(lp.endTime)}
                        </p>
                        <p className="text-xs mt-1">
                          <span className={styles.text}>{lp.status}</span> •{" "}
                          <span className="text-gray-600">{formatDate(lp.createdAt)}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewLessonPlanDetails(lp)}
                          className="p-1 rounded-full bg-blue-300 hover:bg-blue-400 focus:ring-2 focus:ring-blue-200"
                          aria-label="View lesson plan details"
                        >
                          <Image
                            src="/view.png"
                            alt="View"
                            width={20}
                            height={20}
                            style={{ width: "auto", height: "auto" }}
                          />
                        </button>
                        <button
                          onClick={() => router.push(`/list/lesson-plans/${lp.id}`)}
                          className="p-1 rounded-full bg-blue-300 hover:bg-blue-400 focus:ring-2 focus:ring-blue-200"
                          aria-label="View lesson plan"
                        >
                          <Image
                            src="/view.png"
                            alt="View"
                            width={20}
                            height={20}
                            style={{ width: "auto", height: "auto" }}
                          />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pagination page={currentPage} count={totalCount} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* SHORTCUTS */}
        <div className="bg-white p-4 rounded-md shadow-md">
        <h1 className="text-xl font-semibold">Shortcuts</h1>
        <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            {role === "teacherTrainee" ? (
            <>
                <Link
                className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky flex items-center gap-2"
                href={`/list/lessonplans?traineeId=${trainee.id}`}
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Lesson Plans
                </Link>
                <Link
                className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky flex items-center gap-2"
                href={`/list/notifications?traineeId=${trainee.id}`}
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                </svg>
                Notifications
                </Link>
                {supervisor ? (
                <Link
                    className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple flex items-center gap-2"
                    href={`/list/supervisors/${supervisor.id}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    My Supervisor
                </Link>
                ) : (
                <span className="p-3 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    My Supervisor
                </span>
                )}
                <button
                onClick={() => router.push(`/list/feedback?traineeId=${trainee.id}`)}
                className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 flex items-center gap-2"
                >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                View Feedback
                </button>
            </>
            ) : (
            <>
                <Link
                className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky flex items-center gap-2"
                href={`/list/lessonplans?traineeId=${trainee.id}`}
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Trainee Lesson Plans
                </Link>
                <button
                onClick={handleGenerateTraineeReport}
                className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow flex items-center gap-2"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m0-2v-2m0-2V7m-4 5h8m4 0h4m-4 0v6m0-12v6" />
                </svg>
                Generate Trainee Report
                </button>
                <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 flex items-center gap-2"
                >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                Submit Feedback
                </button>
            </>
            )}
        </div>
        </div>

        <Performance />

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
      {selectedLessonPlan && (
        <LessonPlanDetailsModal
          isOpen={isLessonPlanDetailsModalOpen}
          onClose={() => setIsLessonPlanDetailsModalOpen(false)}
          lessonPlan={selectedLessonPlan}
        />
      )}
      {trainee && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
          traineeName={`${trainee.name} ${trainee.surname}`}
        />
      )}
    </div>
  );
};

export default TraineeProfilePage;






























