import SectionHeader from '@/components/ui/SectionHeader';
import clsx from 'clsx';

const HeaderGoToPage = ({ title, href, layout }) => {
  return (
    <SectionHeader
      title={title}
      viewAllHref={href ?? '#'}
      viewAllText='XEM TẤT CẢ'
      className={clsx((layout === '1' || layout === '6') && 'md:px-[40px]')}
    />
  );
};

export default HeaderGoToPage;
