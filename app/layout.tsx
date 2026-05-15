import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalorieApp",
  description: "Track calories and get AI-powered meal plans",
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
