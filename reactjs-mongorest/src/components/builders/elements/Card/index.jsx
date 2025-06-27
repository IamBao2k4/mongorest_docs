'use client';

import CardGeneralParameterInputs from '../CardGeneralParameterInputs';
import CardModal from '../CardModal';
import CardShadow from '@/components/common/Card';
import { Collapse } from '..';
import { useState } from 'react';

export default function Card({
  componentProps,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  cloneCardObj,
  isArray,
  isForm = false,
  TypeSpecificParameters,
  cardOpen,
  setCardOpen,
  allFormInputs,
  mods,
  showObjectNameInput = true,
  elKey = null,
  fields,
  type,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <CardShadow>
      <Collapse
        isOpen={cardOpen}
        keyObject={elKey || componentProps.path}
        toggleCollapse={() => setCardOpen(!cardOpen)}
        componentProps={componentProps}
        title={
          <h3 className='mb-0 font-bold text-left'>
            {componentProps.title || componentProps.name}
          </h3>
        }
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        cloneCardObj={cloneCardObj}
        isArray={isArray}
        onChange={onChange}
        type={type}>
        <div className='flex flex-col gap-5'>
          <CardGeneralParameterInputs
            fields={fields}
            parameters={componentProps}
            onChange={onChange}
            allFormInputs={allFormInputs}
            mods={mods}
            showObjectNameInput={showObjectNameInput}
            type={type}
          />
          <CardModal
            type={type}
            componentProps={componentProps}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onChange={(newComponentProps) => {
              onChange(newComponentProps);
            }}
            TypeSpecificParameters={TypeSpecificParameters}
          />
        </div>
      </Collapse>
    </CardShadow>
  );
}
