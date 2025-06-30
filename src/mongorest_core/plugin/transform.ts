type TransformFunction = (value: any) => any;

interface TransformRule {
  from: string;
  to: string;
  transform?: TransformFunction;
}

interface TransformConfig {
  rename?: TransformRule[];
  pick?: string[];
  omit?: string[];
  defaults?: { [key: string]: any };
  computed?: { [key: string]: (data: any) => any };
}

function renameFields(data: any, rules: TransformRule[]): any {
  const result = { ...data };
  
  for (const rule of rules) {
    if (result.hasOwnProperty(rule.from)) {
      const value = rule.transform ? rule.transform(result[rule.from]) : result[rule.from];
      result[rule.to] = value;
      
      if (rule.from !== rule.to) {
        delete result[rule.from];
      }
    }
  }
  
  return result;
}

function pickFields(data: any, fields: string[]): any {
  const result: any = {};
  
  for (const field of fields) {
    if (data.hasOwnProperty(field)) {
      result[field] = data[field];
    }
  }
  
  return result;
}

function omitFields(data: any, fields: string[]): any {
  const result = { ...data };
  
  for (const field of fields) {
    delete result[field];
  }
  
  return result;
}

function applyDefaults(data: any, defaults: { [key: string]: any }): any {
  const result = { ...data };
  
  for (const [key, value] of Object.entries(defaults)) {
    if (result[key] === undefined || result[key] === null) {
      result[key] = typeof value === 'function' ? value() : value;
    }
  }
  
  return result;
}

function addComputedFields(data: any, computed: { [key: string]: (data: any) => any }): any {
  const result = { ...data };
  
  for (const [key, computeFn] of Object.entries(computed)) {
    result[key] = computeFn(data);
  }
  
  return result;
}

export function transform(data: any, config: TransformConfig): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => transform(item, config));
    } else {
      let result = { ...data };

      // Apply defaults first
      if (config.defaults) {
        result = applyDefaults(result, config.defaults);
      }

      // Rename fields
      if (config.rename) {
        result = renameFields(result, config.rename);
      }

      // Pick specific fields
      if (config.pick) {
        result = pickFields(result, config.pick);
      }

      // Omit specific fields
      if (config.omit) {
        result = omitFields(result, config.omit);
      }

      // Add computed fields
      if (config.computed) {
        result = addComputedFields(result, config.computed);
      }

      return result;
    }
  }
  return data;
}

export function mapFields(
  data: any,
  fieldMap: { [oldField: string]: string | TransformFunction }
): any {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => mapFields(item, fieldMap));
    } else {
      const result: any = {};

      for (const [oldField, newFieldOrTransform] of Object.entries(fieldMap)) {
        if (data.hasOwnProperty(oldField)) {
          if (typeof newFieldOrTransform === 'string') {
            result[newFieldOrTransform] = data[oldField];
          } else if (typeof newFieldOrTransform === 'function') {
            result[oldField] = newFieldOrTransform(data[oldField]);
          }
        }
      }

      return result;
    }
  }
  return data;
}

export function flattenObject(data: any, prefix: string = '', separator: string = '.'): any {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const result: any = {};

    for (const [key, value] of Object.entries(data)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value, newKey, separator));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }
  return data;
}

// Example usage
console.log(transform({
  first_name: "John",
  last_name: "Doe",
  age: 30,
  password: "secret"
}, {
  rename: [
    { from: 'first_name', to: 'firstName' },
    { from: 'last_name', to: 'lastName' }
  ],
  omit: ['password'],
  defaults: { status: 'active' },
  computed: {
    fullName: (data) => `${data.firstName || data.first_name} ${data.lastName || data.last_name}`,
    isAdult: (data) => data.age >= 18
  }
}));
// { firstName: "John", lastName: "Doe", age: 30, status: "active", fullName: "John Doe", isAdult: true }

console.log(flattenObject({
  user: {
    profile: {
      name: "John",
      age: 30
    },
    settings: {
      theme: "dark"
    }
  }
}));
// { "user.profile.name": "John", "user.profile.age": 30, "user.settings.theme": "dark" }