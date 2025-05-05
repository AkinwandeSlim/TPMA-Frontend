"use client";

import Announcements from "@/components/Announcements";
import Performance from "@/components/Performance";
import FormModal from "@/components/FormModal";
import TraineeDetailsModal from "@/components/TraineeDetailsModal";
import FeedbackHistoryModal from "@/components/FeedbackHistoryModal";
import LessonPlanDetailsModal from "@/components/LessonPlanDetailsModal";
import FeedbackModal from "@/components/FeedbackModal";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChatBubbleLeftIcon, ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";

type Supervisor = {
  id: string;
  staffId: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address: string;
  bloodType?: string;
  sex?: "MALE" | "FEMALE";
  birthday?: string;
  img?: string;
  placeOfSupervision?: string;
  assignedTrainees: {
    id: string;
    regNo: string;
    name: string;
    surname: string;
    email?: string;
    phone?: string;
    img?: string;
    progress?: number;
  }[];
  lessonPlans: {
    id: string;
    traineeId: string;
    traineeName: string;
    subject: string;
    className: string;
    createdAt: string;
    submittedAt: string | null;
    status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED";
    feedback?: string;
    content: string;
    schoolName?: string;
  }[];
  schedules: {
    id: string;
    lesson_plan_id: string;
    traineeId: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    created_at: string;
  }[];
};

type Trainee = {
  id: string;
  regNo: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  img?: string;
  progress?: number;
};

type Lesson = {
  id: number;
  supervisorId: string;
  className: string;
  subject: string;
  startTime: string;
  endTime: string;
};

type LessonPlan = {
  id: string;
  traineeId: string;
  traineeName: string;
  subject: string;
  className: string;
  createdAt: string;
  submittedAt: string | null;
  status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED";
  feedback?: string;
  content: string;
  schoolName?: string;
};

type Feedback = {
  category: string;
  feedback: string;
  submittedAt: string;
};

const SingleSupervisorPage = ({ params: { id } }: { params: { id: string } }) => {
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [supervisedTraineesCount, setSupervisedTraineesCount] = useState<number>(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [pendingLessonPlansCount, setPendingLessonPlansCount] = useState<number>(0);
  const [averageTraineeProgress, setAverageTraineeProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedTraineeForFeedback, setSelectedTraineeForFeedback] = useState<Trainee | null>(null);
  const [isLessonPlanDetailsModalOpen, setIsLessonPlanDetailsModalOpen] = useState(false);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewLessonPlanId, setReviewLessonPlanId] = useState<string | null>(null);
  const router = useRouter();

  const formatDate = (dateString?: string | null): string => {
    if (!dateString || typeof dateString !== "string") {
      return "Date unavailable";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  const fetchSupervisorData = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const [
        supervisorRes,
        traineesCountRes,
        lessonsRes,
        lessonPlansRes,
        pendingPlansRes,
        progressRes,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/supervisors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/supervisors/${id}/trainees-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/lessons/supervisor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/supervisors/${id}/lesson-plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/supervisors/${id}/lesson-plans?status=PENDING`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/supervisors/${id}/trainees-average-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!supervisorRes.ok) {
        throw new Error("Supervisor not found");
      }
      const supervisorData = await supervisorRes.json();
      setSupervisor({
        ...supervisorData,
        assignedTrainees: supervisorData.assignedTrainees || [],
        lessonPlans: (supervisorData.lessonPlans || []).map((plan: any) => ({
          ...plan,
          traineeName: plan.traineeName || "Unknown",
          createdAt: plan.createdAt || plan.submittedAt || new Date().toISOString(),
          submittedAt: plan.submittedAt || null,
          schoolName: plan.schoolName || undefined,
        })),
        schedules: supervisorData.schedules || [],
      });

      if (!traineesCountRes.ok) {
        throw new Error("Failed to fetch trainees count");
      }
      const traineesCountData = await traineesCountRes.json();
      setSupervisedTraineesCount(traineesCountData.count || 0);

      if (!lessonsRes.ok) {
        throw new Error("Failed to fetch lessons");
      }
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData.lessons || []);

      if (!lessonPlansRes.ok) {
        throw new Error("Failed to fetch lesson plans");
      }
      const lessonPlansData = await lessonPlansRes.json();
      console.log("Lesson Plans - Raw Data:", lessonPlansData);
      const plans = lessonPlansData.lessonPlans || [];
      setLessonPlans(
        plans.map((plan: any) => ({
          ...plan,
          traineeName: plan.traineeName || "Unknown",
          createdAt: plan.createdAt || plan.submittedAt || new Date().toISOString(),
          submittedAt: plan.submittedAt || null,
          schoolName: plan.schoolName || undefined,
        }))
      );

      if (!pendingPlansRes.ok) {
        throw new Error("Failed to fetch pending lesson plans");
      }
      const pendingPlansData = await pendingPlansRes.json();
      console.log("Pending Lesson Plans - Raw Data:", pendingPlansData);
      setPendingLessonPlansCount(pendingPlansData.lessonPlans?.length || 0);

      if (!progressRes.ok) {
        throw new Error("Failed to fetch trainee progress");
      }
      const progressData = await progressRes.json();
      setAverageTraineeProgress(progressData.averageProgress || 0);
    } catch (err: any) {
      console.error("Error fetching supervisor data:", err);
      setError(err.message === "Supervisor not found" ? err.message : "Failed to fetch supervisor data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        setError("Authentication token not found. Please sign in.");
        return;
      }

      await fetchSupervisorData(token);
    } catch (err: any) {
      console.error("Error refetching supervisor data:", err);
      setError("Failed to refresh supervisor data.");
    }
  };

  const handleSendFeedback = (trainee: Trainee) => {
    setSelectedTraineeForFeedback(trainee);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (category: string, feedback: string) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token || !selectedTraineeForFeedback) {
        throw new Error("Authentication token or trainee missing");
      }

      const response = await fetch(`${API_BASE_URL}/api/supervisors/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supervisorId: id,
          category,
          feedback,
          traineeId: selectedTraineeForFeedback.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }

      toast.success("Feedback sent to trainee");
      await refetch();
    } catch (err: any) {
      console.error("Error sending feedback:", err);
      toast.error("Failed to send feedback.");
    } finally {
      setIsFeedbackModalOpen(false);
      setSelectedTraineeForFeedback(null);
    }
  };

  const handleViewLessonPlanDetails = (lessonPlan: LessonPlan) => {
    setSelectedLessonPlan(lessonPlan);
    setIsLessonPlanDetailsModalOpen(true);
  };

  const handleReviewLessonPlan = async (lessonPlanId: string, feedback: string, status: "APPROVED" | "REJECTED") => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/lesson-plans/${lessonPlanId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback, status, supervisorId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to review lesson plan");
      }

      toast.success("Lesson plan reviewed successfully");
      await refetch();
    } catch (err: any) {
      console.error("Error reviewing lesson plan:", err);
      toast.error("Failed to review lesson plan.");
    } finally {
      setIsReviewFormOpen(false);
      setReviewLessonPlanId(null);
    }
  };

  const handleGenerateSupervisorReport = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/supervisors/${id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `supervisor_${id}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Supervisor report generated successfully");
    } catch (err: any) {
      console.error("Error generating supervisor report:", err);
      toast.error("Failed to generate supervisor report.");
    }
  };

  useEffect(() => {
    const verifyAndFetch = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          setError("Please sign in to view this page.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Token verification failed");
        }

        const data = await response.json();
        setRole(data.role || "supervisor");
        await fetchSupervisorData(token);
      } catch (err: any) {
        console.error("Verification error:", err);
        setError("Failed to verify session. Please sign in.");
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [id, fetchSupervisorData]);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
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

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
        <button
          onClick={() => router.push("/auth/signin")}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In
        </button>
        <button
          onClick={refetch}
          className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!supervisor) {
    return <div className="p-4">Supervisor not found</div>;
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={supervisor.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {supervisor.name} {supervisor.surname}
                </h1>
                {role === "admin" && (
                  <FormModal
                    table="supervisor"
                    type="update"
                    data={supervisor}
                    refetch={refetch}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{supervisor.bloodType || "N/A"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {supervisor.birthday
                      ? new Intl.DateTimeFormat("en-GB").format(new Date(supervisor.birthday))
                      : "N/A"}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{supervisor.email || "N/A"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{supervisor.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{supervisedTraineesCount}</h1>
                <span className="text-sm text-gray-400">Supervised Trainees</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{lessons.length}</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{supervisor.placeOfSupervision || "N/A"}</h1>
                <span className="text-sm text-gray-400">Place of Supervision</span>
              </div>
            </div>
          </div>
        </div>
        {/* SCHEDULE TABLE */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">{"Supervisor's Schedule"}</h1>
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
        {/* LESSON PLANS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h1 className="text-xl font-semibold">Lesson Plans to Review</h1>
          {pendingLessonPlansCount > 0 && (
            <p className="text-sm text-blue-500 mb-2">
              You have {pendingLessonPlansCount} pending lesson plans to review.
            </p>
          )}
          {lessonPlans.length > 0 ? (
            <div className="mt-4 flex flex-col gap-4">
              {lessonPlans.map((lessonPlan) => (
                <div
                  key={lessonPlan.id}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="flex-1 flex flex-col">
                    <span className="font-semibold text-sm">
                      {lessonPlan.traineeName} - {lessonPlan.subject} ({lessonPlan.className})
                    </span>
                    <span className="text-xs text-gray-500">
                      Submitted: {formatDate(lessonPlan.createdAt)}
                    </span>
                    <span className="text-xs text-gray-500">Status: {lessonPlan.status}</span>
                    {lessonPlan.feedback && (
                      <span className="text-xs text-gray-500">Feedback: {lessonPlan.feedback}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewLessonPlanDetails(lessonPlan)}
                      className="bg-gray-500 text-white p-1 rounded-md text-xs hover:bg-gray-600"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {lessonPlan.status === "PENDING" && (
                      <button
                        onClick={() => {
                          setReviewLessonPlanId(lessonPlan.id);
                          setIsReviewFormOpen(true);
                        }}
                        className="bg-blue-500 text-white p-1 rounded-md text-xs hover:bg-blue-600"
                        title="Review"
                      >
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              No lesson plans available. Trainee-generated lesson plans will be implemented soon.
            </p>
          )}
        </div>
        {/* TRAINEES LIST */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h1 className="text-xl font-semibold">Supervised Trainees</h1>
          {supervisor.assignedTrainees?.length > 0 ? (
            <div className="mt-4 flex flex-col gap-4">
              {supervisor.assignedTrainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="flex-1 flex flex-col">
                    <span className="font-semibold text-sm">
                      {trainee.name} {trainee.surname}
                    </span>
                    <span className="text-xs text-gray-500">
                      Reg No: {trainee.regNo}
                    </span>
                    <span className="text-xs text-gray-500">
                      Email: {trainee.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendFeedback(trainee)}
                      className="bg-blue-500 text-white p-1 rounded-md text-xs hover:bg-blue-600"
                      title="Send Feedback"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/list/trainees/${trainee.id}`}
                      className="bg-gray-500 text-white p-1 rounded-md text-xs hover:bg-gray-600"
                      title="View Trainee"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              No trainees assigned.
            </p>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky"
              href={`/list/trainees?supervisorId=${supervisor.id}`}
            >
              Supervised Trainees (Avg Progress: {averageTraineeProgress.toFixed(1)}%)
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple"
              href={`/list/lessons?supervisorId=${supervisor.id}`}
            >
             {" Supervisor's Lessons"}
            </Link>
            <button
              onClick={handleGenerateSupervisorReport}
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Generate Supervisor Report
            </button>
          </div>
        </div>

      </div>

      {/* Review Form Modal */}
      {isReviewFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Review Lesson Plan</h2>
            <form
              onSubmit={(Jc) => {
                Jc.preventDefault();
                const form = Jc.target as HTMLFormElement;
                const feedback = form.feedback.value;
                const status = form.status.value as "APPROVED" | "REJECTED";
                if (reviewLessonPlanId && feedback && ["APPROVED", "REJECTED"].includes(status)) {
                  handleReviewLessonPlan(reviewLessonPlanId, feedback, status);
                  setIsReviewFormOpen(false);
                } else {
                  toast.error("Please provide feedback and a valid status.");
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Feedback</label>
                <textarea
                  name="feedback"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                  rows={4}
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                  required
                >
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewFormOpen(false);
                    setReviewLessonPlanId(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedLessonPlan && (
        <LessonPlanDetailsModal
          isOpen={isLessonPlanDetailsModalOpen}
          onClose={() => {
            setIsLessonPlanDetailsModalOpen(false);
            setSelectedLessonPlan(null);
          }}
          lessonPlan={selectedLessonPlan}
        />
      )}
      {selectedTraineeForFeedback && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => {
            setIsFeedbackModalOpen(false);
            setSelectedTraineeForFeedback(null);
          }}
          onSubmit={handleFeedbackSubmit}
          traineeName={`${selectedTraineeForFeedback.name} ${selectedTraineeForFeedback.surname}`}
        />
      )}
    </div>
  );
};

export default SingleSupervisorPage;


