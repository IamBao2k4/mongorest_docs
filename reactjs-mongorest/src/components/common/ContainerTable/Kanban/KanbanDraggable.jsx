import { Draggable } from 'react-beautiful-dnd';
import { get_path_img } from '@/helpers/get_path_img';
import dayjs from 'dayjs';
import { Image } from '@/components/ui/Image';
import { createUseStyles } from 'react-jss';
import { useCommon } from '@/context/common';
import { Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

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

export default function KanbanDraggable({
  draggableId,
  index,
  onClick,
  imgPath,
  description,
  title,
  createdAt,
}) {
  const classes = useStyles();
  const { pageElement } = useCommon();
  return (
    <Draggable
      draggableId={draggableId}
      index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={classes.customScrollbar}>
          <Card
            style={{
              boxShadow: snapshot.isDragging
                ? '0 2px 4px rgba(0, 0, 0, 0.08)'
                : '0 1.5px 3px rgba(0, 0, 0, 0.05)',
              transform: snapshot.isDragging ? 'rotate(5deg)' : '',
            }}
            className={`card-sm mb-3 mr-2 transition duration-200 p-4 bg-slate-600`}
            onClick={onClick}
            cover={
              imgPath && (
                <Image
                  variant='top'
                  src={get_path_img(imgPath)}
                  alt={description || title}
                  width={240}
                  height={120}
                  style={{ objectFit: 'contain' }}
                />
              )
            }>
            <div>
              <p className='mb-3 font-semibold'>{title}</p>
              {description && <p>{description}</p>}
              <div className='me-3 flex items-center gap-1 text-sx text-slate-400'>
                <Settings2 className='w-5 h-5' />
                <span className='text-xs'>
                  {dayjs(_.replace(createdAt, '0Z', '')).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
