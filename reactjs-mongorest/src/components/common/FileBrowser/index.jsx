import { Upload } from '@/components/ui/Upload';
import { FormImage } from '@/components/common/Media';
import { ENUM_TYPE_SELECT_ROW } from '@/data/enum';
import { mediaApi } from '@/services/index';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import ContainerTable from '../ContainerTable';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet';
import { useParams } from 'react-router-dom';

const useStyles = createUseStyles({
  file: {
    backgroundColor: 'white !important',
    border: '1px dashed #327EE2 !important',
    borderRadius: '8px !important',
  },
  'ant-modal-header': {
    backgroundColor: '#FAFAFA',
  },
  'ant-modal': {
    backgroundColor: '#FAFAFA',
  },
});

const FileBrowser = ({ schema, open, setOpen, onOk, file = null }) => {
  const [idMedia, setIdMedia] = useState('');
  const [selectFolder, setSelectFolder] = useState([]);
  const [getDataAgain, setGetDataAgain] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const param = useParams();
  const { getMediaList } = mediaApi(param.lang);
  const classes = useStyles();

  useEffect(() => {
    if (Array.isArray(file) && file?.length > 0) {
      const _files = JSON.parse(JSON.stringify(file));
      setSelectedRowIds(_files?.filter((item) => item && item?._id).map((item) => item._id));
    }
  }, [file]);

  const onClickMedia = async (obj) => {
    if (obj?.length > 0) {
      setIdMedia(obj[0]);
    }
  };

  const onUpdateAgain = () => {
    setGetDataAgain(true);
  };
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}>
      <SheetContent className='sm:max-w-[70%] overflow-hidden flex flex-col'>
        <SheetHeader className=''>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <SheetTitle>Image</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
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
                onClick={() => onOk(selectedRowIds)}>
                Xác nhận
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className='flex flex-col overflow-hidden'>
          <div className='shadow-md'>
            <Upload
              className={`${classes.file}`}
              selectFolder={selectFolder}
              setSelectFolder={setSelectFolder}
              isDragger
              cb={() => setGetDataAgain(true)}
            />
          </div>
          <div className='overflow-auto'>
            <ContainerTable
              entity={'media'}
              isShowTree={false}
              getData={getMediaList}
              deleteData={() => {}}
              dataCb={selectFolder[0] ? { 'search[folder:in]': selectFolder[0] } : null}
              isModal
              select={selectedRowIds}
              setSelect={setSelectedRowIds}
              onClickRow={onClickMedia}
              setGetDataAgain={setGetDataAgain}
              getDataAgain={getDataAgain}
              typeSelectRow={
                schema?.widget === 'multipleFiles'
                  ? ENUM_TYPE_SELECT_ROW.checkbox
                  : ENUM_TYPE_SELECT_ROW.radio
              }
            />
          </div>
        </div>

        <FormImage
          idMedia={idMedia}
          setIdMedia={setIdMedia}
          onUpdateAgain={onUpdateAgain}
        />
      </SheetContent>
    </Sheet>
  );
};

export default FileBrowser;
