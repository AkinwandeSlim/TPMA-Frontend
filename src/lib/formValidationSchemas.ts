import { z } from "zod";
import { UserSex } from "@prisma/client";

export const adminSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }).min(1, { message: "Email is required!" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
});

export type AdminSchema = z.infer<typeof adminSchema>;

// Renamed to avoid confusion with TraineeSchema
export const TeacherTraineeSchema = z.object({
  id: z.string().optional(),
  regNo: z
    .string()
    .min(3, { message: "Registration number must be at least 3 characters long!" })
    .max(20, { message: "Registration number must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }).min(1, { message: "Email is required!" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "Address is required!" }),
  img: z.string().optional(),
  bloodType: z.string().optional(),
  sex: z.nativeEnum(UserSex).optional(),
  birthday: z.coerce.date().optional(),
  weeksRequired: z.coerce.number().optional(),
  levelId: z.coerce.number().min(1, { message: "Level is required!" }),
  courseId: z.coerce.number().min(1, { message: "Course is required!" }),
  progress: z.coerce.number().min(0).max(100).optional(),
});

export type TeacherTraineeSchemaType = z.infer<typeof TeacherTraineeSchema>;

export const TraineeSchema = z.object({
  regNo: z.string().min(1, "Registration number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string()
  .optional()
  .refine(
    (val) => !val || val.length >= 6,
    "Password must be at least 6 characters long"
  ),
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  bloodType: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  birthday: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  img: z.string().optional(),
});

export type TraineeSchemaType = z.infer<typeof TraineeSchema>;

export const SupervisorSchema = z.object({
  id: z.string().optional(),
  staffId: z.string().min(1, "Staff ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  img: z.string().optional(),
  bloodType: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  birthday: z.string().optional(),
  placeOfSupervision: z.string().optional(),
});

export type SupervisorSchemaType = z.infer<typeof SupervisorSchema>;





export const loginSchema = z.object({
  userType: z.enum(["admin", "supervisor", "teacherTrainee"], {
    required_error: "Please select a user type",
  }),
  identifier: z
    .string()
    .min(3, { message: "Identifier must be at least 3 characters long!" })
    .max(20, { message: "Identifier must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const SchoolSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  email: z.string().email(),
  phone: z.string().min(7),
  type: z.enum(["PRIMARY", "SECONDARY", "TERTIARY"]),
  principal: z.string().min(2),
  logo: z.string().optional(),
});

export type SchoolSchemaType = z.infer<typeof SchoolSchema>;















export const LessonPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
  objectives: z.string().min(1, "Objectives are required"),
  activities: z.string().min(1, "Activities are required"),
  resources: z.string().min(1, "Resources are required"),
  aiGenerated: z.boolean().optional(),
});



export type LessonPlanSchemaType = z.infer<typeof LessonPlanSchema>;
