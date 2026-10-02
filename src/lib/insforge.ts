import { createClient } from '@insforge/sdk';

if (!process.env.NEXT_PUBLIC_INSFORGE_URL || !process.env.NEXT_PUBLIC_INSFORGE_KEY) {
  throw new Error("Missing InsForge URL or Key in environment variables.");
}

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_KEY
});
