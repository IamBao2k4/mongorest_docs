'use client';

import { Button, buttonVariants } from '@/components/ui/Button';
import React, { useState } from 'react';
import { getRandomId } from '@/helpers/utils';
import { classifyFieldsIntoGroups } from '@/helpers/classifyFieldsIntoGroups';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

export default function Add({ addElem, hidden, path, fields, type }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectType, setSelectType] = useState('');
  const [elementId] = useState(getRandomId());
  const handleVisibleChange = (newVisible) => {
    setPopoverOpen(newVisible);
    if (!newVisible) {
      setSelectType('');
    }
  };

  const __renderButton = (type) => {
    return (
      <div>
        <Button
          onClick={() => addElem(type)}
          variant={type === 'section' ? 'outline' : 'default'}
          className='gap-1'>
          <Plus className='w-4 h-4' />
          {type === 'section' ? 'Section' : 'Clone'}
        </Button>
      </div>
    );
  };

  return (
    <div style={{ display: hidden ? 'none' : 'initial' }}>
      <div className={`flex justify-center gap-2 mt-2`}>
        <Popover
          place
          open={popoverOpen}
          onOpenChange={handleVisibleChange}>
          <PopoverContent side='top'>
            <h2>Type</h2>
            <div className='flex flex-col'>
              <Select
                groupOptions
                value={selectType}
                style={{ width: '100%' }}
                onValueChange={(val) => setSelectType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classifyFieldsIntoGroups(fields, type).map((item, index) => {
                    return (
                      <SelectGroup key={index}>
                        <SelectLabel>{item.label}</SelectLabel>
                        {item?.options?.map((child) => {
                          return (
                            <SelectItem
                              key={child.value}
                              value={child.value}>
                              {child.label}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
              <div>
                <Button
                  style={{ marginTop: 15 }}
                  size='sm'
                  disabled={!selectType}
                  onClick={() => {
                    addElem('card', selectType);
                    setSelectType('');
                    handleVisibleChange(false);
                  }}>
                  Create
                </Button>
              </div>
            </div>
          </PopoverContent>
          <PopoverTrigger>
            <div
              onClick={() => handleVisibleChange(true)}
              className={clsx(buttonVariants(), 'gap-1')}>
              <Plus
                color='#fff'
                className='w-4 h-4'
              />
              Element
            </div>
          </PopoverTrigger>
        </Popover>

        {__renderButton('section')}
        {path !== 'root' ? __renderButton('clone') : null}
      </div>
    </div>
  );
}
