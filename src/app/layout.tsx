import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medipole - Blood Donation Platform",
  description: "Real-time blood donation and inventory management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="flex gap-4 p-4 bg-gray-100 border-b border-gray-300">
          <Link href="/" className="font-semibold text-blue-600 hover:underline">
            Home
          </Link>
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
          <Link href="/users" className="text-blue-600 hover:underline">
            Users
          </Link>
          <Link href="/users/1" className="text-blue-600 hover:underline">
            User 1
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
