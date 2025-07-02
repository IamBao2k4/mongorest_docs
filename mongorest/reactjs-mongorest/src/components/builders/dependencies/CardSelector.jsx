import { SelectMultiple } from '@/components/ui/SelectMultiple';
import { Tag } from '@/components/ui/Tag';
import React from 'react';

export default function CardSelector({
  possibleChoices,
  chosenChoices,
  onChange,
  placeholder,
  path,
}) {
  return (
    <React.Fragment>
      <div className='mb-2'>
        {chosenChoices.map((chosenChoice, index) => (
          <Tag
            key={index}
            closable
            onClose={() =>
              onChange([...chosenChoices.slice(0, index), ...chosenChoices.slice(index + 1)])
            }>
            {chosenChoice}
          </Tag>
        ))}
      </div>
      <SelectMultiple
        values={[]}
        placeholder={placeholder}
        style={{ width: '100%' }}
        onChange={(_, item) => {
          onChange([...chosenChoices, item.value]);
        }}
        options={possibleChoices
          .filter((choice) => !chosenChoices.includes(choice))
          .map((choice) => ({
            value: choice,
            label: choice,
          }))}
      />
    </React.Fragment>
  );
}
