'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useStyles } from './styles';
import { Trash2 } from 'lucide-react';

export default function CardEnumOptions({ initialValues, names, showNames, onChange, type }) {
  const classes = useStyles();
  const possibleValues = [];
  for (let index = 0; index < initialValues.length; index += 1) {
    const value = initialValues[index];
    let name = `${value}`;
    if (names && index < names.length) name = names[index];
    possibleValues.push(
      <div
        key={index}
        className={classes.cardEnumOption}>
        <Input
          value={value === undefined || value === null ? '' : value}
          placeholder='Possible Value'
          style={{ width: '100%' }}
          key={`val-${index}`}
          type={type === 'string' ? 'text' : 'number'}
          onChange={(ev) => {
            let newVal;
            switch (type) {
              case 'string':
                newVal = ev.target.value;
                break;
              case 'number':
              case 'integer':
                newVal = parseFloat(ev.target.value);
                if (Number.isInteger(newVal)) newVal = parseInt(ev.target.value, 10);
                if (Number.isNaN(newVal)) newVal = type === 'string' ? '' : 0;
                break;
              default:
                throw new Error(`Enum called with unknown type ${type}`);
            }
            onChange(
              [...initialValues.slice(0, index), newVal, ...initialValues.slice(index + 1)],
              names
            );
          }}
        />
        <Input
          value={name || ''}
          placeholder='Label'
          key={`name-${index}`}
          type='text'
          onChange={(ev) => {
            if (names)
              onChange(initialValues, [
                ...names.slice(0, index),
                ev.target.value,
                ...names.slice(index + 1),
              ]);
          }}
          style={{ display: showNames ? 'initial' : 'none', width: '100%' }}
        />

        <Trash2
          style={{ fontSize: 22, color: 'red' }}
          onClick={() => {
            onChange(
              [...initialValues.slice(0, index), ...initialValues.slice(index + 1)],
              names ? [...names.slice(0, index), ...names.slice(index + 1)] : undefined
            );
          }}
        />
      </div>
    );
  }

  return (
    <>
      {possibleValues}

      <Button
        type='primary'
        onClick={() => {
          onChange(
            [...initialValues, type === 'string' ? '' : 0],
            names ? [...names, ''] : undefined
          );
        }}>
        Add Value
      </Button>
    </>
  );
}
