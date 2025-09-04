"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export interface CarouselProps {
  items: React.JSX.Element[];
  initialScroll?: number;
}

export type Card = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollBy({
        left: -containerWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollBy({
        left: containerWidth,
        behavior: "smooth",
      });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      const scrollPosition = containerWidth * index;
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full h-full">
        <div
          className="flex w-full h-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className={cn("flex flex-row justify-start h-full", "w-full")}>
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  },
                }}
                key={"card" + index}
                className="flex-shrink-0 w-full h-full"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg disabled:opacity-50 hover:bg-white/90 transition-colors"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg disabled:opacity-50 hover:bg-white/90 transition-colors"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export type CardProps = {
  card: Card;
  index: number;
  layout?: boolean;
};

export const Card = ({ card, index, layout = false }: CardProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () =>
    handleClose()
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-black dark:text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-10 flex justify-center items-center">
                <div
                  className="max-w-full max-h-[70vh] w-auto h-auto flex items-center justify-center"
                  style={{ width: "100%", height: "100%" }}
                >
                  {typeof card.src === "string" &&
                  card.src.match(
                    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
                  )
                    ? (() => {
                        const match = card.src.match(
                          /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
                        );
                        const videoId = match ? match[5] : "";
                        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        return (
                          <iframe
                            width="100%"
                            height="400"
                            src={embedUrl}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{
                              maxWidth: "100%",
                              maxHeight: "70vh",
                              borderRadius: "12px",
                              background: "black",
                            }}
                          />
                        );
                      })()
                    : React.isValidElement(card.content) &&
                      (card.content.type === "img" ||
                        card.content.type === "video")
                    ? (() => {
                        // Type guard for props
                        const props = card.content.props as Record<string, any>;
                        const style =
                          typeof props === "object" && props.style
                            ? props.style
                            : {};
                        const className =
                          typeof props === "object" && props.className
                            ? props.className
                            : "";
                        return React.cloneElement(
                          card.content as React.ReactElement<
                            HTMLImageElement | HTMLVideoElement
                          >,
                          {
                            style: {
                              maxWidth: "100%",
                              maxHeight: "70vh",
                              objectFit: "contain",
                              width: "auto",
                              height: "auto",
                              display: "block",
                              margin: "0 auto",
                              ...style,
                            },
                            className: cn(className, "rounded-lg"),
                          }
                        );
                      })()
                    : card.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex h-full w-full flex-col items-start justify-start overflow-hidden bg-gray-100 dark:bg-neutral-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        <div className="relative z-40 p-4 md:p-6">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-xs font-medium text-white md:text-sm"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-1 max-w-xs text-left font-sans text-sm font-semibold [text-wrap:balance] text-white md:text-lg"
          >
            {card.title}
          </motion.p>
        </div>
        {typeof card.src === "string" &&
        card.src.match(
          /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
        ) ? (
          (() => {
            const match = card.src.match(
              /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
            );
            const videoId = match ? match[5] : "";
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            return (
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title="YouTube video player"
                allowFullScreen
                allow="autoplay; encrypted-media "
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: "12px",
                  background: "black",
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  aspectRatio: "16/9",
                }}
              />
            );
          })()
        ) : card.category === "Product Video" ||
          (card.src && card.src.match(/\.(mp4|webm|ogg)$/i)) ? (
          <video
            src={card.src}
            controls
            className="absolute inset-0 z-10 w-full h-full object-contain bg-black rounded-lg"
            poster={card.title}
          >
            Sorry, your browser doesn't support embedded videos.
          </video>
        ) : (
          <BlurImage
            src={card.src}
            alt={card.title}
            fill
            className="absolute inset-0 z-10 object-cover"
          />
        )}
      </motion.button>
    </>
  );
};

export type BlurImageProps = {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  fill,
  ...rest
}: BlurImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <img
      className={cn(
        "h-full w-full transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};
