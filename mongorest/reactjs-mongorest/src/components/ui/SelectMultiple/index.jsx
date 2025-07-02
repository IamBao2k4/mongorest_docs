'use client';

import { CaretSortIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { Button } from '../Button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '../Command';
import { PopoverContent, Popover, PopoverTrigger } from '../Popover';
import { Spin } from '../Spin';

export const SelectMultiple = forwardRef(
  (
    {
      placeholder = 'Chọn...',
      options = [],
      values = [],
      onChange,
      children = true,
      disabled,
      searchValue,
      onSearch,
      filterOption,
      loading = false,
      onFocus,
      onBlur,
      multiple,
      type,
      classContainer,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    useImperativeHandle(ref, () => {
      return {
        closeSelect() {
          setOpen(false);
        },
      };
    }, []);

    const onSelect = useCallback(
      (selectedOption) => {
        const findIndex = values.findIndex((item) => item == selectedOption.id);
        if (findIndex > -1) {
          onChange(false, selectedOption);
        } else {
          onChange(true, selectedOption);
        }

        if (!multiple) {
          setOpen(false);
        }
      },
      [values, onChange]
    );

    return (
      <Popover
        open={open}
        onOpenChange={(open) => {
          if (open) {
            onFocus?.();
          } else {
            onBlur?.();
          }
          setOpen(open);
        }}>
        <PopoverTrigger
          disabled={disabled}
          asChild
          className={clsx('w-full', type === 'filter' && '!h-8')}>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={clsx(
              'w-full justify-between text-slate-500 hover:text-slate-500 font-normal h-8',
              disabled && 'cursor-not-allowed',
              classContainer
            )}>
            <span className='text-xs'>{placeholder}</span>
            <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='p-0 w-[--radix-popover-trigger-width]'
          align='start'>
          <div>
            <Command
              style={props.style}
              shouldFilter={!!filterOption}>
              <CommandInput
                placeholder='Search...'
                className='h-9'
                value={search}
                onValueChange={(e) => {
                  setSearch(e);
                  if (onSearch) {
                    onSearch?.(e);
                  } else {
                    setSearch(e);
                  }
                }}
              />
              <Spin spinning={loading}>
                <CommandList>
                  <CommandEmpty>Not found</CommandEmpty>
                  {options.length
                    ? options
                        .filter((item) => item.label.includes(search))
                        .map((option) => (
                          <CommandItem
                            className='flex truncate line-clamp-1'
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              onSelect(option);
                            }}>
                            {option.label}
                            <CheckCircledIcon
                              className={cn(
                                'ml-auto h-4 w-4',
                                values?.includes(option.value) ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))
                    : children}
                </CommandList>
              </Spin>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
