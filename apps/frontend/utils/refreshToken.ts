import Cookies from 'js-cookie';

export const refreshToken = () => {
  const jwt_token = Cookies.get('jwt_token');
  if (jwt_token) {
    Cookies.set('jwt_token', jwt_token, { expires: 7, path: '' });
  }
};
