import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file ngôn ngữ
import en from './locales/en/translation.json';
import vi from './locales/vi/translation.json';

// Danh sách ngôn ngữ được hỗ trợ
export const supportedLanguages = ['en', 'vi'];
export const defaultLanguage = 'vi';

// Custom language detector để ưu tiên URL
const urlLanguageDetector = {
  name: 'urlLanguageDetector',

  lookup() {
    // Lấy ngôn ngữ từ URL path
    const pathname = window.location.pathname;
    const langFromUrl = pathname.split('/')[1];

    // Kiểm tra nếu ngôn ngữ trong URL có hợp lệ
    if (supportedLanguages.includes(langFromUrl)) {
      return langFromUrl;
    }

    return null;
  },

  cacheUserLanguage(lng) {
    // Lưu ngôn ngữ vào localStorage
    localStorage.setItem('i18nextLng', lng);
  },
};

i18n
  // Thêm custom detector
  .use({
    type: 'languageDetector',
    async: false,
    detect: urlLanguageDetector.lookup,
    init: () => {},
    cacheUserLanguage: urlLanguageDetector.cacheUserLanguage,
  })
  // Sử dụng browser language detector như fallback
  .use(LanguageDetector)
  // Khởi tạo react-i18next
  .use(initReactI18next)
  // Cấu hình
  .init({
    resources: {
      en: {
        translation: en,
      },
      vi: {
        translation: vi,
      },
    },

    // Ngôn ngữ mặc định
    fallbackLng: defaultLanguage,

    // Ngôn ngữ được hỗ trợ
    supportedLngs: supportedLanguages,

    // Debug mode
    debug: false,

    // Interpolation options
    interpolation: {
      escapeValue: false,
    },

    // Detection options
    detection: {
      // Thứ tự ưu tiên: URL -> localStorage -> browser
      order: ['urlLanguageDetector', 'localStorage', 'navigator'],

      // Cache ngôn ngữ
      caches: ['localStorage'],

      // Key localStorage
      lookupLocalStorage: 'i18nextLng',

      // Không convert country code
      convertDetectedLanguage: (lng) => {
        // Chỉ lấy language code (en thay vì en-US)
        return lng.split('-')[0];
      },
    },
  });

export default i18n;
