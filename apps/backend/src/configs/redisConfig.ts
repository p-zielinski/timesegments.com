export const getRedisPassword = (REDIS_TLS_URL) => {
  return REDIS_TLS_URL?.split?.('@')?.[0]?.split?.(':')?.[2];
};

export const getUserName = (REDIS_TLS_URL) => {
  return (
    REDIS_TLS_URL?.split('@')?.[0]?.split?.(':')?.[1]?.slice?.(2) || undefined
  );
};

export const getRedisPort = (REDIS_TLS_URL) => {
  const port = parseInt(REDIS_TLS_URL?.split?.('@')?.[1]?.split?.(':')?.[1]);
  if (isNaN(port)) {
    return undefined;
  }
  return port;
};

export const getRedisHost = (REDIS_TLS_URL): string => {
  return REDIS_TLS_URL?.split?.('@')?.[1]?.split?.(':')?.[0];
};
