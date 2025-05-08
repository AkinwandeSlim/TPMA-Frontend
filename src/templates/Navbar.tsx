"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <motion.nav
      initial={{ y: -100, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm py-4 rounded-b-lg"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Logo xl />
          <div className="hidden sm:flex space-x-6 items-center">
            <Link
              href="/"
              className="text-gray-800 hover:text-blue-500 focus:ring-2 focus:ring-blue-300 transition-colors transform hover:scale-105 aria-current:text-blue-500 aria-current:font-semibold"
              aria-current={typeof window !== 'undefined' && window.location.pathname === '/' ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-800 hover:text-blue-500 focus:ring-2 focus:ring-blue-300 transition-colors transform hover:scale-105 aria-current:text-blue-500 aria-current:font-semibold"
              aria-current={typeof window !== 'undefined' && window.location.pathname === '/about' ? 'page' : undefined}
            >
              About
            </Link>
            <Link
              href="/auth/signin"
              className="text-white bg-gradient-to-r from-blue-500 to-blue-200 hover:from-blue-600 hover:to-blue-300 px-4 py-2 rounded-full transition-transform transform hover:scale-105 focus:ring-2 focus:ring-blue-300 shadow-sm"
            >
              Sign In
            </Link>
          </div>
          <button
            className="sm:hidden text-gray-800 focus:ring-2 focus:ring-blue-300"
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden mt-4 bg-white/90 backdrop-blur-md rounded-lg p-4"
          >
            <ul className="flex flex-col space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-gray-800 hover:text-blue-500 transition-colors"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-800 hover:text-blue-500 transition-colors"
                  onClick={toggleMenu}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signin"
                  className="text-white bg-gradient-to-r from-blue-500 to-blue-200 hover:from-blue-600 hover:to-blue-300 px-4 py-2 rounded-full inline-block"
                  onClick={toggleMenu}
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export { Navbar };












































// "use client";
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { Logo } from './Logo';

// const Navbar = () => (
//   <motion.nav
//     initial={{ y: -150, opacity: 0 }}
//     animate={{ y: 0, opacity: 1 }}
//     transition={{ duration: 0.3 }}
//     className="sticky top-0 z-50 bg-white shadow-md py-4"
//     aria-label="Main navigation"
//   >
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="flex justify-between items-center">
//         <Logo xl />
//         <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
//           <li>
//             <Link
//               href="/"
//               className="text-gray-600 hover:text-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors aria-current:underline"
//               aria-current={typeof window !== 'undefined' && window.location.pathname === '/' ? 'page' : undefined}
//             >
//               Home
//             </Link>
//           </li>
//           <li>
//             <Link
//               href="/about"
//               className="text-gray-600 hover:text-primary-500 focus:ring-2 focus:ring-primary-500 transition-colors aria-current:underline"
//               aria-current={typeof window !== 'undefined' && window.location.pathname === '/about' ? 'page' : undefined}
//             >
//               About
//             </Link>
//           </li>
//           <li>
//             <Link
//               href="/auth/signin"
//               className="text-white bg-primary-500 hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 px-4 py-2 rounded-md transition-colors"
//             >
//               Sign In
//             </Link>
//           </li>
//         </ul>
//       </div>
//     </div>
//   </motion.nav>
// );

// export { Navbar };