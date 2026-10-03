'use client';

import { useState } from 'react';
import { signIn, signUp, signInWithGoogle } from './actions';
import { LogIn, Lock, Mail, AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>, action: typeof signIn | typeof signUp | typeof signInWithGoogle) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    try {
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 z-1">
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-blue-100 text-black">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-md border border-slate-100">
          <LogIn className="w-7 h-7 text-black" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center">
          {isLogin ? "Sign in with email" : "Create an account"}
        </h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          {isLogin 
            ? "Sign in to review and manage your grant applications securely."
            : "Register a new account to start reviewing applications."}
        </p>

        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-50 text-red-800 text-sm flex items-start gap-2 border border-red-100">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="w-full mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm flex items-start gap-2 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="w-full flex flex-col gap-3 mb-2" onSubmit={(e) => onSubmit(e, isLogin ? signIn : signUp)}>
          {!isLogin && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                name="name"
                placeholder="Full Name (Optional)"
                type="text"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm transition-all"
              />
            </div>
          )}
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              name="email"
              placeholder="Email"
              type="email"
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm transition-all"
            />
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              name="password"
              placeholder="Password"
              type="password"
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm transition-all"
            />
          </div>
          
          <div className="w-full flex justify-between items-center mt-1">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {isLogin ? "Need an account?" : "Already have an account?"}
            </button>
            
            {isLogin && (
              <button type="button" className="text-xs text-gray-500 hover:underline font-medium">
                Forgot password?
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2.5 rounded-xl shadow hover:brightness-105 cursor-pointer transition mb-4 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Get Started' : 'Create Account')}
          </button>
        </form>

        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
          <span className="mx-2 text-xs text-gray-400">Or continue with</span>
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
        </div>
        
        <div className="flex gap-3 w-full justify-center mt-4">
          <form onSubmit={(e) => onSubmit(e, signInWithGoogle)} className="grow">
            <button type="submit" className="flex items-center justify-center w-full h-12 rounded-xl border bg-white hover:bg-gray-50 transition">
              <img
                src="https://cdn.21st.dev/assets/mirror/38/38146bfd9eff6dbf0d74771f2e625c70d87d3770e0d080dbb6e50db1d5403f46.svg"
                alt="Google"
                className="w-5 h-5"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
