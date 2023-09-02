import {Helmet} from 'react-helmet-async';
import {useRouter} from 'next/router';
// @mui
import {styled} from '@mui/material/styles';
import {Button, Container, Typography} from '@mui/material';
import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

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

export default function Page404() {
  const router = useRouter();
  return (
    <>
      <Helmet>
        <title> 404 Page Not Found | Minimal UI </title>
      </Helmet>

      <Container>
        <StyledContent sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h3" paragraph>
            Sorry, page not found!
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Sorry, we could not find the page you’re looking for. Perhaps you’ve
            mistyped the URL? Be sure to check your spelling.
          </Typography>
          <Iconify
            icon="solar:sad-square-line-duotone"
            sx={{
              width: 260,
              height: 260,
              mx: 'auto',
              my: { xs: 3, sm: 6 },
              color: '#3b78e7',
            }}
          />
          <Button
            onClick={() => router.push('/')}
            size="large"
            variant="contained"
          >
            Go to Home
          </Button>
        </StyledContent>
      </Container>
    </>
  );
}
