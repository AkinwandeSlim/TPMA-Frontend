"use client";

import { useState } from "react";
import {
  deleteSupervisor,
  deleteTrainee,
  deleteSchool,
  deleteTPAssignment,
  deleteStudentEvaluation,
  deleteSupervisorEvaluation,
  deleteLessonPlan,
} from "@/lib/api";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";

const SupervisorForm = dynamic(() => import("./forms/SupervisorForm"), {
  loading: () => <h1>Loading...</h1>,
});
const TraineeForm = dynamic(() => import("./forms/TraineeForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SchoolForm = dynamic(() => import("./forms/SchoolForm"), {
  loading: () => <h1>Loading...</h1>,
});
const TPAssignmentForm = dynamic(() => import("./forms/TPAssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentEvaluationForm = dynamic(() => import("./forms/StudentEvaluationForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SupervisorEvaluationForm = dynamic(() => import("./forms/SupervisorEvaluationForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonPlanForm = dynamic(() => import("./forms/LessonPlanForm"), {
  loading: () => <h1>Loading...</h1>,
});

// type Props =
//   | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "school"; type: "create"; data?: undefined; id?: undefined;refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "school"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "school"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "tp_assignment"; type: "create"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "tp_assignment"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "tp_assignment"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "student_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "student_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "student_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "view"; data: any; id?: undefined;refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: () => Promise<void>; ariaLabel?: string };









type Props =
  | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "school"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "school"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "school"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "tp_assignment"; type: "create"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "tp_assignment"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "tp_assignment"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "student_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "student_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "student_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "lesson_plan"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
  | { table: "lesson_plan"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
  | { table: "lesson_plan"; type: "view"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "lesson_plan"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: () => Promise<void>; ariaLabel?: string };







const FormModal = ({ table, type, data, id, refetch, customSubmit, ariaLabel }: Props) => {
  const [open, setOpen] = useState(false);

  const size = type === "create" || type === "view" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-yellow-400"
      : type === "update"
      ? "bg-blue-400"
      : type === "view"
      ? "bg-green-400"
      : "bg-red-400";

  const handleDelete = async () => {
    try {
      if (table === "supervisor") {
        await deleteSupervisor(id!);
        toast.success("Supervisor deleted successfully");
      } else if (table === "trainee") {
        await deleteTrainee(id!);
        toast.success("Trainee deleted successfully");
      } else if (table === "school") {
        await deleteSchool(id!);
        toast.success("School deleted successfully");
      } else if (table === "tp_assignment") {
        await deleteTPAssignment(id!);
        toast.success("TP Assignment deleted successfully");
      } else if (table === "student_evaluation") {
        await deleteStudentEvaluation(id!);
        toast.success("Student evaluation deleted successfully");
      } else if (table === "supervisor_evaluation") {
        await deleteSupervisorEvaluation(id!);
        toast.success("Supervisor evaluation deleted successfully");
      } else if (table === "lesson_plan") {
        if (customSubmit) {
          // await customSubmit();
          await (customSubmit as () => Promise<void>)();
        } else {
          await deleteLessonPlan(id!);
          toast.success("Lesson plan deleted successfully");
        }
      }
      refetch?.();
      setOpen(false);
    } catch (error: any) {
      console.error(`Error deleting ${table}:`, error);
      toast.error(error.message || `Failed to delete ${table.replace("_", " ")}`);
    }
  };

  const Form = () => {
    return type === "delete" && id ? (
      <div className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          Are you sure you want to delete this {table.replace("_", " ")}? This action cannot be undone.
        </span>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max hover:bg-red-800 transition-colors"
            aria-label={`Confirm delete ${table.replace("_", " ")}`}
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setOpen(false)}
            className="bg-gray-500 text-white py-2 px-4 rounded-md border-none w-max hover:bg-gray-600 transition-colors"
            aria-label={`Cancel delete ${table.replace("_", " ")}`}
          >
            Cancel
          </button>
        </div>
      </div>
    ) : type === "create" || type === "update" || type === "view" ? (
      <div className="max-h-[70vh] overflow-y-auto p-4">
        {table === "supervisor" ? (
          <SupervisorForm
            type={type}
            data={type === "update" ? data : undefined}
            onClose={() => setOpen(false)}
            refetch={refetch}
          />
        ) : table === "trainee" ? (
          <TraineeForm
            type={type}
            data={type === "update" ? data : undefined}
            onClose={() => setOpen(false)}
            refetch={refetch}
          />
        ) : table === "school" ? (
          <SchoolForm
            type={type}
            data={type === "update" ? data : undefined}
            onClose={() => setOpen(false)}
            refetch={refetch}
          />
        ) : table === "tp_assignment" ? (
          <TPAssignmentForm
            type={type}
            data={data}
            onClose={() => setOpen(false)}
            refetch={refetch}
          />
        ) : table === "student_evaluation" ? (
          <StudentEvaluationForm
            type={type}
            data={type === "update" ? data : undefined}
            onClose={() => setOpen(false)}
            refetch={refetch}
          />
        ) : table === "supervisor_evaluation" ? (
          <SupervisorEvaluationForm
            type={type}
            data={type === "update" ? data : undefined}
            onClose={() => setOpen(false)}
            refetch={refetch}
          />
        ) : table === "lesson_plan" ? (
          <LessonPlanForm
            type={type}
            data={type === "create" ? undefined : data}
            onClose={() => setOpen(false)}
            onSubmit={customSubmit}
            refetch={refetch}
          />
        ) : (
          <div className="text-center text-red-500">Unsupported table type!</div>
        )}
      </div>
    ) : (
      <div className="text-center text-red-500">Form not found!</div>
    );
  };

  const getIcon = () => {
    switch (type) {
      case "create":
        return <PlusIcon className="w-5 h-5 text-white" />;
      case "update":
        return <PencilIcon className="w-5 h-5 text-white" />;
      case "view":
        return <EyeIcon className="w-5 h-5 text-white" />;
      case "delete":
        return <TrashIcon className="w-5 h-5 text-white" />;
      default:
        return null;
    }
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${bgColor.split('-')[1]}-500`}
        onClick={() => setOpen(true)}
        aria-label={ariaLabel || `${type} ${table.replace("_", " ")}`}
      >
        {getIcon()}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => setOpen(false)}
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;





























































// "use client";

// import { useState } from "react";
// import {
//   deleteSupervisor,
//   deleteTrainee,
//   deleteSchool,
//   deleteTPAssignment,
//   deleteStudentEvaluation,
//   deleteSupervisorEvaluation,
//   deleteLessonPlan,
// } from "@/lib/api";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";

// // Lazy-load the forms
// const SupervisorForm = dynamic(() => import("./forms/SupervisorForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TraineeForm = dynamic(() => import("./forms/TraineeForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const SchoolForm = dynamic(() => import("./forms/SchoolForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TPAssignmentForm = dynamic(() => import("./forms/TPAssignmentForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const StudentEvaluationForm = dynamic(() => import("./forms/StudentEvaluationForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const SupervisorEvaluationForm = dynamic(() => import("./forms/SupervisorEvaluationForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const LessonPlanForm = dynamic(() => import("./forms/LessonPlanForm"), {
//   loading: () => <h1>Loading...</h1>,
// });

// type Props =
//   | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "school"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "school"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "school"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "tp_assignment"; type: "create"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "tp_assignment"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "tp_assignment"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "student_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "student_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "student_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "supervisor_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "view"; data: any; id?: undefined; refetch?: () => void; customSubmit?: undefined; ariaLabel?: string }
//   | { table: "lesson_plan"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string };

// const FormModal = ({ table, type, data, id, refetch, customSubmit, ariaLabel }: Props) => {
//   const [open, setOpen] = useState(false);
//   const router = useRouter();

//   const size = type === "create" || type === "view" ? "w-8 h-8" : "w-7 h-7";
//   const bgColor =
//     type === "create"
//       ? "bg-yellow-400"
//       : type === "update"
//       ? "bg-blue-400"
//       : type === "view"
//       ? "bg-green-400"
//       : "bg-red-400";

//   const handleDelete = async () => {
//     try {
//       if (table === "supervisor") {
//         await deleteSupervisor(id!);
//         toast.success("Supervisor deleted successfully");
//       } else if (table === "trainee") {
//         await deleteTrainee(id!);
//         toast.success("Trainee deleted successfully");
//       } else if (table === "school") {
//         await deleteSchool(id!);
//         toast.success("School deleted successfully");
//       } else if (table === "tp_assignment") {
//         await deleteTPAssignment(id!);
//         toast.success("TP Assignment deleted successfully");
//       } else if (table === "student_evaluation") {
//         await deleteStudentEvaluation(id!);
//         toast.success("Student evaluation deleted successfully");
//       } else if (table === "supervisor_evaluation") {
//         await deleteSupervisorEvaluation(id!);
//         toast.success("Supervisor evaluation deleted successfully");
//       } else if (table === "lesson_plan") {
//         if (customSubmit) {
//           await customSubmit({});
//         } else {
//           await deleteLessonPlan(id!);
//           toast.success("Lesson plan deleted successfully");
//         }
//       }
//       refetch?.();
//       setOpen(false);
//     } catch (error: any) {
//       console.error(`Error deleting ${table}:`, error);
//       toast.error(error.message || `Failed to delete ${table.replace("_", " ")}`);
//     }
//   };

//   const Form = () => {
//     return type === "delete" && id ? (
//       <div className="p-4 flex flex-col gap-4">
//         <span className="text-center font-medium">
//           All data will be lost. Are you sure you want to delete this {table.replace("_", " ")}?
//         </span>
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={handleDelete}
//             className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max hover:bg-red-800 transition-colors"
//           >
//             Yes, Delete
//           </button>
//           <button
//             onClick={() => setOpen(false)}
//             className="bg-gray-500 text-white py-2 px-4 rounded-md border-none w-max hover:bg-gray-600 transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ) : type === "create" || type === "update" || type === "view" ? (
//       <div className="max-h-[70vh] overflow-y-auto p-4">
//         {table === "supervisor" ? (
//           <SupervisorForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "trainee" ? (
//           <TraineeForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "school" ? (
//           <SchoolForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "tp_assignment" ? (
//           <TPAssignmentForm
//             type={type}
//             data={data}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "student_evaluation" ? (
//           <StudentEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "supervisor_evaluation" ? (
//           <SupervisorEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "lesson_plan" ? (
//           <LessonPlanForm
//             type={type}
//             data={type === "create" ? undefined : data}
//             onClose={() => setOpen(false)}
//             onSubmit={customSubmit}
//             refetch={refetch}
//           />
//         ) : (
//           <div className="text-center text-red-500">Unsupported table type!</div>
//         )}
//       </div>
//     ) : (
//       <div className="text-center text-red-500">Form not found!</div>
//     );
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "create":
//         return <PlusIcon className="w-5 h-5 text-white" />;
//       case "update":
//         return <PencilIcon className="w-5 h-5 text-white" />;
//       case "view":
//         return <EyeIcon className="w-5 h-5 text-white" />;
//       case "delete":
//         return <TrashIcon className="w-5 h-5 text-white" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <button
//         className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
//         onClick={() => setOpen(true)}
//         aria-label={ariaLabel || `${type} ${table.replace("_", " ")}`}
//       >
//         {getIcon()}
//       </button>
//       {open && (
//         <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
//             <Form />
//             <div
//               className="absolute top-4 right-4 cursor-pointer"
//               onClick={() => setOpen(false)}
//             >
//               <XMarkIcon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FormModal;






























// "use client";

// import { useState } from "react";
// import {
//   deleteSupervisor,
//   deleteTrainee,
//   deleteSchool,
//   deleteTPAssignment,
//   deleteStudentEvaluation,
//   deleteSupervisorEvaluation,
//   deleteLessonPlan,
// } from "@/lib/api";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
// import sanitizeHtml from "sanitize-html";

// // Lazy-load the forms
// const SupervisorForm = dynamic(() => import("./forms/SupervisorForm"), { loading: () => <h1>Loading...</h1> });
// const TraineeForm = dynamic(() => import("./forms/TraineeForm"), { loading: () => <h1>Loading...</h1> });
// const SchoolForm = dynamic(() => import("./forms/SchoolForm"), { loading: () => <h1>Loading...</h1> });
// const TPAssignmentForm = dynamic(() => import("./forms/TPAssignmentForm"), { loading: () => <h1>Loading...</h1> });
// const StudentEvaluationForm = dynamic(() => import("./forms/StudentEvaluationForm"), { loading: () => <h1>Loading...</h1> });
// const SupervisorEvaluationForm = dynamic(() => import("./forms/SupervisorEvaluationForm"), { loading: () => <h1>Loading...</h1> });
// const LessonPlanForm = dynamic(() => import("./forms/LessonPlanForm"), { loading: () => <h1>Loading...</h1> });

// type Props =
//   | { table: "supervisor"; type: "create" | "update" | "delete"; data?: any; id?: string; refetch?: () => void; onCreate?: never; onEdit?: never }
//   | { table: "trainee"; type: "create" | "update" | "delete"; data?: any; id?: string; refetch?: () => void; onCreate?: never; onEdit?: never }
//   | { table: "school"; type: "create" | "update" | "delete"; data?: any; id?: string; refetch?: () => void; onCreate?: never; onEdit?: never }
//   | { table: "tp_assignment"; type: "create" | "update" | "delete"; data?: any; id?: string; refetch?: () => void; onCreate?: never; onEdit?: never }
//   | { table: "student_evaluation"; type: "create" | "update" | "delete"; data?: any; id?: string; refetch?: () => void; onCreate?: never; onEdit?: never }
//   | { table: "supervisor_evaluation"; type: "create" | "update" | "delete"; data?: any; id?: string; refetch?: () => void; onCreate?: never; onEdit?: never }
//   | { table: "lesson_plan"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; onCreate?: () => void; onEdit?: never }
//   | { table: "lesson_plan"; type: "update"; data: any; id: string; refetch?: () => void; onCreate?: never; onEdit?: (data: any) => void }
//   | { table: "lesson_plan"; type: "delete"; data?: undefined; id: string; refetch?: () => void; onCreate?: never; onEdit?: never }
//   | { table: "lesson_plan"; type: "view"; data: any; id?: undefined; refetch?: () => void; onCreate?: never; onEdit?: never };

// const FormModal = ({ table, type, data, id, refetch, onCreate, onEdit }: Props) => {
//   const [open, setOpen] = useState(false);
//   const router = useRouter();

//   const size = type === "create" || type === "view" ? "w-8 h-8" : "w-7 h-7";
//   const bgColor =
//     type === "create" ? "bg-lamaYellow" :
//     type === "update" ? "bg-lamaSky" :
//     type === "view" ? "bg-lamaPurple" :
//     "bg-lamaPurple";

//   // Debug data prop for lesson_plan update
//   if (table === "lesson_plan" && type === "update") {
//     console.log("FormModal - Lesson Plan Update Data:", data);
//   }

//   const handleDelete = async () => {
//     try {
//       if (table === "supervisor") {
//         await deleteSupervisor(id!);
//         toast.success("Supervisor deleted successfully");
//       } else if (table === "trainee") {
//         await deleteTrainee(id!);
//         toast.success("Trainee deleted successfully");
//       } else if (table === "school") {
//         await deleteSchool(id!);
//         toast.success("School deleted successfully");
//       } else if (table === "tp_assignment") {
//         await deleteTPAssignment(id!);
//         toast.success("TP Assignment deleted successfully");
//       } else if (table === "student_evaluation") {
//         await deleteStudentEvaluation(id!);
//         toast.success("Student evaluation deleted successfully");
//       } else if (table === "supervisor_evaluation") {
//         await deleteSupervisorEvaluation(id!);
//         toast.success("Supervisor evaluation deleted successfully");
//       } else if (table === "lesson_plan") {
//         await deleteLessonPlan(id!);
//         toast.success("Lesson plan deleted successfully");
//       }
//       refetch?.();
//       setOpen(false);
//     } catch (error: any) {
//       console.error(`Error deleting ${table}:`, error);
//       toast.error(error.message || `Failed to delete ${table}`);
//     }
//   };

//   const ViewLessonPlan = () => {
//     if (table !== "lesson_plan" || !data) return null;
//     return (
//       <div className="p-4 flex flex-col gap-4">
//         <h1 className="text-xl font-semibold">View Lesson Plan</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="text-xs text-gray-500">Title</label>
//             <p className="text-sm">{data.title}</p>
//           </div>
//           <div>
//             <label className="text-xs text-gray-500">Subject</label>
//             <p className="text-sm">{data.subject}</p>
//           </div>
//           <div>
//             <label className="text-xs text-gray-500">Date</label>
//             <p className="text-sm">{new Date(data.date).toLocaleDateString()}</p>
//           </div>
//           <div>
//             <label className="text-xs text-gray-500">Time</label>
//             <p className="text-sm">{data.startTime} - {data.endTime}</p>
//           </div>
//           <div>
//             <label className="text-xs text-gray-500">Status</label>
//             <p className="text-sm">{data.status}</p>
//           </div>
//         </div>
//         <div>
//           <label className="text-xs text-gray-500">Objectives</label>
//           <div
//             className="text-sm prose"
//             dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.objectives || "") }}
//           />
//         </div>
//         <div>
//           <label className="text-xs text-gray-500">Activities</label>
//           <div
//             className="text-sm prose"
//             dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.activities || "") }}
//           />
//         </div>
//         <div>
//           <label className="text-xs text-gray-500">Resources</label>
//           <div
//             className="text-sm prose"
//             dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.resources || "") }}
//           />
//         </div>
//         {data.pdfUrl && (
//           <a
//             href={data.pdfUrl}
//             download
//             className="inline-flex items-center gap-2 bg-lamaYellow text-white py-2 px-4 rounded-md"
//           >
//             Download PDF
//           </a>
//         )}
//         <button
//           onClick={() => setOpen(false)}
//           className="bg-gray-500 text-white py-2 px-4 rounded-md"
//         >
//           Close
//         </button>
//       </div>
//     );
//   };

//   const Form = () => {
//     if (type === "view" && table === "lesson_plan") {
//       return <ViewLessonPlan />;
//     }
//     return type === "delete" && id ? (
//       <div className="p-4 flex flex-col gap-4">
//         <span className="text-center font-medium">
//           All data will be lost. Are you sure you want to delete this {table.replace("_", " ")}?
//         </span>
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={handleDelete}
//             className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Yes, Delete
//           </button>
//           <button
//             onClick={() => setOpen(false)}
//             className="bg-gray-500 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ) : type === "create" || type === "update" ? (
//       <div className="max-h-[70vh] overflow-y-auto">
//         {table === "supervisor" ? (
//           <SupervisorForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "trainee" ? (
//           <TraineeForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "school" ? (
//           <SchoolForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "tp_assignment" ? (
//           <TPAssignmentForm
//             type={type}
//             data={data}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "student_evaluation" ? (
//           <StudentEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "supervisor_evaluation" ? (
//           <SupervisorEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "lesson_plan" ? (
//           <LessonPlanForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             id={type === "update" ? id : undefined}
//             refetch={refetch}
//           />
//         ) : (
//           "Unsupported table type!"
//         )}
//       </div>
//     ) : (
//       "Form not found!"
//     );
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "create":
//         return <PlusIcon className="w-5 h-5 text-white" />;
//       case "update":
//         return <PencilIcon className="w-5 h-5 text-white" />;
//       case "delete":
//         return <TrashIcon className="w-5 h-5 text-white" />;
//       case "view":
//         return <EyeIcon className="w-5 h-5 text-white" />;
//       default:
//         return null;
//     }
//   };

//   const handleOpen = () => {
//     if (table === "lesson_plan") {
//       if (type === "create" && onCreate) {
//         onCreate();
//         return;
//       }
//       if (type === "update" && onEdit) {
//         onEdit(data);
//         return;
//       }
//     }
//     setOpen(true);
//   };

//   return (
//     <>
//       <button
//         className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
//         onClick={handleOpen}
//         aria-label={`${type} ${table.replace("_", " ").toLowerCase()}`}
//       >
//         {getIcon()}
//       </button>
//       {open && (
//         <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%]">
//             <Form />
//             <div
//               className="absolute top-4 right-4 cursor-pointer"
//               onClick={() => setOpen(false)}
//             >
//               <XMarkIcon className="w-5 h-5" />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FormModal;




























































// "use client";

// import { useState } from "react";
// import {
//   deleteSupervisor,
//   deleteTrainee,
//   deleteSchool,
//   deleteTPAssignment,
//   deleteStudentEvaluation,
//   deleteSupervisorEvaluation,
//   deleteLessonPlan,
// } from "@/lib/api";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

// // Lazy-load the forms
// const SupervisorForm = dynamic(() => import("./forms/SupervisorForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TraineeForm = dynamic(() => import("./forms/TraineeForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const SchoolForm = dynamic(() => import("./forms/SchoolForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TPAssignmentForm = dynamic(() => import("./forms/TPAssignmentForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const StudentEvaluationForm = dynamic(() => import("./forms/StudentEvaluationForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const SupervisorEvaluationForm = dynamic(() => import("./forms/SupervisorEvaluationForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const LessonPlanForm = dynamic(() => import("./forms/LessonPlanForm"), {
//   loading: () => <h1>Loading...</h1>,
// });

// type Props =
//   | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: never }
//   | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: never }
//   | { table: "school"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "school"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "school"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: never }
//   | { table: "tp_assignment"; type: "create"; data: any; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "tp_assignment"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "tp_assignment"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: never }
//   | { table: "student_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "student_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "student_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: never }
//   | { table: "supervisor_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "supervisor_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit?: never }
//   | { table: "supervisor_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: never }
//   | { table: "lesson_plan"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void; customSubmit: (data: any) => Promise<void> }
//   | { table: "lesson_plan"; type: "update"; data: any; id?: undefined; refetch?: () => void; customSubmit: (data: any) => Promise<void> }
//   | { table: "lesson_plan"; type: "delete"; data?: undefined; id: string; refetch?: () => void; customSubmit?: never };

// const FormModal = ({ table, type, data, id, refetch, customSubmit }: Props) => {
//   const [open, setOpen] = useState(false);
//   const router = useRouter();

//   const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
//   const bgColor =
//     type === "create"
//       ? "bg-lamaYellow"
//       : type === "update"
//       ? "bg-lamaSky"
//       : "bg-lamaPurple";

//   const handleDelete = async () => {
//     try {
//       if (table === "supervisor") {
//         await deleteSupervisor(id!);
//         toast.success("Supervisor deleted successfully");
//       } else if (table === "trainee") {
//         await deleteTrainee(id!);
//         toast.success("Trainee deleted successfully");
//       } else if (table === "school") {
//         await deleteSchool(id!);
//         toast.success("School deleted successfully");
//       } else if (table === "tp_assignment") {
//         await deleteTPAssignment(id!);
//         toast.success("TP Assignment deleted successfully");
//       } else if (table === "student_evaluation") {
//         await deleteStudentEvaluation(id!);
//         toast.success("Student evaluation deleted successfully");
//       } else if (table === "supervisor_evaluation") {
//         await deleteSupervisorEvaluation(id!);
//         toast.success("Supervisor evaluation deleted successfully");
//       } else if (table === "lesson_plan") {
//         await deleteLessonPlan(id!);
//         toast.success("Lesson plan deleted successfully");
//       }
//       refetch?.();
//       setOpen(false);
//     } catch (error: any) {
//       console.error(`Error deleting ${table}:`, error);
//       toast.error(error.message || `Failed to delete ${table}`);
//     }
//   };

//   const Form = () => {
//     return type === "delete" && id ? (
//       <div className="p-4 flex flex-col gap-4">
//         <span className="text-center font-medium">
//           All data will be lost. Are you sure you want to delete this {table.replace("_", " ")}?
//         </span>
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={handleDelete}
//             className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Yes, Delete
//           </button>
//           <button
//             onClick={() => setOpen(false)}
//             className="bg-gray-500 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ) : type === "create" || type === "update" ? (
//       <div className="max-h-[70vh] overflow-y-auto">
//         {table === "supervisor" ? (
//           <SupervisorForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "trainee" ? (
//           <TraineeForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "school" ? (
//           <SchoolForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "tp_assignment" ? (
//           <TPAssignmentForm
//             type={type}
//             data={data}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "student_evaluation" ? (
//           <StudentEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "supervisor_evaluation" ? (
//           <SupervisorEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "lesson_plan" ? (
//           <LessonPlanForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             customSubmit={customSubmit!}
//           />
//         ) : (
//           "Unsupported table type!"
//         )}
//       </div>
//     ) : (
//       "Form not found!"
//     );
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "create":
//         return <PlusIcon className="w-5 h-5 text-white" />;
//       case "update":
//         return <PencilIcon className="w-5 h-5 text-white" />;
//       case "delete":
//         return <TrashIcon className="w-5 h-5 text-white" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <button
//         className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
//         onClick={() => setOpen(true)}
//       >
//         {getIcon()}
//       </button>
//       {open && (
//         <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
//             <Form />
//             <div
//               className="absolute top-4 right-4 cursor-pointer"
//               onClick={() => setOpen(false)}
//             >
//               <XMarkIcon className="w-5 h-5" />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FormModal;





























































// "use client";

// import { useState } from "react";
// import {
//   deleteSupervisor,
//   deleteTrainee,
//   deleteSchool,
//   deleteTPAssignment,
//   deleteStudentEvaluation,
//   deleteSupervisorEvaluation,
// } from "@/lib/api";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

// // Lazy-load the forms
// const SupervisorForm = dynamic(() => import("./forms/SupervisorForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TraineeForm = dynamic(() => import("./forms/TraineeForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const SchoolForm = dynamic(() => import("./forms/SchoolForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TPAssignmentForm = dynamic(() => import("./forms/TPAssignmentForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const StudentEvaluationForm = dynamic(() => import("./forms/StudentEvaluationForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const SupervisorEvaluationForm = dynamic(() => import("./forms/SupervisorEvaluationForm"), {
//   loading: () => <h1>Loading...</h1>,
// });

// type Props =
//   | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "school"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "school"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "school"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "tp_assignment"; type: "create"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "tp_assignment"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "tp_assignment"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "student_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "student_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "student_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "supervisor_evaluation"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "supervisor_evaluation"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "supervisor_evaluation"; type: "delete"; data?: undefined; id: string; refetch?: () => void };

// const FormModal = ({ table, type, data, id, refetch }: Props) => {
//   const [open, setOpen] = useState(false);
//   const router = useRouter();

//   const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
//   const bgColor =
//     type === "create"
//       ? "bg-lamaYellow"
//       : type === "update"
//       ? "bg-lamaSky"
//       : "bg-lamaPurple";

//   const handleDelete = async () => {
//     try {
//       if (table === "supervisor") {
//         await deleteSupervisor(id!);
//         toast.success("Supervisor deleted successfully");
//       } else if (table === "trainee") {
//         await deleteTrainee(id!);
//         toast.success("Trainee deleted successfully");
//       } else if (table === "school") {
//         await deleteSchool(id!);
//         toast.success("School deleted successfully");
//       } else if (table === "tp_assignment") {
//         await deleteTPAssignment(id!);
//         toast.success("TP Assignment deleted successfully");
//       } else if (table === "student_evaluation") {
//         await deleteStudentEvaluation(id!);
//         toast.success("Student evaluation deleted successfully");
//       } else if (table === "supervisor_evaluation") {
//         await deleteSupervisorEvaluation(id!);
//         toast.success("Supervisor evaluation deleted successfully");
//       }
//       refetch?.();
//       setOpen(false);
//     } catch (error: any) {
//       console.error(`Error deleting ${table}:`, error);
//       toast.error(error.message || `Failed to delete ${table}`);
//     }
//   };

//   const Form = () => {
//     return type === "delete" && id ? (
//       <div className="p-4 flex flex-col gap-4">
//         <span className="text-center font-medium">
//           All data will be lost. Are you sure you want to delete this {table.replace("_", " ")}?
//         </span>
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={handleDelete}
//             className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Yes, Delete
//           </button>
//           <button
//             onClick={() => setOpen(false)}
//             className="bg-gray-500 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ) : type === "create" || type === "update" ? (
//       <div className="max-h-[70vh] overflow-y-auto">
//         {table === "supervisor" ? (
//           <SupervisorForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             // refetch={refetch}
//           />
//         ) : table === "trainee" ? (
//           <TraineeForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             // refetch={refetch}
//           />
//         ) : table === "school" ? (
//           <SchoolForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             // refetch={refetch}
//           />
//         ) : table === "tp_assignment" ? (
//           <TPAssignmentForm
//             type={type}
//             data={data}
//             onClose={() => setOpen(false)}
//             // refetch={refetch}
//           />
//         ) : table === "student_evaluation" ? (
//           <StudentEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "supervisor_evaluation" ? (
//           <SupervisorEvaluationForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : (
//           "Unsupported table type!"
//         )}
//       </div>
//     ) : (
//       "Form not found!"
//     );
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "create":
//         return <PlusIcon className="w-5 h-5 text-white" />;
//       case "update":
//         return <PencilIcon className="w-5 h-5 text-white" />;
//       case "delete":
//         return <TrashIcon className="w-5 h-5 text-white" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <button
//         className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
//         onClick={() => setOpen(true)}
//       >
//         {getIcon()}
//       </button>
//       {open && (
//         <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
//             <Form />
//             <div
//               className="absolute top-4 right-4 cursor-pointer"
//               onClick={() => setOpen(false)}
//             >
//               <XMarkIcon className="w-5 h-5" />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FormModal;






































// "use client";

// import { useState } from "react";
// import { deleteSupervisor, deleteTrainee } from "@/lib/api";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
// import axios from "axios";
// import Image from "next/image";

// // Lazy-load the forms
// const SupervisorForm = dynamic(() => import("./forms/SupervisorForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TraineeForm = dynamic(() => import("./forms/TraineeForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const SchoolForm = dynamic(() => import("./forms/SchoolForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
// const TPAssignmentForm = dynamic(() => import("./forms/TPAssignmentForm"), {
//   loading: () => <h1>Loading...</h1>,

// });

// type Props =
//   | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "school"; type: "create"; data?: undefined; id?: undefined; refetch?: () => void }
//   | { table: "school"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "school"; type: "delete"; data?: undefined; id: string; refetch?: () => void }
//   | { table: "tp_assignment"; type: "create"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "tp_assignment"; type: "update"; data: any; id?: undefined; refetch?: () => void }
//   | { table: "tp_assignment"; type: "delete"; data?: undefined; id: string; refetch?: () => void };

// const FormModal = ({ table, type, data, id, refetch }: Props) => {
//   const [open, setOpen] = useState(false);
//   const router = useRouter();

//   const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
//   const bgColor =
//     type === "create"
//       ? "bg-lamaYellow"
//       : type === "update"
//       ? "bg-lamaSky"
//       : "bg-lamaPurple";

//   const handleDelete = async () => {
//     try {
//       if (table === "supervisor") {
//         await deleteSupervisor(id!);
//         toast.success("Supervisor deleted successfully");
//       } else if (table === "trainee") {
//         await deleteTrainee(id!);
//         toast.success("Trainee deleted successfully");
//       } else if (table === "school") {
//         await axios.delete(`http://localhost:5000/api/admin/schools/${id}`, {
//           headers: { Authorization: `Bearer ${getToken()}` },
//         });
//         toast.success("School deleted successfully");
//       } else if (table === "tp_assignment") {
//         await axios.delete(`http://localhost:5000/api/admin/tp_assignments/${id}`, {
//           headers: { Authorization: `Bearer ${getToken()}` },
//         });
//         toast.success("TP Assignment deleted successfully");
//       }
//       refetch?.();
//       setOpen(false);
//     } catch (error: any) {
//       console.error(`Error deleting ${table}:`, error);
//       toast.error(error.response?.data?.error || `Failed to delete ${table}`);
//     }
//   };

//   const getToken = () => {
//     return document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("token="))
//       ?.split("=")[1];
//   };

//   const Form = () => {
//     return type === "delete" && id ? (
//       <div className="p-4 flex flex-col gap-4">
//         <span className="text-center font-medium">
//           All data will be lost. Are you sure you want to delete this {table}?
//         </span>
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={handleDelete}
//             className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Yes, Delete
//           </button>
//           <button
//             onClick={() => setOpen(false)}
//             className="bg-gray-500 text-white py-2 px-4 rounded-md border-none w-max"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ) : type === "create" || type === "update" ? (
//       <div className="max-h-[70vh] overflow-y-auto">
//         {table === "supervisor" ? (
//           <SupervisorForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "trainee" ? (
//           <TraineeForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "school" ? (
//           <SchoolForm
//             type={type}
//             data={type === "update" ? data : undefined}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : table === "tp_assignment" ? (
//           <TPAssignmentForm
//             type={type}
//             data={data}
//             onClose={() => setOpen(false)}
//             refetch={refetch}
//           />
//         ) : (
//           "Unsupported table type!"
//         )}
//       </div>
//     ) : (
//       "Form not found!"
//     );
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "create":
//         return <PlusIcon className="w-5 h-5 text-white" />;
//       case "update":
//         return <PencilIcon className="w-5 h-5 text-white" />;
//       case "delete":
//         return <TrashIcon className="w-5 h-5 text-white" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <button
//         className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
//         onClick={() => setOpen(true)}
//       >
//         <Image src={`/${type}.png`} alt="" width={16} height={16} />
//       </button>
//       {open && (
//         <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
//             <Form />
//             <div
//               className="absolute top-4 right-4 cursor-pointer"
//               onClick={() => setOpen(false)}
//             >
//               <XMarkIcon className="w-5 h-5" />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FormModal;


