import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

function ButtonSearch({ textSearch, onChangeTextSearch, onEnter }) {
  return (
    <Input
      id='search-input'
      placeholder={'Nhập nội dung tìm kiếm...'}
      value={textSearch}
      className='max-w-[400px] !border-none !shadow-none !outline-none !ring-0'
      onChange={(e) => onChangeTextSearch(e.target.value ? e.target.value : undefined)}
      onPressEnter={onEnter}
      prefix={<Search className='w-4 h-4' />}
    />
  );
}

export default ButtonSearch;
