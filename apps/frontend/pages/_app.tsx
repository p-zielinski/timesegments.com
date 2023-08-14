import { AppProps } from 'next/app';
import Head from 'next/head';
import ThemeProvider from '../theme';
import ScrollToTop from '../components/scroll-to-top';
import { HelmetProvider } from 'react-helmet-async';
import './styles.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function CustomApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleStart = (url) => url !== router.asPath && setLoading(true);
    const handleComplete = (url) => url === router.asPath && setLoading(false);
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  });

  if (loading) {
    return (
      <div className="gooey">
        <div className="dot" />
        <div className="dots">
          <div className="dot-span"></div>
          <div className="dot-span"></div>
          <div className="dot-span"></div>
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
        </Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default CustomApp;
