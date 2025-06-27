import * as crypto from 'crypto';

function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashToCompare = hashPassword(password, salt);
  return hash === hashToCompare;
}

function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

export function hashField(
  data: any,
  field: string = 'password',
  saltField: string = 'salt',
  requireStrong: boolean = true
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => hashField(item, field, saltField, requireStrong));
    } else {
      const plainValue = data[field];
      
      if (!plainValue || typeof plainValue !== 'string') {
        throw new Error(`Field '${field}' must be a non-empty string`);
      }

      if (requireStrong && !isStrongPassword(plainValue)) {
        throw new Error(
          `${field} must be at least 8 characters with uppercase, lowercase, number and special character`
        );
      }

      const salt = generateSalt();
      const hashedValue = hashPassword(plainValue, salt);

      return {
        ...data,
        [field]: hashedValue,
        [saltField]: salt,
      };
    }
  }
  return data;
}

export function verifyHash(
  plainValue: string,
  hashedValue: string,
  salt: string
): boolean {
  return verifyPassword(plainValue, hashedValue, salt);
}

export function simpleHash(
  data: any,
  field: string = 'data',
  algorithm: string = 'sha256'
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => simpleHash(item, field, algorithm));
    } else {
      const valueToHash = data[field];
      
      if (!valueToHash) {
        throw new Error(`Field '${field}' not found or empty`);
      }

      const hash = crypto.createHash(algorithm)
        .update(typeof valueToHash === 'string' ? valueToHash : JSON.stringify(valueToHash))
        .digest('hex');

      return {
        ...data,
        [`${field}Hash`]: hash,
      };
    }
  }
  return data;
}

console.log(hashField({ username: "user1", password: "StrongPass123!" }));
// { username: "user1", password: "hashed...", salt: "salt..." }

console.log(simpleHash({ email: "test@example.com" }, 'email'));
// { email: "test@example.com", emailHash: "hash..." }