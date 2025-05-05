// src/components/Form2Modal.tsx (update)
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/lib/api";

type Form2ModalProps = {
  table: "trainee" | "supervisor" | "lesson_plan";
  type: "create" | "update" | "delete";
  data?: any;
  refetch: () => void;
  customSubmit?: (data: any) => Promise<void>;
};

const Form2Modal = ({ table, type, data, refetch, customSubmit }: Form2ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };




const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (customSubmit) {
        await customSubmit(formData);
      } else {
        // Handle default API calls (e.g., update trainee)
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];
        if (!token) throw new Error("No token found");

        const endpoint =
          table === "trainee"
            ? `/api/trainees/${data?.id}`
            : table === "supervisor"
            ? `/api/supervisors/${data?.id}`
            : `/api/lesson-plans`;
        const method = type === "create" ? "POST" : type === "update" ? "PUT" : "DELETE";

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error(`Failed to ${type} ${table}`);
      }

      toast.success(`${table} ${type}d successfully!`);
      refetch();
      setIsOpen(false);
    } catch (err: any) {
      console.error(`Error ${type}ing ${table}:`, err.message);
      toast.error(`Failed to ${type} ${table}: ${err.message}`);
    }
  };

  const fields =
    table === "lesson_plan"
      ? [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "subject", label: "Subject", type: "text", required: true },
          { name: "date", label: "Date", type: "date", required: true },
          { name: "startTime", label: "Start Time", type: "datetime-local", required: true },
          { name: "endTime", label: "End Time", type: "datetime-local", required: true },
          { name: "objectives", label: "Objectives", type: "textarea", required: true },
          { name: "activities", label: "Activities", type: "textarea", required: true },
          { name: "resources", label: "Resources", type: "textarea", required: true },
        ]
      : table === "trainee"
      ? [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "surname", label: "Surname", type: "text", required: true },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "address", label: "Address", type: "text", required: true },
          { name: "bloodType", label: "Blood Type", type: "text" },
          { name: "sex", label: "Sex", type: "select", options: ["MALE", "FEMALE"] },
          { name: "birthday", label: "Birthday", type: "date" },
        ]
      : [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "surname", label: "Surname", type: "text", required: true },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "address", label: "Address", type: "text", required: true },
          { name: "bloodType", label: "Blood Type", type: "text" },
          { name: "sex", label: "Sex", type: "select", options: ["MALE", "FEMALE"] },
          { name: "birthday", label: "Birthday", type: "date" },
        ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded ${
          type === "create"
            ? "bg-[#5244F3] text-white hover:bg-[#3b2db5]"
            : type === "update"
            ? "bg-yellow-500 text-white hover:bg-yellow-600"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
      >
        {type === "create" ? "Submit Lesson Plan" : type === "update" ? "Update" : "Delete"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {type === "create" ? "Submit" : type === "update" ? "Update" : "Delete"} {table.replace("_", " ")}
            </h2>
            {type === "delete" ? (
              <div>
                <p className="mb-4">Are you sure you want to delete this {table}?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {fields.map((field) => (
                  <div key={field.name} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required={field.required}
                      >
                        <option value="">Select</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5244F3] text-white rounded hover:bg-[#3b2db5]"
                  >
                    {type === "create" ? "Submit" : "Update"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Form2Modal;