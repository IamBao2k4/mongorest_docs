'use client';

import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/Carousel';
import { Image } from '@/components/ui/Image';
import Card from './Card';
import { MoveLeft, MoveRight } from 'lucide-react';

const SliderContainerV2 = ({ data, slidePerView = 2, layout, lang }) => {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState(4.5); // Default for desktop
  const [isHovered, setIsHovered] = useState(false); // State để track hover

  // Update visible products based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Mobile
        setVisibleProducts(1.5);
      } else if (window.innerWidth < 768) {
        // Small tablets
        setVisibleProducts(2.5);
      } else if (window.innerWidth < 1024) {
        // Tablets
        setVisibleProducts(3.5);
      } else {
        // Desktop
        setVisibleProducts(4.5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate max index when visible products change
  useEffect(() => {
    if (data.length > 0) {
      setMaxIndex(Math.ceil(data.length - visibleProducts));
    }
  }, [data, visibleProducts]);

  // Update currentIndex when api selection changes
  useEffect(() => {
    if (!api) return;
    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Handle carousel navigation
  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < maxIndex;

  return (
    <div className='w-full'>
      <div
        className='relative'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* Custom Carousel Implementation */}
        <Carousel
          setApi={setApi}
          showDots={false}
          autoPlay={false}
          opts={{
            align: 'start',
            containScroll: false,
            slidesToScroll: 1,
            loop: false,
          }}
          className='w-full'>
          {/* Custom Previous Button - Chỉ hiện khi hover và có thể scroll */}
          {canScrollPrev && (
            <button
              onClick={() => api?.scrollPrev()}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 md:-ml-6 bg-black/80 p-1 sm:p-2 z-10 transition-all duration-300 hover:bg-black cursor-pointer ${
                isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              aria-label='Trước'>
              <MoveLeft color='#fff' />
            </button>
          )}

          {/* Custom Next Button - Chỉ hiện khi hover và có thể scroll */}
          {canScrollNext && (
            <button
              onClick={() => api?.scrollNext()}
              className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 md:-mr-6 bg-black/80 p-1 sm:p-2 z-10 transition-all duration-300 hover:bg-black cursor-pointer ${
                isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              aria-label='Sau'>
              <MoveRight color='#fff' />
            </button>
          )}

          {/* Carousel Content */}
          <CarouselContent className='-ml-0 sm:-ml-2'>
            {data.map((item, index) => (
              <CarouselItem
                key={item._id}
                className='pl-0 sm:pl-2'
                style={{
                  flex: `0 0 ${100 / visibleProducts}%`,
                  maxWidth: `${100 / visibleProducts}%`,
                }}>
                <Card
                  layout={layout}
                  data={item}
                  lang={lang}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Slider Indicator/Pagination */}
      <div className='w-full mt-6 sm:mt-8 md:mt-10 border-t border-border relative'>
        <div
          className='absolute top-0 h-[3px] bg-primary transition-all duration-300'
          style={{
            width: `${100 / (maxIndex + 1)}%`,
            left: `${(currentIndex * 100) / (maxIndex + 1)}%`,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Pagination clicks */}
        <div
          className='flex absolute w-full top-0 left-0'
          style={{ height: '20px', transform: 'translateY(-50%)' }}>
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <div
              key={index}
              className='cursor-pointer'
              style={{
                width: `${100 / (maxIndex + 1)}%`,
                height: '100%',
              }}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SliderContainerV2;
