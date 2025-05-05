"use client";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // e.g., "admin"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/signin");
      } else if (requiredRole && user.role !== requiredRole) {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user || (requiredRole && user.role !== requiredRole)) {
    return <div className="p-4">Loading...</div>;
  }

  return <>{children}</>;
}