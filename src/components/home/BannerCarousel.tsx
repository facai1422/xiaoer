import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState, useCallback } from "react";

interface Banner {
  id: number;
  image: string;
  alt: string;
}

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<number[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Make sure all banner images are preloaded before showing the carousel
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    
    // Reset loaded state when banners change
    setIsLoaded(false);
    setLoadedImages([]);
    
    // Preload all images
    banners.forEach((banner) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => {
          const newLoaded = [...prev, banner.id];
          // When all images are loaded, set isLoaded to true
          if (newLoaded.length === banners.length) {
            setIsLoaded(true);
          }
          return newLoaded;
        });
      };
      img.onerror = (e) => {
        console.error(`Failed to load image ${banner.image}:`, e);
      };
      img.src = banner.image;
    });
  }, [banners]);

  // 设置 API 和监听事件
  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // 自动轮播逻辑
  useEffect(() => {
    if (!api || !isAutoPlaying || banners.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000); // 4秒切换一次

    return () => clearInterval(interval);
  }, [api, isAutoPlaying, banners.length]);

  // 鼠标悬停控制
  const handleMouseEnter = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(true);
  }, []);

  // If images aren't loaded yet, show a loading placeholder
  if (!isLoaded) {
    return (
      <div className="bg-white">
        <div className="w-full h-44 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel
        className="w-full max-w-7xl mx-auto"
        opts={{
          loop: true,
          align: 'start'
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {banners.map(banner => (
            <CarouselItem key={banner.id}>
              <img 
                src={banner.image} 
                alt={banner.alt}
                className="w-full h-44 object-cover rounded-xl"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden" />
        <CarouselNext className="hidden" />
      </Carousel>
      
      {/* 轮播指示器 */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-3 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === current 
                  ? 'bg-blue-500 w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => api?.scrollTo(index)}
              title={`切换到第${index + 1}张图片`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
