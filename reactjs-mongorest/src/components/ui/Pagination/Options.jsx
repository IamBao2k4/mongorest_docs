import KEYCODE from 'rc-util/lib/KeyCode';
import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PaginationItem } from './Elements';

const defaultPageSizeOptions = ['10', '20', '50', '100'];

const Options = (props) => {
  const {
    pageSizeOptions = defaultPageSizeOptions,
    locale,
    changeSize,
    pageSize,
    goButton,
    quickGo,
    rootPrefixCls,
    disabled,
  } = props;

  const [goInputText, setGoInputText] = React.useState('');

  const getValidValue = () => {
    return !goInputText || Number.isNaN(goInputText) ? undefined : Number(goInputText);
  };

  const changeSizeHandle = (value) => {
    changeSize?.(Number(value));
  };

  const handleChange = (e) => {
    setGoInputText(e.target.value);
  };

  const handleBlur = (e) => {
    if (goButton || goInputText === '') {
      return;
    }
    setGoInputText('');
    if (
      e.relatedTarget &&
      (e.relatedTarget.className.indexOf(`${rootPrefixCls}-item-link`) >= 0 ||
        e.relatedTarget.className.indexOf(`${rootPrefixCls}-item`) >= 0)
    ) {
      return;
    }
    quickGo?.(getValidValue());
  };

  const go = (e) => {
    if (goInputText === '') {
      return;
    }
    if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
      setGoInputText('');
      quickGo?.(getValidValue());
    }
  };

  const getPageSizeOptions = () => {
    if (pageSizeOptions.some((option) => option.toString() === pageSize.toString())) {
      return pageSizeOptions;
    }

    return pageSizeOptions.concat([pageSize.toString()]).sort((a, b) => {
      const numberA = Number.isNaN(Number(a)) ? 0 : Number(a);
      const numberB = Number.isNaN(Number(b)) ? 0 : Number(b);
      return numberA - numberB;
    });
  };

  // ============== cls ==============
  const prefixCls = `${rootPrefixCls}-options`;

  // ============== render ==============

  if (!changeSize && !quickGo) {
    return null;
  }

  let changeSelect = null;
  let goInput = null;
  let gotoButton = null;

  if (changeSize && Select) {
    changeSelect = (
      <Select
        value={`${pageSize || pageSizeOptions[0]}`}
        onValueChange={changeSizeHandle}>
        <SelectTrigger className='h-8 w-[70px]'>
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent side='top'>
          {pageSizeOptions.map((item) => {
            return (
              <SelectItem
                value={item}
                key={item}>
                {item.toString()}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  if (quickGo) {
    goInput = (
      <div className={`${prefixCls}-quick-jumper`}>
        {locale.jump_to}
        <Input
          className='h-[30.4px]'
          disabled={disabled}
          type='text'
          value={goInputText}
          onChange={handleChange}
          onKeyUp={go}
          onBlur={handleBlur}
          aria-label={locale.page}
        />
        {quickGo && goButton ? (
          <Button
            type='button'
            variant='outline'
            onClick={go}
            onKeyUp={go}
            disabled={disabled}
            className={`${prefixCls}-quick-jumper-button h-8`}>
            {locale.jump_to_confirm}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <PaginationItem className='flex items-center'>
      {changeSelect}
      {goInput}
    </PaginationItem>
  );
};

if (import.meta.env.NODE_ENV !== 'production') {
  Options.displayName = 'Options';
}

export default Options;
