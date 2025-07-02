'use client';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { formatDataSubmit } from '@/hooks/useServiceDetail/utils';
import { entityDataApi } from '@/services/entity-data';
import * as utils from '@formulajs/formulajs';
import { Code } from 'lucide-react';
import { useState } from 'react';
import { useTable } from '../../table-context';
Object.assign(globalThis, utils);

function ButtonFunction({}) {
  const { toast } = useToast();
  const { func, selectedFlat, properties, entity } = useTable();

  const [loading, setLoading] = useState(false);

  const handleConfirmHeader = async () => {
    try {
      setLoading(true);
      const _selected = JSON.parse(JSON.stringify(selectedFlat));
      if (_selected?.length > 0) {
        // Sử dụng vòng lặp for thay cho map
        for (let i = 0; i < _selected.length; i++) {
          const item = _selected[i];
          if (func && func?.length > 0 && func?.[0]?.code) {
            const _func = new Function('row', func?.[0]?.code);
            _func(item);
          }

          const _res = {
            _id: item._id,
          };
          formatDataSubmit(_res, item, properties);
          _selected[i] = _res;
        }
      }

      const _res = await entityDataApi().updateMultiData({ entity, data: _selected });
      if (_res) {
        toast({ description: 'Update success' });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ handleConfirmHeader ~ error:', error);
    }
  };

  return (
    <Button
      loading={loading}
      onClick={handleConfirmHeader}
      variant='outline'
      className='gap-1 border-none shadow-none'>
      <Code className='size-4' />
      <span className='sr-only sm:not-sr-only sm:whitespace-nowrap text-sm text-default-black'>
        Save Function
      </span>
    </Button>
  );
}

export default ButtonFunction;
