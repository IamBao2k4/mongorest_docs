import CardNews from './CardNews';
import CardNewsSkeleton from './CardNews/CardRow/CardNewsSkeleton';
import CardProductV2 from './CardProductV2';
import CardProject from './CardProject';
// NOTE: Layout
export default function Card({ data, layout = 1, className, ...rest }) {
  const href = `/${data.product_type?.[0]?.slug}/${data.slug}`;

  const props = {
    ...data,
    ...rest,
    layout,
    className,
    href,
  };

  switch (layout?.toString()) {
    case '1':
    case '2':
    case '3':
      return <CardNews {...props} />;
    case '4':
    case '5':
      return <CardProject {...props} />;
    case '6':
    case '7':
      return (
        <CardProductV2
          {...props}
          layout={layout}
        />
      );
    default:
      return <CardProductV2 {...props} />;
  }
}

export function CardSkeleton({ layout }) {
  switch (layout?.toString()) {
    case '1':
    case '2':
    case '3':
    case '6':
    case '7':
      return <CardNewsSkeleton />;
    default:
      return <CardNewsSkeleton />;
  }
}
