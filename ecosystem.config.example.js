module.exports = {
  apps: [
    {
      name: 'timesegs-frontend',
      version: '1.0.0',
      script: 'npm run start:frontend -- port=20122',
      env: {
        NEXT_PUBLIC_APP_NAME: 'Timesegs',
        NEXT_PUBLIC_API_URL: 'https://timesegs-backend.cytr.us/api/',
      },
    },
    {
      name: 'timesegs-backend',
      version: '1.0.0',
      script: 'npm run start:backend -- port=30122',
      env: {
        DATABASE_URL:
          'postgres://postgres:ABkNPAC6fs@mws02.mikr.us:50002/timesegs_prod',
        JWT_SECRET: '',
      },
    },
  ],
};
