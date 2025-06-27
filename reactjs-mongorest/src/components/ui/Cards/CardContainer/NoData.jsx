const NoData = () => {
  return (
    <div className='flex flex-col justify-center text-center items-center py-5 sm:py-20'>
      <p className='text-black/80 text-xl sm:text-[26px] font-normal mb-1 mt-4'>Không có dữ liệu</p>
      <p className='text-black/60 max-sm:text-sm font-normal'>Dữ liệu chưa được cập nhật</p>
    </div>
  );
};

export default NoData;
