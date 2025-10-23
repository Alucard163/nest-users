export default () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExp: process.env.JWT_ACCESS_EXPIRES ?? '15m',
        refreshExp: process.env.JWT_REFRESH_EXPIRES ?? '7d',
    },
});
