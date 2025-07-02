import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

function Tenant() {
  const { handleChangeTenant, listTenant } = useAuth();
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (listTenant?.length === 1 && listTenant?.[0]?.value) {
      handleChangeTenant(listTenant?.[0]?.value);
    }
  }, [listTenant]);

  if (listTenant?.length <= 1) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-[48] bg-white flex justify-center items-center'>
      <div className='w-[400px] flex flex-col gap-5'>
        <div>
          <p className='text-[20px] font-semibold'>Tenant</p>
          <p className='mb-2 text-[14px]'>Chọn tenant hiển thị</p>
          <Select
            value={value}
            onValueChange={(data) => {
              setValue(data);
            }}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Theme' />
            </SelectTrigger>
            <SelectContent>
              {listTenant?.map((item) => {
                return (
                  <SelectItem
                    key={item.value}
                    value={item.value}>
                    {item.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            if (value) {
              handleChangeTenant(value);
            }
          }}>
          Lưu dữ liệu
        </Button>
      </div>
    </div>
  );
}

export default Tenant;
