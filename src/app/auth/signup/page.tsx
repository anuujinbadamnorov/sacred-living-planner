'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="planner-card w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-success)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Welcome to Sacred Living
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Check your email to confirm your account. Once confirmed, you'll have a 14-day free trial of all Pro features.
          </p>
          <Link href="/auth/login" className="planner-button inline-block">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="planner-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Join Sacred Living
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Start your journey with intention
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-error)', color: 'white', opacity: 0.9 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="planner-input w-full"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="planner-input w-full"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="planner-input w-full"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="planner-button w-full"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Email / password sign up only
        </p>

        <p className="text-center mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium" style={{ color: 'var(--color-accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
