function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function sanitizeString(str: string, options: SanitizeOptions = {}): string {
  if (typeof str !== 'string') return str;

  let result = str;

  if (options.trim !== false) {
    result = result.trim();
  }

  if (options.stripHtml) {
    result = stripHtml(result);
  }

  if (options.escapeHtml) {
    result = escapeHtml(result);
  }

  if (options.removeSpecialChars) {
    result = result.replace(/[^\w\s-]/g, '');
  }

  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  if (options.toLowerCase) {
    result = result.toLowerCase();
  }

  if (options.toUpperCase) {
    result = result.toUpperCase();
  }

  return result;
}

function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return email;
  
  return email.toLowerCase().trim();
}

function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') return phone;
  
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

function removeEmptyValues(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.filter(item => item !== null && item !== undefined && item !== '');
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
    return result;
  }
  
  return obj;
}

interface SanitizeOptions {
  trim?: boolean;
  stripHtml?: boolean;
  escapeHtml?: boolean;
  removeSpecialChars?: boolean;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
}

interface SanitizeConfig {
  [fieldName: string]: SanitizeOptions | 'email' | 'phone' | 'removeEmpty';
}

export function sanitize(
  data: any,
  config: SanitizeConfig = {}
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => sanitize(item, config));
    } else {
      const result = { ...data };

      for (const [fieldName, options] of Object.entries(config)) {
        if (result[fieldName] !== undefined) {
          if (options === 'email') {
            result[fieldName] = sanitizeEmail(result[fieldName]);
          } else if (options === 'phone') {
            result[fieldName] = sanitizePhoneNumber(result[fieldName]);
          } else if (options === 'removeEmpty') {
            result[fieldName] = removeEmptyValues(result[fieldName]);
          } else if (typeof options === 'object') {
            result[fieldName] = sanitizeString(result[fieldName], options);
          }
        }
      }

      return result;
    }
  }
  return data;
}

export function sanitizeAll(
  data: any,
  globalOptions: SanitizeOptions = { trim: true, escapeHtml: true }
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => sanitizeAll(item, globalOptions));
    } else {
      const result = { ...data };
      
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string') {
          result[key] = sanitizeString(value, globalOptions);
        }
      }
      
      return result;
    }
  }
  return data;
}

console.log(sanitize({ 
  name: "  <script>alert('xss')</script>John  ",
  email: "  JOHN@EXAMPLE.COM  ",
  phone: "+1 (555) 123-4567"
}, {
  name: { trim: true, stripHtml: true },
  email: 'email',
  phone: 'phone'
}));
// { name: "John", email: "john@example.com", phone: "15551234567" }

console.log(sanitizeAll({ 
  title: "  Hello <b>World</b>!  ",
  content: "  Some content  "
}));
// { title: "Hello &lt;b&gt;World&lt;/b&gt;!", content: "Some content" }