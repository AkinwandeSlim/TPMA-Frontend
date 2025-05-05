"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import InputField from "../InputField";
import { submitSupervisorEvaluation, updateSupervisorEvaluation, getSupervisors } from "@/lib/api";

// Validation schema
export const SupervisorEvaluationSchema = z.object({
  supervisorId: z.string().min(1, "Supervisor is required"),
  rating: z.number().min(0, "Rating must be at least 0").max(10, "Rating cannot exceed 10"),
  comments: z.string().optional(),
  timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
});

export type SupervisorEvaluationSchemaType = z.infer<typeof SupervisorEvaluationSchema>;

type Props = {
  type: "create" | "update";
  data?: SupervisorEvaluationSchemaType & { id?: string };
  onClose: () => void;
  refetch?: () => void;
};

const SupervisorEvaluationForm = ({ type, data, onClose, refetch }: Props) => {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState<{ id: string; name: string; surname: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  console.log("SupervisorEvaluationForm props:", { type, data }); // Debug props

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<SupervisorEvaluationSchemaType>({
    resolver: zodResolver(SupervisorEvaluationSchema),
    defaultValues: {
      supervisorId: data?.supervisorId || "",
      rating: data?.rating || 0,
      comments: data?.comments || "",
      timestamp: data?.timestamp || "",
    },
  });

  // Log form state
  const formValues = useWatch({ control });
  useEffect(() => {
    console.log("Form state:", { formValues, errors, isSubmitting });
  }, [formValues, errors, isSubmitting]);

  // Fetch supervisors for dropdown
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setLoadingOptions(true);
        const supervisorData = await getSupervisors(1, "");
        setSupervisors(supervisorData.supervisors || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load supervisors");
      } finally {
        setLoadingOptions(false);
      }
    };
    if (type === "create") {
      fetchSupervisors();
    }
  }, [type]);

  const onSubmit = async (formData: SupervisorEvaluationSchemaType) => {
    console.log("SupervisorEvaluationForm onSubmit:", { type, dataId: data?.id, formData });
    try {
      if (type === "create") {
        await submitSupervisorEvaluation(formData);
        toast.success("Supervisor evaluation created successfully");
      } else {
        if (!data?.id) {
          throw new Error("Cannot update evaluation: ID is missing");
        }
        console.log("Calling updateSupervisorEvaluation:", { id: data.id, formData });
        await updateSupervisorEvaluation(data.id, formData);
        toast.success("Supervisor evaluation updated successfully");
      }
      onClose();
      refetch?.();
    } catch (error: any) {
      console.error(`Error ${type} supervisor evaluation:`, error);
      toast.error(error.message || `Failed to ${type} supervisor evaluation`);
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new supervisor evaluation" : "Update the supervisor evaluation"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Evaluation Details</span>
      <div className="flex justify-between flex-wrap gap-4">
        {type === "create" ? (
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
        ) : (
          <InputField
            label="Supervisor ID"
            name="supervisorId"
            defaultValue={data?.supervisorId}
            register={register("supervisorId")}
            error={errors.supervisorId}
            disabled
          />
        )}
        <InputField
          label="Rating"
          name="rating"
          type="number"
          defaultValue={data?.rating}
          register={register("rating", { valueAsNumber: true })}
          error={errors.rating}
        />
        <InputField
          label="Comments"
          name="comments"
          defaultValue={data?.comments}
          register={register("comments")}
          error={errors.comments}
        />
        <InputField
          label="Timestamp"
          name="timestamp"
          type="date"
          defaultValue={data?.timestamp}
          register={register("timestamp")}
          error={errors.timestamp}
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

export default SupervisorEvaluationForm;






























// "use client";

// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { toast } from "react-toastify";
// import InputField from "../InputField";
// import axios from "axios";

// // Validation schema
// export const SupervisorEvaluationSchema = z.object({
//   supervisorId: z.string().min(1, "Supervisor ID is required"),
//   rating: z.number().min(0, "Rating must be at least 0").max(10, "Rating cannot exceed 10"),
//   comments: z.string().optional(),
//   timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
// });

// export type SupervisorEvaluationSchemaType = z.infer<typeof SupervisorEvaluationSchema>;

// type Props = {
//   type: "create" | "update";
//   data?: SupervisorEvaluationSchemaType & { id?: string };
//   onClose: () => void;
//   refetch?: () => void;
// };

// const SupervisorEvaluationForm = ({ type, data, onClose, refetch }: Props) => {
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<SupervisorEvaluationSchemaType>({
//     resolver: zodResolver(SupervisorEvaluationSchema),
//     defaultValues: data || {
//       supervisorId: "",
//       rating: 0,
//       comments: "",
//       timestamp: "",
//     },
//   });

//   const onSubmit = async (formData: SupervisorEvaluationSchemaType) => {
//     try {
//       const token = getToken();
//       if (!token) {
//         toast.error("Authentication token not found. Please sign in.");
//         return;
//       }

//       let response;
//       if (type === "create") {
//         response = await axios.post(
//           "http://localhost:5000/api/admin/supervisor_evaluations",
//           formData,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         toast.success("Supervisor evaluation created successfully");
//       } else {
//         if (!data?.id) {
//           toast.error("Cannot update evaluation: ID is missing");
//           return;
//         }
//         response = await axios.put(
//           `http://localhost:5000/api/admin/supervisor_evaluations/${data.id}`,
//           formData,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         toast.success("Supervisor evaluation updated successfully");
//       }

//       onClose();
//       refetch?.();
//     } catch (error: any) {
//       console.error(`Error ${type} supervisor evaluation:`, error);
//       toast.error(error.response?.data?.error || `Failed to ${type} supervisor evaluation`);
//     }
//   };

//   const getToken = () => {
//     return document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("token="))
//       ?.split("=")[1];
//   };

//   return (
//     <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Create a new supervisor evaluation" : "Update the supervisor evaluation"}
//       </h1>

//       <span className="text-xs text-gray-400 font-medium">Evaluation Details</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Supervisor ID"
//           name="supervisorId"
//           defaultValue={data?.supervisorId}
//           register={register("supervisorId")}
//           error={errors.supervisorId}
//         />
//         <InputField
//           label="Rating"
//           name="rating"
//           type="number"
//           defaultValue={data?.rating}
//           register={register("rating", { valueAsNumber: true })}
//           error={errors.rating}
//         />
//         <InputField
//           label="Comments"
//           name="comments"
//           defaultValue={data?.comments}
//           register={register("comments")}
//           error={errors.comments}
//         />
//         <InputField
//           label="Timestamp"
//           name="timestamp"
//           type="date"
//           defaultValue={data?.timestamp}
//           register={register("timestamp")}
//           error={errors.timestamp}
//         />
//       </div>

//       <div className="flex gap-4">
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-blue-400 text-white p-2 rounded-md"
//         >
//           {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default SupervisorEvaluationForm;