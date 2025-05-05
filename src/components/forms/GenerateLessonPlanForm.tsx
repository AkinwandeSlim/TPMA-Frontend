"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";

// Define the schema for the AI lesson plan generation form
const GenerateLessonPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  objectives: z.string().optional(),
});

type GenerateLessonPlanFormData = z.infer<typeof GenerateLessonPlanSchema>;

type Props = {
  onSubmit: (data: GenerateLessonPlanFormData) => Promise<void>;
  onClose: () => void;
};

const GenerateLessonPlanForm = ({ onSubmit, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GenerateLessonPlanFormData>({
    resolver: zodResolver(GenerateLessonPlanSchema),
    defaultValues: {
      title: "",
      subject: "",
      gradeLevel: "",
      objectives: "",
    },
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">Generate Lesson Plan with AI</h1>

      {/* Lesson Plan Inputs */}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          register={register("title")}
          error={errors.title}
        />
        <InputField
          label="Subject"
          name="subject"
          register={register("subject")}
          error={errors.subject}
        />
        <InputField
          label="Grade Level"
          name="gradeLevel"
          register={register("gradeLevel")}
          error={errors.gradeLevel}
        />
        <InputField
          label="Objectives"
          name="objectives"
          register={register("objectives")}
          error={errors.objectives}
          inputProps={{ className: "w-full" }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-400 text-white p-2 rounded-md"
        >
          {isSubmitting ? "Generating..." : "Generate"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="bg-gray-500 text-white p-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default GenerateLessonPlanForm;