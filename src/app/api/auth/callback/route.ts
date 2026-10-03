import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthActions } from '@insforge/sdk/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('insforge_code');
  
  if (code) {
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('insforge_oauth_verifier')?.value;
    
    if (codeVerifier) {
      const auth = createAuthActions({ cookies: cookieStore });
      await auth.exchangeOAuthCode(code, codeVerifier);
      
      // Clear the verifier cookie
      cookieStore.delete('insforge_oauth_verifier');
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
