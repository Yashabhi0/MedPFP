import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

// IMPORTANT — Clerk Dashboard must have these URLs whitelisted:
// Allowed redirect URLs: http://localhost:8080, http://localhost:8080/sso-callback
// After sign-in URL:  /dashboard
// After sign-up URL:  /dashboard

createRoot(document.getElementById('root')!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    afterSignInUrl="/dashboard"
    afterSignUpUrl="/dashboard"
  >
    <App />
  </ClerkProvider>
);
