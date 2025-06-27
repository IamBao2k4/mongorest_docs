export default function getHeaderDefault(key) {
  if (typeof window === 'undefined') return null;
  key = key.replace('/', '');
  let headerDefault = null;

  if (localStorage.getItem('header-custom')) {
    headerDefault = JSON.parse(localStorage.getItem('header-custom'))['header-custom/' + key];
  }

  return headerDefault;
}
