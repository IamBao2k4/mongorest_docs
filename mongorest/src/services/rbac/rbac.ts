import * as fs from 'fs';
import * as path from 'path';
import { HttpError } from '../../utils/http-error';
import  { NewCore } from '../../mongorest_core/main/newCore';

class RbacService {
    private newCore: NewCore = new NewCore();

    constructor() { 
        console.log('CommonService Initialized');
    }

    public getByCollection(collection_name: string): any {
        return this.newCore.getRbacByCollection(collection_name);
    }

    public getAll(): any {
        return this.newCore.getAllRbac();
    }

    public updateConfig(rbacJson: any): void {
        this.newCore.updateRbacConfig(rbacJson);
    }

    public createConfig(rbacJson: any): void {
        const filePath = path.join(__dirname, '../../schemas/rbac/mongorestrbacjson.json');
        fs.writeFileSync(filePath, JSON.stringify(rbacJson, null, 2), 'utf-8');
        this.newCore.updateRbacConfig(rbacJson);
    }
}

export const rbacService = new RbacService();
