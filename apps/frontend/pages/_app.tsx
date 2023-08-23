import { AppProps } from 'next/app';
import Head from 'next/head';
import ThemeProvider from '../theme';
import ScrollToTop from '../components/scroll-to-top';
import { HelmetProvider } from 'react-helmet-async';
import './styles.global.scss';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';

function CustomApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  useEffect(() => {
    const handleStart = async (url) => {
      if (url !== router.asPath) {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1550));
        if (loading) {
          setShowRefreshButton(true);
        }
      }
    };
    const handleComplete = (url) => {
      if (url === router.asPath) {
        setLoading(false);
        setShowRefreshButton(false);
      }
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="clock-wrapper">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="clock-loader" />
            <div style={{ marginTop: 5 }}>loading...</div>
          </div>
        </div>
        <div
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
            display: showRefreshButton ? 'flex' : 'none',
          }}
        >
          <Button
            onClick={() => location.reload()}
            size="large"
            variant="contained"
          >
            Refresh
          </Button>
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
