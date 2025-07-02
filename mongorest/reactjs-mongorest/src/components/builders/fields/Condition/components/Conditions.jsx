import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import QueryBuilder from 'react-querybuilder';
import CustomRemove from '@/components/common/ContainerTable/Action/ButtonFilter/DrawerFilter/CustomRemove';
import CustomValueSelector from '@/components/common/ContainerTable/Action/ButtonFilter/DrawerFilter/CustomValueSelector';
import CustomOperatorSelector from '@/components/common/ContainerTable/Action/ButtonFilter/DrawerFilter/CustomOperatorSelector';
import CustomAddRule from '@/components/common/ContainerTable/Action/ButtonFilter/DrawerFilter/CustomAddRule';
import CustomAddGroup from '@/components/common/ContainerTable/Action/ButtonFilter/DrawerFilter/CustomAddGroup';
import { Fields } from '../../fields';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { memo } from 'react';
import { Tag } from '@/components/ui/Tag';
import { Populate } from '@/components/common/ContainerTable/Action/ButtonFilter/DrawerFilter/CustomValueFilter';

export const CustomValueFilterAdvance = ({
  fieldData,
  value,
  handleOnChange,
  context,
  field,
  operator,
}) => {
  const { header } = context;
  if (!fieldData || !header[fieldData?.datatype]?.component) return;
  const f = header[fieldData.datatype];
  const Comp = Fields[header[fieldData.datatype].component];

  const isSelected =
    value && typeof value === 'string' && value?.split(':')?.length === 2
      ? value?.split(':')[1]
      : null;

  const s = isSelected?.split('.')?.[0];
  return (
    <div className='render-field-query flex gap-2 w-full self-start'>
      {operator === 'populate' ? (
        <Populate
          fieldData={fieldData}
          handleOnChange={handleOnChange}
          value={typeof value === 'string' && value.startsWith('$') ? null : value}
          key={value}
        />
      ) : (
        <>
          {!s || s === 'default' ? (
            <Comp
              type='filter'
              value={fieldData.widget === 'relation' ? (Array.isArray(value) ? value : []) : value}
              onChange={(val) => handleOnChange(val)}
              schema={{
                ...f,
                ...(fieldData.widget === 'relation' ? { placeholder: 'Chọn field relation' } : {}),
              }}
            />
          ) : null}
          {s && s !== 'default' ? (
            <Input
              value={isSelected?.split('.')?.[1] || ''}
              onChange={(e) => {
                handleOnChange(`$${field}:${s}.${e.target.value}`);
              }}
            />
          ) : null}
          <Select
            placeholder={'Select'}
            defaultValue={s || 'default'}
            onValueChange={(val) => {
              if (val === 'default') {
                handleOnChange(null);
                return;
              }
              handleOnChange(val ? `$${field}:${val}` : null);
            }}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { label: 'Param', value: 'param' },
                { label: 'Header', value: 'header' },
                { label: 'Body', value: 'body' },
                { label: 'Jwt', value: 'jwt' },
                { label: 'Default', value: 'default' },
              ].map((item) => {
                return (
                  <SelectItem
                    key={item.value}
                    value={item.value}>
                    {item.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
};

function Conditions({ onChange, value, header, entity }) {
  const _rules = JSON.parse(JSON.stringify(value?.rules || []));
  const _header = JSON.parse(JSON.stringify(header));
  const _fields = _header.map((item, index) => {
    return {
      ...item,
      field: item.entity + '.' + item?.key,
      label: item.key,
      name: item.entity + '.' + item?.key,
      datatype: index,
    };
  });

  const _require =
    value && value?.rules && Array.isArray(value?.rules)
      ? value?.rules?.filter(
          (item) => typeof item?.value === 'string' && item?.value?.split(':')?.length === 2
        )
      : [];

  return (
    <div className=''>
      {_require && _require?.length > 0 && (
        <div className='flex gap-2 items-center pb-2'>
          <p className='text-sm'>Required: </p>
          <div className='flex gap-1'>
            {_require?.map((item) => {
              return (
                <div>
                  <Tag key={item?.field}>{item?.field}</Tag>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
        <QueryBuilder
          context={{ header: _fields, currentRules: _rules, entity }}
          showNotToggle={false}
          showCloneButtons={false}
          fields={_fields}
          controlElements={{
            valueEditor: CustomValueFilterAdvance,
            fieldSelector: CustomValueSelector,
            operatorSelector: CustomOperatorSelector,
            valueSourceSelector: CustomValueSelector,
            removeRuleAction: CustomRemove,
            addRuleAction: CustomAddRule,
            addGroupAction: CustomAddGroup,
          }}
          query={value}
          onQueryChange={onChange}
        />
      </QueryBuilderDnD>
    </div>
  );
}

export default memo(Conditions);
