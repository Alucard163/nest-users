export default () => ({
  port: parseInt(process.env.NOTIFICATION_PORT ?? process.env.PORT ?? '3001', 10),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    clientId: process.env.NOTIFICATION_KAFKA_CLIENT_ID ?? 'notification-service',
    groupId:
      process.env.NOTIFICATION_KAFKA_GROUP_ID ??
      'notification-service-consumer',
  },
  mongo: {
    uri:
      process.env.MONGO_URI ??
      'mongodb://localhost:27017/notification_service',
  },
});
