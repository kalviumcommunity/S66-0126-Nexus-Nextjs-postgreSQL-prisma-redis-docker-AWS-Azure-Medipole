import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medipole - Connect. Donate. Save Lives.",
  description:
    "Medipole connects blood donors with hospitals and blood banks in real-time. Find nearby donation centers, respond to emergencies, and track your impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
