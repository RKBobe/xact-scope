import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XactScope",
  description: "AI-Powered Scope Parsing; Turn field notes into Xactimate line items seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* --- THESE TAGS WERE MISSING --- */}
      <html lang="en">
        <body className={inter.className}>
          {children}
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}