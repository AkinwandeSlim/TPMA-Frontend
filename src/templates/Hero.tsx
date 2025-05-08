"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Section } from '@/layout/Section';

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

const Hero = () => (
  <Section className="min-h-[calc(80vh+100px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-200 py-20 overflow-hidden animate-gradient">
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 items-center">
      <motion.div className="text-center lg:text-left space-y-6 font-sans" initial="hidden" animate="visible">
        <motion.h1 variants={textVariants} custom={0} className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-900 leading-snug tracking-normal">
          Streamline Teaching with
        </motion.h1>
        <motion.div variants={textVariants} custom={0.2} className="flex justify-center lg:justify-start space-x-2">
          <span className="text-4xl sm:text-5xl lg:text-5xl font-bold text-yellow-500">SLUK-</span>
          <span className="text-4xl sm:text-5xl lg:text-5xl font-bold text-blue-600">TPMA</span>
        </motion.div>
        <motion.p variants={textVariants} custom={0.4} className="text-xl sm:text-xl text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
          Transform teaching with AI-powered tools, automation, and real-time insights for Sule Lamido University.
        </motion.p>
        <motion.div variants={textVariants} custom={0.6} className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/auth/signin" className="bg-gradient-to-r from-blue-500 to-blue-200 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-blue-300 transition-transform hover:scale-105 focus:ring-4 focus:ring-blue-300 shadow-md" aria-label="Get started with SLUK-TPMA">
            Get Started
          </Link>
          <Link href="/about" className="bg-white text-blue-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-50 transition-transform hover:scale-105 focus:ring-4 focus:ring-blue-300 border border-blue-500 shadow-sm" aria-label="Learn more about SLUK-TPMA">
            Learn More
          </Link>
        </motion.div>
      </motion.div>
      <motion.div variants={imageVariants} initial="hidden" animate="visible" className="relative flex justify-center">
        <Image src="/assets/images/dashboard-illustrations.jpg" alt="SLUK-TPMA Digital Teaching Dashboard" width={800} height={600} className="drop-shadow-2xl transform hover:scale-105 transition-transform duration-300" priority />
        <div className="absolute inset-0 -z-10 bg-blue-200/20 blur-3xl rounded-full scale-110" />
      </motion.div>
    </div>
  </Section>
);

export { Hero };

































// "use client";
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import Image from 'next/image';
// import { Section } from '@/layout/Section';

// const Hero = () => (
//   <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-primary-200 py-16">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//       <div>
//         <motion.h1
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight"
//         >
//           Streamline Teaching Practice with
//         </motion.h1>
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.4, delay: 0.2 }}
//           className="mt-2"
//         >
//           <span className="text-4xl sm:text-6xl font-extrabold text-yellow-500">SLUK-</span>
//           <span className="text-4xl sm:text-6xl font-extrabold text-primary-500">TPMA</span>
//         </motion.div>
//         <motion.p
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4, delay: 0.4 }}
//           className="mt-6 text-lg sm:text-xl text-gray-600 max-w-lg"
//         >
//           Transform teaching practice with AI-powered tools, automation, and real-time insights for Sule Lamido University.
//         </motion.p>
//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4, delay: 0.6 }}
//           className="mt-8 flex space-x-4"
//         >
//           <Link
//             href="/auth/signin"
//             className="bg-gradient-to-r from-primary-500 to-yellow-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:from-primary-600 hover:to-yellow-600 transition-transform transform hover:scale-105 focus:ring-2 focus:ring-primary-500"
//             aria-label="Get started with SLUK-TPMA"
//           >
//             Get Started
//           </Link>
//           <Link
//             href="/about"
//             className="bg-white text-primary-500 px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-transform transform hover:scale-105 focus:ring-2 focus:ring-primary-500 border border-primary-500"
//             aria-label="Learn more about SLUK-TPMA"
//           >
//             Learn More
//           </Link>
//         </motion.div>
//       </div>
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
//         className="relative"
//       >
//         <Image
//           src="/assets/images/classroom.jpg"
//           alt="SLUK-TPMA Digital Classroom"
//           width={600}
//           height={600}
//           className="mx-auto drop-shadow-xl"
//           priority
//         />
//       </motion.div>
//     </div>
//   </Section>
// );

// export { Hero };























// "use client";
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import Image from 'next/image';
// import { Background } from '@/background/Background';
// import { Section } from '@/layout/Section';
// import { Navbar } from './Navbar';

// const Hero = () => (
//   <Background color="bg-gradient-to-r from-white to-primary-100">
//     <Navbar />
//     <Section yPadding="pt-20 pb-32">
//       <motion.div
//         initial={{ opacity: 0, y: 100, scale: 0.95 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.4 }}
//         className="text-center max-w-3xl mx-auto"
//       >
//         <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 leading-tight">
//           Streamline Teaching Practice with{' '}
//           <span className="text-yellow-500">SLUK-</span>
//           <span className="text-primary-500">TPMA</span>
//         </h1>
//         <p className="mt-4 text-base sm:text-lg text-gray-600">
//           Digitize and manage teaching practice with AI assistance, automation, and real-time tracking for Sule Lamido University.
//         </p>
//         <Link
//           href="/auth/signin"
//           className="mt-6 inline-block bg-primary-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary-600 transition-transform transform hover:scale-105 focus:ring-2 focus:ring-primary-500"
//           aria-label="Get started with SLUK-TPMA"
//         >
//           Get Started
//         </Link>
//       </motion.div>
//       <motion.div
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.6 }}
//         className="mt-12"
//       >
//         <Image
//           src="/assets/images/hero-illustration.svg"
//           alt="SLUK-TPMA Illustration"
//           width={600}
//           height={400}
//           className="mx-auto"
//           priority
//         />
//       </motion.div>
//     </Section>
//   </Background>
// );

// export { Hero };
































// "use client";
// import Link from 'next/link';
// import { Background } from '@/background/Background';
// import { HeroOneButton } from '@/hero/HeroOneButton';
// import { Section } from '@/layout/Section';
// import { NavbarTwoColumns } from '@/navigation/NavbarTwoColumns';
// import { Logo } from './Logo';

// const Hero = () => (
//   <Background color="bg-gray-100">
//     <Section yPadding="py-6">
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
//     </Section>
//     <Section yPadding="pt-20 pb-32">
//       <HeroOneButton
//         title={
//           <>
//             {'Streamline Teaching Practice with'}
//             <br />
//             <span className="block mt-2">
//               <span className="text-yellow-500">SLUK-</span> {/* Updated to yellow-500 */}
//               <span className="text-primary-500">TPMA</span>
//             </span>
//           </>
//         }
//         description="Digitize and manage teaching practice with AI assistance, automation, and real-time tracking for Sule Lamido University."
//         button={
//           <Link href="/auth/signin">
//             <div className="inline-block rounded-md text-center font-extrabold text-xl py-4 px-6 text-white bg-primary-500 hover:bg-primary-600">
//               Get Started
//             </div>
//           </Link>
//         }
//       />
//     </Section>
//   </Background>
// );

// export { Hero };















// // "use client";
// // import Link from 'next/link';
// // import { Background } from '@/background/Background';
// // import { HeroOneButton } from '@/hero/HeroOneButton';
// // import { Section } from '@/layout/Section';
// // import { NavbarTwoColumns } from '@/navigation/NavbarTwoColumns';
// // import { Logo } from './Logo';

// // const Hero = () => (
// //   <Background color="bg-gray-100">
// //     <Section yPadding="py-6">
// //       <NavbarTwoColumns logo={<Logo xl />}>
// //         <li>
// //           <Link href="/about">About</Link>
// //         </li>
// //         <li>
// //           <Link href="/sign-in">Sign In</Link>
// //         </li>
// //       </NavbarTwoColumns>
// //     </Section>
// //     <Section yPadding="pt-20 pb-32">
// //       <HeroOneButton
// //         title={
// //           <>
// //             {'Streamline Teaching Practice with'}
// //             <br />
// //             <span className="block mt-2">
// //               <span className="text-yellow-600">SLUK-</span>
// //               <span className="text-primary-500">TPMA</span>
// //             </span>
// //           </>
// //         }
// //         description="Digitize and manage teaching practice with AI assistance, automation, and real-time tracking for Sule Lamido University."
// //         button={
// //           <Link href="/sign-in">
// //             <div className="inline-block rounded-md text-center font-extrabold text-xl py-4 px-6 text-white bg-primary-500 hover:bg-primary-600">
// //               Get Started
// //             </div>
// //           </Link>
// //         }
// //       />
// //     </Section>
// //   </Background>
// // );

// // export { Hero };