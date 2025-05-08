"use client";
import { motion } from 'framer-motion';
import { VerticalFeatureRow } from '../feature/VerticalFeatureRow';
import { Section } from '../layout/Section';

const VerticalFeatures = () => (
  <Section
    title="Key Features of SLUK-TPMA"
    description="Empowering teaching practice management for Sule Lamido University."
  >
    <motion.div initial="hidden" animate="visible" className="space-y-12">
      <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0 } } }}>
        <VerticalFeatureRow
          title="Admin Oversight"
          description="Manage users, assign supervisors, and generate system-wide analytics with ease."
          image="/assets/images/admin-oversight.svg"
          imageAlt="Admin Oversight"
        />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } }}>
        <VerticalFeatureRow
          title="Supervisor Tools"
          description="Access trainee lesson plans, provide digital evaluations, and track progress."
          image="/assets/images/supervisor-tools.svg"
          imageAlt="Supervisor Tools"
          reverse
        />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } } }}>
        <VerticalFeatureRow
          title="Teacher-Trainee Support"
          description="Create AI-assisted lesson plans, view feedback, and track your progress."
          image="/assets/images/trainee-support.svg"
          imageAlt="Teacher-Trainee Support"
        />
      </motion.div>
    </motion.div>
  </Section>
);

export { VerticalFeatures };






// "use client";
// import { VerticalFeatureRow } from '../feature/VerticalFeatureRow';
// import { Section } from '../layout/Section';

// const VerticalFeatures = () => (
//   <Section
//     title="Our Features"
//     description="Tools to streamline school management."
//   >
//     <VerticalFeatureRow
//       title="Student Management"
//       description="Easily manage student records."
//       image="/assets/images/feature.svg"
//       imageAlt="Student feature"
//     />
//     <VerticalFeatureRow
//       title="Teacher Tools"
//       description="Support for lesson planning and grading."
//       image="/assets/images/feature2.svg"
//       imageAlt="Teacher feature"
//       reverse
//     />
//     <VerticalFeatureRow
//       title="Parent Portal"
//       description="Keep parents informed and engaged."
//       image="/assets/images/feature3.svg"
//       imageAlt="Parent feature"
//     />
//   </Section>
// );

// export { VerticalFeatures };











// import { VerticalFeatureRow } from '../feature/VerticalFeatureRow';
// import { Section } from '../layout/Section';

// const VerticalFeatures = () => (
//   <Section
//     title="Your title here"
//     description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus malesuada nisi tellus, non imperdiet nisi tempor at."
//   >
//     <VerticalFeatureRow
//       title="Your title here"
//       description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse bibendum, nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim."
//       image="/assets/images/feature.svg"
//       imageAlt="First feature alt text"
//     />
//     <VerticalFeatureRow
//       title="Your title here"
//       description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse bibendum, nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim."
//       image="/assets/images/feature2.svg"
//       imageAlt="Second feature alt text"
//       reverse
//     />
//     <VerticalFeatureRow
//       title="Your title here"
//       description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse bibendum, nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim."
//       image="/assets/images/feature3.svg"
//       imageAlt="Third feature alt text"
//     />
//   </Section>
// );

// export { VerticalFeatures };
