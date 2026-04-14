export default () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    kafka: {
        brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
        clientId: process.env.KAFKA_CLIENT_ID ?? 'users-app',
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6380', 10),
        password: process.env.REDIS_PASSWORD,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExp: process.env.JWT_ACCESS_EXPIRES ?? '15m',
        refreshExp: process.env.JWT_REFRESH_EXPIRES ?? '7d',
    },
    s3: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION ?? 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        bucket: process.env.S3_BUCKET,
        forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
        publicUrl: process.env.S3_PUBLIC_URL,
    },
});
