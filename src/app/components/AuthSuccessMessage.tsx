'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { showLoginSuccessToast } from '@/app/lib/toast-utils'

export default function AuthSuccessMessage() {
  const searchParams = useSearchParams()
  const auth = searchParams.get('auth')

  useEffect(() => {
    if (auth === 'success') {
      // Show custom login success toast
      showLoginSuccessToast();

      // Also show sonner toast for consistency
      toast.success('🎉 เข้าสู่ระบบสำเร็จแล้ว!', {
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