'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Star, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#C4704B] flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#3D3B38]">
            Sacred Living
          </h1>
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#3D3B38] mb-2">
          Check your email
        </h2>
        <p className="text-sm text-[#8A877E] mb-6">
          We sent a confirmation link to {email}. Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-lg bg-[#7A8B65] text-white font-medium text-sm hover:bg-[#6A7B55] transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#C4704B] flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#3D3B38]">
          Sacred Living
        </h1>
      </div>

      <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#3D3B38] mb-2">
        Create your space
      </h2>
      <p className="text-sm text-[#8A877E] mb-8">
        Begin your journey of intention
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4 text-left">
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
              minLength={8}
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

        <div>
          <label className="block text-xs font-medium text-[#5C4D42] uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg bg-[#F3F1EC] border border-[#E8E4DD] text-[#3D3B38] placeholder:text-[#8A877E] focus:outline-none focus:border-[#C4704B] focus:ring-2 focus:ring-[#C4704B]/10 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-[#7A8B65] text-white font-medium text-sm hover:bg-[#6A7B55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#8A877E]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#C4704B] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
