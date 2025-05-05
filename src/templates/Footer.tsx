"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Background } from '@/background/Background';
import { Section } from '@/layout/Section';
import { AppConfig } from '@/utils/AppConfig';

const Footer = () => (
  <Background color="bg-gray-100">
    <Section>
      <footer className="text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <Link href="/">
            <span className="text-gray-600 hover:text-gray-800">Home</span>
          </Link>
          <Link href="/about">
            <span className="text-gray-600 hover:text-gray-800">About</span>
          </Link>
          <Link href="/auth/signin">
            <span className="text-gray-600 hover:text-gray-800">Sign In</span>
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <span className="text-gray-600">
            © {new Date().getFullYear()} {AppConfig.site_name}. A collaboration between
          </span>
          <Link href="https://slu.edu.ng">
            <Image
              src="/assets/images/slu-logo.svg"
              alt="Sule Lamido University"
              width={60}
              height={60}
            />
          </Link>
          <span className="text-gray-600">and</span>
          <Link href="https://nitda.gov.ng">
            <Image
              src="/assets/images/nitda-logo.svg"
              alt="NITDA"
              width={60}
              height={24}
            />
          </Link>
        </div>
      </footer>
    </Section>
  </Background>
);

export { Footer };