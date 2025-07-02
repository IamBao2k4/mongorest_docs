// TreeExample.jsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet';
import { Tree } from '@/components/ui/Tree';
import { formatChildsToChildren } from '@/helpers/formatChildsToChildren';
import useServiceDetail from '@/hooks/useServiceDetail';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ContainerForm from '../ContainerForm';
import { useDebounce } from '@/hooks/useDebounce';
import { entityDataApi } from '@/services';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

const Categories = ({ category, handleSelect, entity }) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSearch, setDataSearch] = useState([]);
  const [cateSelected, setCateSelected] = useState({});
  const [open, setOpen] = useState(false);
  const search = useDebounce(searchTerm, 500);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const keyCategory = category?.key || 'categories-validate';
  const { schema, formData, setFormData, onChangeFormData, errors, onSubmit } = useServiceDetail({
    entity: keyCategory,
    notInitData: true,
    id: cateSelected?._id,
  });

  const handleDrop = (info, updatedData) => {
    setData(updatedData);
  };

  const allowDrop = ({ dropNode, dropPosition }) => {
    if (dropNode.isLeaf && dropPosition === 0) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!search) return;
    fetchData(search);
  }, [search]);

  const fetchData = async (_searchTerm = '') => {
    try {
      const _params = {
        limit: 1000,
      };

      if (_searchTerm) {
        _params['search[title:contains]'] = _searchTerm;
      }

      if (entity?.type === 'post-type') {
        _params['search[post_type:in]'] = entity?._id;
      }

      const res = await entityDataApi().getTree({
        entity: keyCategory,
        params: _params,
      });

      if (res) {
        if (_searchTerm) {
          setDataSearch(res.data.documents);
        } else {
          setData(formatChildsToChildren(res.data.documents));
        }
      }
    } catch (error) {
      console.log('🚀 ~ fetchData ~ error:', error?.response?.data?.message);
    }
  };

  const handleAdd = async () => {
    const res = await onSubmit();
    if (res) {
      if (cateSelected?._id) {
        setCateSelected(null);
        fetchData();
      } else {
        setData([res?.data, ...data]);
      }
    }
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
    fetchData();
  };

  const handleCallbackAction = async ({ action, node }) => {
    if (action === 'add') {
      setOpen(true);
      setFormData({});
    }

    if (action === 'edit') {
      const _data = await entityDataApi().getDetail({ entity: keyCategory, id: node._id });
      setFormData(_data?.data);
      setCateSelected(_data?.data);
      setOpen(true);
    }

    if (action === 'delete') {
      setShowModalDelete(node._id);
    }
  };

  const removeCateInState = (idToRemove) => {
    const removeNodeById = (nodes) => {
      return nodes
        .filter((node) => node._id !== idToRemove)
        .map((node) => ({
          ...node,
          children: node.children ? removeNodeById(node.children) : [],
          childs: node.childs ? removeNodeById(node.childs) : [],
        }));
    };
    const _data = JSON.parse(JSON.stringify(data));
    const newData = removeNodeById(_data);
    setData(newData);
  };

  const handleDelete = async () => {
    try {
      await entityDataApi().deleteData({
        entity: keyCategory,
        ids: showModalDelete,
      });
      removeCateInState(showModalDelete);
      setShowModalDelete(false);
    } catch (error) {
      console.log('🚀 ~ handleDelete ~ error:', error);
    }
  };

  return (
    <div className='flex flex-1 overflow-hidden flex-col p-2 bg-[#F9F9F9]'>
      <div className='flex flex-1 overflow-auto flex-col gap-2'>
        <div className='flex gap-2'>
          <div className='relative w-full'>
            <Input
              className='!text-xs pr-8'
              placeholder='Tìm kiếm...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div
                className='absolute top-1/2 right-1 transform -translate-y-1/2 p-2 cursor-pointer'
                onClick={() => setSearchTerm('')}>
                <X className='size-3' />
              </div>
            )}
          </div>
          <div
            className='w-8 h-8 flex items-center justify-center rounded-sm bg-black/10 shrink-0 cursor-pointer'
            onClick={() => {
              setFormData({});
              setOpen(true);
            }}>
            <Plus className='w-4 h-4 text-black/80' />
          </div>
        </div>
        <div className='flex-1'>
          <Tree
            data={searchTerm ? dataSearch : data}
            draggable
            onDrop={handleDrop}
            onSelect={handleSelect}
            allowDrop={allowDrop}
            defaultExpandAll={true}
            cacllbackAction={handleCallbackAction}
            entity={category?.typeRelation?.title}
          />
        </div>
        <Sheet
          open={open}
          onOpenChange={() => {
            handleClose();
          }}>
          <SheetContent className='sm:max-w-[70%] overflow-hidden flex flex-col p-0'>
            <SheetHeader className='px-4 pt-4'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <SheetTitle>Categories</SheetTitle>
                  <SheetDescription>
                    This action cannot be undone. This will permanently delete your account and
                    remove your data from our servers.
                  </SheetDescription>
                </div>
                <div className={'flex gap-2'}>
                  <Button
                    type='button'
                    onClick={() => setOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    type='button'
                    onClick={handleAdd}>
                    Xác nhận
                  </Button>
                </div>
              </div>
            </SheetHeader>
            <div className='flex flex-1 overflow-auto px-4'>
              <ContainerForm
                key={JSON.stringify(open)}
                entity={keyCategory}
                schema={schema}
                onChangeFormData={onChangeFormData}
                formData={formData}
                errors={errors}
              />
            </div>
          </SheetContent>
        </Sheet>
        <Dialog
          open={showModalDelete}
          onOpenChange={setShowModalDelete}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Xoá</DialogTitle>
              <DialogDescription>Xác nhận xoá category</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant='outline'
                  className='w-[120px]'
                  onClick={() => setShowModalDelete(false)}>
                  Huỷ
                </Button>
              </DialogClose>
              <Button
                className='w-[120px]'
                onClick={handleDelete}>
                Xoá
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Categories;
