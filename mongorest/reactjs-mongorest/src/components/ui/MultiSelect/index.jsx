'use client';

import { cn } from '@/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, X as RemoveIcon } from 'lucide-react';
import { createContext, forwardRef, useCallback, useContext, useMemo, useState } from 'react';
import { Badge } from '../Badge';
import { Command, CommandEmpty, CommandList } from '../Command';

const MultiSelectContext = createContext(null);

const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error('useMultiSelect must be used within MultiSelectProvider');
  }
  return context;
};

const MultiSelector = ({
  values: value,
  onValuesChange: onValueChange,
  loop = false,
  className,
  children,
  dir,
  data,
  fieldName = { label: 'label', value: 'value' },
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const onValueChangeHandler = useCallback(
    (val) => {
      if (value?.includes(val)) {
        onValueChange(value.filter((item) => item !== val));
      } else {
        onValueChange([...value, val]);
      }
    },
    [value]
  );

  const handleKeyDown = useCallback(
    (e) => {
      const moveNext = () => {
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex > value.length - 1 ? (loop ? 0 : -1) : nextIndex);
      };

      const movePrev = () => {
        const prevIndex = activeIndex - 1;
        setActiveIndex(prevIndex < 0 ? value.length - 1 : prevIndex);
      };

      if ((e.key === 'Backspace' || e.key === 'Delete') && value.length > 0) {
        if (inputValue.length === 0) {
          if (activeIndex !== -1 && activeIndex < value.length) {
            onValueChange(value.filter((item) => item !== value[activeIndex]));
            const newIndex = activeIndex - 1 < 0 ? 0 : activeIndex - 1;
            setActiveIndex(newIndex);
          } else {
            onValueChange(value.filter((item) => item !== value[value.length - 1]));
          }
        }
      } else if (e.key === 'Enter') {
        setOpen(true);
      } else if (e.key === 'Escape') {
        if (activeIndex !== -1) {
          setActiveIndex(-1);
        } else {
          setOpen(false);
        }
      } else if (dir === 'rtl') {
        if (e.key === 'ArrowRight') {
          movePrev();
        } else if (e.key === 'ArrowLeft' && (activeIndex !== -1 || loop)) {
          moveNext();
        }
      } else {
        if (e.key === 'ArrowLeft') {
          movePrev();
        } else if (e.key === 'ArrowRight' && (activeIndex !== -1 || loop)) {
          moveNext();
        }
      }
    },
    [value, inputValue, activeIndex, loop]
  );

  return (
    <MultiSelectContext.Provider
      value={{
        value,
        data,
        onValueChange: onValueChangeHandler,
        open,
        setOpen,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
        fieldName,
      }}>
      <Command
        onKeyDown={handleKeyDown}
        className={cn('overflow-visible bg-transparent flex flex-col space-y-2', className)}
        dir={dir}
        {...props}>
        {children}
      </Command>
    </MultiSelectContext.Provider>
  );
};

const MultiSelectorTrigger = forwardRef(({ className, children, ...props }, ref) => {
  const { value, onValueChange, activeIndex, data, fieldName } = useMultiSelect();
  const selectedOptions = useMemo(() => {
    return data.filter((item) => value.includes(item?.[fieldName.value]));
  }, [data, value]);

  const mousePreventDefault = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap gap-1 p-1 py-2 border border-muted rounded-lg bg-background',
        className
      )}
      {...props}>
      {value &&
        Array.isArray(value) &&
        value?.map((item, index) => (
          <Badge
            key={item}
            className={cn(
              'px-1 rounded-xl flex items-center gap-1',
              activeIndex === index && 'ring-2 ring-muted-foreground '
            )}
            variant={'secondary'}>
            <span className='text-xs'>
              {selectedOptions.find((opt) => opt?.[fieldName.value] == item)?.[fieldName.label] ||
                item}
            </span>
            <button
              aria-label={`Remove ${item} option`}
              aria-roledescription='button to remove option'
              type='button'
              onMouseDown={mousePreventDefault}
              onClick={() => onValueChange(item)}>
              <span className='sr-only'>Remove {item} option</span>
              <RemoveIcon className='h-4 w-4 hover:stroke-destructive' />
            </button>
          </Badge>
        ))}

      {children}
    </div>
  );
});

MultiSelectorTrigger.displayName = 'MultiSelectorTrigger';

const MultiSelectorInput = forwardRef(({ className, ...props }, ref) => {
  const {
    setOpen,
    onValueChange,
    inputValue,
    setInputValue,
    activeIndex,
    setActiveIndex,
    value,
    data,
    fieldName,
  } = useMultiSelect();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue) {
      const filteredOptions = data.filter(
        (option) =>
          option?.[fieldName.label]?.toLowerCase()?.includes(inputValue.toLowerCase()) &&
          !value?.includes(option?.[fieldName.value])
      );
      if (filteredOptions.length > 0) {
        onValueChange(filteredOptions[0]?.[fieldName.value]);
        setInputValue('');
        setOpen(false);
      }
    }
  };

  return (
    <CommandPrimitive.Input
      {...props}
      ref={ref}
      value={inputValue}
      onValueChange={activeIndex === -1 ? setInputValue : undefined}
      onBlur={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onClick={() => setActiveIndex(-1)}
      onKeyDown={handleKeyPress}
      className={cn(
        'ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1',
        className,
        activeIndex !== -1 && 'caret-transparent'
      )}
    />
  );
});

MultiSelectorInput.displayName = 'MultiSelectorInput';

const MultiSelectorContent = forwardRef(({ children }, ref) => {
  const { open } = useMultiSelect();
  return (
    <div
      ref={ref}
      className='relative'>
      {open && children}
    </div>
  );
});

MultiSelectorContent.displayName = 'MultiSelectorContent';

const MultiSelectorList = forwardRef(({ className, children }, ref) => {
  const { value: Options, inputValue, data, fieldName } = useMultiSelect();
  const filteredOptions = data?.filter((option) => {
    return (
      option?.[fieldName.label]?.toLowerCase()?.includes(inputValue.toLowerCase()) &&
      !Options?.includes(option?.[fieldName.value])
    );
  });

  return (
    <CommandList
      ref={ref}
      className={cn(
        'p-2 flex flex-col gap-2 rounded-md scrollbar-thin scrollbar-track-transparent transition-colors scrollbar-thumb-muted-foreground dark:scrollbar-thumb-muted scrollbar-thumb-rounded-lg w-full absolute bg-background shadow-md z-10 border border-muted top-0',
        className
      )}>
      {filteredOptions.length === 0 && Options.length < data.length ? (
        <CommandEmpty>
          <span className='text-muted-foreground'>No results found</span>
        </CommandEmpty>
      ) : (
        <>
          {filteredOptions.length > 0 && inputValue ? (
            filteredOptions.map((item, index) => (
              <MultiSelectorItem
                key={item?.[fieldName.value]}
                value={item?.[fieldName.value]}>
                {item?.[fieldName.label]}
              </MultiSelectorItem>
            ))
          ) : (
            <>{children}</>
          )}
        </>
      )}
    </CommandList>
  );
});

MultiSelectorList.displayName = 'MultiSelectorList';

const MultiSelectorItem = forwardRef(({ className, value, children, ...props }, ref) => {
  const { value: Options, onValueChange, setInputValue } = useMultiSelect();

  const mousePreventDefault = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const isIncluded = Options?.includes(value);
  return (
    <div
      ref={ref}
      {...props}
      onMouseDown={mousePreventDefault}
      className={cn(
        'rounded-md cursor-pointer px-2 py-1 transition-colors flex justify-between',
        className,
        isIncluded && 'opacity-50 cursor-default',
        props.disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => {
        onValueChange(value);
        setInputValue('');
      }}>
      {children}
      {isIncluded && <Check className='h-4 w-4' />}
    </div>
  );
});

MultiSelectorItem.displayName = 'MultiSelectorItem';

import React from 'react';
/**
 *
 * @props onValuesChange
 */
const SelectMultiple = ({
  options,
  value,
  placeholder,
  fieldName = { label: 'label', value: 'value' },
  ...props
}) => {
  return (
    <MultiSelector
      fieldName={fieldName}
      values={value}
      data={options}
      loop
      className='max-w-full'
      {...props}>
      <MultiSelectorTrigger>
        <MultiSelectorInput placeholder={placeholder} />
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList>
          {options?.map((item, index) => {
            return (
              <MultiSelectorItem
                key={index}
                value={item?.[fieldName?.value]}>
                {item?.[fieldName?.label]}
              </MultiSelectorItem>
            );
          })}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
};

export default SelectMultiple;

export {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
  SelectMultiple,
};
