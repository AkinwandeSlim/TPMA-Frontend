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
import Announcements from "@/components/Announcements";
import { toast } from "react-toastify";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { getSupervisorProfile, verifyToken, sendFeedback, getNotifications } from "@/lib/api";
import { formatDate } from "@/lib/utils";

// Type definitions
type Supervisor = {
  id: string;
  staffId: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  sex?: "MALE" | "FEMALE";
  birthday?: string;
  img?: string;
  placeOfSupervision?: string;
  createdAt?: string;
};

type Trainee = {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  placeOfTP?: string;
};

// type LessonPlan = {
//   id: string;
//   title: string;
//   subject: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   status: "PENDING" | "APPROVED" | "REJECTED";
//   createdAt: string;
//   pdfUrl?: string;
//   aiGenerated?: boolean;
//   traineeName?: string;
//   supervisorName?: string;
//   schoolName?: string;
//   content?: string;
// };


type LessonPlan = {
  id: string;
  title: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  pdfUrl?: string | null | undefined; // Updated to allow null to match API response
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
    ?.split("=")[1] || localStorage.getItem("token") || null;
  console.log("getToken:", token ? "present" : "missing");
  return token;
};

const SupervisorProfilePage = () => {
  const router = useRouter();
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [currentTraineePage, setCurrentTraineePage] = useState<number>(1);
  const [totalTraineeCount, setTotalTraineeCount] = useState<number>(0);
  const [totalTraineePages, setTotalTraineePages] = useState<number>(1);
  const [traineeSearchQuery, setTraineeSearchQuery] = useState<string>("");
  const [currentLessonPlanPage, setCurrentLessonPlanPage] = useState<number>(1);
  const [totalLessonPlanCount, setTotalLessonPlanCount] = useState<number>(0);
  const [totalLessonPlanPages, setTotalLessonPlanPages] = useState<number>(1);
  const [lessonPlanSearchQuery, setLessonPlanSearchQuery] = useState<string>("");
  const [isLessonPlanDetailsModalOpen, setIsLessonPlanDetailsModalOpen] = useState(false);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedTraineeForFeedback, setSelectedTraineeForFeedback] = useState<Trainee | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const renderCount = useRef(0);

  renderCount.current += 1;
  console.log(`SupervisorProfilePage rendered ${renderCount.current} times, state=${JSON.stringify({
    currentTraineePage,
    traineeSearchQuery,
    currentLessonPlanPage,
    lessonPlanSearchQuery,
    loading,
    verifying,
    error,
    supervisor: !!supervisor,
    userIdentifier,
  })}`);

  const fetchSupervisorData = useCallback(
    async (
      token: string,
      supervisorId: string,
      traineePage: number = 1,
      traineeQuery: string = "",
      lessonPlanPage: number = 1,
      lessonPlanQuery: string = "",
      isRetry: boolean = false
    ) => {
      console.log(`fetchSupervisorData called: supervisorId=${supervisorId}, traineePage=${traineePage}, traineeQuery=${traineeQuery}, lessonPlanPage=${lessonPlanPage}, lessonPlanQuery=${lessonPlanQuery}, isRetry=${isRetry}, retryCount=${retryCount.current}`);
      try {
        setLoading(true);
        setError(null);

        if (!supervisorId) {
          console.warn("fetchSupervisorData: supervisorId is null, skipping fetch");
          setError("Supervisor identifier missing. Please sign in.");
          return;
        }

        console.log(`Fetching supervisor profile with token=${token ? 'present' : 'missing'}`);
        const supervisorResponse = await getSupervisorProfile(supervisorId);
        if (!supervisorResponse) {
          console.error(`getSupervisorProfile returned null/undefined for supervisorId=${supervisorId}`);
          if (isRetry && retryCount.current < maxRetries) {
            retryCount.current += 1;
            const delay = Math.pow(2, retryCount.current) * 1000;
            console.log(`Retrying fetchSupervisorData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
            setTimeout(() => fetchSupervisorData(token, supervisorId, traineePage, traineeQuery, lessonPlanPage, lessonPlanQuery, true), delay);
            return;
          }
          setError("The requested supervisor could not be found.");
          return;
        }
        console.log(`getSupervisorProfile success:`, supervisorResponse);
        setSupervisor({
          id: supervisorResponse.id,
          staffId: supervisorResponse.staffId,
          name: supervisorResponse.name,
          surname: supervisorResponse.surname,
          email: supervisorResponse.email,
          phone: supervisorResponse.phone,
          address: supervisorResponse.address,
          bloodType: supervisorResponse.bloodType,
          sex: supervisorResponse.sex,
          birthday: supervisorResponse.birthday,
          img: supervisorResponse.img,
          placeOfSupervision: supervisorResponse.placeOfSupervision,
          createdAt: supervisorResponse.createdAt,
        });

        const traineesData = Array.isArray(supervisorResponse.assignedTrainees) ? supervisorResponse.assignedTrainees : [];
        const filteredTrainees = traineeQuery
          ? traineesData.filter((t: Trainee) =>
              `${t.name} ${t.surname}`.toLowerCase().includes(traineeQuery.toLowerCase()) ||
              t.email?.toLowerCase().includes(traineeQuery.toLowerCase())
            )
          : traineesData;
        const itemsPerPage = 5;
        const traineeStart = (traineePage - 1) * itemsPerPage;
        const traineeEnd = traineeStart + itemsPerPage;
        setTrainees(filteredTrainees.slice(traineeStart, traineeEnd));
        setTotalTraineeCount(filteredTrainees.length);
        setTotalTraineePages(Math.max(1, Math.ceil(filteredTrainees.length / itemsPerPage)));

        const lessonPlansData = Array.isArray(supervisorResponse.lessonPlans) ? supervisorResponse.lessonPlans : [];
        const filteredLessonPlans = lessonPlanQuery
          ? lessonPlansData.filter((lp: LessonPlan) =>
              lp.title.toLowerCase().includes(lessonPlanQuery.toLowerCase()) ||
              lp.subject.toLowerCase().includes(lessonPlanQuery.toLowerCase()) ||
              lp.traineeName?.toLowerCase().includes(lessonPlanQuery.toLowerCase())
            )
          : lessonPlansData;
        const lessonPlanStart = (lessonPlanPage - 1) * itemsPerPage;
        const lessonPlanEnd = lessonPlanStart + itemsPerPage;
        setLessonPlans(filteredLessonPlans.slice(lessonPlanStart, lessonPlanEnd));
        setTotalLessonPlanCount(filteredLessonPlans.length);
        setTotalLessonPlanPages(Math.max(1, Math.ceil(filteredLessonPlans.length / itemsPerPage)));

        try {
          const notificationsResponse = await getNotifications(1, undefined, undefined, undefined, undefined);
          setNotifications(notificationsResponse.notifications || []);
        } catch (notifErr: any) {
          console.warn("Failed to fetch notifications:", notifErr.message);
          setNotifications([]);
        }

        retryCount.current = 0;
      } catch (err: any) {
        console.error("Error fetching supervisor data:", err.message, err.stack);
        if (isRetry && retryCount.current < maxRetries) {
          retryCount.current += 1;
          const delay = Math.pow(2, retryCount.current) * 1000;
          console.log(`Retrying fetchSupervisorData in ${delay}ms, attempt ${retryCount.current + 1}/${maxRetries}`);
          setTimeout(() => fetchSupervisorData(token, supervisorId, traineePage, traineeQuery, lessonPlanPage, lessonPlanQuery, true), delay);
          return;
        }
        const errorMessage = err.message || "Failed to fetch supervisor data. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage, { toastId: "fetch-supervisor-error" });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleTraineePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalTraineePages || newPage === currentTraineePage) return;
      console.log(`handleTraineePageChange: newPage=${newPage}`);
      setCurrentTraineePage(newPage);
      const token = getToken();
      if (token && userIdentifier) {
        fetchSupervisorData(token, userIdentifier, newPage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [totalTraineePages, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, fetchSupervisorData, router, userIdentifier]
  );

  const handleLessonPlanPageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalLessonPlanPages || newPage === currentLessonPlanPage) return;
      console.log(`handleLessonPlanPageChange: newPage=${newPage}`);
      setCurrentLessonPlanPage(newPage);
      const token = getToken();
      if (token && userIdentifier) {
        fetchSupervisorData(token, userIdentifier, currentTraineePage, traineeSearchQuery, newPage, lessonPlanSearchQuery);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [totalLessonPlanPages, currentLessonPlanPage, currentTraineePage, traineeSearchQuery, lessonPlanSearchQuery, fetchSupervisorData, router, userIdentifier]
  );

  const handleTraineeSearchSubmit = useCallback(
    (query: string) => {
      console.log(`handleTraineeSearchSubmit: query="${query}", currentTraineeSearchQuery="${traineeSearchQuery}"`);
      if (query === traineeSearchQuery) {
        console.log(`handleTraineeSearchSubmit skipped: query "${query}" matches currentTraineeSearchQuery`);
        return;
      }
      setTraineeSearchQuery(query);
      setCurrentTraineePage(1);
      const token = getToken();
      if (token && userIdentifier) {
        fetchSupervisorData(token, userIdentifier, 1, query, currentLessonPlanPage, lessonPlanSearchQuery);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, fetchSupervisorData, router, userIdentifier]
  );

  const handleLessonPlanSearchSubmit = useCallback(
    (query: string) => {
      console.log(`handleLessonPlanSearchSubmit: query="${query}", currentLessonPlanSearchQuery="${lessonPlanSearchQuery}"`);
      if (query === lessonPlanSearchQuery) {
        console.log(`handleLessonPlanSearchSubmit skipped: query "${query}" matches currentLessonPlanSearchQuery`);
        return;
      }
      setLessonPlanSearchQuery(query);
      setCurrentLessonPlanPage(1);
      const token = getToken();
      if (token && userIdentifier) {
        fetchSupervisorData(token, userIdentifier, currentTraineePage, traineeSearchQuery, 1, query);
      } else {
        setError("Authentication token or user identifier missing. Please sign in.");
        router.push("/auth/signin");
      }
    },
    [lessonPlanSearchQuery, currentTraineePage, traineeSearchQuery, fetchSupervisorData, router, userIdentifier]
  );

  const handleViewLessonPlanDetails = (lessonPlan: LessonPlan) => {
    setSelectedLessonPlan(lessonPlan);
    setIsLessonPlanDetailsModalOpen(true);
  };

  const handleSendFeedback = (trainee: Trainee) => {
    setSelectedTraineeForFeedback(trainee);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (category: string, feedback: string) => {
    try {
      if (!selectedTraineeForFeedback || !supervisor) {
        throw new Error("No trainee or supervisor selected");
      }
      await sendFeedback({
        supervisorId: supervisor.id,
        category,
        feedback,
        traineeId: selectedTraineeForFeedback.id,
      });
      toast.success("Feedback sent to trainee");
      refetch();
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
      await fetchSupervisorData(token, userIdentifier, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, true);
    } else {
      setError("Authentication token or user identifier missing. Please sign in.");
      router.push("/auth/signin");
    }
  }, [currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, fetchSupervisorData, router, userIdentifier]);

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
        setUserIdentifier(response.identifier);

        if (response.role !== "supervisor") {
          console.error("Unauthorized access: role is not supervisor");
          setError("You are not authorized to access this profile.");
          router.push(response.role === "teacherTrainee" ? "/trainees/profile" : "/admins/profile");
          return;
        }

        if (!response.identifier) {
          console.error("No identifier in token response");
          setError("Failed to retrieve user identifier. Please sign in again.");
          router.push("/auth/signin");
          return;
        }

        await fetchSupervisorData(token, response.identifier, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery, true);
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
  }, [router, fetchSupervisorData, currentTraineePage, traineeSearchQuery, currentLessonPlanPage, lessonPlanSearchQuery]);

  const pendingLessonPlansCount = lessonPlans.filter((lp) => lp.status === "PENDING").length;

  if (verifying || loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  if (error || !supervisor) {
    return (
      <div className="p-4 text-red-500 flex flex-col items-center">
        <p>{error || "The requested supervisor could not be found."}</p>
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
          <UserInfoCard user={supervisor} role="supervisor" refetch={refetch} />
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
                <h1 className="text-xl font-semibold">{totalTraineeCount}</h1>
                <span className="text-sm text-gray-400">Supervised Trainees</span>
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
                <h1 className="text-xl font-semibold">{supervisor.placeOfSupervision || "N/A"}</h1>
                <span className="text-sm text-gray-400">Place of Supervision</span>
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
                <h1 className="text-xl font-semibold">{totalLessonPlanCount}</h1>
                <span className="text-sm text-gray-400">Lesson Plans Reviewed</span>
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
                <h1 className="text-xl font-semibold">{pendingLessonPlansCount}</h1>
                <span className="text-sm text-gray-400">Pending Lesson Plans</span>
              </div>
            </div>
          </div>
        </div>
        {/* SUPERVISORY ASSIGNMENT CARD */}
        <div className="mt-4 bg-white rounded-md p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Supervisory Assignment</h2>
          {totalTraineeCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Supervised Trainees</p>
                <p className="text-lg font-medium">{totalTraineeCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Place of Supervision</p>
                <p className="text-lg font-medium">{supervisor.placeOfSupervision || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-lg font-medium">{formatDate(supervisor.createdAt)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Image
                src="/stockout.png"
                alt="No Assignment"
                width={120}
                height={120}
                className="mx-auto mb-4"
                style={{ width: "auto", height: "auto" }}
              />
              <p className="text-gray-500 text-lg">No supervisory assignment yet.</p>
            </div>
          )}
        </div>
        {/* TRAINEES SECTION */}
        <div className="mt-4 bg-white p-4 rounded-md shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Assigned Trainees</h2>
              {totalTraineeCount > 0 && (
                <p className="text-sm text-blue-500 mt-1">
                  You are supervising {totalTraineeCount} trainees.
                </p>
              )}
            </div>
            <TableSearch placeholder="Search trainees..." onSearch={handleTraineeSearchSubmit} />
          </div>
          {trainees.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Image
                src="/stockout.png"
                alt="No trainees"
                width={120}
                height={120}
                className="mx-auto mb-4"
                style={{ width: "auto", height: "auto" }}
              />
              <p className="text-gray-500 text-lg">No trainees assigned.</p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {trainees.map((trainee) => (
                  <li
                    key={trainee.id}
                    className="p-4 bg-gray-50 border-l-4 border-blue-400 rounded-md flex items-start space-x-3 hover:bg-opacity-90 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">{trainee.name} {trainee.surname}</p>
                      <p className="text-xs text-gray-600 mt-1">Email: {trainee.email || "N/A"}</p>
                      <p className="text-xs text-gray-600">Place of TP: {trainee.placeOfTP || "N/A"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/list/trainees/${trainee.id}`)}
                        className="p-1 rounded-full bg-blue-300 hover:bg-blue-400 focus:ring-2 focus:ring-blue-200"
                        aria-label="View trainee profile"
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
                        onClick={() => handleSendFeedback(trainee)}
                        className="p-1 rounded-full bg-pink-300 hover:bg-pink-400 focus:ring-2 focus:ring-pink-200"
                        aria-label="Send feedback"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={currentTraineePage} count={totalTraineeCount} onPageChange={handleTraineePageChange} />
            </>
          )}
        </div>
        {/* LESSON PLANS SECTION */}
        <div className="mt-4 bg-white p-4 rounded-md shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Lesson Plans to Review</h2>
              {pendingLessonPlansCount > 0 && (
                <p className="text-sm text-blue-500 mt-1">
                  You have {pendingLessonPlansCount} pending lesson plans.
                </p>
              )}
            </div>
            <TableSearch placeholder="Search lesson plans..." onSearch={handleLessonPlanSearchSubmit} />
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
                        <p className="text-xs text-gray-600">Trainee: {lp.traineeName || "N/A"}</p>
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
              <Pagination page={currentLessonPlanPage} count={totalLessonPlanCount} onPageChange={handleLessonPlanPageChange} />
            </>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* SHORTCUTS */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h1 className="text-xl font-semibold">Quick Actions</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky flex items-center gap-2"
              href={`/list/trainees?supervisorId=${supervisor.id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Trainees
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky flex items-center gap-2"
              href={`/list/schedules?supervisorId=${supervisor.id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Schedules
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow flex items-center gap-2"
              href={`/supervisor/report?supervisorId=${supervisor.id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m0-2v-2m0-2V7m-4 5h8m4 0h4m-4 0v6m0-12v6" />
              </svg>
              Generate Report
            </Link>
          </div>
        </div>
{/*        <Notifications
          notifications={notifications}
          userIdentifier={supervisor.id}
          loading={loading}
          setLoading={setLoading}
          setNotifications={setNotifications}
        />*/}






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
      {selectedTraineeForFeedback && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
          traineeName={`${selectedTraineeForFeedback.name} ${selectedTraineeForFeedback.surname}`}
        />
      )}
    </div>
  );
};

export default SupervisorProfilePage;