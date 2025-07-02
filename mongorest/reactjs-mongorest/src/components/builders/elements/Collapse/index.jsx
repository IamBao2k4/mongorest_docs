'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowUp, Copy, Download, Settings2, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';

const icons = {
  shortAnswer: 'minus',
  longAnswer: 'align-left',
  attribute: 'settings',
  category: 'layers',
  checkbox: 'check-square',
  date: 'calendar',
  dateTime: 'calendar',
  time: 'clock',
  integer: 'layers',
  number: 'layers',
  file: 'file',
  multipleFiles: 'camera',
};

export default function Collapse({
  title,
  keyObject,
  option,
  children,
  isOpen,
  toggleCollapse,
  componentProps,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  cloneCardObj,
  cloneSectionObj,
  isArray,
  isForm,
  isSection,
  type,
}) {
  const genExtra = () => (
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}>
      <>
        {!isArray && (
          <div className='flex items-center gap-4'>
            {type === 'form' ? (
              <Input
                type='number'
                max={12}
                value={componentProps?.span}
                className='w-20'
                onChange={(e) =>
                  onChange({
                    ...componentProps,
                    span: e.target.value,
                  })
                }
              />
            ) : null}

            <Switch
              label={'Require'}
              checked={componentProps?.required}
              disabled={componentProps?.widget === 'BooleanCustom'}
              onCheckedChange={() =>
                onChange({
                  ...componentProps,
                  required: !componentProps?.required,
                })
              }
            />
            <Switch
              label={'Hidden'}
              checked={componentProps?.hidden}
              onCheckedChange={() =>
                onChange({
                  ...componentProps,
                  hidden: !componentProps?.hidden,
                })
              }
            />
            {type !== 'form' && !isSection ? (
              <div className='flex items-center gap-3'>
                <Switch
                  label={'Table'}
                  checked={componentProps?.filter}
                  disabled={componentProps?.widget === 'BooleanCustom'}
                  onCheckedChange={() =>
                    onChange({
                      ...componentProps,
                      filter: !componentProps.filter,
                    })
                  }
                />
                <Switch
                  label='Disabled'
                  checked={componentProps?.disabled}
                  disabled={componentProps?.widget === 'BooleanCustom'}
                  onCheckedChange={() =>
                    onChange({
                      ...componentProps,
                      disabled: !componentProps.disabled,
                    })
                  }
                />
              </div>
            ) : null}

            <Button
              size='sm'
              variant='outline'
              onClick={() => (onDelete ? onDelete() : {})}>
              <Trash2 className='w-4 h-4' />
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => (onMoveUp ? onMoveUp() : {})}>
              <ArrowUp className='w-4 h-4' />
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => (onMoveDown ? onMoveDown() : {})}>
              <Download className='w-4 h-4' />
            </Button>
            <Button
              size='sm'
              onClick={() => {
                if (!isSection) return cloneCardObj ? cloneCardObj() : {};
                return cloneSectionObj ? cloneSectionObj() : {};
              }}>
              <Copy className='w-4 h-4' />
            </Button>
          </div>
        )}
      </>
    </div>
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(key) => {
        toggleCollapse(key);
      }}>
      <div className='flex items-center justify-between w-full'>
        <CollapsibleTrigger className='flex-1'>
          <div className='flex items-center gap-2 py-2 pl-10'>
            <Settings2 className='w-5 h-5' />
            {title}
          </div>
        </CollapsibleTrigger>
        <div>{genExtra()}</div>
      </div>
      <CollapsibleContent className='CollapsibleContent'>
        <div className='mt-5'>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
