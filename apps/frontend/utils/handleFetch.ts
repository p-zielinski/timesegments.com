import cookie from 'cookie-cutter';
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
  await new Promise((r) => setTimeout(r, 200));
  let statusCode;
  const jwt_token = sentToken ? cookie.get('jwt_token') : undefined;
  const url = !pathOrUrl
    ? process.env.NEXT_PUBLIC_API_URL
    : pathOrUrl?.includes('https://')
    ? pathOrUrl
    : process.env.NEXT_PUBLIC_API_URL + pathOrUrl;
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
        jwt_token,
      },
    });
    statusCode = rawResponse.statusCode || rawResponse.status;
    return { statusCode, ...(await rawResponse.json()) };
  } catch (error) {
    return { statusCode, error: error.message };
  }
};