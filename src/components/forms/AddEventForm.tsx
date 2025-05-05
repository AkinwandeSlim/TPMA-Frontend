"use client";

import { API_BASE_URL } from "@/lib/api";
import axios from "axios";
import { useState } from "react";

interface AddEventFormProps {
  onEventAdded: () => void;
  selectedDate: string;
}

const AddEventForm: React.FC<AddEventFormProps> = ({ onEventAdded, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: `${selectedDate}T10:00:00.000Z`, // Default to 10:00 on the selected date
    endTime: `${selectedDate}T12:00:00.000Z`,   // Default to 12:00 on the selected date
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      setError("No authentication token found.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/events`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Event created successfully!");
      setFormData({
        title: "",
        description: "",
        startTime: `${selectedDate}T10:00:00.000Z`,
        endTime: `${selectedDate}T12:00:00.000Z`,
      });
      onEventAdded(); // Trigger a refresh of the event list
    } catch (err:any) {
      setError(err.response?.data?.error || "Failed to create event.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-md border-2 border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Add New Event</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-gray-600 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime.slice(0, 16)} // Format for datetime-local input
            onChange={(e) =>
              setFormData({ ...formData, startTime: `${e.target.value}:00.000Z` })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime.slice(0, 16)}
            onChange={(e) =>
              setFormData({ ...formData, endTime: `${e.target.value}:00.000Z` })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-lamaSky text-white p-2 rounded-md hover:bg-lamaSkyLight"
        >
          Add Event
        </button>
      </form>
    </div>
  );
};

export default AddEventForm;




















