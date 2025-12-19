
"use client";
import { useState } from "react";

// Define what a "Scope Item" looks like so TypeScript is happy
interface ScopeItem {
  CAT: string;
  SEL: string;
  ACT: string;
  QTY: number;
  UNIT: string;
  DESC: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<ScopeItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function processScope() {
    if (!input) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/parse-scope", {
        method: "POST",
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      alert("Error processing scope");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    // 1. Create the header row
    const headers = "CAT\tSEL\tQTY\tDESC\tUNIT\tACT";
    
    // 2. Format each item row with Tab (\t) separators
    const rows = items.map(i => 
      `${i.CAT}\t${i.SEL}\t${i.QTY}\t${i.DESC}\t${i.UNIT}\t${i.ACT}`
    ).join("\n");
    
    // 3. Combine them
    const tsv = `${headers}\n${rows}`;
    
    // 4. Copy to clipboard using the modern API
    navigator.clipboard.writeText(tsv).then(() => {
      alert("✅ Copied! \n\nGo to Xactimate -> Click the first empty cell -> Press Ctrl+V");
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert("❌ Failed to copy. Please manually select the table.");
    });
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto bg-gray-50 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Roof Runner 🏃‍♂️</h1>
      
      <textarea
        className="w-full p-4 border rounded-lg h-32 mb-4 text-gray-900"
        placeholder="Type here (e.g., '30 square lam roof, 4 turtles...')"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      
      <button 
        onClick={processScope}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mb-8"
      >
        {loading ? "Processing..." : "Generate Xactimate Codes"}
      </button>

      {items.length > 0 && (
        <div className="bg-white shadow rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Results</h2>
            <button 
              onClick={copyToClipboard}
              className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
            >
              Copy Table
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-2">CAT</th>
                  <th className="px-4 py-2">SEL</th>
                  <th className="px-4 py-2">QTY</th>
                  <th className="px-4 py-2">DESC</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{item.CAT}</td>
                    <td className="px-4 py-2 font-mono">{item.SEL}</td>
                    <td className="px-4 py-2 font-bold">{item.QTY}</td>
                    <td className="px-4 py-2">{item.DESC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}