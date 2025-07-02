import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useProject } from '@/context/ProjectContext';

const LanguageSwitcher = () => {
  const { lang, changeLanguage } = useProject();

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className='language-switcher'>
      <Select
        value={lang}
        onValueChange={changeLanguage}>
        <SelectTrigger className='w-full'>
          <SelectValue>
            {lang === 'vi' ? '🇻🇳' : '🇺🇸'}
            <span className='uppercase pl-2'>{lang}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}>
              <div className='flex items-center gap-2'>
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
