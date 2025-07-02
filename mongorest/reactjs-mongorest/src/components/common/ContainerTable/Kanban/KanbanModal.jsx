import { Image } from '@/components/ui/Image';
import { Modal } from '@/components/ui/Modal';
import { Tag } from '@/components/ui/Tag';
import { get_path_img } from '@/helpers/get_path_img';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Calendar, Edit, User } from 'lucide-react';

export default function KanbanModal({ select = false, onCancel, data, onOk }) {
  const selectedPost =
    select && data.flatMap((list) => list.list).find((post) => post.id === select);

  return (
    <Modal
      open={select}
      onOk={onOk}
      onCancel={onCancel}
      okText={
        <div className='flex items-center gap-2'>
          <Edit />
          <span>Chỉnh sửa</span>
        </div>
      }>
      <p className='text-xs font-semibold uppercase text-slate-400'>Post detail</p>
      <h2 className='mb-3 text-2xl font-bold'>{selectedPost.title}</h2>
      {selectedPost.short_description && <p>{selectedPost.short_description}</p>}
      {selectedPost?.categories?.length > 0 && (
        <div className='flex items-center gap-2'>
          {selectedPost.categories.map((cat) => (
            <Tag key={cat.id}>{cat.name}</Tag>
          ))}
        </div>
      )}
      <div className='my-6 border-t border-[#e5e7eb] w-full'></div>
      <div className='flex items-center gap-4 mb-2 text-slate-400'>
        <User />
        <span>Created by: {selectedPost.created_by}</span>
      </div>
      <div className='flex items-center gap-4 text-slate-400'>
        <Calendar />
        <span>
          {dayjs(_.replace(selectedPost.updated_at, '0Z', '')).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      </div>

      {selectedPost.featured_image && (
        <>
          <div className='my-6 border-t border-[#e5e7eb]'></div>

          <Image
            src={get_path_img(selectedPost.featured_image.path)}
            width={240}
            height={120}
            alt={selectedPost.featured_image.alt}
            className='object-cover w-full h-fit'
          />
        </>
      )}
    </Modal>
  );
}
