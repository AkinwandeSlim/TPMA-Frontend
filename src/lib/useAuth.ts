"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  identifier: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get backend URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const logout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    localStorage.removeItem("token"); // Clear token from localStorage if used
    setUser(null);
    setError(null);
    router.push("/auth/signin");
  };

  useEffect(() => {
    const verifyToken = async () => {
      // Get token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      console.log("useAuth - Token from cookies:", token || "undefined");

      if (!token) {
        console.log("useAuth - No token, redirecting to signin");
        setError("No authentication token found");
        setLoading(false);
        router.push("/auth/signin");
        return;
      }

      try {
        console.log("useAuth - Verifying token");
        const response = await axios.get(`${API_BASE_URL}/api/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("useAuth - verifyToken response:", response.data);

        const { identifier, role } = response.data;
        if (!identifier || !role) {
          throw new Error("Missing identifier or role in response");
        }

        setUser({ identifier, role });
        setError(null);
        console.log("useAuth - User set:", { identifier, role });
      } catch (error: any) {
        console.error("useAuth - Verification error:", error.message, error.response?.data);
        setError(error.message || "Failed to verify authentication token");
        setUser(null);
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router, API_BASE_URL]);

  return { user, loading, error, logout };
};






















// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// interface User {
//   identifier: string;
//   role: string;
// }

// export const useAuth = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const logout = () => {
//     document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
//     setUser(null);
//     router.push("/auth/signin");
//   };

//   useEffect(() => {
//     const verifyToken = async () => {
//       const token = document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("token="))
//         ?.split("=")[1];

//       console.log("useAuth - Token from cookies:", token || "undefined");

//       if (!token) {
//         console.log("useAuth - No token, redirecting to signin");
//         setLoading(false);
//         router.push("/auth/signin");
//         return;
//       }

//       try {
//         console.log("useAuth - Verifying token");
//         const response = await axios.get("http://localhost:5000/api/verify", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("useAuth - verifyToken response:", response.data);

//         const { identifier, role } = response.data;
//         if (!identifier || !role) {
//           throw new Error("Missing identifier or role in response");
//         }

//         setUser({ identifier, role });
//         console.log("useAuth - User set:", { identifier, role });
//       } catch (error: any) {
//         console.error("useAuth - Verification error:", error.message, error.response?.data);
//         setUser(null);
//         router.push("/auth/signin");
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyToken();
//   }, [router]);










//   return { user, loading, logout };
// };