
"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Logo } from "@/templates/Logo";
import Image from "next/image";

type FormData = {
  userType: "admin" | "supervisor" | "teacherTrainee";
  identifier: string;
  password: string;
};

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    userType: "admin",
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setError(""); // Clear error on input change
  };

  const validateForm = (): boolean => {
    if (!formData.userType) {
      setError("Please select a user type");
      return false;
    }
    if (!formData.identifier) {
      setError("Please enter your identifier");
      return false;
    }
    if (!formData.password) {
      setError("Please enter your password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Login Data:", formData);
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/login", formData);
      console.log("Login response:", response.data);
      const { token, role } = response.data;

      if (!token || !role) {
        throw new Error("Invalid response from server");
      }

      // Store token in cookie
      document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
      console.log("Token stored in cookie:", document.cookie);

      toast.success("Login successful!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      const redirectPath =
        role.toLowerCase() === "teachertrainee" ? "/trainee" : `/${role.toLowerCase()}`;
      console.log("Redirecting to:", redirectPath);
      setTimeout(() => router.push(redirectPath), 1000); // Delay for toast visibility
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        (err.message === "Network Error"
          ? "Unable to connect to the server. Please try again later."
          : "Login failed. Please check your credentials.");
      setError(errorMessage);
      console.error("Login error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo xl />
        </div>
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
              User Type
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:bg-gray-100"
            >
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="teacherTrainee">Trainee</option>
            </select>
          </div>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              {formData.userType === "admin"
                ? "Username"
                : formData.userType === "supervisor"
                ? "Staff ID"
                : "Reg No"}
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={formData.identifier}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Image
                  src={showPassword ? "/eye-off.png" : "/eye.png"}
                  alt={showPassword ? "Hide password" : "Show password"}
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 rounded-md text-white font-medium transition duration-200 flex items-center justify-center ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                  ></path>
                </svg>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

