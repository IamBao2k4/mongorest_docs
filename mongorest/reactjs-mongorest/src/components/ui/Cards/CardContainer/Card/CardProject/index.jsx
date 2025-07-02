import CardColumn from './CardColumn';
import CardSlider from './CardSlider';

const CardProject = ({ layout, displayIndex, ...props }) => {
  switch (layout) {
    case '4':
      return (
        <CardColumn
          {...props}
          displayIndex={displayIndex}
        />
      ); //default

    case '5':
      return (
        <CardSlider
          {...props}
          displayIndex={displayIndex}
        />
      );
  }
};

export default CardProject;
