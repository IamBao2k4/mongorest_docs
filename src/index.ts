import Fastify from 'fastify';
import { IndexRoute } from './routes/_index';
import { registerGlobalErrorHandler } from './common/exceptions/global.exception';
import { responseInterceptor } from './common/interceptors/response.interceptor';
import * as fs from 'fs';
import * as path from 'path';

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

app.addHook('onSend', responseInterceptor);

app.get('/', async (request, reply) => {
    return { message: 'Hello, Mongorest lib!' };
});

registerGlobalErrorHandler(app); 
IndexRoute(app);

const start = async () => {
    try {
        await app.listen({ port: 3000 });
        console.log('Server is running on http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();