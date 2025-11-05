'use client'

import { useEffect } from 'react'
import { authenticateWithPuter } from '@/lib/puter-client'

/**
 * PuterProvider component
 * - Loads Puter.js SDK
 * - Attempts automatic authentication with stored credentials
 * - Initializes Puter services for voice generation
 */
export function PuterProvider() {
  useEffect(() => {
    // Load Puter.js SDK
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.async = true
    script.onload = () => {
      console.log('Puter.js SDK loaded successfully')

      // Attempt automatic authentication with default credentials
      authenticateWithPuter('kailaspnair@yahoo.com', '@#Cargo123#@')
        .then((success) => {
          if (success) {
            console.log('Puter authenticated successfully')
          } else {
            console.log('Puter authentication not available in this context')
          }
        })
        .catch((error) => {
          console.error('Puter authentication error:', error)
        })
    }
    script.onerror = () => {
      console.error('Failed to load Puter.js SDK')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup is handled by Next.js
    }
  }, [])

  return null
}
