import { DateAndTime } from '@/components/builders/fields';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';

function ChooseDate({ date, onChange, title, disabledDate }) {
  return (
    <div className='flex item-center'>
      <p className='text-white mb-0'>{`${title}: ${
        date
          ? `${new Date(date).toLocaleDateString('vi-vn')} : ${new Date(date).toLocaleTimeString(
              'vi-vn'
            )}`
          : 'Không xác định'
      }`}</p>
      <div>
        <Popover
          getPopupContainer={(trigger) => trigger.parentElement}
          placement='top'
          trigger='click'>
          <PopoverContent className='w-fit'>
            <DateAndTime
              schema={{
                title,
                displayFormat: 'YYYY-MM-DD HH:mm:ss',
                formatDate: 'date-time',
              }}
              disabledDate={disabledDate}
              value={date}
              onChange={onChange}
              style={{ width: '100%' }}
            />
          </PopoverContent>
          <PopoverTrigger>
            <p className='mb-0 ml-2 font-bold underline text-[#40a9ff] cursor-pointer'>Thay đổi</p>
          </PopoverTrigger>
        </Popover>
      </div>
    </div>
  );
}

export default ChooseDate;
