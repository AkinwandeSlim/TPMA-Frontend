"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
        const response = await axios.get("http://localhost:5000/api/verify", {
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

























































// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";

// const menuItems = [
//   {
//     title: "Dashboard",
//     items: [
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/admin",
//         visible: ["admin"],
//       },
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/trainee",
//         visible: ["teacherTrainee"],
//       },
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/supervisor",
//         visible: ["supervisor"],
//       },

//       {
//         icon: "/teacher.png",
//         label: "Supervisors",
//         href: "/list/supervisors",
//         visible: ["admin"],
//       },
//       {
//         icon: "/student.png",
//         label: "Teacher Trainees",
//         href: "/list/trainees",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/subject.png",
//         label: "Schools",
//         href: "/list/schools",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/assignment.png",
//         label: "TP Assignments",
//         href: "/list/tp_assignments",
//         visible: ["admin"],
//       },
//       {
//         icon: "/lesson.png",
//         label: "Lesson Plans",
//         href: "/trainee/lesson-plans",
//         visible: ["teacherTrainee"],
//       },
//             {
//         icon: "/announcement.png",
//         label: "Notifications",
//         href: "/list/notifications",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },

//       {
//         icon: "/message.png",
//         label: "Feedback",
//         href: "/feedback",
//         visible: ["supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/exam.png",
//         label: "Reports",
//         href: "/reports",
//         visible: ["admin", "teacherTrainee"],
//       },
//     ],
//   },
//   {
//     title: "Account",
//     items: [
//       {
//         icon: "/profile.png",
//         label: "Profile",
//         href: "/profile",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/setting.png",
//         label: "Settings",
//         href: "/settings",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/logout.png",
//         label: "Logout",
//         href: "#",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//     ],
//   },
// ];

// export default function Menu() {
//   const [role, setRole] = useState<string | null>(null);
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
//         setRole(response.data.role);
//       } catch (error) {
//         console.error("Menu - Verification error:", error);
//         router.push("/auth/signin");
//       }
//     };

//     verifyToken();
//   }, [router]);

//   const handleLogout = () => {
//     document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     router.push("/auth/signin");
//   };

//   if (!role) return null; // Or a loading spinner

//   return (
//     <div className="mt-4 text-sm max-w-[200px]">
//       {menuItems.map((section) => (
//         <div className="flex flex-col gap-2" key={section.title}>
//           <span className="hidden lg:block text-gray-400 font-light my-4">
//             {section.title}
//           </span>
//           {section.items.map((item) => {
//             if (item.visible.includes(role)) {
//               return (
//                 <Link
//                   href={item.href}
//                   key={item.label}
//                   className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
//                   onClick={item.label === "Logout" ? handleLogout : undefined}
//                   aria-label={`Navigate to ${item.label}`}
//                 >
//                   <Image
//                     src={item.icon}
//                     alt={`${item.label} icon`}
//                     width={20}
//                     height={20}
//                     className="block w-5 h-5"
//                   />
//                   <span className="hidden lg:block">{item.label}</span>
//                 </Link>
//               );
//             }
//           })}
//         </div>
//       ))}
//     </div>
//   );
// }


















// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { toast } from "react-toastify";
// import { useState } from "react";

// const menuItems = [
//   {
//     title: "Dashboard",
//     items: [
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/admin",
//         visible: ["admin"],
//       },
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/trainee",
//         visible: ["teacherTrainee"],
//       },
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/supervisor",
//         visible: ["supervisor"],
//       },
//       {
//         icon: "/teacher.png",
//         label: "Supervisors",
//         href: "/list/supervisors",
//         visible: ["admin"],
//       },
//       {
//         icon: "/student.png",
//         label: "Teacher Trainees",
//         href: "/list/trainees",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/subject.png",
//         label: "Schools",
//         href: "/list/schools",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/assignment.png",
//         label: "TP Assignments",
//         href: "/list/tp_assignments",
//         visible: ["admin"],
//       },
//       {
//         icon: "/lesson.png",
//         label: "Lesson Plans",
//         href: "/trainee/lesson-plans",
//         visible: ["teacherTrainee"],
//       },
//       {
//         icon: "/announcement.png",
//         label: "Notifications",
//         href: "/list/notifications",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },



//       {
//         icon: "/message.png",
//         label: "Feedback",
//         href: "/feedback",
//         visible: ["supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/exam.png",
//         label: "Reports",
//         href: "/reports",
//         visible: ["admin", "teacherTrainee"],
//       },






//       {
//         icon: "/calendar.png",
//         label: "Events",
//         href: "/list/events",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//     ],
//   },
//   {
//     title: "Evaluations",
//     items: [
//       {
//         icon: "/class.png",
//         label: "Student Evaluations",
//         href: "/list/student_evaluations",
//         visible: ["admin"],
//       },
//       {
//         icon: "/subject.png",
//         label: "Supervisor Evaluations",
//         href: "/list/supervisor_evaluations",
//         visible: ["admin"],
//       },
//     ],
//   },
//   {
//     title: "Account",
//     items: [
//       {
//         icon: "/profile.png",
//         label: "Profile",
//         href: "/profile",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/setting.png",
//         label: "Settings",
//         href: "/settings",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/logout.png",
//         label: "Logout",
//         href: "#",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//     ],
//   },
// ];

// interface MenuProps {
//   role: string | null;
//   handleLogout: () => void;
// }

// export default function Menu({ role, handleLogout }: MenuProps) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   if (!role) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <p className="text-gray-500">Loading menu...</p>
//       </div>
//     );
//   }

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

  

//   return (
//     <div className="mt-4 text-sm">
//       {/* Mobile Menu Toggle Button */}
//       <button
//         className="md:hidden flex items-center justify-between w-full p-4 bg-white rounded-md shadow-sm"
//         onClick={toggleMenu}
//         aria-expanded={isMenuOpen}
//         aria-controls="mobile-menu"
//         aria-label="Toggle navigation menu"
//       >
//         <span className="text-gray-600 font-medium">Menu</span>
//         <svg
//           className={`w-6 h-6 transform transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
//         </svg>
//       </button>

//       {/* Menu Content */}
//       <div
//         id="mobile-menu"
//         className={`${
//           isMenuOpen ? "block" : "hidden"
//         } md:block bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out`}
//       >
//         {menuItems.map((section) => (
//           <div className="flex flex-col gap-2 p-4" key={section.title}>
//             <span className="text-gray-500 font-medium text-xs uppercase tracking-wide">
//               {section.title}
//             </span>
//             {section.title === "Evaluations" && role === "admin" ? (
//               <details className="group">
//                 <summary className="flex items-center justify-between gap-4 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
//                   <div className="flex items-center gap-4">
//                     <Image src="/attendance.png" alt="Evaluations" width={20} height={20} />
//                     <span className="font-medium">Evaluations</span>
//                   </div>
//                   <svg
//                     className="w-4 h-4 group-open:rotate-180 transition-transform"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </summary>
//                 <div className="pl-8 pt-2 flex flex-col gap-2">
//                   {section.items.map((item) => {
//                     if (item.visible.includes(role)) {
//                       return (
//                         <Link
//                           href={item.href}
//                           key={item.label}
//                           className="flex items-center gap-4 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
//                           onClick={() => setIsMenuOpen(false)}
//                         >
//                           <Image src={item.icon} alt={item.label} width={20} height={20} />
//                           <span className="font-medium">{item.label}</span>
//                         </Link>
//                       );
//                     }
//                     return null;
//                   })}
//                 </div>
//               </details>
//             ) : (
//               section.items.map((item) => {
//                 if (item.visible.includes(role)) {
//                   return (
//                     <Link
//                       href={item.href}
//                       key={item.label}
//                       className="flex items-center gap-4 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
//                       onClick={
//                         item.label === "Logout"
//                           ? () => {
//                               handleLogout();
//                               toast.success("Logged out successfully");
//                               setIsMenuOpen(false);
//                             }
//                           : () => setIsMenuOpen(false)
//                       }
//                     >
//                       <Image src={item.icon} alt={item.label} width={20} height={20} />
//                       <span className="font-medium">{item.label}</span>
//                     </Link>
//                   );
//                 }
//                 return null;
//               })
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
















































// // src/components/Menu.tsx
// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { toast } from "react-toastify";

// const menuItems = [
//   {
//     title: "Dashboard",
//     items: [
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/admin",
//         visible: ["admin",],
//       },

//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/trainee",
//         visible: ["teacherTrainee"],
//       },

//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/supervisor",
//         visible: ["supervisor"],
//       },



//       {
//         icon: "/teacher.png",
//         label: "Supervisors",
//         href: "/list/supervisors",
//         visible: ["admin"],
//       },
//       {
//         icon: "/student.png",
//         label: "Teacher Trainees",
//         href: "/list/trainees",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/subject.png",
//         label: "Schools",
//         href: "/list/schools",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/assignment.png",
//         label: "TP Assignments",
//         href: "/list/tp_assignments",
//         visible: ["admin"],
//       },
//       {
//         icon: "/lesson.png",
//         label: "Lesson Plans",
//         href: "/trainee",
//         visible: ["teacherTrainee"],
//       },
//       {
//         icon: "/announcement.png",
//         label: "Notifications",
//         href: "/list/notifications",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/calendar.png",
//         label: "Events",
//         href: "/list/events",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//     ],
//   },
//   {
//     title: "Evaluations",
//     items: [
//       {
//         icon: "/class.png",
//         label: "Student Evaluations",
//         href: "/list/student_evaluations",
//         visible: ["admin"],
//       },
//       {
//         icon: "/subject.png",
//         label: "Supervisor Evaluations",
//         href: "/list/supervisor_evaluations",
//         visible: ["admin"],
//       },
//     ],
//   },
//   {
//     title: "Account",
//     items: [
//       {
//         icon: "/profile.png",
//         label: "Profile",
//         href: "/profile",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/setting.png",
//         label: "Settings",
//         href: "/settings",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/logout.png",
//         label: "Logout",
//         href: "#",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//     ],
//   },
// ];

// interface MenuProps {
//   role: string | null;
//   handleLogout: () => void;
// }

// export default function Menu({ role, handleLogout }: MenuProps) {
//   if (!role) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <p className="text-gray-500">Loading menu...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-4 text-sm bg-white rounded-md shadow-sm">
//       {menuItems.map((section) => (
//         <div className="flex flex-col gap-2 p-4" key={section.title}>
//           <span className="hidden lg:block text-gray-500 font-medium text-xs uppercase tracking-wide">
//             {section.title}
//           </span>
//           {section.title === "Evaluations" && role === "admin" ? (
//             <details className="group">
//               <summary className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
//                 <Image src="/attendance.png" alt="Evaluations" width={20} height={20} />
//                 <span className="hidden lg:block font-medium">Evaluations</span>
//                 <svg
//                   className="w-4 h-4 ml-auto hidden lg:block group-open:rotate-180"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                 </svg>
//               </summary>
//               <div className="pl-8 pt-2 flex flex-col gap-2">
//                 {section.items.map((item) => {
//                   if (item.visible.includes(role)) {
//                     return (
//                       <Link
//                         href={item.href}
//                         key={item.label}
//                         className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
//                       >
//                         <Image src={item.icon} alt={item.label} width={20} height={20} />
//                         <span className="hidden lg:block font-medium">{item.label}</span>
//                       </Link>
//                     );
//                   }
//                   return null;
//                 })}
//               </div>
//             </details>
//           ) : (
//             section.items.map((item) => {
//               if (item.visible.includes(role)) {
//                 return (
//                   <Link
//                     href={item.href}
//                     key={item.label}
//                     className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
//                     onClick={item.label === "Logout" ? () => { handleLogout(); toast.success("Logged out successfully"); } : undefined}
//                   >
//                     <Image src={item.icon} alt={item.label} width={20} height={20} />
//                     <span className="hidden lg:block font-medium">{item.label}</span>
//                   </Link>
//                 );
//               }
//               return null;
//             })
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

























// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";

// // const menuItems = [
// //   {
// //     title: "MENU",
// //     items: [
// //       {
// //         icon: "/home.png",
// //         label: "Home",
// //         href: "/admin",
// //         visible: ["admin", "supervisor", "teacherTrainee"],
// //       },
// // {
// //         icon: "/teacher.png",
// //         label: "Supervisors",
// //         href: "/list/supervisors", // Updated
// //         visible: ["admin"],
// //       },
// //       {
// //         icon: "/student.png",
// //         label: "Teacher Trainees",
// //         href: "/list/trainees", // Updated
// //         visible: ["admin", "supervisor"], // Consider adding "teacherTrainee" if needed
// //       },

// //     {
// //         icon: "/subject.png",
// //         label: "Schools",
// //         href: "/list/schools",
// //         visible: ["admin","supervisor"],
// //       },


// //       {
// //         icon: "/assignment.png",
// //         label: "TP Assignments",
// //         href: "/list/tp_assignments",
// //         visible: ["admin"],
// //       },
// //       {
// //         icon: "/lesson.png",
// //         label: "Lesson Plans",
// //         href: "/trainee/lesson-plans",
// //         visible: ["admin","teacherTrainee"],
// //       },
// //       {
// //         icon: "/exam.png",
// //         label: "Reports",
// //         href: "/trainee/reports",
// //         visible: ["admin","teacherTrainee"],
// //       },

// //       {
// //         icon: "/result.png",
// //         label: "Evaluation Forms",
// //         href: "/admin/evaluation-forms",
// //         visible: ["admin"],
// //       },
// //       {
// //         icon: "/calendar.png",
// //         label: "Events",
// //         href: "/list/events",
// //         visible: ["admin", "supervisor", "teacherTrainee"],
// //       },
// //       {
// //         icon: "/announcement.png",
// //         label: "Announcements",
// //         href: "/list/announcements",
// //         visible: ["admin", "supervisor", "teacherTrainee"],
// //       },
// //     ],
// //   },
// //   {
// //     title: "OTHER",
// //     items: [
// //       {
// //         icon: "/profile.png",
// //         label: "Profile",
// //         href: "/profile",
// //         visible: ["admin", "supervisor", "teacherTrainee"],
// //       },
// //       {
// //         icon: "/setting.png",
// //         label: "Settings",
// //         href: "/settings",
// //         visible: ["admin", "supervisor", "teacherTrainee"],
// //       },
// //       {
// //         icon: "/logout.png",
// //         label: "Logout",
// //         href: "#",
// //         visible: ["admin", "supervisor", "teacherTrainee"],
// //       },
// //     ],
// //   },
// // ];

// const menuItems = [
//   {
//     title: "Dashboard",
//     items: [
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/dashboard",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/teacher.png",
//         label: "Supervisors",
//         href: "/list/supervisors",
//         visible: ["admin"],
//       },
//       {
//         icon: "/student.png",
//         label: "Teacher Trainees",
//         href: "/list/trainees",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/subject.png",
//         label: "Schools",
//         href: "/list/schools",
//         visible: ["admin", "supervisor"],
//       },
//       {
//         icon: "/assignment.png",
//         label: "TP Assignments",
//         href: "/list/tp_assignments",
//         visible: ["admin"],
//       },
//       {
//         icon: "/lesson.png",
//         label: "Lesson Plans",
//         href: "/list/lesson-plans",
//         visible: ["teacherTrainee"],
//       },
//       {
//         icon: "/feedback.png",
//         label: "Feedback",
//         href: "/feedback",
//         visible: ["supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/exam.png",
//         label: "Reports",
//         href: "/reports",
//         visible: ["admin", "teacherTrainee"],
//       },
//     ],
//   },
//   {
//     title: "Account",
//     items: [
//       {
//         icon: "/profile.png",
//         label: "Profile",
//         href: "/profile",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/setting.png",
//         label: "Settings",
//         href: "/settings",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//       {
//         icon: "/logout.png",
//         label: "Logout",
//         href: "#",
//         visible: ["admin", "supervisor", "teacherTrainee"],
//       },
//     ],
//   },
// ];



// export default function Menu() {
//   const [role, setRole] = useState<string | null>(null);
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
//         setRole(response.data.role);
//       } catch (error) {
//         console.error("Menu - Verification error:", error);
//         router.push("/auth/signin");
//       }
//     };

//     verifyToken();
//   }, [router]);

//   const handleLogout = () => {
//     document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     router.push("/auth/signin");
//   };

//   if (!role) return null; // Or a loading state

//   return (
//     <div className="mt-4 text-sm">
//       {menuItems.map((i) => (
//         <div className="flex flex-col gap-2" key={i.title}>
//           <span className="hidden lg:block text-gray-400 font-light my-4">
//             {i.title}
//           </span>
//           {i.items.map((item) => {
//             if (item.visible.includes(role)) {
//               return (
//                 <Link
//                   href={item.href}
//                   key={item.label}
//                   className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
//                   onClick={item.label === "Logout" ? handleLogout : undefined}
//                 >
//                   <Image src={item.icon} alt="" width={20} height={20} />
//                   <span className="hidden lg:block">{item.label}</span>
//                 </Link>
//               );
//             }
//           })}
//         </div>
//       ))}
//     </div>
//   );
// }























// import { currentUser } from "@clerk/nextjs/server";
// import Image from "next/image";
// import Link from "next/link";

// const menuItems = [
//   {
//     title: "MENU",
//     items: [
//       {
//         icon: "/home.png",
//         label: "Home",
//         href: "/admin",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/teacher.png",
//         label: "Supervisor",//Teacher
//         href: "/list/teachers",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/student.png",
//         label: "Teacher-Trainee",//Students
//         href: "/list/students",
//         visible: ["admin", "teacher"],
//       },
//       // {
//       //   icon: "/parent.png",
//       //   label: "Parents",
//       //   href: "/list/parents",
//       //   visible: ["admin", "teacher"],
//       // },
//       {
//         icon: "/subject.png",
//         label: "Subjects",
//         href: "/list/subjects",
//         visible: ["admin"],
//       },
//       {
//         icon: "/class.png",
//         label: "Classes",
//         href: "/list/classes",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/lesson.png",
//         label: "Lessons",
//         href: "/list/lessons",
//         visible: ["admin", "teacher"],
//       },
//       {
//         icon: "/exam.png",
//         label: "Exams",
//         href: "/list/exams",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/assignment.png",
//         label: "Assignments",
//         href: "/list/assignments",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/result.png",
//         label: "Results",
//         href: "/list/results",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/attendance.png",
//         label: "Attendance",
//         href: "/list/attendance",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
    //   {
    //     icon: "/calendar.png",
    //     label: "Events",
    //     href: "/list/events",
    //     visible: ["admin", "teacher", "student", "parent"],
    //   },
    //   {
    //     icon: "/message.png",
    //     label: "Messages",
    //     href: "/list/messages",
    //     visible: ["admin", "teacher", "student", "parent"],
    //   },
    //   {
    //     icon: "/announcement.png",
    //     label: "Announcements",
    //     href: "/list/announcements",
    //     visible: ["admin", "teacher", "student", "parent"],
    //   },
    // ],
//   },
//   {
//     title: "OTHER",
//     items: [
//       {
//         icon: "/profile.png",
//         label: "Profile",
//         href: "/profile",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/setting.png",
//         label: "Settings",
//         href: "/settings",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//       {
//         icon: "/logout.png",
//         label: "Logout",
//         href: "/logout",
//         visible: ["admin", "teacher", "student", "parent"],
//       },
//     ],
//   },
// ];

// const Menu = async () => {
//   const user = await currentUser();
//   const role = user?.publicMetadata.role as string;
//   return (
//     <div className="mt-4 text-sm">
//       {menuItems.map((i) => (
//         <div className="flex flex-col gap-2" key={i.title}>
//           <span className="hidden lg:block text-gray-400 font-light my-4">
//             {i.title}
//           </span>
//           {i.items.map((item) => {
//             if (item.visible.includes(role)) {
//               return (
//                 <Link
//                   href={item.href}
//                   key={item.label}
//                   className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
//                 >
//                   <Image src={item.icon} alt="" width={20} height={20} />
//                   <span className="hidden lg:block">{item.label}</span>
//                 </Link>
//               );
//             }
//           })}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Menu;
