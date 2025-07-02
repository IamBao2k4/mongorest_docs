const HeaderLeft = ({ title, layout }) => {
  return (
    <div className='mb-6 md:mb-0 md:w-1/4 lg:w-1/5 lg:max-w-[160px]'>
      <h2 className='text-left text-2xl leading-[140%] font-light text-[#272727] sm:text-3xl md:max-w-[170px] lg:text-[40px]'>
        {title}
      </h2>
    </div>
  );
};

export default HeaderLeft;
