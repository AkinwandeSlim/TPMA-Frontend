"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { verifyToken, getUnreadNotificationsCount } from "@/lib/api";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const { unread_count } = await getUnreadNotificationsCount();
      console.log("Layout - Fetched unread count:", unread_count);
      setUnreadCount(unread_count);
    } catch (error: any) {
      console.error("Layout - Unread count error:", error.message);
    }
  };

  // const handleLogout = () => {
  //   console.log("Layout - Logging out");
  //   document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  //   router.push("/auth/signin");
  // };



  const handleLogout = () => {
    console.log("Layout - Logging out");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth/signin");
  };








  useEffect(() => {
    const authenticate = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      console.log("Layout - Token:", token || "No token found");

      if (!token) {
        console.log("Layout - No token, redirecting to signin");
        router.push("/auth/signin");
        return;
      }

      try {
        console.log("Layout - Verifying token");
        const { role, identifier } = await verifyToken();
        console.log("Layout - Verification success:", { role, identifier });
        setRole(role);
        setIdentifier(identifier);

        const currentPath = window.location.pathname;
        console.log("Layout - Current path:", currentPath);
        if (
          (currentPath.startsWith("/admin") && role !== "admin") ||
          (currentPath.startsWith("/supervisor") && role !== "supervisor") ||
          (currentPath.startsWith("/trainee") && role !== "teacherTrainee")
        ) {
          console.log("Layout - Role mismatch, redirecting to signin");
          router.push("/auth/signin");
          return;
        }

        await fetchUnreadCount();
      } catch (error: any) {
        console.error("Layout - Verification error:", error.message, error.response?.data);
        router.push("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();

    const interval = setInterval(fetchUnreadCount, 10000);
    const handleNotificationUpdate = () => {
      console.log("Layout - Notification event triggered");
      fetchUnreadCount();
    };

    window.addEventListener("notification:updated", handleNotificationUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notification:updated", handleNotificationUpdate);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
          <Image src="/tpma-logos1.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">
            <span className="text-yellow-500">SLUK-</span>
            <span className="text-primary-500">TPMA</span>
          </span>
        </Link>
        <Menu role={role} handleLogout={handleLogout} />
      </div>
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar role={role} identifier={identifier} unreadCount={unreadCount} />
        {children}
      </div>
    </div>
  );
}






























// // src/app/(dashboard)/layout.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Menu from "@/components/Menu";
// import Navbar from "@/components/Navbar";
// import Image from "next/image";
// import Link from "next/link";
// import { verifyToken, getUnreadNotificationsCount } from "@/lib/api";

// export default function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const router = useRouter();
//   const [role, setRole] = useState<string | null>(null);
//   const [identifier, setIdentifier] = useState<string | null>(null);
//   const [unreadCount, setUnreadCount] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchUnreadCount = async () => {
//     try {
//       const { unread_count } = await getUnreadNotificationsCount();
//       console.log("Layout - Fetched unread count:", unread_count);
//       setUnreadCount(unread_count);
//     } catch (error: any) {
//       console.error("Layout - Unread count error:", error.message);
//     }
//   };

//   const handleLogout = () => {
//     document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     router.push("/auth/signin");
//   };

//   useEffect(() => {
//     const authenticate = async () => {
//       const token = document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("token="))
//         ?.split("=")[1];

//       if (!token) {
//         console.log("Layout - No token");
//         router.push("/auth/signin");
//         return;
//       }

//       try {
//         const { role, identifier } = await verifyToken();
//         setRole(role);
//         setIdentifier(identifier);

//         const currentPath = window.location.pathname;
//         if (
//           (currentPath.startsWith("/admin") && role !== "admin") ||
//           (currentPath.startsWith("/supervisor") && role !== "supervisor") ||
//           (currentPath.startsWith("/trainee") && role !== "teacherTrainee")
//         ) {
//           console.log("Layout - Role mismatch");
//           router.push("/auth/signin");
//           return;
//         }

//         await fetchUnreadCount();
//       } catch (error: any) {
//         console.error("Layout - Verification error:", error.message);
//         router.push("/auth/signin");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     authenticate();

//     const interval = setInterval(fetchUnreadCount, 10000);
//     const handleNotificationUpdate = () => {
//       console.log("Layout - Notification event triggered");
//       fetchUnreadCount();
//     };

//     window.addEventListener("notification:updated", handleNotificationUpdate);

//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("notification:updated", handleNotificationUpdate);
//     };
//   }, [router]);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="h-screen flex">
//       <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
//         <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
//           <Image src="/tpma-logos1.png" alt="logo" width={32} height={32} />
//           <span className="hidden lg:block font-bold">
//             <span className="text-yellow-500">SLUK-</span>
//             <span className="text-primary-500">TPMA</span>
//           </span>
//         </Link>
//         <Menu role={role} handleLogout={handleLogout} />
//       </div>
//       <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
//         <Navbar role={role} identifier={identifier} unreadCount={unreadCount} />
//         {children}
//       </div>
//     </div>
//   );
// }













// "use client";
// import { useEffect } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Menu from "@/components/Menu";
// import Navbar from "@/components/Navbar";
// import Image from "next/image";
// import Link from "next/link";

// export default function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const router = useRouter();

//   useEffect(() => {
//     const verifyToken = async () => {
//       const token = document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("token="))
//         ?.split("=")[1];

//       if (!token) {
//         router.push("/auth/signin");
//         return;
//       }

//       try {
//         const response = await axios.get("http://localhost:5000/api/verify", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const role = response.data.role;
//         const currentPath = window.location.pathname;

//         if (
//           (currentPath.startsWith("/admin") && role !== "admin") ||
//           (currentPath.startsWith("/supervisor") && role !== "supervisor") ||
//           (currentPath.startsWith("/trainee") && role !== "teacherTrainee")
//         ) {
//           router.push("/auth/signin");
//         }
//       } catch (error) {
//         console.error("DashboardLayout - Verification error:", error);
//         router.push("/auth/signin");
//       }
//     };

//     verifyToken();
//   }, [router]);

//   return (
//     <div className="h-screen flex">
//       {/* LEFT */}
//       <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
//         <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
//           <Image src="/tpma-logos1.png" alt="logo" width={32} height={32} />
//           <span className="hidden lg:block font-bold">
//           <span className="text-yellow-500">SLUK-</span> {/* Updated to yellow-500 */}
//           <span className="text-primary-500">TPMA</span>
//           </span>
//         </Link>
//         <Menu />
//       </div>
//       {/* RIGHT */}
//       <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
//         <Navbar />
//         {children}
//       </div>
//     </div>
//   );
// }


















// import Menu from "@/components/Menu";
// import Navbar from "@/components/Navbar";
// import Image from "next/image";
// import Link from "next/link";

// export default function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div className="h-screen flex">
//       {/* LEFT */}
//       <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
//         <Link
//           href="/"
//           className="flex items-center justify-center lg:justify-start gap-2"
//         >
//           {/*<Image src="/logo.png" alt="logo" width={32} height={32} />*/}
//         <Image src="/tpma-logos.png" alt="logo" width={32} height={32} />
//           <span className="hidden lg:block font-bold">SLUK-TPMA</span>
//         </Link>
//         <Menu />
//       </div>
//       {/* RIGHT */}
//       <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
//         <Navbar />
//         {children}
//       </div>
//     </div>
//   );
// }
