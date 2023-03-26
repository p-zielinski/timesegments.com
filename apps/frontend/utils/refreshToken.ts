import Cookies from 'js-cookie';

export const refreshToken = () => {
  const jwt_token = Cookies.get('jwt_token');
  if (jwt_token) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}token/return-token-set-cookie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        jwt_token,
      },
    });
  }
};
