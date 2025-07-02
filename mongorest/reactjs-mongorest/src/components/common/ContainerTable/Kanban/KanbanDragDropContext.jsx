import {DragDropContext} from 'react-beautiful-dnd';
import {createUseStyles} from 'react-jss';

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

export default function KanbanDragDropContext({onDragEnd, children}) {
  const classes = useStyles();
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className={`${classes.customScrollbar} grid grid-flow-col gap-5 pb-5 overflow-x-scroll`}>
        {children}
      </div>
    </DragDropContext>
  );
}
