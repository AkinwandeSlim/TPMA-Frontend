// src/components/Navbar.tsx
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

interface NavbarProps {
  role: string | null;
  identifier: string | null;
  unreadCount: number;
}

export default function Navbar({ role, identifier, unreadCount }: NavbarProps) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  console.log("unreadCount: ",unreadCount);
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth/signin");
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      <div className="flex items-center gap-6 justify-end w-full">
        <div
          className="relative bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
          onClick={() => router.push("/list/notifications")}
        >
          <Image src="/announcement.png" alt="Notifications" width={20} height={20} />
          {unreadCount > 0 && (
            <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
              {unreadCount}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{identifier || "User"}</span>
          <span className="text-[10px] text-gray-500 text-right">
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Loading..."}
          </span>
        </div>



        {/* <button onClick={handleLogout} className="text-red-500 text-sm">
          Logout
        </button> */}

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>


{/* 
        <button
          onClick={() => logout()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
          aria-label="Sign out"
        >
          Sign Out
        </button> */}



      </div>
    </div>
  );
}










































