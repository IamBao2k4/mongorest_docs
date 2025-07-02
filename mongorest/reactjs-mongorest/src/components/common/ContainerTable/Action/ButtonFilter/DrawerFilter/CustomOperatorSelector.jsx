import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import _ from 'lodash';

const defaultOperatorsFilter = [
  { name: 'equal', value: 'equal', label: 'equal' },
  { name: 'notEqual', value: 'notEqual', label: 'notEqual' },
  { name: 'gt', value: 'gt', label: 'gt' },
  { name: 'lt', value: 'lt', label: 'lt' },
  { name: 'gte', value: 'gte', label: 'gte' },
  { name: 'lte', value: 'lte', label: 'lte' },
  { name: 'contains', value: 'contains', label: 'contains' },
  { name: 'beginsWith', value: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', value: 'endsWith', label: 'ends with' },
  { name: 'doesNotContain', value: 'doesNotContain', label: 'does not contain' },
  { name: 'doesNotBeginWith', value: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'doesNotEndWith', value: 'doesNotEndWith', label: 'does not end with' },
  { name: 'null', value: 'null', label: 'is null' },
  { name: 'notNull', value: 'notNull', label: 'is not null' },
  { name: 'in', value: 'in', label: 'in' },
  { name: 'notIn', value: 'notIn', label: 'not in' },
  { name: 'between', value: 'between', label: 'between' },
  { name: 'notBetween', value: 'notBetween', label: 'not between' },
];

const defaultOperators = [
  { name: 'populate', value: 'populate', label: 'populate' },
  { name: '=', value: '=', label: '=' },
  { name: '!=', value: '!=', label: '!=' },
  { name: '<', value: '<', label: '<' },
  { name: '>', value: '>', label: '>' },
  { name: '<=', value: '<=', label: '<=' },
  { name: '>=', value: '>=', label: '>=' },
  { name: 'contains', value: 'contains', label: 'contains' },
  { name: 'beginsWith', value: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', value: 'endsWith', label: 'ends with' },
  { name: 'doesNotContain', value: 'doesNotContain', label: 'does not contain' },
  { name: 'doesNotBeginWith', value: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'doesNotEndWith', value: 'doesNotEndWith', label: 'does not end with' },
  { name: 'null', value: 'null', label: 'is null' },
  { name: 'notNull', value: 'notNull', label: 'is not null' },
  { name: 'in', value: 'in', label: 'in' },
  { name: 'notIn', value: 'notIn', label: 'not in' },
  { name: 'between', value: 'between', label: 'between' },
  { name: 'notBetween', value: 'notBetween', label: 'not between' },
];

const CustomOperatorSelector = function ({ context, options, handleOnChange, ...props }) {
  const { currentRules, operator } = context;

  let filteredOptions = _.cloneDeep(
    operator === 'filter' ? options || defaultOperatorsFilter : defaultOperators
  );

  if (!!currentRules.length) {
    currentRules.forEach((rule) => {
      if (rule.field === props.value) return;
      filteredOptions = filteredOptions.filter((opt) => opt.name !== rule.field);
    });
  }

  return (
    <Select
      {...props}
      className='w-[140px] shrink-0 !self-start'
      onValueChange={(value) => {
        handleOnChange(value);
      }}>
      <SelectTrigger className='w-[140px] h-8 shrink-0 !self-start'>
        <SelectValue className='text-sm text-default-black line-clamp-1' />
      </SelectTrigger>
      <SelectContent>
        {filteredOptions.map((item, index) => (
          <SelectItem
            key={index}
            value={item.name}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomOperatorSelector;
