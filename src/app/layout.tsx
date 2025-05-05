import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import { NotificationProvider } from "@/context/NotificationContext";


const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: "Teaching Practice Management Dashboard",
  description: "Next.js Teaching Practice Management Dashboard System",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        
            <NotificationProvider>
                      {children}
            </NotificationProvider>


        <ToastContainer position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}



