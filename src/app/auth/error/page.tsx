"use client"
import { useRouter } from "next/navigation";

export default function ErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const router = useRouter();
  const error = searchParams.error;

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl mb-4">Authentication Error</h1>
        <p className="mb-4">{error || "An unknown error occurred"}</p>
        <button
          onClick={() => router.push("/auth/signin")}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}