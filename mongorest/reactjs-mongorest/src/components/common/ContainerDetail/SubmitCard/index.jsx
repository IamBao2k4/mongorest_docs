import Advance from './Advance';
import Default from './Default';

const SubmitCard = ({
  onSubmit,
  advanceData = null,
  preview,
  onPreview,
  isDisable = false,
  previewTitle,
  loadingProps,
  bodyClassName = '',
  advanceFooter,
}) => {
  return (
    <div className='sticky z-50 left-0 bottom-0 right-0 h-[45px] border-t border-t-[#D4D6D999] px-4 flex items-center bg-white'>
      {advanceData ? (
        <Advance
          advanceData={advanceData}
          onSubmit={onSubmit}
          className={bodyClassName}
          loadingData={loadingProps}
          advanceFooter={advanceFooter}
        />
      ) : (
        <Default
          isDisable={isDisable}
          preview={preview}
          onSubmit={onSubmit}
          onPreview={onPreview}
          previewTitle={previewTitle}
          loadingData={loadingProps}
          advanceFooter={advanceFooter}
        />
      )}
    </div>
  );
};
export default SubmitCard;
