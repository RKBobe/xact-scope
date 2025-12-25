import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/dashboard" className="font-bold text-xl text-slate-800">
          ScopeTo<span className="text-cyan-600">X</span>
        </Link>
        
        {/* User Profile Button (Only shows when logged in) */}
        <div className="flex items-center gap-4">
           <SignedIn>
             <UserButton afterSignOutUrl="/" />
           </SignedIn>
        </div>
      </header>

      {/* Main App Content */}
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}