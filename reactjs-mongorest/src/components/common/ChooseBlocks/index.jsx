'use client';

import ContainerDragdrop from './ContainerDragdrop';
import Header from './Header';
import SelectBlock from './SelectBlock';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { BlocksProvider } from './context';

export default function ChooseBlocks({
  handleConfirmAddBlock,
  selects,
  setSelects,
  selectBlock,
  setSelectBlock,
}) {
  const [showTableAdd, setShowTableAdd] = useState(false);
  const handleShowTableAdd = () => setShowTableAdd(true);

  const handleCloseTableAdd = () => {
    setSelectBlock([]);
    setShowTableAdd(false);
  };

  return (
    <BlocksProvider>
      <Card>
        <CardHeader>
          <Header
            handleShowTableAdd={handleShowTableAdd}
            selects={selects}
            setSelects={setSelects}
          />
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-5'>
            <ContainerDragdrop
              selects={selects}
              setSelects={setSelects}
            />
          </div>
        </CardContent>
      </Card>
      <SelectBlock
        isOpen={showTableAdd}
        handleCloseTableAdd={handleCloseTableAdd}
        handleConfirmAddBlock={handleConfirmAddBlock}
        selectBlock={selectBlock}
        setSelectBlock={setSelectBlock}
      />
    </BlocksProvider>
  );
}
