"use client";
import { motion } from 'framer-motion';
import { AppConfig } from '@/utils/AppConfig';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { VerticalFeatures } from './VerticalFeatures';
import { TeamGallery } from './TeamGallery';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { Background } from '@/background/Background';

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const Base = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="text-gray-900 antialiased bg-white font-sans"
  >
    <Navbar />
    <Hero />
    <VerticalFeatures />
    <Background color="bg-blue-50" >
      <TeamGallery />
    </Background>
    <Banner />
    <Footer />
  </motion.div>
);

export { Base };





































// "use client";
// import { AppConfig } from '@/utils/AppConfig';
// import { Background } from '@/background/Background'; // Import Background
// import { Banner } from './Banner';
// import { Footer } from './Footer';
// import { Hero } from './Hero';
// import { VerticalFeatures } from './VerticalFeatures';
// import { TeamGallery } from './TeamGallery';

// const Base = () => (
//   <div className="text-gray-600 antialiased">
//     <Hero />
//     <VerticalFeatures />
//     <Background color="bg-primary-100">
//       <TeamGallery />
//     </Background>
//     <Banner />
//     <Footer />
//   </div>
// );

// export { Base };



































































// "use client";
// import { Meta } from '@/layout/Meta';
// import { AppConfig } from '@/utils/AppConfig';
// import { Banner } from './Banner';
// import { Footer } from './Footer';
// import { Hero } from './Hero';
// import { VerticalFeatures } from './VerticalFeatures';

// const Base = () => (
//   <div className="text-gray-600 antialiased">
//     <Meta
//       title="SLUK-TPMA School Management"
//       description="A platform for managing Trainee-Teachers and supervisors."
//     />
//     <Hero />
//     <VerticalFeatures />
//     <Banner />
//     <Footer />
//   </div>
// );

// export { Base };