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


























































