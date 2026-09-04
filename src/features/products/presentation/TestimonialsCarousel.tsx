"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { cn } from "@/shared/utils/utils";
import { Maximize2, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface TestimonialsCarouselProps {
    headline: string;
    images: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export const TestimonialsCarousel = ({
    headline,
    images,
    selectedIndex,
    onSelect,
}: TestimonialsCarouselProps) => {
    const t = useTranslations("storefront.product.gallery");
    const locale = useLocale();
    const isRTL = locale === "ar";
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        direction: "rtl",
    });
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Sync external selectedIndex with Embla
    useEffect(() => {
        if (emblaApi && emblaApi.selectedScrollSnap() !== selectedIndex) {
            emblaApi.scrollTo(selectedIndex);
        }
    }, [emblaApi, selectedIndex]);

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onEmblaSelect = useCallback(
        (api: any) => {
            if (!api) return;
            setCanScrollPrev(api.canScrollPrev());
            setCanScrollNext(api.canScrollNext());
            onSelect(api.selectedScrollSnap());
        },
        [onSelect]
    );

    useEffect(() => {
        if (!emblaApi) return;

        onEmblaSelect(emblaApi);
        emblaApi.on("select", () => onEmblaSelect(emblaApi));
        emblaApi.on("reInit", () => onEmblaSelect(emblaApi));

        return () => {
            emblaApi.off("select", () => onEmblaSelect(emblaApi));
            emblaApi.off("reInit", () => onEmblaSelect(emblaApi));
        };
    }, [emblaApi, onEmblaSelect]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // Thumbnail handling
    // We'll calculate height dynamically like the original or just use a fixed height container?
    // The original component had dynamic height calculation.
    // For the new one, let's keep it simple with aspect ratio or fill.
    // Using the original "Shein style" layout for thumbnails implies we need a height matching the main image.

    // Let's implement the vertical thumbnails + main carousel layout.

    const [thumbnailHeight, setThumbnailHeight] = useState<number | undefined>(
        undefined
    );
    const mainContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Update thumbnail container height to match main image container
        const updateHeight = () => {
            if (mainContainerRef.current) {
                setThumbnailHeight(mainContainerRef.current.offsetHeight);
            }
        };

        // Initial update
        updateHeight();

        // Observer for resizing
        const resizeObserver = new ResizeObserver(updateHeight);
        if (mainContainerRef.current) {
            resizeObserver.observe(mainContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [images]); // Re-run if images change

    const slides = images.map((src) => ({ src }));

    const tTestimonials = useTranslations("storefront.product.testimonials");

    return (
        <div className="w-full py-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-[#222]">
                {tTestimonials("title")}
            </h2>
            {/* Main Carousel */}
            <div
                ref={mainContainerRef}
                className="relative rounded-lg bg-gray-50 overflow-hidden group max-w-4xl mx-auto"
            >
                <div className="overflow-hidden w-full rounded-lg" ref={emblaRef}>
                    <div className="flex touch-pan-y">
                        {images.map((url, index) => (
                            <div
                                className="flex-[0_0_100%] min-w-0 relative flex items-center justify-center p-1"
                                key={index}
                            >
                                <div
                                    className="relative w-full cursor-zoom-in"
                                    onClick={() => setIsLightboxOpen(true)}
                                >
                                    <Image
                                        src={url}
                                        alt={`${headline} - ${index + 1}`}
                                        width={800}
                                        height={1035}
                                        priority={index === 0}
                                        className="w-full h-auto object-contain max-h-[70vh] rounded-md mx-auto block"
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 550px, 660px"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                scrollPrev();
                            }}
                            disabled={!canScrollPrev}
                            className={cn(
                                "absolute ltr:left-2 rtl:right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md z-10 transition-all",
                                "lg:opacity-0 lg:group-hover:opacity-100", // Hidden on desktop until hover
                                !canScrollPrev && "opacity-50 cursor-not-allowed"
                            )}
                            aria-label={t("prev")}
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700 rtl:rotate-180" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                scrollNext();
                            }}
                            disabled={!canScrollNext}
                            className={cn(
                                "absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md z-10 transition-all",
                                "lg:opacity-0 lg:group-hover:opacity-100", // Hidden on desktop until hover
                                !canScrollNext && "opacity-50 cursor-not-allowed"
                            )}
                            aria-label={t("next")}
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700 rtl:rotate-180" />
                        </button>
                    </>
                )}


                {/* Floating Zoom/Fullscreen Button */}
                <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Open Fullscreen"
                >
                    <Maximize2 className="w-5 h-5 text-gray-700" />
                </button>
            </div>



            {/* Lightbox */}
            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                index={selectedIndex}
                slides={slides}
                on={{
                    view: ({ index }) => onSelect(index),
                }}
                styles={{
                    root: { "--yarl__container_background_color": "rgba(0, 0, 0, .8)" },
                }}
                plugins={[]}
                controller={{ closeOnBackdropClick: true }}
            />
        </div>
    );
};
