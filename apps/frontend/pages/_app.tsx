import { AppProps } from 'next/app';
import Head from 'next/head';
import ThemeProvider from '../theme';
import ScrollToTop from '../components/scroll-to-top';
import { HelmetProvider } from 'react-helmet-async';
import './styles.global.scss';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function CustomApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getPathname = (pathnameWithSearch) =>
      pathnameWithSearch.split('?')[0];

    const handleStart = async (url) => {
      const pathname = getPathname(url);
      if (pathname !== window.location.pathname) {
        setLoading(true);
        while (pathname !== window.location.pathname) {
          await new Promise((r) => setTimeout(r, 50));
        }
        await new Promise((r) => setTimeout(r, 300));
        setLoading(false);
      }
    };
    const handleComplete = (url) => {
      const pathname = getPathname(url);
      pathname === window.location.pathname && setLoading(false);
    };
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    router.events.on('hashChangeComplete', handleComplete);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
      router.events.off('hashChangeComplete', handleComplete);
    };
  });

  if (loading) {
    return (
      <div className="clock-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="clock-loader" />
          <div style={{ marginTop: 5 }}>loading...</div>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <ThemeProvider>
        <ScrollToTop />
        <Head>
          <title>Timesegs.com</title>
          <link rel="icon" href="/favicon/favicon.ico" />
          <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        </Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default CustomApp;
