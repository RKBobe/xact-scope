'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { generateScope } from '@/app/actions/user-actions'

// 1. Define types to satisfy TypeScript Strict Mode
interface SpeechEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechError {
  error: string
}

// 2. The Submit Button Component (Handles the "Generating..." animation)
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full font-medium py-2.5 rounded-md transition-colors shadow-sm flex justify-center items-center text-white
        ${pending 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
        }`}
    >
      {pending ? (
        <>
          {/* Spinner SVG */}
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating Estimate...
        </>
      ) : (
        "Generate Estimate"
      )}
    </button>
  )
}

// 3. The Main Form Component
export default function ScopeForm() {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  
  // Use 'any' for the ref to allow the non-standard SpeechRecognition object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for browser support (Chrome/Edge/Safari)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recog = new SpeechRecognition()
        recog.continuous = false // Stop after one sentence (better for mobile)
        recog.interimResults = false
        recog.lang = 'en-US'
        
        recog.onresult = (event: SpeechEvent) => {
          const transcript = event.results[0][0].transcript
          // Append new speech to existing text
          setInput(prev => (prev ? prev + ' ' + transcript : transcript))
          setIsListening(false)
        }

        recog.onerror = (event: SpeechError) => {
          console.error("Speech Error:", event.error)
          setIsListening(false)
        }
        
        recog.onend = () => setIsListening(false)
        
        recognitionRef.current = recog
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support speech recognition. Try Chrome or Safari.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">New Assessment</h2>
      
      {/* We use a wrapper function for the action so we can 
        wait for it to finish and then clear the input box.
      */}
      <form 
        action={async (formData) => {
          await generateScope(formData)
          setInput('') // Clear the box after success
        }} 
        className="space-y-4"
      >
        <div className="relative">
          <label htmlFor="rawInput" className="block text-sm font-medium text-gray-700 mb-1">
            Field Notes / Damage Description
          </label>
          
          <textarea
            name="rawInput"
            id="rawInput"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Tap the microphone to speak..."
            required
          />

          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute bottom-3 right-3 p-2 rounded-full shadow-sm transition-all flex items-center gap-2
              ${isListening 
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            title="Toggle Dictation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {isListening && <span className="text-xs font-bold pr-1">Listening...</span>}
          </button>
        </div>

        {/* The New Submit Button */}
        <SubmitButton />
      </form>
    </div>
  )
}