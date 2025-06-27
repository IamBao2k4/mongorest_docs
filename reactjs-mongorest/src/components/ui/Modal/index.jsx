import { cn } from '@/lib/utils';
import { Button } from '../Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Modal';

export const Modal = ({
  open,
  onCancel,
  title,
  description,
  children,
  footer,
  okText = 'Ok',
  cancelText = 'Cancel',
  onOk,
  afterClose,
  okButtonProps,
  cancelButtonProps,
  showOkButton,
  classNameContent,
  loading,
  width = 500,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel?.();
          afterClose?.();
        }
      }}>
      <DialogContent
        className={cn(classNameContent)}
        style={{ maxWidth: width || 'max-content' }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          {footer ? (
            footer
          ) : (
            <div className='flex gap-2'>
              <Button
                loading={loading}
                {...cancelButtonProps}
                onClick={onCancel}
                variant='secondary'>
                {cancelText}
              </Button>
              {!showOkButton && (
                <Button
                  loading={loading}
                  {...okButtonProps}
                  onClick={() => {
                    onOk?.();
                  }}>
                  {okText}
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
