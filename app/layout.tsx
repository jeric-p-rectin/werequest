import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import Providers from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'WeRequest',
  description: 'Barangay San Andres Resident Management System',
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>WeRequest</title>
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}