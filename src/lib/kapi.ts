



































































































// mport axios from "axios";
// import { z } from "zod";
// import { SupervisorSchemaType, TraineeSchemaType } from "@/lib/formValidationSchemas";

// // Simplified schema for LessonPlan input (used for POST/PUT)
// export const LessonPlanSchemaType = z.object({
//   title: z.string().min(1, "Title is required"),
//   subject: z.string().min(1, "Subject is required"),
//   class: z.string().min(1, "Class is required"),
//   date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
//   startTime: z.string().nullable(), // Allow null explicitly
//   endTime: z.string().nullable(), // Allow null explicitly
//   objectives: z.string().min(1, "Objectives are required"),
//   activities: z.string().min(1, "Activities are required"),
//   resources: z.string().min(1, "Resources are required"),
//   aiGenerated: z.boolean().optional(),
//   pdfUrl: z.string().optional(),
// });

// // Simplified schema for API response
// const LessonPlanResponseSchema = z.object({
//   id: z.string(),
//   traineeId: z.string().or(z.number().transform(String)),
//   title: z.string(),
//   subject: z.string(),
//   class: z.string(),
//   date: z.string(),
//   startTime: z.string().nullable(),
//   endTime: z.string().nullable(),
//   objectives: z.string(),
//   activities: z.string(),
//   resources: z.string(),
//   createdAt: z.string(),
//   status: z.string().transform(val => val.toUpperCase()), // Normalize status
//   aiGenerated: z.boolean().optional(),
//   traineeName: z.string().optional(),
//   supervisorName: z.string().optional(),
//   schoolName: z.string().optional(),
//   schoolId: z.string().or(z.number().transform(String)).optional(),
//   supervisorId: z.string().or(z.number().transform(String)).optional(),
//   pdfUrl: z.string().nullable(),
// });

// // Schema for PDF generation response
// const PDFResponseSchema = z.object({
//   pdfUrl: z.string().min(1, "PDF URL is required"),
// });

// // Schema for AI lesson plan response
// const AILessonPlanResponseSchema = z.object({
//   answer: z.string(),
//   conversation_id: z.string(),
//   event: z.string(),
//   id: z.string(),
//   message_id: z.string(),
//   mode: z.string(),
//   task_id: z.string(),
//   created_at: z.number(),
//   metadata: z.object({
//     retriever_resources: z.array(z.any()),
//     usage: z.object({
//       prompt_tokens: z.number(),
//       completion_tokens: z.number(),
//       total_tokens: z.number(),
//       total_price: z.string(),
//       currency: z.string(),
//       latency: z.number(),
//     }),
//   }),
// });

// export type LessonPlanSchemaType = z.infer<typeof LessonPlanSchemaType>;

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// // Error message mapping
// const errorMessages: Record<string, string> = {
//   "You already have a pending lesson plan. Please submit or delete it first.":
//     "You already have a pending lesson plan. Please submit or delete it first.",
//   "Invalid time format, expected HH:MM": "Please enter times in HH:MM format (e.g., 09:00).",
//   "End time must be after start time": "End time must be later than start time.",
//   "Invalid date format, expected YYYY-MM-DD": "Please enter date in YYYY-MM-DD format.",
//   "Missing required fields": "Please fill in all required fields.",
//   "Invalid or expired token": "Your session has expired. Please log in again.",
//   "Unauthorized": "You are not authorized to perform this action.",
//   "Network Error": "Failed to connect to the server. Please check your network or try again later.",
//   "Lesson plan not found or you lack permission": "Lesson plan not found or you lack permission.",
//   "Lesson plan ID and content are required": "Lesson plan ID and content are required.",
//   "Failed to generate PDF": "Failed to generate PDF. Please try again.",
//   "Query is required": "Please provide a lesson plan prompt.",
// };

// export const apiRequest = async (method: string, endpoint: string, data?: any, params?: any, retries = 2): Promise<any> => {
//   const token = localStorage.getItem("token") || document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     console.warn(`API Request: ${method} ${API_BASE_URL}${endpoint} - No token found`);
//     throw new Error("No token found");
//   }

//   const config = {
//     method,
//     url: `${API_BASE_URL}${endpoint}`,
//     data,
//     params,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     withCredentials: true,
//     timeout: 60000,
//     cache: "no-store",
//   };

//   console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`, {
//     data,
//     params,
//     token: token.substring(0, 10) + "...",
//     headers: config.headers,
//   });

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const response = await axios(config);
//       console.log(`API Response: ${method} ${endpoint}`, {
//         status: response.status,
//         data: response.data,
//         headers: response.headers,
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error(`API Request Error (${method} ${endpoint}, attempt ${attempt}):`, {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         headers: error.response?.headers,
//         config,
//         code: error.code,
//       });

//       if (attempt === retries) {
//         const message = error.response?.data?.error || error.message || "An unexpected error occurred";
//         throw new Error(errorMessages[message] || message);
//       }

//       await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
//     }
//   }
// };

// // Authentication
// export const verifyToken = async () => {
//   return apiRequest("GET", "/api/verify");
// };

// export const login = async (data: { userType: string; identifier: string; password: string }) => {
//   return apiRequest("POST", "/api/login", data);
// };

// // Lesson Plan Operations
// export const createLessonPlan = async (data: LessonPlanSchemaType) => {
//   try {
//     console.log("createLessonPlan - Request Data:", JSON.stringify(data, null, 2));
//     const validatedData = LessonPlanSchemaType.parse(data);
//     const response = await apiRequest("POST", "/api/lesson-plans", validatedData);
//     console.log("createLessonPlan - Raw Response:", JSON.stringify(response, null, 2));

//     const responseSchema = z.object({
//       message: z.string(),
//       lessonPlan: LessonPlanResponseSchema,
//     });

//     const validatedResponse = responseSchema.safeParse(response);
//     if (!validatedResponse.success) {
//       console.error("createLessonPlan - Validation error details:", {
//         errors: validatedResponse.error.flatten(),
//         issues: validatedResponse.error.issues,
//         responseData: response,
//       });
//       throw new Error("Invalid response format from server");
//     }

//     return {
//       message: validatedResponse.data.message,
//       lessonPlan: {
//         ...validatedResponse.data.lessonPlan,
//         startTime: normalizeTime(validatedResponse.data.lessonPlan.startTime),
//         endTime: normalizeTime(validatedResponse.data.lessonPlan.endTime),
//         traineeId: String(validatedResponse.data.lessonPlan.traineeId),
//         schoolId: validatedResponse.data.lessonPlan.schoolId ? String(validatedResponse.data.lessonPlan.schoolId) : undefined,
//         supervisorId: validatedResponse.data.lessonPlan.supervisorId ? String(validatedResponse.data.lessonPlan.supervisorId) : undefined,
//         status: validatedResponse.data.lessonPlan.status.toUpperCase(),
//       },
//     };
//   } catch (error: any) {
//     console.error("createLessonPlan - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(error.message || "Failed to create lesson plan");
//   }
// };

// export const updateLessonPlan = async (id: string, data: LessonPlanSchemaType) => {
//   try {
//     console.log(`updateLessonPlan - Request Data for ID ${id}:`, JSON.stringify(data, null, 2));
//     const validatedData = LessonPlanSchemaType.parse(data);
//     const response = await apiRequest("PUT", `/api/lesson-plans/${id}`, validatedData);
//     console.log("updateLessonPlan - Raw Response:", JSON.stringify(response, null, 2));

//     const responseSchema = z.object({
//       message: z.string(),
//       lessonPlan: LessonPlanResponseSchema,
//     });

//     const validatedResponse = responseSchema.safeParse(response);
//     if (!validatedResponse.success) {
//       console.error("updateLessonPlan - Validation error details:", {
//         errors: validatedResponse.error.flatten(),
//         issues: validatedResponse.error.issues,
//         responseData: response,
//       });
//       throw new Error("Invalid response format from server");
//     }

//     return {
//       message: validatedResponse.data.message,
//       lessonPlan: {
//         ...validatedResponse.data.lessonPlan,
//         startTime: normalizeTime(validatedResponse.data.lessonPlan.startTime),
//         endTime: normalizeTime(validatedResponse.data.lessonPlan.endTime),
//         traineeId: String(validatedResponse.data.lessonPlan.traineeId),
//         schoolId: validatedResponse.data.lessonPlan.schoolId ? String(validatedResponse.data.lessonPlan.schoolId) : undefined,
//         supervisorId: validatedResponse.data.lessonPlan.supervisorId ? String(validatedResponse.data.lessonPlan.supervisorId) : undefined,
//         status: validatedResponse.data.lessonPlan.status.toUpperCase(),
//       },
//     };
//   } catch (error: any) {
//     console.error("updateLessonPlan - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(error.message || "Failed to update lesson plan");
//   }
// };

// export const deleteLessonPlan = async (id: string) => {
//   try {
//     console.log(`deleteLessonPlan - Deleting ID ${id}`);
//     const response = await apiRequest("DELETE", `/api/lesson-plans/${id}`);
//     console.log("deleteLessonPlan - Raw Response:", JSON.stringify(response, null, 2));

//     const responseSchema = z.object({
//       message: z.string(),
//     });

//     const validatedResponse = responseSchema.safeParse(response);
//     if (!validatedResponse.success) {
//       console.error("deleteLessonPlan - Validation error details:", {
//         errors: validatedResponse.error.flatten(),
//         issues: validatedResponse.error.issues,
//         responseData: response,
//       });
//       throw new Error("Invalid response format from server");
//     }

//     return validatedResponse.data.message;
//   } catch (error: any) {
//     console.error("deleteLessonPlan - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(error.message || "Failed to delete lesson plan");
//   }
// };

// export const getLessonPlan = async (id: string) => {
//   try {
//     console.log(`getLessonPlan - Fetching id ${id}`);
//     const response = await apiRequest("GET", `/api/lesson-plans/${id}`);
//     console.log(`getLessonPlan - Response for id ${id}:`, response);
//     return LessonPlanResponseSchema.parse(response);
//   } catch (error: any) {
//     console.error(`getLessonPlan - Error for id ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const getLessonPlans = async (
//   traineeId?: string,
//   page: number = 1,
//   limit: number = 10,
//   search?: string,
//   subject?: string,
//   status?: string
// ) => {
//   try {
//     console.log(`getLessonPlans - Fetching page ${page}, limit ${limit}, traineeId ${traineeId || "none"}, search ${search || "none"}, subject ${subject || "none"}, status ${status || "none"}`);
//     const response = await apiRequest("GET", "/api/lesson-plans", undefined, {
//       traineeId,
//       page,
//       limit,
//       search,
//       subject,
//       status,
//     });
//     console.log("getLessonPlans - Raw Response:", JSON.stringify(response, null, 2));

//     const lessonPlansResponseSchema = z.object({
//       lessonPlans: z.array(LessonPlanResponseSchema),
//       totalCount: z.number().min(0),
//       totalPages: z.number().min(1),
//     });

//     const validatedResponse = lessonPlansResponseSchema.safeParse(response);
//     if (!validatedResponse.success) {
//       console.error("getLessonPlans - Validation error details:", {
//         errors: validatedResponse.error.flatten(),
//         issues: validatedResponse.error.issues,
//         responseData: response,
//       });
//       return { lessonPlans: [], totalCount: 0, totalPages: 1 };
//     }
//     return {
//       ...validatedResponse.data,
//       lessonPlans: validatedResponse.data.lessonPlans.map(plan => ({
//         ...plan,
//         startTime: normalizeTime(plan.startTime),
//         endTime: normalizeTime(plan.endTime),
//         traineeId: String(plan.traineeId),
//         schoolId: plan.schoolId ? String(plan.schoolId) : undefined,
//         supervisorId: plan.supervisorId ? String(plan.supervisorId) : undefined,
//       })),
//     };
//   } catch (error: any) {
//     console.error("getLessonPlans - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     if (error.response?.status === 404 || error.message.includes("Invalid data")) {
//       return { lessonPlans: [], totalCount: 0, totalPages: 1 };
//     }
//     throw error;
//   }
// };

// // Generate PDF for a lesson plan
// export const generateLessonPlanPDF = async (lessonPlanId: string, data: LessonPlanSchemaType) => {
//   try {
//     console.log(`generateLessonPlanPDF - Request Data for ID ${lessonPlanId}:`, JSON.stringify(data, null, 2));
//     const validatedData = LessonPlanSchemaType.parse({
//       ...data,
//       startTime: data.startTime ? normalizeTime(data.startTime) : null,
//       endTime: data.endTime ? normalizeTime(data.endTime) : null,
//     });
//     const payload = {
//       lesson_plan_id: lessonPlanId,
//       ...validatedData,
//     };
//     const response = await apiRequest("POST", "/api/lesson-plans/generate-pdf", payload);
//     console.log("generateLessonPlanPDF - Raw Response:", JSON.stringify(response, null, 2));

//     const validatedResponse = PDFResponseSchema.safeParse(response);
//     if (!validatedResponse.success) {
//       console.error("generateLessonPlanPDF - Validation error details:", {
//         errors: validatedResponse.error.flatten(),
//         issues: validatedResponse.error.issues,
//         responseData: response,
//       });
//       throw new Error("Invalid response format from server");
//     }

//     return validatedResponse.data.pdfUrl;
//   } catch (error: any) {
//     console.error("generateLessonPlanPDF - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(error.message || "Failed to generate PDF");
//   }
// };

// // Generate AI lesson plan via Dify API
// export const generateAILessonPlan = async (query: string, conversationId: string = "") => {
//   try {
//     console.log("generateAILessonPlan - Request Data:", { query, conversationId });
//     const payload = {
//       query,
//       user_id: "abc-123",
//       conversation_id: conversationId,
//     };
//     const response = await apiRequest("POST", "/api/ai-lesson-plan", payload);
//     console.log("generateAILessonPlan - Raw Response:", JSON.stringify(response, null, 2));

//     const validatedResponse = AILessonPlanResponseSchema.safeParse(response);
//     if (!validatedResponse.success) {
//       console.error("generateAILessonPlan - Validation error details:", {
//         errors: validatedResponse.error.flatten(),
//         issues: validatedResponse.error.issues,
//         responseData: response,
//       });
//       throw new Error("Invalid response format from server");
//     }

//     return validatedResponse.data;
//   } catch (error: any) {
//     console.error("generateAILessonPlan - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(errorMessages[error.message] || "Failed to generate AI lesson plan");
//   }
// };

// // Normalize time to HH:mm
// function normalizeTime(time?: string | null): string | null {
//   if (!time) return null;
//   try {
//     if (time.includes("T")) {
//       return new Date(time).toISOString().slice(11, 16);
//     }
//     return time.slice(0, 5);
//   } catch {
//     return null;
//   }
// }













































import axios from "axios";
import { z } from "zod";
import { SupervisorSchemaType, TraineeSchemaType } from "@/lib/formValidationSchemas";

// Simplified schema for LessonPlan input (used for POST/PUT)
export const LessonPlanSchemaType = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  class: z.string().min(1, "Class is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  objectives: z.string().min(1, "Objectives are required"),
  activities: z.string().min(1, "Activities are required"),
  resources: z.string().min(1, "Resources are required"),
  aiGenerated: z.boolean().optional(),
  pdfUrl: z.string().optional(),
});

// Simplified schema for API response
const LessonPlanResponseSchema = z.object({
  id: z.string(),
  traineeId: z.string().or(z.number().transform(String)),
  title: z.string(),
  subject: z.string(),
  class: z.string(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  objectives: z.string(),
  activities: z.string(),
  resources: z.string(),
  createdAt: z.string(),
  status: z.string().transform(val => val.toUpperCase()), // Normalize status
  aiGenerated: z.boolean().optional(),
  traineeName: z.string().optional(),
  supervisorName: z.string().optional(),
  schoolName: z.string().optional(),
  schoolId: z.string().or(z.number().transform(String)).optional(),
  supervisorId: z.string().or(z.number().transform(String)).optional(),
  pdfUrl: z.string().nullable(),
});

// Schema for PDF generation response
const PDFResponseSchema = z.object({
  pdfUrl: z.string().min(1, "PDF URL is required"),
});

// Schema for AI lesson plan response
const AILessonPlanResponseSchema = z.object({
  answer: z.string(),
  conversation_id: z.string(),
  event: z.string(),
  id: z.string(),
  message_id: z.string(),
  mode: z.string(),
  task_id: z.string(),
  created_at: z.number(),
  metadata: z.object({
    retriever_resources: z.array(z.any()),
    usage: z.object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
      total_price: z.string(),
      currency: z.string(),
      latency: z.number(),
    }),
  }),
});







// Schema for Supervisor Profile response
const SupervisorProfileSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  name: z.string(),
  surname: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  createdAt: z.string().optional(),
  assignedTrainees: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      surname: z.string(),
      regNo: z.string(),
      email: z.string().email(),
    })
  ),
  lessonPlans: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      subject: z.string(),
      date: z.string(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      status: z.string(),
      traineeId: z.string(),
      traineeName: z.string().optional(),
      createdAt: z.string().optional(),
    })
  ),
  schedules: z.array(
    z.object({
      id: z.string(),
      lesson_plan_id: z.string(),
      traineeId: z.string(),
      date: z.string(),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      status: z.string(),
      created_at: z.string().optional(),
    })
  ),
});

// Schema for Lesson Plan Review request
const LessonPlanReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  comments: z.string().min(1, "Comments are required"),
  score: z.number().int().min(0).max(10).optional(),
});

// Schema for Lesson Plan Review response
const LessonPlanReviewResponseSchema = z.object({
  message: z.string(),
  lessonPlan: LessonPlanResponseSchema,
  feedback: z.object({
    id: z.string(),
    lesson_plan_id: z.string(),
    traineeId: z.string(),
    supervisorId: z.string(),
    score: z.number().nullable(),
    comments: z.string(),
    created_at: z.string(),
  }),
});

// Schema for Observation Schedule request
const ObservationScheduleSchema = z.object({
  lesson_plan_id: z.string().min(1, "Lesson plan ID is required"),
  trainee_id: z.string().min(1, "Trainee ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
});

// Schema for Observation Schedule response
const ObservationScheduleResponseSchema = z.object({
  message: z.string(),
  schedule: z.object({
    id: z.string(),
    supervisorId: z.string(),
    traineeId: z.string(),
    lesson_plan_id: z.string(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    status: z.string(),
    created_at: z.string(),
  }),
});

// Schema for Observation Feedback request
const ObservationFeedbackSchema = z.object({
  score: z.number().int().min(0).max(10, "Score must be between 0 and 10"),
  comments: z.string().min(1, "Comments are required"),
});

// Schema for Observation Feedback response
const ObservationFeedbackResponseSchema = z.object({
  message: z.string(),
  observation: z.object({
    id: z.string(),
    supervisorId: z.string(),
    traineeId: z.string(),
    lesson_plan_id: z.string().optional(),
    score: z.number(),
    comments: z.string(),
    completed_at: z.string(),
  }),
  feedback: z.object({
    id: z.string(),
    lesson_plan_id: z.string().nullable(),
    traineeId: z.string(),
    supervisorId: z.string(),
    score: z.number(),
    comments: z.string(),
    created_at: z.string(),
  }),
});

// Schema for Supervised Trainees response
const SupervisedTraineesResponseSchema = z.object({
  trainees: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      surname: z.string(),
      regNo: z.string().optional(),
      email: z.string().email().optional(),
      lessonPlanCount: z.number(),
      observationCount: z.number(),
      averageScore: z.number(),
    })
  ),
  totalCount: z.number().min(0),
  totalPages: z.number().min(1),
  currentPage: z.number().min(1),
});

// Schema for Supervisor Schedules response
const SupervisorSchedulesResponseSchema = z.object({
  schedules: z.array(
    z.object({
      id: z.string(),
      supervisorId: z.string(),
      traineeId: z.string(),
      lesson_plan_id: z.string(),
      date: z.string(),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      status: z.string(),
      created_at: z.string(),
      lessonPlanTitle: z.string().optional(),
      traineeName: z.string().optional(),
    })
  ),
  totalCount: z.number().min(0),
  totalPages: z.number().min(1),
  currentPage: z.number().min(1),
});
















export type LessonPlanSchemaType = z.infer<typeof LessonPlanSchemaType>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Error message mapping
const errorMessages: Record<string, string> = {
  "You already have a pending lesson plan. Please submit or delete it first.":
    "You already have a pending lesson plan. Please submit or delete it first.",
  "Invalid time format, expected HH:MM": "Please enter times in HH:MM format (e.g., 09:00).",
  "End time must be after start time": "End time must be later than start time.",
  "Invalid date format, expected YYYY-MM-DD": "Please enter date in YYYY-MM-DD format.",
  "Missing required fields": "Please fill in all required fields.",
  "Invalid or expired token": "Your session has expired. Please log in again.",
  "Unauthorized": "You are not authorized to perform this action.",
  "Network Error": "Failed to connect to the server. Please check your network or try again later.",
  "Lesson plan not found or you lack permission": "Lesson plan not found or you lack permission.",
  "Lesson plan ID and content are required": "Lesson plan ID and content are required.",
  "Failed to generate PDF": "Failed to generate PDF. Please try again.",
  "Query is required": "Please provide a lesson plan prompt.",
  "Supervisor not found": "The specified supervisor could not be found.",
  "Unauthorized: You can only access your own profile": "You are not authorized to view this supervisor's profile.",
  "Lesson plan not found or not assigned to you": "The lesson plan was not found or is not assigned to you.",
  "Only approved lesson plans can be scheduled for observation": "Only approved lesson plans can be scheduled for observation.",
  "Trainee not found": "The specified trainee could not be found.",
  "Invalid time format. Use HH:MM or HH:MM:SS": "Please enter times in HH:MM format (e.g., 09:00).",
  "Invalid date format. Use YYYY-MM-DD": "Please enter date in YYYY-MM-DD format.",
  "Observation not found or not assigned to you": "The observation was not found or is not assigned to you.",
  "Feedback can only be submitted for completed observations": "Feedback can only be submitted for completed observations.",
  "Score must be between 0 and 10": "Observation score must be between 0 and 10.",
};

// export const apiRequest = async (method: string, endpoint: string, data?: any, params?: any, retries = 2): Promise<any> => {
//   const token = localStorage.getItem("token") || document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     console.warn(`API Request: ${method} ${API_BASE_URL}${endpoint} - No token found`);
//     throw new Error("No token found");
//   }

//   const config = {
//     method,
//     url: `${API_BASE_URL}${endpoint}`,
//     data,
//     params,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     withCredentials: true,
//     timeout: 60000,
//     cache: "no-store",
//   };

//   console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`, {
//     data,
//     params,
//     token: token.substring(0, 10) + "...",
//     headers: config.headers,
//   });

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const response = await axios(config);
//       console.log(`API Response: ${method} ${endpoint}`, {
//         status: response.status,
//         data: response.data,
//         headers: response.headers,
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error(`API Request Error (${method} ${endpoint}, attempt ${attempt}):`, {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         headers: error.response?.headers,
//         config,
//         code: error.code,
//       });

//       if (attempt === retries) {
//         const message = error.response?.data?.error || error.message || "An unexpected error occurred";
//         throw new Error(errorMessages[message] || message);
//       }

//       await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
//     }
//   }
// };

// // Authentication
// export const verifyToken = async () => {
//   return apiRequest("GET", "/api/verify");
// };

// export const login = async (data: { userType: string; identifier: string; password: string }) => {
//   return apiRequest("POST", "/api/login", data);
// };

// Lesson Plan Operations











export const apiRequest = async (method: string, endpoint: string, data?: any, params?: any, retries = 2): Promise<any> => {
  const token = localStorage.getItem("token") || document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    console.warn(`API Request: ${method} ${API_BASE_URL}${endpoint} - No token found`);
    throw new Error("No token found");
  }

  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    data,
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 60000,
    cache: "no-store",
  };

  console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`, {
    data,
    params,
    token: token.substring(0, 10) + "...",
    headers: config.headers,
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios(config);
      console.log(`API Response: ${method} ${endpoint}`, {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      return response.data;
    } catch (error: any) {
      console.error(`API Request Error (${method} ${endpoint}, attempt ${attempt}):`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config,
        code: error.code,
      });

      if (attempt === retries) {
        const message = error.response?.data?.error || error.message || "An unexpected error occurred";
        throw new Error(errorMessages[message] || message);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Authentication
export const verifyToken = async () => {
  return apiRequest("GET", "/api/verify");
};

export const login = async (data: { userType: string; identifier: string; password: string }) => {
  return apiRequest("POST", "/api/login", data);
};












export const createLessonPlan = async (data: LessonPlanSchemaType) => {
  try {
    console.log("createLessonPlan - Request Data:", JSON.stringify(data, null, 2));
    const validatedData = LessonPlanSchemaType.parse(data);
    const response = await apiRequest("POST", "/api/lesson-plans", validatedData);
    console.log("createLessonPlan - Raw Response:", JSON.stringify(response, null, 2));

    const responseSchema = z.object({
      message: z.string(),
      lessonPlan: LessonPlanResponseSchema,
    });

    const validatedResponse = responseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("createLessonPlan - Validation error details:", {
        errors: validatedResponse.error.flatten(),
        issues: validatedResponse.error.issues,
        responseData: response,
      });
      throw new Error("Invalid response format from server");
    }

    return {
      message: validatedResponse.data.message,
      lessonPlan: {
        ...validatedResponse.data.lessonPlan,
        startTime: normalizeTime(validatedResponse.data.lessonPlan.startTime),
        endTime: normalizeTime(validatedResponse.data.lessonPlan.endTime),
        traineeId: String(validatedResponse.data.lessonPlan.traineeId),
        schoolId: validatedResponse.data.lessonPlan.schoolId ? String(validatedResponse.data.lessonPlan.schoolId) : undefined,
        supervisorId: validatedResponse.data.lessonPlan.supervisorId ? String(validatedResponse.data.lessonPlan.supervisorId) : undefined,
        status: validatedResponse.data.lessonPlan.status.toUpperCase(),
      },
    };
  } catch (error: any) {
    console.error("createLessonPlan - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || "Failed to create lesson plan");
  }
};

export const updateLessonPlan = async (id: string, data: LessonPlanSchemaType) => {
  try {
    console.log(`updateLessonPlan - Request Data for ID ${id}:`, JSON.stringify(data, null, 2));
    const validatedData = LessonPlanSchemaType.parse(data);
    const response = await apiRequest("PUT", `/api/lesson-plans/${id}`, validatedData);
    console.log("updateLessonPlan - Raw Response:", JSON.stringify(response, null, 2));

    const responseSchema = z.object({
      message: z.string(),
      lessonPlan: LessonPlanResponseSchema,
    });

    const validatedResponse = responseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("updateLessonPlan - Validation error details:", {
        errors: validatedResponse.error.flatten(),
        issues: validatedResponse.error.issues,
        responseData: response,
      });
      throw new Error("Invalid response format from server");
    }

    return {
      message: validatedResponse.data.message,
      lessonPlan: {
        ...validatedResponse.data.lessonPlan,
        startTime: normalizeTime(validatedResponse.data.lessonPlan.startTime),
        endTime: normalizeTime(validatedResponse.data.lessonPlan.endTime),
        traineeId: String(validatedResponse.data.lessonPlan.traineeId),
        schoolId: validatedResponse.data.lessonPlan.schoolId ? String(validatedResponse.data.lessonPlan.schoolId) : undefined,
        supervisorId: validatedResponse.data.lessonPlan.supervisorId ? String(validatedResponse.data.lessonPlan.supervisorId) : undefined,
        status: validatedResponse.data.lessonPlan.status.toUpperCase(),
      },
    };
  } catch (error: any) {
    console.error("updateLessonPlan - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || "Failed to update lesson plan");
  }
};

export const deleteLessonPlan = async (id: string) => {
  try {
    console.log(`deleteLessonPlan - Deleting ID ${id}`);
    const response = await apiRequest("DELETE", `/api/lesson-plans/${id}`);
    console.log("deleteLessonPlan - Raw Response:", JSON.stringify(response, null, 2));

    const responseSchema = z.object({
      message: z.string(),
    });

    const validatedResponse = responseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("deleteLessonPlan - Validation error details:", {
        errors: validatedResponse.error.flatten(),
        issues: validatedResponse.error.issues,
        responseData: response,
      });
      throw new Error("Invalid response format from server");
    }

    return validatedResponse.data.message;
  } catch (error: any) {
    console.error("deleteLessonPlan - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || "Failed to delete lesson plan");
  }
};

export const getLessonPlan = async (id: string) => {
  try {
    console.log(`getLessonPlan - Fetching id ${id}`);
    const response = await apiRequest("GET", `/api/lesson-plans/${id}`);
    console.log(`getLessonPlan - Response for id ${id}:`, response);
    return LessonPlanResponseSchema.parse(response);
  } catch (error: any) {
    console.error(`getLessonPlan - Error for id ${id}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getLessonPlans = async (
  traineeId?: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  subject?: string,
  status?: string
) => {
  try {
    console.log(`getLessonPlans - Fetching page ${page}, limit ${limit}, traineeId ${traineeId || "none"}, search ${search || "none"}, subject ${subject || "none"}, status ${status || "none"}`);
    const response = await apiRequest("GET", "/api/lesson-plans", undefined, {
      traineeId,
      page,
      limit,
      search,
      subject,
      status,
    });
    console.log("getLessonPlans - Raw Response:", JSON.stringify(response, null, 2));

    const lessonPlansResponseSchema = z.object({
      lessonPlans: z.array(LessonPlanResponseSchema),
      totalCount: z.number().min(0),
      totalPages: z.number().min(1),
    });

    const validatedResponse = lessonPlansResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("getLessonPlans - Validation error details:", {
        errors: validatedResponse.error.flatten(),
        issues: validatedResponse.error.issues,
        responseData: response,
      });
      return { lessonPlans: [], totalCount: 0, totalPages: 1 };
    }
    return {
      ...validatedResponse.data,
      lessonPlans: validatedResponse.data.lessonPlans.map(plan => ({
        ...plan,
        startTime: normalizeTime(plan.startTime),
        endTime: normalizeTime(plan.endTime),
        traineeId: String(plan.traineeId),
        schoolId: plan.schoolId ? String(plan.schoolId) : undefined,
        supervisorId: plan.supervisorId ? String(plan.supervisorId) : undefined,
      })),
    };
  } catch (error: any) {
    console.error("getLessonPlans - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    if (error.response?.status === 404 || error.message.includes("Invalid data")) {
      return { lessonPlans: [], totalCount: 0, totalPages: 1 };
    }
    throw error;
  }
};

// Generate PDF for a lesson plan
export const generateLessonPlanPDF = async (lessonPlanId: string, data: LessonPlanSchemaType) => {
  try {
    console.log(`generateLessonPlanPDF - Request Data for ID ${lessonPlanId}:`, JSON.stringify(data, null, 2));
    const validatedData = LessonPlanSchemaType.parse({
      ...data,
      startTime: data.startTime ? normalizeTime(data.startTime) : undefined,
      endTime: data.endTime ? normalizeTime(data.endTime) : undefined,
    });
    const payload = {
      lesson_plan_id: lessonPlanId,
      ...validatedData,
    };
    const response = await apiRequest("POST", "/api/lesson-plans/generate-pdf", payload);
    console.log("generateLessonPlanPDF - Raw Response:", JSON.stringify(response, null, 2));

    const validatedResponse = PDFResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("generateLessonPlanPDF - Validation error details:", {
        errors: validatedResponse.error.flatten(),
        issues: validatedResponse.error.issues,
        responseData: response,
      });
      throw new Error("Invalid response format from server");
    }

    return validatedResponse.data.pdfUrl;
  } catch (error: any) {
    console.error("generateLessonPlanPDF - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || "Failed to generate PDF");
  }
};

// Generate AI lesson plan via Dify API
export const generateAILessonPlan = async (query: string, conversationId: string = "") => {
  try {
    console.log("generateAILessonPlan - Request Data:", { query, conversationId });
    const payload = {
      query,
      user_id: "abc-123",
      conversation_id: conversationId,
    };
    const response = await apiRequest("POST", "/api/ai-lesson-plan", payload);
    console.log("generateAILessonPlan - Raw Response:", JSON.stringify(response, null, 2));

    const validatedResponse = AILessonPlanResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("generateAILessonPlan - Validation error details:", {
        errors: validatedResponse.error.flatten(),
        issues: validatedResponse.error.issues,
        responseData: response,
      });
      throw new Error("Invalid response format from server");
    }

    return validatedResponse.data;
  } catch (error: any) {
    console.error("generateAILessonPlan - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(errorMessages[error.message] || "Failed to generate AI lesson plan");
  }
};

// Normalize time to HH:mm
function normalizeTime(time?: string | null): string {
  if (!time) return "";
  try {
    if (time.includes("T")) {
      return new Date(time).toISOString().slice(11, 16);
    }
    return time.slice(0, 5);
  } catch {
    return "";
  }
}

















// Notifications








export const getUnreadNotificationsCount = async () => {
  try {
    console.log("getUnreadNotificationsCount - Fetching unread count");
    const response = await apiRequest("GET", "/api/notifications/unread-count");
    console.log("getUnreadNotificationsCount - Response:", response);
    return response;
  } catch (error: any) {
    console.error("getUnreadNotificationsCount - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return { unread_count: 0 };
  }
};

export const getNotifications = async () => {
  try {
    console.log("getNotifications - Fetching notifications");
    const response = await apiRequest("GET", "/api/notifications");
    console.log("getNotifications - Response:", response);
    return response;
  } catch (error: any) {
    console.error("getNotifications - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const createNotification = async (notificationData: {
  recipient: string;
  message: string;
  lessonPlanId?: string;
}) => {
  try {
    console.log("createNotification - Sending data:", notificationData);
    const response = await apiRequest("POST", "/api/notifications", notificationData);
    console.log("createNotification - Response:", response);
    return response;
  } catch (error: any) {
    console.error("createNotification - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Supervisor Operations
export const createSupervisor = async (supervisorData: SupervisorSchemaType) => {
  return apiRequest("POST", "/api/admin/supervisors", supervisorData);
};

export const updateSupervisor = async (id: string, supervisorData: Partial<SupervisorSchemaType>) => {
  return apiRequest("PUT", `/api/admin/supervisors/${id}`, supervisorData);
};

export const deleteSupervisor = async (id: string) => {
  return apiRequest("DELETE", `/api/admin/supervisors/${id}`);
};

export const getSupervisors = async (page: number, search: string, sex?: string) => {
  return apiRequest("GET", "/api/admin/supervisors", undefined, { page, search, sex });
};

export const getSupervisedTrainees = async (supervisorId: string) => {
  return apiRequest("GET", `/api/supervisors/${supervisorId}/trainees`);
};

export const markAttendance = async (supervisorId: string, data: { traineeId: string; date: string; status: "present" | "absent" | "late" }) => {
  return apiRequest("POST", `/api/supervisors/${supervisorId}/mark-attendance`, data);
};

// export const sendFeedback = async (feedbackData: {
//   supervisorId: string;
//   category: string;
//   feedback: string;
//   traineeId?: string;
//   traineeIds?: string[];
// }) => {
//   return apiRequest("POST", "/api/supervisors/feedback", feedbackData);
// };

// Trainee Operations
export const getTrainees = async (page: number, search: string, sex?: string) => {
  return apiRequest("GET", "/api/admin/trainees", undefined, { page, search, sex });
};

export const getTrainee = async (id: string) => {
  return apiRequest("GET", `/api/trainees/${id}`);
};


export const getSupervisorTrainees = async (page: number, search: string, sex?: string) => {
  return apiRequest("GET", "/api/supervisor/trainees", undefined, { page, search, sex });
};


// export const getSupervisorTrainees = async (
//   page: number,
//   search: string,
//   sex: string
// ) => {
//   const params: any = { page };
//   if (search) params.search = search;
//   if (sex) params.sex = sex;

//   try {
//     const response = await apiRequest("GET", "/api/supervisor/trainees", {
//       params,
//       token: document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("token="))
//         ?.split("=")[1],
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching supervisor trainees:", error);
//     throw new Error(error.response?.data?.error || "Failed to fetch supervisor trainees");
//   }
// };












export const getTraineeProfile = async () => {
  return apiRequest("GET", "/api/trainees/me");
};

export const getTraineeAssignment = async (id: string) => {
  return apiRequest("GET", `/api/tp-assignments/${id}`);
};

export const getTraineeLessons = async (id: string, page: number, limit: number) => {
  try {
    console.log(`getTraineeLessons - Fetching lessons for trainee ${id}, page ${page}, limit ${limit}`);
    const response = await apiRequest("GET", "/api/lesson-plans", undefined, { traineeId: id, page, limit });
    console.log(`getTraineeLessons - Response for trainee ${id}:`, response);
    const lessonPlansResponseSchema = z.object({
      lessonPlans: z.array(LessonPlanResponseSchema),
      totalCount: z.number().min(0),
      totalPages: z.number().min(1),
    });
    const validatedResponse = lessonPlansResponseSchema.parse(response);
    return {
      ...validatedResponse,
      lessonPlans: validatedResponse.lessonPlans.map(plan => ({
        ...plan,
        startTime: plan.startTime?.slice(0, 5) || "",
        endTime: plan.endTime?.slice(0, 5) || "",
      })),
    };
  } catch (error: any) {
    console.error(`getTraineeLessons - Error for trainee ${id}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return { lessonPlans: [], totalCount: 0, totalPages: 1 };
  }
};

export const getTraineeFeedbackHistory = async (traineeId: string) => {
  return apiRequest("GET", `/api/trainees/${traineeId}/feedback-history`);
};

export const evaluateTrainee = async (evaluationData: {
  traineeId: string;
  supervisorId: string;
  score: number;
  comments: string;
  tpAssignmentId: string;
  submittedAt?: string;
}) => {
  return apiRequest("POST", "/api/supervisor/student_evaluations", evaluationData);
};

export const createTrainee = async (traineeData: TraineeSchemaType) => {
  return apiRequest("POST", "/api/admin/trainees", traineeData);
};

export const updateTrainee = async (id: string, traineeData: Partial<TraineeSchemaType>) => {
  return apiRequest("PUT", `/api/admin/trainees/${id}`, traineeData);
};

export const deleteTrainee = async (id: string) => {
  return apiRequest("DELETE", `/api/admin/trainees/${id}`);
};

// Student Evaluation Operations
export const getStudentEvaluations = async (page: number, search?: string) => {
  return apiRequest("GET", "/api/admin/student_evaluations", undefined, { page, search });
};

export const getSupervisorStudentEvaluations = async (page: number, search?: string) => {
  return apiRequest("GET", "/api/supervisor/student_evaluations", undefined, { page, search });
};

export const submitStudentEvaluation = async (data: {
  tpAssignmentId: string;
  traineeId: string;
  supervisorId: string;
  score: number;
  comments?: string;
  submittedAt?: string;
}) => {
  return apiRequest("POST", "/api/admin/student_evaluations", data);
};

export const updateStudentEvaluation = async (id: string, data: {
  tpAssignmentId: string;
  traineeId: string;
  supervisorId: string;
  score: number;
  comments?: string;
  submittedAt?: string;
}) => {
  return apiRequest("PUT", `/api/admin/student_evaluations/${id}`, data);
};

export const deleteStudentEvaluation = async (id: string) => {
  return apiRequest("DELETE", `/api/admin/student_evaluations/${id}`);
};

// Supervisor Evaluation Operations
export const getSupervisorEvaluations = async (page: number, search?: string) => {
  return apiRequest("GET", "/api/admin/supervisor_evaluations", undefined, { page, search });
};

export const submitSupervisorEvaluation = async (data: {
  supervisorId: string;
  rating: number;
  comments?: string;
  timestamp?: string;
}) => {
  return apiRequest("POST", "/api/admin/supervisor_evaluations", data);
};

export const updateSupervisorEvaluation = async (id: string, data: {
  supervisorId: string;
  rating: number;
  comments?: string;
  timestamp?: string;
}) => {
  return apiRequest("PUT", `/api/admin/supervisor_evaluations/${id}`, data);
};

export const deleteSupervisorEvaluation = async (id: string) => {
  return apiRequest("DELETE", `/api/admin/supervisor_evaluations/${id}`);
};

// TP Assignment Operations
export const getTPAssignments = async (page: number, search: string) => {
  return apiRequest("GET", "/api/admin/tp_assignments", undefined, { page, search });
};

export const assignTP = async (
  data: { id?: string; traineeId: string; schoolId: string; supervisorId: string; startDate?: string; endDate?: string },
  action: "create" | "update"
) => {
  const endpoint = action === "create" ? "/api/admin/tp_assignments" : `/api/admin/tp_assignments/${data.id}`;
  const method = action === "create" ? "POST" : "PUT";
  return apiRequest(method, endpoint, {
    traineeId: data.traineeId,
    schoolId: data.schoolId,
    supervisorId: data.supervisorId,
    startDate: data.startDate,
    endDate: data.endDate,
  });
};

export const deleteTPAssignment = async (id: string) => {
  return apiRequest("DELETE", `/api/admin/tp_assignments/${id}`);
};

// School Operations
export const getSchools = async (page: number, search: string, typeFilter: string) => {
  return apiRequest("GET", "/api/admin/schools", undefined, { page, search, type: typeFilter });
};

export const createSchool = async (schoolData: { name: string; address: string; type: string }) => {
  return apiRequest("POST", "/api/admin/schools", schoolData);
};

export const updateSchool = async (id: string, schoolData: { name: string; address: string; type: string }) => {
  return apiRequest("PUT", `/api/admin/schools/${id}`, schoolData);
};

export const deleteSchool = async (id: string) => {
  return apiRequest("DELETE", `/api/admin/schools/${id}`);
};

// Event Operations
export const getEvents = async (date: string) => {
  return apiRequest("GET", "/api/events", undefined, { date });
};

export const createEvent = async (data: { title: string; description: string; startTime: string; endTime: string }) => {
  return apiRequest("POST", "/api/events", data);
};

// Announcement Operations
export const getAnnouncements = async (limit: number = 3) => {
  return apiRequest("GET", "/api/announcements", undefined, { limit });
};

// Report Operations
export const getReports = async () => {
  return apiRequest("GET", "/api/admin/reports");
};

export const getTraineeGender = async () => {
  return apiRequest("GET", "/api/admin/trainee-gender");
};

export const getReportPreview = async (params: { regNo?: string; startDate?: string; endDate?: string; tpLocation?: string }) => {
  return apiRequest("GET", "/api/admin/reports/preview", undefined, params);
};

export const getAssignmentsBySchool = async () => {
  return apiRequest("GET", "/api/admin/assignments-by-school");
};

// Other Operations
export const getPlacesOfTP = async () => {
  return apiRequest("GET", "/api/places-of-tp");
};

export const checkTPPeriod = async () => {
  return apiRequest("GET", "/api/admin/check-tp-period");
};

export const updateNotification = async (notificationId: string, read_status: boolean) => {
  return apiRequest("PUT", `/api/notifications/${notificationId}`, { read_status });
};

export const deleteNotification = async (notificationId: string) => {
  return apiRequest("DELETE", `/api/notifications/${notificationId}`);
};

// Evaluations
export const submitEvaluation = async (data: {
  trainee_id: string;
  school: string;
  eval_id: string;
  startTime: string;
  endTime: string;
}) => {
  return apiRequest("POST", "/api/evaluations", data);
};








// // Supervisor Operations
// export const createSupervisor = async (supervisorData: SupervisorSchemaType) => {
//   try {
//     console.log("createSupervisor - Request Data:", JSON.stringify(supervisorData, null, 2));
//     const response = await apiRequest("POST", "/api/admin/supervisors", supervisorData);
//     console.log("createSupervisor - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("createSupervisor - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(errorMessages[error.message] || "Failed to create supervisor");
//   }
// };

// export const updateSupervisor = async (id: string, supervisorData: Partial<SupervisorSchemaType>) => {
//   try {
//     console.log(`updateSupervisor - Request Data for ID ${id}:`, JSON.stringify(supervisorData, null, 2));
//     const response = await apiRequest("PUT", `/api/admin/supervisors/${id}`, supervisorData);
//     console.log("updateSupervisor - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("updateSupervisor - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(errorMessages[error.message] || "Failed to update supervisor");
//   }
// };

// export const deleteSupervisor = async (id: string) => {
//   try {
//     console.log(`deleteSupervisor - Deleting ID ${id}`);
//     const response = await apiRequest("DELETE", `/api/admin/supervisors/${id}`);
//     console.log("deleteSupervisor - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("deleteSupervisor - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(errorMessages[error.message] || "Failed to delete supervisor");
//   }
// };

// export const getSupervisors = async (page: number, search: string, sex?: string) => {
//   try {
//     console.log(`getSupervisors - Fetching page ${page}, search ${search || "none"}, sex ${sex || "none"}`);
//     const response = await apiRequest("GET", "/api/admin/supervisors", undefined, { page, search, sex });
//     console.log("getSupervisors - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("getSupervisors - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw new Error(errorMessages[error.message] || "Failed to fetch supervisors");
//   }
// };

export const getSupervisorProfile = async (id: string) => {
  try {
    console.log(`getSupervisorProfile - Fetching ID ${id}`);
    const response = await apiRequest("GET", `/api/getsupervisors/${id}`);
    console.log("getSupervisorProfile - Raw Response:", JSON.stringify(response, null, 2));
    const validatedResponse = SupervisorProfileSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("getSupervisorProfile - Validation error:", validatedResponse.error.flatten());
      throw new Error("Invalid response format from server");
    }
    return {
      ...validatedResponse.data,
      createdAt: validatedResponse.data.createdAt || "",
      lessonPlans: validatedResponse.data.lessonPlans.map(plan => ({
        ...plan,
        startTime: normalizeTime(plan.startTime),
        endTime: normalizeTime(plan.endTime),
        createdAt: plan.createdAt || "",
      })),
      schedules: validatedResponse.data.schedules.map(schedule => ({
        ...schedule,
        start_time: normalizeTime(schedule.start_time),
        end_time: normalizeTime(schedule.end_time),
        created_at: schedule.created_at || "",
      })),
    };
  } catch (error: any) {
    console.error("getSupervisorProfile - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(errorMessages[error.message] || "Failed to fetch supervisor profile");
  }
};

// export const getSupervisedTrainees = async (supervisorId: string, page: number = 1) => {
//   try {
//     console.log(`getSupervisedTrainees - Fetching for supervisor ${supervisorId}, page ${page}`);
//     const response = await apiRequest("GET", `/api/supervisors/${supervisorId}/trainees`, undefined, { page });
//     console.log("getSupervisedTrainees - Raw Response:", JSON.stringify(response, null, 2));
//     const validatedResponse = SupervisedTraineesResponseSchema.safeParse(response);
//     if (!validatedResponse.success) {
//       console.error("getSupervisedTrainees - Validation error:", validatedResponse.error.flatten());
//       return { trainees: [], totalCount: 0, totalPages: 1, currentPage: 1 };
//     }
//     return validatedResponse.data;
//   } catch (error: any) {
//     console.error("getSupervisedTrainees - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     if (error.response?.status === 404) {
//       return { trainees: [], totalCount: 0, totalPages: 1, currentPage: 1 };
//     }
//     throw new Error(errorMessages[error.message] || "Failed to fetch supervised trainees");
//   }
// };

export const getSupervisorSchedules = async (supervisorId: string, page: number = 1, status?: string) => {
  try {
    console.log(`getSupervisorSchedules - Fetching for supervisor ${supervisorId}, page ${page}, status ${status || "none"}`);
    const response = await apiRequest("GET", `/api/supervisors/${supervisorId}/schedules`, undefined, { page, status });
    console.log("getSupervisorSchedules - Raw Response:", JSON.stringify(response, null, 2));
    const validatedResponse = SupervisorSchedulesResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("getSupervisorSchedules - Validation error:", validatedResponse.error.flatten());
      return { schedules: [], totalCount: 0, totalPages: 1, currentPage: 1 };
    }
    return {
      ...validatedResponse.data,
      schedules: validatedResponse.data.schedules.map(schedule => ({
        ...schedule,
        start_time: normalizeTime(schedule.start_time),
        end_time: normalizeTime(schedule.end_time),
      })),
    };
  } catch (error: any) {
    console.error("getSupervisorSchedules - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    if (error.response?.status === 404) {
      return { schedules: [], totalCount: 0, totalPages: 1, currentPage: 1 };
    }
    throw new Error(errorMessages[error.message] || "Failed to fetch supervisor schedules");
  }
};

export const reviewLessonPlan = async (supervisorId: string, lessonPlanId: string, reviewData: z.infer<typeof LessonPlanReviewSchema>) => {
  try {
    console.log(`reviewLessonPlan - Reviewing lesson plan ${lessonPlanId} for supervisor ${supervisorId}:`, JSON.stringify(reviewData, null, 2));
    const validatedData = LessonPlanReviewSchema.parse(reviewData);
    const response = await apiRequest("PUT", `/api/supervisors/${supervisorId}/lesson-plans/${lessonPlanId}/review`, validatedData);
    console.log("reviewLessonPlan - Raw Response:", JSON.stringify(response, null, 2));
    const validatedResponse = LessonPlanReviewResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("reviewLessonPlan - Validation error:", validatedResponse.error.flatten());
      throw new Error("Invalid response format from server");
    }
    return {
      ...validatedResponse.data,
      lessonPlan: {
        ...validatedResponse.data.lessonPlan,
        startTime: normalizeTime(validatedResponse.data.lessonPlan.startTime),
        endTime: normalizeTime(validatedResponse.data.lessonPlan.endTime),
        traineeId: String(validatedResponse.data.lessonPlan.traineeId),
        schoolId: validatedResponse.data.lessonPlan.schoolId ? String(validatedResponse.data.lessonPlan.schoolId) : undefined,
        supervisorId: validatedResponse.data.lessonPlan.supervisorId ? String(validatedResponse.data.lessonPlan.supervisorId) : undefined,
      },
    };
  } catch (error: any) {
    console.error("reviewLessonPlan - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(errorMessages[error.message] || "Failed to review lesson plan");
  }
};

export const scheduleObservation = async (supervisorId: string, scheduleData: z.infer<typeof ObservationScheduleSchema>) => {
  try {
    console.log(`scheduleObservation - Scheduling for supervisor ${supervisorId}:`, JSON.stringify(scheduleData, null, 2));
    const validatedData = ObservationScheduleSchema.parse(scheduleData);
    const response = await apiRequest("POST", `/api/supervisors/${supervisorId}/schedule-observation`, validatedData);
    console.log("scheduleObservation - Raw Response:", JSON.stringify(response, null, 2));
    const validatedResponse = ObservationScheduleResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("scheduleObservation - Validation error:", validatedResponse.error.flatten());
      throw new Error("Invalid response format from server");
    }
    return {
      ...validatedResponse.data,
      schedule: {
        ...validatedResponse.data.schedule,
        start_time: normalizeTime(validatedResponse.data.schedule.start_time),
        end_time: normalizeTime(validatedResponse.data.schedule.end_time),
      },
    };
  } catch (error: any) {
    console.error("scheduleObservation - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(errorMessages[error.message] || "Failed to schedule observation");
  }
};

export const submitObservationFeedback = async (supervisorId: string, observationId: string, feedbackData: z.infer<typeof ObservationFeedbackSchema>) => {
  try {
    console.log(`submitObservationFeedback - Submitting feedback for observation ${observationId}, supervisor ${supervisorId}:`, JSON.stringify(feedbackData, null, 2));
    const validatedData = ObservationFeedbackSchema.parse(feedbackData);
    const response = await apiRequest("POST", `/api/supervisors/${supervisorId}/observations/${observationId}/feedback`, validatedData);
    console.log("submitObservationFeedback - Raw Response:", JSON.stringify(response, null, 2));
    const validatedResponse = ObservationFeedbackResponseSchema.safeParse(response);
    if (!validatedResponse.success) {
      console.error("submitObservationFeedback - Validation error:", validatedResponse.error.flatten());
      throw new Error("Invalid response format from server");
    }
    return validatedResponse.data;
  } catch (error: any) {
    console.error("submitObservationFeedback - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(errorMessages[error.message] || "Failed to submit observation feedback");
  }
};


export const sendFeedback = async (feedbackData: {
  supervisorId: string;
  category: string;
  feedback: string;
  traineeId?: string;
  traineeIds?: string[];
}) => {
  try {
    console.log(`sendFeedback - Sending feedback:`, JSON.stringify(feedbackData, null, 2));
    const response = await apiRequest("POST", "/api/supervisors/feedback", feedbackData);
    console.log("sendFeedback - Response:", response);
    return response;
  } catch (error: any) {
    console.error("sendFeedback - Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(errorMessages[error.message] || "Failed to send feedback");
  }
};





















// import axios from "axios";
// import { z } from "zod";
// import { SupervisorSchemaType, TraineeSchemaType } from "@/lib/formValidationSchemas";

// // Schema for LessonPlan
// export const LessonPlanSchemaType = z.object({
//   title: z.string().min(1, "Title is required"),
//   subject: z.string().min(1, "Subject is required"),
//   date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
//   startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format").optional(),
//   endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format").optional(),
//   objectives: z.string().min(1, "Objectives are required"),
//   activities: z.string().min(1, "Activities are required"),
//   resources: z.string().min(1, "Resources are required"),
//   aiGenerated: z.boolean().optional(),
// });

// // Extended schema for API response including additional fields
// const LessonPlanResponseSchema = LessonPlanSchemaType.extend({
//   id: z.string(),
//   traineeId: z.string(),
//   createdAt: z.string(),
//   status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
//   traineeName: z.string().optional(),
//   supervisorName: z.string().optional(),
//   schoolName: z.string().optional(),
//   pdfUrl: z.string().optional(),
// });

// export type LessonPlanSchemaType = z.infer<typeof LessonPlanSchemaType>;

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// // Error message mapping
// const errorMessages: Record<string, string> = {
//   "You already have a pending lesson plan. Please submit or delete it first.":
//     "You already have a pending lesson plan. Please submit or delete it first.",
//   "Invalid time format, expected HH:MM": "Please enter times in HH:MM format (e.g., 09:00).",
//   "End time must be after start time": "End time must be later than start time.",
//   "Invalid date format, expected YYYY-MM-DD": "Please enter date in YYYY-MM-DD format.",
//   "Missing required fields": "Please fill in all required fields.",
//   "Invalid or expired token": "Your session has expired. Please log in again.",
//   "Unauthorized": "You are not authorized to perform this action.",
//   "Network Error": "Failed to connect to the server. Please check your network or try again later.",
// };

// export const apiRequest = async (method: string, endpoint: string, data?: any, params?: any, retries = 2): Promise<any> => {
//   const token = localStorage.getItem("token") || document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     console.warn(`API Request: ${method} ${API_BASE_URL}${endpoint} - No token found`);
//     throw new Error("No token found");
//   }

//   const config = {
//     method,
//     url: `${API_BASE_URL}${endpoint}`,
//     data,
//     params,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     withCredentials: true,
//     timeout: 60000,
//     cache: "no-store",
//   };

//   console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`, {
//     data,
//     params,
//     token: token.substring(0, 10) + "...",
//     headers: config.headers,
//   });

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const response = await axios(config);
//       console.log(`API Response: ${method} ${endpoint}`, {
//         status: response.status,
//         data: response.data,
//         headers: response.headers,
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error(`API Request Error (${method} ${endpoint}, attempt ${attempt}):`, {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         headers: error.response?.headers,
//         config,
//         code: error.code,
//       });

//       if (attempt === retries) {
//         const message = error.response?.data?.error || error.message || "An unexpected error occurred";
//         throw new Error(errorMessages[message] || message);
//       }

//       await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
//     }
//   }
// };

// // Authentication
// export const verifyToken = async () => {
//   return apiRequest("GET", "/api/verify");
// };

// export const login = async (data: { userType: string; identifier: string; password: string }) => {
//   return apiRequest("POST", "/api/login", data);
// };

// // Lesson Plan Operations
// export const createLessonPlan = async (data: LessonPlanSchemaType) => {
//   try {
//     const validatedData = LessonPlanSchemaType.parse(data);
//     console.log("createLessonPlan - Sending data:", validatedData);
//     const response = await apiRequest("POST", "/api/lesson-plans", validatedData);
//     console.log("createLessonPlan - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("createLessonPlan - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const updateLessonPlan = async (id: string, data: Partial<LessonPlanSchemaType>) => {
//   try {
//     const validatedData = LessonPlanSchemaType.partial().parse(data);
//     console.log(`updateLessonPlan - Sending data for id ${id}:`, validatedData);
//     const response = await apiRequest("PUT", `/api/lesson-plans/${id}`, validatedData);
//     console.log(`updateLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`updateLessonPlan - Error for id ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const deleteLessonPlan = async (id: string) => {
//   try {
//     console.log(`deleteLessonPlan - Deleting id ${id}`);
//     const response = await apiRequest("DELETE", `/api/lesson-plans/${id}`);
//     console.log(`deleteLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`deleteLessonPlan - Error for id ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const getLessonPlan = async (id: string) => {
//   try {
//     console.log(`getLessonPlan - Fetching id ${id}`);
//     const response = await apiRequest("GET", `/api/lesson-plans/${id}`);
//     console.log(`getLessonPlan - Response for id ${id}:`, response);
//     return LessonPlanResponseSchema.parse(response);
//   } catch (error: any) {
//     console.error(`getLessonPlan - Error for id ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const getLessonPlans = async (
//   traineeId?: string,
//   page: number = 1,
//   limit: number = 10,
//   search?: string,
//   subject?: string,
//   status?: string
// ) => {
//   try {
//     console.log(`getLessonPlans - Fetching page ${page}, limit ${limit}, traineeId ${traineeId || "none"}, search ${search || "none"}, subject ${subject || "none"}, status ${status || "none"}`);
//     const response = await apiRequest("GET", "/api/lesson-plans", undefined, {
//       traineeId,
//       page,
//       limit,
//       search,
//       subject,
//       status,
//     });
//     console.log("getLessonPlans - Response:", response);

//     // Validate and transform response
//     const lessonPlansResponseSchema = z.object({
//       lessonPlans: z.array(LessonPlanResponseSchema),
//       totalCount: z.number().min(0),
//       totalPages: z.number().min(1),
//     });

//     const validatedResponse = lessonPlansResponseSchema.parse(response);
//     return validatedResponse;
//   } catch (error: any) {
//     console.error("getLessonPlans - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     // Fallback for non-critical errors
//     if (error.response?.status === 404 || error.message.includes("Invalid data")) {
//       return { lessonPlans: [], totalCount: 0, totalPages: 1 };
//     }
//     throw error;
//   }
// };

// // Notifications
// export const getUnreadNotificationsCount = async () => {
//   try {
//     console.log("getUnreadNotificationsCount - Fetching unread count");
//     const response = await apiRequest("GET", "/api/notifications/unread-count");
//     console.log("getUnreadNotificationsCount - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("getUnreadNotificationsCount - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     return { unread_count: 0 };
//   }
// };

// export const getNotifications = async () => {
//   try {
//     console.log("getNotifications - Fetching notifications");
//     const response = await apiRequest("GET", "/api/notifications");
//     console.log("getNotifications - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("getNotifications - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const createNotification = async (notificationData: {
//   recipient: string;
//   message: string;
//   lessonPlanId?: string;
// }) => {
//   try {
//     console.log("createNotification - Sending data:", notificationData);
//     const response = await apiRequest("POST", "/api/notifications", notificationData);
//     console.log("createNotification - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("createNotification - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// // Supervisor Operations
// export const createSupervisor = async (supervisorData: SupervisorSchemaType) => {
//   return apiRequest("POST", "/api/admin/supervisors", supervisorData);
// };

// export const updateSupervisor = async (id: string, supervisorData: Partial<SupervisorSchemaType>) => {
//   return apiRequest("PUT", `/api/admin/supervisors/${id}`, supervisorData);
// };

// export const deleteSupervisor = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/supervisors/${id}`);
// };

// export const getSupervisors = async (page: number, search: string, sex?: string) => {
//   return apiRequest("GET", "/api/admin/supervisors", undefined, { page, search, sex });
// };

// export const getSupervisedTrainees = async (supervisorId: string) => {
//   return apiRequest("GET", `/api/supervisors/${supervisorId}/trainees`);
// };

// export const markAttendance = async (supervisorId: string, data: { traineeId: string; date: string; status: "present" | "absent" | "late" }) => {
//   return apiRequest("POST", `/api/supervisors/${supervisorId}/mark-attendance`, data);
// };

// export const sendFeedback = async (feedbackData: {
//   supervisorId: string;
//   category: string;
//   feedback: string;
//   traineeId?: string;
//   traineeIds?: string[];
// }) => {
//   return apiRequest("POST", "/api/supervisors/feedback", feedbackData);
// };

// // Trainee Operations
// export const getTrainees = async (page: number, search: string, sex?: string) => {
//   return apiRequest("GET", "/api/admin/trainees", undefined, { page, search, sex });
// };

// export const getTrainee = async (id: string) => {
//   return apiRequest("GET", "/api/trainees/me");
// };

// export const getTraineeProfile = async () => {
//   return apiRequest("GET", "/api/trainees/me");
// };

// export const getTraineeAssignment = async (id: string) => {
//   return apiRequest("GET", `/api/tp-assignments/${id}`);
// };

// export const getTraineeLessons = async (id: string, page: number, limit: number) => {
//   try {
//     console.log(`getTraineeLessons - Fetching lessons for trainee ${id}, page ${page}, limit ${limit}`);
//     const response = await apiRequest("GET", "/api/lesson-plans", undefined, { traineeId: id, page, limit });
//     console.log(`getTraineeLessons - Response for trainee ${id}:`, response);
//     return response || { lessonPlans: [], totalCount: 0, page, limit };
//   } catch (error: any) {
//     console.error(`getTraineeLessons - Error for trainee ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     return { lessonPlans: [], totalCount: 0, page, limit };
//   }
// };

// export const getTraineeFeedbackHistory = async (traineeId: string) => {
//   return apiRequest("GET", `/api/trainees/${traineeId}/feedback-history`);
// };

// export const evaluateTrainee = async (evaluationData: {
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments: string;
//   tpAssignmentId: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("POST", "/api/supervisor/student_evaluations", evaluationData);
// };

// export const createTrainee = async (traineeData: TraineeSchemaType) => {
//   return apiRequest("POST", "/api/admin/trainees", traineeData);
// };

// export const updateTrainee = async (id: string, traineeData: Partial<TraineeSchemaType>) => {
//   return apiRequest("PUT", `/api/admin/trainees/${id}`, traineeData);
// };

// export const deleteTrainee = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/trainees/${id}`);
// };

// // Student Evaluation Operations
// export const getStudentEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/admin/student_evaluations", undefined, { page, search });
// };

// export const getSupervisorStudentEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/supervisor/student_evaluations", undefined, { page, search });
// };

// export const submitStudentEvaluation = async (data: {
//   tpAssignmentId: string;
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments?: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("POST", "/api/admin/student_evaluations", data);
// };

// export const updateStudentEvaluation = async (id: string, data: {
//   tpAssignmentId: string;
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments?: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("PUT", `/api/admin/student_evaluations/${id}`, data);
// };

// export const deleteStudentEvaluation = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/student_evaluations/${id}`);
// };

// // Supervisor Evaluation Operations
// export const getSupervisorEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/admin/supervisor_evaluations", undefined, { page, search });
// };

// export const submitSupervisorEvaluation = async (data: {
//   supervisorId: string;
//   rating: number;
//   comments?: string;
//   timestamp?: string;
// }) => {
//   return apiRequest("POST", "/api/admin/supervisor_evaluations", data);
// };

// export const updateSupervisorEvaluation = async (id: string, data: {
//   supervisorId: string;
//   rating: number;
//   comments?: string;
//   timestamp?: string;
// }) => {
//   return apiRequest("PUT", `/api/admin/supervisor_evaluations/${id}`, data);
// };

// export const deleteSupervisorEvaluation = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/supervisor_evaluations/${id}`);
// };

// // TP Assignment Operations
// export const getTPAssignments = async (page: number, search: string) => {
//   return apiRequest("GET", "/api/admin/tp_assignments", undefined, { page, search });
// };

// export const assignTP = async (
//   data: { id?: string; traineeId: string; schoolId: string; supervisorId: string; startDate?: string; endDate?: string },
//   action: "create" | "update"
// ) => {
//   const endpoint = action === "create" ? "/api/admin/tp_assignments" : `/api/admin/tp_assignments/${data.id}`;
//   const method = action === "create" ? "POST" : "PUT";
//   return apiRequest(method, endpoint, {
//     traineeId: data.traineeId,
//     schoolId: data.schoolId,
//     supervisorId: data.supervisorId,
//     startDate: data.startDate,
//     endDate: data.endDate,
//   });
// };

// export const deleteTPAssignment = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/tp_assignments/${id}`);
// };

// // School Operations
// export const getSchools = async (page: number, search: string, typeFilter: string) => {
//   return apiRequest("GET", "/api/admin/schools", undefined, { page, search, type: typeFilter });
// };

// export const createSchool = async (schoolData: { name: string; address: string; type: string }) => {
//   return apiRequest("POST", "/api/admin/schools", schoolData);
// };

// export const updateSchool = async (id: string, schoolData: { name: string; address: string; type: string }) => {
//   return apiRequest("PUT", `/api/admin/schools/${id}`, schoolData);
// };

// export const deleteSchool = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/schools/${id}`);
// };

// // Event Operations
// export const getEvents = async (date: string) => {
//   return apiRequest("GET", "/api/events", undefined, { date });
// };

// export const createEvent = async (data: { title: string; description: string; startTime: string; endTime: string }) => {
//   return apiRequest("POST", "/api/events", data);
// };

// // Announcement Operations
// export const getAnnouncements = async (limit: number = 3) => {
//   return apiRequest("GET", "/api/announcements", undefined, { limit });
// };

// // Report Operations
// export const getReports = async () => {
//   return apiRequest("GET", "/api/admin/reports");
// };

// export const getTraineeGender = async () => {
//   return apiRequest("GET", "/api/admin/trainee-gender");
// };

// export const getReportPreview = async (params: { regNo?: string; startDate?: string; endDate?: string; tpLocation?: string }) => {
//   return apiRequest("GET", "/api/admin/reports/preview", undefined, params);
// };

// export const getAssignmentsBySchool = async () => {
//   return apiRequest("GET", "/api/admin/assignments-by-school");
// };

// // Other Operations
// export const getPlacesOfTP = async () => {
//   return apiRequest("GET", "/api/places-of-tp");
// };

// export const checkTPPeriod = async () => {
//   return apiRequest("GET", "/api/admin/check-tp-period");
// };

// export const updateNotification = async (notificationId: string, read_status: boolean) => {
//   return apiRequest("PUT", `/api/notifications/${notificationId}`, { read_status });
// };

// export const deleteNotification = async (notificationId: string) => {
//   return apiRequest("DELETE", `/api/notifications/${notificationId}`);
// };

// // Evaluations
// export const submitEvaluation = async (data: {
//   trainee_id: string;
//   school: string;
//   eval_id: string;
//   startTime: string;
//   endTime: string;
// }) => {
//   return apiRequest("POST", "/api/evaluations", data);
// };





















































// import axios from "axios";
// import { z } from "zod";
// import { SupervisorSchemaType, TraineeSchemaType } from "@/lib/formValidationSchemas";

// // Schema for LessonPlan
// export const LessonPlanSchemaType = z.object({
//   title: z.string().min(1, "Title is required"),
//   subject: z.string().min(1, "Subject is required"),
//   date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
//   startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
//   endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
//   objectives: z.string().min(1, "Objectives are required"),
//   activities: z.string().min(1, "Activities are required"),
//   resources: z.string().min(1, "Resources are required"),
//   aiGenerated: z.boolean().optional(),
// });

// export type LessonPlanSchemaType = z.infer<typeof LessonPlanSchemaType>;

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// // Error message mapping
// const errorMessages: Record<string, string> = {
//   "You already have a pending lesson plan. Please submit or delete it first.":
//     "You already have a pending lesson plan. Please submit or delete it first.",
//   "Invalid time format, expected HH:MM": "Please enter times in HH:MM format (e.g., 09:00).",
//   "End time must be after start time": "End time must be later than start time.",
//   "Invalid date format, expected YYYY-MM-DD": "Please enter date in YYYY-MM-DD format.",
//   "Missing required fields": "Please fill in all required fields.",
//   "Invalid or expired token": "Your session has expired. Please log in again.",
//   "Unauthorized": "You are not authorized to perform this action.",
//   "Network Error": "Failed to connect to the server. Please check your network or try again later.",
// };

// export const apiRequest = async (method: string, endpoint: string, data?: any, params?: any, retries = 2): Promise<any> => {
//   const token = localStorage.getItem("token") || document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     console.warn(`API Request: ${method} ${API_BASE_URL}${endpoint} - No token found`);
//     throw new Error("No token found");
//   }

//   const config = {
//     method,
//     url: `${API_BASE_URL}${endpoint}`,
//     data,
//     params,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     withCredentials: true,
//     timeout: 60000,
//     cache: "no-store",
//   };

//   console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`, {
//     data,
//     params,
//     token: token.substring(0, 10) + "...",
//     headers: config.headers,
//   });

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const response = await axios(config);
//       console.log(`API Response: ${method} ${endpoint}`, {
//         status: response.status,
//         data: response.data,
//         headers: response.headers,
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error(`API Request Error (${method} ${endpoint}, attempt ${attempt}):`, {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         headers: error.response?.headers,
//         config,
//         code: error.code,
//       });

//       if (attempt === retries) {
//         const message = error.response?.data?.error || error.message || "An unexpected error occurred";
//         throw new Error(errorMessages[message] || message);
//       }

//       await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
//     }
//   }
// };

// // Authentication
// export const verifyToken = async () => {
//   return apiRequest("GET", "/api/verify");
// };

// export const login = async (data: { userType: string; identifier: string; password: string }) => {
//   return apiRequest("POST", "/api/login", data);
// };

// // Lesson Plan Operations
// export const createLessonPlan = async (data: LessonPlanSchemaType) => {
//   try {
//     const validatedData = LessonPlanSchemaType.parse(data);
//     console.log("createLessonPlan - Sending data:", validatedData);
//     const response = await apiRequest("POST", "/api/lesson-plans", validatedData);
//     console.log("createLessonPlan - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("createLessonPlan - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error; // Propagate raw error to be handled by caller
//   }
// };

// export const updateLessonPlan = async (id: string, data: Partial<LessonPlanSchemaType>) => {
//   try {
//     const validatedData = LessonPlanSchemaType.partial().parse(data);
//     console.log(`updateLessonPlan - Sending data for id ${id}:`, validatedData);
//     const response = await apiRequest("PUT", `/api/lesson-plans/${id}`, validatedData);
//     console.log(`updateLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`updateLessonPlan - Error for id ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const deleteLessonPlan = async (id: string) => {
//   try {
//     console.log(`deleteLessonPlan - Deleting id ${id}`);
//     const response = await apiRequest("DELETE", `/api/lesson-plans/${id}`);
//     console.log(`deleteLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`deleteLessonPlan - Error for id ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const getLessonPlan = async (id: string) => {
//   try {
//     console.log(`getLessonPlan - Fetching id ${id}`);
//     const response = await apiRequest("GET", `/api/lesson-plans/${id}`);
//     console.log(`getLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`getLessonPlan - Error for id ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// export const getLessonPlans = async (traineeId?: string, page: number = 1, limit: number = 10) => {
//   try {
//     console.log(`getLessonPlans - Fetching page ${page}, limit ${limit}, traineeId ${traineeId || "none"}`);
//     const response = await apiRequest("GET", "/api/lesson-plans", undefined, { traineeId, page, limit });
//     console.log("getLessonPlans - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("getLessonPlans - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// // Notifications
// export const getUnreadNotificationsCount = async () => {
//   try {
//     console.log("getUnreadNotificationsCount - Fetching unread count");
//     const response = await apiRequest("GET", "/api/notifications/unread-count");
//     console.log("getUnreadNotificationsCount - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("getUnreadNotificationsCount - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     return { unread_count: 0 }; // Fallback to avoid breaking UI
//   }
// };

// export const getNotifications = async () => {
//   try {
//     console.log("getNotifications - Fetching notifications");
//     const response = await apiRequest("GET", "/api/notifications");
//     console.log("getNotifications - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("getNotifications - Error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     throw error;
//   }
// };

// // Supervisor Operations
// export const createSupervisor = async (supervisorData: SupervisorSchemaType) => {
//   return apiRequest("POST", "/api/admin/supervisors", supervisorData);
// };

// export const updateSupervisor = async (id: string, supervisorData: Partial<SupervisorSchemaType>) => {
//   return apiRequest("PUT", `/api/admin/supervisors/${id}`, supervisorData);
// };

// export const deleteSupervisor = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/supervisors/${id}`);
// };

// export const getSupervisors = async (page: number, search: string, sex?: string) => {
//   return apiRequest("GET", "/api/admin/supervisors", undefined, { page, search, sex });
// };

// export const getSupervisedTrainees = async (supervisorId: string) => {
//   return apiRequest("GET", `/api/supervisors/${supervisorId}/trainees`);
// };

// export const markAttendance = async (supervisorId: string, data: { traineeId: string; date: string; status: "present" | "absent" | "late" }) => {
//   return apiRequest("POST", `/api/supervisors/${supervisorId}/mark-attendance`, data);
// };

// export const sendFeedback = async (feedbackData: {
//   supervisorId: string;
//   category: string;
//   feedback: string;
//   traineeId?: string;
//   traineeIds?: string[];
// }) => {
//   return apiRequest("POST", "/api/supervisors/feedback", feedbackData);
// };

// // Trainee Operations
// export const getTrainees = async (page: number, search: string, sex?: string) => {
//   return apiRequest("GET", "/api/admin/trainees", undefined, { page, search, sex });
// };

// export const getTrainee = async (id: string) => {
//   return apiRequest("GET", "/api/trainees/me");
// };

// export const getTraineeProfile = async () => {
//   return apiRequest("GET", "/api/trainees/me");
// };

// export const getTraineeAssignment = async (id: string) => {
//   return apiRequest("GET", `/api/tp-assignments/${id}`);
// };

// export const getTraineeLessons = async (id: string, page: number, limit: number) => {
//   try {
//     console.log(`getTraineeLessons - Fetching lessons for trainee ${id}, page ${page}, limit ${limit}`);
//     const response = await apiRequest("GET", "/api/lesson-plans", undefined, { traineeId: id, page, limit });
//     console.log(`getTraineeLessons - Response for trainee ${id}:`, response);
//     return response || { lessonPlans: [], totalCount: 0, page, limit };
//   } catch (error: any) {
//     console.error(`getTraineeLessons - Error for trainee ${id}:`, {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//     });
//     return { lessonPlans: [], totalCount: 0, page, limit };
//   }
// };

// export const getTraineeFeedbackHistory = async (traineeId: string) => {
//   return apiRequest("GET", `/api/trainees/${traineeId}/feedback-history`);
// };

// export const evaluateTrainee = async (evaluationData: {
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments: string;
//   tpAssignmentId: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("POST", "/api/supervisor/student_evaluations", evaluationData);
// };

// export const createTrainee = async (traineeData: TraineeSchemaType) => {
//   return apiRequest("POST", "/api/admin/trainees", traineeData);
// };

// export const updateTrainee = async (id: string, traineeData: Partial<TraineeSchemaType>) => {
//   return apiRequest("PUT", `/api/admin/trainees/${id}`, traineeData);
// };

// export const deleteTrainee = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/trainees/${id}`);
// };

// // Student Evaluation Operations
// export const getStudentEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/admin/student_evaluations", undefined, { page, search });
// };

// export const getSupervisorStudentEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/supervisor/student_evaluations", undefined, { page, search });
// };

// export const submitStudentEvaluation = async (data: {
//   tpAssignmentId: string;
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments?: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("POST", "/api/admin/student_evaluations", data);
// };

// export const updateStudentEvaluation = async (id: string, data: {
//   tpAssignmentId: string;
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments?: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("PUT", `/api/admin/student_evaluations/${id}`, data);
// };

// export const deleteStudentEvaluation = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/student_evaluations/${id}`);
// };

// // Supervisor Evaluation Operations
// export const getSupervisorEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/admin/supervisor_evaluations", undefined, { page, search });
// };

// export const submitSupervisorEvaluation = async (data: {
//   supervisorId: string;
//   rating: number;
//   comments?: string;
//   timestamp?: string;
// }) => {
//   return apiRequest("POST", "/api/admin/supervisor_evaluations", data);
// };

// export const updateSupervisorEvaluation = async (id: string, data: {
//   supervisorId: string;
//   rating: number;
//   comments?: string;
//   timestamp?: string;
// }) => {
//   return apiRequest("PUT", `/api/admin/supervisor_evaluations/${id}`, data);
// };

// export const deleteSupervisorEvaluation = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/supervisor_evaluations/${id}`);
// };

// // TP Assignment Operations
// export const getTPAssignments = async (page: number, search: string) => {
//   return apiRequest("GET", "/api/admin/tp_assignments", undefined, { page, search });
// };

// export const assignTP = async (
//   data: { id?: string; traineeId: string; schoolId: string; supervisorId: string; startDate?: string; endDate?: string },
//   action: "create" | "update"
// ) => {
//   const endpoint = action === "create" ? "/api/admin/tp_assignments" : `/api/admin/tp_assignments/${data.id}`;
//   const method = action === "create" ? "POST" : "PUT";
//   return apiRequest(method, endpoint, {
//     traineeId: data.traineeId,
//     schoolId: data.schoolId,
//     supervisorId: data.supervisorId,
//     startDate: data.startDate,
//     endDate: data.endDate,
//   });
// };

// export const deleteTPAssignment = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/tp_assignments/${id}`);
// };

// // School Operations
// export const getSchools = async (page: number, search: string, typeFilter: string) => {
//   return apiRequest("GET", "/api/admin/schools", undefined, { page, search, type: typeFilter });
// };

// export const createSchool = async (schoolData: { name: string; address: string; type: string }) => {
//   return apiRequest("POST", "/api/admin/schools", schoolData);
// };

// export const updateSchool = async (id: string, schoolData: { name: string; address: string; type: string }) => {
//   return apiRequest("PUT", `/api/admin/schools/${id}`, schoolData);
// };

// export const deleteSchool = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/schools/${id}`);
// };

// // Event Operations
// export const getEvents = async (date: string) => {
//   return apiRequest("GET", "/api/events", undefined, { date });
// };

// export const createEvent = async (data: { title: string; description: string; startTime: string; endTime: string }) => {
//   return apiRequest("POST", "/api/events", data);
// };

// // Announcement Operations
// export const getAnnouncements = async (limit: number = 3) => {
//   return apiRequest("GET", "/api/announcements", undefined, { limit });
// };

// // Report Operations
// export const getReports = async () => {
//   return apiRequest("GET", "/api/admin/reports");
// };

// export const getTraineeGender = async () => {
//   return apiRequest("GET", "/api/admin/trainee-gender");
// };

// export const getReportPreview = async (params: { regNo?: string; startDate?: string; endDate?: string; tpLocation?: string }) => {
//   return apiRequest("GET", "/api/admin/reports/preview", undefined, params);
// };

// export const getAssignmentsBySchool = async () => {
//   return apiRequest("GET", "/api/admin/assignments-by-school");
// };

// // Other Operations
// export const getPlacesOfTP = async () => {
//   return apiRequest("GET", "/api/places-of-tp");
// };

// export const checkTPPeriod = async () => {
//   return apiRequest("GET", "/api/admin/check-tp-period");
// };

// export const createNotification = async (notificationData: {
//   user_id: string;
//   message: string;
//   type: "EVALUATION" | "ASSIGNMENT" | "EVENT" | "GENERAL" | "LESSON_PLAN";
//   priority: "LOW" | "MEDIUM" | "HIGH";
// }) => {
//   return apiRequest("POST", "/api/notifications", notificationData);
// };

// export const updateNotification = async (notificationId: string, read_status: boolean) => {
//   return apiRequest("PUT", `/api/notifications/${notificationId}`, { read_status });
// };

// export const deleteNotification = async (notificationId: string) => {
//   return apiRequest("DELETE", `/api/notifications/${notificationId}`);
// };

// // Evaluations
// export const submitEvaluation = async (data: {
//   trainee_id: string;
//   school: string;
//   eval_id: string;
//   startTime: string;
//   endTime: string;
// }) => {
//   return apiRequest("POST", "/api/evaluations", data);
// };


















































































// import axios from "axios";
// import { z } from "zod";
// import { SupervisorSchemaType, TraineeSchemaType, } from "@/lib/formValidationSchemas";

// // Schema for LessonPlan
// // export const LessonPlanSchemaType = z.object({
// //   title: z.string().min(1, "Title is required"),
// //   subject: z.string().min(1, "Subject is required"),
// //   date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
// //   startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
// //   endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
// //   objectives: z.string().min(1, "Objectives are required"),
// //   activities: z.string().min(1, "Activities are required"),
// //   resources: z.string().min(1, "Resources are required"),
// //   aiGenerated: z.boolean().optional(),
// // });


// export const LessonPlanSchemaType = z.object({
//   title: z.string().min(1, "Title is required"),
//   subject: z.string().min(1, "Subject is required"),
//   date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
//   startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
//   endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
//   objectives: z.string().min(1, "Objectives are required"),
//   activities: z.string().min(1, "Activities are required"),
//   resources: z.string().min(1, "Resources are required"),
//   aiGenerated: z.boolean().optional(),
// });

// export type LessonPlanSchemaType = z.infer<typeof LessonPlanSchemaType>;



// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// // Error message mapping
// const errorMessages: Record<string, string> = {
//   "You already have a pending lesson plan. Please submit or delete it first.": 
//     "You already have a pending lesson plan. Please submit or delete it first.",
//   "Invalid time format, expected HH:MM": "Please enter times in HH:MM format (e.g., 09:00).",
//   "End time must be after start time": "End time must be later than start time.",
//   "Invalid date format, expected YYYY-MM-DD": "Please enter date in YYYY-MM-DD format.",
//   "Missing required fields": "Please fill in all required fields.",
//   "Invalid or expired token": "Your session has expired. Please log in again.",
// };

// export const apiRequest = async (method: string, endpoint: string, data?: any, params?: any, retries = 2): Promise<any> => {
//   const token = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     console.warn(`API Request: ${method} ${API_BASE_URL}${endpoint} - No token found`);
//     throw new Error("No token found");
//   }

//   const config = {
//     method,
//     url: `${API_BASE_URL}${endpoint}`,
//     data,
//     params,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     withCredentials: true,
//     timeout: 60000,
//     cache: "no-store",
//   };

//   console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`, {
//     data,
//     params,
//     token: token.substring(0, 10) + "...",
//     headers: config.headers,
//   });

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const response = await axios(config);
//       console.log(`API Response: ${method} ${endpoint}`, {
//         status: response.status,
//         data: response.data,
//         headers: response.headers,
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error(`API Request Error (${method} ${endpoint}, attempt ${attempt}):`, {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         headers: error.response?.headers,
//         config,
//         code: error.code,
//       });

//       if (attempt === retries) {
//         const message = error.response?.data?.error || error.message || "An unexpected error occurred";
//         throw new Error(errorMessages[message] || message);
//       }

//       await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
//     }
//   }
// };

// // Authentication
// export const verifyToken = async () => {
//   return apiRequest("GET", "/api/verify");
// };

// export const login = async (data: { userType: string; identifier: string; password: string }) => {
//   return apiRequest("POST", "/api/login", data);
// };

// // Lesson Plan Operations
// export const createLessonPlan = async (data: LessonPlanSchemaType) => {
//   try {
//     const validatedData = LessonPlanSchemaType.parse(data);
//     const response = await apiRequest("POST", "/api/lesson-plans", validatedData);
//     console.log("createLessonPlan - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("Failed to create lesson plan:", error.message);
//     throw new Error(errorMessages[error.message] || "Failed to create lesson plan");
//   }
// };

// export const updateLessonPlan = async (id: string, data: Partial<LessonPlanSchemaType>) => {
//   try {
//     const validatedData = LessonPlanSchemaType.partial().parse(data);
//     const response = await apiRequest("PUT", `/api/lesson-plans/${id}`, validatedData);
//     console.log(`updateLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`Failed to update lesson plan ${id}:`, error.message);
//     throw new Error(errorMessages[error.message] || "Failed to update lesson plan");
//   }
// };

// export const deleteLessonPlan = async (id: string) => {
//   try {
//     const response = await apiRequest("DELETE", `/api/lesson-plans/${id}`);
//     console.log(`deleteLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`Failed to delete lesson plan ${id}:`, error.message);
//     throw new Error(errorMessages[error.message] || "Failed to delete lesson plan");
//   }
// };

// export const getLessonPlan = async (id: string) => {
//   try {
//     const response = await apiRequest("GET", `/api/lesson-plans/${id}`);
//     console.log(`getLessonPlan - Response for id ${id}:`, response);
//     return response;
//   } catch (error: any) {
//     console.error(`Failed to fetch lesson plan ${id}:`, error.message);
//     throw new Error(errorMessages[error.message] || "Failed to fetch lesson plan");
//   }
// };

// export const getLessonPlans = async (traineeId?: string, page: number = 1, limit: number = 10) => {
//   try {
//     const response = await apiRequest("GET", "/api/lesson-plans", undefined, { traineeId, page, limit });
//     console.log("getLessonPlans - Response:", response);
//     return response;
//   } catch (error: any) {
//     console.error("Failed to fetch lesson plans:", error.message);
//     throw new Error(errorMessages[error.message] || "Failed to fetch lesson plans");
//   }
// };

// // Other operations (unchanged for brevity, but included for context)
// export const getUnreadNotificationsCount = async () => {
//   const token = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     console.log("getUnreadNotificationsCount - No token, returning default");
//     return { unread_count: 0 };
//   }

//   return apiRequest("GET", "/api/notifications/unread-count");
// };


// // Supervisor Operations
// export const createSupervisor = async (supervisorData: SupervisorSchemaType) => {
//   return apiRequest("POST", "/api/admin/supervisors", supervisorData);
// };

// export const updateSupervisor = async (id: string, supervisorData: Partial<SupervisorSchemaType>) => {
//   return apiRequest("PUT", `/api/admin/supervisors/${id}`, supervisorData);
// };

// export const deleteSupervisor = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/supervisors/${id}`);
// };

// export const getSupervisors = async (page: number, search: string, sex?: string) => {
//   return apiRequest("GET", "/api/admin/supervisors", undefined, { page, search, sex });
// };

// export const getSupervisedTrainees = async (supervisorId: string) => {
//   return apiRequest("GET", `/api/supervisors/${supervisorId}/trainees`);
// };

// export const markAttendance = async (supervisorId: string, data: { traineeId: string; date: string; status: "present" | "absent" | "late" }) => {
//   return apiRequest("POST", `/api/supervisors/${supervisorId}/mark-attendance`, data);
// };

// export const sendFeedback = async (feedbackData: {
//   supervisorId: string;
//   category: string;
//   feedback: string;
//   traineeId?: string;
//   traineeIds?: string[];
// }) => {
//   return apiRequest("POST", "/api/supervisors/feedback", feedbackData);
// };

// // Trainee Operations
// export const getTrainees = async (page: number, search: string, sex?: string) => {
//   return apiRequest("GET", "/api/admin/trainees", undefined, { page, search, sex });
// };

// export const getTrainee = async (id: string) => {
//   // return apiRequest("GET", `/api/trainees/${id}`);
//   return apiRequest("GET", "/api/trainees/me");
// };

// export const getTraineeProfile = async () => {
//   return apiRequest("GET", "/api/trainees/me");
// };

// export const getTraineeAssignment = async (id: string) => {
//   return apiRequest("GET", `/api/tp-assignments/${id}`);
// };

// export const getTraineeLessons = async (id: string, page: number, limit: number) => {
//   try {
//     const response = await apiRequest("GET", "/api/lesson-plans", undefined, { traineeId: id, page, limit });
//     return response || { lessonPlans: [], totalCount: 0, page, limit };
//   } catch (error: any) {
//     console.error(`Failed to fetch lessons for trainee ${id}:`, error.message);
//     return { lessonPlans: [], totalCount: 0, page, limit };
//   }
// };

// export const getTraineeFeedbackHistory = async (traineeId: string) => {
//   return apiRequest("GET", `/api/trainees/${traineeId}/feedback-history`);
// };

// export const evaluateTrainee = async (evaluationData: {
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments: string;
//   tpAssignmentId: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("POST", "/api/supervisor/student_evaluations", evaluationData);
// };

// export const createTrainee = async (traineeData: TraineeSchemaType) => {
//   return apiRequest("POST", "/api/admin/trainees", traineeData);
// };

// export const updateTrainee = async (id: string, traineeData: Partial<TraineeSchemaType>) => {
//   return apiRequest("PUT", `/api/admin/trainees/${id}`, traineeData);
// };

// export const deleteTrainee = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/trainees/${id}`);
// };

// // Student Evaluation Operations
// export const getStudentEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/admin/student_evaluations", undefined, { page, search });
// };

// export const getSupervisorStudentEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/supervisor/student_evaluations", undefined, { page, search });
// };

// export const submitStudentEvaluation = async (data: {
//   tpAssignmentId: string;
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments?: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("POST", "/api/admin/student_evaluations", data);
// };

// export const updateStudentEvaluation = async (id: string, data: {
//   tpAssignmentId: string;
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments?: string;
//   submittedAt?: string;
// }) => {
//   return apiRequest("PUT", `/api/admin/student_evaluations/${id}`, data);
// };

// export const deleteStudentEvaluation = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/student_evaluations/${id}`);
// };

// // Supervisor Evaluation Operations
// export const getSupervisorEvaluations = async (page: number, search?: string) => {
//   return apiRequest("GET", "/api/admin/supervisor_evaluations", undefined, { page, search });
// };

// export const submitSupervisorEvaluation = async (data: {
//   supervisorId: string;
//   rating: number;
//   comments?: string;
//   timestamp?: string;
// }) => {
//   return apiRequest("POST", "/api/admin/supervisor_evaluations", data);
// };

// export const updateSupervisorEvaluation = async (id: string, data: {
//   supervisorId: string;
//   rating: number;
//   comments?: string;
//   timestamp?: string;
// }) => {
//   return apiRequest("PUT", `/api/admin/supervisor_evaluations/${id}`, data);
// };

// export const deleteSupervisorEvaluation = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/supervisor_evaluations/${id}`);
// };

// // TP Assignment Operations
// export const getTPAssignments = async (page: number, search: string) => {
//   return apiRequest("GET", "/api/admin/tp_assignments", undefined, { page, search });
// };

// export const assignTP = async (
//   data: { id?: string; traineeId: string; schoolId: string; supervisorId: string; startDate?: string; endDate?: string },
//   action: "create" | "update"
// ) => {
//   const endpoint = action === "create" ? "/api/admin/tp_assignments" : `/api/admin/tp_assignments/${data.id}`;
//   const method = action === "create" ? "POST" : "PUT";
//   return apiRequest(method, endpoint, {
//     traineeId: data.traineeId,
//     schoolId: data.schoolId,
//     supervisorId: data.supervisorId,
//     startDate: data.startDate,
//     endDate: data.endDate,
//   });
// };

// export const deleteTPAssignment = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/tp_assignments/${id}`);
// };

// // School Operations
// export const getSchools = async (page: number, search: string, typeFilter: string) => {
//   return apiRequest("GET", "/api/admin/schools", undefined, { page, search, type: typeFilter });
// };

// export const createSchool = async (schoolData: { name: string; address: string; type: string }) => {
//   return apiRequest("POST", "/api/admin/schools", schoolData);
// };

// export const updateSchool = async (id: string, schoolData: { name: string; address: string; type: string }) => {
//   return apiRequest("PUT", `/api/admin/schools/${id}`, schoolData);
// };

// export const deleteSchool = async (id: string) => {
//   return apiRequest("DELETE", `/api/admin/schools/${id}`);
// };

// // Event Operations
// export const getEvents = async (date: string) => {
//   return apiRequest("GET", "/api/events", undefined, { date });
// };

// export const createEvent = async (data: { title: string; description: string; startTime: string; endTime: string }) => {
//   return apiRequest("POST", "/api/events", data);
// };

// // Announcement Operations
// export const getAnnouncements = async (limit: number = 3) => {
//   return apiRequest("GET", "/api/announcements", undefined, { limit });
// };

// // Report Operations
// export const getReports = async () => {
//   return apiRequest("GET", "/api/admin/reports");
// };

// export const getTraineeGender = async () => {
//   return apiRequest("GET", "/api/admin/trainee-gender");
// };

// export const getReportPreview = async (params: { regNo?: string; startDate?: string; endDate?: string; tpLocation?: string }) => {
//   return apiRequest("GET", "/api/admin/reports/preview", undefined, params);
// };



// export const getAssignmentsBySchool = async () => {
//   return apiRequest("GET", "/api/admin/assignments-by-school");
// };


// // Other Operations
// export const getPlacesOfTP = async () => {
//   return apiRequest("GET", "/api/places-of-tp");
// };

// export const checkTPPeriod = async () => {
//   return apiRequest("GET", "/api/admin/check-tp-period");
// };


// export const createNotification = async (notificationData: {
//   user_id: string;
//   message: string;
//   type: "EVALUATION" | "ASSIGNMENT" | "EVENT" | "GENERAL" | "LESSON_PLAN";
//   priority: "LOW" | "MEDIUM" | "HIGH";
// }) => {
//   return apiRequest("POST", "/api/notifications", notificationData);
// };

// export const updateNotification = async (notificationId: string, read_status: boolean) => {
//   return apiRequest("PUT", `/api/notifications/${notificationId}`, { read_status });
// };

// export const deleteNotification = async (notificationId: string) => {
//   return apiRequest("DELETE", `/api/notifications/${notificationId}`);
// };

// // export const getUnreadNotificationsCount = async () => {
// //   const token = document.cookie
// //     .split("; ")
// //     .find((row) => row.startsWith("token="))
// //     ?.split("=")[1];

// //   if (!token) {
// //     console.log("getUnreadNotificationsCount - No token, returning default");
// //     return { unread_count: 0 };
// //   }

// //   return apiRequest("GET", "/api/notifications/unread-count");
// // };

// // Evaluations
// export const submitEvaluation = async (data: {
//   trainee_id: string;
//   school: string;
//   eval_id: string;
//   startTime: string;
//   endTime: string;
// }) => {
//   return apiRequest("POST", "/api/evaluations", data);
// };





// export const getNotifications = async () => {
//   try {
//     const response = await apiRequest("GET", "/api/notifications");
//     return response;
//   } catch (error: any) {
//     console.error("Failed to fetch notifications:", error.message);
//     throw new Error(error.message || "Failed to fetch notifications");
//   }
// };




// Lesson Plan Operations
export const submitLessonPlan = async (data: LessonPlanSchemaType) => {
  try {
    const response = await apiRequest("POST", "/api/lesson-plans", data);
    console.log("submitLessonPlan - Response:", response);
    return response;
  } catch (error: any) {
    console.error("Failed to create lesson plan:", error.message);
    throw new Error(error.message || "Failed to create lesson plan");
  }
};




























































