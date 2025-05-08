"use client";
import { ReactNode } from 'react';

type ISectionProps = {
  title?: string;
  description?: string;
  yPadding?: string;
  children: ReactNode;
  className?: string; // Add className prop
};

const Section = ({ title, description, yPadding, children, className = '' }: ISectionProps) => (
  <div
    className={`max-w-screen-lg mx-auto px-4 sm:px-6 ${
      yPadding ? yPadding : 'py-16'
    } ${className}`} // Merge className with existing classes
  >
    {(title || description) && (
      <div className="mb-12 text-center">
        {title && (
          <h2 className="text-4xl text-gray-900 font-extrabold">{title}</h2>
        )}
        {description && (
          <div className="mt-4 text-xl text-gray-600">{description}</div>
        )}
      </div>
    )}
    {children}
  </div>
);

export { Section };