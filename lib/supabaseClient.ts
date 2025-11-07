import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// If env vars are missing, avoid calling createClient with empty strings
// because createClient will throw. Instead provide a light-weight stub that
// lets the app run in dev without a configured Supabase instance. This
// prevents the dev server from crashing when env vars aren't set.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars are not set: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase: any = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      // minimal auth helpers used by the UI
      auth: {
        getUser: async () => ({ data: { user: null } }),
        onAuthStateChange: () => ({ data: null, subscription: { unsubscribe: () => {} } }),
        signInWithOtp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null })
      },
      // minimal table-interface used in components. When Supabase isn't
      // configured, these methods throw so calling code falls back to the
      // local store. This avoids silently 'succeeding' without persisting.
      from: () => ({
        select: async () => { throw new Error('Supabase not configured') },
        insert: async () => { throw new Error('Supabase not configured') },
        update: async () => { throw new Error('Supabase not configured') },
        delete: async () => { throw new Error('Supabase not configured') },
        order: () => ({ select: async () => { throw new Error('Supabase not configured') } })
      }),
      // stub channel API
      channel: () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => {} })
    }
