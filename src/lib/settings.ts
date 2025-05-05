export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/supervisor(.*)": ["supervisor"],
  "/teacher-trainee(.*)": ["teacherTrainee"],
  "/list/supervisors(.*)": ["admin", "supervisor"], // Corrected typo
  "/list/teacher-trainees(.*)": ["admin", "supervisor"], // Adjusted based on Menu visibility
  "/list/teachers(.*)": ["admin", "teacher"],
  "/list/students(.*)": ["admin", "teacher", "parent"],
  "/list/parents(.*)": ["admin", "teacher"],
  "/list/subjects(.*)": ["admin"],
  "/list/classes(.*)": ["admin", "teacher"],
  "/list/exams(.*)": ["admin", "teacher", "student", "parent"],
  "/list/assignments(.*)": ["admin", "teacher", "student", "parent"],
  "/list/results(.*)": ["admin", "teacher", "student", "parent"],
  "/list/attendance(.*)": ["admin", "teacher", "student", "parent"],
  "/list/events(.*)": ["admin", "teacher", "student", "parent"],
  "/list/announcements(.*)": ["admin", "teacher", "student", "parent"],
};











// export const ITEM_PER_PAGE = 10;

// type RouteAccessMap = {
//   [key: string]: string[];
// };

// export const routeAccessMap: RouteAccessMap = {
//   "/admin(.*)": ["admin"], // Changed from /dashboard/admin to /admin
//   "/supervisor(.*)": ["supervisor"], // Adjust if needed
//   "/teacher-trainee(.*)": ["teacherTrainee"], // Adjust if needed
//   "/list/supervisor(.*)": ["admin", "supervisor"],
//   "/list/teacher-trainee(.*)": ["admin", "teacher-trainee"],
//   "/list/teachers(.*)": ["admin", "teacher"],
//   "/list/students(.*)": ["admin", "teacher", "parent"],
//   "/list/parents(.*)": ["admin", "teacher"],
//   "/list/subjects(.*)": ["admin"],
//   "/list/classes(.*)": ["admin", "teacher"],
//   "/list/exams(.*)": ["admin", "teacher", "student", "parent"],
//   "/list/assignments(.*)": ["admin", "teacher", "student", "parent"],
//   "/list/results(.*)": ["admin", "teacher", "student", "parent"],
//   "/list/attendance(.*)": ["admin", "teacher", "student", "parent"],
//   "/list/events(.*)": ["admin", "teacher", "student", "parent"],
//   "/list/announcements(.*)": ["admin", "teacher", "student", "parent"],
// };