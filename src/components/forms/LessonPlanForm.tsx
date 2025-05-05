"use client";

import React, { forwardRef, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LessonPlanSchemaType } from "@/lib/api";
import { toast } from "react-toastify";
import { Tab } from "@headlessui/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { classNames } from "@/lib/utils";
import { FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaUnlink, FaHeading } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import sanitizeHtml from "sanitize-html";
import { format } from "date-fns";




const InputField = ({
  label,
  name,
  type = "text",
  register,
  error,
  ariaDescribedby,
  disabled = false,
}: {
  label: string;
  name: string;
  type?: string;
  register: any;
  error?: any;
  ariaDescribedby?: string;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-2 w-full md:w-3/4">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      type={type}
      {...register(name)}
      disabled={disabled}
      className={`border border-gray-300 p-4 rounded-lg text-base w-full max-w-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
      aria-describedby={ariaDescribedby}
    />
    {error?.message && (
      <p id={`${name}-error`} className="text-xs text-red-500 font-medium" role="alert">
        {error.message}
      </p>
    )}
  </div>
);


const SelectField = ({
  label,
  name,
  register,
  error,
  ariaDescribedby,
  disabled = false,
}: {
  label: string;
  name: string;
  register: any;
  error?: any;
  ariaDescribedby?: string;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-2 w-full md:w-3/4">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={name}
      {...register(name)}
      disabled={disabled}
      className={`border border-gray-300 p-4 rounded-lg text-base w-full max-w-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
      aria-describedby={ariaDescribedby}
    >
      <option value="">Select Subject</option>
      <option value="Mathematics">Mathematics</option>
      <option value="English Language">English Language</option>
      <option value="Basic Science">Basic Science</option>
      <option value="Social Studies">Social Studies</option>
      <option value="Civic Education">Civic Education</option>
    </select>
    {error?.message && (
      <p id={`${name}-error`} className="text-xs text-red-500 font-medium" role="alert">
        {error.message}
      </p>
    )}
  </div>
);

const RichTextEditor = forwardRef(
  (
    {
      value,
      onChange,
      label,
      error,
      id,
      disabled = false,
    }: {
      value: string;
      onChange: (value: string) => void;
      label: string;
      error?: any;
      id: string;
      disabled?: boolean;
    },
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: { keepMarks: true, keepAttributes: false },
          orderedList: { keepMarks: true, keepAttributes: false },
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
        }),
      ],
      content: value || "<p></p>",
      editable: !disabled,
      onUpdate: ({ editor }) => {
        const content = editor.getHTML();
        onChange(content === "<p></p>" ? "" : content);
      },
      immediatelyRender: true,
    });

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        e.stopPropagation();
        editor?.commands.focus();
      },
      [editor]
    );

    const handleFocus = useCallback(() => {
      editor?.commands.focus();
    }, [editor]);

    const setLink = useCallback(() => {
      const url = window.prompt("Enter the URL");
      if (url) {
        editor?.chain().focus().setLink({ href: url }).run();
      }
    }, [editor]);

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        try {
          editor.commands.setContent(value || "<p></p>");
        } catch (err) {
          console.error(`RichTextEditor - Failed to set content for ${id}:`, err);
          editor.commands.setContent("<p>Error rendering content</p>");
        }
      }
    }, [editor, value, id]);

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className={`border border-gray-300 rounded-lg bg-white ${disabled ? "bg-gray-100" : ""}`}>
          {!disabled && (
            <div className="flex gap-2 p-2 bg-gray-100 border-b border-gray-300">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={classNames(
                  "p-2 rounded hover:bg-gray-200",
                  editor?.isActive("bold") ? "bg-gray-300" : ""
                )}
                title="Bold"
                aria-label="Toggle bold formatting"
              >
                <FaBold />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={classNames(
                  "p-2 rounded hover:bg-gray-200",
                  editor?.isActive("italic") ? "bg-gray-300" : ""
                )}
                title="Italic"
                aria-label="Toggle italic formatting"
              >
                <FaItalic />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={classNames(
                  "p-2 rounded hover:bg-gray-200",
                  editor?.isActive("bulletList") ? "bg-gray-300" : ""
                )}
                title="Bullet List"
                aria-label="Toggle bullet list formatting"
              >
                <FaListUl />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={classNames(
                  "p-2 rounded hover:bg-gray-200",
                  editor?.isActive("orderedList") ? "bg-gray-300" : ""
                )}
                title="Ordered List"
                aria-label="Toggle ordered list formatting"
              >
                <FaListOl />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={classNames(
                  "p-2 rounded hover:bg-gray-200",
                  editor?.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
                )}
                title="Heading"
                aria-label="Toggle heading formatting"
              >
                <FaHeading />
              </button>
              <button
                type="button"
                onClick={setLink}
                className={classNames(
                  "p-2 rounded hover:bg-gray-200",
                  editor?.isActive("link") ? "bg-gray-300" : ""
                )}
                title="Add Link"
                aria-label="Add link formatting"
              >
                <FaLink />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().unsetLink().run()}
                className={classNames(
                  "p-2 rounded hover:bg-gray-200",
                  editor?.isActive("link") ? "bg-gray-300" : ""
                )}
                title="Remove Link"
                aria-label="Remove link formatting"
                disabled={!editor?.isActive("link")}
              >
                <FaUnlink />
              </button>
            </div>
          )}
          <EditorContent
            editor={editor}
            ref={ref}
            id={id}
            className={`p-4 min-h-[150px] prose max-w-none focus:outline-none ${
              disabled ? "cursor-default" : ""
            }`}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            aria-label={`Lesson plan ${label.toLowerCase()} ${disabled ? "viewer" : "editor"}`}
          />
        </div>
        {error?.message && (
          <p id={`${id}-error`} className="text-xs text-red-500 font-medium" role="alert">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

// type Props = {
//   type: "create" | "update" | "view";
//   data?: LessonPlanSchemaType & { id?: string; traineeName?: string; supervisorName?: string; schoolName?: string; pdfUrl?: string | null };
//   onClose: () => void;
//   id?: string;
//   refetch?: () => void;
//   onSubmit?: (data: LessonPlanSchemaType) => Promise<void>;
// };

type Props = {
  type: "create" | "update" | "view";
  data?: LessonPlanSchemaType & {
    id?: string;
    traineeName?: string;
    supervisorName?: string;
    schoolName?: string;
    pdfUrl?: string | null;
    status?: "PENDING" | "APPROVED" | "REJECTED";
  };
  onClose: () => void;
  id?: string;
  refetch?: () => void;
  onSubmit?: (data: LessonPlanSchemaType) => Promise<void>;
};

const LessonPlanForm = ({ type, data, onClose, refetch, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<LessonPlanSchemaType>({
    resolver: zodResolver(LessonPlanSchemaType),
    defaultValues: {
      title: "",
      subject: "",
      class: "", // Added class field
      date: "",
      startTime: "",
      endTime: "",
      objectives: "",
      activities: "",
      resources: "",
      aiGenerated: false,
    },
  });

  useEffect(() => {
    if ((type === "update" || type === "view") && data) {
      const sanitizeRichText = (text: string | undefined) =>
        text
          ? sanitizeHtml(text, {
              allowedTags: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
              allowedAttributes: { a: ["href"] },
            })
          : "";
      const parseTime = (time: string | null | undefined) => {
        if (!time) return "";
        return time.slice(0, 5);
      };

      reset({
        title: data.title || "",
        subject: data.subject || "",
        class: data.class || "", // Added class field
        date: data.date || "",
        startTime: parseTime(data.startTime),
        endTime: parseTime(data.endTime),
        objectives: sanitizeRichText(data.objectives),
        activities: sanitizeRichText(data.activities),
        resources: sanitizeRichText(data.resources),
        aiGenerated: data.aiGenerated || false,
      });
    }
  }, [data, type, reset]);

  const handleFormSubmit = async (formData: LessonPlanSchemaType) => {
    if (type === "view") return;

    const formattedData = {
      ...formData,
      objectives: formData.objectives
        ? sanitizeHtml(formData.objectives, {
            allowedTags: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
            allowedAttributes: { a: ["href"] },
          })
        : "",
      activities: formData.activities
        ? sanitizeHtml(formData.activities, {
            allowedTags: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
            allowedAttributes: { a: ["href"] },
          })
        : "",
      resources: formData.resources
        ? sanitizeHtml(formData.resources, {
            allowedTags: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
            allowedAttributes: { a: ["href"] },
          })
        : "",
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
    };

    try {
      if (!onSubmit) {
        throw new Error("Submit handler is not provided");
      }
      await onSubmit(formattedData);
      toast.success(`Lesson plan ${type === "create" ? "created" : "updated"} successfully`);
      refetch?.();
      onClose();
    } catch (error: any) {
      const message = error.message || `Failed to ${type === "create" ? "create" : "update"} lesson plan`;
      toast.error(message);
      throw error;
    }
  };

  if (type === "view" && data) {
    return (
      <div className="p-6 bg-white rounded-xl" aria-label="View lesson plan">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Lesson Plan: {data.title}</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Title</span>
                <p className="text-gray-800">{data.title || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Subject</span>
                <p className="text-gray-800">{data.subject || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Class</span>
                <p className="text-gray-800">{data.class || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Date</span>
                <p className="text-gray-800">
                  {data.date ? format(new Date(data.date), "MMM d, yyyy") : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Time</span>
                <p className="text-gray-800">
                  {data.startTime && data.endTime ? `${data.startTime.slice(0, 5)} - ${data.endTime.slice(0, 5)}` : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Trainee</span>
                <p className="text-gray-800">{data.traineeName || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Supervisor</span>
                <p className="text-gray-800">{data.supervisorName || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">School</span>
                <p className="text-gray-800">{data.schoolName || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status</span>
                <p
                  className={classNames(
                    "inline-block px-2 py-1 rounded text-xs",
                    data.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : data.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {data.status || "N/A"}
                </p>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Lesson Plan Details</h2>
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-600">Objectives</span>
                <div
                  className="prose max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(data.objectives || "<p>No objectives provided</p>", {
                      allowedTags: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
                      allowedAttributes: { a: ["href"] },
                    }),
                  }}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Activities</span>
                <div
                  className="prose max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(data.activities || "<p>No activities provided</p>", {
                      allowedTags: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
                      allowedAttributes: { a: ["href"] },
                    }),
                  }}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Resources</span>
                <div
                  className="prose max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(data.resources || "<p>No resources provided</p>", {
                      allowedTags: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
                      allowedAttributes: { a: ["href"] },
                    }),
                  }}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">AI-Generated</span>
                <p className="text-gray-800">{data.aiGenerated ? "Yes" : "No"}</p>
              </div>
            </div>
          </section>
          {data.pdfUrl && (
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Attachment</h2>
              <a
                href={data.pdfUrl}
                download
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Download lesson plan PDF"
              >
                Download PDF
              </a>
            </section>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            aria-label="Close lesson plan view"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="p-6 bg-white rounded-xl"
      aria-label="Lesson plan form"
    >
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {type === "create" ? "Create a New Lesson Plan" : "Update Lesson Plan"}
      </h1>
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-blue-100 p-1 rounded-xl mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                selected
                  ? "bg-blue-600 text-white shadow"
                  : "text-blue-600 hover:bg-blue-200 hover:text-blue-800"
              )
            }
            // role="tab"
          >
            Basic Info
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                selected
                  ? "bg-blue-600 text-white shadow"
                  : "text-blue-600 hover:bg-blue-200 hover:text-blue-800"
              )
            }
            // role="tab"
          >
            Content
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="bg-white p-6 rounded-lg">

            <span className="text-sm font-medium text-gray-600">Lesson Plan Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <InputField
                label="Title"
                name="title"
                register={register}
                error={errors.title}
                ariaDescribedby={errors.title ? "title-error" : undefined}
                disabled={type === "view"}
              />
              <SelectField
                label="Subject"
                name="subject"
                register={register}
                error={errors.subject}
                ariaDescribedby={errors.subject ? "subject-error" : undefined}
                disabled={type === "view"}
              />
              <InputField
                label="Class"
                name="class"
                register={register}
                error={errors.class}
                ariaDescribedby={errors.class ? "class-error" : undefined}
                disabled={type === "view"}
              />
              <InputField
                label="Date"
                name="date"
                type="date"
                register={register}
                error={errors.date}
                ariaDescribedby={errors.date ? "date-error" : undefined}
                disabled={type === "view"}
              />
              <InputField
                label="Start Time"
                name="startTime"
                type="time"
                register={register}
                error={errors.startTime}
                ariaDescribedby={errors.startTime ? "startTime-error" : undefined}
                disabled={type === "view"}
              />
              <InputField
                label="End Time"
                name="endTime"
                type="time"
                register={register}
                error={errors.endTime}
                ariaDescribedby={errors.endTime ? "endTime-error" : undefined}
                disabled={type === "view"}
              />
            </div>
          </Tab.Panel>
          <Tab.Panel className="bg-white p-6 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Lesson Plan Details</span>
            <div className="flex flex-col gap-6 mt-4">
              <Controller
                name="objectives"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    id="objectives"
                    label="Objectives"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={errors.objectives}
                    disabled={type === "view"}
                  />
                )}
              />
              <Controller
                name="activities"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    id="activities"
                    label="Activities"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={errors.activities}
                    disabled={type === "view"}
                  />
                )}
              />
              <Controller
                name="resources"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    id="resources"
                    label="Resources"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={errors.resources}
                    disabled={type === "view"}
                  />
                )}
              />
              <div className="flex items-center gap-2">
                <input
                  id="aiGenerated"
                  type="checkbox"
                  {...register("aiGenerated")}
                  disabled={type === "view"}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="aiGenerated" className="text-sm font-medium text-gray-700">
                  AI-Generated
                </label>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      {type !== "view" && (
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={type === "create" ? "Create lesson plan" : "Update lesson plan"}
          >
            {isSubmitting && <AiOutlineLoading3Quarters className="animate-spin" />}
            {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel lesson plan form"
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  );
};

export default LessonPlanForm;






































































