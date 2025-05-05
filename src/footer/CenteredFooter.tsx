"use client";

import Link from 'next/link';

type ICenteredFooterProps = {
  logo: React.ReactNode;
  children: React.ReactNode;
  iconList: React.ReactNode;
};

const CenteredFooter = (props: ICenteredFooterProps) => (
  <div className="text-center">
    {props.logo}

    <nav>
      <ul className="navbar mt-5 flex flex-row justify-center font-medium text-xl text-gray-800">
        {props.children}
      </ul>
    </nav>

    <div className="mt-8 flex justify-center gap-4">{props.iconList}</div>

    <div className="mt-8 text-sm">
      <span>&copy; 2025 SchoolLama. All rights reserved.</span>
    </div>

    <style jsx>{`
      .navbar li + li {
        @apply ml-6;
      }
    `}</style>
  </div>
);

export { CenteredFooter };

































// import type { ReactNode } from 'react';

// import { FooterCopyright } from './FooterCopyright';
// import { FooterIconList } from './FooterIconList';

// type ICenteredFooterProps = {
//   logo: ReactNode;
//   iconList: ReactNode;
//   children: ReactNode;
// };

// const CenteredFooter = (props: ICenteredFooterProps) => (
//   <div className="text-center">
//     {props.logo}

//     <nav>
//       <ul className="navbar mt-5 flex flex-row justify-center text-xl font-medium text-gray-800">
//         {props.children}
//       </ul>
//     </nav>

//     <div className="mt-8 flex justify-center">
//       <FooterIconList>{props.iconList}</FooterIconList>
//     </div>

//     <div className="mt-8 text-sm">
//       <FooterCopyright />
//     </div>

//     <style jsx>
//       {`
//         .navbar :global(li) {
//           @apply mx-4;
//         }
//       `}
//     </style>
//   </div>
// );

// export { CenteredFooter };
