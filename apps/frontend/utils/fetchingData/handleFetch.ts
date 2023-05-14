import Cookies from 'js-cookie';
import fetch from 'node-fetch';

export const handleFetch = async ({
  pathOrUrl = '',
  method = 'GET',
  body = {},
  additionalHeaders = {},
  sentToken = true,
}: {
  pathOrUrl: string;
  method: string;
  body?: object;
  additionalHeaders?: object;
  sentToken?: boolean;
}) => {
  if (typeof process.env.NEXT_PUBLIC_API_URL !== 'string') {
    console.log({ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL });
    throw new Error('misconfiguration of NEXT_PUBLIC_API_URL');
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  let statusCode;
  const jwt_token = sentToken ? Cookies.get('jwt_token') : undefined;
  const url = !pathOrUrl
    ? apiUrl
    : pathOrUrl?.includes('https://') || pathOrUrl?.includes('http://')
    ? pathOrUrl
    : apiUrl + pathOrUrl;
  const fetchBody = ['GET'].includes(method.toUpperCase())
    ? undefined
    : JSON.stringify(body);
  try {
    const rawResponse = await fetch(url, {
      method,
      body: fetchBody,
      headers: {
        ...additionalHeaders,
        'Content-Type': 'application/json',
        authorization: `Bearer ${jwt_token}`,
      },
    });
    statusCode = rawResponse.statusCode || rawResponse.status;
    return { statusCode, ...(await rawResponse.json()) };
  } catch (error) {
    return { statusCode, error: error.message };
  }
};
