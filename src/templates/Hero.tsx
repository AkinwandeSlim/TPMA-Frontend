"use client";
import Link from 'next/link';
import { Background } from '@/background/Background';
import { HeroOneButton } from '@/hero/HeroOneButton';
import { Section } from '@/layout/Section';
import { NavbarTwoColumns } from '@/navigation/NavbarTwoColumns';
import { Logo } from './Logo';

const Hero = () => (
  <Background color="bg-gray-100">
    <Section yPadding="py-6">
      <NavbarTwoColumns logo={<Logo xl />}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/auth/signin">Sign In</Link>
        </li>
      </NavbarTwoColumns>
    </Section>
    <Section yPadding="pt-20 pb-32">
      <HeroOneButton
        title={
          <>
            {'Streamline Teaching Practice with'}
            <br />
            <span className="block mt-2">
              <span className="text-yellow-500">SLUK-</span> {/* Updated to yellow-500 */}
              <span className="text-primary-500">TPMA</span>
            </span>
          </>
        }
        description="Digitize and manage teaching practice with AI assistance, automation, and real-time tracking for Sule Lamido University."
        button={
          <Link href="/auth/signin">
            <div className="inline-block rounded-md text-center font-extrabold text-xl py-4 px-6 text-white bg-primary-500 hover:bg-primary-600">
              Get Started
            </div>
          </Link>
        }
      />
    </Section>
  </Background>
);

export { Hero };















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
//           <Link href="/about">About</Link>
//         </li>
//         <li>
//           <Link href="/sign-in">Sign In</Link>
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
//               <span className="text-yellow-600">SLUK-</span>
//               <span className="text-primary-500">TPMA</span>
//             </span>
//           </>
//         }
//         description="Digitize and manage teaching practice with AI assistance, automation, and real-time tracking for Sule Lamido University."
//         button={
//           <Link href="/sign-in">
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