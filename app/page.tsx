import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { deleteScope } from "./actions"; // Import the delete action
import CopyButton from "@/components/CopyButton";
import ScopeForm from "@/components/ScopeForm";

export default async function Home() {
  const { userId } = await auth();

  // Fetch recent scopes
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
    take: 10,
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Scope-to-Xactimate</h1>
        <p className="text-gray-600">Dictate or type your damage notes below. AI will generate the Xactimate line items.</p>
      </div>

      {/* SPEECH & TEXT FORM */}
      <ScopeForm />

      {/* RECENT SCOPES LIST */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Scopes</h3>
        
        {scopes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No scopes yet. Generate your first one above!</p>
        ) : (
          <div className="space-y-6">
            {scopes.map((scope) => (
              <div key={scope.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                
                {/* SCOPE CARD HEADER */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{new Date(scope.createdAt).toLocaleDateString()}</p>
                    <p className="font-medium text-gray-900 truncate max-w-md">&quot;{scope.rawInput.substring(0, 50)}...&quot;</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${scope.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        scope.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {scope.status}
                    </span>

                    {/* Copy Button */}
                    {scope.status === 'COMPLETED' && scope.lineItems.length > 0 && (
                      <CopyButton items={scope.lineItems} />
                    )}

                    {/* DELETE BUTTON */}
                    <form action={deleteScope}>
                      <input type="hidden" name="scopeId" value={scope.id} />
                      <button 
                        type="submit"
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Scope"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>

                {/* ESTIMATE TABLE */}
                {scope.lineItems.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 w-1/6">Category</th>
                          <th className="px-4 py-3 w-1/6">Code</th>
                          <th className="px-4 py-3 w-1/3">Description</th>
                          <th className="px-4 py-3 text-right w-1/6">Qty</th>
                          <th className="px-4 py-3 w-1/6">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {scope.lineItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700">{item.category}</td>
                            <td className="px-4 py-3 font-mono text-blue-600 font-semibold">{item.xactCode}</td>
                            <td className="px-4 py-3 text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-right font-medium">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}