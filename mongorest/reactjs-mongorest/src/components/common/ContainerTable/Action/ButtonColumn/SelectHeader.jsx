import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { changePositionArray } from '@/helpers/changePositionArray';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';

function SelectHeader({ header: headerProps, pathProp, onChangeHeader, handleCloseHeader }) {
  const [header, setHeader] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);

  const preHeader = useRef();
  const timeout = useRef();

  const onDrag = (fromIndex, toIndex) => {
    if (fromIndex !== toIndex) {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setHeader((prev) => {
          const updated = changePositionArray(prev, fromIndex, toIndex);
          return [...updated];
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('header-custom')) {
      const _list = JSON.parse(localStorage.getItem('header-custom'))['header-custom' + pathProp];
      if (_list) setHeader(_list);
      else setHeader(headerProps);
    } else {
      setHeader(headerProps);
    }

    preHeader.current = JSON.parse(JSON.stringify(header));
    if (headerProps?.filter((item) => item.isCheck === true)?.length === headerProps?.length) {
      setCheckAll(true);
      setIndeterminate(false);
    } else {
      setCheckAll(false);
      setIndeterminate(true);
    }
  }, [headerProps]);

  const handleChangeHeader = (value, index) => {
    const dataColumn = JSON.parse(JSON.stringify(header));
    dataColumn[index].isCheck = value;
    setIndeterminate(
      !!dataColumn.filter((item) => item.isCheck === true).length &&
        dataColumn.filter((item) => item.isCheck === true).length < dataColumn.length
    );
    setCheckAll(dataColumn.filter((item) => item.isCheck === true).length === dataColumn.length);
    setHeader(dataColumn);
  };

  const onCheckAllChange = (checked) => {
    const dataColumn = JSON.parse(JSON.stringify([...header]));
    if (checked) {
      for (let index = 0; index < dataColumn.length; index++) {
        dataColumn[index].isCheck = true;
      }
    } else {
      for (let index = 0; index < dataColumn.length; index++) {
        dataColumn[index].isCheck = false;
      }
    }
    setHeader(dataColumn);
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const handleConfirmHeader = () => {
    handleCloseHeader();
    onChangeHeader([...header]);
  };

  const renderDragHeader = (item, index) => {
    let topAttribute = '';

    switch (index) {
      case 0:
        topAttribute = '!top-[15%]';
        break;
      case 1:
        topAttribute = '!top-[20%]';
        break;
      case 2:
        topAttribute = '!top-[30%]';
        break;
      case 3:
        topAttribute = '!top-[35%]';
        break;
      case 4:
        topAttribute = '!top-[40%]';
        break;
      case 5:
        topAttribute = '!top-[50%]';
        break;
      case 6:
        topAttribute = '!top-[60%]';
        break;
      case 7:
        topAttribute = '!top-[65%]';
        break;
      case 8:
        topAttribute = '!top-[70%]';
        break;
      case 9:
        topAttribute = '!top-[65%]';
        break;

      default:
        break;
    }

    return (
      <Draggable
        key={index?.toString()}
        draggableId={index?.toString()}
        index={index}>
        {(providedDraggable, snapshot) => {
          return (
            <div
              className={cn(
                snapshot.isDragging ? `!left-[10%] ${topAttribute}` : '',
                'flex items-center'
              )}
              ref={providedDraggable.innerRef}
              {...providedDraggable.draggableProps}>
              <GripVertical {...providedDraggable.dragHandleProps} />
              <div className='flex gap-1'>
                <Checkbox
                  checked={item.isCheck || false}
                  onCheckedChange={(checked) => handleChangeHeader(checked, index)}
                />
                <span className='text-xs font-normal'>{item.title}</span>
              </div>
            </div>
          );
        }}
      </Draggable>
    );
  };

  return (
    <div className='flex flex-col gap-4'>
      <DragDropContext
        onDragEnd={(result) => {
          onDrag(result?.source?.index, result?.destination?.index);
        }}>
        <div className='max-h-[300px] overflow-y-auto'>
          <div className='flex flex-col gap-2'>
            <Checkbox
              indeterminate={indeterminate}
              onCheckedChange={onCheckAllChange}
              checked={indeterminate ? 'indeterminate' : checkAll}>
              All
            </Checkbox>
            <Droppable
              droppableId='droppable'
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}>
              {(providedDroppable) => (
                <div
                  ref={providedDroppable.innerRef}
                  {...providedDroppable.droppableProps}>
                  {header?.map((item, index) => renderDragHeader(item, index))}
                  {providedDroppable.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      <div className='flex gap-2'>
        <Button
          className='flex-1 h-8'
          variant='outline'
          onClick={handleCloseHeader}
          size='sm'>
          Hủy
        </Button>
        <Button
          className='flex-1 h-8'
          onClick={handleConfirmHeader}
          size='sm'>
          Xác nhận
        </Button>
      </div>
    </div>
  );
}

export default SelectHeader;
