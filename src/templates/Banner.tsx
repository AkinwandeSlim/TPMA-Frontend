"use client";
import Link from 'next/link';
import { Background } from '@/background/Background';
import { Section } from '@/layout/Section';

const Banner = () => (
  <Background color="bg-gray-100">
    <Section>
      <div className="bg-primary-100 p-8 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Ready to Transform Teaching Practice at Sule Lamido University?
          </h2>
          <p className="text-primary-500 mt-2">log in to get started.</p>
        </div>
        <Link href="/auth/signin">
          <div className="inline-block rounded-md text-center text-lg font-semibold py-2 px-4 text-white bg-primary-500 hover:bg-primary-600">
            Get Started
          </div>
        </Link>
      </div>
    </Section>
  </Background>
);

export { Banner };

















// "use client";
// import Link from 'next/link';
// import { Background } from '@/background/Background';
// import { Section } from '@/layout/Section';

// const Banner = () => (
//   <Background color="bg-gray-100">
//     <Section>
//       <div className="bg-primary-100 p-8 rounded-lg flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-900">
//             Lorem ipsum dolor sit amet consectetur adipiscing elit.
//           </h2>
//           <p className="text-primary-500 mt-2">Start your Free Trial.</p>
//         </div>
//         <Link href="/sign-in">
//           <div className="inline-block rounded-md text-center text-lg font-semibold py-2 px-4 text-white bg-primary-500 hover:bg-primary-600">
//             Get Started
//           </div>
//         </Link>
//       </div>
//     </Section>
//   </Background>
// );

// export { Banner };





// "use client"
// import Link from 'next/link';

// import { Button } from '../button/Button';
// import { CTABanner } from '../cta/CTABanner';
// import { Section } from '../layout/Section';

// const Banner = () => (
//   <Section>
//     <CTABanner
//       title="Lorem ipsum dolor sit amet consectetur adipisicing elit."
//       subtitle="Start your Free Trial."
//       button={
//         <Link href="https://creativedesignsguru.com/category/nextjs/">
//           <Button>Get Started</Button>
//         </Link>
//       }
//     />
//   </Section>
// );

// export { Banner };
