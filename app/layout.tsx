import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XactScope AI",
  description: "Generate Xactimate scopes from voice notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* ADDED: dark:bg-gray-900 and dark:text-gray-100 for global dark mode */}
        <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}>
          
          {/* NAVIGATION BAR */}
          {/* ADDED: dark:bg-gray-800 and dark:border-gray-700 */}
          <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
            <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
              
              {/* Logo / Home Link */}
              {/* ADDED: dark:text-blue-400 */}
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700 dark:text-blue-400 tracking-tight hover:opacity-80 transition-opacity">
                <span>⚡ XactScope</span>
              </Link>

              {/* User Profile / Auth Controls */}
              <div className="flex items-center gap-4">
                <SignedIn>
                  {/* ADDED: dark:text-gray-300 */}
                  <Link href="/archive" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    History
                  </Link>
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </nav>

          {/* MAIN CONTENT AREA */}
          <div className="py-8">
            {children}
          </div>

        </body>
      </html>
    </ClerkProvider>
  );
}