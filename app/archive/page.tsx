import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ScopeCard from "@/components/ScopeCard";
import Link from "next/link";

export default async function ArchivePage() {
  const { userId } = await auth();

  // Fetch ALL scopes, not just recent ones
  const scopes = await prisma.scope.findMany({
    where: { userClerkId: userId as string },
    orderBy: { createdAt: 'desc' },
    include: { lineItems: true },
    // No 'take' limit, or set it high (e.g., 50)
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Archive</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        {scopes.length === 0 ? (
          <p className="text-gray-500">No archived scopes found.</p>
        ) : (
          scopes.map((scope) => (
            <ScopeCard key={scope.id} scope={scope} />
          ))
        )}
      </div>
    </main>
  );
}