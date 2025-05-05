"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { format, parseISO, min, max } from "date-fns";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import { getTraineeProfile, getNotifications, getLessonPlans } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";

type Notification = {
  id: string;
  user_id: string;
  initiator_id: string;
  type: string;
  message: string;
  created_at: string;
  read_status: boolean;
};

type TraineeProfile = {
  id: string;
  regNo: string;
  name: string;
  surname: string;
  sex: string;
  birthday: string;
  progress: string;
  img: string;
  createdAt: string;
  tpAssignment: {
    supervisorName: string;
    placeOfTP: string;
    startDate: string;
    endDate: string;
    status: string;
  };
};

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

type Observation = {
  id: string;
  lessonPlanId: string;
  traineeId: string;
  supervisorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
};

const getLessonPlanStyles = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        bg: "bg-yellow-50",
        border: "border-l-4 border-yellow-400",
        dot: "bg-yellow-400",
        statusText: "text-yellow-800",
      };
    case "APPROVED":
      return {
        bg: "bg-green-50",
        border: "border-l-4 border-green-400",
        dot: "bg-green-400",
        statusText: "text-green-800",
      };
    case "REJECTED":
      return {
        bg: "bg-red-50",
        border: "border-l-4 border-red-400",
        dot: "bg-red-400",
        statusText: "text-red-800",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-l-4 border-gray-300",
        dot: "bg-gray-300",
        statusText: "text-gray-600",
      };
  }
};

const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.warn(`Date format error ${dateString}:`, error);
    return "N/A";
  }
};

const TraineePage = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [traineeProfile, setTraineeProfile] = useState<TraineeProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(
    async () => {
      if (!user || user.role !== "teacherTrainee") {
        setError("Invalid user or role. Please sign in as a trainee.");
        router.push("/auth/signin");
        return;
      }

      console.log("TraineePage - User properties:", {
        identifier: user.identifier,
        role: user.role,
        fullUser: user,
      });

      const traineeId = user.identifier;
      if (!traineeId) {
        setError("Missing trainee identifier. Please sign in again.");
        router.push("/auth/signin");
        return;
      }

      setLoading(true);
      try {
        console.log(`TraineePage - Fetching profile for trainee ID: ${traineeId}`);
        const profile = await getTraineeProfile();
        console.log("TraineePage - Profile fetched:", profile);
        setTraineeProfile(profile);

        console.log(`TraineePage - Fetching lesson plans for trainee ID: ${traineeId}`);
        const lessonPlansResponse = await getLessonPlans(traineeId, 1, 5);
        console.log("TraineePage - Lesson plans fetched:", lessonPlansResponse);
        const sortedLessonPlans = (lessonPlansResponse.lessonPlans || []).map(
          (lp: any) => ({
            ...lp,
            aiGenerated: lp.aiGenerated ?? false,
          })
        ).sort(
          (a: LessonPlan, b: LessonPlan) => {
            const dateA = parseISO(a.createdAt).getTime();
            const dateB = parseISO(b.createdAt).getTime();
            return dateB - dateA; // Newest first
          }
        );
        setLessonPlans(sortedLessonPlans);

        // Utility to validate ISO date (e.g., "2023-10-15")
        const isValidISODate = (dateStr: string): boolean => {
          try {
            const date = parseISO(dateStr);
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        };

        // Utility to validate time (e.g., "09:00")
        const isValidTime = (timeStr: string | null | undefined): boolean => {
          if (!timeStr) return false;
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          return timeRegex.test(timeStr);
        };

        // Mock observations for approved lesson plans
        const mockObservations: Observation[] = sortedLessonPlans
          .filter((lp: LessonPlan) => lp.status === "APPROVED")
          .map((lp: LessonPlan, index: number) => {
            const defaultDate = new Date().toISOString().split("T")[0];
            const defaultStartTime = "09:00";
            const defaultEndTime = "10:00";

            const observationDate = isValidISODate(lp.date) ? lp.date : defaultDate;
            const observationStartTime = isValidTime(lp.startTime)
              ? lp.startTime!
              : defaultStartTime;
            const observationEndTime = isValidTime(lp.endTime)
              ? lp.endTime!
              : defaultEndTime;

            if (!isValidISODate(lp.date)) {
              console.warn(
                `Invalid date for lesson plan ${lp.id}: ${lp.date}, using fallback: ${defaultDate}`
              );
            }
            if (!isValidTime(lp.startTime)) {
              console.warn(
                `Invalid startTime for lesson plan ${lp.id}: ${lp.startTime}, using fallback: ${defaultStartTime}`
              );
            }
            if (!isValidTime(lp.endTime)) {
              console.warn(
                `Invalid endTime for lesson plan ${lp.id}: ${lp.endTime}, using fallback: ${defaultEndTime}`
              );
            }

            return {
              id: `mock-obs-${lp.id}-${index}`,
              lessonPlanId: lp.id,
              traineeId: traineeId,
              supervisorId: "mock-supervisor",
              date: observationDate,
              startTime: observationStartTime,
              endTime: observationEndTime,
              status: "SCHEDULED",
            };
          });
        setObservations(mockObservations);

        try {
          const notificationsResponse = await getNotifications(1);
          console.log("TraineePage - Notifications fetched:", notificationsResponse);
          setNotifications(notificationsResponse.notifications || []);
        } catch (notifErr: any) {
          console.warn("TraineePage - Failed to fetch notifications:", {
            message: notifErr.message,
            status: notifErr.response?.status,
          });
          toast.warning("Failed to load notifications.");
          setNotifications([]);
        }
      } catch (err: any) {
        console.error(`TraineePage - Error fetching data for trainee ${traineeId}:`, {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        const message = err.message.includes("CORS")
          ? "Failed to connect to the server. Please contact the administrator to check CORS settings."
          : err.response?.status === 401
          ? "Session expired. Please sign in again."
          : err.response?.status === 403
          ? "Unauthorized: You can only access your own profile."
          : err.response?.status === 404
          ? `Trainee profile not found for ID: ${traineeId}`
          : `Failed to load data: ${err.message}`;
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user, router]
  );

  const handleRefetch = useCallback(() => {
    fetchData();
    window.dispatchEvent(new Event("notification:updated"));
  }, [fetchData]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      console.log("TraineePage - Notification update event received, refetching data");
      fetchData();
    };
    window.addEventListener("notification:updated", handleNotificationUpdate);
    return () => {
      window.removeEventListener("notification:updated", handleNotificationUpdate);
    };
  }, [fetchData]);

  const hasApprovedLessonPlan = lessonPlans.some((lp) => lp.status === "APPROVED");
  const hasScheduledObservation = observations.length > 0;
  const showSchedule = hasApprovedLessonPlan && hasScheduledObservation;

  // Generate calendar events matching BigCalendarContainer's Event interface
  const calendarEvents = observations
    .map((obs) => {
      const lessonPlan = lessonPlans.find((lp) => lp.id === obs.lessonPlanId);
      const title = `Observation for ${lessonPlan?.title || "Lesson"}`;

      const startDateTime = `${obs.date}T${obs.startTime}:00`;
      const endDateTime = `${obs.date}T${obs.endTime}:00`;

      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn(
          `Invalid date/time for observation ${obs.id}: start=${startDateTime}, end=${endDateTime}`
        );
        return null;
      }

      return {
        id: obs.id,
        title,
        start,
        end,
        status: obs.status, // "SCHEDULED"
        onClick: () => { toast.info(`Clicked: ${title}`); return obs.id; }, // Return obs.id
        onDelete: () => { toast.info(`Delete not implemented for ${title}`); return obs.id; }, // Return obs.id
      };
    })
    .filter(
      (event): event is {
        id: string;
        title: string;
        start: Date;
        end: Date;
        status: string;
        onClick: () => string;
        onDelete: () => string;
      } => event !== null
    );

  // Calculate date range for display
  const dateRange =
    calendarEvents.length > 0
      ? `${format(min(calendarEvents.map((e) => e.start)), "MMM d")} - ${format(
          max(calendarEvents.map((e) => e.end)),
          "MMM d, yyyy"
        )}`
      : "No events";

  if (authLoading || loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  if (error || !traineeProfile) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-medium">{error || "Failed to load profile."}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleRefetch}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TP Assignment Section */}
        <div className="bg-white p-4 rounded-md mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">TP Assignment</h1>
          </div>
          {traineeProfile.tpAssignment.status === "Not Assigned" ? (
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt="No Assignment"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-500">Not Assigned</h2>
                <span className="text-sm text-gray-400">TP Assignment Status</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">{traineeProfile.tpAssignment.supervisorName}</h2>
                  <span className="text-sm text-gray-400">Supervisor</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image
                  src="/singleLesson.png"
                  alt="Place of TP"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <div>
                  <h2 className="text-lg font-semibold">{traineeProfile.tpAssignment.placeOfTP}</h2>
                  <span className="text-sm text-gray-400">Place of TP</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">
                    {traineeProfile.tpAssignment.startDate} to {traineeProfile.tpAssignment.endDate}
                  </h2>
                  <span className="text-sm text-gray-400">Duration</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-sm">
                <Image src="/singleBranch.png" alt="Status" width={24} height={24} className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold text-green-600">
                    {traineeProfile.tpAssignment.status}
                  </h2>
                  <span className="text-sm text-gray-400">Status</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Plans Section */}
        <div className="bg-white p-6 rounded-md shadow-md mb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Lesson Plans</h1>
            <button
              onClick={() => router.push("/trainee/lesson-plans")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors focus:ring-2 focus:ring-blue-200 focus:outline-none"
              aria-label="Manage lesson plans"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manage Lesson Plans
            </button>
          </div>
          {lessonPlans.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Image
                src="/stockout.png"
                alt="No lesson plans"
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <p className="text-gray-500 text-lg mb-4">No lesson plans created yet. Create one now!</p>
              <button
                onClick={() => router.push("/trainee/lesson-plans")}
                className="px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors"
                aria-label="Go to lesson plans"
              >
                Go to Lesson Plans
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Lesson Plans</h2>
              <ul className="space-y-3">
                {lessonPlans.map((plan) => {
                  const styles = getLessonPlanStyles(plan.status);
                  return (
                    <li
                      key={plan.id}
                      className={`p-3 ${styles.bg} ${styles.border} rounded-md flex items-start space-x-3 hover:bg-opacity-90 transition-colors`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-2`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium">{plan.title}</p>
                        <p className="text-xs text-gray-600 mt-1">Subject: {plan.subject}</p>
                        <p className="text-xs text-gray-600">Date: {formatDate(plan.date)}</p>
                        <p className="text-xs text-gray-600">
                          Time:{" "}
                          {plan.startTime && plan.endTime
                            ? `${plan.startTime.slice(0, 5)} - ${plan.endTime.slice(0, 5)}`
                            : "N/A"}
                        </p>
                        <p className="text-xs mt-1">
                          <span className={styles.statusText}>{plan.status}</span> •{" "}
                          <span className="text-gray-600">{formatDate(plan.createdAt)}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">My Schedule</h1>
          {showSchedule ? (
            <ErrorBoundary
              fallback={<div className="text-red-500">Failed to load schedule. Please try again.</div>}
            >
              <div>
                <h2 className="text-lg font-medium mb-2">{dateRange}</h2>
                <div className="h-[400px] overflow-y-auto">
                  <BigCalendarContainer type="trainee" id="me" events={calendarEvents} />
                </div>
              </div>
            </ErrorBoundary>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Image
                src="/stockout.png"
                alt="No schedule"
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <p className="text-gray-500 text-lg">
                No schedule available until a lesson plan is approved and an observation is scheduled.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
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
    </div>
  );
};

export default TraineePage;




















































