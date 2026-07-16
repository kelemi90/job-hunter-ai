export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'Job Hunter AI',
    port: parseInt(process.env.PORT ?? '3000', 10),
    environment: process.env.NODE_ENV ?? 'development',
    apiPrefix: 'api',
  },
});
