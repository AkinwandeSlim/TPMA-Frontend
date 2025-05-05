"use client";
import className from 'classnames';
import Link from 'next/link';

type IButtonProps = {
  xl?: boolean;
  children: string;
  href?: string;
};

const Button = (props: IButtonProps) => {
  const btnClass = className({
    btn: true,
    'btn-xl': props.xl,
    'btn-base': !props.xl,
    'btn-primary': true,
  });

  const content = (
    <div className={btnClass}>
      {props.children}
      <style jsx>{`
        .btn {
          @apply inline-block rounded-md text-center;
        }
        .btn-base {
          @apply text-lg font-semibold py-2 px-4;
        }
        .btn-xl {
          @apply font-extrabold text-xl py-4 px-6;
        }
        .btn-primary {
          @apply text-white bg-primary-500;
        }
        .btn-primary:hover {
          @apply bg-primary-600;
        }
      `}</style>
    </div>
  );

  return props.href ? <Link href={props.href}>{content}</Link> : content;
};

export { Button };











// "use client";

// import className from 'classnames';
// import Link from 'next/link';

// type IButtonProps = {
//   xl?: boolean;
//   children: string;
//   href?: string;
// };

// const Button = (props: IButtonProps) => {
//   const btnClass = className({
//     btn: true,
//     'btn-xl': props.xl,
//     'btn-base': !props.xl,
//     'btn-primary': true,
//   });

//   return (
//     <>
//       {props.href ? (
//         <Link href={props.href} className={btnClass}>
//           {props.children}
//         </Link>
//       ) : (
//         <button className={btnClass}>{props.children}</button>
//       )}

//       <style jsx>{`
//         .btn {
//           @apply inline-block rounded-md text-center;
//         }

//         .btn-base {
//           @apply px-4 py-3 text-base font-medium md:px-6 md:py-4;
//         }

//         .btn-xl {
//           @apply px-6 py-3 text-xl font-medium md:px-8 md:py-5;
//         }

//         .btn-primary {
//           @apply bg-primary-500 text-white hover:bg-gray-900;
//         }
//       `}</style>
//     </>
//   );
// };

// export { Button };














// import className from 'classnames';

// type IButtonProps = {
//   xl?: boolean;
//   children: string;
// };

// const Button = (props: IButtonProps) => {
//   const btnClass = className({
//     btn: true,
//     'btn-xl': props.xl,
//     'btn-base': !props.xl,
//     'btn-primary': true,
//   });

//   return (
//     <div className={btnClass}>
//       {props.children}

//       <style jsx>
//         {`
//           .btn {
//             @apply inline-block rounded-md text-center;
//           }

//           .btn-base {
//             @apply text-lg font-semibold py-2 px-4;
//           }

//           .btn-xl {
//             @apply font-extrabold text-xl py-4 px-6;
//           }

//           .btn-primary {
//             @apply text-white bg-primary-500;
//           }

//           .btn-primary:hover {
//             @apply bg-primary-600;
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export { Button };
