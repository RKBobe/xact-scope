import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

// FIX 1: Update the type to expect a Promise
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ScopeDetailPage({ params }: PageProps) {
  // FIX 2: Await the params before using them
  const { id } = await params;
  
  const { userId } = await auth();
  
  if (!userId) redirect("/");

  // Fetch the scope using the awaited 'id'
  const scope = await prisma.scope.findUnique({
    where: {
      id: id, 
    },
    include: {
      lineItems: true,
    },
  });

  // Security Check: If scope doesn't exist or belongs to someone else
  if (!scope || scope.userClerkId !== userId) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-cyan-600 mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {scope.address || "Untitled Project"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Created on {new Date(scope.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 text-sm font-medium">
                Edit Notes
            </button>
            <button className="bg-cyan-600 text-white px-4 py-2 rounded shadow-sm hover:bg-cyan-500 text-sm font-medium">
                Export PDF
            </button>
        </div>
      </div>

      {/* Original Notes Section */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Original Field Notes</h3>
        <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm">
            {scope.rawInput}
        </p>
      </div>

      {/* The Line Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Estimate Items</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                {scope.lineItems.length} Items
            </span>
        </div>
        
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 w-24">Cat</th>
                    <th className="px-6 py-3 w-24">Sel</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 w-16">Unit</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {scope.lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-gray-500">{item.category || "-"}</td>
                        <td className="px-6 py-4 font-bold text-cyan-700 font-mono">{item.xactCode || "?"}</td>
                        <td className="px-6 py-4 text-gray-800">{item.description}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-gray-500">{item.unit || "-"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {scope.lineItems.length === 0 && (
            <div className="p-8 text-center text-gray-400">
                No items found. The AI might have failed to parse the notes.
            </div>
        )}
      </div>
    </div>
  );
}