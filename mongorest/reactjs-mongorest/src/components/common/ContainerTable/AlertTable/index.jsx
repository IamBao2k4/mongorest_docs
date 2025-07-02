import { PopConfirm } from '@/components/ui/PopConfirm';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Code, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTable } from '../table-context';
import { RelationEdit } from '@/components/builders/fields/Relation/components';
import { PopoverContent, Popover, PopoverTrigger } from '@/components/ui/Popover';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';

function AlertTable({
  open,
  select,
  setSelect,
  setSelectFlat,
  getDataAgain,
  onDelete,
  extraAler,
  setRefreshSelecred,
}) {
  if (!open) return <></>;
  const { toast } = useToast();
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const params = useParams();
  const [visibleHeader, setVisibleHeader] = useState(false);
  const { func, setFunc } = useTable();

  const handleCloseHeader = () => {
    setVisibleHeader(false);
  };

  const handleShowHeader = (flag) => {
    setVisibleHeader(flag);
    if (!flag) {
      handleCloseHeader();
    }
  };

  const handleDelete = async (list = []) => {
    try {
      if (list?.length > 0) {
        setIsLoadingDelete(true);
        const result = await onDelete({
          ids: list.join(),
          forceDelete: true,
          ...(params.pid && { posttype: params.pid }),
        });
        setIsLoadingDelete(false);
        if (result) {
          toast({ description: 'delete_success' });
          setSelect([]);
          setSelectFlat([]);
          setRefreshSelecred(true);
        }
        getDataAgain();
      }
    } catch (error) {
      console.log('🚀 ~ handleDelete ~ error:', error);
    }
  };

  return (
    <div className='px-4 py-2 fixed bottom-14 left-[50%] right-[50%] bg-slate-700 rounded-md shadow-md table'>
      <div className={'flex gap-4 items-center'}>
        <span className='w-max text-[14px] text-white'>{select?.length} item(s)</span>
        <PopConfirm
          title={'Xóa dữ liệu'}
          onConfirm={() => handleDelete(select)}
          loadingConfirm={isLoadingDelete}>
          <div
            className={clsx(
              buttonVariants({
                variant: 'destructive',
              }),
              'w-[100px]'
            )}
            icon={<Trash2 />}>
            Xóa
          </div>
        </PopConfirm>
        <Popover
          open={visibleHeader}
          onOpenChange={handleShowHeader}>
          <PopoverTrigger asChild>
            <div>
              <Button
                variant='outline'
                className='gap-1 border-none shadow-none'>
                <Code className='size-4' />
                <span className='sr-only sm:not-sr-only sm:whitespace-nowrap text-sm text-default-black'>
                  Function
                </span>
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className='!w-[350px]'>
            <RelationEdit
              schema={{
                title: 'Function',
                description: 'Chọn function để run',
                typeSelect: 'once',
                typeRelation: {
                  title: 'function',
                  entity: 'function',
                },
              }}
              value={func}
              onChange={setFunc}
            />
          </PopoverContent>
        </Popover>
        {extraAler}
      </div>
    </div>
  );
}

export default AlertTable;
