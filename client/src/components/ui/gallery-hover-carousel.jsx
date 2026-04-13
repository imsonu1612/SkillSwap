import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './button';
import { Card } from './card';
import { Carousel, CarouselContent, CarouselItem } from './carousel';

const defaultItems = [
  {
    id: 'skill-sharing',
    title: 'Skill Sharing',
    summary: 'Share what you already know and exchange practical time credits with people who want to learn from you.',
    url: '/register',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'meaningful-connections',
    title: 'Meaningful Connections',
    summary: 'Discover people with the right skills, start real conversations, and build long-term learning relationships.',
    url: '/find-people',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'mutual-growth',
    title: 'Mutual Growth',
    summary: 'Grow together through collaborative sessions, mentorship, and a community built on shared progress.',
    url: '/dashboard',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function GalleryHoverCarousel({
  heading = 'Skill Sharing, Meaningful Connections, and Mutual Growth',
  demoUrl = '#',
  items = defaultItems,
}) {
  const [carouselApi, setCarouselApi] = useState();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const update = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    update();
    carouselApi.on('select', update);

    return () => {
      carouselApi.off('select', update);
    };
  }, [carouselApi]);

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 md:mb-6 md:flex-row md:items-end lg:mb-8">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              {heading}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base dark:text-gray-300">
              Explore how SkillSwap helps people teach what they know, find the right learners, and grow together through shared expertise.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => carouselApi?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Carousel setApi={setCarouselApi} className="w-full">
          <CarouselContent className="gap-5 py-1">
            {items.map((item) => {
              const ItemLink = item.url?.startsWith('/') ? Link : 'a';
              const linkProps = item.url?.startsWith('/')
                ? { to: item.url || demoUrl }
                : { href: item.url || demoUrl, target: '_blank', rel: 'noreferrer' };

              return (
                <CarouselItem key={item.id} className="basis-full sm:basis-[85%] md:basis-1/2 lg:basis-1/3">
                  <ItemLink {...linkProps} className="group block h-full">
                    <Card className="relative h-[285px] overflow-hidden border-gray-200 shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-gray-800">
                      <div className="relative h-full w-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 flex min-h-[44%] flex-col justify-end p-5 text-white transition-all duration-500 group-hover:min-h-[55%]">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <h4 className="text-xl font-semibold tracking-tight">{item.title}</h4>
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:-rotate-45">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-white/85 line-clamp-2">
                          {item.summary}
                        </p>
                      </div>
                    </Card>
                  </ItemLink>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}