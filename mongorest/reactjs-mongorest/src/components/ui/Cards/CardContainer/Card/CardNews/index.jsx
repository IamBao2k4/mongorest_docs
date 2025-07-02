import CardColumn from './CardColumn';
import CardRow from './CardRow';

const CardNews = ({ layout, displayIndex, ...props }) => {
  switch (layout) {
    case '1':
      return (
        <CardRow
          {...props}
          displayIndex={displayIndex}
        />
      );
    case '2':
      return (
        <CardRow
          {...props}
          displayIndex={displayIndex}
        />
      );
    case '3':
      return (
        <CardColumn
          {...props}
          displayIndex={displayIndex}
        />
      );
  }
};

export default CardNews;
