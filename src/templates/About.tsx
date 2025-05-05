"use client";
import { Background } from '@/background/Background';
import { Section } from '@/layout/Section';
import { NavbarTwoColumns } from '@/navigation/NavbarTwoColumns';
import { Logo } from './Logo';
import { Footer } from './Footer';
import { TeamGallery } from './TeamGallery';
import Link from 'next/link';
import Image from 'next/image';

const About = () => (
  <div className="text-gray-600 antialiased">
    {/* Navbar */}
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
    </Background>

    {/* Hero Section */}
    <Background color="bg-white">
      <Section yPadding="pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-medium text-gray-800 leading-tight tracking-tight">
            About <span className="text-yellow-500">SLUK-</span> {/* Updated to yellow-500 */}
            <span className="text-primary-500">TPMA</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            A collaborative initiative to revolutionize teaching practice management at Sule Lamido University.
          </p>
        </div>
      </Section>
    </Background>

    {/* Project Overview Section */}
    <Background color="bg-primary-100">
      <Section yPadding="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">
              What is SLUK-TPMA?
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              The Teaching Practice Management Application (TPMA) is a digital platform developed by Sule Lamido University (SLU) in collaboration with NITDA to streamline the management of teaching practice for student teachers, supervisors, and administrators. By leveraging AI assistance, automation, and real-time tracking, TPMA enhances efficiency and ensures a seamless experience for all stakeholders at SLU.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              This project aims to digitize traditional teaching practice processes, providing tools for lesson plan creation, assessments, feedback, and progress tracking, all while fostering collaboration between SLU and NITDA to advance educational technology in Nigeria.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="/assets/images/dash.svg"
              alt="Project Overview"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </Section>
    </Background>

    {/* Mission Statement Section */}
    <Background color="bg-white">
      <Section yPadding="py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800">
            Our Mission
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            At SLUK-TPMA, our mission is to empower educators and administrators by providing a cutting-edge platform that simplifies teaching practice management. We aim to enhance the quality of teacher training at Sule Lamido University through technology, ensuring that student teachers are well-prepared to excel in their careers while fostering innovation in education.
          </p>
        </div>
      </Section>
    </Background>

    {/* Team Gallery Section */}
    <Background color="bg-primary-100">
      <TeamGallery />
    </Background>

    {/* Footer */}
    <Footer />
  </div>
);

export default About;