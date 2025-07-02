import { useRelation } from '@/components/builders/fields/Relation/context';
import { ENUM_TYPE_SELECT_TAG } from '@/data/enum';
import { useEffect, useRef, useState } from 'react';
import DragdropTags from './DragdropTags';
import DropdownSelect from './DropdownSelect';
import formatKeyFilter from '@/helpers/formatKeyFilter';

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
const TagsElement = ({
  type = null,
  typeComponent,
  typeSearch = ENUM_TYPE_SELECT_TAG.multiple,
  getDataProp,
  onEnterInput = () => {},
  onChange = () => {},
  isDisable = false,
  schema,
  inforFields,
  classContainer,
}) => {
  const timeoutRef = useRef(null);
  const [value, setValue] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [loadingInput, setLoadingInput] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const { onChangeProps, selectedValue } = useRelation();

  const handleGetData = async (flag, page, isSearch) => {
    if (flag) {
      await getDataSearch(searchValue, page, isSearch);
    }
  };

  async function getDataSearch(val = '', page = 1, isSearch = true) {
    setLoadingInput(isSearch); //Không loading khi đang loadmore
    setEmpty(false);
    let _filter = {};
    if (type?.filter && type?.filter?.rules?.length > 0) {
      _filter = formatKeyFilter(type?.filter?.rules);
    }
    const result = await getDataProp({
      params: {
        page,
        limit: 10,
        ...(val
          ? { [`search[${type?._id === 'user' ? 'username' : 'title'}:contains]`]: val }
          : {}),
        ..._filter,
      },
    });
    if (result.data) {
      const _data = JSON.parse(JSON.stringify(result.data));
      if (isSearch) {
        setPage(1);
        setLastPage(result?.meta?.last_page || 1);
        setValue([..._data]);
      } else {
        setValue((pre) => {
          return [...pre, ..._data];
        });
      }
      if (_data?.length === 0) setEmpty(true);
    }
    setLoadingInput(false);
  }

  const onSearchInput = async (val) => {
    setLoadingInput(true);
    setSearchValue(val);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      getDataSearch(val);
    }, 500);
  };

  const onChangeCheckbox = (checked, tag) => {
    if (typeSearch === ENUM_TYPE_SELECT_TAG.once) {
      onChangeProps([tag]);
    } else {
      if (checked) {
        onChangeProps([...selectedValue, tag]);
      } else {
        onChangeProps(selectedValue.filter((val) => val._id != tag._id));
      }
    }
  };

  return (
    <>
      <DropdownSelect
        page={page}
        setPage={setPage}
        lastPage={lastPage}
        handleGetData={handleGetData}
        typeSearch={typeSearch}
        loadingInput={loadingInput}
        searchValue={searchValue}
        onChangeCheckbox={onChangeCheckbox}
        onEnterInput={() => onEnterInput(searchValue)}
        onSearchInput={onSearchInput}
        placeholder={schema.placeholder}
        value={value}
        selectedValue={selectedValue}
        isDisable={isDisable}
        tagsLimit={Number.isInteger(schema.tagsLimit) ? schema.tagsLimit : null}
        typeComponent={typeComponent}
        type={type}
        inforFields={inforFields}
        classContainer={classContainer}
      />
      <DragdropTags
        selected={selectedValue}
        onChange={onChange}
        isDisable={isDisable}
        onChangeProps={onChangeProps}
        type={type}
      />
    </>
  );
};

export default TagsElement;
