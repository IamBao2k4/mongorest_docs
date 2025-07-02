import { coreGlobal } from '../../configs/core-global';

class TenantService {
    constructor() { 
        console.log('CommonService Initialized');
    }

    async getTenantById(tenantId: string) {
        return await coreGlobal.findById(
            'tenant',
            tenantId,
            ['default'],
            'mongodb'
        );
    }
}

export const tenantService = new TenantService();
