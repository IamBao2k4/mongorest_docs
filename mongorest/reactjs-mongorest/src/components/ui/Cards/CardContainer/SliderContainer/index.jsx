import Slider1 from './Slider1';
import Slider2 from './Slider2';

const SliderContainer = ({ data, slidePerView = 2, layout, lang }) => {
  switch (layout) {
    case '6': //Product
      return (
        <Slider1
          data={data}
          slidePerView={slidePerView}
          layout={layout}
          lang={lang}
          className='md:px-[40px]'
        />
      );
    case '5':
      return (
        <Slider2
          data={data}
          slidePerView={slidePerView}
          layout={layout}
          lang={lang}
        />
      );
    default:
      return (
        <Slider1
          data={data}
          layout={layout}
          lang={lang}
          className='md:px-[40px]'
        />
      );
  }
};

export default SliderContainer;
