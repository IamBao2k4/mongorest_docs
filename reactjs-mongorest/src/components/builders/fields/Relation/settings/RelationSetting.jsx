import { TextError } from '@/components/builders/elements';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Info } from 'lucide-react';
import { RelationEdit } from '../components';
import Condition from '../../Condition';

function RelationSetting({ parameters, onChange }) {
  return (
    <div>
      <div className='flex gap-2 mb-2'>
        <p>Is Tree</p>
        <Switch
          checked={parameters?.is_tree}
          onCheckedChange={(val) => {
            onChange({ ...parameters, is_tree: val });
          }}
        />
      </div>
      <div className='flex gap-2 mb-2'>
        <p className='w-20 text-sm'>Type Select</p>
        <Select
          onValueChange={(val) => onChange({ ...parameters, typeSelect: val })}
          defaultValue={parameters?.typeSelect}>
          <SelectTrigger>
            <SelectValue placeholder='Select' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='once'>Once</SelectItem>
            <SelectItem value='multi'>Multiple</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='grid grid-cols-2 gap-5'>
        <div className='col-span-2 flex flex-col gap-5'>
          <RelationItem
            title='Entity'
            children={
              <RelationEdit
                schema={{
                  title: '',
                  description: '',
                  typeSelect: 'once',
                  typeRelation: {
                    title: 'entity',
                    entity: 'entity',
                  },
                }}
                value={parameters?.typeRelation ? [parameters?.typeRelation] : []}
                onChange={(data) => {
                  if (data?.length > 0) {
                    onChange({
                      ...parameters,
                      typeRelation: {
                        _id: data?.[0]?.mongodb_collection_name,
                        title: data?.[0]?.mongodb_collection_name,
                        type: parameters?.typeRelation?.type || 'n-1',
                      },
                    });
                  }
                }}
              />
            }
          />
          <RelationItem
            title='Posttype'
            children={
              <RelationEdit
                schema={{
                  title: '',
                  description: '',
                  typeSelect: 'once',
                  typeRelation: {
                    title: 'post-type',
                    entity: 'post-type',
                  },
                }}
                value={parameters?.typeRelation ? [parameters?.typeRelation] : []}
                onChange={(data) => {
                  if (data?.length > 0) {
                    onChange({
                      ...parameters,
                      typeRelation: {
                        _id: data?.[0]?.mongodb_collection_name,
                        title: data?.[0]?.mongodb_collection_name,
                        type: parameters?.typeRelation?.type || 'n-1',
                      },
                    });
                  }
                }}
              />
            }
          />
        </div>

        {parameters?.typeRelation ? (
          <div className='col-span-2'>
            <Condition
              value={parameters?.typeRelation?.filter}
              formContext={{ formData: { post_type: [parameters?.typeRelation] } }}
              onChange={(data) => {
                onChange({
                  ...parameters,
                  typeRelation: {
                    ...(parameters?.typeRelation || {}),
                    filter: data,
                  },
                });
              }}
            />
          </div>
        ) : null}

        <Select
          defaultValue={parameters?.typeRelation?.type || 'n-1'}
          onValueChange={(data) => {
            onChange({
              ...parameters,
              typeRelation: {
                ...(parameters?.typeRelation || {}),
                type: data,
              },
            });
          }}
          className='w-full'>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select field' />
          </SelectTrigger>
          <SelectContent>
            {[
              { label: '1-1', value: '1-1' },
              { label: '1-n', value: '1-n' },
              { label: 'n-1', value: 'n-1' },
              { label: 'n-n', value: 'n-n' },
            ]?.map((item) => {
              return (
                <SelectItem
                  className='px-5'
                  value={item?.value}>
                  {item.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
export default RelationSetting;

const RelationItem = ({ title, required, children, error, ...props }) => {
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex flex-row items-center gap-3'>
        <Label className='text-xs font-semibold w-max shrink-0'>
          {title} {required ? <span className='text-red-600'>*</span> : null}
        </Label>
        {props?.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info
                  size={18}
                  color='#000000'
                  className='cursor-pointer'
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{props?.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
      <TextError text={error} />
    </div>
  );
};
