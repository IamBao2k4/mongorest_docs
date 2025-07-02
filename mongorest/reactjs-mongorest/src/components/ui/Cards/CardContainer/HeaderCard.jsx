import HeaderDefault from './HeaderCard/HeaderDefault';
import HeaderFilter from './HeaderCard/HeaderFilter';
import HeaderGoToPage from './HeaderCard/HeaderGoToPage';
import HeaderLeft from './HeaderCard/HeaderLeft';

function HeaderCard({
  title,
  description,
  layout,
  mode,
  href,
  dataType,
  type,
  isFilter,
  filterState,
  setFilterState,
}) {
  switch (layout) {
    case '1':
    case '6':
      return (
        <HeaderGoToPage
          title={title}
          href={href}
          layout={layout}
        />
      );
    case '2':
    case '4':
      return (
        <HeaderFilter
          title={title}
          description={description}
          layout={layout}
          isFilter={isFilter}
          type={type}
          dataType={dataType?.data?.[0]}
          posttypeId={dataType?.data?.[0]?._id}
          filterState={filterState}
          setFilterState={setFilterState}
        />
      );
    case '5':
      return (
        <HeaderLeft
          title={title}
          layout={layout}
        />
      );

    default:
      return (
        <HeaderDefault
          title={title}
          layout={layout}
        />
      );
  }
}

export default HeaderCard;
