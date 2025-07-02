'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ChooseDate from './ChooseDate';
import { useParams } from 'react-router-dom';

function Advance({
  className,
  advanceData = {
    valueDateStart: '',
    valueDateEnd: '',
    valueStatus: '',
    language: '',
    setLanguage: () => {},
    onRevision: null,
    languageAvailable: [],
  },
  loadingData,
  onSubmit,
  advanceFooter,
}) {
  const params = useParams();
  const [showModalReject, setShowModalReject] = useState(false);
  const isCreatePage = params?.id === 'new';
  const status = params?.id === 'new' ? 0 : advanceData?.valueStatus;
  const { rules } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dateStart, setDateStart] = useState();
  const [dateEnd, setDateEnd] = useState();

  const {
    control,
    formState: { errors },
    trigger,
    getValues,
    reset,
  } = useForm();

  useEffect(() => {
    setDateStart(advanceData?.valueDateStart || dayjs().toISOString());
    setDateEnd(advanceData?.valueDateEnd || null);
  }, [advanceData?.valueDateStart, advanceData?.valueDateEnd]);

  const handleSubmitForm = async () => {
    const valid = await trigger();
    if (valid) {
      const { message } = getValues();
      onSubmitData(5, null, message);
      reset({ message: '' });
    }
  };

  const onSubmitData = async (_status = status, otherLanguage, mess) => {
    try {
      setLoading(true);
      await onSubmit({
        is_active: !_status ? -1 : _status,
        published_start: dateStart || null,
        published_end: dateEnd || null,
        ...(otherLanguage ? { otherLanguage } : {}),
        ...(mess ? { messageReject: mess } : {}),
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('🚀 ~ file: SubmitCard.js:58 ~ onSubmit ~ err:', err);
    }
  };

  const checkStatus = (type) => {
    return rules.findIndex((item) => item === type) !== -1;
  };

  const nextStatus = useMemo(() => {
    if (([-1, 5].includes(status) && (checkStatus(-1) || checkStatus(5))) || !status) {
      return {
        title: 'Send to Review',
        type: 3,
      };
    }

    if (status === 3 && checkStatus(3)) {
      return {
        title: 'Send to Public',
        type: 2,
      };
    }

    if (status === 2 && checkStatus(2)) {
      return {
        title: 'Send to Marketing',
        type: 6,
      };
    }

    if (status === 6 && checkStatus(6)) {
      return {
        title: 'Public',
        type: 1,
      };
    }

    return null;
  }, [status]);

  const onChangeDateStart = (date) => {
    setDateStart(date || null);
  };
  const onChangeDateEnd = (date) => {
    setDateEnd(date || null);
  };

  const disable = loading || loadingData;

  const hasDraft = checkStatus(-1) && ([-1, 5].includes(status) || isCreatePage);
  const hasUnpublish = checkStatus(7) && status === 1;
  const hasReject = !isCreatePage && ![-1, 5].includes(status) && checkStatus(status);
  const hasNext = status !== 1 && nextStatus;
  return (
    <div className={`${className}`}>
      <div className='flex flex-col gap-3 px-10 py-2'>
        {hasNext || checkStatus(1) || checkStatus(7) ? (
          <div className='flex justify-end gap-4'>
            <ChooseDate
              title={'Thời gian bắt đầu'}
              date={dateStart}
              onChange={onChangeDateStart}
            />
            <ChooseDate
              title={'Thời gian kết thúc'}
              date={dateEnd}
              onChange={onChangeDateEnd}
              disabledDate={(current) => current < dayjs(dateStart)}
            />
          </div>
        ) : null}

        <div className='relative flex items-center justify-end'>
          <div className='flex gap-2'>
            {advanceFooter}
            {hasDraft ? (
              <Button
                id='btn-draft'
                variant='secondary'
                size='sm'
                loading={disable}
                disabled={disable}
                onClick={() => {
                  onSubmitData(-1);
                }}>
                Draft
              </Button>
            ) : null}

            {hasReject ? (
              <Button
                id='btn-back-data'
                variant='destructive'
                size='sm'
                loading={disable}
                onClick={() => {
                  setShowModalReject(true);
                }}>
                Reject
              </Button>
            ) : null}

            {hasUnpublish ? (
              <Button
                loading={disable}
                size='sm'
                onClick={() => {
                  onSubmitData(7);
                }}>
                {'Unpublish'}
              </Button>
            ) : null}

            {isCreatePage ? (
              <Button
                loading={disable}
                size='sm'
                onClick={() => {
                  onSubmitData(-1, params.lang === 'vi' ? 'en' : 'vi');
                }}>
                {'Create other Languages'}
              </Button>
            ) : null}

            {hasNext ? (
              <Button
                id='btn-save-data'
                size='sm'
                variant='outline'
                loading={disable}
                onClick={() => {
                  onSubmitData(nextStatus?.type);
                }}>
                {nextStatus?.title}
              </Button>
            ) : null}

            {status !== 6 && (checkStatus(6) || checkStatus(1)) ? (
              <Button
                variant='outline'
                size='sm'
                loading={disable}
                onClick={() => {
                  onSubmitData(1);
                }}>
                Force Publish
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        width={500}
        open={showModalReject}
        centered
        title='Lý do từ chối'
        okText='Từ chối'
        okType='danger'
        cancelText='Hủy'
        onCancel={() => setShowModalReject(false)}
        onOk={() => {
          handleSubmitForm();
        }}>
        <form
          layout='vertical'
          name='form_in_modal'>
          <Controller
            name='message'
            control={control}
            rules={{ required: 'Field is required!' }}
            render={({ field }) => (
              <Textarea
                {...field}
                label='Nhập lý do'
                multiline
                rows={6}
                inputProps={{ maxLength: 254 }}
                errorText={errors.message ? errors.message.message : ''}
                variant='outlined'
                fullWidth
              />
            )}
          />
        </form>
      </Modal>
    </div>
  );
}

export default Advance;
