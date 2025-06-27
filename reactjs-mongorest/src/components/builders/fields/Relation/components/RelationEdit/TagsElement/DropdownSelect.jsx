import { CommandItem } from '@/components/ui/Command';
import { SelectMultiple } from '@/components/ui/SelectMultiple';
import { ENUM_TYPE_SELECT_TAG } from '@/data/enum';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { Command as CommandPrimitive } from 'cmdk';
import { withRelation } from '@/hooks/withRelation';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const DropdownSelect = ({
  page,
  lastPage,
  setPage,
  value = [],
  showModal = () => {},
  selectedValue = [],
  onChangeCheckbox = () => {},
  onSearchInput = () => {},
  placeholder = '',
  searchValue,
  loadingInput = false,
  isDisable = false,
  handleGetData = () => {},
  typeSearch,
  typeComponent,
  type,
  classContainer,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [list, setList] = useState([]);
  const selectContainer = useRef(null);
  const selectRef = useRef(null);

  const isMultiple = typeSearch != ENUM_TYPE_SELECT_TAG.once;

  useEffect(() => {
    if (value) {
      setList([...value]);
    }
  }, [value, searchValue]);

  useEffect(() => {
    if (isFocus) {
      onSearchInput('');
    }
  }, [isFocus]);

  let filteredList = [...list];

  return (
    <>
      <SelectMultiple
        classContainer={classContainer}
        ref={selectRef}
        multiple={isMultiple}
        placeholder={placeholder}
        loading={loadingInput}
        filterOption={false}
        disabled={isDisable}
        type={typeComponent}
        className='w-full h-8'
        searchValue={searchValue}
        onSearch={(value) => onSearchInput(value)}
        onChange={(isSelect, items) => {
          onChangeCheckbox(isSelect, items);
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => {
          setIsFocus(false);
        }}>
        <CommandPrimitive.List
          ref={selectContainer}
          className={'max-h-[300px] overflow-y-auto overflow-x-hidden'}>
          {!loadingInput && !!list.length > 0 && type !== 'rules' && (
            <div>
              <p
                onClick={() => {
                  showModal();
                }}
                className='text-[#327EE2] text-sm cursor-pointer font-normal mb-0 underline px-2 py-1.5'>
                Show All
              </p>
            </div>
          )}

          {[...filteredList].map((option) => {
            const isSelected = selectedValue?.findIndex((tag) => tag._id == option._id) !== -1;
            const label =
              option.title || option.name || option.username || option?.email || option?.content;
            return (
              <CommandItem
                className={clsx(isSelected && '!bg-blue-50', 'flex cursor-pointer mb-1 !py-1 px-2')}
                key={option._id}
                value={option._id}
                onSelect={() => {
                  onChangeCheckbox(!isSelected, option);
                  if (!isMultiple) {
                    selectRef.current.closeSelect();
                  }
                }}>
                <span
                  className='truncate'
                  title={label}>
                  {label}
                </span>
                <div className='ml-auto '>
                  <CheckIcon className={cn(' h-6 w-6', isSelected ? 'opacity-100' : 'opacity-0')} />
                </div>
              </CommandItem>
            );
          })}

          {lastPage !== page ? (
            loadingInput ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <CommandItem>
                <p
                  onClick={() => {
                    setPage((prev) => {
                      handleGetData(true, prev + 1, false);
                      return prev + 1;
                    });
                  }}
                  className='text-[#327EE2] text-sm cursor-pointer font-normal mb-0 underline'>
                  Show more
                </p>
              </CommandItem>
            )
          ) : null}
        </CommandPrimitive.List>
      </SelectMultiple>
    </>
  );
};
export default withRelation(DropdownSelect);
