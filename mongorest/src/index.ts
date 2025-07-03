import 'dotenv/config';
import Fastify from 'fastify';
import { IndexRoute } from './routes/_index';
import * as fs from 'fs';
import * as path from 'path';
import { InitialCore, filterPassword } from './configs/core-global';
import { appSettings } from './configs/app-settings';

import cors from '@fastify/cors';

declare global {
    var filterPassword: any;
}

global.filterPassword = filterPassword;

function writeFatalLog(type: string, error: any) {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    const date = new Date();
    const logFile = path.join(logsDir, `${date.toISOString().slice(0, 10)}.log`);
    const logLine = `[${date.toISOString()}] [${type}] ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n`;
    fs.appendFileSync(logFile, logLine, { encoding: 'utf8' });
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    writeFatalLog('uncaughtException', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    writeFatalLog('unhandledRejection', { reason, promise });
    process.exit(1);
});

const app = Fastify();

app.register(cors, {
    origin: (origin, callback) => {
        // Allow all origins
        callback(null, true);
    },
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD', 'TRACE', 'CONNECT'],
    allowedHeaders: '*', // Accept all headers
    credentials: true
});

app.get('/', async (request, reply) => {
    return { message: 'Hello, Mongorest lib!' };
});

const setupRoutes = async () => {
    // Register routes with prefix if configured
    if (appSettings.prefixApi) {
        await app.register(async function (fastify) {
            IndexRoute(fastify);
        }, { prefix: appSettings.prefixApi });
    } else {
        IndexRoute(app);
    }
};

const start = async () => {
    try {
        // Load all schemas from schemas folder and subfolders
        await InitialCore();
        
        // Setup routes with prefix
        await setupRoutes();
        
        const port = parseInt(appSettings.port || '3000');
        await app.listen({ port });
        console.log(`Server is running on http://localhost:${port}`);
        if (appSettings.prefixApi) {
            console.log(`API endpoints available at: http://localhost:${port}${appSettings.prefixApi}`);
        }
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();