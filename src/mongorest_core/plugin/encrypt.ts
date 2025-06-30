import * as crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

function encryptData(text: string, key: string): { encrypted: string; iv: string; tag: string } {
  if (!text || typeof text !== 'string') {
    throw new Error('Text to encrypt must be a non-empty string');
  }

  if (!key || key.length !== KEY_LENGTH * 2) {
    throw new Error(`Encryption key must be ${KEY_LENGTH * 2} characters long`);
  }

  const iv = generateIV();
  const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, Buffer.from(key, 'hex'));
  cipher.setAAD(Buffer.from('additional'));

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: authTag.toString('hex')
  };
}

function decryptData(encryptedData: string, key: string, iv: string, tag: string): string {
  if (!encryptedData || !key || !iv || !tag) {
    throw new Error('All encryption parameters are required for decryption');
  }

  try {
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, Buffer.from(key, 'hex'));
    decipher.setAAD(Buffer.from('additional'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data: Invalid key or corrupted data');
  }
}

function simpleEncrypt(text: string, password: string): string {
  const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
  const iv = generateIV();
  const cipher = crypto.createCipher('aes-256-cbc', key);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

function simpleDecrypt(encryptedText: string, password: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
  const decipher = crypto.createDecipher('aes-256-cbc', key);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function encryptFields(
  data: any,
  fields: string[],
  key: string,
  storeMetadata: boolean = true
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => encryptFields(item, fields, key, storeMetadata));
    } else {
      const result = { ...data };
      const metadata: any = {};

      for (const field of fields) {
        if (result[field] && typeof result[field] === 'string') {
          const encrypted = encryptData(result[field], key);
          result[field] = encrypted.encrypted;

          if (storeMetadata) {
            metadata[`${field}_iv`] = encrypted.iv;
            metadata[`${field}_tag`] = encrypted.tag;
          }
        }
      }

      if (storeMetadata && Object.keys(metadata).length > 0) {
        result._encryption = metadata;
      }

      return result;
    }
  }
  return data;
}

export function decryptFields(
  data: any,
  fields: string[],
  key: string
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => decryptFields(item, fields, key));
    } else {
      const result = { ...data };
      const metadata = result._encryption || {};

      for (const field of fields) {
        if (result[field] && typeof result[field] === 'string') {
          const iv = metadata[`${field}_iv`];
          const tag = metadata[`${field}_tag`];

          if (iv && tag) {
            try {
              result[field] = decryptData(result[field], key, iv, tag);
            } catch (error) {
              console.error(`Failed to decrypt field ${field}:`, error);
            }
          }
        }
      }

      delete result._encryption;
      return result;
    }
  }
  return data;
}

export function simpleEncryptFields(
  data: any,
  fields: string[],
  password: string
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => simpleEncryptFields(item, fields, password));
    } else {
      const result = { ...data };

      for (const field of fields) {
        if (result[field] && typeof result[field] === 'string') {
          result[field] = simpleEncrypt(result[field], password);
        }
      }

      return result;
    }
  }
  return data;
}

export function simpleDecryptFields(
  data: any,
  fields: string[],
  password: string
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => simpleDecryptFields(item, fields, password));
    } else {
      const result = { ...data };

      for (const field of fields) {
        if (result[field] && typeof result[field] === 'string') {
          try {
            result[field] = simpleDecrypt(result[field], password);
          } catch (error) {
            console.error(`Failed to decrypt field ${field}:`, error);
          }
        }
      }

      return result;
    }
  }
  return data;
}

export { generateKey };

// Example usage
const encryptionKey = generateKey();
console.log('Generated key:', encryptionKey);

const userData = { name: "John Doe", email: "john@example.com", ssn: "123-45-6789" };
const encrypted = encryptFields(userData, ['email', 'ssn'], encryptionKey);
console.log('Encrypted:', encrypted);

const decrypted = decryptFields(encrypted, ['email', 'ssn'], encryptionKey);
console.log('Decrypted:', decrypted);