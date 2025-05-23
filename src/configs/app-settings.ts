export const appSettings = {
    appName: process.env.APP_NAME,
    development: false,
    timeZone: process.env.TIME_ZONE,
    timeZoneMongoDB: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        getCurrentTime() {
            return new Date().toLocaleString('en-US', { timeZone: appSettings.timeZone });
        },
        getCustomTime(time: string) {
            return new Date(time); 
        }
    },
    port: process.env.PORT,
    prefixApi: process.env.PREFIX_API,
    corsOrigin: [
        "*",
    ],
    mongo: {
        url: "mongodb+srv://doadmin:0R28DB154wK6vnx9@mangoads-mongodb-2025-1627f768.mongo.ondigitalocean.com",
        dbName: 'test',
        options: "?tls=true&authSource=admin&replicaSet=mangoads-mongodb-2025",
        isReplicaSet: process.env.IS_REPLICA_SET === 'true' ? true : false,
    }
};