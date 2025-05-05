"use client";
import React from 'react';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define the props for the Link component children
type LinkChildProps = {
  href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type INavbarProps = {
  logo: ReactNode;
  children: React.ReactElement<LinkChildProps> | React.ReactElement<LinkChildProps>[];
};

const NavbarTwoColumns = (props: INavbarProps) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between max-w-6xl mx-auto">
      {props.logo}
      <nav>
        <ul className="flex space-x-5">
          {React.Children.map(props.children, (child) => {
            if (React.isValidElement<LinkChildProps>(child)) {
              const href = child.props.href || '';
              const isActive = pathname === href;
              return (
                <li>
                  {React.cloneElement(child, {
                    className: isActive
                      ? 'inline-block rounded-md text-center font-semibold text-white bg-primary-500 px-4 py-2'
                      : 'inline-block rounded-md text-center font-semibold text-primary-500 border-2 border-primary-500 hover:bg-primary-500 hover:text-white px-4 py-2 sm:px-3 sm:py-1 transition-colors',
                  })}
                </li>
              );
            }
            return child;
          })}
        </ul>
      </nav>
    </div>
  );
};

export { NavbarTwoColumns };


































// "use client";
// import React from 'react'; // Add this import
// import { ReactNode } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';

// type INavbarProps = {
//   logo: ReactNode;
//   children: ReactNode;
// };

// const NavbarTwoColumns = (props: INavbarProps) => {
//   const pathname = usePathname(); // Get the current route (e.g., "/about", "/sign-in")

//   return (
//     <div className="flex items-center justify-between max-w-6xl mx-auto">
//       {props.logo}
//       <nav>
//         <ul className="flex space-x-5">
//           {React.Children.map(props.children, (child) => {
//             if (React.isValidElement(child)) {
//               const href = child.props.href || ''; // Get the href from the Link child
//               const isActive = pathname === href; // Check if the current route matches the link's href
//               return (
//                 <li>
//                   {React.cloneElement(child, {
//                     className: isActive
//                       ? 'inline-block rounded-md text-center font-semibold text-white bg-primary-500 px-4 py-2'
//                       : 'inline-block rounded-md text-center font-semibold text-primary-500 border-2 border-primary-500 hover:bg-primary-500 hover:text-white px-4 py-2 sm:px-3 sm:py-1 transition-colors',
//                   })}
//                 </li>
//               );
//             }
//             return child;
//           })}
//         </ul>
//       </nav>
//     </div>
//   );
// };

// export { NavbarTwoColumns };