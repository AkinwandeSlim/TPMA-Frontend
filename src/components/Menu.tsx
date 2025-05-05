"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
const menuItems = [
  {
    title: "Dashboard",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/admin",
        visible: ["admin"],
      },
      {
        icon: "/home.png",
        label: "Home",
        href: "/trainee",
        visible: ["teacherTrainee"],
      },
      {
        icon: "/home.png",
        label: "Home",
        href: "/supervisor",
        visible: ["supervisor"],
      },
      {
        icon: "/teacher.png",
        label: "Supervisors",
        href: "/list/supervisors",
        visible: ["admin"],
      },
      {
        icon: "/student.png",
        label: "Teacher Trainees",
        href: "/list/trainees",
        visible: ["admin",],
      },

  {
    icon: "/student.png",
    label: "Teacher Trainees",
    href: "/supervisor/trainees",
    visible: ["supervisor"],
  },
      {
        icon: "/subject.png",
        label: "Schools",
        href: "/list/schools",
        visible: ["admin",],
      },
      {
        icon: "/assignment.png",
        label: "TP Assignments",
        href: "/list/tp_assignments",
        visible: ["admin"],
      },
      {
        icon: "/lesson.png",
        label: "Lesson Plans",
        href: "/trainee/lesson-plans",
        visible: ["teacherTrainee"],
      },
      {
        icon: "/lesson.png",
        label: "Review Lesson-Plans ",
        href: "/supervisor/lesson-plans",
        visible: ["supervisor"],
      },
      {
        icon: "/message.png",
        label: "Feedback (Observation)",
        href: "/supervisor/feedbacks",
        visible: ["supervisor"],
      },
      {
        icon: "/message.png",
        label: "Feedback (Observation)",
        href: "/trainee/feedbacks",
        visible: ["teacherTrainee"],
      },
      {
        icon: "/class.png",
        label: "Student Evaluations",
        href: "/list/student_evaluations",
        visible: ["admin",],
      },
      {
        icon: "/class.png",
        label: "Student Evaluations",
        href: "/supervisor/evaluations",
        visible: ["supervisor"],
      },

      {
        icon: "/subject.png",
        label: "Supervisor Evaluations",
        href: "/list/supervisor_evaluations",
        visible: ["admin"],
      },
      {
        icon: "/exam.png",
        label: "Reports",
        href: "/reports",
        visible: ["admin"],
      },
        {
        icon: "/exam.png",
        label: "Reports",
        href: "/supervisor/reports",
        visible: ["supervisor"],
      },
      {
        icon: "/announcement.png",
        label: "Notifications",
        href: "/list/notifications",
        visible: ["admin", "supervisor", "teacherTrainee"],
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/admin",
        visible: ["admin",],
      },
      {
        icon: "/profile.png",
        label: "profile",
        href: "/trainee/profile",
        visible: ["teacherTrainee"],
      },
      {
        icon: "/profile.png",
        label: "profile",
        href: "/supervisor/profile",
        visible: ["supervisor"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "#",
        visible: ["admin",],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "#",
        visible: ["admin", "supervisor", "teacherTrainee"],
      },
    ],
  },
];

export default function Menu({ role, handleLogout }: { role: string | null; handleLogout: () => void }) {
  const router = useRouter();
  const [verifiedRole, setVerifiedRole] = useState<string | null>(role);

  useEffect(() => {
    const verifyToken = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      console.log("Menu - Token:", token || "No token found");

      if (!token) {
        console.log("Menu - No token, redirecting to signin");
        router.push("/auth/signin");
        return;
      }

      try {
        console.log("Menu - Verifying token");
        const response = await axios.get(`${API_BASE_URL}/api/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Menu - Verification success:", response.data);
        setVerifiedRole(response.data.role);
      } catch (error: any) {
        console.error("Menu - Verification error:", error.message, error.response?.data);
        router.push("/auth/signin");
      }
    };

    if (!role) {
      verifyToken();
    }
  }, [role, router]);















  if (!verifiedRole) {
    return (
      <div className="flex items-center justify-center mt-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 text-sm max-w-[200px]">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => {
            if (item.visible.includes(verifiedRole)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                  onClick={item.label === "Logout" ? handleLogout : undefined}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.label} icon`}
                    width={20}
                    height={20}
                    className="block w-5 h-5"
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}




















































