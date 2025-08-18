'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// If "@/supabase" doesn't work in your project, change to: "../../../supabase"
import { supabase } from '@/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // 1) Handle hash tokens:  #access_token=...&refresh_token=...
        const hash = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          router.replace('/'); // or '/dashboard'
          return;
        }

        // 2) Handle PKCE code:  ?code=...
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          router.replace('/'); // or '/dashboard'
          return;
        }

        // Nothing to process → go home
        router.replace('/');
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/login'); // optional
      }
    };

    run();
  }, [router]);

  return <p>Loading...</p>;
}
