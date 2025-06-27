import nestedProperty from 'nested-property';

/**
 * Validate a string is a URL
 * @param {String} url
 * @returns Boolean
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export function hasQueryParams(url) {
  try {
    const urlObject = new URL(url);
    return urlObject.searchParams.size > 0;
  } catch (error) {
    return false;
  }
}

/**
 *
 * @param {String} url
 * @returns
 */
export function extractQueryParameters(url) {
  const queryParameters = new Map();
  const urlObject = new URL(url);
  const searchParams = urlObject.searchParams;
  for (const [key, value] of searchParams.entries()) {
    queryParameters.set(key, value);
  }

  return queryParameters;
}

/**
 *
 * @param {Map<string | number, any>} map
 * @returns Object
 */
export function mapToObject(map) {
  if (!map) return {};
  const obj = {};
  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}

/**
 *
 * @param {string} url
 * @param {string} key
 * @param {any} newValue
 * @returns string
 */
export function replaceQueryParam(url, key, newValue) {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  if (params.has(key)) {
    params.set(key, newValue);
  } else {
    params.append(key, newValue);
  }

  urlObj.search = params.toString();
  return decodeBraces(urlObj.toString());
}

function decodeBraces(encodedString) {
  const decodedString = encodedString.replace(/%7B/g, '{').replace(/%7D/g, '}');

  return decodedString;
}

/**
 *
 * @param {string} inputString
 * @returns string[]
 */
export function extractValueBetweenBraces(inputString) {
  const regex = /{{(.*?)}}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(inputString))) {
    matches.push(match[1]);
  }

  return matches;
}

/**
 * Get all value of item's key from array
 * @param {any[]} array
 * @param {String} key
 */
export function getValuesByKey(array, key) {
  return array.map((item) => item?.[key]).filter((item) => Boolean(item));
}

export function isMultipleCall(params) {
  return params?.type === 'array' && params?.loop;
}

export function isSingleCall(params) {
  return params?.type === 'array' && !params?.loop;
}

export function getApiDataByRootId(data, params) {
  const root_id = params?.root_id;
  return data?.[root_id];
}

/**
 * Replaces URL path placeholders with values from the data object.
 * @param {Object} data - The data object containing key-value pairs.
 * @param {string} url - The URL path with placeholders.
 * @returns {string} - The URL with placeholders replaced by values.
 */
export function replacePathWithValue(data, url, paramsObject) {
  let isLoop = false;
  if (!isValidURL(url)) return url;
  let replacedUrl = new URL(url);
  const urls = [];
  const searchParams = replacedUrl.searchParams;
  for (const [key, value] of searchParams.entries()) {
    const params = paramsObject?.[key];
    if (params) {
      if (isMultipleCall(params)) {
        isLoop = true;
      }

      const apiData = getApiDataByRootId(data, params);
      const mappingKey = `${extractValueBetweenBraces(value)[0]}`;

      if (isLoop && Array.isArray(apiData)) {
        apiData.forEach((item, index) => {
          let _url = new URL(url);
          const _searchParams = _url.searchParams;
          let mappingData = nestedProperty.get(item, mappingKey);
          _searchParams.set(key, mappingData);
          if (urls?.length > 0) {
            urls[index] = _url;
          } else {
            urls.push(_url);
          }
        });
      } else {
        let mappingData = nestedProperty.get(apiData, mappingKey);
        if (urls.length > 0) {
          urls.forEach((_url) => {
            const _searchParams = _url.searchParams;
            _searchParams.set(key, mappingData);
          });
        } else {
          if (isSingleCall(params) && Array.isArray(apiData)) {
            // const selectedData = getValuesByKey(apiData);
            // const paramValue = [...new Set(selectedData)].join(',');
            const paramValue = apiData.join(',');
            searchParams.set(key, paramValue);
          } else {
            searchParams.set(key, mappingData);
          }
        }
      }
    }
  }
  return urls.length > 0 ? urls.map((u) => u?.toString()) : replacedUrl.toString();
}
