import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ScopeForm from "@/components/ScopeForm";
import ScopeCard from "@/components/ScopeCard"; // This imports your new component
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  // Fetch ONLY the recent 5 scopes
  const scopes = await prisma.scope.findMany({
    where: {
      userClerkId: userId as string,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      lineItems: true,
    },
    take: 5, // Limit to 5 so the dashboard stays fast
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Scope-to-Xactimate</h1>
        <p className="text-gray-600">Dictate or type your damage notes below.</p>
      </div>

      {/* INPUT FORM */}
      <ScopeForm />

      {/* RECENT SCOPES LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Recent Scopes</h3>
          <Link href="/archive" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            View All History &rarr;
          </Link>
        </div>
        
        {scopes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No scopes yet. Generate your first one above!</p>
        ) : (
          <div className="space-y-6">
            {scopes.map((scope) => (
              // This single line replaces 60+ lines of code!
              <ScopeCard key={scope.id} scope={scope} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}