'use client';

import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function Default({ loadingData, isDisable, onSubmit, advanceFooter }) {
  const [loading, setLoading] = useState(false);
  const onSubmitData = async () => {
    try {
      setLoading(true);
      await onSubmit();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('🚀 ~ file: SubmitCard.js:57 ~ onSubmit ~ err:', err);
    }
  };

  const disable = loading || loadingData;
  return (
    <div className='flex justify-end w-full gap-2'>
      {advanceFooter}
      <Button
        id='btn-2'
        className='w-24 h-8'
        loading={disable}
        disabled={isDisable || disable}
        onClick={onSubmitData}>
        Lưu
      </Button>
    </div>
  );
}

export default Default;
