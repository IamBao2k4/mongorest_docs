import Card, { CardSkeleton } from './Card';
import NewsContainer1 from './NewsContainer1';
import SliderContainer from './SliderContainer';
function Main({
  limit,
  loading,
  data,
  layout,
  mode,
  slidePerView,
  perView = '3,3,1',
  lang,
  isFilter,
  dataType,
  ...props
}) {
  if (mode === 'slider') {
    return (
      <SliderContainer
        slidePerView={slidePerView}
        data={data}
        layout={layout}
        lang={lang}
        dataType={dataType}
      />
    );
  } else if (layout === '1') {
    return (
      <NewsContainer1
        data={data}
        dataType={dataType}
      />
    );
  }

  const optionClass = perView.split(',');

  const gapClassMap = {
    1: 'gap-x-0 gap-y-10',
    2: 'gap-x-0 gap-y-10',
    3: 'gap-x-6 gap-y-10 xl:gap-x-30 xl:gap-y-25',
    4: 'gap-x-6 gap-y-4 xl:gap-x-[72px] xl:gap-y-10',
    5: 'gap-x-1 gap-y-2',
    6: 'gap-x-6 gap-y-10',
    7: 'gap-x-6 gap-y-10',
    default: 'gap-x-6 gap-y-10',
  };
  let gapClass = gapClassMap[layout] || gapClassMap.default;
  const gridClass = `grid grid-cols-${optionClass[2]} sm:grid-cols-${optionClass[1]} lg:grid-cols-${optionClass[0]}`;
  const classes = `${gapClass} ${gridClass}`;

  return (
    <div className={classes}>
      {!loading
        ? data.map((item, index) => {
            return (
              <Card
                key={item._id || index}
                layout={layout}
                data={item}
                lang={lang}
                dataType={dataType}
                displayIndex={index}
                {...props}
              />
            );
          })
        : [...Array(Number(limit || 6))].map((_, index) => (
            <CardSkeleton
              key={index}
              layout={layout}
            />
          ))}
    </div>
  );
}

export default Main;
