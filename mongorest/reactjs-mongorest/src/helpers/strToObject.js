export default function parse(text) {
  if (typeof text !== 'string') {
    return text;
  }
  try {
    let json = JSON.parse(text);
    if (typeof json === 'object') return json;
  } catch (error) {
    return text;
  }
}
