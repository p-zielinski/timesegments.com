module.exports = {
  apps: [
    {
      name: 'timesegs-frontend',
      version: '1.0.0',
      script: 'npm run build:frontend && npm run start:frontend',
      env: {
        PORT: 20122,
        NEXT_PUBLIC_API_URL: 'https://backend.timesegs.com/api/',
        NEXT_PUBLIC_FRONTEND_URL: 'https://timesegs.com/',
      },
    },
    {
      name: 'timesegs-backend',
      version: '1.0.0',
      script: 'npm run build:backend && npm run start:backend',
      env: {
        REDIS_HOST: '',
        REDIS_USERNAME: '',
        REDIS_PASSWORD: '',
        REDIS_PORT: 123,
        REDIS_TLS: false,
        PORT: 30122,
        DATABASE_URL:
          'postgres://postgres:ABkNPAC6fs@mws02.mikr.us:50002/timesegs_prod',
        JWT_SECRET: '',
        SCHEDULE_TOKEN: '',
      },
    },
  ],
};
