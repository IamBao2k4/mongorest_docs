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

const loadSchemasFromSubfolders = async (schemasPath: string) => {
    const allSchemas = new Map();
    
    // Load from collections folder
    const collectionsPath = path.join(schemasPath, 'collections');
    if (fs.existsSync(collectionsPath)) {
        console.log(`Loading collections from: ${collectionsPath}`);
        // TODO: Restore schema loading when SchemaLoader is reimplemented
        // const collectionSchemas = await SchemaLoader.loadAllSchemas(collectionsPath, "collections");
        // console.log(`Found ${collectionSchemas.size} collection schemas:`, Array.from(collectionSchemas.keys()));
        // 
        // // Merge into allSchemas
        // for (const [key, value] of collectionSchemas) {
        //     allSchemas.set(key, value);
        // }
    }
    
    // Load from functions folder  
    const functionsPath = path.join(schemasPath, 'functions');
    if (fs.existsSync(functionsPath)) {
        console.log(`Loading functions from: ${functionsPath}`);
        // TODO: Restore schema loading when SchemaLoader is reimplemented
        // const functionSchemas = await SchemaLoader.loadAllSchemas(functionsPath, "functions");
        // console.log(`Found ${functionSchemas.size} function schemas:`, Array.from(functionSchemas.keys()));
        // 
        // // Merge into allSchemas
        // for (const [key, value] of functionSchemas) {
        //     allSchemas.set(key, value);
        // }
    }

    const rbacPath = path.join(schemasPath, 'rbac');
    if (fs.existsSync(rbacPath)) {
        console.log(`Loading RBAC schemas from: ${rbacPath}`);
        // TODO: Restore schema loading when SchemaLoader is reimplemented
        // const rbacSchemas = await SchemaLoader.loadAllSchemas(rbacPath, "rbac");
        // console.log(`Found ${rbacSchemas.size} RBAC schemas:`, Array.from(rbacSchemas.keys()));
        // 
        // // Merge into allSchemas
        // for (const [key, value] of rbacSchemas) {
        //     allSchemas.set(key, value);
        // }
    }
    
    return allSchemas;
};



const start = async () => {
    try {
        // Load all schemas from schemas folder and subfolders
        await InitialCore();
        
        // Setup routes with prefix
        await setupRoutes();
        
        // const schemasPath = path.join(__dirname, 'schemas');
        
        // if (!fs.existsSync(schemasPath)) {
        //     console.log(`Schemas directory not found: ${schemasPath}`);
        //     console.log('Creating schemas directory structure...');
            
        //     // Create folder structure
        //     fs.mkdirSync(path.join(schemasPath, 'collections'), { recursive: true });
        //     fs.mkdirSync(path.join(schemasPath, 'functions'), { recursive: true });
        //     fs.mkdirSync(path.join(schemasPath, 'rbac'), { recursive: true });
            
        //     console.log('Schemas directory structure created');
        // }
        
        // const schemas = await loadSchemasFromSubfolders(schemasPath);
        // console.log(`Total loaded ${schemas.size} schemas:`, Array.from(schemas.keys()));
        
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