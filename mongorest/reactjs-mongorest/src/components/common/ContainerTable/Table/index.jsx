'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as utils from '@formulajs/formulajs';
Object.assign(globalThis, utils);

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

import { DataTablePagination } from './DataTablePagination';
import { getHeaders } from './utils';
import clsx from 'clsx';
import { useTable } from '../table-context';
import { useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';

export const uniqueArray = (array, keySelected) => {
  const _arr = JSON.parse(JSON.stringify(array));
  return _arr.reduce((acc, item) => {
    if (!acc.some((a) => a[keySelected] === item[keySelected])) {
      acc.push(item);
    }
    return acc;
  }, []);
};

const TableContainer = ({
  header,
  isModal,
  data,
  total = 0,
  onChangePage,
  setFilterQuery = () => {},
  onClickRow,
  setSelect,
  setSelectFlat,
  select,
  typeSelectRow,
  current,
  pageSize,
  keySelected = '_id',
  actions,
  lang,
  refreshSelecred,
  setRefreshSelecred,
}) => {
  const { pathname } = useLocation();
  const { settings, func, setSelectedFlat: setSelectedFlatGlobal } = useTable();
  const [rowSelectionState, setRowSelectionState] = useState(() => {
    if (select && select?.length > 0) {
      const _res = {};
      select.map((item) => (_res[item] = true));
      return _res;
    }
    return {};
  });

  const _header = useMemo(() => {
    const filterHeader = header?.filter((item) => item.isCheck);
    return getHeaders({
      header: filterHeader,
      pathname,
      isModal,
      setFilterQuery,
      typeSelectRow,
      actions,
      lang,
      settings,
      onClickRow,
    });
  }, [header, pathname]);

  const getRowId = useCallback((row) => {
    return row[keySelected];
  }, []);

  const onRowSelectionChange = (updater) => {
    const nextState = updater(rowSelectionState); //TODO: Hàm này có vấn đề khi xóa item được chọn
    setRowSelectionState(nextState);
    setSelect && setSelect(Object.keys(nextState));
  };

  useEffect(() => {
    if (refreshSelecred) {
      setRowSelectionState([]);
      setRefreshSelecred(false);
    }
  }, [refreshSelecred]);

  const _data = useMemo(() => {
    if (data && data.length > 0) {
      if (func && func?.length > 0 && func?.[0]?.code) {
        const _func = new Function('row', func?.[0]?.code);
        return data.map((item) => {
          if (select?.includes(item[keySelected])) {
            const _item = _func(item);
            return _item;
          }
          return item;
        });
      } else {
        return data;
      }
    }
    return data;
  }, [data, func, select]);

  const table = useReactTable({
    data: _data || [],
    columns: _header,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange,
    state: {
      rowSelection: rowSelectionState,
      pagination: {
        pageIndex: current - 1,
        pageSize,
      },
    },
    manualPagination: true,
    rowCount: total,
    getRowId,
    enableMultiRowSelection: typeSelectRow !== 'radio',
  });

  useEffect(() => {
    if (setSelectFlat) {
      const flatData = table.getSelectedRowModel().flatRows.map((row) => row.original);
      setSelectFlat((pre) => {
        const data = uniqueArray([...pre, ...flatData], keySelected).filter(
          (item) => item[keySelected] in rowSelectionState
        );
        setSelectedFlatGlobal(data);
        return data;
      });
    }
  }, [rowSelectionState]);

  return (
    <>
      <div className='overflow-x-auto flex-1'>
        <Table className='border-y border-y-default-border'>
          <TableHeader className='bg-[#f4f4f5] sticky top-0 z-50'>
            {table.getHeaderGroups().map((headerGroup, i) => {
              return (
                <TableRow key={i}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={clsx(
                          'h-[34px] font-semibold text-[12px] border-x border-x-default-border',
                          header.id === 'select' ? 'w-[45px]' : '!w-max',
                          index === 0 && 'sticky top-0 left-0 z-50 bg-[#f4f4f5]',
                          index === 1 && 'sticky top-0 left-[44px] z-50 bg-[#f4f4f5]'
                        )}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {data === null ? (
              <TableRow>
                <TableCell
                  colSpan={_header.length}
                  className='h-24 text-center'>
                  <div className='flex items-center justify-center'>
                    <Loader className='animate-spin size-4' />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => {
                return (
                  <TableRow
                    key={'row-' + row.id + '-' + i}
                    data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell, index) => {
                      return (
                        <TableCell
                          className={clsx(
                            'text-[13px] font-normal py-[6px] px-4 bg-white',
                            index === 0 && 'sticky left-0 z-20',
                            index === 1 && 'sticky left-[44px] z-20'
                          )}
                          key={'cell-' + cell._id + '-' + index}
                          onClick={() => {
                            if (cell.column.id == 'select') return;
                            onClickRow && onClickRow?.(row?.original);
                          }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={_header.length}
                  className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        total={total}
        table={table}
        onChangePage={onChangePage}
      />
    </>
  );
};

export default TableContainer;
