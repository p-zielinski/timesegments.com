import { AppProps } from 'next/app';
import Head from 'next/head';
import ThemeProvider from '../theme';
import ScrollToTop from '../components/scroll-to-top';
import { HelmetProvider } from 'react-helmet-async';
import './styles.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ScrollToTop />
        <Head>
          <title>Welcome to frontend!</title>
        </Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default CustomApp;
