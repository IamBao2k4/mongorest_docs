'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/Carousel';

import { MoveLeft, MoveRight } from 'lucide-react';
import Card from '../Card';
import clsx from 'clsx';

const Slider1 = ({ data, slidePerView = 2, layout, lang, className }) => {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState(4.5);
  const [isHovered, setIsHovered] = useState(false);
  const isJumping = useRef(false);

  // Create data with enough items to avoid empty space
  const carouselData = React.useMemo(() => {
    if (data.length === 0) return [];

    // Nếu có đủ items, chỉ cần duplicate một ít để loop
    if (data.length >= Math.ceil(visibleProducts * 2)) {
      const duplicateCount = Math.ceil(visibleProducts);
      const startDuplicates = data.slice(-duplicateCount).map((item, idx) => ({
        ...item,
        _id: `start-${item._id}-${idx}`,
      }));
      const endDuplicates = data.slice(0, duplicateCount).map((item, idx) => ({
        ...item,
        _id: `end-${item._id}-${idx}`,
      }));

      return [...startDuplicates, ...data, ...endDuplicates];
    }

    // Nếu ít items, duplicate nhiều lần
    const totalNeeded = Math.ceil(visibleProducts * 3);
    const repeatCount = Math.ceil(totalNeeded / data.length);
    const repeated = [];

    for (let i = 0; i < repeatCount; i++) {
      repeated.push(
        ...data.map((item, idx) => ({
          ...item,
          _id: `repeat-${i}-${item._id}-${idx}`,
        }))
      );
    }

    return repeated;
  }, [data, visibleProducts]);

  // Update visible products based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleProducts(1.5);
      } else if (window.innerWidth < 768) {
        setVisibleProducts(2.5);
      } else if (window.innerWidth < 1024) {
        setVisibleProducts(3.5);
      } else {
        setVisibleProducts(4.5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate max index for pagination
  useEffect(() => {
    if (data.length > 0) {
      setMaxIndex(Math.max(0, data.length - Math.floor(visibleProducts)));
    }
  }, [data, visibleProducts]);

  // Handle infinite loop
  useEffect(() => {
    if (!api || carouselData.length <= data.length) return;

    const handleSelect = () => {
      if (isJumping.current) return;

      const selectedIndex = api.selectedScrollSnap();
      const duplicateCount = Math.ceil(visibleProducts);
      const realDataStart = duplicateCount;
      const realDataEnd = realDataStart + data.length;

      // Nếu đang ở duplicate đầu (trước real data)
      if (selectedIndex < realDataStart) {
        isJumping.current = true;
        const correspondingIndex = realDataEnd - (realDataStart - selectedIndex);
        api.scrollTo(correspondingIndex, false);
        setCurrentIndex(data.length - (realDataStart - selectedIndex));
        setTimeout(() => {
          isJumping.current = false;
        }, 100);
        return;
      }

      // Nếu đang ở duplicate cuối (sau real data)
      if (selectedIndex >= realDataEnd) {
        isJumping.current = true;
        const correspondingIndex = realDataStart + (selectedIndex - realDataEnd);
        api.scrollTo(correspondingIndex, false);
        setCurrentIndex(selectedIndex - realDataEnd);
        setTimeout(() => {
          isJumping.current = false;
        }, 100);
        return;
      }

      // Đang ở real data
      setCurrentIndex(selectedIndex - realDataStart);
    };

    api.on('select', handleSelect);

    // Set initial position to real data
    const initialIndex = Math.ceil(visibleProducts);
    api.scrollTo(initialIndex, false);

    return () => api.off('select', handleSelect);
  }, [api, carouselData.length, data.length, visibleProducts]);

  const canScrollPrev = true;
  const canScrollNext = true;

  return (
    <div className={clsx('w-full', className)}>
      <div
        className='relative'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <Carousel
          setApi={setApi}
          showDots={false}
          autoPlay={false}
          opts={{
            align: 'start',
            containScroll: false,
            slidesToScroll: 1,
            loop: false, // Tắt loop tự động, tự handle
            skipSnaps: false,
          }}
          className='w-full'>
          {/* Custom Previous Button */}
          {canScrollPrev && (
            <button
              onClick={() => api?.scrollPrev()}
              className={`absolute top-1/2 left-0 z-10 -ml-2 -translate-y-1/2 cursor-pointer bg-black/80 p-1 transition-all duration-300 hover:bg-black sm:-ml-4 sm:p-2 md:-ml-6 ${
                isHovered ? 'visible opacity-100' : 'invisible opacity-0'
              }`}
              aria-label='Trước'>
              <MoveLeft color='#fff' />
            </button>
          )}

          {/* Custom Next Button */}
          {canScrollNext && (
            <button
              onClick={() => api?.scrollNext()}
              className={`absolute top-1/2 right-0 z-10 -mr-2 -translate-y-1/2 cursor-pointer bg-black/80 p-1 transition-all duration-300 hover:bg-black sm:-mr-4 sm:p-2 md:-mr-6 ${
                isHovered ? 'visible opacity-100' : 'invisible opacity-0'
              }`}
              aria-label='Sau'>
              <MoveRight color='#fff' />
            </button>
          )}

          {/* Carousel Content */}
          <CarouselContent>
            {carouselData.map((item, index) => (
              <CarouselItem
                key={item._id}
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
      <div className='border-border relative mt-6 w-full border-t sm:mt-8 md:mt-10'>
        <div
          className='absolute top-0 h-[1px] bg-[#272727] transition-all duration-300'
          style={{
            width: `${100 / (maxIndex + 1)}%`,
            left: `${(Math.max(0, Math.min(currentIndex, maxIndex)) * 100) / (maxIndex + 1)}%`,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Pagination clicks */}
        <div
          className='absolute top-0 left-0 flex w-full'
          style={{ height: '20px', transform: 'translateY(-50%)' }}>
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <div
              key={index}
              className='cursor-pointer'
              style={{
                width: `${100 / (maxIndex + 1)}%`,
                height: '100%',
              }}
              onClick={() => {
                const duplicateCount = Math.ceil(visibleProducts);
                const targetIndex = index + duplicateCount;
                api?.scrollTo(targetIndex);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider1;
