'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Star, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="text-center">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#C4704B] flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#3D3B38]">
          Sacred Living
        </h1>
      </div>

      <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#3D3B38] mb-2">
        Welcome back
      </h2>
      <p className="text-sm text-[#8A877E] mb-8">
        Enter your sacred space
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-medium text-[#5C4D42] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg bg-[#F3F1EC] border border-[#E8E4DD] text-[#3D3B38] placeholder:text-[#8A877E] focus:outline-none focus:border-[#C4704B] focus:ring-2 focus:ring-[#C4704B]/10 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5C4D42] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-[#F3F1EC] border border-[#E8E4DD] text-[#3D3B38] placeholder:text-[#8A877E] focus:outline-none focus:border-[#C4704B] focus:ring-2 focus:ring-[#C4704B]/10 transition-all pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A877E] hover:text-[#5C4D42]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-[#7A8B65] text-white font-medium text-sm hover:bg-[#6A7B55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#8A877E]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#C4704B] hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}
