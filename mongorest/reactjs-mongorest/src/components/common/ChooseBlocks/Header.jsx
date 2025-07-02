'use client';

import { useCommon } from '@/context/CommonContext';
import { Button } from '@/components/ui/Button';

function Header({ selects, setSelects, handleShowTableAdd }) {
  const { blockCopy, setBlockCopy } = useCommon();

  const setBlockCopyStore = (val) => {
    if (typeof window === 'undefined') return;
    return localStorage.setItem('block-copy', JSON.stringify(val));
  };

  return (
    <div className='flex items-center justify-between'>
      <h4 className='text-xl'>Blocks</h4>
      <div className='flex gap-2'>
        {blockCopy?.length ? (
          <Button
            className='w-[120px]'
            onClick={() => setSelects((prev) => [...prev, ...blockCopy])}>
            Paste
          </Button>
        ) : null}
        {selects?.length ? (
          <Button
            className='w-[120px]'
            onClick={() => {
              setBlockCopy(JSON.parse(JSON.stringify(selects)));
              setBlockCopyStore(JSON.parse(JSON.stringify(selects)));
            }}>
            Copy
          </Button>
        ) : null}
        <Button
          className='w-[120px]'
          onClick={handleShowTableAdd}>
          Thêm Block
        </Button>
      </div>
    </div>
  );
}

export default Header;
