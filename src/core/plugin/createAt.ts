function isISOString(str: string) {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return isoRegex.test(str);
}

function isSafeDateExpression(str: string) {
  const dateExprRegex = /^Date\.now\(\)\s*(?:[+\-])\s*[\d\s*()+\-*/.]+$/;
  return dateExprRegex.test(str);
}

function evaluateSafeDateExpression(expr: string): number {
  if (!isSafeDateExpression(expr)) {
    throw new Error('Unsafe date expression');
  }
  
  // Replace Date.now() with actual timestamp
  const now = Date.now();
  const safeExpr = expr.replace(/Date\.now\(\)/g, now.toString());
  
  // Use Function constructor as a safer alternative to eval for simple math
  try {
    return new Function('return ' + safeExpr)();
  } catch (error) {
    throw new Error('Invalid date expression');
  }
}


export function createAt(data: any, date: string = new Date(Date.now()).toISOString()): any {
    console.log(date)
    
    if(!isISOString(date) && !isSafeDateExpression(date)) {
        throw new Error('Invalid date format. Use ISO string or safe date expression.');
    }
    
    // If it's a safe date expression, evaluate it; otherwise use it as is
    let dateValue: Date;
    if (isSafeDateExpression(date)) {
        // Safely evaluate the date expression
        const timestamp = evaluateSafeDateExpression(date);
        dateValue = new Date(timestamp);
    } else {
        dateValue = new Date(date);
    }
    
    date = dateValue.toISOString();

    if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
            return data.map(item => createAt(item, date));
        } else {
            return {
                ...data,
                createdAt: date,
            };
        }
    }
    return data;
}

console.log(createAt({ name: "Test" })); // { name: "Test", createdAt: "2023-10-01T00:00:00.000Z" }
console.log(createAt([{ name: "Test1" }, { name: "Test2" }]));
// [{ name: "Test1", createdAt: "2023-10-01T00:00:00.000Z" }, { name: "Test2", createdAt: "2023-10-01T00:00:00.000Z" }]

// valid ISO date
console.log(createAt({ name: "Test" }, "sudo apt update"));