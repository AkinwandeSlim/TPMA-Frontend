"use client";
import { ReactNode } from 'react';

type IHeroOneButtonProps = {
  title: ReactNode;
  description: string;
  button: ReactNode;
};

const HeroOneButton = (props: IHeroOneButtonProps) => (
  <div className="text-center animate-fade-in">
    <h1 className="text-4xl sm:text-5xl font-semibold text-gray-800 leading-tight tracking-tight ">
      {props.title}
    </h1>
    <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
      {props.description}
    </p>
    <div className="mt-6">
      {props.button}
    </div>
  </div>
);

export { HeroOneButton };
{/*<h1 className="text-4xl sm:text-5xl font-semibold text-gray-800 leading-tight tracking-tight">*/}

// "use client"
// import type { ReactNode } from 'react';

// type IHeroOneButtonProps = {
//   title: ReactNode;
//   description: string;
//   button: ReactNode;
// };

// const HeroOneButton = (props: IHeroOneButtonProps) => (
//   <header className="text-center">
//     <h1 className="whitespace-pre-line text-5xl font-bold leading-hero text-gray-900">
//       {props.title}
//     </h1>
//     <div className="mb-16 mt-4 text-2xl">{props.description}</div>

//     {props.button}
//   </header>
// );

// export { HeroOneButton };
