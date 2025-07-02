'use client';

import clsx from 'clsx';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import KeyCode from 'rc-util/lib/KeyCode';
import pickAttrs from 'rc-util/lib/pickAttrs';
import warning from 'rc-util/lib/warning';
import React, { useEffect } from 'react';
import viVN from './Locale/vi_VN';
import Options from './Options';
import Pager from './Pager';
import {
  PaginationItem,
  PaginationContent,
  Pagination as PaginationParent,
  PaginationNext,
  PaginationPrevious,
} from './Elements';

const defaultItemRender = (page, type, element) => element;

function noop() {}

function isInteger(v) {
  const value = Number(v);
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    isFinite(value) &&
    Math.floor(value) === value
  );
}

function calculatePage(p, pageSize, total) {
  const _pageSize = typeof p === 'undefined' ? pageSize : p;
  return Math.floor((total - 1) / _pageSize) + 1;
}

const Pagination = (props) => {
  const {
    // cls
    prefixCls = 'rc-pagination',
    selectPrefixCls = 'rc-select',
    className,
    selectComponentClass,

    // control
    current: currentProp,
    defaultCurrent = 1,
    total = 0,
    pageSize: pageSizeProp,
    defaultPageSize = 10,
    onChange,

    // config
    hideOnSinglePage,
    align,
    showPrevNextJumpers = true,
    showQuickJumper,
    showLessItems,
    showTitle = true,
    onShowSizeChange,
    locale = viVN,
    style,
    totalBoundaryShowSizeChanger = 50,
    disabled,
    simple,
    showTotal,
    showSizeChanger: showSizeChangerProp,
    pageSizeOptions,

    // render
    itemRender = defaultItemRender,
    jumpPrevIcon,
    jumpNextIcon,
    prevIcon,
    nextIcon,
  } = props;

  const paginationRef = React.useRef(null);

  const [pageSize, setPageSize] = useMergedState(10, {
    value: pageSizeProp,
    defaultValue: defaultPageSize,
  });

  const [current, setCurrent] = useMergedState(1, {
    value: currentProp,
    defaultValue: defaultCurrent,
    postState: (c) => Math.max(1, Math.min(c, calculatePage(undefined, pageSize, total))),
  });

  const [internalInputVal, setInternalInputVal] = React.useState(current);

  useEffect(() => {
    setInternalInputVal(current);
  }, [current]);

  const hasOnChange = onChange !== noop;
  const hasCurrent = 'current' in props;

  if (import.meta.env.NODE_ENV !== 'production') {
    warning(
      hasCurrent ? hasOnChange : true,
      'You provided a `current` prop to a Pagination component without an `onChange` handler. This will render a read-only component.'
    );
  }

  const jumpPrevPage = Math.max(1, current - (showLessItems ? 3 : 5));
  const jumpNextPage = Math.min(
    calculatePage(undefined, pageSize, total),
    current + (showLessItems ? 3 : 5)
  );

  function getItemIcon(icon, label) {
    let iconNode = icon || (
      <button
        type='button'
        aria-label={label}
        className={`${prefixCls}-item-link`}
      />
    );
    if (typeof icon === 'function') {
      iconNode = React.createElement < PaginationProps > (icon, { ...props });
    }
    return iconNode;
  }

  function getValidValue(e) {
    const inputValue = e.target.value;
    const allPages = calculatePage(undefined, pageSize, total);
    let value;
    if (inputValue === '') {
      value = inputValue;
    } else if (Number.isNaN(Number(inputValue))) {
      value = internalInputVal;
    } else if (inputValue >= allPages) {
      value = allPages;
    } else {
      value = Number(inputValue);
    }
    return value;
  }

  function isValid(page) {
    return isInteger(page) && page !== current && isInteger(total) && total > 0;
  }

  const shouldDisplayQuickJumper = total > pageSize ? showQuickJumper : false;

  /**
   * prevent "up arrow" key reseting cursor position within textbox
   * @see https://stackoverflow.com/a/1081114
   */
  function handleKeyDown(event) {
    if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
      event.preventDefault();
    }
  }

  function handleKeyUp(event) {
    const value = getValidValue(event);
    if (value !== internalInputVal) {
      setInternalInputVal(value);
    }

    switch (event.keyCode) {
      case KeyCode.ENTER:
        handleChange(value);
        break;
      case KeyCode.UP:
        handleChange(value - 1);
        break;
      case KeyCode.DOWN:
        handleChange(value + 1);
        break;
      default:
        break;
    }
  }

  function handleBlur(event) {
    handleChange(getValidValue(event));
  }

  function changePageSize(size) {
    const newCurrent = calculatePage(size, pageSize, total);
    const nextCurrent = current > newCurrent && newCurrent !== 0 ? newCurrent : current;

    setPageSize(size);
    setInternalInputVal(nextCurrent);
    onShowSizeChange?.(current, size);
    setCurrent(nextCurrent);
    onChange?.(nextCurrent, size);
  }

  function handleChange(page) {
    if (isValid(page) && !disabled) {
      const currentPage = calculatePage(undefined, pageSize, total);
      let newPage = page;
      if (page > currentPage) {
        newPage = currentPage;
      } else if (page < 1) {
        newPage = 1;
      }

      if (newPage !== internalInputVal) {
        setInternalInputVal(newPage);
      }

      setCurrent(newPage);
      onShowSizeChange(newPage, pageSizeProp);

      return newPage;
    }

    return current;
  }

  const hasPrev = current > 1;
  const hasNext = current < calculatePage(undefined, pageSize, total);

  const showSizeChanger = showSizeChangerProp ?? total > totalBoundaryShowSizeChanger;

  function prevHandle() {
    if (hasPrev) handleChange(current - 1);
  }

  function prevHandleFirstPage() {
    if (hasPrev) handleChange(1);
  }

  function nextHandle() {
    if (hasNext) handleChange(current + 1);
  }

  function nextLastPageHandle() {
    if (hasNext) handleChange(allPages);
  }

  function jumpPrevHandle() {
    handleChange(jumpPrevPage);
  }

  function jumpNextHandle() {
    handleChange(jumpNextPage);
  }

  function runIfEnter(event, callback, ...restParams) {
    if (
      event.key === 'Enter' ||
      event.charCode === KeyCode.ENTER ||
      event.keyCode === KeyCode.ENTER
    ) {
      callback(...restParams);
    }
  }

  function runIfEnterPrev(event) {
    runIfEnter(event, prevHandle);
  }

  function runIfEnterNext(event) {
    runIfEnter(event, nextHandle);
  }

  function runIfEnterJumpPrev(event) {
    runIfEnter(event, jumpPrevHandle);
  }

  function runIfEnterJumpNext(event) {
    runIfEnter(event, jumpNextHandle);
  }

  function renderPrev(prevPage) {
    const prevButton = itemRender(prevPage, 'prev', getItemIcon(prevIcon, 'prev page'));
    return React.isValidElement(prevButton)
      ? React.cloneElement(prevButton, { disabled: !hasPrev })
      : prevButton;
  }

  function renderNext(nextPage) {
    const nextButton = itemRender(nextPage, 'next', getItemIcon(nextIcon, 'next page'));
    return React.isValidElement(nextButton)
      ? React.cloneElement(nextButton, { disabled: !hasNext })
      : nextButton;
  }

  function handleGoTO(event) {
    if (event.type === 'click' || event.keyCode === KeyCode.ENTER) {
      handleChange(internalInputVal);
    }
  }

  let jumpPrev = null;

  const dataOrAriaAttributeProps = pickAttrs(props, {
    aria: true,
    data: true,
  });

  const totalText = showTotal && (
    <li className={`${prefixCls}-total-text`}>
      {showTotal(total, [
        total === 0 ? 0 : (current - 1) * pageSize + 1,
        current * pageSize > total ? total : current * pageSize,
      ])}
    </li>
  );

  let jumpNext = null;

  const allPages = calculatePage(undefined, pageSize, total);

  // ================== Render ==================
  // When hideOnSinglePage is true and there is only 1 page, hide the pager
  if (hideOnSinglePage && total <= pageSize) {
    console.log('NULL');
    return null;
  }

  const pagerList = [];

  const pagerProps = {
    rootPrefixCls: prefixCls,
    onClick: handleChange,
    onKeyPress: runIfEnter,
    showTitle,
    itemRender,
    page: -1,
  };

  const prevPage = current - 1 > 0 ? current - 1 : 0;
  const nextPage = current + 1 < allPages ? current + 1 : allPages;
  const goButton = showQuickJumper && showQuickJumper.goButton;

  // ================== Simple ==================
  // FIXME: ts type
  let gotoButton = goButton;
  let simplePager = null;

  if (simple) {
    // ====== Simple quick jump ======
    if (goButton) {
      if (typeof goButton === 'boolean') {
        gotoButton = (
          <button
            type='button'
            onClick={handleGoTO}
            onKeyUp={handleGoTO}>
            {locale.jump_to_confirm}
          </button>
        );
      } else {
        gotoButton = (
          <span
            onClick={handleGoTO}
            onKeyUp={handleGoTO}>
            {goButton}
          </span>
        );
      }

      gotoButton = (
        <li
          title={showTitle ? `${locale.jump_to}${current}/${allPages}` : null}
          className={`${prefixCls}-simple-pager`}>
          {gotoButton}
        </li>
      );
    }

    simplePager = (
      <li
        title={showTitle ? `${current}/${allPages}` : null}
        className={`${prefixCls}-simple-pager`}>
        <input
          type='text'
          value={internalInputVal}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onChange={handleKeyUp}
          onBlur={handleBlur}
          size={3}
        />
        <span className={`${prefixCls}-slash`}>/</span>
        {allPages}
      </li>
    );
  }

  // ====================== Normal ======================
  const pageBufferSize = showLessItems ? 1 : 2;
  if (allPages <= 3 + pageBufferSize * 2) {
    if (!allPages) {
      pagerList.push(
        <Pager
          {...pagerProps}
          key='noPager'
          page={1}
          className={`${prefixCls}-item-disabled`}
        />
      );
    }

    for (let i = 1; i <= allPages; i += 1) {
      pagerList.push(
        <Pager
          {...pagerProps}
          key={i}
          page={i}
          active={current === i}
        />
      );
    }
  } else {
    const prevItemTitle = showLessItems ? locale.prev_3 : locale.prev_5;
    const nextItemTitle = showLessItems ? locale.next_3 : locale.next_5;

    const jumpPrevContent = itemRender(
      jumpPrevPage,
      'jump-prev',
      getItemIcon(jumpPrevIcon, 'prev page')
    );
    const jumpNextContent = itemRender(
      jumpNextPage,
      'jump-next',
      getItemIcon(jumpNextIcon, 'next page')
    );

    if (showPrevNextJumpers) {
      jumpPrev = jumpPrevContent ? (
        <li
          title={showTitle ? prevItemTitle : null}
          key='prev'
          onClick={jumpPrevHandle}
          tabIndex={0}
          onKeyDown={runIfEnterJumpPrev}
          className={clsx(`${prefixCls}-jump-prev`, {
            [`${prefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon,
          })}>
          {jumpPrevContent}
        </li>
      ) : null;

      jumpNext = jumpNextContent ? (
        <li
          title={showTitle ? nextItemTitle : null}
          key='next'
          onClick={jumpNextHandle}
          tabIndex={0}
          onKeyDown={runIfEnterJumpNext}
          className={clsx(`${prefixCls}-jump-next`, {
            [`${prefixCls}-jump-next-custom-icon`]: !!jumpNextIcon,
          })}>
          {jumpNextContent}
        </li>
      ) : null;
    }

    let left = Math.max(1, current - pageBufferSize);
    let right = Math.min(current + pageBufferSize, allPages);

    if (current - 1 <= pageBufferSize) {
      right = 1 + pageBufferSize * 2;
    }
    if (allPages - current <= pageBufferSize) {
      left = allPages - pageBufferSize * 2;
    }

    for (let i = left; i <= right; i += 1) {
      pagerList.push(
        <Pager
          {...pagerProps}
          key={i}
          page={i}
          active={current === i}
        />
      );
    }

    if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
      pagerList.unshift(jumpPrev);
    }

    if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
      pagerList.push(jumpNext);
    }

    if (left !== 1) {
      pagerList.unshift(
        <Pager
          {...pagerProps}
          key={1}
          page={1}
        />
      );
    }

    if (right !== allPages) {
      pagerList.push(
        <Pager
          {...pagerProps}
          key={allPages}
          page={allPages}
        />
      );
    }
  }

  let prevFirstPage = renderPrev(prevPage);
  if (prevFirstPage) {
    const prevDisabled = !hasPrev || !allPages;
    prevFirstPage = (
      <PaginationItem
        title={showTitle ? locale.prev_page : null}
        onClick={prevHandleFirstPage}
        tabIndex={prevDisabled ? null : 0}
        aria-disabled={prevDisabled}>
        <PaginationPrevious
          isFirstPrev={true}
          className={clsx(`cursor-pointer`, {
            [`${prefixCls}-disabled`]: prevDisabled,
          })}></PaginationPrevious>
      </PaginationItem>
    );
  }

  let prev = renderPrev(prevPage);
  if (prev) {
    const prevDisabled = !hasPrev || !allPages;
    prev = (
      <PaginationItem
        title={showTitle ? locale.prev_page : null}
        onClick={prevHandle}
        tabIndex={prevDisabled ? null : 0}
        onKeyDown={runIfEnterPrev}
        aria-disabled={prevDisabled}>
        <PaginationPrevious
          className={clsx(`cursor-pointer`, { [`${prefixCls}-disabled`]: prevDisabled })}
        />
      </PaginationItem>
    );
  }

  let nextLastPage = renderNext(nextPage);
  if (nextLastPage) {
    let nextDisabled, nextTabIndex;

    if (simple) {
      nextDisabled = !hasNext;
      nextTabIndex = hasPrev ? 0 : null;
    } else {
      nextDisabled = !hasNext || !allPages;
      nextTabIndex = nextDisabled ? null : 0;
    }

    nextLastPage = (
      <PaginationItem
        title={showTitle ? locale.next_page : null}
        onClick={nextLastPageHandle}
        tabIndex={nextTabIndex}
        onKeyDown={runIfEnterNext}
        aria-disabled={nextDisabled}>
        <PaginationNext
          isLastNext={true}
          className={clsx(`cursor-pointer`, { [`${prefixCls}-disabled`]: nextDisabled })}
        />
      </PaginationItem>
    );
  }

  let next = renderNext(nextPage);
  if (next) {
    let nextDisabled, nextTabIndex;

    if (simple) {
      nextDisabled = !hasNext;
      nextTabIndex = hasPrev ? 0 : null;
    } else {
      nextDisabled = !hasNext || !allPages;
      nextTabIndex = nextDisabled ? null : 0;
    }

    next = (
      <PaginationItem
        title={showTitle ? locale.next_page : null}
        onClick={nextHandle}
        tabIndex={nextTabIndex}
        onKeyDown={runIfEnterNext}
        aria-disabled={nextDisabled}>
        {
          <PaginationNext
            className={clsx(`cursor-pointer`, { [`${prefixCls}-disabled`]: nextDisabled })}
          />
        }
      </PaginationItem>
    );
  }

  const cls = clsx(prefixCls, className, {
    [`${prefixCls}-start`]: align === 'start',
    [`${prefixCls}-center`]: align === 'center',
    [`${prefixCls}-end`]: align === 'end',
    [`${prefixCls}-simple`]: simple,
    [`${prefixCls}-disabled`]: disabled,
  });

  return (
    <PaginationParent>
      <PaginationContent
        className={cls}
        style={style}
        ref={paginationRef}
        {...dataOrAriaAttributeProps}>
        {totalText}
        {prevFirstPage}
        {prev}
        {...pagerList}
        {next}
        {nextLastPage}
        <Options
          locale={locale}
          pageSizeOptions={pageSizeOptions}
          rootPrefixCls={prefixCls}
          disabled={disabled}
          selectComponentClass={selectComponentClass}
          selectPrefixCls={selectPrefixCls}
          changeSize={showSizeChanger ? changePageSize : null}
          pageSize={pageSize}
          quickGo={shouldDisplayQuickJumper ? handleChange : null}
          goButton={true}
        />
      </PaginationContent>
    </PaginationParent>
  );
};

if (import.meta.env.NODE_ENV !== 'production') {
  Pagination.displayName = 'Pagination';
}

export default Pagination;
