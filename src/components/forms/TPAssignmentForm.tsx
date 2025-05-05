"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useState } from "react";
import InputField from "../InputField";
import { assignTP } from "@/lib/api";
import Select from "react-select";
import { API_BASE_URL } from "@/lib/api";

// Zod schema remains unchanged
const TPAssignmentSchema = z
  .object({
    traineeId: z.string().min(1, "Trainee is required"),
    schoolId: z.string().min(1, "School is required"),
    supervisorId: z.string().min(1, "Supervisor is required"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type TPAssignmentSchemaType = z.infer<typeof TPAssignmentSchema>;

type Trainee = {
  id: string;
  regNo: string;
  name: string;
  surname: string;
};

type Supervisor = {
  id: string;
  staffId: string;
  name: string;
  surname: string;
};

type School = {
  id: string;
  name: string;
};

type Props = {
  type: "create" | "update";
  data?: {
    id?: string;
    traineeId?: string;
    schoolId?: string;
    supervisorId?: string;
    startDate?: string;
    endDate?: string;
    trainees: Trainee[];
    supervisors: Supervisor[];
    schools: School[];
  };
  onClose: () => void;
  refetch?: () => Promise<void>;
};

const TPAssignmentForm = ({ type, data, onClose, refetch }: Props) => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TPAssignmentSchemaType>({
    resolver: zodResolver(TPAssignmentSchema),
    defaultValues: {
      traineeId: data?.traineeId || "",
      schoolId: data?.schoolId || "",
      supervisorId: data?.supervisorId || "",
      startDate: data?.startDate ? data.startDate.split("T")[0] : "",
      endDate: data?.endDate ? data.endDate.split("T")[0] : "",
    },
  });

  const onSubmit = async (formData: TPAssignmentSchemaType) => {
    try {
      setFormError(null);
      const payload = {
        ...(type === "update" && { id: data?.id }),
        traineeId: formData.traineeId,
        schoolId: formData.schoolId,
        supervisorId: formData.supervisorId,
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
      };

      console.log("TPAssignmentForm - Submitting payload:", payload);
      console.log("TPAssignmentForm - API_BASE_URL:", API_BASE_URL || "http://localhost:5000");
      console.log("TPAssignmentForm - Request type:", type);

      const response = await assignTP(payload, type);
      console.log("TPAssignmentForm - assignTP response:", response);

      toast.success(`TP Assignment ${type === "create" ? "created" : "updated"} successfully`);

      onClose();
      if (refetch) {
        console.log("TPAssignmentForm - Triggering refetch");
        await refetch();
      } else {
        console.log("TPAssignmentForm - Redirecting to /tp-assignments");
        router.push("/tp-assignments");
      }
    } catch (error: any) {
      console.error("TPAssignmentForm - Error during submission:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config,
      });
      const message =
        error.response?.data?.error ||
        (error.message.includes("Network Error")
          ? "Failed to connect to the server. Please check your network or try again later."
          : `Failed to ${type === "create" ? "create" : "update"} TP assignment`);
      setFormError(message);
      toast.error(message);
    }
  };

  // Options for react-select
  const traineeOptions = data?.trainees.map((trainee) => ({
    value: trainee.id,
    label: `${trainee.name} ${trainee.surname} (${trainee.regNo})`,
  })) || [];

  if (formError) {
    return (
      <div className="p-4 text-red-500">
        {formError}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new TP Assignment" : "Update TP Assignment"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Assignment Details</span>
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Trainee</label>
          <Select
            options={traineeOptions}
            defaultValue={traineeOptions.find((option) => option.value === data?.traineeId)}
            onChange={(selected) => setValue("traineeId", selected?.value || "")}
            isDisabled={type === "update"}
            placeholder="Select Trainee"
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                border: "1.5px solid #d1d5db",
                borderRadius: "0.375rem",
                padding: "0.25rem",
                backgroundColor: type === "update" ? "#f3f4f6" : "white",
              }),
              menu: (base) => ({
                ...base,
                maxHeight: "200px",
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "200px",
                overflowY: "auto",
              }),
            }}
          />
          {errors.traineeId?.message && (
            <p className="text-xs text-red-400">{errors.traineeId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">School</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("schoolId")}
            defaultValue={data?.schoolId || ""}
          >
            <option value="">Select School</option>
            {data?.schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
          {errors.schoolId?.message && (
            <p className="text-xs text-red-400">{errors.schoolId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
            defaultValue={data?.supervisorId || ""}
          >
            <option value="">Select Supervisor</option>
            {data?.supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.name} {supervisor.surname} ({supervisor.staffId})
              </option>
            ))}
          </select>
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">{errors.supervisorId.message}</p>
          )}
        </div>

        <InputField
          label="Start Date (Optional)"
          name="startDate"
          type="date"
          defaultValue={data?.startDate ? data.startDate.split("T")[0] : ""}
          register={register("startDate")}
          error={errors.startDate}
        />

        <InputField
          label="End Date (Optional)"
          name="endDate"
          type="date"
          defaultValue={data?.endDate ? data.endDate.split("T")[0] : ""}
          register={register("endDate")}
          error={errors.endDate}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
        >
          {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TPAssignmentForm;




