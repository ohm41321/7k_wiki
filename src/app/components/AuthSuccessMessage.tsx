'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function AuthSuccessMessage() {
  const searchParams = useSearchParams()
  const auth = searchParams.get('auth')

  useEffect(() => {
    if (auth === 'success') {
      toast.success('🎉 Welcome! You have been successfully signed in!', {
        duration: 5000,
        style: {
          background: '#111111',
          border: '1px solid #c89b3c',
          color: '#e0e0e0',
        },
      })

      // Clean up the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('auth')
      window.history.replaceState({}, '', url.toString())
    }
  }, [auth])

  return null
}