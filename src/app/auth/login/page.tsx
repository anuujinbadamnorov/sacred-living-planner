'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/planner/daily');
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="planner-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Sacred Living
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Your space for intention, growth, and daily alignment
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-error)', color: 'white', opacity: 0.9 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="planner-button w-full"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-medium" style={{ color: 'var(--color-accent)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
