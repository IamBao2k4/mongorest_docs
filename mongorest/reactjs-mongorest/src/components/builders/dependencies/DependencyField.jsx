import { Button } from '@/components/ui/Button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { useState } from 'react';
import { getRandomId } from '../../../helpers/utils';
import DependencyPossibility from './DependencyPossibility';

function checkIfValueBasedDependency(dependents) {
  let valueBased = true;
  if (dependents && Array.isArray(dependents) && dependents.length > 0) {
    dependents.forEach((possibility) => {
      if (!possibility.value || !possibility.value.enum) {
        valueBased = false;
      }
    });
  } else {
    valueBased = false;
  }

  return valueBased;
}

export default function DependencyField({ parameters, onChange }) {
  const [elementId] = useState(getRandomId());
  const valueBased = checkIfValueBasedDependency(parameters.dependents || []);
  return (
    <div>
      {!!parameters.dependents && parameters.dependents.length > 0 && (
        <div className='mb-3'>
          <RadioGroup
            onValueChange={(value) => {
              const selection = value;
              if (parameters.dependents) {
                const newDependents = [...parameters.dependents];
                if (selection === 'definition') {
                  parameters.dependents.forEach((possibility, index) => {
                    newDependents[index] = {
                      ...possibility,
                      value: null,
                    };
                  });
                } else {
                  parameters.dependents.forEach((possibility, index) => {
                    newDependents[index] = {
                      ...possibility,
                      value: { enum: [] },
                    };
                  });
                }
                onChange({
                  ...parameters,
                  dependents: newDependents,
                });
              }
            }}
            defaultValue={valueBased ? 'value' : 'definition'}>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value={'definition'}
                id='definition'
              />
              <label htmlFor='definition'>Any value dependency</label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value={'value'}
                id='value'
              />
              <label htmlFor='value'>Specific value dependency</label>
            </div>
          </RadioGroup>
        </div>
      )}
      <div className='flex flex-col gap-4'>
        {parameters.dependents
          ? parameters.dependents.map((possibility, index) => (
              <DependencyPossibility
                possibility={possibility}
                neighborNames={parameters.neighborNames || []}
                parentEnums={parameters.choices}
                parentType={parameters.type}
                parentName={parameters.name}
                parentSchema={parameters.schema}
                path={parameters.path}
                key={`${elementId}_possibility${index}`}
                onChange={(newPossibility) => {
                  const newDependents = parameters.dependents ? [...parameters.dependents] : [];
                  newDependents[index] = newPossibility;
                  onChange({
                    ...parameters,
                    dependents: newDependents,
                  });
                }}
                onDelete={() => {
                  const newDependents = parameters.dependents ? [...parameters.dependents] : [];
                  onChange({
                    ...parameters,
                    dependents: [
                      ...newDependents.slice(0, index),
                      ...newDependents.slice(index + 1),
                    ],
                  });
                }}
              />
            ))
          : ''}

        <Button
          className='w-[200px]'
          onClick={() => {
            const newDependents = parameters.dependents ? [...parameters.dependents] : [];
            newDependents.push({
              children: [],
              value: valueBased ? { enum: [] } : undefined,
            });
            onChange({
              ...parameters,
              dependents: newDependents,
            });
          }}>
          Add another Dependency
        </Button>
      </div>
    </div>
  );
}
