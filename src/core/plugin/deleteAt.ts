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
    throw new Error("Unsafe date expression");
  }

  // Replace Date.now() with actual timestamp
  const now = Date.now();
  const safeExpr = expr.replace(/Date\.now\(\)/g, now.toString());

  // Use Function constructor as a safer alternative to eval for simple math
  try {
    return new Function("return " + safeExpr)();
  } catch (error) {
    throw new Error("Invalid date expression");
  }
}

export function deleteAt(
  data: any,
  date: string = new Date(Date.now()).toISOString()
): any {
  console.log(date);

  if (!isISOString(date) && !isSafeDateExpression(date)) {
    throw new Error(
      "Invalid date format. Use ISO string or safe date expression."
    );
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

  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => deleteAt(item, date));
    } else {
      return {
        ...data,
        deletedAt: date,
        isDeleted: true,
      };
    }
  }
  return data;
}

console.log(deleteAt({ name: "Test" })); // { name: "Test", deletedAt: "2023-10-01T00:00:00.000Z", isDeleted: true }
console.log(deleteAt([{ name: "Test1" }, { name: "Test2" }]));
// [{ name: "Test1", deletedAt: "2023-10-01T00:00:00.000Z", isDeleted: true }, { name: "Test2", deletedAt: "2023-10-01T00:00:00.000Z", isDeleted: true }]