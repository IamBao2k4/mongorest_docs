function normalizeString(str: string): string {
  if (typeof str !== 'string') return str;
  
  return str
    .normalize('NFD') // Decompose
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim();
}

function normalizeEmail(email: string): string {
  if (typeof email !== 'string') return email;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  // Normalize local part (remove dots for Gmail, etc.)
  let normalizedLocal = localPart.toLowerCase();
  
  // For Gmail, remove dots and everything after +
  if (domain.toLowerCase().includes('gmail')) {
    normalizedLocal = normalizedLocal.replace(/\./g, '').split('+')[0];
  }
  
  return `${normalizedLocal}@${domain.toLowerCase()}`;
}

function normalizePhoneNumber(phone: string, countryCode: string = '+1'): string {
  if (typeof phone !== 'string') return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (!digits.startsWith(countryCode.replace('+', ''))) {
    return `${countryCode}${digits}`;
  }
  
  return `+${digits}`;
}

function normalizeUrl(url: string): string {
  if (typeof url !== 'string') return url;
  
  try {
    const urlObj = new URL(url);
    
    // Normalize protocol to lowercase
    urlObj.protocol = urlObj.protocol.toLowerCase();
    
    // Normalize hostname to lowercase
    urlObj.hostname = urlObj.hostname.toLowerCase();
    
    // Remove default ports
    if ((urlObj.protocol === 'http:' && urlObj.port === '80') ||
        (urlObj.protocol === 'https:' && urlObj.port === '443')) {
      urlObj.port = '';
    }
    
    // Remove trailing slash
    if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

function normalizeDate(date: string | Date): string {
  if (!date) return date as string;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date as string;
    
    return dateObj.toISOString();
  } catch (error) {
    return date as string;
  }
}

function normalizeNumber(num: any): number | string {
  if (typeof num === 'number') return num;
  if (typeof num !== 'string') return num;
  
  // Remove thousands separators and convert
  const cleanNum = num.replace(/[,\s]/g, '');
  const parsed = parseFloat(cleanNum);
  
  return isNaN(parsed) ? num : parsed;
}

interface NormalizeConfig {
  [fieldName: string]: 'string' | 'email' | 'phone' | 'url' | 'date' | 'number' | {
    type: 'string' | 'email' | 'phone' | 'url' | 'date' | 'number';
    options?: any;
  };
}

export function normalize(
  data: any,
  config: NormalizeConfig = {}
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => normalize(item, config));
    } else {
      const result = { ...data };

      for (const [fieldName, normalizeType] of Object.entries(config)) {
        if (result[fieldName] !== undefined) {
          const fieldValue = result[fieldName];
          
          if (typeof normalizeType === 'string') {
            switch (normalizeType) {
              case 'string':
                result[fieldName] = normalizeString(fieldValue);
                break;
              case 'email':
                result[fieldName] = normalizeEmail(fieldValue);
                break;
              case 'phone':
                result[fieldName] = normalizePhoneNumber(fieldValue);
                break;
              case 'url':
                result[fieldName] = normalizeUrl(fieldValue);
                break;
              case 'date':
                result[fieldName] = normalizeDate(fieldValue);
                break;
              case 'number':
                result[fieldName] = normalizeNumber(fieldValue);
                break;
            }
          } else if (typeof normalizeType === 'object') {
            const { type, options } = normalizeType;
            
            switch (type) {
              case 'phone':
                result[fieldName] = normalizePhoneNumber(fieldValue, options?.countryCode);
                break;
              default:
                // Apply other normalization types with options
                break;
            }
          }
        }
      }

      return result;
    }
  }
  return data;
}

export function normalizeAll(
  data: any,
  options: { strings?: boolean; emails?: boolean; phones?: boolean; urls?: boolean; dates?: boolean; numbers?: boolean } = {}
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => normalizeAll(item, options));
    } else {
      const result = { ...data };
      
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string') {
          // Try to detect and normalize different types
          if (options.emails !== false && value.includes('@')) {
            result[key] = normalizeEmail(value);
          } else if (options.phones !== false && /[\d\-\+\(\)\s]{10,}/.test(value)) {
            result[key] = normalizePhoneNumber(value);
          } else if (options.urls !== false && (value.startsWith('http') || value.startsWith('www'))) {
            result[key] = normalizeUrl(value);
          } else if (options.dates !== false && !isNaN(Date.parse(value))) {
            result[key] = normalizeDate(value);
          } else if (options.strings !== false) {
            result[key] = normalizeString(value);
          }
        } else if (options.numbers !== false && (typeof value === 'string' || typeof value === 'number')) {
          const normalized = normalizeNumber(value);
          if (normalized !== value) {
            result[key] = normalized;
          }
        }
      }
      
      return result;
    }
  }
  return data;
}

export function removeWhitespace(data: any): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => removeWhitespace(item));
    } else {
      const result = { ...data };
      
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string') {
          result[key] = value.replace(/\s+/g, ' ').trim();
        }
      }
      
      return result;
    }
  }
  return data;
}

console.log(normalize({
  name: "  Nguyễn Văn A  ",
  email: "Test.User+label@Gmail.com",
  phone: "(555) 123-4567",
  website: "https://Example.com/",
  joinDate: "2023-12-01T10:30:00Z"
}, {
  name: 'string',
  email: 'email',
  phone: 'phone',
  website: 'url',
  joinDate: 'date'
}));
// { name: "nguyen van a", email: "testuser@gmail.com", phone: "+15551234567", website: "https://example.com", joinDate: "2023-12-01T10:30:00.000Z" }

console.log(normalizeAll({
  title: "  HELLO WORLD  ",
  contact: "john.doe+test@gmail.com",
  phone: "1-555-123-4567"
}));
// Auto-detects and normalizes different field types