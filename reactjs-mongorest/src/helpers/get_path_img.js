// NOTE: Main
export const get_path_img = (image = '') => {
  if (!image || image === '[]') return '';

  if (typeof image === 'string') {
    try {
      const i = JSON.parse(image)[0];
      return check_path_string(i?.path) || '/images/notFound.jpg';
    } catch (err) {}

    if (check_path_string(image)) {
      return check_path_string(image) || '/images/notFound.jpg';
    }
  }

  try {
    // NOTE: Nếu là array, lấy data => object
    if (Array.isArray(image) && image?.length > 0) {
      image = image[0];
    }

    // NOTE: Trường hợp data là object
    if (typeof image === 'object') {
      // NOTE: Trường hợp FILE
      return check_path_string(image?.path) || '';
    }
  } catch (error) {
    return image || '';
  }
};

// NOTE: Check link cos http or có media đầu
function check_path_string(path) {
  if (!path || path === '[]') return '';

  const domain = import.meta.env.VITE_MINIO_CDN + '/' + import.meta.env.VITE_MINIO_BUCKET;

  const replace_media = import.meta.env.VITE_REPLACE_MEDIA || '/media/';
  const replace_files = import.meta.env.VITE_REPLACE_FILE || '/files/';

  if (path.search(replace_media) !== -1) {
    return domain + replace_media + path.split(replace_media)?.[1];
  }

  if (path.search(replace_files) !== -1) {
    return domain + replace_files + path.split(replace_files)?.[1];
  }

  if (path.search('media/') === 0 || path.search('files/') === 0) {
    return domain + '/' + path;
  }

  if (path.startsWith('https://') || path.startsWith('/images/')) {
    return path;
  }
  return null;
}
