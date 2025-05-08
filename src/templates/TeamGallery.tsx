"use client";
import { Section } from "@/layout/Section"; // Ensure correct import path
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: "Prof. Muhammad Ibrahim Yakasai",
    role: "Vice Chancellor",
    image: "/assets/images/team/SLUK-VC.jpg",
    bio: "Leading the vision for academic excellence at Sule Lamido University.",
    linkedin: "https://linkedin.com/in/muhammad-ibrahim-yakasai",
  },
  {
    name: "Dr. Abdullahi Ali Taura",
    role: "Dean, Faculty of Education",
    image: "/assets/images/team/Dean.jpg",
    bio: "Overseeing educational initiatives and teaching practice programs.",
    linkedin: "https://linkedin.com/in/abdullahi-ali-taura",
  },
  {
    name: "Dr. Usmah Isah",
    role: "Project Developer",
    image: "/assets/images/team/DrUsman.jpg",
    bio: "Driving the technical development of TPMA with innovative solutions.",
    linkedin: "https://linkedin.com/in/usmah-isah",
  },
  {
    name: "Kashifu Inuwa Abdullahi CCIE",
    role: "DG NITDA",
    image: "/assets/images/team/NITDA1.jpg",
    bio: "Championing digital transformation in education through NITDA.",
    linkedin: "https://linkedin.com/in/musa-ahmed",
  },
];

const TeamGallery = () => (
  <Section
    title="Our Project Team"
    description="Meet the dedicated professionals behind SLUK-TPMA, a collaboration between Sule Lamido University and NITDA."
  >
    <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {teamMembers.map((member, index) => (
        <motion.div
          key={member.name}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: (i: number) => ({
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, delay: i * 0.2 },
            }),
          }}
          className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="p-6 text-center">
            <div className="relative mx-auto h-48 w-48">
              <Image src={member.image} alt={member.name} fill objectFit="cover" className="rounded-full border-4 border-blue-100" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">{member.name}</h3>
            <p className="text-blue-500 font-medium">{member.role}</p>
            <p className="mt-2 text-gray-600 text-sm line-clamp-2">{member.bio}</p>
            <div className="mt-4">
              <Link href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-semibold">
                LinkedIn
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

export { TeamGallery };



























// import { Section } from "@/layout/Section";
// import Image from "next/image";
// import Link from "next/link";

// // Define the team members with additional fields for bio and social links
// const teamMembers = [
//   {
//     name: "Prof. Muhammad Ibrahim Yakasai",
//     role: "Vice Chancellor",
//     image: "/assets/images/team/SLUK-VC.jpg",
//     bio: "Leading the vision for academic excellence at Sule Lamido University.",
//     linkedin: "https://linkedin.com/in/muhammad-ibrahim-yakasai",
//   },
//   {
//     name: "Dr. Abdullahi Ali Taura",
//     role: "Dean, Faculty of Education",
//     image: "/assets/images/team/Dean.jpg",
//     bio: "Overseeing educational initiatives and teaching practice programs.",
//     linkedin: "https://linkedin.com/in/abdullahi-ali-taura",
//   },
//   {
//     name: "Dr. Usmah Isah",
//     role: "Project Developer",
//     image: "/assets/images/team/DrUsman.jpg",
//     bio: "Driving the technical development of TPMA with innovative solutions.",
//     linkedin: "https://linkedin.com/in/usmah-isah",
//   },
//   {
//     name: "Kashifu Inuwa Abdullahi CCIE",
//     role: "DG  NITDA",
//     image: "/assets/images/team/NITDA1.jpg",
//     bio: "Championing digital transformation in education through NITDA.",
//     linkedin: "https://linkedin.com/in/musa-ahmed",
//   },
// ];

// const TeamGallery = () => (
//   <Section
//     title="Our Project Team"
//     description="Meet the dedicated professionals behind SLUK-TPMA, a collaboration between Sule Lamido University and NITDA."
//   >
//     <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
//       {teamMembers.map((member) => (
//         <div
//           key={member.name}
//           className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//         >
//           {/* Team Member Card */}
//           <div className="p-6 text-center">
//             {/* Image */}
//             <div className="relative mx-auto h-40 w-40">
//               <Image
//                 src={member.image}
//                 alt={member.name}
//                 layout="fill"
//                 objectFit="cover"
//                 className="rounded-full border-4 border-primary-100"
//               />
//             </div>
//             {/* Name */}
//             <h3 className="mt-4 text-xl font-semibold text-gray-800">
//               {member.name}
//             </h3>
//             {/* Role */}
//             <p className="text-yellow-600 font-medium">{member.role}</p>
//             {/* Bio */}
//             <p className="mt-2 text-gray-600 text-sm">{member.bio}</p>
//             {/* Social Link */}
//             <div className="mt-4">
//               <Link href={member.linkedin} target="_blank" rel="noopener noreferrer">
//                 <span className="inline-block text-primary-500 hover:text-primary-600 font-semibold">
//                   LinkedIn
//                 </span>
//               </Link>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   </Section>
// );

// export { TeamGallery };