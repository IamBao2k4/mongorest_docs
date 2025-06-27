import { SkeletonParagraph } from '@/components/ui/Skeleton';
import { useEffect, useState } from 'react';
import KanbanDragDropContext from './KanbanDragDropContext';
import KanbanDraggable from './KanbanDraggable';
import KanbanDroppable from './KanbanDroppable';
import KanbanModal from './KanbanModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Kanban({ tabs, id, type, getData, updateData }) {
  const { toast } = useToast();
  const [d, setD] = useState(null);
  const [select, setSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);
  const navigate = useNavigate();

  const getMorePosts = async (tab, index) => {
    const result = await getData({ page: tab.page + 1, searchType: tab.type });
    if (result?.data) {
      const copy = JSON.parse(JSON.stringify(d));
      copy[index] = {
        ...copy[index],
        page: copy[index].page + 1,
        list: [...copy[index].list, ...result.data],
      };
      setD([...copy]);
    }
  };

  useEffect(() => {
    async function getInit() {
      if (tabs) {
        setLoading(true);
        const tabsExcludeMe = tabs.filter((tab) => !tab.key.includes('me@') && tab.key !== '');

        const result = await Promise.all(
          tabsExcludeMe.map(async (item) => {
            const get = await getData({ searchType: item.key });
            return {
              ...item,
              last_page: get.meta.last_page,
              page: 1,
              total: get.meta.total,
              list: get.data,
            };
          })
        );
        if (result) {
          setD(result);
        }
        setLoading(false);
      }
    }
    getInit();
  }, [tabs, id]);

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.index === source.index && destination.droppableId === source.droppableId)
    ) {
      return;
    }

    const clonedData = JSON.parse(JSON.stringify(d));
    const initialData = JSON.parse(JSON.stringify(d));

    const { droppableId: sourceId, index: sourceIndex } = source;
    const { droppableId: destinationId, index: destinationIndex } = destination;

    if (sourceId === destinationId) {
      const listToUpdate = clonedData.find((list) => list.key === sourceId)?.list;
      const [itemToReplace] = listToUpdate.splice(sourceIndex, 1);
      listToUpdate.splice(destinationIndex, 0, itemToReplace);
    } else {
      const listToRemove = clonedData.find((list) => list.key === sourceId)?.list;
      const listToAdd = clonedData.find((list) => list.key === destinationId)?.list;
      const [itemToReplace] = listToRemove.splice(sourceIndex, 1);
      listToAdd.splice(destinationIndex, 0, itemToReplace);
    }
    setD(clonedData);

    setIsSendingData(true);

    try {
      const updateResult = await updateData(draggableId, destinationId);

      if (!updateResult) {
        setD(initialData);
        toast('Thất bại');
      } else {
        toast('Thành công');
      }
      setIsSendingData(false);
    } catch (error) {
      toast('Thất bại');
      setD(initialData);
      setIsSendingData(false);
    }
  }

  return (
    <>
      {loading ? (
        <SkeletonParagraph />
      ) : (
        <>
          <KanbanDragDropContext onDragEnd={onDragEnd}>
            {d &&
              d.map((column, index) => (
                <KanbanDroppable
                  isLoading={isSendingData}
                  key={column.key.toString()}
                  droppableId={column.key.toString()}
                  droppableTitle={`${column.label.replace(/\s*\(.*?\)\s*/g, '')} (${
                    column.list.length
                  })`}
                  dataLength={column.list.length}
                  next={() => {
                    getMorePosts(column, index);
                  }}
                  hasMore={column.page < column.last_page}
                  loadingText={`Hiển thị ${column.list.length} trên ${column.total}`}>
                  {column.list.map((item, index) => (
                    <KanbanDraggable
                      draggableId={item?.id?.toString()}
                      key={item.id}
                      index={index}
                      onClick={() => setSelect(item.id)}
                      imgPath={item.featured_image?.path}
                      description={item.short_description || item.meta?.meta_title}
                      title={item.title}
                      createdAt={item.updated_at}
                    />
                  ))}
                </KanbanDroppable>
              ))}
          </KanbanDragDropContext>

          <KanbanModal
            select={select}
            onCancel={() => setSelect(false)}
            data={d}
            onOk={() => {
              select && navigate(`${router.asPath}/${select}`);
            }}
          />
        </>
      )}
    </>
  );
}
