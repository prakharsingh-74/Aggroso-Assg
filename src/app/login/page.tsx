'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn, signUp, signInWithGoogle } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    try {
      const action = isLogin ? signIn : signUp;
      const result = await action(formData);
      if (result && 'error' in result && result.error) {
        setError(result.error as string);
      } else if (result && 'success' in result && result.success) {
        setSuccess(result.success as string);
      }
    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT') {
        throw err;
      }
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result && 'error' in result && result.error) {
        setError(result.error as string);
      }
    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT') {
        throw err;
      }
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg border border-slate-200 bg-white">
        <CardContent className="p-8 flex flex-col gap-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-slate-500">
              {isLogin ? 'Sign in to access your grant assessments' : 'Register to get started with Aggroso'}
            </p>
          </div>

          {error && (
            <div className="w-full p-3 rounded-xl bg-red-50 text-red-800 text-sm flex items-start gap-2 border border-red-100">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="w-full p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm flex items-start gap-2 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 h-12 focus-within:ring-2 focus-within:ring-blue-500 bg-slate-50/50">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 h-12 focus-within:ring-2 focus-within:ring-blue-500 bg-slate-50/50">
                <Lock className="h-5 w-5 text-slate-400 shrink-0" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal text-slate-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button type="button" className="text-sm text-blue-600 hover:underline font-medium">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-medium rounded-lg mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center w-full my-1">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="mx-3 text-xs text-slate-400 uppercase font-medium">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Social login button (Google Only) */}
          <form onSubmit={handleGoogleSubmit} className="w-full">
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
              className="w-full h-12 rounded-lg flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 font-medium cursor-pointer"
            >
              <Image
                src="https://cdn.21st.dev/assets/mirror/ba/ba9d249c43ce2f6a5beb69cd4db26ead682241b2b45d1b7d971a4dd70cdf4bc3.svg"
                alt="Google"
                width={20}
                height={20}
              />
              Continue with Google
            </Button>
          </form>

          {/* Signup toggle */}
          <p className="text-center text-sm text-slate-500 mt-1">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-blue-600 font-semibold cursor-pointer hover:underline ml-1"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
