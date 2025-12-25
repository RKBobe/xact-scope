'use client'

import { useState } from "react"
import { deleteScope } from "@/app/actions/user-actions" 
import Link from "next/link"

// --- FIX: Allow nulls to match your Database Schema ---
interface LineItem {
  id: string
  category: string | null  // Changed from string to string | null
  xactCode: string | null  // Changed from string to string | null
  description: string
  quantity: number
  unit: string | null      // Changed from string to string | null
}

interface ScopeCardProps {
  scope: {
    id: string
    address: string | null
    description?: string 
    createdAt: Date
    lineItems: LineItem[]
  }
}

export default function ScopeCard({ scope }: ScopeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate totals for a quick preview
  const itemCount = scope.lineItems ? scope.lineItems.length : 0;
  
  const previewText = scope.lineItems 
    ? scope.lineItems.slice(0, 3).map(i => i.description).join(", ") + (itemCount > 3 ? "..." : "")
    : "No items generated.";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scope?")) return
    setIsDeleting(true)
    
    try {
      const formData = new FormData()
      formData.append("id", scope.id)
      
      await deleteScope(formData)
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Failed to delete")
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 relative group">
      
      {/* Top Row: Address & Date */}
      <div className="flex justify-between items-start mb-2">
        <div>
           <h3 className="font-bold text-lg text-slate-900">
             {scope.address || "Untitled Scope"}
           </h3>
           <p className="text-xs text-slate-400">
             {new Date(scope.createdAt).toLocaleDateString()} at {new Date(scope.createdAt).toLocaleTimeString()}
           </p>
        </div>
        <span className="bg-cyan-50 text-cyan-700 text-xs font-bold px-2 py-1 rounded-full border border-cyan-100">
          {itemCount} Items
        </span>
      </div>

      {/* Middle Row: Preview */}
      <div className="mb-4">
        <p className="text-sm text-slate-600 line-clamp-2">
           <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider mr-2">Preview:</span>
           {previewText}
        </p>
      </div>

      {/* Bottom Row: Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <Link 
          href={`/dashboard/${scope.id}`} 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          View Details
        </Link>

        <div className="flex-grow"></div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-sm text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  )
}