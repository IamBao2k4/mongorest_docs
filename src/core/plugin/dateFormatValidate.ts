export function isISOString(str: string) {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return isoRegex.test(str);
}

export function isSafeDateExpression(str: string) {
  const dateExprRegex = /^Date\.now\(\)\s*(?:[+\-])\s*[\d\s*()+\-*/.]+$/;
  return dateExprRegex.test(str);
}

export function evaluateSafeDateExpression(expr: string): number {
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