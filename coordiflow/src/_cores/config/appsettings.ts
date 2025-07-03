import 'dotenv/config';

export const appSettings = {
    appName: process.env.APP_NAME,
    development: JSON.parse(process.env.DEVELOPMENT || 'false'),
    timeZone: process.env.TIME_ZONE,
    timeZoneMongoDB: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        getCurrentTime() {
            return new Date().toLocaleString('en-US', { timeZone: appSettings.timeZone });
        },
        getCustomTime(time: string) {
            return new Date(time).toLocaleString('en-US', { timeZone: appSettings.timeZone });
        }
    },
    sessionSecret: process.env.SESSION_SECRET,
    port: process.env.PORT,
    maxFileSize: {
        admin: Number(process.env.MAX_FILE_SIZE_ADMIN),
        front: Number(process.env.MAX_FILE_SIZE_FRONT),
    },
    prefixApi: process.env.PREFIX_API,
    corsOrigin: [
        process.env.CORS_ORIGIN_FE1,
        process.env.CORS_ORIGIN_FE2,
        process.env.CORS_ORIGIN_FE3,
        process.env.CORS_ORIGIN_FE4,
    ],
    typeDeployment: process.env.TYPE_DEPLOYMENT,
    mongo: {
        url: process.env.MONGO_URL,
        dbName: process.env.DB_NAME,
        optionMongo: process.env.OPTION_MONGO,
        isReplicaSet: process.env.IS_REPLICA_SET === 'true' ? true : false,
    },
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    issuer: process.env.ISSUER,
    expireIn: process.env.EXPIRE_IN,
    refreshExpireIn: process.env.REFRESH_EXPIRE_IN,
    apiKey: process.env.API_KEY,
    storage_type: process.env.STORAGE_TYPE,
   
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '0'),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
    },
    firebase: {
        type: process.env.FB_TYPE,
        projectId: process.env.FB_PROJECT_ID,
        privateKeyId: process.env.FB_PRIVATE_KEY_ID,
        privateKey: process.env.FB_PRIVATE_KEY,
        clientEmail: process.env.FB_CLIENT_EMAIL,
        clientId: process.env.FB_CLIENT_ID,
        authUri: process.env.FB_AUTH_URI,
        tokenUri: process.env.FB_TOKEN_URI,
        authProviderX509CertUrl: process.env.FB_AUTH_PROVIDER_X509_CERT_URL,
        clientX509CertUrl: process.env.FB_CLIENT_X509_CERT_URL,
        universeDomain: process.env.FB_UNIVERSE_DOMAIN,
    },
};