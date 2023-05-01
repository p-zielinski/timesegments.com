import { AppProps } from 'next/app';
import Head from 'next/head';
import ThemeProvider from '../theme';
import ScrollToTop from '../components/scroll-to-top';
import { HelmetProvider } from 'react-helmet-async';
import './styles.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getRandomRgbObjectForSliderPicker } from '../utils/colors/getRandomRgbObjectForSliderPicker';

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

  return (
    <HelmetProvider>
      <ThemeProvider>
        <ScrollToTop />
        <Head>
          <title>Timesegs.com</title>
        </Head>
        {loading ? (
          <Box
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <CircularProgress
              size={200}
              sx={{
                color: getRandomRgbObjectForSliderPicker().hex,
                position: 'absolute',
                top: 'calc(50% - 100px)',
                left: 'calc(50% - 100px)',
              }}
            />
          </Box>
        ) : (
          <Component {...pageProps} />
        )}
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default CustomApp;
