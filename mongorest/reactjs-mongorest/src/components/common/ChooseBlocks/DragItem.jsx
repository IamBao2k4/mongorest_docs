'use client';

import { JsonForm } from '@/components/builders';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { PopConfirm } from '@/components/ui/PopConfirm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

function DragItem({
  providedDraggable,
  initData,
  isOpen,
  onClickRemove,
  onClickClone,
  onClickItem,
  schema,
  onSelect,
  isSelected,
}) {
  if (!schema) return null;
  const title = JSON.parse(schema?.json)?.title;
  const [data, setData] = useState(null);
  const _json = JSON.parse(schema?.json);
  _json.properties['id'] = {
    title: 'ID',
    type: 'string',
    widget: 'shortAnswer',
    description: 'Nhập ID cho block',
  };

  const _ui = JSON.parse(schema.ui);
  _ui['ui:order'].unshift('id');

  return (
    <div
      ref={providedDraggable.innerRef}
      {...providedDraggable.draggableProps}>
      <Card>
        <div className='flex items-center justify-between p-4'>
          <div>
            <div className='flex gap-2'>
              <Checkbox
                className={'translate-y-1'}
                onCheckedChange={onSelect}
                checked={isSelected}></Checkbox>
              <p
                className='mb-0 text-base'
                style={{ marginBottom: 0 }}
                onClick={() => onClickItem()}>
                {title}
              </p>
              {initData?.id ? (
                <p
                  className='mb-0 text-base'
                  style={{ color: 'gray', marginBottom: 0 }}
                  copyable>
                  {initData?.id}
                </p>
              ) : null}
            </div>
          </div>
          <div className='flex gap-4'>
            <PopConfirm onConfirm={onClickRemove}>
              <Trash2
                className='w-5 h-5'
                style={{ color: 'red' }}
              />
            </PopConfirm>
            <PopConfirm onConfirm={onClickClone}>
              <Copy
                className='w-5 h-5'
                style={{ color: 'blue' }}
              />
            </PopConfirm>
            <div
              type='ghost'
              shape='circle'
              size='middle'
              {...providedDraggable.dragHandleProps}>
              <GripVertical className='w-5 h-5' />
            </div>
          </div>
        </div>
        <Sheet
          open={isOpen}
          onOpenChange={(val) => {
            if (!val) {
              onClickItem(data);
              setData(null);
            }
          }}>
          <SheetContent className='sm:max-w-[70%] overflow-hidden flex flex-col'>
            <SheetHeader className=''>
              <SheetTitle>Block</SheetTitle>
            </SheetHeader>
            <JsonForm
              schema={JSON.stringify(_json)}
              uischema={JSON.stringify(_ui)}
              setFormData={setData}
              initFormData={initData}
            />
          </SheetContent>
        </Sheet>
      </Card>
    </div>
  );
}

export default DragItem;
