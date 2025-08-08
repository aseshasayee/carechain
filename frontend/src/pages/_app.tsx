import '../styles/login.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Fade in animation for page transitions
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 50);
  }, []);

  // Pages that shouldn't show navigation
  const noNavigationPages = ['/login', '/register'];
  const showNavigation = !noNavigationPages.includes(router.pathname);

  return (
    <Layout showNavigation={showNavigation}>
      <Component {...pageProps} />
    </Layout>
  );
}

