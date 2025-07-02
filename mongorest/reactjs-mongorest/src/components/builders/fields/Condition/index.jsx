import { WrapperField } from '@/components/builders/elements';
import DrawerFilter from '@/components/common/ContainerTable/Action/ButtonFilter/DrawerFilter';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import Conditions from './components/Conditions';
import { Button } from '@/components/ui/Button';
import { convertValueToIds } from '@/hooks/useServiceDetail/utils';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/use-toast';

const Condition = ({ value, schema, onChange, formContext: { formData } }) => {
  const typeUI = schema?.typeUI || 'filter';
  const { jsonSchema } = useAuth();
  const [copy, setCopy] = useState(null);
  const { toast } = useToast();
  const [filter, setFilter] = useState({ queryString: '', queryObject: {} });
  const [typeFilter, setTypeFilter] = useState(null);
  const arrayFilter = value
    ? value
    : {
        combinator: 'and',
        rules: value || [],
      };

  const _key = schema?.fieldRelation || 'post_type';
  const _firstData = formData?.[_key]?.[0];
  const valuePosttype = _firstData?.mongodb_collection_name || _firstData?.title || null;

  const headerReview = useMemo(() => {
    const val = [];
    if (formData?.[_key]?.length > 0) {
      const _data = formData?.[_key];
      _data?.map((item) => {
        const entity = item?.mongodb_collection_name || item?.title;
        const filter = JSON.parse(JSON.stringify(jsonSchema?.[entity]?.filter || []));
        const _filter = filter.map((item, index) => {
          return {
            ...item,
            entity,
            name: item.key,
            field: item.key,
            datatype: index,
            label: item.title,
          };
        });
        val.push(..._filter);
      });
    }
    return val;
  }, [JSON.stringify(formData?.[_key])]);

  const handleChangeData = (data) => {
    onChange(data);
  };

  const handleCopy = () => {
    const _res = convertValueToIds(value);
    const queryString = objectToQueryStringWithIndex(_res);
    navigator.clipboard
      .writeText(decodeURIComponent(queryString))
      .then(() => {
        toast({ description: 'Copy thành công' });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  useEffect(() => {
    try {
      if (value) {
        const _res = convertValueToIds(value);
        const { queryString, queryObject } = objectToQueryStringWithIndex(_res);
        setFilter({ queryString, queryObject });
        setCopy(decodeURIComponent(queryString));
      }
    } catch (error) {
      console.log('🚀 ~ useEffect ~ error:', error);
    }
  }, [value]);

  if (!valuePosttype || !(headerReview?.length > 0)) return <></>;
  return (
    <div className='relative'>
      <WrapperField
        title={schema?.title}
        required={schema?.required}
        description={schema?.description}>
        {typeUI === 'filter' ? (
          <DrawerFilter
            query={arrayFilter}
            setQuery={handleChangeData}
            header={[...headerReview]}
            operator='filter'
          />
        ) : (
          <Conditions
            onChange={handleChangeData}
            header={headerReview}
            value={value}
            entity={formData?.[_key]}
          />
        )}
      </WrapperField>
      {typeUI === 'filter' && (
        <>
          <div className='mt-5'>
            <p className='text-xs text-black/80 pb-1'>New Params .v2</p>
            <Textarea
              value={copy}
              className='w-full h-auto'
            />
          </div>
          <div className='flex gap-4 my-4'>
            <Button
              onClick={() => setTypeFilter('v2')}
              type='button'>
              Preview Data Filter .v2
            </Button>
          </div>
        </>
      )}

      {/* <Code
        value={filter.queryObject}
        className='mt-4'
      /> */}

      <div className='pt-2'>
        <Button
          variant='outline'
          onClick={handleCopy}
          type='button'>
          Copy URL Params
        </Button>
      </div>
    </div>
  );
};

export default Condition;

function objectToQueryStringWithIndex(obj, prefix = '', index = 0) {
  let str = [];
  let resultObject = {};
  let currentPrefix = prefix ? `${prefix}[${index}]` : `search_v2[${index}]`;

  if (obj.rules) {
    let combinator = obj.combinator || 'and';
    str.push(`${currentPrefix}[combinator]=${combinator}`);
    resultObject[`${currentPrefix}[combinator]`] = combinator;

    obj.rules.forEach((rule, subindex) => {
      // Nếu rule chứa các rule con, đệ quy vào
      if (rule.rules) {
        const { queryString, queryObject } = objectToQueryStringWithIndex(
          rule,
          `${currentPrefix}`,
          subindex
        );
        str.push(queryString);
        Object.assign(resultObject, queryObject);
      } else {
        const key = `${currentPrefix}[${subindex}][${rule.field}:${rule.operator}]`;
        const value = encodeURIComponent(rule.value);

        str.push(`${key}=${value}`);
        resultObject[key] = rule.value;
      }
    });
  } else {
    const key = `${currentPrefix}[${obj.field}:${obj.operator}]`;
    const value = encodeURIComponent(obj.value);

    str.push(`${key}=${value}`);
    resultObject[key] = obj.value;
  }

  return { queryString: str.join('&'), queryObject: resultObject };
}
