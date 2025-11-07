"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(data?.user ?? null)
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      mounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  async function handleSignIn() {
    if (!email) return
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else alert('Check your email for the magic link')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <div className="text-sm text-gray-700">{user.email}</div>
          <button onClick={handleSignOut} className="px-2 py-1 text-sm bg-red-500 text-white rounded">Sign out</button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="p-1 border rounded text-sm" />
          <button onClick={handleSignIn} className="px-2 py-1 text-sm bg-indigo-600 text-white rounded">Sign in</button>
        </div>
      )}
    </div>
  )
}
