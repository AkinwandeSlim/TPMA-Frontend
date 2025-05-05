"use client";
import { AppConfig } from '@/utils/AppConfig';
import { Background } from '@/background/Background'; // Import Background
import { Banner } from './Banner';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { VerticalFeatures } from './VerticalFeatures';
import { TeamGallery } from './TeamGallery';

const Base = () => (
  <div className="text-gray-600 antialiased">
    <Hero />
    <VerticalFeatures />
    <Background color="bg-primary-100">
      <TeamGallery />
    </Background>
    <Banner />
    <Footer />
  </div>
);

export { Base };



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