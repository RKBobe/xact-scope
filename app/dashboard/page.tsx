import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ScopeForm from "@/components/ScopeForm";
import ScopeCard from "@/components/ScopeCard";
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
    take: 5,
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* HEADER */}
      <div className="mb-2">
        {/* Added dark:text-white so it turns white in dark mode */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">New Scope</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Dictate damage to generate line items.</p>
      </div>

      {/* INPUT FORM */}
      <ScopeForm />

      {/* RECENT SCOPES LIST */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          {/* Added dark:text-white */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Scopes</h3>
          <Link href="/archive" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800">
            View All History &rarr;
          </Link>
        </div>
        
        {scopes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No scopes yet. Generate your first one above!</p>
        ) : (
          <div className="space-y-6">
            {scopes.map((scope) => (
              <ScopeCard key={scope.id} scope={scope} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}