"use client";
import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';

type IBackgroundProps = {
  children: ReactNode;
  color: string;
  animate?: boolean;
};

const Background = ({ children, color, animate = false }: IBackgroundProps) => {
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial={animate ? 'hidden' : undefined}
      animate={animate ? 'visible' : undefined}
      variants={backgroundVariants}
      className={`${color} py-20`}
    >
      {children}
    </motion.div>
  );
};

export { Background };








// import type { ReactNode } from 'react';

// type IBackgroundProps = {
//   children: ReactNode;
//   color: string;
// };

// const Background = (props: IBackgroundProps) => (
//   <div className={props.color}>{props.children}</div>
// );

// export { Background };
