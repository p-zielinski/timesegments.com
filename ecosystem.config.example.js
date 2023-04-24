module.exports = {
  apps: [
    {
      name: 'timesegs-frontend',
      version: '1.0.0',
      script: 'npm run build:frontend && npm run start:frontend',
      env: {
        PORT: 20122,
        NEXT_PUBLIC_APP_NAME: 'Timesegs',
        NEXT_PUBLIC_API_URL: 'https://timesegs-backend.cytr.us/api/',
      },
    },
    {
      name: 'timesegs-backend',
      version: '1.0.0',
      script: 'npm run build:backend && npm run start:backend',
      env: {
        PORT: 30122,
        DATABASE_URL:
          'postgres://postgres:ABkNPAC6fs@mws02.mikr.us:50002/timesegs_prod',
        JWT_SECRET: '',
      },
    },
  ],
};
