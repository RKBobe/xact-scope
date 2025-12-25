'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { generateDemoScope } from "@/app/actions/demo-actions"; 

// --- Types ---
interface LineItem {
  category: string;
  xactCode: string;
  description: string;
  quantity: number;
  unit: string;
}

// --- Icons ---
const IconSparkles = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function LandingPage() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LineItem[] | null>(null);

  const handleGenerate = async () => {
    if (!notes) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("rawInput", notes); 

    try {
        const response = await generateDemoScope(formData);
        if (response.success) {
            setResult(response.data); 
        } else {
            alert("Error: " + response.error);
        }
    } catch (e) {
        console.error(e);
        alert("System Error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-cyan-500 selection:text-white">
      
      {/* --- Navbar --- */}
      <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-bold tracking-tight text-white">
              Xact<span className="text-cyan-400">Scope</span>
            </span>
            <div className="flex gap-4 items-center">
              <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition">
                Log In
              </Link>
              <Link href="/dashboard" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md text-sm font-bold transition shadow-lg shadow-cyan-900/20">
                Get Started
              </Link>
            </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="pt-32 pb-16 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-6">
           <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
           <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">Now Live v1.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
           Turn Field Notes into <br className="hidden md:block"/>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Xactimate Lines.</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop manually searching for codes. Paste your rough scope notes below and let AI generate your estimate line items instantly.
        </p>

        {/* --- The Demo Interface --- */}
        <div className="relative z-10 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden grid md:grid-cols-2 text-left">
           
           {/* Input Side */}
           <div className="p-6 md:p-8 border-r border-slate-700 flex flex-col">
             <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Scope Notes</label>
                {/* FIXED LINE BELOW: Replaced " with &quot; */}
                <span className="text-xs text-slate-500">Try &quot;Master bed 12x12, paint walls...&quot;</span>
             </div>
             <textarea 
               className="w-full flex-grow min-h-[250px] p-4 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none font-mono text-sm"
               placeholder="Example: 
Living room 16x20. 
Remove and replace laminate flooring. 
Paint walls and ceiling (2 coats). 
Detach and reset baseboards..."
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
             />
             <button 
               onClick={handleGenerate}
               disabled={loading || !notes}
               className="mt-6 w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
             >
               {loading ? <span className="animate-pulse">Processing...</span> : <><IconSparkles /> Generate Line Items</>}
             </button>
           </div>

           {/* Output Side */}
           <div className="bg-slate-50 md:h-auto h-[400px] flex flex-col">
             <div className="p-3 bg-slate-200 border-b border-slate-300 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-600 uppercase">XactScope Output</span>
                 {result && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><IconCheck /> Valid JSON</span>}
             </div>
             
             <div className="overflow-y-auto flex-grow p-0">
                {!result ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <IconSparkles />
                    </div>
                    <p>AI is waiting for input...</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left text-slate-900">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 border-b">Sel</th>
                          <th className="px-4 py-3 border-b">Description</th>
                          <th className="px-4 py-3 border-b text-right">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {result.map((item, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-indigo-700 font-bold text-xs whitespace-nowrap">{item.xactCode}</td>
                            <td className="px-4 py-3 text-xs leading-snug">{item.description}</td>
                            <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-slate-600">{item.quantity} {item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* --- Value Props --- */}
      <div className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Automated Math</h3>
              <p className="text-slate-400">We calculate square footage, linear feet, and waste factors automatically based on simple dimensions.</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Smart Codes</h3>
              <p className="text-slate-400">Our engine recognizes thousands of industry terms to find the correct selector codes (RFG, DRY, PNT, etc).</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">History Archive</h3>
              <p className="text-slate-400">Create an account to save your scopes, edit them later, and export them to your team.</p>
          </div>
      </div>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} XactScope. Built for Adjusters.</p>
      </footer>
    </div>
  );
}