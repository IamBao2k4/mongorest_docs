import clsx from 'clsx';

const HeaderDefault = ({ title, layout }) => {
  return (
    <h2
      className={clsx(
        'text-sm sm:text-lg lg:text-xl font-normal text-[#272727] mb-10 uppercase',
        layout === '3' ? 'text-left' : 'text-center'
      )}>
      {title}
    </h2>
  );
};

export default HeaderDefault;
