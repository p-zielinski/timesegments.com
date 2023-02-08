import {Link as RouterLink} from 'next/link';
// @mui
import {Box, Link} from '@mui/material';
import Image from 'next/image';

// ----------------------------------------------------------------------

// eslint-disable-next-line react/display-name
export default function Logo({ disabledLink = false, sx, ...other }) {
  const logo = (
    <Box
      component="div"
      sx={{
        width: 40,
        height: 40,
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    >
      <Image src="/assets/logo.jpg" width={40} height={40} />
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <Link to="/" component={RouterLink} sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
}
