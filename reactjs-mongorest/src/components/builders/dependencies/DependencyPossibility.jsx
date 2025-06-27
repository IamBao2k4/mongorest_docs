import { Button } from '@/components/ui/Button';
import React from 'react';
import CardSelector from './CardSelector';
import ValueSelector from './ValueSelector';
import { Card } from '@/components/ui/Card';

export default function DependencyPossibility({
  possibility,
  neighborNames,
  path,
  onChange,
  onDelete,
  parentEnums,
  parentType,
  parentName,
  parentSchema,
}) {
  return (
    <Card style={{ padding: 10 }}>
      <div className='flex justify-between gap-2'>
        <div className='mb-4'>
          <h5 className='text-sm font-bold'>Display the following:</h5>
          <span className='text-xs'>Choose the other form elements that depend on this one</span>
        </div>
        <Button
          onClick={() => onDelete()}>
          Delete Dependency
        </Button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <CardSelector
          possibleChoices={neighborNames.filter((name) => name !== parentName) || []}
          chosenChoices={possibility.children}
          onChange={(chosenChoices) => onChange({ ...possibility, children: [...chosenChoices] })}
          placeholder='Choose a dependent...'
          path={path}
        />
      </div>

      {possibility.value ? (
        <>
          <p className='mb-2 text-sm'>
            If "{parentName}" has {possibility.value ? 'the value:' : 'a value.'}
          </p>
          <ValueSelector
            possibility={possibility}
            onChange={(newPossibility) => onChange(newPossibility)}
            parentEnums={parentEnums}
            parentType={parentType}
            parentName={parentName}
            parentSchema={parentSchema}
            path={path}
          />
        </>
      ) : null}
    </Card>
  );
}
