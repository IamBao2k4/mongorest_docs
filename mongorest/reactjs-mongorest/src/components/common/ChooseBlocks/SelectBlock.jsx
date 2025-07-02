'use client';

import { Button } from '@/components/ui/Button';
import { groupFieldsApi } from '@/services';
import ContainerTable from '../ContainerTable';
import { useBlocks } from './context';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet';

function SelectBlock({
  isOpen,
  handleCloseTableAdd,
  handleConfirmAddBlock,
  selectBlock,
  setSelectBlock,
}) {
  const { blocks } = useBlocks();
  const { getGroupFields } = groupFieldsApi();

  const onOk = () => {
    if (selectBlock?.length > 0) {
      const result = [];

      selectBlock.map((item) => {
        if (item in blocks) {
          result.push({
            [item]: {},
          });
        }
      });
      if (result?.length > 0) {
        handleConfirmAddBlock(result);
      }
    }
    handleCloseTableAdd();
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleCloseTableAdd}>
      <SheetContent className='sm:max-w-[70%] overflow-hidden flex flex-col'>
        <SheetHeader className=''>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <SheetTitle>Categories</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </SheetDescription>
            </div>
            <div className={'flex gap-2'}>
              <Button
                onClick={handleCloseTableAdd}
                variant='outline'>
                Hủy
              </Button>
              <Button
                type='primary'
                onClick={onOk}>
                Xác nhận
              </Button>
            </div>
          </div>
        </SheetHeader>
        {isOpen ? (
          <ContainerTable
            entity={'group-field'}
            getData={getGroupFields}
            select={selectBlock}
            setSelect={setSelectBlock}
            isModal
            deleteData={() => {}}
            keySelected={'slug'}
            hideButtonCreate={true}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export default SelectBlock;
