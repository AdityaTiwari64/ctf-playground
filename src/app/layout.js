import "./globals.css";
import Navbar from '@/components/Navbar'

import { AuthProvider } from '@/context/AuthContext'

export const metadata = {
  title: "CTF Playground",
  description: "CTF playground by Null VIT Bhopal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
        <AuthProvider>
        <Navbar />
        <main className="max-h-[90vh] max-w-screen relative sm:top-[79px] top-15 ">
          {children}
        </main>
        </AuthProvider>
      </body>
    </html>
  );
}
