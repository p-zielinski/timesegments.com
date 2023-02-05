import { AuthPageState } from '@test1/shared';
import { Link } from '@mui/material';

export const RenderAuthLink = ({ currentPageState, setCurrentPageState }) => {
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
