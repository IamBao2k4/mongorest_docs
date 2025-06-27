'use client';

import React, { useState, useEffect } from 'react';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/Carousel';
import Card from '../Card';
import { Button } from '@/components/ui/Button';
import { MoveLeft, MoveRight } from 'lucide-react';

const Slider2 = ({ data, slidePerView = 2, layout, lang }) => {
  const [api, setApi] = useState(null);

  // Navigation state
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Update navigation state when API changes
  useEffect(() => {
    if (!api) return;

    // Handler function for select event
    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    // Set initial button states
    onSelect();

    // Add event listeners
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    // Cleanup
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  // Navigation handlers
  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  return (
    <div className='mt-18 w-full md:mt-0'>
      <div className='absolute top-12 left-0 mt-4 flex space-x-2 md:top-auto md:bottom-0 md:mt-0'>
        <Button
          variant='outline'
          size='icon'
          className={`hover:bg-background hover:text-primary h-10 w-10 rounded-none border p-0 transition-all duration-200 ${
            !canScrollPrev ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={scrollPrev}
          disabled={!canScrollPrev}>
          <MoveLeft className='h-5 w-5' />
          <span className='sr-only'>Previous</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className={`hover:bg-background hover:text-primary h-10 w-10 rounded-none border p-0 transition-all duration-200 ${
            !canScrollNext ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={scrollNext}
          disabled={!canScrollNext}>
          <MoveRight className='h-5 w-5' />
          <span className='sr-only'>Next</span>
        </Button>
      </div>
      <Carousel
        opts={{
          align: 'start', // Sửa lại align thành "start" thay vì dùng số 0
          slidesToScroll: 1,
          containScroll: false,
        }}
        showDots={false}
        autoPlay={false}
        setApi={setApi}
        className='w-full'>
        <CarouselContent className='-mr-6 ml-0 gap-[30px]'>
          {data.map((item, index) => {
            return (
              <CarouselItem
                key={item._id || index}
                className='group basis-full px-0 md:basis-[45%] lg:basis-[40%]'>
                <Card
                  layout={layout}
                  data={item}
                  lang={lang}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default Slider2;
