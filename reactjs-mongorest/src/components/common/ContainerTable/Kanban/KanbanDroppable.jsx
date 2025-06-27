import { Spin } from '@/components/ui/Spin';
import { useCommon } from '@/context/common';
import { Droppable } from 'react-beautiful-dnd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  customScrollbar: {
    '&::-webkit-scrollbar': {
      width: '5px',
      height: '5px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#aaa',
      'border-radius': '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#dedede',
      'border-radius': '8px',
    },
  },
});

export default function KanbanDroppable({
  isLoading,
  droppableId,
  droppableTitle,
  dataLength,
  next,
  hasMore,
  children,
  loadingText,
}) {
  const classes = useStyles();
  const { themeDark } = useCommon();
  return (
    <Spin spinning={isLoading}>
      <Droppable
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
        droppableId={droppableId}
        key={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minWidth: '350px',
              marginTop: 10,
            }}>
            <div
              id='scrollableDiv'
              className={`${classes.scrollDiv} rounded-md relative py-4 pl-4 pr-2 bg-gray-500`}>
              <div className='flex items-center justify-between mb-4 card-header-flush'>
                <h4 className='text-base font-bold card-header-title text-neutral-500'>
                  {droppableTitle}
                </h4>
              </div>
              <InfiniteScroll
                className={`scroll ${classes.customScrollbar} pb-10 transition duration-300`}
                dataLength={dataLength}
                height={'65vh'}
                next={next}
                hasMore={hasMore}
                loader={
                  <div className='flex flex-col items-center justify-center'>
                    <div
                      className='spinner-border text-primary'
                      role='status'>
                      <span className='visually-hidden'>Loading...</span>
                    </div>
                    <p className='mt-6'>{loadingText}</p>
                  </div>
                }>
                {children}
              </InfiniteScroll>
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Spin>
  );
}
