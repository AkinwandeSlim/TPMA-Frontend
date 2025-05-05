"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import InputField from "../InputField";
import {
  submitStudentEvaluation,
  updateStudentEvaluation,
  getTrainees,
  getSupervisors,
  getTPAssignments,
  API_BASE_URL,
} from "@/lib/api";

// Validation schema
export const StudentEvaluationSchema = z.object({
  tpAssignmentId: z.string().min(1, "TP Assignment is required"),
  traineeId: z.string().min(1, "Trainee is required"),
  supervisorId: z.string().min(1, "Supervisor is required"),
  score: z.number().min(0, "Score must be at least 0").max(100, "Score cannot exceed 100"),
  comments: z.string().optional(),
  submittedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
});

export type StudentEvaluationSchemaType = z.infer<typeof StudentEvaluationSchema>;

type Props = {
  type: "create" | "update";
  data?: StudentEvaluationSchemaType & { id?: string };
  onClose: () => void;
  refetch?: () => void;
};

const StudentEvaluationForm = ({ type, data, onClose, refetch }: Props) => {
  const router = useRouter();
  const [trainees, setTrainees] = useState<{ id: string; name: string; surname: string }[]>([]);
  const [supervisors, setSupervisors] = useState<{ id: string; name: string; surname: string }[]>([]);
  const [tpAssignments, setTPAssignments] = useState<{ id: string; traineeId: string; schoolId: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  console.log("StudentEvaluationForm props:", { type, data }); // Debug props

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<StudentEvaluationSchemaType>({
    resolver: zodResolver(StudentEvaluationSchema),
    defaultValues: {
      tpAssignmentId: data?.tpAssignmentId || "",
      traineeId: data?.traineeId || "",
      supervisorId: data?.supervisorId || "",
      score: data?.score || 0,
      comments: data?.comments || "",
      submittedAt: data?.submittedAt || "",
    },
  });

  // Log form state
  const formValues = useWatch({ control });
  useEffect(() => {
    console.log("Form state:", { formValues, errors, isSubmitting });
  }, [formValues, errors, isSubmitting]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [traineeData, supervisorData, tpData] = await Promise.all([
          getTrainees(1, ""),
          getSupervisors(1, ""),
          getTPAssignments(1, ""),
        ]);
        setTrainees(traineeData.trainees || []);
        setSupervisors(supervisorData.supervisors || []);
        setTPAssignments(tpData.assignments || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load options");
      } finally {
        setLoadingOptions(false);
      }
    };
    if (type === "create") {
      fetchOptions();
    }
  }, [type]);

  const onSubmit = async (formData: StudentEvaluationSchemaType) => {
    console.log("StudentEvaluationForm onSubmit:", { type, dataId: data?.id, formData });
    try {
      if (type === "create") {
        await submitStudentEvaluation(formData);
        toast.success("Student evaluation created successfully");
      } else {
        if (!data?.id) {
          throw new Error("Cannot update evaluation: ID is missing");
        }
        console.log("Calling updateStudentEvaluation:", { id: data.id, formData });
        await updateStudentEvaluation(data.id, formData);
        toast.success("Student evaluation updated successfully");
      }
      onClose();
      refetch?.();
    } catch (error: any) {
      console.error(`Error ${type} student evaluation:`, error);
      toast.error(error.message || `Failed to ${type} student evaluation`);
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student evaluation" : "Update the student evaluation"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Evaluation Details</span>
      <div className="flex justify-between flex-wrap gap-4">
        {type === "create" ? (
          <>
            <div className="flex flex-col gap-2 w-full sm:w-1/2">
              <label className="text-sm font-medium">TP Assignment</label>
              <select
                {...register("tpAssignmentId")}
                className="border border-gray-200 rounded-md p-2 bg-white disabled:bg-gray-100 max-h-60 overflow-y-auto"
                disabled={loadingOptions}
              >
                <option value="">Select TP Assignment</option>
                {tpAssignments.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    Assignment {tp.id} (Trainee: {tp.traineeId})
                  </option>
                ))}
              </select>
              {errors.tpAssignmentId && (
                <span className="text-red-500 text-xs">{errors.tpAssignmentId.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-1/2">
              <label className="text-sm font-medium">Trainee</label>
              <select
                {...register("traineeId")}
                className="border border-gray-200 rounded-md p-2 bg-white disabled:bg-gray-100 max-h-60 overflow-y-auto"
                disabled={loadingOptions}
              >
                <option value="">Select Trainee</option>
                {trainees.map((trainee) => (
                  <option key={trainee.id} value={trainee.id}>
                    {trainee.name} {trainee.surname}
                  </option>
                ))}
              </select>
              {errors.traineeId && (
                <span className="text-red-500 text-xs">{errors.traineeId.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-1/2">
              <label className="text-sm font-medium">Supervisor</label>
              <select
                {...register("supervisorId")}
                className="border border-gray-200 rounded-md p-2 bg-white disabled:bg-gray-100 max-h-60 overflow-y-auto"
                disabled={loadingOptions}
              >
                <option value="">Select Supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.name} {supervisor.surname}
                  </option>
                ))}
              </select>
              {errors.supervisorId && (
                <span className="text-red-500 text-xs">{errors.supervisorId.message}</span>
              )}
            </div>
          </>
        ) : (
          <>
            <InputField
              label="TP Assignment ID"
              name="tpAssignmentId"
              defaultValue={data?.tpAssignmentId}
              register={register("tpAssignmentId")}
              error={errors.tpAssignmentId}
              disabled
            />
            <InputField
              label="Trainee ID"
              name="traineeId"
              defaultValue={data?.traineeId}
              register={register("traineeId")}
              error={errors.traineeId}
              disabled
            />
            <InputField
              label="Supervisor ID"
              name="supervisorId"
              defaultValue={data?.supervisorId}
              register={register("supervisorId")}
              error={errors.supervisorId}
              disabled
            />
          </>
        )}
        <InputField
          label="Score"
          name="score"
          type="number"
          defaultValue={data?.score}
          register={register("score", { valueAsNumber: true })}
          error={errors.score}
        />
        <InputField
          label="Comments"
          name="comments"
          defaultValue={data?.comments}
          register={register("comments")}
          error={errors.comments}
        />
        <InputField
          label="Submitted At"
          name="submittedAt"
          type="date"
          defaultValue={data?.submittedAt}
          register={register("submittedAt")}
          error={errors.submittedAt}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200"
        >
          {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default StudentEvaluationForm;

























