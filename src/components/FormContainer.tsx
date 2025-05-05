
"use client";

import FormModal from "./FormModal";

type Props =
  | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "lesson_plan"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
  | { table: "lesson_plan"; type: "update"; data?: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
  | { table: "lesson_plan"; type: "view"; data?: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "lesson_plan"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: () => Promise<void>; ariaLabel?: string };

export type FormContainerProps =
  | {
      table: "supervisor";
      type: "create";
      data?: undefined;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "supervisor";
      type: "update";
      data: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "supervisor";
      type: "delete";
      data?: undefined;
      id: string;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "trainee";
      type: "create";
      data?: undefined;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "trainee";
      type: "update";
      data: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "trainee";
      type: "delete";
      data?: undefined;
      id: string;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "create";
      data?: undefined;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: (data: any) => Promise<void>;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "update";
      data?: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: (data: any) => Promise<void>;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "view";
      data?: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "delete";
      data?: undefined;
      id: string;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: () => Promise<void>;
      ariaLabel?: string;
    };

const FormContainer: React.FC<FormContainerProps> = ({
  table,
  type,
  data,
  id,
  display,
  refetch,
  customSubmit,
  ariaLabel,
}) => {
  if (display === "image") {
    return (
      <FormModal
        {...({
          table,
          type,
          data,
          id,
          refetch,
          customSubmit,
          ariaLabel,
        } as Props)}
      />
    );
  }

  return (
    <div>
      <FormModal
        {...({
          table,
          type,
          data,
          id,
          refetch,
          customSubmit,
          ariaLabel,
        } as Props)}
      />
    </div>
  );
};

export default FormContainer;














// "use client";

// import FormModal from "./FormModal";

// // export type FormContainerProps = {
// //   table:
// //     | "supervisor"
// //     | "trainee"
// //     | "lesson"
// //     | "assignment"
// //     | "evaluation"
// //     | "attendance"
// //     | "event"
// //     | "announcement"
// //     | "notification";
// //   type: "create" | "update" | "delete";
// //   data?: any;
// //   id?: number | string;
// //   display?: "form" | "image";
// //   refetch?: () => void;
// // };



// export type FormContainerProps = {
//   table: "trainee" | "supervisor" | "lesson_plan";
//   type: "create" | "update" | "delete";
//   data?: any;
//   id?: string;
//   display?: "form" | "image";
//   refetch?: () => void;
// };

// const FormContainer: React.FC<FormContainerProps> = ({
//   table,
//   type,
//   data,
//   id,
//   display,
//   refetch,
// }) => {
// if (display === "image") {
//   return (
//     <FormModal
//       table={table as "trainee" | "supervisor" | "lesson_plan"}
//       type={type}
//       data={data}
//       id={id}
//       refetch={refetch}
//     />
//   );
// }

// return (
//   <div>
//     <FormModal
//       table={table as "trainee" | "supervisor" | "lesson_plan"}
//       type={type}
//       data={data}
//       id={id}
//       refetch={refetch}
//     />
//   </div>
// );

// export default FormContainer;







 // import prisma from "@/lib/prisma";
// import FormModal from "./FormModal";
// import { auth } from "@clerk/nextjs/server";

// export type FormContainerProps = {
//   table:
//     | "supervisor"
//     | "trainee"
//     | "lesson"
//     | "assignment"
//     | "evaluation"
//     | "attendance"
//     | "event"
//     | "announcement";
//   type: "create" | "update" | "delete";
//   data?: any;
//   id?: number | string;
// };

// const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
//   let relatedData = {};

//   const { userId, sessionClaims } = auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;
//   const currentUserId = userId;

//   if (type !== "delete") {
//     switch (table) {
//       case "subject":
//         const subjectTeachers = await prisma.teacher.findMany({
//           select: { id: true, name: true, surname: true },
//         });
//         relatedData = { teachers: subjectTeachers };
//         break;
//       case "class":
//         const classGrades = await prisma.grade.findMany({
//           select: { id: true, level: true },
//         });
//         const classTeachers = await prisma.teacher.findMany({
//           select: { id: true, name: true, surname: true },
//         });
//         relatedData = { teachers: classTeachers, grades: classGrades };
//         break;
//       case "teacher":
//         const teacherSubjects = await prisma.subject.findMany({
//           select: { id: true, name: true },
//         });
//         relatedData = { subjects: teacherSubjects };
//         break;
//       case "student":
//         const studentGrades = await prisma.grade.findMany({
//           select: { id: true, level: true },
//         });
//         const studentClasses = await prisma.class.findMany({
//           include: { _count: { select: { students: true } } },
//         });
//         relatedData = { classes: studentClasses, grades: studentGrades };
//         break;
//       case "exam":
//         const examLessons = await prisma.lesson.findMany({
//           where: {
//             ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
//           },
//           select: { id: true, name: true },
//         });
//         relatedData = { lessons: examLessons };
//         break;

//       default:
//         break;
//     }
//   }

//   return (
//     <div className="">
//       <FormModal
//         table={table}
//         type={type}
//         data={data}
//         id={id}
//         relatedData={relatedData}
//       />
//     </div>
//   );
// };

// export default FormContainer;
