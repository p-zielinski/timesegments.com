import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import {
  Link,
  Container,
  Typography,
  Divider,
  Stack,
  Button,
} from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/logo';
import Iconify from '../components/iconify';
// sections
import { AuthForm } from '../sections/auth';
import { useState } from 'react';
import { AuthPageState } from '../enums/authPageState';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Index() {
  const mdUp = useResponsive('up', 'md');
  const [currentPageState, setCurrentPageState] = useState(AuthPageState.LOGIN);

  const renderLink = () => {
    switch (currentPageState) {
      case AuthPageState.LOGIN: {
        return (
          <>
            Don’t have an account? {''}
            <Link
              variant="subtitle2"
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentPageState(AuthPageState.REGISTER)}
            >
              Get started
            </Link>
          </>
        );
      }
      case AuthPageState.REGISTER: {
        return (
          <>
            Already have an account? {''}
            <Link
              variant="subtitle2"
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentPageState(AuthPageState.LOGIN)}
            >
              Log in
            </Link>
          </>
        );
      }
      case AuthPageState.RECOVER_ACCOUNT: {
        return (
          <>
            Want sign in? {''}
            <Link
              variant="subtitle2"
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentPageState(AuthPageState.LOGIN)}
            >
              Log in
            </Link>
          </>
        );
      }
    }
  };

  return (
    <>
      <Helmet>
        <title> Login | Minimal UI </title>
      </Helmet>

      <StyledRoot>
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && (
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Hi, Welcome Back
            </Typography>
            <img
              src="/assets/illustrations/illustration_login.png"
              alt="login"
            />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              {currentPageState === AuthPageState.LOGIN
                ? `Sign in to ${process.env.NEXT_PUBLIC_APP_NAME}`
                : currentPageState === AuthPageState.REGISTER
                ? `Sign up to ${process.env.NEXT_PUBLIC_APP_NAME}`
                : `Recover account`}
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
              {renderLink()}
            </Typography>

            <AuthForm
              authPageState={currentPageState}
              setAuthPageState={setCurrentPageState}
            />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
