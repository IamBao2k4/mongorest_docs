import Fastify from 'fastify';
import { IndexRoute } from './routes/_index';
import { registerGlobalErrorHandler } from './common/exceptions/global.exception';
import { responseInterceptor } from './common/interceptors/response.interceptor';
import { SchemaLoader } from './core/schema/loader';
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

const loadSchemasFromSubfolders = async (schemasPath: string) => {
    const allSchemas = new Map();
    
    // Load from collections folder
    const collectionsPath = path.join(schemasPath, 'collections');
    if (fs.existsSync(collectionsPath)) {
        console.log(`Loading collections from: ${collectionsPath}`);
        const collectionSchemas = await SchemaLoader.loadAllSchemas(collectionsPath, "collections");
        console.log(`Found ${collectionSchemas.size} collection schemas:`, Array.from(collectionSchemas.keys()));
        
        // Merge into allSchemas
        for (const [key, value] of collectionSchemas) {
            allSchemas.set(key, value);
        }
    }
    
    // Load from functions folder  
    const functionsPath = path.join(schemasPath, 'functions');
    if (fs.existsSync(functionsPath)) {
        console.log(`Loading functions from: ${functionsPath}`);
        const functionSchemas = await SchemaLoader.loadAllSchemas(functionsPath, "functions");
        console.log(`Found ${functionSchemas.size} function schemas:`, Array.from(functionSchemas.keys()));
        
        // Merge into allSchemas
        for (const [key, value] of functionSchemas) {
            allSchemas.set(key, value);
        }
    }

    const rbacPath = path.join(schemasPath, 'rbac');
    if (fs.existsSync(rbacPath)) {
        console.log(`Loading RBAC schemas from: ${rbacPath}`);
        const rbacSchemas = await SchemaLoader.loadAllSchemas(rbacPath, "rbac");
        console.log(`Found ${rbacSchemas.size} RBAC schemas:`, Array.from(rbacSchemas.keys()));
        
        // Merge into allSchemas
        for (const [key, value] of rbacSchemas) {
            allSchemas.set(key, value);
        }
    }
    
    return allSchemas;
};

const start = async () => {
    try {
        // Load all schemas from schemas folder and subfolders
        const schemasPath = path.join(__dirname, 'schemas');
        
        if (!fs.existsSync(schemasPath)) {
            console.log(`Schemas directory not found: ${schemasPath}`);
            console.log('Creating schemas directory structure...');
            
            // Create folder structure
            fs.mkdirSync(path.join(schemasPath, 'collections'), { recursive: true });
            fs.mkdirSync(path.join(schemasPath, 'functions'), { recursive: true });
            fs.mkdirSync(path.join(schemasPath, 'rbac'), { recursive: true });
            
            console.log('Schemas directory structure created');
        }
        
        const schemas = await loadSchemasFromSubfolders(schemasPath);
        console.log(`Total loaded ${schemas.size} schemas:`, Array.from(schemas.keys()));
        
        await app.listen({ port: 3000 });
        console.log('Server is running on http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();