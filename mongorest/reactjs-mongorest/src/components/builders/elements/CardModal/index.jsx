'use client';

import React, { useEffect, useState } from 'react';
import DependencyField from '../../dependencies/DependencyField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export default function CardModal({ type, componentProps, onChange, TypeSpecificParameters }) {
  const [showModal, setShowModal] = useState(false);
  const [componentPropsState, setComponentProps] = useState(componentProps);

  useEffect(() => {
    setComponentProps(componentProps);
  }, [componentProps]);

  return (
    <div>
      <p className='text-[22px] font-bold mb-3'>Additional Settings</p>
      <div>
        <TypeSpecificParameters
          parameters={componentPropsState}
          neighborNames={componentPropsState?.neighborNames || []}
          onChange={(newState) => {
            onChange({
              ...componentPropsState,
              ...newState,
            });
          }}
        />
      </div>

      <p className='text-[22px] font-bold mt-5 mb-3'>Dependencies</p>
      <Button onClick={() => setShowModal(true)}>
        <span>Configure dependencies</span>
      </Button>
      <Dialog
        open={showModal}
        onOpenChange={(val) => {
          if (!val) {
            onChange({
              ...componentPropsState,
            });
          }
          setShowModal(val);
        }}>
        <DialogContent className='sm:max-w-[700px] max-h-[800px] overflow-auto'>
          <DialogHeader>
            <DialogTitle>Dependencies</DialogTitle>
            <DialogDescription>Configure dependencies for this element.</DialogDescription>
          </DialogHeader>
          <DependencyField
            parameters={componentPropsState}
            onChange={(newState) => {
              const val = {
                ...componentPropsState,
                ...newState,
              };

              if (newState?.dependents?.length > 0) {
                const dependents = [...newState.dependents];
                const itemHaveChildren = dependents?.filter((item) => item?.children?.length > 0);

                if (itemHaveChildren?.length > 0) {
                  val.dependents = dependents;
                }
              }

              setComponentProps(val);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
