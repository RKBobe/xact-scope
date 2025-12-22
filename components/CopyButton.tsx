'use client'

import { useState } from 'react'

// UPDATED: We now allow 'string | null' for fields that might be empty in the database
interface LineItem {
  category: string | null
  xactCode: string | null
  description: string
  quantity: number
  unit: string | null
}

export default function CopyButton({ items }: { items: LineItem[] }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    // Format headers for Excel/Xactimate
    const headers = "Category\tSelector\tDescription\tQty\tUnit"
    
    // Format rows with Tab separations
    // We use (item.field ?? '') to say "If this is null, use an empty string instead"
    const rows = items.map(item => 
      `${item.category ?? ''}\t${item.xactCode ?? ''}\t${item.description}\t${item.quantity}\t${item.unit ?? ''}`
    ).join('\n')
    
    const textToCopy = `${headers}\n${rows}`

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-3 py-1 rounded-md border transition-all flex items-center gap-2 font-medium
        ${copied 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
    >
      {copied ? (
        <>
          <span>✓</span> Copied!
        </>
      ) : (
        <>
          <span>📋</span> Copy for Excel
        </>
      )}
    </button>
  )
}