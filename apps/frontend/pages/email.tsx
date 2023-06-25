import {Helmet} from 'react-helmet-async'; // @mui
import {styled} from '@mui/material/styles';
import {CircularProgress, Container, Typography} from '@mui/material'; // hooks
import React, {useEffect, useState} from 'react';
import {EmailWithUser} from '@test1/shared';
import {isMobile} from 'react-device-detect';
import {getHexFromRGBAObject} from '../utils/colors/getHexFromRGBAObject';
import {useRouter} from 'next/router';
import {getHexFromRGBObject} from '../utils/colors/getHexFromRGBObject';
import {getColorShadeBasedOnSliderPickerSchema} from '../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getRandomRgbObjectForSliderPicker} from '../utils/colors/getRandomRgbObjectForSliderPicker';
import {handleFetch} from '../utils/fetchingData/handleFetch';
import LoadingButton from '@mui/lab/LoadingButton';
import EmailForm from '../sections/email/EmailForm';
// ---------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

type Props = {
  randomSliderColor: string;
};

export default function Email({ randomSliderColor }: Props) {
  const router = useRouter();
  const { query } = router;
  const [email, setEmail] = useState<EmailWithUser>(undefined);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [error, setError] = useState<string>(undefined);

  const handleEmailRequestValidation = async (query) => {
    console.log(query);
    setIsValidating(true);
    const response = await handleFetch({
      pathOrUrl: 'email/validate-email',
      body: query,
      method: 'POST',
    });
    if (response.email) {
      setEmail(response.email);
    }
    if (response.error) {
      setError(response.error);
    }
    setIsValidating(false);
    return;
  };

  useEffect(() => {
    handleEmailRequestValidation(query);
  }, []);

  const StyledContent = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: isMobile ? 'start' : 'center',
    flexDirection: 'column',
    padding: theme.spacing(isMobile ? 6 : 12, 0),
  }));

  return (
    <>
      <Helmet>
        <title> Login | Minimal UI </title>
      </Helmet>

      <StyledRoot>
        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              <span
                style={{
                  color: getHexFromRGBAObject({
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0.7,
                  }),
                }}
              >
                TimeSeg
                <span
                  style={{
                    color: randomSliderColor,
                  }}
                >
                  ment
                </span>
                s.com
              </span>
            </Typography>
            {isValidating ? (
              <Typography variant="body2" sx={{ mb: 3 }}>
                Request is validating, please wait.{' '}
                <CircularProgress
                  size={'15px'}
                  sx={{ ml: 1, color: randomSliderColor }}
                />
              </Typography>
            ) : error ? (
              <>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Error: {error}
                </Typography>
                <LoadingButton
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={() => router.push('/')}
                >
                  Go Home
                </LoadingButton>
              </>
            ) : (
              <EmailForm email={email} />
            )}
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}

export const getServerSideProps = async ({ req }) => {
  const { query } = req;
  if (!query.emailId) {
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
    };
  }
  return {
    props: {
      randomSliderColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
    },
  };
};
