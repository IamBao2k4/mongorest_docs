'use client';

import { useAuth } from '@/context/AuthContext';
import { ENUM_TYPE_SELECT_ROW } from '@/data/enum';
import { handleExportExcel } from '@/helpers/exportExcel';
import formatKeyFilter from '@/helpers/formatKeyFilter';
import getHeaderDefault from '@/helpers/getHeaderDefault';
import saveFilterLStorage from '@/helpers/saveFiltersIntoLocalStorage';
import { cn } from '@/lib/utils';
import { categoriesApi } from '@/services/category';
import { relationAPI } from '@/services/relation';
// import Categories from 'containers/Categories';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Action from './Action';
import AlertTable from './AlertTable';
import Table from './Table';
import Gallery from './Gallery';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Categories from '../Categories';

const initialQuery = {
  combinator: 'and',
  rules: [],
};

export default function ContainerTable({
  select = [],
  setSelect,
  selectFlat,
  setSelectFlat,
  disableRowSelect = false,
  getDataAgain = false,
  setGetDataAgain,
  isModal = false,
  typeSelectRow = ENUM_TYPE_SELECT_ROW.checkbox,
  onClickRow,
  dataCb = null,
  getDataTree,
  tagsLimit = null,
  isShowTree,
  isShowAction = true,
  headerDefault,
  exportExcel = null,
  onClickBtn,
  hideButtonCreate,
  keySelected,
  actions,
  entity,
  extraAler,
  ...props
}) {
  const containerRef = useRef(null);
  const params = useParams();
  const { toast } = useToast();
  const { pathname, search } = useLocation();
  const router = useNavigate();
  const searchParams = new URLSearchParams(search);
  const { jsonSchema } = useAuth();
  const { lang } = params;
  const [layout, setLayout] = useState('table');
  const [header, setHeader] = useState(() => {
    if (headerDefault) return headerDefault;
    const defaultHeader = getHeaderDefault(pathname);
    return defaultHeader ? defaultHeader : jsonSchema?.[entity]?.filter;
  });

  const [textSearch, setTextSearch] = useState('');
  const [state, setState] = useState({
    data: null,
    meta: {},
  });
  const { getRelations } = relationAPI(lang);
  const [queryFilter, setQueryFilter] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleShowTree, setToggleShowTree] = useState(isShowTree);
  const [selectFolder, setSelectFolder] = useState([]);
  const [getDataCateAgain, setGetDataCateAgain] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshSelecred, setRefreshSelecred] = useState(false);
  const [queryUrl, setQueryUrl] = useState(() => {
    const isInDialog = containerRef.current?.closest('[role="dialog"]') !== null;
    if (isInDialog) {
      return {};
    }
    const _default = Object.fromEntries(searchParams.entries());
    if (localStorage.getItem('pageSize'))
      _default.limit = entity === 'media' ? 20 : localStorage.getItem('pageSize');
    return _default;
  });

  const hasCategories = header?.find(
    (item) => item.dataIndex === 'categories' || item.dataIndex === 'category'
  );

  const { getCategoryList, deleteCategories, deleteFolder, getCategoryListByPosttype } =
    categoriesApi(lang);

  const valueConfig = {};

  const removeChildEmpty = (data) => {
    if (data?.children?.length) {
      return {
        ...data,
        children: data.children.map((item) => removeChildEmpty(item)),
      };
    }
    return {
      ...data,
      children: null,
    };
  };

  const createQueryString = useCallback((paramsObject) => {
    const params = new URLSearchParams();
    for (const key in paramsObject) {
      if (paramsObject.hasOwnProperty(key)) {
        params.set(key, paramsObject[key]);
      }
    }
    return params.toString();
  }, []);

  useEffect(() => {
    if (!isModal) {
      const q = queryUrl ? JSON.parse(JSON.stringify(queryUrl)) : {};
      delete q['pid'];
      delete q['id'];
      const newUrl = pathname + '?' + createQueryString(q);
      router(newUrl);
    }
  }, [queryUrl]);

  useEffect(() => {
    getData();
  }, [queryUrl, lang]);

  useEffect(() => {
    if (dataCb) {
      const copy = queryUrl;
      Object.keys(dataCb).map((item) => {
        copy[item] = dataCb[item];
      });

      setQueryUrl({ ...copy });
    }
  }, [dataCb]);

  useEffect(() => {
    if (getDataAgain) {
      getData();
      setGetDataAgain(false);
    }
  }, [getDataAgain]);

  async function getData() {
    setIsLoading(true);
    await onGetData();
    await convertRouteToFilterTable({ ...queryUrl });
    setIsLoading(false);
  }

  const exportExcelData = async () => {
    const cpQueryUrl = { ...queryUrl };
    const result = await props.getData({
      params: {
        ...cpQueryUrl,
        limit: 'all',
      },
    });
    const filteredResult = result.data.map((item) => {
      const newItem = { ...item };
      header.forEach((headerItem) => {
        if (!headerItem.isCheck && newItem.hasOwnProperty(headerItem.objectKey)) {
          delete newItem[headerItem.objectKey];
        }
      });
      return newItem;
    });

    handleExportExcel(filteredResult);
  };

  const onGetData = async () => {
    const cpQueryUrl = { ...queryUrl };
    const result = await props.getData({
      params: {
        ...cpQueryUrl,
      },
    });

    if (result?.data) {
      setState({
        data: result?.data,
        meta: result?.meta,
      });
    }
  };

  const convertRouteToFilterTable = async (obj) => {
    if (!obj) return;
    const key = Object.keys(obj).map((item) => item.replace(/search\[|\]/g, ''));

    let arrFilter = [];

    for (let index = 0; index < key.length; index++) {
      const keyConvert = key[index].split(':');
      if (keyConvert?.length === 2) {
        const field = header?.find((item) => item.key === keyConvert[0]);

        const checkMe = _.startsWith(obj[`search[${key[index]}]`], 'me@');
        const valueSearch = checkMe
          ? _.replace(obj[`search[${key[index]}]`], 'me@', '')
          : obj[`search[${key[index]}]`];
        if (field?.widget === 'relation') {
          let { data } = await getRelations({
            [`search[_id:in]`]: valueSearch,
            url: field.typeRelation.title,
          });
          arrFilter.push({
            label: field?.title,
            field: keyConvert[0],
            operator: keyConvert[1],
            value: data,
          });
        } else {
          arrFilter.push({
            field: keyConvert[0],
            operator: keyConvert[1],
            value: valueSearch,
            label: field?.title,
          });
        }
      }
    }

    setQueryFilter({
      combinator: 'and',
      rules: arrFilter.length > 0 ? arrFilter : initialQuery.rules,
    });
  };

  const onChangePage = (pagination) => {
    setQueryUrl((pre) => {
      const newURL = {
        ...pre,
        page: pagination?.current,
        limit: pagination?.pageSize,
      };
      return newURL;
    });
  };

  const onChangeTextSearch = () => {
    const findHeaderHaveName = header?.find((item) =>
      ['username', 'title', 'name'].includes(item.key)
    );

    setQueryUrl((pre) => {
      return {
        ...pre,
        [`search[${findHeaderHaveName?.key || 'title'}:contains]`]: textSearch,
        page: 1,
      };
    });
  };

  const removeAllFilter = () => {
    setQueryUrl({});
  };

  const handleDeleteTag = (type) => {
    const copy = JSON.parse(JSON.stringify(queryUrl));
    delete copy[type];
    delete copy['pid'];
    setQueryUrl({ ...copy });
  };

  const onChangeHeader = (value) => {
    setHeader([...value]);
    if (isModal) return;
    saveFilterLStorage(pathname, value, 'header-custom');
  };

  const handleSelectTree = (selectedId) => {
    const id = selectedId?.[0];
    if (id) {
      setQueryUrl((pre) => {
        return { [`search[${hasCategories?.key}:in]`]: id, limit: pre?.limit || 10 };
      });
    }
  };

  const handleDeleteCategory = async (id, _params, isCategory = true) => {
    try {
      setIsDeleting(true);
      if (!isCategory) {
        await deleteFolder({
          id,
          params: _params,
          posttype: 'media',
        });
      } else {
        await deleteCategories({
          id,
          params,
          posttype: params?.pid || 'media',
        });
      }
      setGetDataCateAgain(true);
      toast({ title: 'Thành công!' });
      setSelectFolder([]);
      setQueryUrl((pre) => {
        const cate = pre?.['search[categories.id:in]'];
        if (cate) {
          const array = cate
            ?.toString()
            ?.split(',')
            ?.filter((item) => item !== id.toString());
          if (array?.length > 0) {
            return { ...pre, 'search[categories.id:in]': array.join() };
          } else {
            delete pre?.['search[categories.id:in]'];
            return { ...pre };
          }
        }

        return { ...pre };
      });
      setIsDeleting(false);
    } catch (err) {
      console.log('🚀 ~ file: index.js:693 ~ handleDeleteCategory ~ err:', err);
      setIsDeleting(false);
    }
  };

  const onChangeFilter = () => {
    if (queryFilter?.rules?.length > 0) {
      const data = formatKeyFilter(queryFilter?.rules);
      setQueryUrl(data);
    }
  };

  const _propsTable = useMemo(
    () => ({
      isModal,
      header,
      data: state?.data,
      total: state?.meta?.total,
      onChangePage,
      setFilterQuery: setQueryUrl,
      onClickRow,
      current: queryUrl?.page || 1,
      pageSize: queryUrl?.limit || 10,
      loading: isLoading,
      typeSelectRow: typeSelectRow,
      select,
      setSelect,
      disableRowSelect: !!!header?.length ? true : disableRowSelect,
      isCategories: props?.isCategories,
      isAttribute: props?.isAttribute,
      getDataTree,
      tagsLimit,
      keySelected,
      actions,
      lang,
      setSelectFlat,
      refreshSelecred,
      setRefreshSelecred,
    }),
    [
      state,
      header,
      isLoading,
      select,
      setSelect,
      selectFlat,
      setSelectFlat,
      refreshSelecred,
      setRefreshSelecred,
    ]
  );

  const _propsAction = useMemo(
    () => ({
      exportExcel: exportExcel
        ? typeof exportExcel === 'boolean'
          ? exportExcelData
          : exportExcel
        : null,
      pathProp: pathname,
      onChangeFilter,
      header,
      showTree: isShowTree && valueConfig.isShowToggleCategory,
      showFilter: valueConfig.isShowFilter,
      showSearch: valueConfig.isShowSearchInput,
      toggleTree: () => {
        setToggleShowTree(!toggleShowTree);
      },
      textSearch,
      onChangeTextSearch: setTextSearch,
      enterSearch: onChangeTextSearch,
      onChangeHeader,
      removeAllFilter,
      query: queryFilter,
      queryUrl,
      setQuery: setQueryFilter,
      handleDeleteTag,
      onClickBtn,
      hideButtonCreate: hideButtonCreate || isModal,
      layout,
      setLayout,
      entity,
      getData,
    }),
    [textSearch, queryFilter, layout, setLayout, toggleShowTree, getData]
  );

  const _propsCate = useMemo(
    () => ({
      isDeleting,
      isCategories: entity === 'media' || !entity ? 'media' : entity,
      setGetDataAgain: setGetDataCateAgain,
      getDataAgain: getDataCateAgain,
      setSelect: setSelectFolder,
      select: selectFolder,
      handleSelect: handleSelectTree,
      handleDeleteCategory: handleDeleteCategory,
    }),
    [selectFolder, getDataCateAgain]
  );

  return (
    <>
      <div
        className={`flex w-full overflow-y-auto flex-1`}
        ref={containerRef}>
        {hasCategories ? (
          <div
            className={cn(
              'transition-all shrink-0 overflow-hidden flex',
              toggleShowTree ? 'w-[250px]' : 'w-0'
            )}>
            <Categories
              {..._propsCate}
              category={hasCategories}
              entity={jsonSchema?.[entity]}
            />
          </div>
        ) : null}

        <div className='flex flex-col flex-1 overflow-hidden'>
          {isShowAction ? (
            <Action
              {..._propsAction}
              hasCategories={hasCategories}
            />
          ) : null}
          {layout === 'table' ? <Table {..._propsTable} /> : null}
          {layout === 'gallery-base' || layout === 'gallery-lg' ? (
            <Gallery
              {..._propsTable}
              layout={layout}
            />
          ) : null}
        </div>
      </div>
      <AlertTable
        open={!isModal && select.length > 0}
        select={select}
        setSelect={setSelect}
        selectFlat={selectFlat}
        setSelectFlat={setSelectFlat}
        isCategories={props?.isCategories}
        getDataAgain={getData}
        onDelete={props.deleteData}
        selectFolder={selectFolder}
        extraAler={extraAler}
        setRefreshSelecred={setRefreshSelecred}
      />
    </>
  );
}
