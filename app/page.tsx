import { prisma } from '@/lib/prisma'
// We use the @ alias to be safe, assuming actions.ts is in app/
import { generateScope } from '@/app/actions'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const scopes = await prisma.scope.findMany({
    where: { userClerkId: userId },
    include: { lineItems: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Scope-to-Xactimate</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">New Assessment</h2>
          <form action={generateScope} className="space-y-4">
            <div>
              <label htmlFor="rawInput" className="block text-sm font-medium text-gray-700 mb-1">
                Field Notes / Damage Description
              </label>
              <textarea
                name="rawInput"
                id="rawInput"
                rows={4}
                // UPDATED: Added 'text-gray-900' so the text is black
                className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. Master bedroom 12x14. Water damage to ceiling..."
                required
              />  

            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Estimate
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Scopes</h2>
          
          {scopes.length === 0 ? (
            <p className="text-gray-500 italic">No scopes generated yet.</p>
          ) : (
            scopes.map((scope) => (
              <div key={scope.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{new Date(scope.createdAt).toLocaleDateString()}</p>
                    {/* FIXED: Replaced " with &quot; */}
                    <p className="font-medium text-gray-900 truncate max-w-md">&quot;{scope.rawInput.substring(0, 50)}...&quot;</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${scope.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      scope.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {scope.status}
                  </span>
                </div>

                {scope.lineItems.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">Code</th>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3 text-right">Qty</th>
                          <th className="px-6 py-3">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {scope.lineItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-500">{item.category}</td>
                            <td className="px-6 py-3 font-mono text-blue-600">{item.xactCode}</td>
                            <td className="px-6 py-3 text-gray-900">{item.description}</td>
                            <td className="px-6 py-3 text-right font-medium">{item.quantity}</td>
                            <td className="px-6 py-3 text-gray-500">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}