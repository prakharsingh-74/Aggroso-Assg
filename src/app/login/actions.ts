'use server';

import { cookies } from 'next/headers';
import { createAuthActions, createServerClient } from '@insforge/sdk/ssr';
import { redirect } from 'next/navigation';

export async function signInWithGoogle(formData?: FormData) {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  
  const { data, error } = await auth.signInWithOAuth('google', {
    redirectTo: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` : 'http://localhost:3000/api/auth/callback',
    skipBrowserRedirect: true,
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.codeVerifier) {
    cookieStore.set('insforge_oauth_verifier', data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }

  if (data?.url) {
    redirect(data.url);
  }
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });

  const { error } = await auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }
  
  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const name = String(formData.get('name') || '');

  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });

  const { error } = await auth.signUp({ 
    email, 
    password, 
    name, 
    redirectTo: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : 'http://localhost:3000/login' 
  });

  if (error) {
    return { error: error.message };
  }

  // InsForge signs the user in immediately if email verification is disabled, 
  // or sends an email if verification is required. We'll just return success.
  return { success: 'Check your email to verify your account (if required), or sign in.' };
}

export async function signOut() {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  await auth.signOut();
  redirect('/login');
}
