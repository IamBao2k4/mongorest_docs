import { useProject } from '@/context/ProjectContext';
import { Link as NavLink } from 'react-router-dom';

export function Link({ href, ...props }) {
  const { lang } = useProject();

  // Hàm tạo URL với prefix ngôn ngữ
  const createLocalizedHref = (originalHref) => {
    if (!originalHref) return '#';
    // Nếu href là external link (có http/https), không xử lý
    if (originalHref.startsWith('http://') || originalHref.startsWith('https://')) {
      return originalHref;
    }

    // Nếu href là anchor (#), không xử lý
    if (originalHref.startsWith('#')) {
      return originalHref;
    }

    // Nếu href đã có prefix /en, không cần thêm
    if (originalHref.startsWith('/en/') || originalHref === '/en') {
      return originalHref;
    }

    // Nếu lang là 'en', thêm prefix /en
    if (lang === 'en') {
      // Xử lý case đặc biệt cho root path
      if (originalHref === '/') {
        return '/en';
      }
      // Thêm /en prefix cho các path khác
      return `/en${originalHref}`;
    }

    // Nếu lang là 'vi' hoặc không phải 'en', trả về href gốc
    return originalHref;
  };

  const localizedHref = createLocalizedHref(href);

  return (
    <NavLink
      to={localizedHref}
      {...props}
    />
  );
}
