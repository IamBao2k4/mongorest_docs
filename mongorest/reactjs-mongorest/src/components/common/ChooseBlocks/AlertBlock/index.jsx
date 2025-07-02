'use client';

import { Button } from '@/components/ui/Button';
import clsx from 'clsx';
import { useMemo } from 'react';
import { resetObject } from '@/helpers/resetObject';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { PopConfirm } from '@/components/ui/PopConfirm';

function AlertBlock({ selects, setSelects }) {
  const numOfSelectedBlocks = useMemo(
    () => selects.filter((item) => item.isSelected)?.length,
    [selects]
  );

  const handleDelete = () => {
    const newData = selects.filter((item) => !item.isSelected);
    setSelects(newData);
  };

  const handleClone = () => {
    const selectedItems = selects.filter((item) => item.isSelected);
    const cloneItems = [...selectedItems].map((item) => resetObject(item));
    setSelects([...selects, ...cloneItems]);
  };

  return (
    <div
      className={clsx(
        'px-4 py-2 fixed bottom-24 left-[50%] right-[50%] bg-gray-100 rounded-md shadow-md table z-50',
        numOfSelectedBlocks == 0 && 'hidden'
      )}>
      <div className={'flex gap-2'}>
        <Checkbox
          type='checkbox'
          checked
          disabled
          style={{
            width: 'max-content',
            whiteSpace: 'no-wrap',
          }}>{`${numOfSelectedBlocks} item(s)`}</Checkbox>
        <PopConfirm
          title={`Clone ${numOfSelectedBlocks} items?`}
          onConfirm={handleClone}>
          <Button icon={<Trash2 />}>{'Delete'}</Button>
        </PopConfirm>

        <PopConfirm
          title={`Delete ${numOfSelectedBlocks} items?`}
          onConfirm={handleDelete}>
          <Button icon={<Trash2 />}>{'Delete'}</Button>
        </PopConfirm>
      </div>
    </div>
  );
}

export default AlertBlock;
