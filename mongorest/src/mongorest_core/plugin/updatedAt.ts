import { isISOString, isSafeDateExpression, evaluateSafeDateExpression } from "./dateFormatValidate";

export function updatedAt(data: any, date: string = new Date(Date.now()).toISOString()): any {
    if(!isISOString(date) && !isSafeDateExpression(date)) {
        throw new Error('Invalid date format. Use ISO string or safe date expression.');
    }
    
    let dateValue: Date;
    if (isSafeDateExpression(date)) {
        const timestamp = evaluateSafeDateExpression(date);
        dateValue = new Date(timestamp);
    } else {
        dateValue = new Date(date);
    }
    
    date = dateValue.toISOString();

    if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
            return data.map(item => updatedAt(item, date));
        } else {
            return {
                ...data,
                updatedAt: date,
            };
        }
    }
    return data;
}