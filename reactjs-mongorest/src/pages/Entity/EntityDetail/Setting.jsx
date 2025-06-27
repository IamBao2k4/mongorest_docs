import { WrapperField } from '@/components/builders/elements';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

export default function Setting({ schemaBuilder, formData, setFormData }) {
  const json = schemaBuilder.json ? JSON.parse(schemaBuilder.json)?.properties || {} : {};
  const listFields = Object.keys(json)?.map((item) => ({
    value: item,
    label: json[item].title,
  }));

  return (
    <div className='flex flex-col gap-2'>
      {[
        {
          title: 'ID',
          description: 'Chọn field làm value',
          value: 'id',
        },
        {
          title: 'Title',
          description: 'Chọn field làm title',
          value: 'title',
        },

        {
          title: 'Image',
          description: 'Chọn field làm hình đại diện',
          value: 'featured_image',
        },
      ].map((item) => (
        <WrapperField
          key={item.value}
          title={item.title}
          description={item.description}>
          <Select
            onValueChange={(ev) => {
              setFormData({
                ...formData,
                settings: {
                  ...(formData?.settings || {}),
                  [item.value]: ev,
                },
              });
            }}
            value={formData?.settings?.[item.value]}
            items={listFields}>
            <SelectTrigger>
              <SelectValue placeholder='Select' />
            </SelectTrigger>
            <SelectContent>
              {listFields.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </WrapperField>
      ))}
    </div>
  );
}
