import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Query Performance Advisor",
  description: "Self-healing database query performance advisor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
