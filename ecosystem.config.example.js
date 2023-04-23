module.exports = {
  apps: [
    {
      name: 'timesegs-frontend',
      version: '1.0.0',
      script: 'nx serve frontend --prod --port=20122 --hostname 0.0.0.0',
      env: {
        NEXT_PUBLIC_APP_NAME: 'Timesegs',
        NEXT_PUBLIC_API_URL: 'https://timesegs-backend.cytr.us/api/',
      },
    },
    {
      name: 'timesegs-frontend',
      version: '1.0.0',
      script: 'prisma migrate dev; nx serve backend --prod --port=$PORT',
      env: {
        DATABASE_URL:
          'postgres://postgres:ABkNPAC6fs@mws02.mikr.us:50002/timesegs_prod',
        JWT_SECRET: '',
      },
    },
  ],
};
