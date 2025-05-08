"use client";
import { Background } from '@/background/Background';
import { Section } from '@/layout/Section';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { TeamGallery } from './TeamGallery';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Animation variants
const textVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const About = () => (
  <div className="text-gray-600 antialiased font-sans">
    {/* Navbar */}
    <div className="bg-blue-50 sticky top-0 z-50">
      <Navbar />
    </div>

    {/* Hero Section */}
    <Background color="bg-white">
      <Section yPadding="pt-24 pb-40" className="bg-gradient-to-br from-blue-50 via-white to-blue-200 animate-gradient">
        <motion.div className="text-center space-y-6" initial="hidden" animate="visible">
          <motion.h1 variants={textVariants} custom={0} className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight tracking-tight">
            About <span className="text-yellow-500">SLUK-</span>
            <span className="text-primary-600">TPMA</span>
          </motion.h1>
          <motion.p variants={textVariants} custom={0.2} className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            A collaborative initiative to revolutionize teaching practice management at Sule Lamido University.
          </motion.p>
          <motion.div variants={textVariants} custom={0.4} className="mt-8">
            <Link href="/auth/signin" className="inline-block bg-gradient-to-r from-blue-500 to-blue-200 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-blue-300 transition-transform transform hover:scale-105 focus:ring-4 focus:ring-blue-300 shadow-md" aria-label="Get started with SLUK-TPMA">
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </Section>
    </Background>

    {/* Project Overview Section */}
    <Background color="bg-blue-100">
      <Section yPadding="py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" className="space-y-4">
            <motion.h2 variants={textVariants} custom={0} className="text-3xl font-semibold text-gray-800">
              What is SLUK-TPMA?
            </motion.h2>
            <motion.p variants={textVariants} custom={0.2} className="text-gray-600 leading-relaxed">
              The Teaching Practice Management Application (TPMA) is a digital platform developed by Sule Lamido University (SLU) in collaboration with NITDA to streamline the management of teaching practice for student teachers, supervisors, and administrators. By leveraging AI assistance, automation, and real-time tracking, TPMA enhances efficiency and ensures a seamless experience for all stakeholders at SLU.
            </motion.p>
            <motion.p variants={textVariants} custom={0.4} className="text-gray-600 leading-relaxed">
              This project aims to digitize traditional teaching practice processes, providing tools for lesson plan creation, assessments, feedback, and progress tracking, all while fostering collaboration between SLU and NITDA to advance educational technology in Nigeria.
            </motion.p>
          </motion.div>
          <motion.div variants={imageVariants} initial="hidden" animate="visible" className="flex justify-center">
            <Image src="/assets/images/dash.svg" alt="Project Overview" width={500} height={500} className="object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-300" />
          </motion.div>
        </div>
      </Section>
    </Background>

    {/* Mission Statement Section */}
    <Background color="bg-white">
      <Section yPadding="py-20" className="bg-gradient-to-br from-blue-50 to-white">
        <motion.div initial="hidden" animate="visible" className="text-center max-w-3xl mx-auto space-y-4">
          <motion.h2 variants={textVariants} custom={0} className="text-3xl font-semibold text-gray-800">
            Our Mission
          </motion.h2>
          <motion.p variants={textVariants} custom={0.2} className="text-gray-600 leading-relaxed">
            At SLUK-TPMA, our mission is to empower educators and administrators by providing a cutting-edge platform that simplifies teaching practice management. We aim to enhance the quality of teacher training at Sule Lamido University through technology, ensuring that student teachers are well-prepared to excel in their careers while fostering innovation in education.
          </motion.p>
        </motion.div>
      </Section>
    </Background>

    {/* Team Gallery Section */}
    <Background color="bg-blue-50">
      <TeamGallery />
    </Background>

    {/* Footer */}
    <Footer />
  </div>
);

export default About;
























// "use client";
// import { Background } from '@/background/Background';
// import { Section } from '@/layout/Section';
// import { NavbarTwoColumns } from '@/navigation/NavbarTwoColumns';


// import { Navbar } from './Navbar';
// import { Logo } from './Logo';
// import { Footer } from './Footer';
// import { TeamGallery } from './TeamGallery';
// import Link from 'next/link';
// import Image from 'next/image';

// const About = () => (
//   <div className="text-gray-600 antialiased">
//     {/* Navbar */}
//     {/* <Background color="bg-gray-100">
//       <Section yPadding="py-6">
//       <NavbarTwoColumns logo={<Logo xl />}>
//         <li>
//           <Link href="/">Home</Link>
//         </li>
//         <li>
//           <Link href="/about">About</Link>
//         </li>
//         <li>
//           <Link href="/auth/signin">Sign In</Link>
//         </li>
//       </NavbarTwoColumns>
//       </Section>
//     </Background> */}

//     //  <Background color="bg-gray-100">
//        <Navbar />
//      </Background>



//     {/* Hero Section */}
//     <Background color="bg-white">
//       <Section yPadding="pt-20 pb-32">
//         <div className="text-center">
//           <h1 className="text-4xl sm:text-5xl font-medium text-gray-800 leading-tight tracking-tight">
//             About <span className="text-yellow-500">SLUK-</span> {/* Updated to yellow-500 */}
//             <span className="text-primary-500">TPMA</span>
//           </h1>
//           <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
//             A collaborative initiative to revolutionize teaching practice management at Sule Lamido University.
//           </p>
//         </div>
//       </Section>
//     </Background>

//     {/* Project Overview Section */}
//     <Background color="bg-primary-100">
//       <Section yPadding="py-16">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//           <div>
//             <h2 className="text-3xl font-semibold text-gray-800">
//               What is SLUK-TPMA?
//             </h2>
//             <p className="mt-4 text-gray-600 leading-relaxed">
//               The Teaching Practice Management Application (TPMA) is a digital platform developed by Sule Lamido University (SLU) in collaboration with NITDA to streamline the management of teaching practice for student teachers, supervisors, and administrators. By leveraging AI assistance, automation, and real-time tracking, TPMA enhances efficiency and ensures a seamless experience for all stakeholders at SLU.
//             </p>
//             <p className="mt-4 text-gray-600 leading-relaxed">
//               This project aims to digitize traditional teaching practice processes, providing tools for lesson plan creation, assessments, feedback, and progress tracking, all while fostering collaboration between SLU and NITDA to advance educational technology in Nigeria.
//             </p>
//           </div>
//           <div className="flex justify-center">
//             <Image
//               src="/assets/images/dash.svg"
//               alt="Project Overview"
//               width={400}
//               height={400}
//               className="object-contain"
//             />
//           </div>
//         </div>
//       </Section>
//     </Background>

//     {/* Mission Statement Section */}
//     <Background color="bg-white">
//       <Section yPadding="py-16">
//         <div className="text-center max-w-3xl mx-auto">
//           <h2 className="text-3xl font-semibold text-gray-800">
//             Our Mission
//           </h2>
//           <p className="mt-4 text-gray-600 leading-relaxed">
//             At SLUK-TPMA, our mission is to empower educators and administrators by providing a cutting-edge platform that simplifies teaching practice management. We aim to enhance the quality of teacher training at Sule Lamido University through technology, ensuring that student teachers are well-prepared to excel in their careers while fostering innovation in education.
//           </p>
//         </div>
//       </Section>
//     </Background>

//     {/* Team Gallery Section */}
//     <Background color="bg-primary-100">
//       <TeamGallery />
//     </Background>

//     {/* Footer */}
//     <Footer />
//   </div>
// );

// export default About;