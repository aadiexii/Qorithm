"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type RatingRailProps = {
  minRating?: number;
  ratings: number[];
};

export function RatingRail({ minRating, ratings }: RatingRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    // Initial check in case content doesn't overflow
    setTimeout(checkScroll, 100);
    return () => window.removeEventListener("resize", checkScroll);
  }, [minRating, ratings]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex w-full items-center group">
      {/* Edge Fade Left */}
      <div 
        className={`absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none transition-opacity duration-300 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`} 
      />
      
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="Scroll ratings left"
        className={`absolute left-0 z-10 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-card/80 border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          canScrollLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Rail */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex flex-1 items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-0 md:px-10"
      >
        <Link 
          href="/dashboard"
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            !minRating 
              ? "bg-primary text-primary-foreground border border-primary" 
              : "bg-card text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          All Ratings
        </Link>
        {ratings.map((r) => (
          <Link
            key={r}
            href={`/dashboard?minRating=${r}&maxRating=${r + 99}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              minRating === r 
                ? "bg-primary text-primary-foreground border border-primary" 
                : "bg-card text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {r}-{r + 99}
          </Link>
        ))}
      </div>

      {/* Edge Fade Right */}
      <div 
        className={`absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none transition-opacity duration-300 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`} 
      />

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="Scroll ratings right"
        className={`absolute right-0 z-10 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-card/80 border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          canScrollRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
