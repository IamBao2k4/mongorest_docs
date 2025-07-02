import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import QueryBuilder from 'react-querybuilder';
import CustomRemove from './CustomRemove';
import CustomValueFilter from './CustomValueFilter';
import CustomValueSelector from './CustomValueSelector';
import CustomOperatorSelector from './CustomOperatorSelector';
import CustomAddRule from './CustomAddRule';
import CustomAddGroup from './CustomAddGroup';
import CustomCombinator from './CustomCombinator';
import { useState } from 'react';
import { listCondition } from '@/data/enum';

const DrawerFilter = ({
  header,
  query,
  setQuery,
  enableDragAndDrop = true,
  controlElements = {},
  isShowCheckbox,
  context = {},
  callbackChecked,
  operator,
}) => {
  const [data, setData] = useState(query);
  const handleChangeCheckbox = (value, key) => {
    callbackChecked && callbackChecked(value, key);
  };

  const handleChange = (val) => {
    setData(val);
    setQuery(val);
  };

  const _renderField = (data) => {
    return Array?.isArray(data) && data.length
      ? data
          .filter((item) => item.filter)
          .map((item, index) => {
            const codd = item?.condition
              ? item?.condition === 'all'
                ? listCondition
                : listCondition.filter((item2) => item?.condition.includes(item2.name))
              : [];
            return {
              label: item.title,
              title: item.title,
              name: item.dataIndex,
              defaultOperator: item.defaultOperator,
              operators: codd,
              datatype: index,
              ...(item?.defaultValue && { defaultValue: item.defaultValue }),
            };
          })
      : [];
  };

  const builder = (
    <QueryBuilder
      context={{
        header,
        currentRules: query?.rules || [],
        handleChangeCheckbox,
        isShowCheckbox,
        operator,
        ...context,
      }}
      enableDragAndDrop={enableDragAndDrop}
      showNotToggle={false}
      showCloneButtons={false}
      fields={_renderField(header)}
      controlElements={{
        valueEditor: CustomValueFilter,
        addGroupAction: CustomAddGroup,
        combinatorSelector: CustomCombinator,
        fieldSelector: CustomValueSelector,
        operatorSelector: CustomOperatorSelector,
        valueSourceSelector: CustomValueSelector,
        removeRuleAction: CustomRemove,
        removeGroupAction: CustomRemove,
        addRuleAction: CustomAddRule,
        ...controlElements,
      }}
      query={data}
      onQueryChange={(q) => {
        handleChange(q);
      }}
    />
  );
  if (!enableDragAndDrop) {
    return builder;
  }
  return (
    <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>{builder}</QueryBuilderDnD>
  );
};
export default DrawerFilter;
