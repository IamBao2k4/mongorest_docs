/* eslint react/prop-types: 0 */
import classNames from 'classnames';
import React from 'react';
import { PaginationItem, PaginationLink } from './Elements';

const Pager = (props) => {
  const { rootPrefixCls, page, active, className, showTitle, onClick, onKeyPress, itemRender } =
    props;
  const prefixCls = `${rootPrefixCls}-item`;

  const cls = classNames(
    prefixCls,
    `${prefixCls}-${page}`,
    {
      [`${prefixCls}-active`]: active,
      [`${prefixCls}-disabled`]: !page,
    },
    className
  );

  const handleClick = () => {
    onClick(page);
  };

  const handleKeyPress = (e) => {
    onKeyPress(e, onClick, page);
  };

  const pager = itemRender(page, 'page', <span rel='nofollow'>{page}</span>);

  return pager ? (
    <PaginationItem>
      <PaginationLink
        className={cls}
        isActive={active}
        title={showTitle ? String(page) : null}
        onClick={handleClick}
        onKeyDown={handleKeyPress}
        tabIndex={0}>
        {pager}
      </PaginationLink>
    </PaginationItem>
  ) : null;
};

if (import.meta.env.NODE_ENV !== 'production') {
  Pager.displayName = 'Pager';
}

export default Pager;
